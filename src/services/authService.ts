import { createClient } from '@supabase/supabase-js';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure the redirect URL for email confirmation
    redirectTo: `${window.location.origin}/auth/callback`,
    // Enable automatic session management
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Set storage key to ensure consistency
    storageKey: 'supabase.auth.token',
    // Configure session storage
    storage: window.localStorage
  }
});

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔄 AuthService: Attempting login for', credentials.email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('❌ AuthService: Login error:', error.message);
      
      // Handle specific email confirmation error
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see the email.');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed - no user data returned');
    }

    console.log('✅ AuthService: Login successful, getting profile for user:', data.user.id);

    // Get user profile using maybeSingle() to handle missing profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ AuthService: Profile fetch error:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
      console.error('❌ AuthService: No profile found for user:', data.user.id);
      throw new Error('User profile not found. Please contact support.');
    }

    const user: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      tier: profile.tier,
      createdAt: profile.created_at
    };

    console.log('✅ AuthService: Profile loaded:', user.name, user.tier);

    return {
      user,
      token: data.session?.access_token || ''
    };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    console.log('🔄 AuthService: Registering user with tier:', credentials.tier);
    
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          tier: credentials.tier,
          full_name: credentials.name
        },
        // Set redirect URL for email confirmation
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('❌ AuthService: Registration error:', error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed - no user data returned');
    }

    // Check if email confirmation is required
    if (!data.session) {
      console.log('⚠️ AuthService: Email confirmation required');
      throw new Error('CONFIRMATION_REQUIRED');
    }

    console.log('✅ AuthService: Registration successful, getting profile for user:', data.user.id);

    // Get user profile (should be created by trigger) using maybeSingle()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ AuthService: Profile fetch error:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
      console.log('⚠️ AuthService: Profile not found, creating manually with tier:', credentials.tier);
      // If profile doesn't exist, create it manually with the correct tier
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
        console.error('❌ AuthService: Profile creation error:', createError);
        throw new Error('Failed to create user profile');
      }

      const user: User = {
        id: newProfile.id,
        email: newProfile.email,
        name: newProfile.name,
        tier: newProfile.tier,
        createdAt: newProfile.created_at
      };

      console.log('✅ AuthService: Profile created manually:', user.name, user.tier);

      return {
        user,
        token: data.session?.access_token || ''
      };
    }

    // If profile exists but has wrong tier, update it
    if (profile.tier !== credentials.tier) {
      console.log('🔄 AuthService: Updating profile tier from', profile.tier, 'to', credentials.tier);
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ tier: credentials.tier })
        .eq('id', data.user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ AuthService: Profile update error:', updateError);
      } else {
        profile.tier = updatedProfile.tier;
        console.log('✅ AuthService: Profile tier updated to:', profile.tier);
      }
    }

    const user: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      tier: profile.tier,
      createdAt: profile.created_at
    };

    console.log('✅ AuthService: Registration complete:', user.name, user.tier);

    return {
      user,
      token: data.session?.access_token || ''
    };
  }

  async resendConfirmation(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
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
    console.log('🔄 AuthService: Logging out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ AuthService: Logout error:', error.message);
      throw new Error(error.message);
    }
    console.log('✅ AuthService: Logout successful');
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
    console.log('🔄 AuthService: Getting current user');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ AuthService: Error getting user:', userError.message);
      return null;
    }
    
    if (!user) {
      console.log('ℹ️ AuthService: No authenticated user found');
      return null;
    }

    console.log('✅ AuthService: Found authenticated user:', user.id);

    // Use maybeSingle() to handle missing profiles gracefully
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ AuthService: Error fetching profile:', error.message);
      return null;
    }

    if (!profile) {
      console.log('⚠️ AuthService: No profile found for user:', user.id);
      return null;
    }

    const userData: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      tier: profile.tier,
      createdAt: profile.created_at
    };

    console.log('✅ AuthService: Profile loaded:', userData.name, userData.tier);
    return userData;
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