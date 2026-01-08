// Chrome MCP Server for EMR Testing
// Provides Model Context Protocol server for Chrome browser automation

import { WebSocket, WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import CDP from 'chrome-remote-interface';

class ChromeMCPServer {
  constructor(port = 3001) {
    this.port = port;
    this.wss = null;
    this.chromeProcess = null;
    this.cdpClient = null;
    this.connections = new Set();
  }

  async start() {
    console.log('🚀 Starting Chrome MCP Server...');
    
    // Start Chrome with remote debugging
    await this.startChrome();
    
    // Connect to Chrome DevTools Protocol
    await this.connectCDP();
    
    // Start WebSocket server
    this.startWebSocketServer();
    
    console.log(`✅ Chrome MCP Server running on port ${this.port}`);
    console.log(`🔗 Chrome DevTools: http://localhost:9222`);
  }

  async startChrome() {
    console.log('📱 Launching Chrome with remote debugging...');
    
    const chromeArgs = [
      '--remote-debugging-port=9222',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--enable-automation',
      '--password-store=basic',
      '--use-mock-keychain'
    ];

    // Try different Chrome executable paths for macOS
    const chromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      'google-chrome',
      'chrome'
    ];

    let chromePath = null;
    for (const path of chromePaths) {
      try {
        await import('fs').then(fs => fs.promises.access(path));
        chromePath = path;
        break;
      } catch (e) {
        // Path doesn't exist, try next
      }
    }

    if (!chromePath) {
      // Fallback: use system's default chrome command
      chromePath = chromePaths[0]; // Default macOS Chrome path
    }

    console.log(`Using Chrome at: ${chromePath}`);

    this.chromeProcess = spawn(chromePath, chromeArgs, {
      stdio: 'pipe',
      detached: false
    });

    this.chromeProcess.on('error', (error) => {
      console.error('❌ Chrome process error:', error);
    });

    // Wait for Chrome to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  async connectCDP() {
    console.log('🔌 Connecting to Chrome DevTools Protocol...');
    
    try {
      this.cdpClient = await CDP();
      
      // Enable necessary domains
      await Promise.all([
        this.cdpClient.Page.enable(),
        this.cdpClient.Runtime.enable(),
        this.cdpClient.Network.enable(),
        this.cdpClient.Security.enable(),
        this.cdpClient.Performance.enable()
      ]);
      
      console.log('✅ Connected to Chrome CDP');
    } catch (error) {
      console.error('❌ Failed to connect to CDP:', error);
      throw error;
    }
  }

  startWebSocketServer() {
    this.wss = new WebSocketServer({ port: this.port });
    
    this.wss.on('connection', (ws) => {
      console.log('🔗 New MCP client connected');
      this.connections.add(ws);
      
      // Handle MCP messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          const response = await this.handleMCPMessage(message);
          ws.send(JSON.stringify(response));
        } catch (error) {
          console.error('❌ Error handling MCP message:', error);
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal error',
              data: error.message
            },
            id: null
          }));
        }
      });
      
      ws.on('close', () => {
        console.log('📱 MCP client disconnected');
        this.connections.delete(ws);
      });
    });
  }

  async handleMCPMessage(message) {
    const { method, params, id } = message;
    
    console.log(`📨 Handling MCP method: ${method}`);
    
    switch (method) {
      case 'navigate':
        return await this.navigate(params.url, id);
      
      case 'click':
        return await this.click(params.selector, id);
      
      case 'type':
        return await this.type(params.selector, params.text, id);
      
      case 'screenshot':
        return await this.screenshot(id);
      
      case 'evaluate':
        return await this.evaluate(params.expression, id);
      
      case 'waitForSelector':
        return await this.waitForSelector(params.selector, id);
      
      case 'getHealthcareData':
        return await this.getHealthcareData(id);
      
      case 'validateHIPAA':
        return await this.validateHIPAA(id);
      
      case 'testEMRWorkflow':
        return await this.testEMRWorkflow(params.workflow, id);
      
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  async navigate(url, id) {
    await this.cdpClient.Page.navigate({ url });
    await this.cdpClient.Page.loadEventFired();
    
    return {
      jsonrpc: '2.0',
      result: { success: true, url },
      id
    };
  }

  async click(selector, id) {
    const result = await this.cdpClient.Runtime.evaluate({
      expression: `
        const element = document.querySelector('${selector}');
        if (element) {
          element.click();
          true;
        } else {
          false;
        }
      `
    });
    
    return {
      jsonrpc: '2.0',
      result: { success: result.result.value, selector },
      id
    };
  }

  async type(selector, text, id) {
    const result = await this.cdpClient.Runtime.evaluate({
      expression: `
        const element = document.querySelector('${selector}');
        if (element) {
          element.focus();
          element.value = '${text}';
          element.dispatchEvent(new Event('input', { bubbles: true }));
          true;
        } else {
          false;
        }
      `
    });
    
    return {
      jsonrpc: '2.0',
      result: { success: result.result.value, selector, text },
      id
    };
  }

  async screenshot(id) {
    const { data } = await this.cdpClient.Page.captureScreenshot({ format: 'png' });
    
    return {
      jsonrpc: '2.0',
      result: { screenshot: data },
      id
    };
  }

  async evaluate(expression, id) {
    const result = await this.cdpClient.Runtime.evaluate({ expression });
    
    return {
      jsonrpc: '2.0',
      result: { value: result.result.value },
      id
    };
  }

  async waitForSelector(selector, id) {
    const result = await this.cdpClient.Runtime.evaluate({
      expression: `
        new Promise((resolve) => {
          const checkElement = () => {
            const element = document.querySelector('${selector}');
            if (element) {
              resolve(true);
            } else {
              setTimeout(checkElement, 100);
            }
          };
          checkElement();
        })
      `,
      awaitPromise: true
    });
    
    return {
      jsonrpc: '2.0',
      result: { found: result.result.value, selector },
      id
    };
  }

  async getHealthcareData(id) {
    const result = await this.cdpClient.Runtime.evaluate({
      expression: `
        // Extract healthcare-specific data from the EMR interface
        const data = {
          patients: Array.from(document.querySelectorAll('[data-patient-id]')).map(el => ({
            id: el.getAttribute('data-patient-id'),
            name: el.querySelector('.patient-name')?.textContent?.trim(),
            mrn: el.querySelector('.patient-mrn')?.textContent?.trim(),
            status: el.querySelector('.patient-status')?.textContent?.trim()
          })),
          facilities: Array.from(document.querySelectorAll('[data-facility-id]')).map(el => ({
            id: el.getAttribute('data-facility-id'),
            name: el.querySelector('.facility-name')?.textContent?.trim(),
            type: el.querySelector('.facility-type')?.textContent?.trim(),
            capacity: el.querySelector('.facility-capacity')?.textContent?.trim()
          })),
          currentUser: {
            role: document.querySelector('[data-user-role]')?.getAttribute('data-user-role'),
            permissions: document.querySelector('[data-user-permissions]')?.getAttribute('data-user-permissions')?.split(',')
          },
          activeWorkflows: Array.from(document.querySelectorAll('.workflow-item')).map(el => ({
            type: el.getAttribute('data-workflow-type'),
            status: el.querySelector('.workflow-status')?.textContent?.trim(),
            patient: el.querySelector('.workflow-patient')?.textContent?.trim()
          }))
        };
        data;
      `
    });
    
    return {
      jsonrpc: '2.0',
      result: { healthcareData: result.result.value },
      id
    };
  }

  async validateHIPAA(id) {
    const result = await this.cdpClient.Runtime.evaluate({
      expression: `
        // HIPAA Compliance Validation
        const hipaaChecks = {
          encryption: {
            https: location.protocol === 'https:',
            localStorage: typeof Storage !== 'undefined' && localStorage.getItem('test-hipaa-encryption'),
            sessionStorage: typeof sessionStorage !== 'undefined'
          },
          dataMinimization: {
            visiblePHI: document.querySelectorAll('[data-phi]').length,
            maskedFields: document.querySelectorAll('[data-masked]').length,
            redactedContent: document.querySelectorAll('[data-redacted]').length
          },
          accessControl: {
            loginRequired: document.querySelector('.login-form, .auth-required') !== null,
            roleBasedAccess: document.querySelector('[data-rbac]') !== null,
            sessionTimeout: document.querySelector('[data-session-timeout]') !== null
          },
          auditTrail: {
            auditLog: document.querySelector('[data-audit-log]') !== null,
            userActivity: document.querySelector('[data-user-activity]') !== null,
            dataAccess: document.querySelector('[data-data-access]') !== null
          },
          consentManagement: {
            consentForms: document.querySelectorAll('[data-consent]').length,
            optOutOptions: document.querySelectorAll('[data-opt-out]').length,
            privacyNotices: document.querySelectorAll('[data-privacy-notice]').length
          }
        };
        hipaaChecks;
      `
    });
    
    return {
      jsonrpc: '2.0',
      result: { hipaaCompliance: result.result.value },
      id
    };
  }

  async testEMRWorkflow(workflow, id) {
    const workflowTests = {
      'patient-search': async () => {
        await this.cdpClient.Runtime.evaluate({
          expression: `
            // Test patient search workflow
            const searchInput = document.querySelector('#patient-search, [data-test="patient-search"]');
            if (searchInput) {
              searchInput.focus();
              searchInput.value = 'Test Patient';
              searchInput.dispatchEvent(new Event('input', { bubbles: true }));
              
              // Wait for search results
              setTimeout(() => {
                const results = document.querySelectorAll('.patient-result, [data-test="patient-result"]');
                window.testResult = { found: results.length > 0, count: results.length };
              }, 1000);
            }
          `
        });
      },
      
      'facility-finder': async () => {
        await this.cdpClient.Runtime.evaluate({
          expression: `
            // Test facility finder workflow
            const facilityButton = document.querySelector('[data-test="facility-finder"], .facility-finder-btn');
            if (facilityButton) {
              facilityButton.click();
              
              setTimeout(() => {
                const facilityList = document.querySelector('.facility-list, [data-test="facility-list"]');
                const searchFilters = document.querySelectorAll('.facility-filter, [data-test="facility-filter"]');
                window.testResult = { 
                  facilityListVisible: !!facilityList,
                  filtersAvailable: searchFilters.length > 0,
                  filterCount: searchFilters.length
                };
              }, 1000);
            }
          `
        });
      },
      
      'placement-coordination': async () => {
        await this.cdpClient.Runtime.evaluate({
          expression: `
            // Test placement coordination workflow
            const placementTab = document.querySelector('[data-test="placement-tab"], .placement-coordination');
            if (placementTab) {
              placementTab.click();
              
              setTimeout(() => {
                const placementForm = document.querySelector('.placement-form, [data-test="placement-form"]');
                const statusUpdates = document.querySelectorAll('.status-update, [data-test="status-update"]');
                window.testResult = {
                  formVisible: !!placementForm,
                  statusUpdatesAvailable: statusUpdates.length > 0,
                  workflowActive: document.querySelector('.workflow-active') !== null
                };
              }, 1000);
            }
          `
        });
      }
    };
    
    if (workflowTests[workflow]) {
      await workflowTests[workflow]();
      
      // Wait for test completion and get results
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await this.cdpClient.Runtime.evaluate({
        expression: 'window.testResult || { error: "Test result not available" }'
      });
      
      return {
        jsonrpc: '2.0',
        result: { workflow, testResult: result.result.value },
        id
      };
    } else {
      throw new Error(`Unknown workflow: ${workflow}`);
    }
  }

  async stop() {
    console.log('🛑 Stopping Chrome MCP Server...');
    
    // Close CDP connection
    if (this.cdpClient) {
      await this.cdpClient.close();
    }
    
    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }
    
    // Kill Chrome process
    if (this.chromeProcess) {
      this.chromeProcess.kill('SIGTERM');
    }
    
    console.log('✅ Chrome MCP Server stopped');
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ChromeMCPServer();
  
  server.start().catch(error => {
    console.error('❌ Failed to start Chrome MCP Server:', error);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
}

export default ChromeMCPServer;