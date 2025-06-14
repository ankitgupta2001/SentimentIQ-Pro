export interface AdminUser extends User {
  role: 'super_admin';
  permissions: AdminPermission[];
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'analytics' | 'system' | 'logs' | 'database';
}

export interface VisitorLog {
  id: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  country?: string;
  city?: string;
  page: string;
  referrer?: string;
  timestamp: string;
  userId?: string;
  duration?: number;
  actions: VisitorAction[];
}

export interface VisitorAction {
  id: string;
  type: 'page_view' | 'analysis' | 'login' | 'register' | 'error' | 'api_call';
  details: Record<string, any>;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  category: 'auth' | 'analysis' | 'database' | 'api' | 'system';
  details?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  stack?: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  analysesToday: number;
  errorRate: number;
  avgResponseTime: number;
  topFeatures: Array<{ feature: string; count: number }>;
  userGrowth: Array<{ date: string; count: number }>;
  systemHealth: {
    cpu: number;
    memory: number;
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
  };
}

export interface DatabaseStats {
  tables: Array<{
    name: string;
    rowCount: number;
    size: string;
    lastUpdated: string;
  }>;
  connections: number;
  queries: {
    slow: number;
    failed: number;
    total: number;
  };
  performance: {
    avgQueryTime: number;
    cacheHitRate: number;
  };
}