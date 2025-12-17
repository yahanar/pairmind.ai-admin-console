
import { User, UserRole, Instance, Tenant, Appointment, McpProvider, DashboardSettings, AnalyticsData, ChatMessage, SyncResult, InstanceConfiguration, ConfigurationHistoryItem, InstanceUsage, RagDocument, InstanceMonitoringStats, InstanceIntegration, InstancePolicy, PermissionMatrix, PiiRule, InstanceBranding } from './types';
import { MOCK_INSTANCES, MOCK_TENANTS, MOCK_APPOINTMENTS, MOCK_MCP_PROVIDERS, MOCK_USERS } from './constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Storage Keys ---
const KEYS = {
  INSTANCES: 'pm_instances',
  TENANTS: 'pm_tenants',
  USERS: 'pm_users',
  APPOINTMENTS: 'pm_appointments',
  PROVIDERS: 'pm_providers',
  SETTINGS: 'pm_settings',
  CONFIGURATIONS: 'pm_configurations',
  CONFIG_HISTORY: 'pm_config_history',
  RAG_DOCUMENTS: 'pm_rag_documents',
  INTEGRATIONS: 'pm_integrations',
  POLICIES: 'pm_policies',
  BRANDING: 'pm_branding'
};

// --- Storage Helper ---
const Storage = {
  get: <T>(key: string, defaultVal: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Initialize DB with Mock Data if empty
if (!localStorage.getItem(KEYS.INSTANCES)) Storage.set(KEYS.INSTANCES, MOCK_INSTANCES);
if (!localStorage.getItem(KEYS.TENANTS)) Storage.set(KEYS.TENANTS, MOCK_TENANTS);
if (!localStorage.getItem(KEYS.USERS)) {
  // Enrich mock users with profile data before saving
  const enrichedUsers = MOCK_USERS.map(u => ({
    ...u,
    phone: u.role === UserRole.SUPER_ADMIN ? '+1 (555) 123-4567' : '',
    username: u.email.split('@')[0].replace('.', '_'),
    language: 'English (United States)'
  }));
  Storage.set(KEYS.USERS, enrichedUsers);
}
if (!localStorage.getItem(KEYS.APPOINTMENTS)) Storage.set(KEYS.APPOINTMENTS, MOCK_APPOINTMENTS);
if (!localStorage.getItem(KEYS.PROVIDERS)) Storage.set(KEYS.PROVIDERS, MOCK_MCP_PROVIDERS);

// --- Services ---

export const AuthService = {
  login: async (email: string, password?: string): Promise<User> => {
    await delay(800);
    // Find in storage or fall back to mock logic
    const users = Storage.get<User[]>(KEYS.USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existing) {
       sessionStorage.setItem('pm_session', JSON.stringify(existing));
       return existing;
    }

    // Fallback for demo if not in storage (auto-create for unregistered emails in demo)
    let role = UserRole.USER;
    if (email.toLowerCase().includes('super')) role = UserRole.SUPER_ADMIN;
    else if (email.toLowerCase().includes('admin')) role = UserRole.TENANT_ADMIN;
    
    const user: User = {
      id: `u-${Date.now().toString(36)}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: email,
      role: role,
      avatar: `https://ui-avatars.com/api/?name=${email}&background=random&color=fff`,
      mfaEnabled: role === UserRole.SUPER_ADMIN,
      phone: '',
      username: email.split('@')[0].replace('.', '_').toLowerCase(),
      language: 'English (United States)'
    };
    
    // Store session
    sessionStorage.setItem('pm_session', JSON.stringify(user));
    return user;
  },
  
  verifyMfa: async (code: string): Promise<boolean> => {
    await delay(600);
    return code.length === 6; 
  },

  logout: async () => {
    await delay(300);
    sessionStorage.removeItem('pm_session');
  },

  getCurrentUser: (): User | null => {
    try {
      const stored = sessionStorage.getItem('pm_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
};

export const InstanceService = {
  getAll: async (): Promise<Instance[]> => {
    await delay(600);
    return Storage.get(KEYS.INSTANCES, MOCK_INSTANCES);
  },
  save: async (instances: Instance[]) => {
    Storage.set(KEYS.INSTANCES, instances);
  },
  updateStatus: async (id: string, status: any) => {
    await delay(300);
    const list = Storage.get<Instance[]>(KEYS.INSTANCES, []);
    const updated = list.map(i => i.id === id ? { ...i, status } : i);
    Storage.set(KEYS.INSTANCES, updated);
    return updated;
  },
  getLogs: async (id: string): Promise<string[]> => {
    await delay(800);
    const levels = ['INFO', 'INFO', 'INFO', 'WARN', 'DEBUG', 'ERROR'];
    const components = ['AuthService', 'VectorDB', 'LLMConnector', 'RateLimiter', 'ApiGateway'];
    const messages = [
      'Processed request successfully.',
      'Token validation passed.',
      'Retrying connection to upstream...',
      'Cache miss for key: user_profile_v2',
      'Rate limit quota approaching (80%).',
      'Health check ping received.',
      'Updating vector embeddings for doc_id_992.',
      'Connection pool size: 45/100'
    ];
    
    // Generate realistic looking logs
    const logs = Array.from({ length: 50 }, (_, i) => {
      const date = new Date(Date.now() - i * 1000 * (Math.random() * 10)).toISOString();
      const level = levels[Math.floor(Math.random() * levels.length)];
      const comp = components[Math.floor(Math.random() * components.length)];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const latency = Math.floor(Math.random() * 200) + 20;
      
      let logLine = `[${date}] [${level}] [${comp}] ${msg}`;
      if (level === 'INFO') logLine += ` Latency: ${latency}ms`;
      return logLine;
    });
    
    return logs.reverse();
  },
  clearCache: async (id: string): Promise<void> => {
    await delay(1500);
  },
  // --- Configuration Methods ---
  getConfiguration: async (id: string): Promise<InstanceConfiguration> => {
    await delay(400);
    const allConfigs = Storage.get<Record<string, InstanceConfiguration>>(KEYS.CONFIGURATIONS, {});
    return allConfigs[id] || {
      piiAnonymization: true,
      vectorStore: false,
      promptCaching: true,
      maxReactIterations: 5
    };
  },
  updateConfiguration: async (id: string, config: InstanceConfiguration, author: string): Promise<InstanceConfiguration> => {
    await delay(800);
    const allConfigs = Storage.get<Record<string, InstanceConfiguration>>(KEYS.CONFIGURATIONS, {});
    
    // Save current as history before updating
    const history = Storage.get<Record<string, ConfigurationHistoryItem[]>>(KEYS.CONFIG_HISTORY, {});
    const instanceHistory = history[id] || [];
    
    const newHistoryItem: ConfigurationHistoryItem = {
      id: `hist-${Date.now()}`,
      versionId: `v${instanceHistory.length + 1}.${Date.now().toString().slice(-4)}`,
      config: { ...config }, // Store copy
      timestamp: new Date().toISOString(),
      author
    };
    
    history[id] = [newHistoryItem, ...instanceHistory];
    Storage.set(KEYS.CONFIG_HISTORY, history);

    // Update current config
    allConfigs[id] = config;
    Storage.set(KEYS.CONFIGURATIONS, allConfigs);
    
    return config;
  },
  getConfigurationHistory: async (id: string): Promise<ConfigurationHistoryItem[]> => {
    await delay(500);
    const history = Storage.get<Record<string, ConfigurationHistoryItem[]>>(KEYS.CONFIG_HISTORY, {});
    return history[id] || [];
  },
  rollbackConfiguration: async (id: string, versionId: string, author: string): Promise<InstanceConfiguration> => {
    await delay(1000);
    const history = Storage.get<Record<string, ConfigurationHistoryItem[]>>(KEYS.CONFIG_HISTORY, {});
    const instanceHistory = history[id] || [];
    const targetVersion = instanceHistory.find(h => h.versionId === versionId);
    
    if (!targetVersion) throw new Error("Version not found");

    // Apply rollback as a new update to preserve forward history
    return InstanceService.updateConfiguration(id, targetVersion.config, `${author} (Rollback to ${versionId})`);
  },
  getUsageStatistics: async (id: string): Promise<InstanceUsage> => {
    await delay(600);
    // Mock usage data based on typical values
    return {
      queriesUsed: 12450,
      queriesLimit: 50000,
      concurrentUsers: 45,
      concurrentUsersLimit: 100,
      ragDocuments: 120,
      ragDocumentsLimit: 500
    };
  },
  downloadOperatorBootstrap: async (id: string): Promise<void> => {
    await delay(1200); // Simulate generation
    // In a real app, this would return a blob/url
    return;
  },
  downloadMcpBinary: async (id: string): Promise<void> => {
    await delay(1500); // Simulate build
    return;
  },
  getMonitoringStats: async (id: string): Promise<InstanceMonitoringStats> => {
    await delay(300); // Fast response for monitoring
    const now = new Date().toISOString();
    
    // Simulate data fluctuations
    const cpu = Math.floor(Math.random() * 60) + 10;
    const mem = Math.floor(Math.random() * 1500) + 500;
    const disk = Math.floor(Math.random() * 5000) + 2000;
    const sessions = Math.floor(Math.random() * 30) + 5;
    
    return {
      status: Math.random() > 0.1 ? 'Healthy' : 'Degraded',
      lastUpdated: now,
      cpu: cpu,
      memoryUsed: mem,
      memoryTotal: 4096,
      diskUsed: disk,
      diskTotal: 10000,
      activeSessions: sessions,
      queriesToday: Math.floor(Math.random() * 10000) + 500,
      cacheHitRate: Math.floor(Math.random() * 15) + 80,
      avgResponseTime: Math.floor(Math.random() * 150) + 30,
      integrations: [
        { id: '1', name: 'PostgreSQL DB', status: 'Healthy', successRate: 99.9, lastCall: now },
        { id: '2', name: 'Stripe API', status: 'Healthy', successRate: 98.5, lastCall: now },
        { id: '3', name: 'SendGrid', status: Math.random() > 0.8 ? 'Error' : 'Healthy', successRate: 92.0, lastCall: now, lastError: 'Timeout' },
        { id: '4', name: 'Google Search', status: 'Healthy', successRate: 100, lastCall: now },
      ],
      quotas: {
        queriesMonth: 15400 + Math.floor(Math.random() * 100),
        queriesMonthLimit: 50000,
        storageUsed: 2300 + Math.floor(Math.random() * 50),
        storageLimit: 10000
      }
    };
  },
  getIntegrations: async (id: string): Promise<InstanceIntegration[]> => {
    await delay(600);
    const allIntegrations = Storage.get<Record<string, InstanceIntegration[]>>(KEYS.INTEGRATIONS, {});
    
    // Return existing or initialize defaults
    if (allIntegrations[id]) {
      return allIntegrations[id];
    }

    const defaults: InstanceIntegration[] = [
      { id: 'erpnext', name: 'ERPNext', identifier: 'erpnext-connector', status: 'Disabled', icon: 'layers' },
      { id: 'erpnext-mcp', name: 'ERPNext MCP', identifier: 'remote_mcp.erpnext', status: 'Disabled', icon: 'cpu' },
      { id: 'front-desk', name: 'Front Desk', identifier: 'front-desk-agent', status: 'Disabled', icon: 'briefcase' },
      { id: 'jira', name: 'Jira', identifier: 'atlassian-jira', status: 'Disabled', icon: 'trello' },
      { id: 'odoo', name: 'Odoo', identifier: 'odoo-connector', status: 'Disabled', icon: 'package' },
    ];
    
    // Save defaults
    allIntegrations[id] = defaults;
    Storage.set(KEYS.INTEGRATIONS, allIntegrations);
    
    return defaults;
  },
  saveIntegrations: async (id: string, integrations: InstanceIntegration[]): Promise<void> => {
    await delay(800);
    const allIntegrations = Storage.get<Record<string, InstanceIntegration[]>>(KEYS.INTEGRATIONS, {});
    allIntegrations[id] = integrations;
    Storage.set(KEYS.INTEGRATIONS, allIntegrations);
  },
  getPolicies: async (id: string): Promise<InstancePolicy> => {
    await delay(500);
    const allPolicies = Storage.get<Record<string, InstancePolicy>>(KEYS.POLICIES, {});
    
    if (allPolicies[id]) {
      return allPolicies[id];
    }

    const defaults: InstancePolicy = {
      permissions: [
        { integration: 'Jira', read: true, create: true, update: false, delete: false },
        { integration: 'ERPNext', read: true, create: false, update: false, delete: false },
        { integration: 'Odoo', read: true, create: true, update: true, delete: false },
        { integration: 'Frontdesk', read: true, create: true, update: true, delete: true },
      ],
      rateLimits: {
        queriesPerHour: 1000,
        queriesPerDay: 10000,
      },
      piiRules: [
        { id: '1', name: 'ssn', pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b', replacement: '[SSN-REDACTED]', enabled: true },
        { id: '2', name: 'email', pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', replacement: '[EMAIL-REDACTED]', enabled: true },
        { id: '3', name: 'credit_card', pattern: '\\b(?:\\d{4}-){3}\\d{4}\\b', replacement: '[CARD-REDACTED]', enabled: false },
      ]
    };

    allPolicies[id] = defaults;
    Storage.set(KEYS.POLICIES, allPolicies);
    return defaults;
  },
  savePolicies: async (id: string, policy: InstancePolicy): Promise<void> => {
    await delay(800);
    const allPolicies = Storage.get<Record<string, InstancePolicy>>(KEYS.POLICIES, {});
    allPolicies[id] = policy;
    Storage.set(KEYS.POLICIES, allPolicies);
  },
  getBranding: async (id: string): Promise<InstanceBranding> => {
    await delay(400);
    const allBranding = Storage.get<Record<string, InstanceBranding>>(KEYS.BRANDING, {});
    return allBranding[id] || {
      instanceId: id,
      widgetName: 'Sidekick Assistant',
      logoUrl: '',
      allowedOrigins: ['*'],
      primaryColor: '#6366F1', // Indigo-500
      secondaryColor: '#4F46E5', // Indigo-600
      welcomeMessage: 'Hello! How can I help you today?',
      inputPlaceholder: 'Type your message...',
      quickSuggestions: ['Pricing', 'Features', 'Contact Support'],
      position: 'bottom-right',
      theme: 'light'
    };
  },
  saveBranding: async (id: string, branding: InstanceBranding): Promise<void> => {
    await delay(600);
    const allBranding = Storage.get<Record<string, InstanceBranding>>(KEYS.BRANDING, {});
    allBranding[id] = branding;
    Storage.set(KEYS.BRANDING, allBranding);
  }
};

export const RagService = {
  getDocuments: async (instanceId: string): Promise<RagDocument[]> => {
    await delay(500);
    const allDocs = Storage.get<RagDocument[]>(KEYS.RAG_DOCUMENTS, []);
    return allDocs.filter(d => d.instanceId === instanceId);
  },
  uploadDocument: async (instanceId: string, file: File): Promise<RagDocument> => {
    await delay(1500); // Upload simulation
    const allDocs = Storage.get<RagDocument[]>(KEYS.RAG_DOCUMENTS, []);
    
    const newDoc: RagDocument = {
      id: `doc-${Date.now()}`,
      instanceId,
      filename: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'Processing'
    };
    
    Storage.set(KEYS.RAG_DOCUMENTS, [newDoc, ...allDocs]);
    
    // Simulate background processing (Processing -> Indexed)
    setTimeout(() => {
       const currentDocs = Storage.get<RagDocument[]>(KEYS.RAG_DOCUMENTS, []);
       const updated = currentDocs.map(d => d.id === newDoc.id ? { ...d, status: 'Indexed' } : d);
       Storage.set(KEYS.RAG_DOCUMENTS, updated);
    }, 5000);

    return newDoc;
  },
  deleteDocument: async (id: string) => {
    await delay(400);
    const allDocs = Storage.get<RagDocument[]>(KEYS.RAG_DOCUMENTS, []);
    Storage.set(KEYS.RAG_DOCUMENTS, allDocs.filter(d => d.id !== id));
  }
};

export const TenantService = {
  getAll: async (): Promise<Tenant[]> => {
    await delay(500);
    return Storage.get(KEYS.TENANTS, MOCK_TENANTS);
  },
  save: async (tenants: Tenant[]) => {
    await delay(400);
    Storage.set(KEYS.TENANTS, tenants);
  },
  rotateApiKey: async (tenantId: string): Promise<{ publishableKey: string; secretKey: string }> => {
    await delay(1500); 
    const randomString = (length: number) => Array.from({length}, () => Math.floor(Math.random() * 36).toString(36)).join('');
    return {
      publishableKey: `pk_live_${randomString(24)}`,
      secretKey: `sk_live_${randomString(32)}`
    };
  }
};

export const UserService = {
  getAll: async (): Promise<User[]> => {
    await delay(400);
    return Storage.get(KEYS.USERS, MOCK_USERS);
  },
  create: async (user: User) => {
    await delay(500);
    const users = Storage.get<User[]>(KEYS.USERS, []);
    const updated = [user, ...users];
    Storage.set(KEYS.USERS, updated);
    return user;
  },
  update: async (user: User) => {
    await delay(400);
    const users = Storage.get<User[]>(KEYS.USERS, []);
    const updated = users.map(u => u.id === user.id ? user : u);
    Storage.set(KEYS.USERS, updated);
    // Also update session if it matches
    const currentSession = AuthService.getCurrentUser();
    if (currentSession && currentSession.id === user.id) {
       sessionStorage.setItem('pm_session', JSON.stringify(user));
    }
    return user;
  },
  delete: async (id: string) => {
    await delay(400);
    const users = Storage.get<User[]>(KEYS.USERS, []);
    Storage.set(KEYS.USERS, users.filter(u => u.id !== id));
  }
};

export const AppointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    await delay(400);
    return Storage.get(KEYS.APPOINTMENTS, MOCK_APPOINTMENTS);
  },
  save: async (appointments: Appointment[]) => {
    Storage.set(KEYS.APPOINTMENTS, appointments);
  },
  syncCalendar: async (provider: 'google' | 'outlook'): Promise<SyncResult> => {
    await delay(2500); // Simulate network sync time
    const rand = Math.random();
    
    // Simulate different outcomes
    if (rand > 0.85) {
      throw new Error('OAuth token expired. Please reconnect your account.');
    } else if (rand > 0.6) {
      return { 
        status: 'partial', 
        count: Math.floor(Math.random() * 3) + 1,
        message: 'Some events could not be imported due to conflicts.' 
      };
    } else {
      return { 
        status: 'success', 
        count: Math.floor(Math.random() * 10) + 2,
        message: 'All upcoming events synced successfully.' 
      };
    }
  }
};

export const McpService = {
  getAll: async (): Promise<McpProvider[]> => {
    await delay(400);
    return Storage.get(KEYS.PROVIDERS, MOCK_MCP_PROVIDERS);
  },
  update: async (provider: McpProvider) => {
    await delay(300);
    const list = Storage.get<McpProvider[]>(KEYS.PROVIDERS, []);
    const updated = list.map(p => p.id === provider.id ? provider : p);
    Storage.set(KEYS.PROVIDERS, updated);
  },
  install: async (id: string): Promise<McpProvider> => {
    await delay(2500); // Simulate webhook provisioning time
    const list = Storage.get<McpProvider[]>(KEYS.PROVIDERS, []);
    const provider = list.find(p => p.id === id);
    if (!provider) throw new Error('Provider not found');

    const updated: McpProvider = { 
      ...provider, 
      status: 'Installed', 
      installedVersion: provider.version,
      isConfigured: false 
    };
    
    const updatedList = list.map(p => p.id === id ? updated : p);
    Storage.set(KEYS.PROVIDERS, updatedList);
    return updated;
  },
  performUpdate: async (id: string): Promise<McpProvider> => {
    await delay(3000); // Simulate update process
    const list = Storage.get<McpProvider[]>(KEYS.PROVIDERS, []);
    const provider = list.find(p => p.id === id);
    if (!provider) throw new Error('Provider not found');

    const updated: McpProvider = { 
      ...provider, 
      status: 'Installed', 
      installedVersion: provider.version
    };
    
    const updatedList = list.map(p => p.id === id ? updated : p);
    Storage.set(KEYS.PROVIDERS, updatedList);
    return updated;
  },
  configure: async (id: string, configData: any): Promise<McpProvider> => {
    await delay(1000); // Simulate saving config
    const list = Storage.get<McpProvider[]>(KEYS.PROVIDERS, []);
    const provider = list.find(p => p.id === id);
    if (!provider) throw new Error('Provider not found');

    const updated: McpProvider = { 
      ...provider, 
      isConfigured: true 
    };
    
    const updatedList = list.map(p => p.id === id ? updated : p);
    Storage.set(KEYS.PROVIDERS, updatedList);
    return updated;
  },
  uninstall: async (id: string): Promise<McpProvider> => {
    await delay(1500);
    const list = Storage.get<McpProvider[]>(KEYS.PROVIDERS, []);
    const provider = list.find(p => p.id === id);
    if (!provider) throw new Error('Provider not found');

    const updated: McpProvider = { 
      ...provider, 
      status: 'Available', 
      installedVersion: undefined,
      isConfigured: false
    };
    
    const updatedList = list.map(p => p.id === id ? updated : p);
    Storage.set(KEYS.PROVIDERS, updatedList);
    return updated;
  }
};

export const SettingsService = {
  getSettings: async (userId: string): Promise<DashboardSettings> => {
    // User-scoped settings using a composite key
    const key = `${KEYS.SETTINGS}_${userId}`;
    const defaults: DashboardSettings = {
      theme: 'dark',
      density: 'comfortable',
      landingView: 'Home dashboard',
      widgets: { usage: true, announcements: true, actions: false }
    };
    
    return Storage.get(key, defaults);
  },
  saveSettings: async (userId: string, settings: DashboardSettings) => {
    const key = `${KEYS.SETTINGS}_${userId}`;
    Storage.set(key, settings);
  }
};

export const AccessControlService = {
  canDeleteTenant: (user: User) => user.role === UserRole.SUPER_ADMIN,
  canManageUsers: (user: User) => user.role === UserRole.SUPER_ADMIN || user.role === UserRole.TENANT_ADMIN,
  canRotateKeys: (user: User) => user.role === UserRole.SUPER_ADMIN || user.role === UserRole.TENANT_ADMIN,
  canManageBilling: (user: User) => user.role === UserRole.SUPER_ADMIN || user.role === UserRole.TENANT_ADMIN,
  canEditConfiguration: (user: User) => user.role === UserRole.SUPER_ADMIN || user.role === UserRole.TENANT_ADMIN,
};

export const AnalyticsService = {
  getData: async (range: '7D' | '30D' | '90D'): Promise<AnalyticsData[]> => {
    await delay(600);
    const days = range === '7D' ? 7 : range === '30D' ? 30 : 90;
    const data: AnalyticsData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = range === '7D' 
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const baseQueries = 2000;
      const randomVar = Math.random() * 1500;
      const queries = Math.floor(baseQueries + randomVar);
      
      data.push({
        name: dayName,
        queries: queries,
        latency: Math.floor(120 + Math.random() * 200),
        cost: Math.floor(queries * 0.05)
      });
    }
    return data;
  }
};

export const ChatService = {
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    await delay(400);
    return [
       { id: 'm1', sender: 'user', text: 'Hi, I was looking at the enterprise plan pricing but I have a few questions about volume discounts.', timestamp: '10:42 AM' },
       { id: 'm2', sender: 'ai', text: 'Hello! I\'d be happy to help you with that. Our enterprise volume discounts start at 50k requests/month. Would you like to see the full breakdown?', timestamp: '10:43 AM' },
       { id: 'm3', sender: 'user', text: 'Yes, please send that over. Also, do you support SSO?', timestamp: '10:44 AM' }
    ];
  },
  
  sendMessage: async (roomId: string, text: string, attachment?: File): Promise<ChatMessage> => {
    await delay(300); // Simulate network send
    return {
      id: `m-${Date.now()}`,
      sender: 'system',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachment ? { 
        name: attachment.name, 
        type: attachment.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(attachment)
      } : undefined
    };
  },

  subscribe: (roomId: string, onMessage: (msg: ChatMessage) => void, onTyping: (typing: boolean) => void) => {
    const timeout = setTimeout(() => {
        onTyping(true);
        setTimeout(() => {
          onTyping(false);
          const responses = [
            "That sounds great, thanks!",
            "Could you clarify the SLA for that?",
            "I'm also interested in the API limits.",
            "Let me check with my team.",
            "Thanks for the info.",
            "Do you offer annual billing options?"
          ];
          onMessage({
            id: `m-${Date.now()}`,
            sender: 'user', // The visitor
            text: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 2000);
    }, 5000 + Math.random() * 5000);

    return () => clearTimeout(timeout);
  }
};
