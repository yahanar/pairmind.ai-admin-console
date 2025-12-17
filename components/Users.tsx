
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { User, UserRole } from '../types';
import { UserService } from '../services';
import { useGlobal } from '../store';
import { 
  UserPlus, MoreHorizontal, Shield, Mail, Check, X, 
  Trash2, Edit, Power, Lock, Search, Filter, AlertTriangle, Save, ChevronDown, Loader2,
  ChevronLeft, ChevronRight, Eye, Bell, Copy, Download
} from 'lucide-react';

// Extended interface for UI state management
interface UserUI extends User {
  status?: 'Active' | 'Suspended';
  lastActive?: string;
}

const ITEMS_PER_PAGE = 10;

// --- Custom Filter Dropdown Component ---
interface FilterOption {
  label: string;
  value: string;
}

const FilterDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}> = ({ value, onChange, options, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || value;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 bg-input border border-white/10 rounded-xl py-2 pl-4 pr-3 text-sm text-slate-300 focus:outline-none focus:border-primary/50 hover:bg-white/5 transition-all w-full min-w-[160px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-full min-w-[160px] bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 animate-fade-in">
           <div className="py-1">
            {options.map((option) => (
                <button
                key={option.value}
                onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center justify-between transition-colors ${
                    value === option.value
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                >
                {option.label}
                {value === option.value && <Check className="w-3.5 h-3.5" />}
                </button>
            ))}
           </div>
        </div>
      )}
    </div>
  );
};

