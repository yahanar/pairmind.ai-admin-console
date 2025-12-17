
export enum UserRole {
  USER = 'User',
  TENANT_ADMIN = 'Tenant Admin',
  SUPER_ADMIN = 'Super Admin',
}

export enum InstanceStatus {
  // Legacy/Existing
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  BOOTSTRAPPING = 'Bootstrapping',
  PROVISIONED = 'Provisioned',

  // Lifecycle States
  DRAFT = 'Draft',
  PENDING_APPROVAL = 'Pending Approval',
  PENDING_REGISTRATION = 'Pending Registration',
  APPROVED = 'Approved',
  ACTIVE = 'Active', // Synonymous with Online often
  INACTIVE = 'Inactive',
  PROVISIONING = 'Provisioning',
  ERROR = 'Error',
  SUSPENDED = 'Suspended',
  EXPIRING = 'Expiring',
}

export enum Tier {
  STARTER = 'Starter',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise',
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INSTANCE = 'instance',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  mfaEnabled?: boolean;
  phone?: string;
  username?: string;
  language?: string;
}

export interface Instance {
  id: string;
  name: string;
  tier: Tier;
  status: InstanceStatus;
  region: string;
  version: string;
  uptime: string;
  created: string;
  health: number; // 0-100
  licenseKey?: string;
  lastSeen?: string;      // New field
  licenseExpiry?: string; // New field
}

export interface InstanceConfiguration {
  piiAnonymization: boolean;
  vectorStore: boolean;
  promptCaching: boolean;
  maxReactIterations: number;
}

export interface ConfigurationHistoryItem {
  id: string;
  versionId: string;
  config: InstanceConfiguration;
  timestamp: string;
  author: string;
}

export interface InstanceUsage {
  queriesUsed: number;
  queriesLimit: number;
  concurrentUsers: number;
  concurrentUsersLimit: number;
  ragDocuments: number;
  ragDocumentsLimit: number;
}

export interface AnalyticsData {
  name: string;
  queries: number;
  latency: number;
  cost: number;
}

export interface Appointment {
  id: string;
  customerName: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  assignedBot: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system'; // 'user' is visitor, 'ai' is bot, 'system' is agent/admin
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: 'image' | 'file';
    url?: string;
  };
}

export interface ChatRoom {
  id: string;
  user: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface Tenant {
  id: string;
  name: string;
  plan: string;
  users: number;
  status: 'Active' | 'Suspended';
}

export interface McpProvider {
  id: string;
  name: string;
  description: string;
  category: 'Database' | 'Productivity' | 'Payment' | 'Search';
  status: 'Installed' | 'Available' | 'Update Available';
  icon: string;
  version: string; // Latest available version
  installedVersion?: string; // Currently installed version
  isConfigured?: boolean;
}

export interface DashboardSettings {
  theme: 'light' | 'dark' | 'auto';
  density: 'comfortable' | 'compact';
  landingView: string;
  widgets: {
    usage: boolean;
    announcements: boolean;
    actions: boolean;
  };
}

export interface SyncResult {
  status: 'success' | 'partial' | 'failure';
  count: number;
  message?: string;
}

export interface RagDocument {
  id: string;
  instanceId: string;
  filename: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'Processing' | 'Indexed' | 'Failed' | 'Queued';
}

export interface IntegrationHealth {
  id: string;
  name: string;
  status: 'Healthy' | 'Degraded' | 'Error' | 'Inactive';
  successRate: number;
  lastCall: string;
  lastError?: string;
}

export interface InstanceMonitoringStats {
  status: 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown';
  lastUpdated: string;
  cpu: number; // percentage
  memoryUsed: number; // MB
  memoryTotal: number; // MB
  diskUsed: number; // MB
  diskTotal: number; // MB
  activeSessions: number;
  queriesToday: number;
  cacheHitRate: number; // percentage
  avgResponseTime: number; // ms
  integrations: IntegrationHealth[];
  quotas: {
    queriesMonth: number;
    queriesMonthLimit: number;
    storageUsed: number; // MB
    storageLimit: number; // MB
  }
}

export interface InstanceIntegration {
  id: string;
  name: string;
  identifier?: string; // e.g. remote_mcp.erpnext
  status: 'Enabled' | 'Disabled';
  icon: string;
  config?: Record<string, string>;
  lastSync?: string;
}

export interface PermissionMatrix {
  integration: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface PiiRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  enabled: boolean;
}

export interface InstancePolicy {
  permissions: PermissionMatrix[];
  rateLimits: {
    queriesPerHour: number;
    queriesPerDay: number;
  };
  piiRules: PiiRule[];
}

export interface InstanceBranding {
  instanceId: string;
  widgetName: string;
  logoUrl: string;
  allowedOrigins: string[];
  primaryColor: string;
  secondaryColor: string;
  welcomeMessage: string;
  inputPlaceholder: string;
  quickSuggestions: string[];
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'light' | 'dark';
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'INSTANCES' | 'INSTANCE_DETAIL' | 'ANALYTICS' | 'SETTINGS' | 'USERS' | 'CHAT' | 'APPOINTMENTS' | 'TENANTS' | 'MCP_MARKETPLACE';
