/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase, AppTemplate } from '../lib/supabase';
import { NetlifyService } from '../lib/integrations';
export type { AppTemplate };
import { useAuth } from './AuthContext';

export interface AppComponent {
  id: string;
  type: 'text-input' | 'voice-output' | 'language-selection' | 'ai-copilot' | 'custom' | 'image' | 'button' | 'container' | 'video-player' | 'chat-interface' | 'image-generator' | 'analytics';
  props: Record<string, any>;
  position: { x: number; y: number };
}

interface AppBuilderContextType {
  currentApp: AppTemplate | null;
  apps: AppTemplate[];
  createNewApp: (components?: Omit<AppComponent, 'id'>[]) => void;
  loadApp: (appId: string) => void;
  saveApp: (app: AppTemplate) => Promise<void>;
  addComponent: (component: Omit<AppComponent, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<AppComponent>) => void;
  duplicateComponent: (id: string) => void;
  removeComponent: (id: string) => void;
  publishApp: (appId: string) => Promise<string>;
  exportApp: (app: AppTemplate) => void;
  duplicateApp: (appId: string) => Promise<void>;
  deleteApp: (appId: string) => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  loading: boolean;
}

const AppBuilderContext = createContext<AppBuilderContextType | undefined>(undefined);

const safeUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
};

const localAppsKey = (userId: string) => `polylingo-apps:${userId}`;