// --- Reusable User Modal (Create/Edit) ---
interface UserFormModalProps {
  initialData?: UserUI | null;
  onClose: () => void;
  onSave: (user: UserUI) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ initialData, onClose, onSave }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<Partial<UserUI>>(
    initialData || {
      name: '',
      email: '',
      role: UserRole.USER,
      status: 'Active',
      avatar: `https://picsum.photos/seed/${Math.random()}/100/100`
    }
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.email) return;
    
    const user: UserUI = {
      id: initialData?.id || `u-${Date.now()}`,
      name: formData.name!,
      email: formData.email!,
      role: formData.role || UserRole.USER,
      status: formData.status || 'Active',
      lastActive: initialData?.lastActive || 'Just now',
      avatar: formData.avatar || 'https://picsum.photos/100/100'
    };
    onSave(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
      <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100">{isEditing ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-primary/50 placeholder:text-slate-600 transition-all"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-primary/50 placeholder:text-slate-600 transition-all"
              placeholder="user@company.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value={UserRole.USER}>User</option>
                <option value={UserRole.TENANT_ADMIN}>Tenant Admin</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Suspended'})}
                className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> {isEditing ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Delete Confirmation Modal ---
interface DeleteModalProps {
  userName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ userName, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
    <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
      <div className="flex items-center gap-4 mb-4 text-danger">
        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Remove User?</h3>
      </div>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        Are you sure you want to remove <strong>{userName}</strong>? This user will immediately lose access to the platform.
      </p>
      <div className="flex gap-3 justify-end">
        <button 
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-danger hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg"
        >
          Remove User
        </button>
      </div>
    </div>
  </div>
);

// --- View User Profile Modal ---
interface ViewUserProfileModalProps {
  user: UserUI;
  onClose: () => void;
  onEdit: () => void;
}

const ViewUserProfileModal: React.FC<ViewUserProfileModalProps> = ({ user, onClose, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
    <div className="relative bg-surface border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-primary/50" />
          <div>
            <h3 className="text-xl font-bold text-slate-100">{user.name}</h3>
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3" /> {user.email}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-input p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Role</div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              user.role === 'super-admin' ? 'bg-primary/10 text-primary border-primary/20' :
              user.role === 'tenant-admin' ? 'bg-accent/10 text-accent border-accent/20' :
              'bg-slate-700/50 text-slate-400 border-slate-600/50'
            }`}>
              <Shield className="w-3 h-3" />
              {user.role}
            </span>
          </div>

          <div className="bg-input p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Status</div>
            <span className={`text-xs font-medium px-2 py-1 rounded border ${
              user.status === 'Active' 
              ? 'text-success border-success/20 bg-success/5' 
              : 'text-slate-400 border-slate-600 bg-white/5'
            }`}>
              {user.status}
            </span>
          </div>
        </div>

        <div className="bg-input p-4 rounded-xl border border-white/5">
          <div className="text-xs text-slate-500 uppercase font-bold mb-2">Last Active</div>
          <div className="text-sm text-slate-300 font-mono">{user.lastActive}</div>
        </div>

        {user.phone && (
          <div className="bg-input p-4 rounded-xl border border-white/5">
            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Phone Number</div>
            <div className="text-sm text-slate-300">{user.phone}</div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-xs text-slate-500 uppercase font-bold mb-3">Recent Activity</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
              <span>Logged in from 192.168.1.1</span>
              <span className="text-slate-600 ml-auto">2h ago</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <span>Updated profile settings</span>
              <span className="text-slate-600 ml-auto">1d ago</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
              <span>Created new instance</span>
              <span className="text-slate-600 ml-auto">3d ago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Close</button>
        <button 
          onClick={() => { onEdit(); onClose(); }}
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon flex items-center gap-2 transition-all"
        >
          <Edit className="w-4 h-4" /> Edit Profile
        </button>
      </div>
    </div>
  </div>
);

// --- Send Notification Modal ---
interface SendNotificationModalProps {
  user: UserUI;
  onClose: () => void;
  onSend: (subject: string, message: string, method: string) => void;
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ user, onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState('email');

  const handleSend = () => {
    if (!subject || !message) return;
    onSend(subject, message, method);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
      <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Send Notification
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
          <div>
            <div className="text-sm font-bold text-slate-200">{user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Delivery Method</label>
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="email">Email</option>
              <option value="in-app">In-App Notification</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Subject</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 placeholder:text-slate-600"
              placeholder="Important Update"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 placeholder:text-slate-600 resize-none"
              placeholder="Type your message here..."
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
          <button 
            onClick={handleSend}
            disabled={!subject || !message}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bell className="w-4 h-4" /> Send Notification
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const Users: React.FC = () => {
  const { notify } = useGlobal();
  const [users, setUsers] = useState<UserUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const calcMenuPosition = (rect: DOMRect) => {
    const MENU_WIDTH = 192; // w-48
    const PADDING = 8;
    const top = rect.bottom + 4; // small gap below trigger
    let left = rect.right - MENU_WIDTH; // align menu's right edge to trigger's right
    if (left < PADDING) left = PADDING;
    if (left + MENU_WIDTH > window.innerWidth - PADDING) left = window.innerWidth - PADDING - MENU_WIDTH;
    return { top, left };
  };
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals & Actions
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserUI | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserUI | null>(null);
  const [viewingUser, setViewingUser] = useState<UserUI | null>(null);
  const [notifyingUser, setNotifyingUser] = useState<UserUI | null>(null);

  // Load Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetched = await UserService.getAll();
        // Enrich with status/activity if missing from base type
        const enriched: UserUI[] = fetched.map((u, i) => ({
          ...u,
          status: ((u as any).status || 'Active') as 'Active' | 'Suspended',
          lastActive: ((u as any).lastActive || 'Just now') as string
        }));
        setUsers(enriched);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-trigger') && !target.closest('.user-menu')) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll to close menu
  useEffect(() => {
    const handleScroll = () => {
      if (openMenuId) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [openMenuId]);

  const filteredUsers = users.filter(u => {
    const matchesText = u.name.toLowerCase().includes(filterText.toLowerCase()) || 
                        u.email.toLowerCase().includes(filterText.toLowerCase());
    
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    
    return matchesText && matchesRole && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, roleFilter, statusFilter]);

  // Handlers
  const handleCreate = async (newUser: UserUI) => {
    try {
      await UserService.create(newUser);
      setUsers([newUser, ...users]);
      setShowCreateModal(false);
      notify('User added successfully.');
    } catch (e) {
      notify('Failed to create user.', 'error');
    }
  };

  const handleUpdate = async (updatedUser: UserUI) => {
    try {
      await UserService.update(updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setEditingUser(null);
      notify('User updated successfully.');
    } catch (e) {
      notify('Failed to update user.', 'error');
    }
  };

  const handleDelete = async () => {
    if (userToDelete) {
      try {
        await UserService.delete(userToDelete.id);
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
        notify('User removed successfully.');
      } catch (e) {
        notify('Failed to remove user.', 'error');
      }
    }
  };

  const handleToggleStatus = async (user: UserUI) => {
    const newStatus: 'Active' | 'Suspended' = user.status === 'Active' ? 'Suspended' : 'Active';
    const updatedUser: UserUI = { ...user, status: newStatus };
    try {
      await UserService.update(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      setOpenMenuId(null);
      notify(`User ${newStatus === 'Active' ? 'activated' : 'suspended'}.`);
    } catch (e) {
      notify('Failed to update status.', 'error');
    }
  };

  const handleResetPassword = (userId: string) => {
    setOpenMenuId(null);
    notify('Password reset email sent.', 'success');
  };

  const handleDuplicateUser = (user: UserUI) => {
    const duplicatedUser: UserUI = {
      ...user,
      id: `u-${Date.now()}`,
      name: `${user.name} (Copy)`,
      email: `copy.${user.email}`,
      status: 'Active'
    };
    setUsers([duplicatedUser, ...users]);
    setOpenMenuId(null);
    notify('User duplicated successfully.', 'success');
  };

  const handleExportUser = (user: UserUI) => {
    const dataStr = JSON.stringify(user, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-${user.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setOpenMenuId(null);
    notify('User data exported.', 'success');
  };

  const handleSendNotification = (subject: string, message: string, method: string) => {
    notify(`Notification sent via ${method}.`, 'success');
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'bg-primary/10 text-primary border-primary/20';
      case UserRole.TENANT_ADMIN: return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in min-h-[500px]">
      
      {/* Modals */}
      {showCreateModal && <UserFormModal onClose={() => setShowCreateModal(false)} onSave={handleCreate} />}
      {editingUser && <UserFormModal initialData={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdate} />}
      {userToDelete && <DeleteConfirmationModal userName={userToDelete.name} onClose={() => setUserToDelete(null)} onConfirm={handleDelete} />}
      {viewingUser && <ViewUserProfileModal user={viewingUser} onClose={() => setViewingUser(null)} onEdit={() => setEditingUser(viewingUser)} />}
      {notifyingUser && <SendNotificationModal user={notifyingUser} onClose={() => setNotifyingUser(null)} onSend={handleSendNotification} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">User Management</h2>
          <p className="text-slate-400 text-sm">Control access, roles, and permissions for your team.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl shadow-neon flex items-center gap-2 transition-all font-medium text-sm"
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
               type="text" 
               placeholder="Search users by name or email..." 
               value={filterText}
               onChange={(e) => setFilterText(e.target.value)}
               className="w-full bg-input border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary/50 placeholder:text-slate-600 transition-all"
            />
         </div>
         <div className="flex gap-2">
            <FilterDropdown 
               value={roleFilter}
               onChange={setRoleFilter}
               options={[
                  { label: 'All Roles', value: 'All' },
                  { label: 'Super Admin', value: UserRole.SUPER_ADMIN },
                  { label: 'Tenant Admin', value: UserRole.TENANT_ADMIN },
                  { label: 'User', value: UserRole.USER },
               ]}
            />

            <FilterDropdown 
               value={statusFilter}
               onChange={setStatusFilter}
               options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Active', value: 'Active' },
                  { label: 'Suspended', value: 'Suspended' },
               ]}
            />
         </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-white/5 rounded-2xl shadow-sm flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
             <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 uppercase text-xs tracking-wider border-b border-white/5">
                  <th className="p-4 font-semibold">User Profile</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Last Active</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                           <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/10 group-hover:border-primary/50 transition-colors" />
                           <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${user.status === 'Active' ? 'bg-success' : 'bg-slate-500'}`}></div>
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{user.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleBadgeStyle(user.role)}`}>
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${
                         user.status === 'Active' 
                         ? 'text-success border-success/20 bg-success/5' 
                         : 'text-slate-400 border-slate-600 bg-white/5'
                      }`}>
                         {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs font-mono">
                       {user.lastActive}
                    </td>
                    <td className="p-4 text-right">
                      <div className="relative inline-block text-left">
                         <button 
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             if (openMenuId === user.id) {
                               setOpenMenuId(null);
                               setMenuPosition(null);
                             } else {
                               const rect = e.currentTarget.getBoundingClientRect();
                               setMenuPosition(calcMenuPosition(rect));
                               setOpenMenuId(user.id);
                             }
                           }}
                           className={`user-menu-trigger p-2 rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50 ${
                             openMenuId === user.id 
                               ? 'bg-white/10 text-white shadow-neon' 
                               : 'text-slate-400 hover:text-white hover:bg-white/5'
                           }`}
                         >
                           <MoreHorizontal className="w-5 h-5" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {totalPages > 1 && (
             <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-surface rounded-b-2xl mt-auto">
                <div className="text-sm text-slate-400">
                   Showing <span className="font-medium text-slate-200">{startIndex + 1}</span> to <span className="font-medium text-slate-200">{Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)}</span> of <span className="font-medium text-slate-200">{filteredUsers.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                   <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                      <ChevronLeft className="w-4 h-4" />
                   </button>
                   <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                         <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                               currentPage === page
                                  ? 'bg-primary text-white shadow-neon'
                                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                         >
                            {page}
                         </button>
                      ))}
                   </div>
                   <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                      <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          )}
          </>
        )}
      </div>

      {/* Fixed Position Menu Portal */}
      {openMenuId && menuPosition && ReactDOM.createPortal(
        <div 
          className="user-menu fixed w-48 bg-[#0F2E45] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[9999] animate-fade-in origin-top-right"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
            {(() => {
              const user = users.find(u => u.id === openMenuId);
              if (!user) return null;
              const isActive = user.status === 'Active';
              return (
                <>
                  {/* View Section */}
                  <button 
                    onClick={() => { setViewingUser(user); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </button>
                  <button 
                    onClick={() => { setEditingUser(user); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                  
                  {/* Security Section */}
                  <div className="border-t border-white/5 my-1"></div>
                  <button 
                    onClick={() => handleResetPassword(user.id)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5" /> Reset Password
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(user)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-2 hover:bg-white/5 ${
                      isActive ? 'text-warning' : 'text-success'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" /> {isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  {/* Admin Actions */}
                  <div className="border-t border-white/5 my-1"></div>
                  <button 
                    onClick={() => { setNotifyingUser(user); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5" /> Send Notification
                  </button>
                  <button 
                    onClick={() => handleDuplicateUser(user)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate User
                  </button>
                  <button 
                    onClick={() => handleExportUser(user)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Data
                  </button>

                  {/* Destructive Actions */}
                  <div className="border-t border-white/5 my-1"></div>
                  <button 
                    onClick={() => { setUserToDelete(user); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-danger hover:bg-white/5 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove User
                  </button>
                </>
              );
            })()}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Users;
