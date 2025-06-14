import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthState, User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService, supabase } from '../services/authService';

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
    let authStateSubscription: any = null;

    const initAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Get current session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
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
            } else {
              console.log('⚠️ No user profile found, switching to guest');
              if (mounted) {
                dispatch({ type: 'SET_GUEST' });
              }
            }
          } catch (profileError) {
            console.error('❌ Failed to get user profile:', profileError);
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
        if (mounted) {
          dispatch({ type: 'SET_GUEST' });
        }
      }
    };

    // Initialize auth
    initAuth();

    // Listen for auth state changes
    authStateSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in:', session.user.id);
        try {
          const user = await authService.getCurrentUser();
          if (user && mounted) {
            dispatch({ type: 'SET_USER', payload: user });
          }
        } catch (error) {
          console.error('❌ Failed to get user after sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('ℹ️ User signed out, switching to guest');
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
      if (authStateSubscription) {
        authStateSubscription.data.subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array to avoid infinite loops

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔄 Attempting login for:', credentials.email);
      
      const response = await authService.login(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      console.log('✅ Login successful for:', response.user.name, response.user.tier);
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔄 Attempting registration for:', credentials.email, 'with tier:', credentials.tier);
      
      const response = await authService.register(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      console.log('✅ Registration successful for:', response.user.name, response.user.tier);
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      console.error('❌ Registration failed:', error);
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
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Force logout on client side even if server logout fails
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'SET_GUEST' });
    }
  };

  const switchToGuest = () => {
    console.log('🔄 Switching to guest mode');
    dispatch({ type: 'SET_GUEST' });
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