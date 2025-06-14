import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // The session should be automatically handled by Supabase
        // Just redirect to home page
        window.location.href = '/';
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to home with error
        window.location.href = '/?error=auth_callback_failed';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Confirming your email...</h2>
        <p className="text-gray-600 mt-2">Please wait while we complete your registration.</p>
      </div>
    </div>
  );
};

export default AuthCallback;