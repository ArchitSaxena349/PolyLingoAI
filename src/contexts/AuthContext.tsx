/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, User } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ensureSupabase = useCallback(() => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    return supabase;
  }, []);

  const createUserProfile = useCallback(async (authUser: any) => {
    try {
      const userProfile = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        plan: 'free' as const,
        avatar_url: authUser.user_metadata?.avatar_url,
      };

      const { data, error } = await ensureSupabase()
        .from('users')
        .insert([userProfile])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        // Use the profile data we tried to insert as fallback
        setUser({
          ...userProfile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Create a minimal user object as final fallback
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        plan: 'free',
        avatar_url: authUser.user_metadata?.avatar_url,
        created_at: authUser.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setInitialLoading(false);
    }
  }, [ensureSupabase]);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      setError(null);

      const client = ensureSupabase();
      
      // Verify auth user first
      const { data: { user: authUser }, error: authError } = await client.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Auth user verification failed:', authError);
        setUser(null);
        setInitialLoading(false);
        return;
      }
      
      // Fetch user profile
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Create user profile if it doesn't exist
        if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
          console.log('User profile not found, creating new profile...');
          await createUserProfile(authUser);
          return;
        }
        
        // For other errors, create a minimal user object from auth data
        console.log('Using auth user data as fallback...');
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          plan: 'free',
          avatar_url: authUser.user_metadata?.avatar_url,
          created_at: authUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setInitialLoading(false);
        return;
      }
      
      if (data) {
        setUser(data);
      } else {
        console.log('User profile is null, creating new profile...');
        await createUserProfile(authUser);
        return;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Try to get basic user info from auth as fallback
      try {
        const { data: { user: authUser } } = await ensureSupabase().auth.getUser();
        if (authUser) {
          console.log('Using auth user data as fallback after error...');
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            plan: 'free',
            avatar_url: authUser.user_metadata?.avatar_url,
            created_at: authUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          setUser(null);
        }
      } catch (fallbackError) {
        console.error('Fallback user fetch failed:', fallbackError);
        setUser(null);
      }
    } finally {
      setInitialLoading(false);
    }
  }, [createUserProfile, ensureSupabase]);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeAuth = async () => {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured. Please set environment variables.');
        setInitialLoading(false);
        return;
      }

      try {
        setError(null);
        
        // Simple session check without aggressive timeouts
        const { data: { session }, error: sessionError } = await ensureSupabase().auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          // Don't treat session errors as fatal - user might just not be logged in
          setInitialLoading(false);
          return;
        }

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setInitialLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        
        if (!mounted) return;
        
        // Retry logic with exponential backoff
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          console.log(`Retrying auth initialization in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
          
          setTimeout(() => {
            if (mounted) {
              initializeAuth();
            }
          }, delay);
          return;
        }
        
        // After all retries failed, set a user-friendly error
        const errorMessage = 'Unable to connect to authentication service. Please check your internet connection and refresh the page.';
        setError(errorMessage);
        setUser(null);
        setInitialLoading(false);
      }
    };

    initializeAuth();

  // Listen for auth changes
  if (!isSupabaseConfigured) {
    return () => {
      mounted = false;
    };
  }

  const { data: { subscription } } = ensureSupabase().auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      try {
        setError(null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setInitialLoading(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (mounted) {
          setUser(null);
          setInitialLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, ensureSupabase]);

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await ensureSupabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        throw new Error(error.message || 'Signup failed');
      }

      if (data.user) {
        // The profile will be created automatically when the auth state changes
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await ensureSupabase().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    
    try {
      const { error } = await ensureSupabase().auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw logout errors, just log them and clear local state
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, initialLoading, error, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};
