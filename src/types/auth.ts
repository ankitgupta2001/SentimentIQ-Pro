export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'guest' | 'standard' | 'pro';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  tier: 'standard' | 'pro';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AnalysisHistory {
  id: string;
  userId: string;
  text: string;
  features: string[];
  result: any;
  createdAt: string;
}

export interface TierLimits {
  maxFeatures: number;
  allowedFeatures: string[];
  hasHistory: boolean;
  requiresAuth: boolean;
}

export type AnalysisFeature = 'sentiment' | 'keyPhrases' | 'entities' | 'summary' | 'language';