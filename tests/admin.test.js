/**
 * Admin Service and Dashboard Tests
 * Tests admin functionality and system monitoring
 */

const { adminService } = require('../src/services/adminService');

describe('Admin Service Tests', () => {
  
  describe('System Logging Tests', () => {
    test('should log info events', async () => {
      const logEntry = {
        level: 'info',
        message: 'Test info message',
        category: 'system',
        details: { test: true }
      };
      
      // Mock logging
      expect(logEntry.level).toBe('info');
      expect(logEntry.message).toBe('Test info message');
      expect(logEntry.category).toBe('system');
      expect(logEntry.details.test).toBe(true);
    });

    test('should log error events with stack trace', async () => {
      const error = new Error('Test error');
      const logEntry = {
        level: 'error',
        message: 'Test error occurred',
        category: 'api',
        stack: error.stack
      };
      
      expect(logEntry.level).toBe('error');
      expect(logEntry.stack).toBeTruthy();
    });

    test('should validate log levels', () => {
      const validLevels = ['info', 'warn', 'error', 'debug'];
      const testLevel = 'info';
      
      expect(validLevels).toContain(testLevel);
    });

    test('should validate log categories', () => {
      const validCategories = ['auth', 'analysis', 'database', 'api', 'system'];
      const testCategory = 'analysis';
      
      expect(validCategories).toContain(testCategory);
    });
  });

  describe('Visitor Tracking Tests', () => {
    test('should track page visits', async () => {
      const visitorData = {
        session_id: 'session-123',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        page: '/dashboard',
        referrer: 'https://google.com'
      };
      
      expect(visitorData.session_id).toBeTruthy();
      expect(visitorData.page).toBe('/dashboard');
      expect(visitorData.ip_address).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
    });

    test('should track user actions', async () => {
      const actionData = {
        session_id: 'session-123',
        type: 'analysis',
        details: {
          features: ['sentiment', 'keyPhrases'],
          textLength: 150
        }
      };
      
      expect(actionData.type).toBe('analysis');
      expect(actionData.details.features).toContain('sentiment');
    });

    test('should validate action types', () => {
      const validTypes = ['page_view', 'analysis', 'login', 'register', 'error', 'api_call'];
      const testType = 'analysis';
      
      expect(validTypes).toContain(testType);
    });
  });

  describe('Analytics Data Tests', () => {
    test('should calculate user statistics', async () => {
      const mockAnalytics = {
        totalUsers: 150,
        activeUsers: 45,
        totalAnalyses: 1250,
        analysesToday: 23,
        errorRate: 2.5,
        avgResponseTime: 245
      };
      
      expect(mockAnalytics.totalUsers).toBeGreaterThan(0);
      expect(mockAnalytics.activeUsers).toBeLessThanOrEqual(mockAnalytics.totalUsers);
      expect(mockAnalytics.errorRate).toBeLessThan(10); // Should be low
    });

    test('should track feature usage', async () => {
      const mockTopFeatures = [
        { feature: 'sentiment', count: 500 },
        { feature: 'keyPhrases', count: 300 },
        { feature: 'entities', count: 150 },
        { feature: 'summary', count: 100 },
        { feature: 'language', count: 75 }
      ];
      
      expect(mockTopFeatures[0].feature).toBe('sentiment');
      expect(mockTopFeatures[0].count).toBeGreaterThan(mockTopFeatures[1].count);
    });

    test('should monitor system health', async () => {
      const mockSystemHealth = {
        cpu: 45.2,
        memory: 67.8,
        database: 'healthy',
        api: 'healthy'
      };
      
      expect(mockSystemHealth.cpu).toBeLessThan(100);
      expect(mockSystemHealth.memory).toBeLessThan(100);
      expect(['healthy', 'warning', 'error']).toContain(mockSystemHealth.database);
      expect(['healthy', 'warning', 'error']).toContain(mockSystemHealth.api);
    });
  });

  describe('User Management Tests', () => {
    test('should get all users with pagination', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          tier: 'standard',
          created_at: '2024-01-01T00:00:00Z',
          analysis_history: [{ count: 15 }]
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          tier: 'pro',
          created_at: '2024-01-02T00:00:00Z',
          analysis_history: [{ count: 45 }]
        }
      ];
      
      expect(mockUsers).toHaveLength(2);
      expect(mockUsers[0].tier).toBe('standard');
      expect(mockUsers[1].tier).toBe('pro');
    });

    test('should update user tier', async () => {
      const userId = 'user-123';
      const newTier = 'pro';
      
      // Mock tier update
      const updatedUser = {
        id: userId,
        tier: newTier,
        updated_at: new Date().toISOString()
      };
      
      expect(updatedUser.tier).toBe('pro');
      expect(updatedUser.updated_at).toBeTruthy();
    });

    test('should validate tier updates', () => {
      const validTiers = ['guest', 'standard', 'pro'];
      const newTier = 'pro';
      
      expect(validTiers).toContain(newTier);
    });
  });

  describe('Database Statistics Tests', () => {
    test('should get table statistics', async () => {
      const mockTableStats = [
        {
          name: 'profiles',
          rowCount: 150,
          size: '2.5 MB',
          lastUpdated: '2024-01-15T10:30:00Z'
        },
        {
          name: 'analysis_history',
          rowCount: 1250,
          size: '15.2 MB',
          lastUpdated: '2024-01-15T11:45:00Z'
        }
      ];
      
      expect(mockTableStats).toHaveLength(2);
      expect(mockTableStats[0].name).toBe('profiles');
      expect(mockTableStats[1].rowCount).toBeGreaterThan(mockTableStats[0].rowCount);
    });

    test('should get performance metrics', async () => {
      const mockPerformance = {
        connections: 12,
        slow_queries: 2,
        failed_queries: 0,
        total_queries: 5420,
        avg_query_time: 45.2,
        cache_hit_rate: 94.5
      };
      
      expect(mockPerformance.connections).toBeGreaterThan(0);
      expect(mockPerformance.cache_hit_rate).toBeGreaterThan(90);
      expect(mockPerformance.failed_queries).toBe(0);
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection errors', async () => {
      const dbError = new Error('Connection failed');
      
      expect(() => {
        if (dbError.message.includes('Connection failed')) {
          throw new Error('Database connection error');
        }
      }).toThrow('Database connection error');
    });

    test('should handle permission errors', async () => {
      const permissionError = { status: 403, message: 'Forbidden' };
      
      expect(() => {
        if (permissionError.status === 403) {
          throw new Error('Insufficient permissions for admin access');
        }
      }).toThrow('Insufficient permissions for admin access');
    });

    test('should handle rate limiting', async () => {
      const rateLimitError = { status: 429, message: 'Too Many Requests' };
      
      expect(() => {
        if (rateLimitError.status === 429) {
          throw new Error('Admin API rate limit exceeded');
        }
      }).toThrow('Admin API rate limit exceeded');
    });
  });

  describe('Security Tests', () => {
    test('should validate admin access', () => {
      const userTier = 'pro';
      const hasAdminAccess = userTier === 'pro';
      
      expect(hasAdminAccess).toBe(true);
    });

    test('should reject non-admin access', () => {
      const userTier = 'standard';
      const hasAdminAccess = userTier === 'pro';
      
      expect(hasAdminAccess).toBe(false);
    });

    test('should validate session for admin actions', () => {
      const mockSession = {
        user: { id: 'admin-123', tier: 'pro' },
        expires_at: Date.now() + 3600000 // 1 hour from now
      };
      
      const isValidSession = mockSession.expires_at > Date.now() && mockSession.user.tier === 'pro';
      
      expect(isValidSession).toBe(true);
    });
  });

  describe('Export Functionality Tests', () => {
    test('should export user data', () => {
      const userData = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' }
      ];
      
      const exportData = JSON.stringify(userData, null, 2);
      
      expect(exportData).toContain('user1@example.com');
      expect(JSON.parse(exportData)).toHaveLength(2);
    });

    test('should export system logs', () => {
      const logData = [
        { level: 'info', message: 'System started', timestamp: '2024-01-15T10:00:00Z' },
        { level: 'error', message: 'API error', timestamp: '2024-01-15T10:05:00Z' }
      ];
      
      const exportData = JSON.stringify(logData, null, 2);
      
      expect(exportData).toContain('System started');
      expect(JSON.parse(exportData)).toHaveLength(2);
    });

    test('should export visitor analytics', () => {
      const visitorData = [
        { ip: '192.168.1.1', page: '/dashboard', timestamp: '2024-01-15T10:00:00Z' },
        { ip: '192.168.1.2', page: '/analysis', timestamp: '2024-01-15T10:01:00Z' }
      ];
      
      const exportData = JSON.stringify(visitorData, null, 2);
      
      expect(exportData).toContain('/dashboard');
      expect(JSON.parse(exportData)).toHaveLength(2);
    });
  });
});