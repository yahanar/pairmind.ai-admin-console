
import React, { useState, useEffect, useRef } from 'react';
import { Tenant, User } from '../types';
import { TenantService, AccessControlService } from '../services';
import { useGlobal } from '../store';
import { 
  MoreHorizontal, CreditCard, Users, Edit, Power, Trash2, 
  ArrowLeft, Save, X, Check, Shield, Activity, Settings, Key,
  Plus, AlertTriangle, FileText, Download, History, Eye, EyeOff,
  RefreshCw, CheckCircle, AlertCircle, Search, Filter, LayoutGrid, List,
  ChevronLeft, ChevronRight, ChevronDown, Rocket, Building
} from 'lucide-react';

const ITEMS_PER_PAGE = 9;

// --- Custom Filter Dropdown (Reused for consistency) ---
interface FilterOption {
  label: string;
  value: string;
}

const FilterDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
  icon?: React.ReactNode;
}> = ({ value, onChange, options, className, icon }) => {
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
        className="flex items-center gap-2 bg-input border border-white/10 rounded-xl py-2 pl-3 pr-3 text-sm text-slate-300 focus:outline-none focus:border-primary/50 hover:bg-white/5 transition-all w-full min-w-[140px]"
      >
        {icon}
        <span className="truncate flex-1 text-left">{selectedLabel}</span>
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

// --- Reusable Modal for Create and Edit ---
interface TenantFormModalProps {
  initialData?: Tenant | null;
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
}

const TenantFormModal: React.FC<TenantFormModalProps> = ({ initialData, onClose, onSave }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<Partial<Tenant>>(
    initialData || {
      name: '',
      plan: 'Starter',
      users: 10,
      status: 'Active'
    }
  );

  const handleSubmit = () => {
    if (!formData.name) return; // Simple validation
    
    // Construct full tenant object
    const tenant: Tenant = {
      id: initialData?.id || `t-${Date.now()}`,
      name: formData.name!,
      plan: formData.plan || 'Starter',
      users: formData.users || 0,
      status: (formData.status as 'Active' | 'Suspended') || 'Active'
    };
    
    onSave(tenant);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glassmorphic Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
      <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100">{isEditing ? 'Edit Tenant Details' : 'Create New Tenant'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Organization Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-primary/50 placeholder:text-slate-600 transition-all"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Plan Tier</label>
            <select 
              value={formData.plan}
              onChange={(e) => setFormData({...formData, plan: e.target.value})}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-primary/50 transition-all"
            >
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Allocated Seats</label>
            <input 
              type="number" 
              value={formData.users}
              onChange={(e) => setFormData({...formData, users: parseInt(e.target.value) || 0})}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-primary/50 transition-all"
            />
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

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> {isEditing ? 'Save Changes' : 'Create Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Delete Confirmation Modal ---
interface DeleteModalProps {
  tenantName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ tenantName, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
    <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
      <div className="flex items-center gap-4 mb-4 text-danger">
        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Delete Tenant?</h3>
      </div>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        Are you sure you want to delete <strong>{tenantName}</strong>? This action cannot be undone and all associated data, users, and configurations will be permanently removed.
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
          Confirm Delete
        </button>
      </div>
    </div>
  </div>
);

// --- Sub-Component: Audit Log Modal ---
interface AuditLogModalProps {
  tenantName: string;
  onClose: () => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ tenantName, onClose }) => {
  const logs = [
    { action: 'Updated SSO Settings', user: 'admin@pairmind.ai', time: '2 mins ago', status: 'Success' },
    { action: 'Rotated API Keys', user: 'system', time: '1 hour ago', status: 'Success' },
    { action: 'Provisioned New Instance', user: 'devops@tenant.com', time: '3 hours ago', status: 'Success' },
    { action: 'Failed Login Attempt', user: 'unknown', time: '5 hours ago', status: 'Failed' },
    { action: 'Billing Plan Changed', user: 'admin@pairmind.ai', time: '1 day ago', status: 'Success' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
      <div className="relative bg-surface border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-fade-in z-10 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div>
             <h3 className="text-lg font-bold text-slate-100">Audit Logs</h3>
             <p className="text-xs text-slate-400">Viewing activity for {tenantName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
           <table className="w-full text-left text-sm">
             <thead className="text-xs text-slate-500 uppercase bg-white/5 sticky top-0">
               <tr>
                 <th className="p-3 rounded-l-lg">Action</th>
                 <th className="p-3">User</th>
                 <th className="p-3">Time</th>
                 <th className="p-3 text-right rounded-r-lg">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {logs.map((log, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-medium text-slate-200">{log.action}</td>
                    <td className="p-3 text-slate-400 font-mono text-xs">{log.user}</td>
                    <td className="p-3 text-slate-500">{log.time}</td>
                    <td className="p-3 text-right">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'Success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                       }`}>
                          {log.status}
                       </span>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
           <button className="px-4 py-2 border border-white/10 rounded-lg text-slate-300 text-sm hover:bg-white/5 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Upgrade Plan Modal ---
interface UpgradePlanModalProps {
  currentPlan: string;
  onClose: () => void;
  onConfirm: (newPlan: string) => void;
}

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({ currentPlan, onClose, onConfirm }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
       <div className="relative bg-surface border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-100">Upgrade Plan</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
          </div>
          <div className="space-y-3 mb-6">
             {['Starter', 'Pro', 'Enterprise'].map(plan => (
                <div 
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                     selectedPlan === plan 
                     ? 'bg-primary/10 border-primary shadow-neon' 
                     : 'bg-input border-white/10 hover:bg-white/5'
                  }`}
                >
                   <div>
                      <div className="font-bold text-slate-100">{plan}</div>
                      <div className="text-xs text-slate-400">
                         {plan === 'Starter' && 'Basic features for small teams'}
                         {plan === 'Pro' && 'Advanced analytics & more seats'}
                         {plan === 'Enterprise' && 'Unlimited scale & dedicated support'}
                      </div>
                   </div>
                   {selectedPlan === plan && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
             ))}
          </div>
          <div className="flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
             <button 
               onClick={() => onConfirm(selectedPlan)} 
               className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg font-medium shadow-neon transition-all"
             >
                Confirm Change
             </button>
          </div>
       </div>
    </div>
  )
}

// --- Sub-Component: Edit Payment Method Modal ---
const PaymentMethodModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
         <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Update Payment Method</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Card Number</label>
                  <div className="relative">
                     <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                     <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-input border border-white/10 rounded-lg py-2 pl-10 pr-4 text-slate-100 focus:outline-none focus:border-primary/50" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Expiry</label>
                     <input type="text" placeholder="MM/YY" className="w-full bg-input border border-white/10 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">CVC</label>
                     <input type="text" placeholder="123" className="w-full bg-input border border-white/10 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-primary/50" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Cardholder Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-input border border-white/10 rounded-lg py-2 px-3 text-slate-100 focus:outline-none focus:border-primary/50" />
               </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
               <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
               <button onClick={onSave} className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg font-medium shadow-neon transition-all">Save Card</button>
            </div>
         </div>
      </div>
   );
}


// --- Sub-Component: Tenant Dashboard (Drill-down view) ---
interface TenantDashboardProps {
  tenant: Tenant;
  onBack: () => void;
  // onUpdate & currentUser handled internally or passed from wrapper
  // We can pass them down or use hook. Let's pass for dashboard but use hook for top level logic.
  // Actually, let's use hook inside if we want to avoid props completely, but 'tenant' is local context.
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenant, onBack }) => {
  const { user, tenants, setTenants, notify } = useGlobal();
  const [activeTab, setActiveTab] = useState('Overview');
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Simulated API Key State
  const [publishableKey, setPublishableKey] = useState('pk_live_51Mxz92sK2910lAx92');
  const [secretKey, setSecretKey] = useState('sk_live_••••••••••••••••••••••••');
  const [realSecretKey, setRealSecretKey] = useState('sk_live_x8291kLa921000mZ81');
  
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  if (!user) return null;

  const onUpdate = async (updatedTenant: Tenant) => {
    const updatedList = tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t);
    await setTenants(updatedList);
  };

  const handleRotateKey = async () => {
    if (!AccessControlService.canRotateKeys(user)) {
       notify('Unauthorized: You do not have permission to rotate API keys.', 'error');
       return;
    }

    if (window.confirm('Are you sure? Old keys will stop working immediately.')) {
       setIsRotating(true);
       try {
          const keys = await TenantService.rotateApiKey(tenant.id);
          setPublishableKey(keys.publishableKey);
          setRealSecretKey(keys.secretKey);
          notify('API Key rotated successfully', 'success');
       } catch (e) {
          notify('Failed to rotate API keys. Please try again.', 'error');
       } finally {
          setIsRotating(false);
       }
    }
  };

  const handleImpersonate = () => {
     notify(`Now impersonating admin for ${tenant.name}`, 'success');
  };

  const handleUpgradePlan = (newPlan: string) => {
     onUpdate({ ...tenant, plan: newPlan });
     setShowUpgradeModal(false);
     notify(`Plan upgraded to ${newPlan}`, 'success');
  }

  const handleSavePayment = () => {
     setShowPaymentModal(false);
     notify('Payment method updated', 'success');
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Modals */}
      {showUpgradeModal && (
         <UpgradePlanModal 
            currentPlan={tenant.plan}
            onClose={() => setShowUpgradeModal(false)}
            onConfirm={handleUpgradePlan}
         />
      )}
      {showPaymentModal && (
         <PaymentMethodModal 
            onClose={() => setShowPaymentModal(false)}
            onSave={handleSavePayment}
         />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-white/5 pb-6">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors w-fit">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             {tenant.name}
             <span className={`text-xs px-2 py-0.5 rounded border font-medium uppercase tracking-wide ${
                tenant.status === 'Active' ? 'border-success/30 text-success bg-success/5' : 'border-danger/30 text-danger bg-danger/5'
             }`}>{tenant.status}</span>
           </h2>
           <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="font-mono text-primary">ID: {tenant.id}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
              <span>{tenant.plan} Plan</span>
           </div>
        </div>
        <div className="md:ml-auto flex gap-3">
           <button 
             onClick={() => setShowAuditLogs(true)}
             className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
           >
              <History className="w-4 h-4" /> View Audit Logs
           </button>
           <button 
             onClick={handleImpersonate}
             className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-neon hover:bg-primaryHover transition-colors flex items-center gap-2"
           >
              <Shield className="w-4 h-4" /> Impersonate Admin
           </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit overflow-x-auto">
        {['Overview', 'Settings', 'API Keys', 'Billing'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-surface shadow text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
         
         {/* --- OVERVIEW TAB --- */}
         {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                {/* Stats */}
                <div className="bg-surface border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-primary/10 rounded text-primary"><Users className="w-5 h-5"/></div>
                    </div>
                    <div className="text-3xl font-bold text-slate-100">{tenant.users} / 50</div>
                    <div className="text-sm text-slate-400 mt-1">Active Seats</div>
                    <div className="mt-4 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${(tenant.users / 50) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-surface border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-success/10 rounded text-success"><Activity className="w-5 h-5"/></div>
                    </div>
                    <div className="text-3xl font-bold text-slate-100">99.99%</div>
                    <div className="text-sm text-slate-400 mt-1">SLA Uptime</div>
                </div>

                <div className="bg-surface border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-warning/10 rounded text-warning"><Shield className="w-5 h-5"/></div>
                    </div>
                    <div className="text-3xl font-bold text-slate-100">Healthy</div>
                    <div className="text-sm text-slate-400 mt-1">Compliance Status</div>
                </div>

                {/* Recent Activity Mini-List */}
                <div className="md:col-span-3 bg-surface border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-100 mb-4">Recent System Events</h3>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 p-3 border border-white/5 rounded-lg bg-white/[0.02]">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <div className="text-sm text-slate-300">Daily backup completed successfully.</div>
                          <div className="ml-auto text-xs text-slate-500">2h ago</div>
                       </div>
                       <div className="flex items-center gap-3 p-3 border border-white/5 rounded-lg bg-white/[0.02]">
                          <AlertCircle className="w-4 h-4 text-warning" />
                          <div className="text-sm text-slate-300">High API latency detected in region us-east-1.</div>
                          <div className="ml-auto text-xs text-slate-500">5h ago</div>
                       </div>
                    </div>
                </div>
            </div>
         )}

         {/* --- SETTINGS TAB --- */}
         {activeTab === 'Settings' && (
            <div className="max-w-3xl space-y-6 animate-fade-in">
                <div className="bg-surface border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-slate-500" /> General Configuration
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <div>
                            <div className="text-sm text-slate-200 font-medium">SSO Enforcement</div>
                            <div className="text-xs text-slate-500">Require all users to log in via SAML/OIDC providers.</div>
                          </div>
                          <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div></div>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <div>
                            <div className="text-sm text-slate-200 font-medium">Data Residency</div>
                            <div className="text-xs text-slate-500">Force data storage in specific geographic region.</div>
                          </div>
                          <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300 border border-white/10">US-East-1 (N. Virginia)</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                          <div>
                            <div className="text-sm text-slate-200 font-medium">Maintenance Window</div>
                            <div className="text-xs text-slate-500">Preferred time for system updates.</div>
                          </div>
                          <span className="text-xs text-slate-400">Sunday 02:00 UTC</span>
                      </div>
                    </div>
                </div>
            </div>
         )}

         {/* --- API KEYS TAB --- */}
         {activeTab === 'API Keys' && (
            <div className="max-w-3xl space-y-6 animate-fade-in">
                <div className="bg-surface border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5 text-slate-500" /> API Credentials
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                       Use these keys to authenticate API requests. Treat your secret key like a password.
                    </p>
                    
                    <div className="space-y-6">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Publishable Key</label>
                          <div className="flex gap-2">
                             <code className="flex-1 bg-input border border-white/10 rounded-lg p-3 text-sm font-mono text-slate-300">
                                {publishableKey}
                             </code>
                             <button className="p-3 border border-white/10 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white" title="Copy">
                                <FileText className="w-4 h-4" />
                             </button>
                          </div>
                       </div>

                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Secret Key</label>
                          <div className="flex gap-2">
                             <code className="flex-1 bg-input border border-white/10 rounded-lg p-3 text-sm font-mono text-slate-300 flex items-center">
                                {isKeyVisible ? realSecretKey : 'sk_live_••••••••••••••••••••••••'}
                             </code>
                             <button 
                               onClick={() => setIsKeyVisible(!isKeyVisible)}
                               className="p-3 border border-white/10 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white" 
                               title="Toggle Visibility"
                             >
                                {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                             </button>
                          </div>
                       </div>

                       <div className="pt-4 border-t border-white/5">
                          <button 
                             onClick={handleRotateKey}
                             disabled={isRotating}
                             className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-sm hover:bg-white/10 hover:text-white disabled:opacity-50"
                          >
                             <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} /> 
                             {isRotating ? 'Rotating Keys...' : 'Roll API Keys'}
                          </button>
                          <p className="text-xs text-slate-500 mt-2">Rolling keys will invalidate the current secret key immediately.</p>
                       </div>
                    </div>
                </div>
            </div>
         )}

         {/* --- BILLING TAB --- */}
         {activeTab === 'Billing' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
               <div className="md:col-span-2 space-y-6">
                  <div className="bg-surface border border-white/5 rounded-2xl p-6">
                      <h3 className="font-bold text-slate-100 mb-6 flex items-center gap-2">
                         <CreditCard className="w-5 h-5 text-slate-500" /> Current Plan
                      </h3>
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="text-2xl font-bold text-slate-100">{tenant.plan} Plan</div>
                            <div className="text-sm text-slate-400 mt-1">$499 / month • Billed Annually</div>
                         </div>
                         <button 
                           onClick={() => setShowUpgradeModal(true)}
                           className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded text-xs font-bold hover:bg-primary/20 transition-colors"
                         >
                            Upgrade Plan
                         </button>
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/5">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-[#1A1F2C] border border-white/10 rounded flex items-center justify-center">
                               <span className="font-bold text-white text-xs italic">VISA</span>
                            </div>
                            <div>
                               <div className="text-sm text-slate-200">Visa ending in 4242</div>
                               <div className="text-xs text-slate-500">Expires 12/2026</div>
                            </div>
                            <button 
                              onClick={() => setShowPaymentModal(true)}
                              className="ml-auto text-xs text-primary hover:text-primaryHover underline"
                            >
                               Edit
                            </button>
                         </div>
                      </div>
                  </div>

                  <div className="bg-surface border border-white/5 rounded-2xl p-6">
                      <h3 className="font-bold text-slate-100 mb-4">Invoice History</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                           <thead className="text-xs text-slate-500 uppercase bg-white/5">
                              <tr>
                                 <th className="p-3 rounded-l-lg">Date</th>
                                 <th className="p-3">Amount</th>
                                 <th className="p-3">Status</th>
                                 <th className="p-3 text-right rounded-r-lg">Download</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {[
                                 { date: 'Nov 01, 2025', amount: '$499.00', status: 'Paid' },
                                 { date: 'Oct 01, 2025', amount: '$499.00', status: 'Paid' },
                                 { date: 'Sep 01, 2025', amount: '$499.00', status: 'Paid' },
                              ].map((inv, i) => (
                                 <tr key={i}>
                                    <td className="p-3 text-slate-300">{inv.date}</td>
                                    <td className="p-3 text-slate-300">{inv.amount}</td>
                                    <td className="p-3"><span className="text-success text-xs bg-success/10 px-2 py-0.5 rounded font-bold">{inv.status}</span></td>
                                    <td className="p-3 text-right text-slate-400 hover:text-white cursor-pointer"><Download className="w-4 h-4 ml-auto" /></td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                  </div>
               </div>

               <div className="bg-surface border border-white/5 rounded-2xl p-6 h-fit">
                  <h3 className="font-bold text-slate-100 mb-4">Billing Contact</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email</label>
                        <div className="text-sm text-slate-300">billing@{tenant.name.toLowerCase().replace(/\s+/g, '')}.com</div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address</label>
                        <div className="text-sm text-slate-300">
                           123 Tech Plaza<br/>
                           Suite 400<br/>
                           San Francisco, CA 94107
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Audit Log Modal */}
      {showAuditLogs && <AuditLogModal tenantName={tenant.name} onClose={() => setShowAuditLogs(false)} />}
    </div>
  );
};

// --- Main Component ---
const Tenants: React.FC = () => {
  const { tenants, setTenants, notify, user } = useGlobal();
  
  // State
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Actions
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [managingTenant, setManagingTenant] = useState<Tenant | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.tenant-card-menu-trigger') && !target.closest('.tenant-card-menu')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // Filtering Logic
  const filteredTenants = tenants.filter(t => {
     const matchesText = t.name.toLowerCase().includes(filterText.toLowerCase()) || 
                         t.id.toLowerCase().includes(filterText.toLowerCase());
     const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
     return matchesText && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredTenants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
     setCurrentPage(1);
  }, [filterText, statusFilter]);

  // Handlers
  const handleToggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleCreateSubmit = async (newTenant: Tenant) => {
    if (!AccessControlService.canManageUsers(user)) {
      notify("Unauthorized: Only Admins can create tenants.", "error");
      return;
    }
    await setTenants([newTenant, ...tenants]);
    setShowCreateModal(false);
    notify('Tenant created successfully.', 'success');
  };

  const handleEditSubmit = async (updatedTenant: Tenant) => {
    const updated = tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t);
    await setTenants(updated);
    setEditingTenant(null);
    notify('Tenant updated successfully.', 'success');
  };

  const handleToggleStatus = async (id: string) => {
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
       const newStatus: 'Active' | 'Suspended' = tenant.status === 'Active' ? 'Suspended' : 'Active';
       const updated = tenants.map(t => t.id === id ? { ...t, status: newStatus } : t);
       await setTenants(updated);
       notify(`Tenant ${newStatus === 'Active' ? 'activated' : 'suspended'}.`, newStatus === 'Active' ? 'success' : 'error');
       setOpenMenuId(null);
    }
  };

  const confirmDelete = async () => {
    if (tenantToDelete) {
      if (!AccessControlService.canDeleteTenant(user)) {
         notify("Unauthorized: Only Super Admins can delete tenants.", "error");
         setTenantToDelete(null);
         return;
      }
      const updated = tenants.filter(t => t.id !== tenantToDelete.id);
      await setTenants(updated);
      notify('Tenant deleted successfully.', 'success');
      setTenantToDelete(null);
      if (managingTenant?.id === tenantToDelete.id) {
        setManagingTenant(null);
      }
    }
  };
  
  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setOpenMenuId(null);
  };

  if (managingTenant) {
    return <TenantDashboard tenant={managingTenant} onBack={() => setManagingTenant(null)} />;
  }

  const canDelete = AccessControlService.canDeleteTenant(user);

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[calc(100vh-80px)]">
      
      {/* Modals */}
      {showCreateModal && <TenantFormModal onClose={() => setShowCreateModal(false)} onSave={handleCreateSubmit} />}
      {editingTenant && <TenantFormModal initialData={editingTenant} onClose={() => setEditingTenant(null)} onSave={handleEditSubmit} />}
      {tenantToDelete && <DeleteConfirmationModal tenantName={tenantToDelete.name} onClose={() => setTenantToDelete(null)} onConfirm={confirmDelete} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Tenants</h2>
          <p className="text-slate-400 mt-1">Manage organizations and their subscription plans.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl shadow-neon flex items-center gap-2 transition-all font-medium text-sm"
        >
          <Plus className="w-5 h-5" /> Create Tenant
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
               type="text" 
               placeholder="Search by name or ID..." 
               value={filterText}
               onChange={(e) => setFilterText(e.target.value)}
               className="w-full bg-input border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary/50 placeholder:text-slate-600 transition-all"
            />
         </div>
         <div className="flex gap-2 w-full md:w-auto">
            <FilterDropdown 
               value={statusFilter}
               onChange={setStatusFilter}
               options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Active', value: 'Active' },
                  { label: 'Suspended', value: 'Suspended' },
               ]}
               icon={<Filter className="w-4 h-4 text-slate-500" />}
            />
            
            <div className="flex bg-input border border-white/10 rounded-xl p-1">
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                  <LayoutGrid className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setViewMode('list')}
                 className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
               >
                  <List className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>

      {/* Results Content */}
      {paginatedTenants.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
               <Building className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-lg font-medium text-slate-300">No tenants found</h3>
            <p className="text-sm max-w-xs text-center mt-2">
               Try adjusting your filters or create a new tenant to get started.
            </p>
            <button onClick={() => { setFilterText(''); setStatusFilter('All'); }} className="mt-4 text-primary text-sm hover:underline">
               Clear Filters
            </button>
         </div>
      ) : (
         <>
            {/* Grid View */}
            {viewMode === 'grid' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {paginatedTenants.map(tenant => (
                  <div 
                     key={tenant.id} 
                     className={`bg-surface rounded-2xl p-6 relative group border border-transparent hover:border-white/5 transition-all ${openMenuId === tenant.id ? 'ring-1 ring-white/10 shadow-lg z-10' : ''}`}
                  >
                     {/* Header */}
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-surfaceHighlight border border-white/5 flex items-center justify-center text-slate-100 text-lg font-bold">
                           {tenant.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-3">
                           <div className={`px-2 py-1 rounded text-xs font-medium border ${
                              tenant.status === 'Active' 
                                 ? 'text-[#10B981] border-[#10B981]/20 bg-[#10B981]/10' 
                                 : 'text-[#EF4444] border-[#EF4444]/20 bg-[#EF4444]/10'
                           }`}>
                              {tenant.status}
                           </div>
                           <div className="relative">
                              <button 
                                 onClick={(e) => handleToggleMenu(e, tenant.id)}
                                 className={`tenant-card-menu-trigger p-1 rounded hover:bg-white/10 text-slate-400 transition-colors ${openMenuId === tenant.id ? 'bg-white/10 text-white' : ''}`}
                              >
                                 <MoreHorizontal className="w-5 h-5" />
                              </button>
                              {openMenuId === tenant.id && (
                                 <div className="tenant-card-menu absolute right-0 top-8 w-40 bg-[#0F2E45] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-20 animate-fade-in">
                                    <button onClick={() => handleEdit(tenant)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2">
                                       <Edit className="w-3.5 h-3.5" /> Edit Tenant
                                    </button>
                                    <button onClick={() => handleToggleStatus(tenant.id)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-warning hover:bg-white/5 flex items-center gap-2">
                                       <Power className="w-3.5 h-3.5" /> {tenant.status === 'Active' ? 'Suspend' : 'Activate'}
                                    </button>
                                    
                                    {/* RBAC Protected Delete */}
                                    {canDelete && (
                                       <button onClick={() => { setTenantToDelete(tenant); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-danger hover:bg-white/5 flex items-center gap-2 border-t border-white/5">
                                          <Trash2 className="w-3.5 h-3.5" /> Delete Tenant
                                       </button>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                     {/* Info */}
                     <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-100 mb-1">{tenant.name}</h3>
                        <p className="text-slate-500 text-xs font-mono">ID: {tenant.id}</p>
                     </div>
                     {/* Stats */}
                     <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-slate-400 flex items-center gap-2"><CreditCard className="w-4 h-4 text-slate-500"/> Plan</span>
                           <span className="text-slate-200 font-medium">{tenant.plan || <span className="text-slate-600">-</span>}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-slate-400 flex items-center gap-2"><Users className="w-4 h-4 text-slate-500"/> Users</span>
                           <span className="text-slate-200 font-medium">{tenant.users}</span>
                        </div>
                     </div>
                     {/* Action */}
                     <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button onClick={() => setManagingTenant(tenant)} className="text-sm text-[#3B82F6] hover:text-[#60A5FA] transition-colors font-medium flex items-center gap-1 group-hover:underline">
                           Manage Organization <ArrowLeft className="w-3 h-3 rotate-180" />
                        </button>
                     </div>
                  </div>
               ))}
               </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
               <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead>
                           <tr className="bg-white/[0.02] text-slate-400 uppercase text-xs tracking-wider border-b border-white/5">
                              <th className="p-4 font-semibold">Organization</th>
                              <th className="p-4 font-semibold">Plan</th>
                              <th className="p-4 font-semibold">Allocated Users</th>
                              <th className="p-4 font-semibold">Status</th>
                              <th className="p-4 font-semibold text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {paginatedTenants.map(tenant => (
                              <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors group">
                                 <td className="p-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-surfaceHighlight border border-white/10 flex items-center justify-center text-slate-300 font-bold text-xs">
                                          {tenant.name.substring(0, 2).toUpperCase()}
                                       </div>
                                       <div>
                                          <div className="font-bold text-slate-100">{tenant.name}</div>
                                          <div className="text-xs text-slate-500 font-mono">{tenant.id}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-4">
                                    <span className="bg-white/5 px-2 py-1 rounded border border-white/10 text-xs text-slate-300">
                                       {tenant.plan}
                                    </span>
                                 </td>
                                 <td className="p-4 text-slate-300">{tenant.users}</td>
                                 <td className="p-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded border ${
                                       tenant.status === 'Active' 
                                          ? 'text-success border-success/20 bg-success/5' 
                                          : 'text-danger border-danger/20 bg-danger/5'
                                    }`}>
                                       {tenant.status}
                                    </span>
                                 </td>
                                 <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                       <button onClick={() => setManagingTenant(tenant)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Manage">
                                          <Settings className="w-4 h-4" />
                                       </button>
                                       <button onClick={() => { setEditingTenant(tenant); }} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                                          <Edit className="w-4 h-4" />
                                       </button>
                                       {canDelete && (
                                       <button onClick={() => { setTenantToDelete(tenant); }} className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                       )}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
               <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-surface rounded-b-2xl mt-4 rounded-t-2xl">
                  <div className="text-sm text-slate-400">
                     Showing <span className="font-medium text-slate-200">{startIndex + 1}</span> to <span className="font-medium text-slate-200">{Math.min(startIndex + ITEMS_PER_PAGE, filteredTenants.length)}</span> of <span className="font-medium text-slate-200">{filteredTenants.length}</span> results
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
  );
};

export default Tenants;
