import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock fetch and Request/Response
global.fetch = jest.fn();
global.Request = class Request {
  constructor(public url: string, public init?: RequestInit) {}
} as unknown as typeof Request;
global.Response = class Response {
  constructor(public body?: any, public init?: ResponseInit) {}
  json() {
    return Promise.resolve(this.body);
  }
} as unknown as typeof Response;

// Environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
  RESEND_API_KEY: 'test-resend-key',
  ADMIN_EMAIL: 'admin@test.com',
  NODE_ENV: 'test'
};

// Console mocks
const originalConsole = { ...console };
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
  // Keep some console methods for debugging
  debug: originalConsole.debug,
  info: originalConsole.info
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 