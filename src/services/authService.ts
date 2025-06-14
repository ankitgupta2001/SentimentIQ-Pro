import { createClient } from '@supabase/supabase-js';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed - no user data returned');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    const user: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      tier: profile.tier,
      createdAt: profile.created_at
    };

    return {
      user,
      token: data.session?.access_token || ''
    };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          tier: credentials.tier
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed - no user data returned');
    }

    // Get user profile (should be created by trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create it manually
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: credentials.email,
          name: credentials.name,
          tier: credentials.tier
        })
        .select()
        .single();

      if (createError) {
        throw new Error('Failed to create user profile');
      }

      const user: User = {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        tier: newProfile.tier,
        createdAt: newProfile.created_at
      };

      return {
        user,
        token: data.session?.access_token || ''
      };
    }

    const user: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      tier: profile.tier,
      createdAt: profile.created_at
    };

    return {
      user,
      token: data.session?.access_token || ''
    };
  }

  async verifyToken(token: string): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Token verification failed');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      tier: profile.tier,
      createdAt: profile.created_at
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getAnalysisHistory(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error('Failed to fetch analysis history');
    }

    return data || [];
  }

  async saveAnalysis(analysisData: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('analysis_history')
      .insert({
        user_id: user.id,
        text: analysisData.text,
        features: analysisData.features,
        result: analysisData.result
      });

    if (error) {
      throw new Error('Failed to save analysis');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      tier: profile.tier,
      createdAt: profile.created_at
    };
  }

  async updateProfile(updates: Partial<Pick<User, 'name' | 'tier'>>): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update profile');
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      tier: data.tier,
      createdAt: data.created_at
    };
  }
}

export const authService = new AuthService();