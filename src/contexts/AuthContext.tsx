/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, User } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Pick<User, 'name' | 'avatar_url'>) => Promise<void>;
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

    const initializeAuth = async () => {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured. Please set environment variables.');
        setInitialLoading(false);
        return;
      }

      try {
        setError(null);
        
        // Session check with a 3.5s timeout safety race
        const sessionPromise = ensureSupabase().auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null }; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 3500)
        );

        const { data: { session }, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise]).catch(() => ({
          data: { session: null },
          error: null,
        }));
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('Session error:', sessionError);
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
      const client = ensureSupabase();
      const { data, error: signupError } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (signupError) throw signupError;
      if (!data.user) {
        throw new Error('Account creation did not return a user. Please try again.');
      }

      await createUserProfile(data.user);
    } catch (error) {
      console.error('Signup error:', error);
      const message = error instanceof Error ? error.message : 'Unable to create your account.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const isDemo = email.trim().toLowerCase() === 'demo@polylingo.ai';

    if (isDemo) {
      setUser({
        id: 'demo-user-123',
        email: email,
        name: 'Demo User',
        plan: 'pro',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    try {
      const client = ensureSupabase();
      const authPromise = client.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Authentication timed out. Please try again.')), 10000)
      );
      const { data, error: loginError } = await Promise.race([authPromise, timeoutPromise]);

      if (loginError) throw loginError;
      if (!data.user) {
        throw new Error('Unable to sign in. Please check your credentials.');
      }

      await fetchUserProfile(data.user.id);
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      setError(message);
      throw new Error(message);
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
    }
    // Clear local state even if the remote sign-out request is unavailable (for example, demo mode).
    setUser(null);
    setInitialLoading(false);
  };

  const updateProfile = async (updates: Pick<User, 'name' | 'avatar_url'>) => {
    if (!user) throw new Error('You must be signed in to update your profile.');

    const normalizedUpdates = {
      name: updates.name.trim(),
      avatar_url: updates.avatar_url?.trim() || undefined,
    };
    if (!normalizedUpdates.name) throw new Error('Your name cannot be empty.');

    if (user.id === 'demo-user-123') {
      setUser((currentUser) => currentUser ? { ...currentUser, ...normalizedUpdates } : currentUser);
      return;
    }

    const { data, error: profileError } = await ensureSupabase()
      .from('users')
      .update({ ...normalizedUpdates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (profileError) throw profileError;
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, loading, initialLoading, error, isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};
