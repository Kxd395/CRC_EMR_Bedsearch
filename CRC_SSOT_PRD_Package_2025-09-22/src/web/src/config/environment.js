/**
 * 🏥 EMR CRC SSOT - Environment Configuration
 * Centralized configuration management with validation
 */

class EnvironmentConfig {
  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  loadConfig() {
    return {
      // API Configuration
      apiUrl: this.getEnvVar('VITE_API_URL', 'http://localhost:3001'),
      apiTimeout: parseInt(this.getEnvVar('VITE_API_TIMEOUT', '30000')),

      // Feature Flags
      features: {
        placementSearch: this.getBooleanEnv('VITE_ENABLE_PLACEMENT_SEARCH', true),
        assessment: this.getBooleanEnv('VITE_ENABLE_ASSESSMENT_MODULE', true),
        facilityFinder: this.getBooleanEnv('VITE_ENABLE_FACILITY_FINDER', true),
        debug: this.getBooleanEnv('VITE_ENABLE_DEBUG', false)
      },

      // Development Options
      useMockData: this.getBooleanEnv('VITE_USE_MOCK_DATA', false),
      enableLocalCache: this.getBooleanEnv('CRC_ENABLE_LOCAL_CACHE', false),

      // External System URLs
      externalSystems: {
        facilitySystem: this.getEnvVar('VITE_FACILITY_SYSTEM_URL', ''),
        assessmentSystem: this.getEnvVar('VITE_ASSESSMENT_SYSTEM_URL', ''),
        emrIntegration: this.getEnvVar('VITE_EMR_INTEGRATION_URL', '')
      },

      // Environment Info
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      mode: import.meta.env.MODE
    };
  }

  getEnvVar(key, defaultValue = '') {
    return import.meta.env[key] ?? defaultValue;
  }

  getBooleanEnv(key, defaultValue = false) {
    const value = this.getEnvVar(key, '');
    if (value === '') return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  validateConfig() {
    const errors = [];

    // Validate required API URL
    if (!this.config.apiUrl) {
      errors.push('VITE_API_URL is required');
    }

    // Validate API URL format
    try {
      new URL(this.config.apiUrl);
    } catch (_e) {
      errors.push('VITE_API_URL must be a valid URL');
    }

    // Validate production settings
    if (this.config.isProduction) {
      if (this.config.enableLocalCache) {
        errors.push('CRC_ENABLE_LOCAL_CACHE must be false/0 in production');
      }

      if (this.config.features.debug) {
        errors.push('VITE_ENABLE_DEBUG must be false/0 in production');
      }

      if (this.config.apiUrl.includes('localhost')) {
        errors.push('VITE_API_URL cannot use localhost in production');
      }
    }

    if (errors.length > 0) {
      console.error('❌ Environment Configuration Errors:');
      errors.forEach(error => console.error(`  • ${error}`));
      throw new Error('Invalid environment configuration');
    }

    console.log('✅ Environment configuration validated');
  }

  // Get configuration values
  get api() {
    return {
      url: this.config.apiUrl,
      timeout: this.config.apiTimeout
    };
  }

  get features() {
    return this.config.features;
  }

  isFeatureEnabled(featureName) {
    return this.config.features[featureName] || false;
  }

  // HIPAA compliance check
  get isHipaaCompliant() {
    if (this.config.isProduction) {
      return !this.config.enableLocalCache && 
             this.config.apiUrl.startsWith('https://') &&
             !this.config.features.debug;
    }
    return true; // Development environments can be more permissive
  }

  // Debug logging
  logConfiguration() {
    if (this.config.features.debug) {
      console.group('🔧 Environment Configuration');
      console.log('Mode:', this.config.mode);
      console.log('API URL:', this.config.apiUrl);
      console.log('Features:', this.config.features);
      console.log('Local Cache:', this.config.enableLocalCache);
      console.log('HIPAA Compliant:', this.isHipaaCompliant);
      console.groupEnd();
    }
  }
}

// Create and export singleton instance
export const env = new EnvironmentConfig();

// Initialize logging if debug is enabled
if (env.features.debug) {
  env.logConfiguration();
}