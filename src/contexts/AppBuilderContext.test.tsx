import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppBuilderProvider, useAppBuilder } from './AppBuilderContext';

// Mock Supabase to prevent network calls / timeouts in test runner environment
vi.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

// Static mock user instance to maintain reference equality across renders
const mockUser = {
  id: 'demo-user-123',
  email: 'demo@polylingo.ai',
  name: 'Demo User',
  plan: 'pro' as const,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

describe('AppBuilderContext State & Undo/Redo', () => {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AppBuilderProvider>{children}</AppBuilderProvider>
  );

  it('creates new app and initializes history', () => {
    const { result } = renderHook(() => useAppBuilder(), { wrapper });

    act(() => {
      result.current.createNewApp();
    });

    expect(result.current.currentApp).not.toBeNull();
    expect(result.current.currentApp?.title).toBe('Untitled App');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('handles adding component and supports undo and redo', () => {
    const { result } = renderHook(() => useAppBuilder(), { wrapper });

    act(() => {
      result.current.createNewApp();
    });

    expect(result.current.currentApp?.components.length).toBe(0);

    act(() => {
      result.current.addComponent({
        type: 'button',
        props: { label: 'Click Me' },
        position: { x: 100, y: 100 },
      });
    });

    expect(result.current.currentApp?.components.length).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    // Undo action
    act(() => {
      result.current.undo();
    });

    expect(result.current.currentApp?.components.length).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    // Redo action
    act(() => {
      result.current.redo();
    });

    expect(result.current.currentApp?.components.length).toBe(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('duplicates component correctly', () => {
    const { result } = renderHook(() => useAppBuilder(), { wrapper });

    act(() => {
      result.current.createNewApp();
    });

    act(() => {
      result.current.addComponent({
        type: 'text-input',
        props: { placeholder: 'Enter name' },
        position: { x: 50, y: 50 },
      });
    });

    const addedCompId = result.current.currentApp?.components[0]?.id;
    expect(addedCompId).toBeDefined();

    act(() => {
      if (addedCompId) {
        result.current.duplicateComponent(addedCompId);
      }
    });

    expect(result.current.currentApp?.components.length).toBe(2);
    expect(result.current.currentApp?.components[1].position).toEqual({ x: 70, y: 70 });
  });

  it('handles duplicateApp and deleteApp for user apps', async () => {
    const { result } = renderHook(() => useAppBuilder(), { wrapper });

    act(() => {
      result.current.createNewApp();
    });

    const createdAppId = result.current.currentApp?.id;
    expect(createdAppId).toBeDefined();

    if (!createdAppId) return;

    // Save app to list
    await act(async () => {
      if (result.current.currentApp) {
        await result.current.saveApp(result.current.currentApp);
      }
    });

    const initialCount = result.current.apps.length;

    // Test duplicateApp
    await act(async () => {
      await result.current.duplicateApp(createdAppId);
    });

    expect(result.current.apps.length).toBe(initialCount + 1);
    expect(result.current.apps[0].title).toContain('(Copy)');

    const duplicatedAppId = result.current.apps[0].id;

    // Test deleteApp
    await act(async () => {
      await result.current.deleteApp(duplicatedAppId);
    });

    expect(result.current.apps.length).toBe(initialCount);
  });

  it('publishes app successfully and returns deployment url', async () => {
    const { result } = renderHook(() => useAppBuilder(), { wrapper });

    act(() => {
      result.current.createNewApp();
    });

    const createdAppId = result.current.currentApp?.id;
    expect(createdAppId).toBeDefined();

    if (!createdAppId) return;

    let publishedUrl = '';
    await act(async () => {
      publishedUrl = await result.current.publishApp(createdAppId);
    });

    expect(publishedUrl).toContain('.polylingo.');
    expect(result.current.currentApp?.published).toBe(true);
    expect(result.current.currentApp?.published_url).toBe(publishedUrl);
  });
});
