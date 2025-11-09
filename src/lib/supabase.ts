import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with more lenient settings for better reliability
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  },
  db: {
    schema: 'public'
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AppTemplate {
  id: string;
  user_id: string;
  title: string;
  description: string;
  components: any[];
  settings: {
    primaryColor: string;
    language: string;
    voice: string;
  };
  published: boolean;
  published_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VoiceClone {
  id: string;
  user_id: string;
  name: string;
  elevenlabs_voice_id: string;
  sample_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}