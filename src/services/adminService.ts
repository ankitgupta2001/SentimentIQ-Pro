import { supabase } from './authService';
import type { 
  AdminUser, 
  VisitorLog, 
  SystemLog, 
  AnalyticsData, 
  DatabaseStats,
  VisitorAction 
} from '../types/admin';

class AdminService {
  private static instance: AdminService;
  private logs: SystemLog[] = [];

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // System Logging
  async logEvent(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    category: 'auth' | 'analysis' | 'database' | 'api' | 'system',
    details?: Record<string, any>,
    error?: Error
  ): Promise<void> {
    const logEntry: SystemLog = {
      id: crypto.randomUUID(),
      level,
      message,
      category,
      details,
      timestamp: new Date().toISOString(),
      stack: error?.stack
    };

    // Store in memory for immediate access
    this.logs.unshift(logEntry);
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    // Store in database
    try {
      const currentUserId = await this.getCurrentUserId();
      const sessionId = this.getSessionId();
      
      // Build the insert object conditionally
      const insertData: any = {
        level,
        message,
        category,
        details: details || {},
        session_id: sessionId
      };

      // Only add user_id if it exists and is not null
      if (currentUserId) {
        insertData.user_id = currentUserId;
      }

      // Only add stack if it exists
      if (error?.stack) {
        insertData.stack = error.stack;
      }

      await supabase
        .from('system_logs')
        .insert(insertData);
    } catch (err) {
      console.error('Failed to store log in database:', err);
    }

    // Console output for development
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}] ${category}: ${message}`, details);
  }

  // Visitor Tracking
  async trackVisitor(
    page: string,
    referrer?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const currentUserId = await this.getCurrentUserId();
      
      const visitorData: any = {
        session_id: sessionId,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        page,
        additional_data: additionalData || {}
      };

      // Only add user_id if it exists
      if (currentUserId) {
        visitorData.user_id = currentUserId;
      }

      // Only add referrer if it exists
      if (referrer) {
        visitorData.referrer = referrer;
      }

      await supabase
        .from('visitor_logs')
        .insert(visitorData);

      this.logEvent('info', 'Visitor tracked', 'system', { page, sessionId });
    } catch (error) {
      this.logEvent('error', 'Failed to track visitor', 'system', { page }, error as Error);
    }
  }

  async trackAction(
    type: 'page_view' | 'analysis' | 'login' | 'register' | 'error' | 'api_call',
    details: Record<string, any>
  ): Promise<void> {
    try {
      const currentUserId = await this.getCurrentUserId();
      const sessionId = this.getSessionId();
      
      const actionData: any = {
        session_id: sessionId,
        type,
        details
      };

      // Only add user_id if it exists
      if (currentUserId) {
        actionData.user_id = currentUserId;
      }

      await supabase
        .from('visitor_actions')
        .insert(actionData);
    } catch (error) {
      this.logEvent('error', 'Failed to track action', 'system', { type, details }, error as Error);
    }
  }

  // Admin Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const [
        totalUsers,
        activeUsers,
        totalAnalyses,
        analysesToday,
        recentErrors,
        topFeatures,
        userGrowth
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getTotalAnalyses(),
        this.getAnalysesToday(),
        this.getRecentErrors(),
        this.getTopFeatures(),
        this.getUserGrowth()
      ]);

      return {
        totalUsers,
        activeUsers,
        totalAnalyses,
        analysesToday,
        errorRate: recentErrors.length / Math.max(totalAnalyses, 1) * 100,
        avgResponseTime: await this.getAverageResponseTime(),
        topFeatures,
        userGrowth,
        systemHealth: await this.getSystemHealth()
      };
    } catch (error) {
      this.logEvent('error', 'Failed to get analytics', 'system', {}, error as Error);
      throw error;
    }
  }

  async getVisitorLogs(limit: number = 100): Promise<VisitorLog[]> {
    try {
      const { data, error } = await supabase
        .from('visitor_logs')
        .select(`
          *,
          visitor_actions (*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(log => ({
        id: log.id,
        sessionId: log.session_id,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        page: log.page,
        referrer: log.referrer,
        timestamp: log.created_at,
        userId: log.user_id,
        duration: log.duration,
        actions: log.visitor_actions || []
      }));
    } catch (error) {
      this.logEvent('error', 'Failed to get visitor logs', 'system', {}, error as Error);
      throw error;
    }
  }

  async getSystemLogs(
    level?: 'info' | 'warn' | 'error' | 'debug',
    category?: string,
    limit: number = 100
  ): Promise<SystemLog[]> {
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (level) {
        query = query.eq('level', level);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(log => ({
        id: log.id,
        level: log.level,
        message: log.message,
        category: log.category,
        details: log.details,
        userId: log.user_id,
        sessionId: log.session_id,
        timestamp: log.created_at,
        stack: log.stack
      }));
    } catch (error) {
      console.error('Failed to get system logs:', error);
      // Return in-memory logs as fallback
      let filteredLogs = this.logs;
      
      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
      }
      
      if (category) {
        filteredLogs = filteredLogs.filter(log => log.category === category);
      }
      
      return filteredLogs.slice(0, limit);
    }
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      // Get table statistics
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_stats');

      if (tablesError) throw tablesError;

      // Get connection and query stats
      const { data: stats, error: statsError } = await supabase
        .rpc('get_database_performance');

      if (statsError) throw statsError;

      return {
        tables: tables || [],
        connections: stats?.connections || 0,
        queries: {
          slow: stats?.slow_queries || 0,
          failed: stats?.failed_queries || 0,
          total: stats?.total_queries || 0
        },
        performance: {
          avgQueryTime: stats?.avg_query_time || 0,
          cacheHitRate: stats?.cache_hit_rate || 0
        }
      };
    } catch (error) {
      this.logEvent('error', 'Failed to get database stats', 'database', {}, error as Error);
      throw error;
    }
  }

  // User Management
  async getAllUsers(limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          analysis_history (count)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      this.logEvent('error', 'Failed to get all users', 'auth', {}, error as Error);
      throw error;
    }
  }

  async updateUserTier(userId: string, tier: 'guest' | 'standard' | 'pro'): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tier })
        .eq('id', userId);

      if (error) throw error;

      this.logEvent('info', 'User tier updated', 'auth', { userId, tier });
    } catch (error) {
      this.logEvent('error', 'Failed to update user tier', 'auth', { userId, tier }, error as Error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // This will cascade delete profile and analysis history
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      this.logEvent('warn', 'User deleted', 'auth', { userId });
    } catch (error) {
      this.logEvent('error', 'Failed to delete user', 'auth', { userId }, error as Error);
      throw error;
    }
  }

  // Helper methods
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('admin_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('admin_session_id', sessionId);
    }
    return sessionId;
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private async getTotalUsers(): Promise<number> {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private async getActiveUsers(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('visitor_logs')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo)
      .not('user_id', 'is', null);
    return count || 0;
  }

  private async getTotalAnalyses(): Promise<number> {
    const { count } = await supabase
      .from('analysis_history')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  private async getAnalysesToday(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('analysis_history')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);
    return count || 0;
  }

  private async getRecentErrors(): Promise<SystemLog[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('system_logs')
      .select('*')
      .eq('level', 'error')
      .gte('created_at', oneHourAgo);
    return data || [];
  }

  private async getTopFeatures(): Promise<Array<{ feature: string; count: number }>> {
    const { data } = await supabase
      .from('analysis_history')
      .select('features');
    
    const featureCounts: Record<string, number> = {};
    data?.forEach(record => {
      if (Array.isArray(record.features)) {
        record.features.forEach((feature: string) => {
          featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        });
      }
    });

    return Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async getUserGrowth(): Promise<Array<{ date: string; count: number }>> {
    const { data } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });

    const growthData: Record<string, number> = {};
    data?.forEach(user => {
      const date = user.created_at.split('T')[0];
      growthData[date] = (growthData[date] || 0) + 1;
    });

    return Object.entries(growthData)
      .map(([date, count]) => ({ date, count }))
      .slice(-30); // Last 30 days
  }

  private async getAverageResponseTime(): Promise<number> {
    // This would need to be implemented based on your API monitoring
    return 250; // Placeholder
  }

  private async getSystemHealth(): Promise<any> {
    try {
      // Check database health
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      // Check API health
      const apiHealthy = await fetch('/health')
        .then(res => res.ok)
        .catch(() => false);

      return {
        cpu: Math.random() * 100, // Placeholder - would need server monitoring
        memory: Math.random() * 100, // Placeholder
        database: dbError ? 'error' : 'healthy',
        api: apiHealthy ? 'healthy' : 'error'
      };
    } catch {
      return {
        cpu: 0,
        memory: 0,
        database: 'error',
        api: 'error'
      };
    }
  }
}

export const adminService = AdminService.getInstance();