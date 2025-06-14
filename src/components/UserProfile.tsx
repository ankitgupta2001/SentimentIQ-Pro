import React, { useState } from 'react';
import { User, Crown, Star, LogOut, History, Settings, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTierDisplayName, getTierColor, getTierLimits } from '../utils/tierUtils';
import AuthModal from './AuthModal';
import TierUpgrade from './TierUpgrade';

const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Show loading state while determining authentication status
  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="animate-pulse bg-gray-200 rounded-lg px-4 py-2 w-32 h-10"></div>
      </div>
    );
  }

  // Always show sign-in button for guest users (not authenticated or guest tier)
  if (!isAuthenticated || !user || user.tier === 'guest') {
    return (
      <>
        <div className="flex items-center space-x-3">
          {user?.tier === 'guest' && (
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Guest Mode</span>
            </div>
          )}
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  // Authenticated user with standard or pro tier
  const tierLimits = getTierLimits(user.tier);
  const tierColor = getTierColor(user.tier);

  const getTierIcon = () => {
    switch (user.tier) {
      case 'pro': return <Crown className="w-4 h-4" />;
      case 'standard': return <Star className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 hover:bg-white/80 transition-all duration-200 shadow-lg"
        >
          <div className={`flex items-center space-x-2 px-2 py-1 rounded-lg ${tierColor}`}>
            {getTierIcon()}
            <span className="text-sm font-medium">{getTierDisplayName(user.tier)}</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-600">{user.email}</div>
          </div>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${tierColor}`}>
                  {getTierIcon()}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getTierDisplayName(user.tier)} Plan
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Plan Features</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Features:</span>
                  <span className="font-medium">{tierLimits.maxFeatures}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis History:</span>
                  <span className="font-medium">{tierLimits.hasHistory ? 'Yes' : 'No'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Features: {tierLimits.allowedFeatures.join(', ')}
                </div>
              </div>

              {user.tier !== 'pro' && (
                <button
                  onClick={() => {
                    setShowUpgrade(true);
                    setShowDropdown(false);
                  }}
                  className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Upgrade Plan
                </button>
              )}
            </div>

            <div className="p-2">
              {tierLimits.hasHistory && (
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <History className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Analysis History</span>
                </button>
              )}
              
              <button 
                onClick={() => {
                  setShowUpgrade(true);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Manage Plan</span>
              </button>
              
              <button
                onClick={async () => {
                  try {
                    await logout();
                    setShowDropdown(false);
                  } catch (error) {
                    console.error('Logout failed:', error);
                    // Force close dropdown even if logout fails
                    setShowDropdown(false);
                  }
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>

      {showUpgrade && (
        <TierUpgrade 
          currentTier={user.tier}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
};

export default UserProfile;