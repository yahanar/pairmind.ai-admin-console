
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Instance, Tenant, Appointment, McpProvider, ViewState, DashboardSettings, InstanceStatus, Notification, NotificationType } from './types';
import { AuthService, InstanceService, TenantService, AppointmentService, McpService, SettingsService } from './services';

interface GlobalContextType {
  // Auth & Session
  user: User | null;
  login: (user: User) => void;
  logout: () => void;

  // Navigation
  currentView: ViewState;
  navigate: (view: ViewState) => void;

  // Data
  instances: Instance[];
  tenants: Tenant[];
  appointments: Appointment[];
  mcpProviders: McpProvider[];
  selectedInstance: Instance | null;
  selectInstance: (instance: Instance | null) => void;
  refreshData: () => Promise<void>;

  // Data Mutators
  setInstances: (instances: Instance[]) => Promise<void>;
  setTenants: (tenants: Tenant[]) => Promise<void>;
  setAppointments: (appointments: Appointment[]) => Promise<void>;
  setMcpProviders: (providers: McpProvider[]) => Promise<void>;
  updateUser: (user: User) => void;

  // Settings
  settings: DashboardSettings | null;
  updateSettings: (settings: DashboardSettings) => Promise<void>;

  // Feedback
  isLoadingData: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth
  const [user, setUser] = useState<User | null>(null);

  // Navigation
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  // Data
  const [instances, setInstancesState] = useState<Instance[]>([]);
  const [tenants, setTenantsState] = useState<Tenant[]>([]);
  const [appointments, setAppointmentsState] = useState<Appointment[]>([]);
  const [mcpProviders, setMcpProvidersState] = useState<McpProvider[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [settings, setSettingsState] = useState<DashboardSettings | null>(null);

  // UI State
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: NotificationType.SUCCESS,
      title: 'Instance Deployed',
      message: 'Your AI Assistant instance "Customer Support Bot" is now online.',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      read: false,
    },
    {
      id: '2',
      type: NotificationType.WARNING,
      title: 'High Usage Alert',
      message: 'Instance "Sales Bot" has reached 85% of monthly query limit.',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: NotificationType.INFO,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Dec 20, 2025 from 2:00 AM - 4:00 AM UTC.',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      read: true,
    },
    {
      id: '4',
      type: NotificationType.INSTANCE,
      title: 'Configuration Updated',
      message: 'RAG settings updated for "Marketing Assistant".',
      timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
      read: true,
    },
  ]);

  // --- Theme Helper ---
  const applyTheme = useCallback((theme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    const isLight = theme === 'light' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: light)').matches);

    if (isLight) {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, []);

  // Watch for OS theme changes if Auto is selected
  useEffect(() => {
    if (settings?.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleChange = () => applyTheme('auto');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings?.theme, applyTheme]);

  // --- Auth & Init ---
  useEffect(() => {
    const session = AuthService.getCurrentUser();
    if (session) {
      setUser(session);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshData();
      SettingsService.getSettings(user.id).then(s => {
        setSettingsState(s);
        if (s && s.theme) {
          applyTheme(s.theme);
        }

        // Handle Landing View Redirect
        // Mapping friendly names to ViewState
        let targetView: ViewState = 'DASHBOARD';
        if (s.landingView === 'Instances list') targetView = 'INSTANCES';
        else if (s.landingView === 'Analytics') targetView = 'ANALYTICS';

        // Only redirect if we are at default state (Login or just initialized)
        // Since this runs on user change (login), it should work.
        // However, we need to be careful not to override navigation if refreshing.
        // For simplicity in this mock, we enforce it on login.
        setCurrentView(targetView);
      });
    }
  }, [user, applyTheme]);

  // --- Actions ---

  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [inst, ten, appt, mcp] = await Promise.all([
        InstanceService.getAll(),
        TenantService.getAll(),
        AppointmentService.getAll(),
        McpService.getAll()
      ]);
      setInstancesState(inst);
      setTenantsState(ten);
      setAppointmentsState(appt);
      setMcpProvidersState(mcp);
    } catch (e) {
      console.error("Failed to load data", e);
      notify("Failed to load data", "error");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // Navigation is handled in useEffect[user] based on settings
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setSelectedInstance(null);
    setCurrentView('LOGIN');
  };

  const navigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== 'INSTANCE_DETAIL') {
      setSelectedInstance(null);
    }
  };

  const selectInstance = (instance: Instance | null) => {
    if (instance) {
      // Ensure we have the freshest data from state
      const fresh = instances.find(i => i.id === instance.id) || instance;
      setSelectedInstance(fresh);
      navigate('INSTANCE_DETAIL');
    } else {
      setSelectedInstance(null);
    }
  };

  // --- Data Mutators ---

  const setInstances = async (newData: Instance[]) => {
    setInstancesState(newData);
    await InstanceService.save(newData);
    if (selectedInstance) {
      const updatedSelected = newData.find(i => i.id === selectedInstance.id);
      if (updatedSelected) setSelectedInstance(updatedSelected);
    }
  };

  const setTenants = async (newData: Tenant[]) => {
    setTenantsState(newData);
    await TenantService.save(newData);
  };

  const setAppointments = async (newData: Appointment[]) => {
    setAppointmentsState(newData);
    await AppointmentService.save(newData);
  };

  const setMcpProviders = async (newData: McpProvider[]) => {
    setMcpProvidersState(newData);
  };

  const updateSettings = async (newSettings: DashboardSettings) => {
    if (!user) return;
    setSettingsState(newSettings);
    await SettingsService.saveSettings(user.id, newSettings);
    applyTheme(newSettings.theme);
  };

  const updateUser = (userData: User) => {
    setUser(prev => prev ? { ...prev, ...userData } : userData);
  };

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Notification Functions ---
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <GlobalContext.Provider value={{
      user, login, logout,
      currentView, navigate,
      instances, tenants, appointments, mcpProviders, selectedInstance, selectInstance, refreshData,
      setInstances, setTenants, setAppointments, setMcpProviders, updateUser,
      settings, updateSettings,
      isLoadingData, toast, notify,
      notifications, addNotification, markNotificationAsRead, clearNotification, clearAllNotifications
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};
