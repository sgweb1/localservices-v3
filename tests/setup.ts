import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup po każdym teście
afterEach(() => {
  cleanup();
  // czyść pamięć localStorage między testami
  try { (global as any).localStorage?.clear(); } catch {}
});
// Mock leaflet (wystawia eksport nazwany Icon)
vi.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: null,
      },
      mergeOptions: vi.fn(),
    },
  },
}));

// Mock react-leaflet (renderuje minimalną strukturę z klasą 'leaflet-container')
vi.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: ({ children, className, style }: any) =>
      React.createElement('div', { className: `leaflet-container ${className || ''}`.trim(), style }, children),
    TileLayer: () => null,
    Marker: ({ children }: any) => React.createElement('div', null, children),
    Popup: ({ children }: any) => React.createElement('div', null, children),
    useMap: () => ({ setView: vi.fn() }),
  };
});

// Mock react-leaflet-cluster (przepuszcza dzieci)
vi.mock('react-leaflet-cluster', () => {
  const React = require('react');
  return {
    default: ({ children }: any) => React.createElement('div', { className: 'marker-cluster' }, children),
  };
});


// Mock localStorage (pamięć w procesie)
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = String(value);
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const k of Object.keys(store)) delete store[k];
  }),
};
// @ts-ignore
global.localStorage = localStorageMock as any;

// Mock window.matchMedia - only in jsdom environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver - only in jsdom environment
class MockIntersectionObserver {
  constructor(_cb: any, _options?: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
if (typeof window !== 'undefined') {
  (window as any).IntersectionObserver = MockIntersectionObserver as any;
}
(global as any).IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver - only in jsdom environment
class MockResizeObserver {
  constructor(_cb?: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== 'undefined') {
  (window as any).ResizeObserver = MockResizeObserver as any;
}
(global as any).ResizeObserver = MockResizeObserver as any;
