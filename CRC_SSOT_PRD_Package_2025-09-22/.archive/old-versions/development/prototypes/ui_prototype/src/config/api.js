// Production configuration for CRC SSOT
// This file handles API endpoint configuration for different environments

// Environment configuration
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

// API Configuration
const API_CONFIG = {
  // Use environment variable if set, otherwise fallback to localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  
  // Timeout configuration
  timeout: 10000,
  
  // Retry configuration
  retries: 3,
  retryDelay: 1000,
  
  // Feature flags
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true' || isDevelopment
};

// API endpoint builder
function buildApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.baseURL}/api${cleanEndpoint}`;
}

// Enhanced fetch with retry logic
async function apiRequest(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (API_CONFIG.enableDebug) {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  }

  let lastError;
  
  for (let attempt = 0; attempt < API_CONFIG.retries; attempt++) {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (API_CONFIG.enableDebug) {
        console.log(`✅ API Response: ${url}`, data);
      }
      
      return data;
    } catch (error) {
      lastError = error;
      
      if (API_CONFIG.enableDebug) {
        console.warn(`❌ API Request failed (attempt ${attempt + 1}):`, error.message);
      }
      
      // Don't retry on the last attempt
      if (attempt < API_CONFIG.retries - 1) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      }
    }
  }
  
  // If all retries failed and we're in production, try mock data fallback
  if (isProduction && API_CONFIG.useMockData) {
    console.warn('🔄 API unavailable, using mock data fallback');
    return getMockData(endpoint);
  }
  
  throw lastError;
}

// Mock data fallback for production deployment without backend
function getMockData(endpoint) {
  // Basic mock responses for demonstration
  const mockResponses = {
    '/patients': {
      success: true,
      count: 4,
      data: [
        {
          id: 'mock_001',
          name: 'Demo, Patient',
          mrn: 'DEMO_001',
          status: 'Active'
        },
        {
          id: 'mock_002',
          name: 'Test, Sample',
          mrn: 'DEMO_002',
          status: 'Active'
        }
      ],
      method: 'mock'
    },
    '/health': {
      success: true,
      status: 'healthy',
      database: false,
      fallback: true,
      timestamp: new Date().toISOString()
    }
  };
  
  return mockResponses[endpoint] || { success: false, error: 'Mock data not available' };
}

// Export configuration and utilities
export {
  API_CONFIG,
  buildApiUrl,
  apiRequest,
  isDevelopment,
  isProduction
};