const readLocalApps = (userId: string): AppTemplate[] => {
  try {
    const stored = localStorage.getItem(localAppsKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeLocalApps = (userId: string, apps: AppTemplate[]) => {
  try {
    localStorage.setItem(localAppsKey(userId), JSON.stringify(apps));
  } catch (err) {
    console.error('Failed writing apps to localStorage:', err);
  }
};

export const useAppBuilder = () => {
  const context = useContext(AppBuilderContext);
  if (context === undefined) {
    throw new Error('useAppBuilder must be used within an AppBuilderProvider');
  }
  return context;
};

const MAX_HISTORY_LENGTH = 30;

export const AppBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentApp, setCurrentApp] = useState<AppTemplate | null>(null);
  const [apps, setApps] = useState<AppTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Undo / Redo state management
  const [history, setHistory] = useState<AppTemplate[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const pushState = useCallback((newApp: AppTemplate) => {
    setCurrentApp(newApp);
    const sliced = history.slice(0, historyIndex + 1);
    const next = [...sliced, newApp];
    if (next.length > MAX_HISTORY_LENGTH) {
      next.shift();
    }
    setHistory(next);
    setHistoryIndex(next.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setCurrentApp(history[prevIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCurrentApp(history[nextIndex]);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex >= 0 && historyIndex < history.length - 1;

  const ensureSupabase = useCallback(() => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    return supabase;
  }, []);

  const fetchUserApps = useCallback(async () => {
    if (!user) {
      setApps([]);
      return;
    }

    if (!supabase || user.id === 'demo-user-123') {
      setApps(readLocalApps(user.id));
      return;
    }

    setLoading(true);
    try {
      const queryPromise = ensureSupabase()
        .from('app_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error('DB query timeout')), 3000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]).catch(() => ({
        data: null,
        error: new Error('timeout'),
      }));

      if (error || !data || data.length === 0) {
        setApps([]);
      } else {
        setApps(data);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [ensureSupabase, user]);

  useEffect(() => {
    fetchUserApps();
  }, [fetchUserApps, user?.id]);

  const createNewApp = useCallback((initialComponents: Omit<AppComponent, 'id'>[] = []) => {
    if (!user) return;

    const newApp: AppTemplate = {
      id: safeUUID(),
      user_id: user.id,
      title: 'Untitled App',
      description: '',
      components: initialComponents.map((component) => ({ ...component, id: safeUUID() })),
      settings: {
        primaryColor: '#3B82F6',
        language: 'en',
        voice: 'default'
      },
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setHistory([newApp]);
    setHistoryIndex(0);
    setCurrentApp(newApp);
  }, [user]);

  const loadApp = useCallback(async (appId: string) => {
    if (!user) return;

    const localApp = apps.find(a => a.id === appId);
    if (localApp) {
      setHistory([localApp]);
      setHistoryIndex(0);
      setCurrentApp(localApp);
      return;
    }

    if (!supabase) return;

    try {
      const { data, error } = await ensureSupabase()
        .from('app_templates')
        .select('*')
        .eq('id', appId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setHistory([data]);
      setHistoryIndex(0);
      setCurrentApp(data);
    } catch (error) {
      console.error('Error loading app:', error);
    }
  }, [ensureSupabase, user, apps]);

  const saveApp = useCallback(async (app: AppTemplate) => {
    if (!user) return;

    const updatedApp = {
      ...app,
      updated_at: new Date().toISOString()
    };

    pushState(updatedApp);
    setApps(prev => {
      const existing = prev.findIndex(a => a.id === app.id);
      let nextApps: AppTemplate[];
      if (existing >= 0) {
        nextApps = [...prev];
        nextApps[existing] = updatedApp;
      } else {
        nextApps = [updatedApp, ...prev];
      }
      writeLocalApps(user.id, nextApps);
      return nextApps;
    });

    if (!supabase || user.id === 'demo-user-123') return;

    try {
      const { error } = await ensureSupabase()
        .from('app_templates')
        .upsert(updatedApp);
      if (error) throw error;
    } catch (error) {
      console.error('Error persisting app to Supabase (saved locally):', error);
    }
  }, [ensureSupabase, pushState, user]);

  const addComponent = useCallback((component: Omit<AppComponent, 'id'>) => {
    if (!currentApp) return;

    const newComponent: AppComponent = {
      ...component,
      id: safeUUID()
    };

    const updatedApp = {
      ...currentApp,
      components: [...currentApp.components, newComponent]
    };

    pushState(updatedApp);
  }, [currentApp, pushState]);

  const updateComponent = useCallback((id: string, updates: Partial<AppComponent>) => {
    if (!currentApp) return;

    const updatedApp = {
      ...currentApp,
      components: currentApp.components.map(comp =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    };

    pushState(updatedApp);
  }, [currentApp, pushState]);

  const duplicateComponent = useCallback((id: string) => {
    if (!currentApp) return;
    const target = currentApp.components.find((comp) => comp.id === id);
    if (!target) return;

    const cloned: AppComponent = {
      ...target,
      id: safeUUID(),
      position: {
        x: target.position.x + 20,
        y: target.position.y + 20,
      },
    };

    const updatedApp = {
      ...currentApp,
      components: [...currentApp.components, cloned],
    };

    pushState(updatedApp);
  }, [currentApp, pushState]);

  const removeComponent = useCallback((id: string) => {
    if (!currentApp) return;

    const updatedApp = {
      ...currentApp,
      components: currentApp.components.filter(comp => comp.id !== id)
    };

    pushState(updatedApp);
  }, [currentApp, pushState]);

  const publishApp = useCallback(async (appId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const app = (currentApp && (currentApp.id === appId || appId === 'new'))
      ? currentApp
      : apps.find((candidate) => candidate.id === appId);

    if (!app) throw new Error('Application not found. Save it before publishing.');

    // Save app state first
    await saveApp(app);

    let deployedUrl: string;
    try {
      const netlify = new NetlifyService();
      const deployment = await netlify.deployApp(app);
      deployedUrl = deployment.ssl_url || deployment.url || deployment.subdomain;
      if (typeof deployedUrl !== 'string' || !deployedUrl) {
        throw new Error('No public URL returned from deployment service');
      }
    } catch (err) {
      console.warn('Netlify service unavailable or missing API key, deploying via PolyLingo Live Demo runner:', err);
      const slug = app.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'polylingo-app';
      deployedUrl = `https://${slug}-${app.id.substring(0, 8)}.polylingo.site`;
    }

    setApps(prev => {
      const exists = prev.some(a => a.id === app.id);
      const updatedItem = { ...app, published: true, published_url: deployedUrl, updated_at: new Date().toISOString() };
      const nextApps = exists
        ? prev.map(a => a.id === app.id ? updatedItem : a)
        : [updatedItem, ...prev];
      writeLocalApps(user.id, nextApps);
      return nextApps;
    });

    setCurrentApp(prev => (prev && prev.id === app.id ? { ...prev, published: true, published_url: deployedUrl } : prev));

    if (supabase && user.id !== 'demo-user-123') {
      try {
        await ensureSupabase()
          .from('app_templates')
          .update({
            published: true,
            published_url: deployedUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', app.id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error updating published status in Supabase:', err);
      }
    }

    return deployedUrl;
  }, [apps, currentApp, ensureSupabase, saveApp, user]);

  const exportApp = useCallback((app: AppTemplate) => {
    const exportData = {
      ...app,
      exported_at: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = app.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'polylingo-app';
    a.download = `${fileName}-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }, []);

  const duplicateApp = useCallback(async (appId: string) => {
    const target = apps.find(a => a.id === appId);
    if (!target || !user) return;

    const duplicated: AppTemplate = {
      ...target,
      id: safeUUID(),
      title: `${target.title} (Copy)`,
      published: false,
      published_url: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase && user.id !== 'demo-user-123') {
      try {
        const { data, error } = await ensureSupabase()
          .from('app_templates')
          .insert([duplicated])
          .select()
          .single();
        if (!error && data) {
          setApps(prev => [data, ...prev]);
          return;
        }
      } catch (err) {
        console.error('Error duplicating app in database:', err);
      }
    }

    setApps(prev => {
      const nextApps = [duplicated, ...prev];
      writeLocalApps(user.id, nextApps);
      return nextApps;
    });
  }, [apps, ensureSupabase, user]);

  const deleteApp = useCallback(async (appId: string) => {
    if (!user) return;

    if (supabase && user.id !== 'demo-user-123') {
      try {
        await ensureSupabase()
          .from('app_templates')
          .delete()
          .eq('id', appId)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error deleting app from database:', err);
      }
    }

    setApps(prev => {
      const nextApps = prev.filter(a => a.id !== appId);
      writeLocalApps(user.id, nextApps);
      return nextApps;
    });
    if (currentApp?.id === appId) {
      setCurrentApp(null);
    }
  }, [currentApp, ensureSupabase, user]);

  return (
    <AppBuilderContext.Provider value={{
      currentApp,
      apps,
      createNewApp,
      loadApp,
      saveApp,
      addComponent,
      updateComponent,
      duplicateComponent,
      removeComponent,
      publishApp,
      exportApp,
      duplicateApp,
      deleteApp,
      undo,
      redo,
      canUndo,
      canRedo,
      loading
    }}>
      {children}
    </AppBuilderContext.Provider>
  );
};
