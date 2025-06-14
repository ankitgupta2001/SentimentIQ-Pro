import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthState, User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService, supabase } from '../services/authService';
import { adminService } from '../services/adminService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  switchToGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_GUEST' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload && action.payload.id !== 'guest',
        isLoading: false
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'SET_GUEST':
      return {
        user: {
          id: 'guest',
          email: 'guest@example.com',
          name: 'Guest User',
          tier: 'guest',
          createdAt: new Date().toISOString()
        },
        isAuthenticated: false,
        isLoading: false
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Track page view
        adminService.trackVisitor(window.location.pathname, document.referrer);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          adminService.logEvent('error', 'Session retrieval failed', 'auth', {}, sessionError);
          if (mounted) {
            dispatch({ type: 'SET_GUEST' });
          }
          return;
        }
        
        if (session?.user) {
          console.log('✅ Found existing session for user:', session.user.id);
          
          try {
            // Get user profile
            const user = await authService.getCurrentUser();
            if (user && mounted) {
              console.log('✅ User profile loaded:', user.name, user.tier);
              dispatch({ type: 'SET_USER', payload: user });
              adminService.logEvent('info', 'User session restored', 'auth', { 
                userId: user.id, 
                tier: user.tier 
              });
            } else {
              console.log('⚠️ No user profile found, switching to guest');
              if (mounted) {
                dispatch({ type: 'SET_GUEST' });
              }
            }
          } catch (profileError) {
            console.error('❌ Failed to get user profile:', profileError);
            adminService.logEvent('error', 'Failed to get user profile during session restore', 'auth', {}, profileError as Error);
            if (mounted) {
              dispatch({ type: 'SET_GUEST' });
            }
          }
        } else {
          console.log('ℹ️ No existing session found, switching to guest');
          if (mounted) {
            dispatch({ type: 'SET_GUEST' });
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        adminService.logEvent('error', 'Auth initialization failed', 'auth', {}, error as Error);
        if (mounted) {
          dispatch({ type: 'SET_GUEST' });
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.id);
        try {
          const user = await authService.getCurrentUser();
          if (user && mounted) {
            dispatch({ type: 'SET_USER', payload: user });
            adminService.logEvent('info', 'User signed in', 'auth', { 
              userId: user.id, 
              tier: user.tier 
            });
            adminService.trackAction('login', { 
              userId: user.id, 
              email: user.email,
              tier: user.tier 
            });
          }
        } catch (error) {
          console.error('❌ Failed to get user after sign in:', error);
          adminService.logEvent('error', 'Failed to get user after sign in', 'auth', {}, error as Error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('ℹ️ User signed out, switching to guest');
        adminService.logEvent('info', 'User signed out', 'auth');
        if (mounted) {
          dispatch({ type: 'SET_GUEST' });
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refreshed for user:', session.user.id);
        // Only update if we don't have a user or if it's a guest
        if (!state.user || state.user.id === 'guest') {
          try {
            const user = await authService.getCurrentUser();
            if (user && mounted) {
              dispatch({ type: 'SET_USER', payload: user });
              console.log('✅ User restored after token refresh:', user.name, user.tier);
            }
          } catch (error) {
            console.error('❌ Failed to get user after token refresh:', error);
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove state dependency to avoid infinite loops

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔄 Attempting login for:', credentials.email);
      adminService.logEvent('info', 'Login attempt', 'auth', { email: credentials.email });
      
      const response = await authService.login(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      console.log('✅ Login successful for:', response.user.name, response.user.tier);
      adminService.logEvent('info', 'Login successful', 'auth', { 
        userId: response.user.id,
        tier: response.user.tier 
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('❌ Login failed:', error);
      adminService.logEvent('error', 'Login failed', 'auth', { email: credentials.email }, error as Error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔄 Attempting registration for:', credentials.email, 'with tier:', credentials.tier);
      adminService.logEvent('info', 'Registration attempt', 'auth', { 
        email: credentials.email, 
        tier: credentials.tier 
      });
      
      const response = await authService.register(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      console.log('✅ Registration successful for:', response.user.name, response.user.tier);
      adminService.logEvent('info', 'Registration successful', 'auth', { 
        userId: response.user.id, 
        tier: response.user.tier 
      });
      adminService.trackAction('register', { 
        userId: response.user.id, 
        email: response.user.email, 
        tier: response.user.tier 
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('❌ Registration failed:', error);
      adminService.logEvent('error', 'Registration failed', 'auth', { 
        email: credentials.email,
        tier: credentials.tier 
      }, error as Error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const userId = state.user?.id;
      console.log('🔄 Logging out user:', userId);
      
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      
      // Switch back to guest mode
      dispatch({ type: 'SET_GUEST' });
      
      console.log('✅ Logout successful, switched to guest mode');
      adminService.logEvent('info', 'User logged out', 'auth', { userId });
    } catch (error) {
      console.error('❌ Logout failed:', error);
      adminService.logEvent('error', 'Logout failed', 'auth', {}, error as Error);
      
      // Force logout on client side even if server logout fails
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'SET_GUEST' });
    }
  };

  const switchToGuest = () => {
    console.log('🔄 Switching to guest mode');
    dispatch({ type: 'SET_GUEST' });
    adminService.logEvent('info', 'Switched to guest mode', 'auth');
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      switchToGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};