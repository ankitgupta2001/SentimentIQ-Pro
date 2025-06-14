import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  Database, 
  AlertTriangle, 
  Eye,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Server,
  Clock,
  Globe,
  Zap
} from 'lucide-react';
import { adminService } from '../services/adminService';
import type { AnalyticsData, VisitorLog, SystemLog, DatabaseStats } from '../types/admin';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'visitors' | 'logs' | 'database'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, visitorsData, logsData, usersData, dbStatsData] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getVisitorLogs(100),
        adminService.getSystemLogs(logFilter === 'all' ? undefined : logFilter as any, undefined, 100),
        adminService.getAllUsers(100),
        adminService.getDatabaseStats().catch(() => null)
      ]);

      setAnalytics(analyticsData);
      setVisitors(visitorsData);
      setLogs(logsData);
      setUsers(usersData);
      setDbStats(dbStatsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      adminService.logEvent('error', 'Failed to load admin dashboard data', 'system', {}, error as Error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (type: 'users' | 'logs' | 'visitors') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = users;
        filename = 'users_export.json';
        break;
      case 'logs':
        data = logs;
        filename = 'system_logs_export.json';
        break;
      case 'visitors':
        data = visitors;
        filename = 'visitor_logs_export.json';
        break;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'debug': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVisitors = visitors.filter(visitor =>
    visitor.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.ipAddress.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                <p className="text-red-100">Complete system control and monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'visitors', label: 'Visitors', icon: Eye },
              { id: 'logs', label: 'System Logs', icon: AlertTriangle },
              { id: 'database', label: 'Database', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold text-blue-800">{analytics.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Active Users (24h)</p>
                      <p className="text-3xl font-bold text-green-800">{analytics.activeUsers}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Total Analyses</p>
                      <p className="text-3xl font-bold text-purple-800">{analytics.totalAnalyses}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Analyses Today</p>
                      <p className="text-3xl font-bold text-orange-800">{analytics.analysesToday}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  System Health
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{analytics.systemHealth.cpu.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">CPU Usage</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.systemHealth.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{analytics.systemHealth.memory.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Memory Usage</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.systemHealth.memory}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(analytics.systemHealth.database)}`}>
                      {analytics.systemHealth.database}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Database</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(analytics.systemHealth.api)}`}>
                      {analytics.systemHealth.api}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">API Status</div>
                  </div>
                </div>
              </div>

              {/* Top Features */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Most Used Features
                </h3>
                <div className="space-y-3">
                  {analytics.topFeatures.map((feature, index) => (
                    <div key={feature.feature} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{feature.feature}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(feature.count / analytics.topFeatures[0].count) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12 text-right">{feature.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => exportData('users')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analyses</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.tier === 'pro' ? 'bg-purple-100 text-purple-800' :
                              user.tier === 'standard' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.tier}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.analysis_history?.[0]?.count || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visitors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Visitor Tracking</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search visitors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => exportData('visitors')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVisitors.map((visitor) => (
                        <tr key={visitor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {visitor.ipAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {visitor.page}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {visitor.userAgent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(visitor.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {visitor.actions.length} actions
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">System Logs</h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Levels</option>
                    <option value="error">Errors</option>
                    <option value="warn">Warnings</option>
                    <option value="info">Info</option>
                  </select>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => exportData('logs')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className={`border rounded-lg p-4 ${getLogLevelColor(log.level)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded uppercase ${getLogLevelColor(log.level)}`}>
                            {log.level}
                          </span>
                          <span className="text-sm font-medium text-gray-600">{log.category}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">{log.message}</p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="text-xs text-gray-600">
                            <summary className="cursor-pointer hover:text-gray-800">Details</summary>
                            <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                        {log.stack && (
                          <details className="text-xs text-gray-600 mt-2">
                            <summary className="cursor-pointer hover:text-gray-800">Stack Trace</summary>
                            <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto text-red-600">
                              {log.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'database' && dbStats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Database Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Connections</h3>
                  <div className="text-3xl font-bold text-blue-600">{dbStats.connections}</div>
                  <div className="text-sm text-gray-600">Active connections</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Query Performance</h3>
                  <div className="text-3xl font-bold text-green-600">{dbStats.performance.avgQueryTime}ms</div>
                  <div className="text-sm text-gray-600">Average query time</div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Cache Hit Rate</h3>
                  <div className="text-3xl font-bold text-purple-600">{dbStats.performance.cacheHitRate}%</div>
                  <div className="text-sm text-gray-600">Cache efficiency</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Table Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rows</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dbStats.tables.map((table) => (
                        <tr key={table.name} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {table.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {table.rowCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {table.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(table.lastUpdated).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;