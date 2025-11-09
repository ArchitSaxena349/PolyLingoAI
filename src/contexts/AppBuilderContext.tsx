/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase, AppTemplate } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface AppComponent {
  id: string;
  type: 'text-input' | 'voice-output' | 'language-selection' | 'ai-copilot' | 'custom';
  props: Record<string, any>;
  position: { x: number; y: number };
}

interface AppBuilderContextType {
  currentApp: AppTemplate | null;
  apps: AppTemplate[];
  createNewApp: () => void;
  loadApp: (appId: string) => void;
  saveApp: (app: AppTemplate) => Promise<void>;
  addComponent: (component: Omit<AppComponent, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<AppComponent>) => void;
  removeComponent: (id: string) => void;
  publishApp: (appId: string) => Promise<string>;
  loading: boolean;
}

const AppBuilderContext = createContext<AppBuilderContextType | undefined>(undefined);

export const useAppBuilder = () => {
  const context = useContext(AppBuilderContext);
  if (context === undefined) {
    throw new Error('useAppBuilder must be used within an AppBuilderProvider');
  }
  return context;
};

export const AppBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentApp, setCurrentApp] = useState<AppTemplate | null>(null);
  const [apps, setApps] = useState<AppTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserApps = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserApps();
    }
  }, [fetchUserApps, user]);

  const createNewApp = useCallback(() => {
    if (!user) return;

    const newApp: AppTemplate = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title: 'Untitled App',
      description: '',
      components: [],
      settings: {
        primaryColor: '#3B82F6',
        language: 'en',
        voice: 'default'
      },
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCurrentApp(newApp);
  }, [user]);

  const loadApp = useCallback(async (appId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('app_templates')
        .select('*')
        .eq('id', appId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCurrentApp(data);
    } catch (error) {
      console.error('Error loading app:', error);
    }
  }, [user]);

  const saveApp = useCallback(async (app: AppTemplate) => {
    if (!user) return;

    try {
      const updatedApp = { 
        ...app, 
        updated_at: new Date().toISOString() 
      };

      const { data, error } = await supabase
        .from('app_templates')
        .upsert(updatedApp)
        .select()
        .single();

      if (error) throw error;

      setCurrentApp(data);
      setApps(prev => {
        const existing = prev.findIndex(a => a.id === app.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        } else {
          return [data, ...prev];
        }
      });
    } catch (error) {
      console.error('Error saving app:', error);
      throw error;
    }
  }, [user]);

  const addComponent = useCallback((component: Omit<AppComponent, 'id'>) => {
    if (!currentApp) return;
    
    const newComponent: AppComponent = {
      ...component,
      id: crypto.randomUUID()
    };
    
    const updatedApp = {
      ...currentApp,
      components: [...currentApp.components, newComponent]
    };
    
    setCurrentApp(updatedApp);
  }, [currentApp]);

  const updateComponent = useCallback((id: string, updates: Partial<AppComponent>) => {
    if (!currentApp) return;
    
    const updatedApp = {
      ...currentApp,
      components: currentApp.components.map(comp =>
        comp.id === id ? { ...comp, ...updates } : comp
      )
    };
    
    setCurrentApp(updatedApp);
  }, [currentApp]);

  const removeComponent = useCallback((id: string) => {
    if (!currentApp) return;
    
    const updatedApp = {
      ...currentApp,
      components: currentApp.components.filter(comp => comp.id !== id)
    };
    
    setCurrentApp(updatedApp);
  }, [currentApp]);

  const publishApp = useCallback(async (appId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    // Mock deployment process - in production, this would trigger actual deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const deployedUrl = `https://${appId}-polylingo.netlify.app`;
    
    // Update app as published
    const { error } = await supabase
      .from('app_templates')
      .update({ 
        published: true, 
        published_url: deployedUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', appId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Update local state
    setApps(prev => prev.map(app => 
      app.id === appId ? { ...app, published: true, published_url: deployedUrl } : app
    ));
    
    return deployedUrl;
  }, [user]);

  return (
    <AppBuilderContext.Provider value={{
      currentApp,
      apps,
      createNewApp,
      loadApp,
      saveApp,
      addComponent,
      updateComponent,
      removeComponent,
      publishApp,
      loading
    }}>
      {children}
    </AppBuilderContext.Provider>
  );
};