
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, ViewState } from '../types';
import { useGlobal } from '../store';
import {
  LayoutDashboard, Server, Users, Settings,
  MessageSquare, Calendar, LogOut, Bell,
  Menu, X, Box, PieChart, Puzzle, Check, Trash2, Eye, AlertCircle, CheckCircle, Info, AlertTriangle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${active
        ? 'bg-secondary text-white border border-white/10 shadow-lg'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, currentView, navigate, logout, notifications, markNotificationAsRead, clearNotification, clearAllNotifications } = useGlobal();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-danger" />;
      case 'instance': return <Server className="w-4 h-4 text-primary" />;
      case 'system': return <Settings className="w-4 h-4 text-accent" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background flex text-slate-300">

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-sidebar-gradient fixed h-full z-30">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-gold-gradient transform -rotate-3 opacity-90"></div>
            <div className="absolute inset-0 rounded-lg bg-teal-gradient transform rotate-6 opacity-80 mix-blend-overlay"></div>
            <div className="w-2 h-2 bg-white rounded-full z-10 shadow-sm"></div>
          </div>
          <span className="text-xl font-bold text-slate-100 tracking-tight">PairMind.AI</span>
        </div>

        <div className="flex-1 px-4 space-y-2 py-4">
          <NavItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            active={currentView === 'DASHBOARD'}
            onClick={() => navigate('DASHBOARD')}
          />
          <NavItem
            icon={<Server className="w-5 h-5" />}
            label="Instances"
            active={currentView === 'INSTANCES' || currentView === 'INSTANCE_DETAIL'}
            onClick={() => navigate('INSTANCES')}
          />
          <NavItem
            icon={<PieChart className="w-5 h-5" />}
            label="Analytics"
            active={currentView === 'ANALYTICS'}
            onClick={() => navigate('ANALYTICS')}
          />

          {(user.role === UserRole.TENANT_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Management
              </div>
              <NavItem
                icon={<Users className="w-5 h-5" />}
                label="Users"
                active={currentView === 'USERS'}
                onClick={() => navigate('USERS')}
              />
              <NavItem
                icon={<Calendar className="w-5 h-5" />}
                label="Appointments"
                active={currentView === 'APPOINTMENTS'}
                onClick={() => navigate('APPOINTMENTS')}
              />
            </>
          )}

          {user.role === UserRole.SUPER_ADMIN && (
            <>
              <NavItem
                icon={<Box className="w-5 h-5" />}
                label="Tenants"
                active={currentView === 'TENANTS'}
                onClick={() => navigate('TENANTS')}
              />
              <NavItem
                icon={<Puzzle className="w-5 h-5" />}
                label="MCP Providers"
                active={currentView === 'MCP_MARKETPLACE'}
                onClick={() => navigate('MCP_MARKETPLACE')}
              />
            </>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tools
          </div>
          <NavItem
            icon={<MessageSquare className="w-5 h-5" />}
            label="Chat"
            active={currentView === 'CHAT'}
            onClick={() => navigate('CHAT')}
          />
          <NavItem
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            active={currentView === 'SETTINGS'}
            onClick={() => navigate('SETTINGS')}
          />
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="bg-surface/50 rounded-xl p-3 flex items-center gap-3 border border-white/5 hover:bg-surface transition-colors cursor-pointer group">
            <img src={user.avatar} alt="User" className="w-10 h-10 rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">

        {/* Notification & Status - Floating Top Right */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
          <div className="text-xs text-slate-400 flex items-center bg-surface/50 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-success mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            System Operational
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-white transition-colors bg-surface/50 backdrop-blur-md border border-white/5 rounded-full"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full border-2 border-background text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-slate-500">No notifications</p>
                      <p className="text-xs text-slate-600 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors group ${!notification.read ? 'bg-primary/5' : ''
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-100">{notification.title}</h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-2">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-600">{formatTimestamp(notification.timestamp)}</span>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <button
                                    onClick={() => markNotificationAsRead(notification.id)}
                                    className="text-xs text-primary hover:text-white transition-colors flex items-center gap-1"
                                    title="Mark as read"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => clearNotification(notification.id)}
                                  className="text-xs text-slate-500 hover:text-danger transition-colors"
                                  title="Clear notification"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden absolute top-4 left-4 z-20">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2 bg-surface/50 backdrop-blur-md border border-white/5 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-background border-r border-white/10 p-4">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-white">PairMind.AI</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <nav className="space-y-2">
              <NavItem
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Dashboard"
                active={currentView === 'DASHBOARD'}
                onClick={() => { navigate('DASHBOARD'); setMobileMenuOpen(false); }}
              />
              <NavItem
                icon={<Server className="w-5 h-5" />}
                label="Instances"
                active={currentView === 'INSTANCES'}
                onClick={() => { navigate('INSTANCES'); setMobileMenuOpen(false); }}
              />
              <NavItem
                icon={<MessageSquare className="w-5 h-5" />}
                label="Chat"
                active={currentView === 'CHAT'}
                onClick={() => { navigate('CHAT'); setMobileMenuOpen(false); }}
              />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
