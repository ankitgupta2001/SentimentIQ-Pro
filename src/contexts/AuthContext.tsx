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
        // Check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = await authService.getCurrentUser();
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
          } else {
            dispatch({ type: 'SET_GUEST' });
          }
        } else {
          dispatch({ type: 'SET_GUEST' });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        dispatch({ type: 'SET_GUEST' });
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
          }
        } catch (error) {
          console.error('Failed to get user after sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_GUEST' });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.register(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      // Switch back to guest mode
      dispatch({ type: 'SET_GUEST' });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout on client side even if server logout fails
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'SET_GUEST' });
    }
  };

  const switchToGuest = () => {
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