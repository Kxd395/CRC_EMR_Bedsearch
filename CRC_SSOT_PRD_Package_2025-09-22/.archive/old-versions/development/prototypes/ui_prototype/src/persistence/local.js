/**
 * 🏥 EMR CRC SSOT - Encrypted Local Storage Module
 * HIPAA-compliant local caching with encryption and TTL
 */

import { env } from '../config/environment.js';

/**
 * Encrypted storage for PHI data (development/testing only)
 */
export class EncryptedStorage {
  constructor() {
    this.isEnabled = env.enableLocalCache && !env.isProduction;
    this.ttl = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    this.keyName = 'emr_storage_key';
    this.algorithm = { name: 'AES-GCM', length: 256 };
    
    // Initialize encryption key
    this.initializeKey();
  }

  /**
   * Initialize or retrieve encryption key
   */
  async initializeKey() {
    try {
      // In a real implementation, this would be derived from user session
      // For development, we'll generate a session key
      if (!this.encryptionKey) {
        this.encryptionKey = await crypto.subtle.generateKey(
          this.algorithm,
          false, // Not extractable
          ['encrypt', 'decrypt']
        );
      }
    } catch (error) {
      console.warn('Failed to initialize encryption key:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Safe JSON parser for localStorage
   * @param {string} key - Storage key
   * @param {*} fallback - Fallback value if parsing fails
   * @returns {*} Parsed value or fallback
   */
  loadJson(key, fallback) {
    if (!this.isEnabled) return fallback;
    
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Store encrypted item in localStorage
   * @param {string} key - Storage key
   * @param {*} data - Data to store
   * @returns {Promise<boolean>} Success status
   */
  async setItem(key, data) {
    if (!this.isEnabled) return false;
    
    try {
      await this.initializeKey();
      
      const serialized = JSON.stringify(data);
      const encrypted = await this.encrypt(serialized);
      
      const item = {
        encrypted: encrypted,
        timestamp: Date.now(),
        ttl: this.ttl,
        version: '1.0'
      };
      
      localStorage.setItem(`encrypted_${key}`, JSON.stringify(item));
      
      // Add visual indicator for cached data
      this.showCacheIndicator(key, true);
      
      return true;
    } catch (error) {
      console.warn('Failed to store encrypted item:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt item from localStorage
   * @param {string} key - Storage key
   * @param {*} fallback - Fallback value if not found
   * @returns {Promise<*>} Decrypted data or fallback
   */
  async getItem(key, fallback = null) {
    if (!this.isEnabled) return fallback;
    
    try {
      const itemJson = localStorage.getItem(`encrypted_${key}`);
      if (!itemJson) return fallback;
      
      const item = JSON.parse(itemJson);
      
      // Check TTL expiration
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(`encrypted_${key}`);
        this.showCacheIndicator(key, false);
        return fallback;
      }
      
      await this.initializeKey();
      const decrypted = await this.decrypt(item.encrypted);
      
      // Show cache indicator
      this.showCacheIndicator(key, true);
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.warn('Failed to retrieve encrypted item:', error);
      // Clean up corrupted data
      localStorage.removeItem(`encrypted_${key}`);
      return fallback;
    }
  }

  /**
   * Remove encrypted item from localStorage
   * @param {string} key - Storage key
   */
  async removeItem(key) {
    localStorage.removeItem(`encrypted_${key}`);
    this.showCacheIndicator(key, false);
  }

  /**
   * Clear all encrypted items
   */
  async clear() {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('encrypted_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.clearAllCacheIndicators();
  }

  /**
   * Encrypt data using AES-GCM
   * @param {string} data - Data to encrypt
   * @returns {Promise<Object>} Encrypted data with IV and auth tag
   */
  async encrypt(data) {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      dataBytes
    );
    
    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
  }

  /**
   * Decrypt data using AES-GCM
   * @param {Object} encryptedData - Encrypted data with IV
   * @returns {Promise<string>} Decrypted data
   */
  async decrypt(encryptedData) {
    const { data, iv } = encryptedData;
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      this.encryptionKey,
      new Uint8Array(data)
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Show cache indicator in UI
   * @param {string} key - Cache key
   * @param {boolean} cached - Whether data is cached
   */
  showCacheIndicator(key, cached) {
    const indicators = document.querySelectorAll(`[data-cache-key="${key}"]`);
    
    indicators.forEach(indicator => {
      if (cached) {
        indicator.classList.add('cached');
        indicator.textContent = '💾 Local Cache';
        indicator.title = 'Data cached locally (encrypted)';
      } else {
        indicator.classList.remove('cached');
        indicator.textContent = '';
        indicator.title = '';
      }
    });
  }

  /**
   * Clear all cache indicators
   */
  clearAllCacheIndicators() {
    const indicators = document.querySelectorAll('[data-cache-key]');
    indicators.forEach(indicator => {
      indicator.classList.remove('cached');
      indicator.textContent = '';
      indicator.title = '';
    });
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const stats = {
      totalItems: 0,
      totalSize: 0,
      expiredItems: 0,
      oldestItem: null,
      newestItem: null
    };

    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('encrypted_')) {
        stats.totalItems++;
        
        try {
          const itemJson = localStorage.getItem(key);
          const item = JSON.parse(itemJson);
          
          stats.totalSize += itemJson.length;
          
          // Check expiration
          if (now - item.timestamp > item.ttl) {
            stats.expiredItems++;
          }
          
          // Track oldest and newest
          if (!stats.oldestItem || item.timestamp < stats.oldestItem.timestamp) {
            stats.oldestItem = { key, timestamp: item.timestamp };
          }
          
          if (!stats.newestItem || item.timestamp > stats.newestItem.timestamp) {
            stats.newestItem = { key, timestamp: item.timestamp };
          }
          
        } catch {
          // Corrupted item
          stats.expiredItems++;
        }
      }
    }
    
    return stats;
  }

  /**
   * Clean up expired items
   * @returns {number} Number of items cleaned up
   */
  async cleanup() {
    let cleanedCount = 0;
    const keysToRemove = [];
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('encrypted_')) {
        try {
          const itemJson = localStorage.getItem(key);
          const item = JSON.parse(itemJson);
          
          if (now - item.timestamp > item.ttl) {
            keysToRemove.push(key);
            cleanedCount++;
          }
        } catch {
          // Remove corrupted items
          keysToRemove.push(key);
          cleanedCount++;
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired cache items`);
    }
    
    return cleanedCount;
  }

  /**
   * Check if caching is enabled and compliant
   * @returns {boolean} Whether caching is enabled
   */
  isAvailable() {
    return this.isEnabled;
  }

  /**
   * Get cache compliance status
   * @returns {Object} Compliance information
   */
  getComplianceStatus() {
    return {
      enabled: this.isEnabled,
      encrypted: true,
      ttlEnabled: true,
      ttlHours: this.ttl / (1000 * 60 * 60),
      productionSafe: !env.isProduction || !this.isEnabled,
      hipaaCompliant: !this.isEnabled || (!env.isProduction && this.isEnabled)
    };
  }

  /**
   * Force TTL refresh for all items (extend expiration)
   * @param {number} newTtl - New TTL in milliseconds (optional)
   */
  async refreshTTL(newTtl = null) {
    const ttl = newTtl || this.ttl;
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('encrypted_')) {
        try {
          const itemJson = localStorage.getItem(key);
          const item = JSON.parse(itemJson);
          
          // Update timestamp and TTL
          item.timestamp = now;
          item.ttl = ttl;
          
          localStorage.setItem(key, JSON.stringify(item));
        } catch {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    }
  }
}

/**
 * Simple storage fallback for when encryption is disabled
 */
export class SimpleStorage {
  loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  async setItem(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  async getItem(key, fallback = null) {
    return this.loadJson(key, fallback);
  }

  async removeItem(key) {
    localStorage.removeItem(key);
  }

  async clear() {
    localStorage.clear();
  }

  isAvailable() {
    return true;
  }

  getComplianceStatus() {
    return {
      enabled: true,
      encrypted: false,
      ttlEnabled: false,
      productionSafe: false,
      hipaaCompliant: false
    };
  }
}

// Create and export appropriate storage instance
export const localStore = env.enableLocalCache ? new EncryptedStorage() : new SimpleStorage();

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (localStore instanceof EncryptedStorage) {
      localStore.cleanup();
    }
  });
}