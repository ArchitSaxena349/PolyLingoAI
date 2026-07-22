import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Polyfill crypto.randomUUID for test runner environment if missing
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.randomUUID) {
  let counter = 0;
  const mockRandomUUID = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`;
  if (typeof globalThis.crypto === 'undefined') {
    (globalThis as any).crypto = { randomUUID: mockRandomUUID };
  } else {
    (globalThis.crypto as any).randomUUID = mockRandomUUID;
  }
}

// Polyfill localStorage for node environment
const storageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => storageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    storageStore[key] = value.toString();
  }),
  removeItem: vi.fn((key: string) => {
    delete storageStore[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(storageStore)) {
      delete storageStore[key];
    }
  }),
  length: 0,
  key: vi.fn((_index: number) => null),
};

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

// Automatically cleanup DOM after each test
afterEach(() => {
  cleanup();
});
