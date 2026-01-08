/**
 * 🏥 CRC SSOT EMR - Integrated Persistence System
 * Simple, reliable data persistence for healthcare workflows
 * Created: September 28, 2025
 */

// 💾 Simple Persistence Helper
window.CrcPersistence = {
  apiUrl: 'http://localhost:3001/api',
  
  // Save any data with automatic fallback
  async save(type, data) {
    const id = data.id || this.generateId();
    const timestamp = new Date().toISOString();
    const saveData = { ...data, id, lastSaved: timestamp };
    
    // Always save locally first
    this.saveLocal(type, id, saveData);
    console.log(`💾 ${type} saved locally: ${id}`);
    
    // Try server save
    try {
      const response = await fetch(`${this.apiUrl}/${type}s`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });
      
      const result = await response.json();
      if (result.success) {
        saveData.synced = true;
        saveData.method = result.method;
        this.saveLocal(type, id, saveData);
        console.log(`✅ ${type} synced to server: ${result.method}`);
        return { success: true, data: saveData, synced: true };
      }
    } catch (error) {
      console.warn(`⚠️ Server save failed, kept locally: ${error.message}`);
    }
    
    // Mark as needing sync
    saveData.synced = false;
    saveData.needsSync = true;
    this.saveLocal(type, id, saveData);
    
    return { 
      success: true, 
      data: saveData, 
      synced: false,
      warning: 'Saved locally - will sync when server available'
    };
  },
  
  // Load data by ID
  load(type, id) {
    return this.loadLocal(type, id);
  },
  
  // Load all data of type
  loadAll(type) {
    const items = [];
    const prefix = `crc_${type}_`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          items.push(data);
        } catch (error) {
          console.error(`❌ Error loading ${key}:`, error);
        }
      }
    }
    
    return items.sort((a, b) => new Date(b.lastSaved || 0) - new Date(a.lastSaved || 0));
  },
  
  // Local storage operations
  saveLocal(type, id, data) {
    localStorage.setItem(`crc_${type}_${id}`, JSON.stringify(data));
  },
  
  loadLocal(type, id) {
    const data = localStorage.getItem(`crc_${type}_${id}`);
    return data ? JSON.parse(data) : null;
  },
  
  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  },
  
  // Get persistence status
  getStatus() {
    const patients = this.loadAll('patient').length;
    const assessments = this.loadAll('assessment').length;
    const placements = this.loadAll('placement').length;
    const needsSync = this.loadAll('patient').filter(p => p.needsSync).length +
                      this.loadAll('assessment').filter(a => a.needsSync).length +
                      this.loadAll('placement').filter(p => p.needsSync).length;
    
    return {
      localData: { patients, assessments, placements },
      needsSync,
      isOnline: navigator.onLine
    };
  },
  
  // Sync pending data
  async syncPending() {
    let synced = 0;
    let failed = 0;
    
    const types = ['patient', 'assessment', 'placement'];
    
    for (const type of types) {
      const items = this.loadAll(type).filter(item => item.needsSync);
      
      for (const item of items) {
        try {
          const result = await this.save(type, item);
          if (result.synced) {
            synced++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
          console.error(`❌ Sync failed for ${type} ${item.id}:`, error);
        }
      }
    }
    
    console.log(`🔄 Sync complete: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  }
};

// 🚀 Auto-sync on network restore
window.addEventListener('online', () => {
  console.log('🌐 Network restored - syncing data...');
  window.CrcPersistence.syncPending();
});

// 📊 Status display helper
window.CrcPersistence.showStatus = function() {
  const status = this.getStatus();
  const statusHtml = `
    <div style="background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; font-family: monospace; font-size: 12px;">
      <strong>💾 CRC SSOT Persistence Status:</strong><br>
      📂 Local Data: ${status.localData.patients} patients, ${status.localData.assessments} assessments, ${status.localData.placements} placements<br>
      🔄 Needs Sync: ${status.needsSync} items<br>
      🌐 Online: ${status.isOnline ? '✅' : '❌'}<br>
      <button onclick="window.CrcPersistence.syncPending()" style="margin-top: 5px;">🔄 Sync Now</button>
    </div>
  `;
  
  // Add to page if status div exists
  const statusDiv = document.getElementById('persistenceStatus');
  if (statusDiv) {
    statusDiv.innerHTML = statusHtml;
  } else {
    // Create status div
    const div = document.createElement('div');
    div.id = 'persistenceStatus';
    div.innerHTML = statusHtml;
    document.body.appendChild(div);
  }
};

console.log('💾 CRC SSOT Persistence System Ready');
console.log('📋 Usage: window.CrcPersistence.save("patient", patientData)');
console.log('📊 Status: window.CrcPersistence.showStatus()');