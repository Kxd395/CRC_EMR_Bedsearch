/**
 * 🏥 EMR CRC SSOT - API Client Module
 * HTTP client with proper error handling and security
 */

import { env } from '../config/environment.js';

/**
 * API Client with security guards and proper error handling
 */
export class ApiClient {
  constructor() {
    this.baseUrl = env.api.url;
    this.timeout = env.api.timeout;
    this.authToken = null;
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get current auth token
   * @returns {string|null} Current token
   */
  getAuthToken() {
    return this.authToken || this.getStoredToken();
  }

  /**
   * Get stored auth token from sessionStorage
   * @returns {string|null} Stored token
   */
  getStoredToken() {
    try {
      return sessionStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Make HTTP request with proper error handling
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} data - Request data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response data
   */
  async request(method, path, data = null, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = this.buildHeaders(options.headers);
      const url = `${this.baseUrl}${path}`;

      const requestOptions = {
        method,
        headers,
        signal: controller.signal,
        ...options
      };

      // Add body for non-GET requests
      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data);
      }

      // Log request in development
      if (env.features.debug) {
        this.logRequest(method, url, data);
      }

      const response = await fetch(url, requestOptions);
      
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        await this.handleHttpError(response);
      }

      const responseData = await response.json();

      // Log response in development
      if (env.features.debug) {
        this.logResponse(method, url, responseData);
      }

      return responseData;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ApiError('REQUEST_TIMEOUT', 'Request timeout', { timeout: this.timeout });
      }
      
      throw this.normalizeError(error);
    }
  }

  /**
   * Build request headers
   * @param {Object} customHeaders - Custom headers to add
   * @returns {Object} Complete headers object
   */
  buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      ...customHeaders
    };

    // Add auth header if token available
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle HTTP error responses
   * @param {Response} response - Fetch response object
   */
  async handleHttpError(response) {
    let errorData;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const errorCode = errorData.error || `HTTP_${response.status}`;
    const errorMessage = errorData.message || response.statusText;

    throw new ApiError(errorCode, errorMessage, {
      status: response.status,
      statusText: response.statusText,
      ...errorData
    });
  }

  /**
   * Normalize different error types
   * @param {Error} error - Original error
   * @returns {ApiError} Normalized error
   */
  normalizeError(error) {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ApiError('NETWORK_ERROR', 'Network connection failed', { 
        originalError: error.message 
      });
    }

    return new ApiError('UNKNOWN_ERROR', error.message, { 
      originalError: error.message 
    });
  }

  /**
   * Log request for debugging
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} data - Request data
   */
  logRequest(method, url, data) {
    console.group(`🔄 API Request: ${method} ${url}`);
    if (data) {
      console.log('Request Data:', this.sanitizeForLogging(data));
    }
    console.groupEnd();
  }

  /**
   * Log response for debugging
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} data - Response data
   */
  logResponse(method, url, data) {
    console.group(`✅ API Response: ${method} ${url}`);
    console.log('Response Data:', this.sanitizeForLogging(data));
    console.groupEnd();
  }

  /**
   * Remove PHI from logging data
   * @param {Object} data - Data to sanitize
   * @returns {Object} Sanitized data
   */
  sanitizeForLogging(data) {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    
    // Remove PHI fields
    const phiFields = ['ssn', 'medicalRecordNumber', 'firstName', 'lastName', 'dateOfBirth'];
    phiFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Hash patient IDs
    if (sanitized.patientId) {
      sanitized.patientId = this.hashForLogging(sanitized.patientId);
    }

    return sanitized;
  }

  /**
   * Hash sensitive IDs for logging
   * @param {string} value - Value to hash
   * @returns {string} Hashed value
   */
  hashForLogging(value) {
    // Simple hash for logging (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hashed_${Math.abs(hash)}`;
  }

  // =============================================================================
  // API Methods
  // =============================================================================

  /**
   * Save patient search with proper error handling
   * @param {string} patientId - Patient ID
   * @param {Object} searchData - Search data
   * @returns {Promise<Object>} Save result
   */
  async saveSearch(patientId, searchData) {
    this.showSyncStatus(patientId, 'pending');
    
    try {
      const result = await this.request('POST', `/patients/${patientId}/searches`, searchData);
      
      this.showSyncStatus(patientId, 'synced');
      this.showNotification('Search saved successfully', 'success');
      
      return result;
    } catch (error) {
      this.showSyncStatus(patientId, 'error', error.message);
      this.showNotification(`Failed to save search: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get patient data
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient data
   */
  async getPatient(patientId) {
    return this.request('GET', `/patients/${patientId}`);
  }

  /**
   * Update patient data
   * @param {string} patientId - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise<Object>} Update result
   */
  async updatePatient(patientId, patientData) {
    this.showSyncStatus(patientId, 'pending');
    
    try {
      const result = await this.request('PUT', `/patients/${patientId}`, patientData);
      this.showSyncStatus(patientId, 'synced');
      return result;
    } catch (error) {
      this.showSyncStatus(patientId, 'error', error.message);
      throw error;
    }
  }

  /**
   * Get facilities with filtering
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} Facilities list
   */
  async getFacilities(criteria = {}) {
    const params = new URLSearchParams(criteria).toString();
    const path = params ? `/facilities?${params}` : '/facilities';
    return this.request('GET', path);
  }

  /**
   * Publish data to SSOT system
   * @param {Object} data - Data to publish
   * @returns {Promise<Object>} Publish result
   */
  async publishToSSOT(data) {
    try {
      return await this.request('POST', '/ssot/publish', data);
    } catch (error) {
      // Special handling for SSOT publish failures
      if (error.code === 'DB_CONNECTION_FAILED') {
        throw new ApiError('SSOT_UNAVAILABLE', 'SSOT system temporarily unavailable', {
          suggestion: 'Please try again in a few minutes'
        });
      }
      throw error;
    }
  }

  /**
   * Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    return this.request('GET', '/health');
  }

  // =============================================================================
  // UI Integration Methods
  // =============================================================================

  /**
   * Show sync status in UI
   * @param {string} patientId - Patient ID
   * @param {string} status - Sync status (pending|synced|error)
   * @param {string} message - Error message if applicable
   */
  showSyncStatus(patientId, status, message = '') {
    const indicator = document.querySelector(`[data-patient-id="${patientId}"] .sync-indicator`);
    if (indicator) {
      indicator.className = `sync-indicator ${status}`;
      
      const statusText = {
        pending: '🔄 Saving...',
        synced: '✅ Synced',
        error: '❌ Error'
      };
      
      indicator.textContent = statusText[status] || status;
      indicator.title = message;
    }
  }

  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success|error|warning|info)
   */
  showNotification(message, type = 'info') {
    // Create or update notification element
    let notification = document.getElementById('api-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'api-notification';
      document.body.appendChild(notification);
    }

    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }

  /**
   * Get user-friendly error message
   * @returns {string} User-friendly message
   */
  getUserMessage() {
    const userMessages = {
      'NETWORK_ERROR': 'Network connection lost. Please check your internet connection.',
      'REQUEST_TIMEOUT': 'Request timed out. Please try again.',
      'AUTH_TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
      'PERMISSION_DENIED': 'You do not have permission to perform this action.',
      'DB_CONNECTION_FAILED': 'Database temporarily unavailable. Please try again.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'SSOT_UNAVAILABLE': 'SSOT system is temporarily unavailable.'
    };

    return userMessages[this.code] || this.message;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();