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
      // Handle specific email confirmation error
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see the email.');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed - no user data returned');
    }

    // Get user profile using maybeSingle() to handle missing profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
      throw new Error('User profile not found. Please contact support.');
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

    // Check if email confirmation is required
    if (!data.session) {
      throw new Error('CONFIRMATION_REQUIRED');
    }

    // Get user profile (should be created by trigger) using maybeSingle()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
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

  async resendConfirmation(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async verifyToken(token: string): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Token verification failed');
    }

    // Get user profile using maybeSingle() to handle missing profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
      throw new Error('User profile not found. Please contact support.');
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

    // Use maybeSingle() to handle missing profiles gracefully
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
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

  async getPlanStats(): Promise<{ standard: number; pro: number }> {
    try {
      // Get total count of users
      const { count: totalUsers, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('tier', 'guest');

      if (totalError) {
        throw new Error('Failed to get total user count');
      }

      // Get count of standard users
      const { count: standardUsers, error: standardError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tier', 'standard');

      if (standardError) {
        throw new Error('Failed to get standard user count');
      }

      // Get count of pro users
      const { count: proUsers, error: proError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tier', 'pro');

      if (proError) {
        throw new Error('Failed to get pro user count');
      }

      const total = (totalUsers || 0);
      const standard = (standardUsers || 0);
      const pro = (proUsers || 0);

      // Calculate percentages
      if (total === 0) {
        return { standard: 65, pro: 35 }; // Default values
      }

      const standardPercentage = Math.round((standard / total) * 100);
      const proPercentage = Math.round((pro / total) * 100);

      return {
        standard: standardPercentage,
        pro: proPercentage
      };
    } catch (error) {
      console.error('Error fetching plan stats:', error);
      // Return default values if there's an error
      return { standard: 65, pro: 35 };
    }
  }
}

export const authService = new AuthService();