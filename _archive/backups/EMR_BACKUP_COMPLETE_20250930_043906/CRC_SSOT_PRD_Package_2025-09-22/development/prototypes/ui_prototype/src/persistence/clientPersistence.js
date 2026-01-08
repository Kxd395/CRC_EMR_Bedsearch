/**
 * 🏥 CRC SSOT EMR - Client-Side Persistence Manager
 * Handles all client-side data persistence and synchronization
 * Created: September 28, 2025
 */



export class ClientPersistenceManager {
  constructor(config = {}) {
    this.apiBaseUrl = config.apiBaseUrl || 'http://localhost:3001/api';
    this.localStoragePrefix = config.storagePrefix || 'crc_ssot_';
    this.syncIntervalMs = config.syncInterval || 30000; // 30 seconds
    this.maxRetries = config.maxRetries || 3;
    this.retryDelayMs = config.retryDelay || 5000; // 5 seconds
    
    this.isOnline = navigator.onLine;
    this.pendingSync = new Set();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Auto-sync interval
    this.startAutoSync();
    
    console.log('🔄 Client Persistence Manager initialized');
  }

  /**
   * 💾 Save Patient Data with Auto-Persistence
   */
  async savePatient(patientData) {
    const timestamp = new Date().toISOString();
    const patientId = patientData.id || this.generateId();
    const dataWithId = { ...patientData, id: patientId, lastSaved: timestamp };

    try {
      // Always save to localStorage first for immediate persistence
      this.saveToLocalStorage('patient', patientId, dataWithId);
      console.log(`💾 Patient ${patientId} saved locally`);

      if (this.isOnline) {
        // Try to save to server
        const response = await this.makeRequest('POST', '/patients', dataWithId);
        
        if (response.success) {
          // Mark as synced
          dataWithId.synced = true;
          dataWithId.syncedAt = timestamp;
          dataWithId.method = response.method;
          this.saveToLocalStorage('patient', patientId, dataWithId);
          this.pendingSync.delete(`patient_${patientId}`);
          
          return {
            success: true,
            data: dataWithId,
            method: response.method,
            synced: true
          };
        } else {
          throw new Error(response.error || 'Server save failed');
        }
      } else {
        // Mark as pending sync
        dataWithId.synced = false;
        dataWithId.pendingSync = true;
        this.saveToLocalStorage('patient', patientId, dataWithId);
        this.pendingSync.add(`patient_${patientId}`);
        
        return {
          success: true,
          data: dataWithId,
          method: 'offline',
          synced: false,
          warning: 'Saved locally - will sync when online'
        };
      }
      
    } catch (error) {
      console.error('❌ Error saving patient:', error);
      
      // Still save locally even if server fails
      dataWithId.synced = false;
      dataWithId.pendingSync = true;
      dataWithId.error = error.message;
      this.saveToLocalStorage('patient', patientId, dataWithId);
      this.pendingSync.add(`patient_${patientId}`);
      
      return {
        success: true,
        data: dataWithId,
        method: 'fallback',
        synced: false,
        warning: `Saved locally only: ${error.message}`
      };
    }
  }

  /**
   * 📝 Save Assessment Data
   */
  async saveAssessment(assessmentData) {
    const timestamp = new Date().toISOString();
    const assessmentId = assessmentData.id || this.generateId();
    const dataWithId = { ...assessmentData, id: assessmentId, lastSaved: timestamp };

    try {
      this.saveToLocalStorage('assessment', assessmentId, dataWithId);
      console.log(`📝 Assessment ${assessmentId} saved locally`);

      if (this.isOnline) {
        const response = await this.makeRequest('POST', '/assessments', dataWithId);
        
        if (response.success) {
          dataWithId.synced = true;
          dataWithId.syncedAt = timestamp;
          this.saveToLocalStorage('assessment', assessmentId, dataWithId);
          this.pendingSync.delete(`assessment_${assessmentId}`);
          
          return {
            success: true,
            data: dataWithId,
            method: response.method,
            synced: true
          };
        } else {
          throw new Error(response.error || 'Server save failed');
        }
      } else {
        dataWithId.synced = false;
        dataWithId.pendingSync = true;
        this.saveToLocalStorage('assessment', assessmentId, dataWithId);
        this.pendingSync.add(`assessment_${assessmentId}`);
        
        return {
          success: true,
          data: dataWithId,
          method: 'offline',
          synced: false,
          warning: 'Saved locally - will sync when online'
        };
      }
      
    } catch (error) {
      console.error('❌ Error saving assessment:', error);
      
      dataWithId.synced = false;
      dataWithId.pendingSync = true;
      dataWithId.error = error.message;
      this.saveToLocalStorage('assessment', assessmentId, dataWithId);
      this.pendingSync.add(`assessment_${assessmentId}`);
      
      return {
        success: true,
        data: dataWithId,
        method: 'fallback',
        synced: false,
        warning: `Saved locally only: ${error.message}`
      };
    }
  }

