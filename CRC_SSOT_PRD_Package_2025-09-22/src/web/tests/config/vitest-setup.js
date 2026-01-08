/**
 * 🧪 Vitest Setup Configuration
 * Healthcare-compliant testing environment setup
 */

import { vi } from 'vitest';

// Mock browser APIs that might not be available in test environment
global.fetch = vi.fn();
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(), 
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(), 
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// Mock crypto for encrypted storage tests
global.crypto = {
  getRandomValues: vi.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  subtle: {
    generateKey: vi.fn(),
    importKey: vi.fn(),
    exportKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn()
  }
};

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn()
};

// Healthcare-specific test utilities
global.testUtils = {
  // Generate mock patient data
  createMockPatient: (overrides = {}) => ({
    id: 'test-patient-' + Math.random().toString(36).substr(2, 9),
    firstName: 'Test',
    lastName: 'Patient', 
    dateOfBirth: '1990-01-01',
    commitmentType: null,
    assessmentStatus: 'pending',
    ...overrides
  }),
  
  // Generate mock facility data  
  createMockFacility: (overrides = {}) => ({
    id: 'test-facility-' + Math.random().toString(36).substr(2, 9),
    name: 'Test Facility',
    type: 'mental-health',
    capacity: 50,
    availableBeds: 10,
    acceptsCommitmentTypes: ['201', '302', '303'],
    ...overrides
  }),
  
  // PA commitment type utilities
  paCommitmentTypes: {
    VOLUNTARY: '201',
    EMERGENCY: '302', 
    EXTENDED: '303'
  },
  
  // Mock API responses
  mockSuccessResponse: (data) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data)
  }),
  
  mockErrorResponse: (status = 500, message = 'Internal Server Error') => ({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message })
  })
};

// Setup for each test
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset localStorage mock
  global.localStorage.getItem.mockReturnValue(null);
  global.sessionStorage.getItem.mockReturnValue(null);
  
  // Setup default fetch mock
  global.fetch.mockResolvedValue(testUtils.mockSuccessResponse({}));
});

// Cleanup after each test
afterEach(() => {
  // Clean up any timers
  vi.clearAllTimers();
  
  // Reset modules
  vi.resetModules();
});