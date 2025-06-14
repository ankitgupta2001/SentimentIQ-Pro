import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

const AdminAccess: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Super secure admin password - change this in production!
  const ADMIN_PASSWORD = 'SuperAdmin2024!@#';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
      setError(`Invalid password. Attempt ${attempts + 1}/3`);
      setPassword('');
      
      if (attempts >= 2) {
        setError('Too many failed attempts. Access temporarily blocked.');
        setTimeout(() => {
          setAttempts(0);
          setError('');
        }, 30000); // 30 second lockout
      }
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard onClose={() => setIsAuthenticated(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Super Admin Access</h2>
          <p className="text-gray-600 mt-2">Enter the master password to access the admin dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={attempts >= 3}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter master password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={attempts >= 3 || !password.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {attempts >= 3 ? 'Access Blocked' : 'Access Admin Dashboard'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Admin Dashboard Features:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Complete user management and analytics</li>
            <li>• Real-time visitor tracking and logs</li>
            <li>• System monitoring and error tracking</li>
            <li>• Database statistics and performance</li>
            <li>• Export capabilities for all data</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            For security purposes, all admin access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;