  /**
   * 🏥 Save Facility Placement Data
   */
  async savePlacement(placementData) {
    const timestamp = new Date().toISOString();
    const placementId = placementData.id || this.generateId();
    const dataWithId = { ...placementData, id: placementId, lastSaved: timestamp };

    try {
      this.saveToLocalStorage('placement', placementId, dataWithId);
      console.log(`🏥 Placement ${placementId} saved locally`);

      if (this.isOnline) {
        const response = await this.makeRequest('POST', '/placements', dataWithId);
        
        if (response.success) {
          dataWithId.synced = true;
          dataWithId.syncedAt = timestamp;
          this.saveToLocalStorage('placement', placementId, dataWithId);
          this.pendingSync.delete(`placement_${placementId}`);
          
          return {
            success: true,
            data: dataWithId,
            method: response.method,
            synced: true
          };
        }
      } else {
        dataWithId.synced = false;
        dataWithId.pendingSync = true;
        this.saveToLocalStorage('placement', placementId, dataWithId);
        this.pendingSync.add(`placement_${placementId}`);
        
        return {
          success: true,
          data: dataWithId,
          method: 'offline',
          synced: false,
          warning: 'Saved locally - will sync when online'
        };
      }
      
    } catch (error) {
      console.error('❌ Error saving placement:', error);
      
      dataWithId.synced = false;
      dataWithId.pendingSync = true;
      dataWithId.error = error.message;
      this.saveToLocalStorage('placement', placementId, dataWithId);
      this.pendingSync.add(`placement_${placementId}`);
      
      return {
        success: true,
        data: dataWithId,
        method: 'fallback',
        synced: false,
        warning: `Saved locally only: ${error.message}`
      };
    }
  }

  /**
   * 🔄 Synchronize Pending Data
   */
  async syncPendingData() {
    if (!this.isOnline || this.pendingSync.size === 0) {
      return { synced: 0, failed: 0 };
    }

    console.log(`🔄 Syncing ${this.pendingSync.size} pending items...`);
    
    const results = { synced: 0, failed: 0 };
    const pendingItems = Array.from(this.pendingSync);
    
    for (const item of pendingItems) {
      try {
        const [type, id] = item.split('_');
        const data = this.loadFromLocalStorage(type, id);
        
        if (data && data.pendingSync) {
          let response;
          switch (type) {
            case 'patient':
              response = await this.makeRequest('POST', '/patients', data);
              break;
            case 'assessment':
              response = await this.makeRequest('POST', '/assessments', data);
              break;
            case 'placement':
              response = await this.makeRequest('POST', '/placements', data);
              break;
          }
          
          if (response && response.success) {
            // Mark as synced
            data.synced = true;
            data.syncedAt = new Date().toISOString();
            data.pendingSync = false;
            delete data.error;
            
            this.saveToLocalStorage(type, id, data);
            this.pendingSync.delete(item);
            results.synced++;
            
            console.log(`✅ Synced ${type} ${id}`);
          } else {
            results.failed++;
            console.error(`❌ Failed to sync ${type} ${id}:`, response?.error);
          }
        }
      } catch (error) {
        results.failed++;
        console.error(`❌ Error syncing ${item}:`, error.message);
      }
    }
    
    console.log(`🔄 Sync completed: ${results.synced} synced, ${results.failed} failed`);
    return results;
  }

  /**
   * 📱 Local Storage Operations
   */
  saveToLocalStorage(type, id, data) {
    const key = `${this.localStoragePrefix}${type}_${id}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  loadFromLocalStorage(type, id) {
    const key = `${this.localStoragePrefix}${type}_${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  getAllFromLocalStorage(type) {
    const prefix = `${this.localStoragePrefix}${type}_`;
    const items = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          items.push(data);
        } catch (error) {
          console.error(`❌ Error parsing ${key}:`, error);
        }
      }
    }
    
    return items.sort((a, b) => new Date(b.lastSaved || 0) - new Date(a.lastSaved || 0));
  }

  /**
   * 🌐 Network Operations
   */
  async makeRequest(method, endpoint, data = null) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Healthcare-Context': 'CRC-SSOT'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (response.ok) {
          return result;
        } else {
          throw new Error(result.error || `HTTP ${response.status}`);
        }
      } catch (error) {
        retries++;
        if (retries >= this.maxRetries) {
          throw error;
        }
        
        console.warn(`⚠️ Request failed (attempt ${retries}/${this.maxRetries}), retrying...`);
        await this.delay(this.retryDelayMs);
      }
    }
  }

  /**
   * 📊 Status and Management
   */
  getPersistenceStatus() {
    const patientCount = this.getAllFromLocalStorage('patient').length;
    const assessmentCount = this.getAllFromLocalStorage('assessment').length;
    const placementCount = this.getAllFromLocalStorage('placement').length;
    
    return {
      isOnline: this.isOnline,
      localData: {
        patients: patientCount,
        assessments: assessmentCount,
        placements: placementCount
      },
      pendingSync: this.pendingSync.size,
      pendingItems: Array.from(this.pendingSync)
    };
  }

  async getServerHealth() {
    try {
      const response = await this.makeRequest('GET', '/../health');
      return response;
    } catch (error) {
      return { 
        status: 'unreachable', 
        error: error.message,
        database: 'unknown',
        fallback: 'unknown'
      };
    }
  }

  /**
   * 🔧 Auto-Sync Management
   */
  startAutoSync() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingSync.size > 0) {
        this.syncPendingData();
      }
    }, this.syncIntervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * 🛠️ Utility Methods
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearLocalData(type = null) {
    if (type) {
      const prefix = `${this.localStoragePrefix}${type}_`;
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } else {
      // Clear all CRC SSOT data
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.localStoragePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
}

// 🚀 Auto-initialize for browser
if (typeof window !== 'undefined') {
  window.CrcSsotPersistence = new ClientPersistenceManager();
  console.log('✅ CRC SSOT Client Persistence ready');
}

export default ClientPersistenceManager;