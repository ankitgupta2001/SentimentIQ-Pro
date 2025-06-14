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
        isAuthenticated: !!action.payload,
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
    const initAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Track page view
        adminService.trackVisitor(window.location.pathname, document.referrer);
        
        // Check if user is already logged in
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          adminService.logEvent('error', 'Session retrieval failed', 'auth', {}, sessionError);
          dispatch({ type: 'SET_GUEST' });
          return;
        }
        
        if (session?.user) {
          console.log('Found existing session, getting user profile...');
          
          try {
            const user = await authService.getCurrentUser();
            if (user) {
              console.log('User profile loaded:', user);
              dispatch({ type: 'SET_USER', payload: user });
              adminService.logEvent('info', 'User session restored', 'auth', { userId: user.id });
            } else {
              console.log('No user profile found, switching to guest');
              dispatch({ type: 'SET_GUEST' });
            }
          } catch (profileError) {
            console.error('Failed to get user profile:', profileError);
            adminService.logEvent('error', 'Failed to get user profile during session restore', 'auth', {}, profileError as Error);
            dispatch({ type: 'SET_GUEST' });
          }
        } else {
          console.log('No existing session found, switching to guest');
          dispatch({ type: 'SET_GUEST' });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        adminService.logEvent('error', 'Auth initialization failed', 'auth', {}, error as Error);
        dispatch({ type: 'SET_GUEST' });
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
            adminService.logEvent('info', 'User signed in', 'auth', { userId: user.id });
            adminService.trackAction('login', { userId: user.id, email: user.email });
          }
        } catch (error) {
          console.error('Failed to get user after sign in:', error);
          adminService.logEvent('error', 'Failed to get user after sign in', 'auth', {}, error as Error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, switching to guest');
        adminService.logEvent('info', 'User signed out', 'auth');
        dispatch({ type: 'SET_GUEST' });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed, maintaining user session');
        // Don't change state on token refresh if user is already set
        if (!state.user || state.user.id === 'guest') {
          try {
            const user = await authService.getCurrentUser();
            if (user) {
              dispatch({ type: 'SET_USER', payload: user });
            }
          } catch (error) {
            console.error('Failed to get user after token refresh:', error);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      adminService.logEvent('info', 'Login attempt', 'auth', { email: credentials.email });
      const response = await authService.login(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
      adminService.logEvent('info', 'Login successful', 'auth', { userId: response.user.id });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      adminService.logEvent('error', 'Login failed', 'auth', { email: credentials.email }, error as Error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      adminService.logEvent('info', 'Registration attempt', 'auth', { email: credentials.email, tier: credentials.tier });
      const response = await authService.register(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
      adminService.logEvent('info', 'Registration successful', 'auth', { userId: response.user.id, tier: credentials.tier });
      adminService.trackAction('register', { userId: response.user.id, email: response.user.email, tier: credentials.tier });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      adminService.logEvent('error', 'Registration failed', 'auth', { email: credentials.email }, error as Error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const userId = state.user?.id;
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      // Switch back to guest mode
      dispatch({ type: 'SET_GUEST' });
      adminService.logEvent('info', 'User logged out', 'auth', { userId });
    } catch (error) {
      console.error('Logout failed:', error);
      adminService.logEvent('error', 'Logout failed', 'auth', {}, error as Error);
      // Force logout on client side even if server logout fails
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'SET_GUEST' });
    }
  };

  const switchToGuest = () => {
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