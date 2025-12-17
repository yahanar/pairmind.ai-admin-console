
import React, { useState } from 'react';
import { X, Server, Check, Copy, Shield, AlertTriangle, Download, Terminal, Loader2, Info, Clipboard, CheckCircle, ArrowRight } from 'lucide-react';
import { Tier, Instance, InstanceStatus } from '../types';
import { useGlobal } from '../store';

interface InstanceCreationModalProps {
  onClose: () => void;
  onSubmit: (instance: Instance) => void;
}

const InstanceCreationModal: React.FC<InstanceCreationModalProps> = ({ onClose, onSubmit }) => {
  const { notify } = useGlobal();
  const [view, setView] = useState<'create' | 'success'>('create');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tier: Tier.PRO,
    validity: '12 Months',
    deployment: 'Binary - Direct executable',
    environment: 'Production'
  });

  // Success State Data
  const [createdData, setCreatedData] = useState<{
    id: string;
    licenseKey: string;
    expiry: string;
  } | null>(null);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
       notify('Instance Name is required.', 'error');
       return;
    }

    setLoading(true);

    // Simulate API Call latency
    setTimeout(() => {
       const id = `inst-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
       const licenseKey = `lk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
       
       const expiryDate = new Date();
       if (formData.validity.includes('24')) {
          expiryDate.setFullYear(expiryDate.getFullYear() + 2);
       } else {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
       }
       const expiry = expiryDate.toISOString();

       setCreatedData({ id, licenseKey, expiry });
       setView('success');
       setLoading(false);
       notify('Instance created successfully.', 'success');
    }, 1500);
  };

  const handleDone = () => {
     if (!createdData) return;

     const newInstance: Instance = {
        id: createdData.id,
        name: formData.name,
        tier: formData.tier,
        status: InstanceStatus.BOOTSTRAPPING,
        region: 'us-east-1', // Defaulting region as it wasn't in the specific requirements
        version: 'v2.5.0',
        uptime: '0m',
        created: new Date().toISOString(),
        health: 100,
        lastSeen: 'Just now',
        licenseExpiry: createdData.expiry,
        licenseKey: createdData.licenseKey
     };

     onSubmit(newInstance);
  };

  const copyToClipboard = (text: string, label: string) => {
     navigator.clipboard.writeText(text);
     notify(`${label} copied to clipboard.`, 'success');
  };

  // --- SUCCESS VIEW ---
  if (view === 'success' && createdData) {
     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
           <div className="relative bg-surface border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
              
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surfaceHighlight/20">
                 <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-success" /> Instance Created Successfully
                 </h2>
                 <button onClick={handleDone} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                 {/* Success Banner */}
                 <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <div>
                       <h3 className="text-sm font-bold text-success">Instance provisioned successfully</h3>
                       <p className="text-xs text-slate-300 mt-1">
                          Your self-hosted instance is ready for configuration. Please save your license credentials immediately.
                       </p>
                    </div>
                 </div>

                 {/* Credentials Section */}
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instance ID</label>
                       <div className="flex gap-2">
                          <code className="flex-1 bg-input border border-white/10 rounded-lg p-3 text-sm font-mono text-slate-100">
                             {createdData.id}
                          </code>
                          <button 
                             onClick={() => copyToClipboard(createdData.id, 'Instance ID')}
                             className="p-3 border border-white/10 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                          >
                             <Copy className="w-4 h-4" />
                          </button>
                       </div>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">License Key (One-time Secret)</label>
                       <div className="flex gap-2">
                          <code className="flex-1 bg-input border border-primary/30 rounded-lg p-3 text-sm font-mono text-primary shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                             {createdData.licenseKey}
                          </code>
                          <button 
                             onClick={() => copyToClipboard(createdData.licenseKey, 'License Key')}
                             className="p-3 bg-primary hover:bg-primaryHover text-white rounded-lg shadow-neon transition-colors"
                          >
                             <Copy className="w-4 h-4" />
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-input p-3 rounded-lg border border-white/5">
                           <div className="text-xs text-slate-500 uppercase font-bold mb-1">Tier</div>
                           <div className="text-sm text-slate-200 font-medium">{formData.tier}</div>
                        </div>
                        <div className="bg-input p-3 rounded-lg border border-white/5">
                           <div className="text-xs text-slate-500 uppercase font-bold mb-1">Valid Until</div>
                           <div className="text-sm text-slate-200 font-medium">{new Date(createdData.expiry).toLocaleDateString()}</div>
                        </div>
                    </div>
                 </div>

                 {/* Warning */}
                 <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                    <p className="text-xs text-warning font-medium">
                       Warning: The license key cannot be retrieved later. It is required to configure the binary during the first boot.
                    </p>
                 </div>

                 {/* Next Steps */}
                 <div className="border-t border-white/5 pt-6">
                    <h3 className="text-sm font-bold text-slate-100 mb-4">Next Steps</h3>
                    <div className="space-y-3">
                       <div className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">1</div>
                          <span>Copy License Key and Instance ID</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">2</div>
                          <span className="flex items-center gap-2">Download the PairMind.AI self-hosted binary <Download className="w-3 h-3 text-primary"/></span>
                       </div>
                       <div className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">3</div>
                          <span>Configure the binary using the license key</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">4</div>
                          <span>Start the binary and wait for it to appear online</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
                 <button 
                    onClick={handleDone}
                    className="bg-primary hover:bg-primaryHover text-white px-8 py-2.5 rounded-xl shadow-neon text-sm font-bold flex items-center gap-2 transition-all"
                 >
                    Done
                 </button>
              </div>
           </div>
        </div>
     );
  }

  // --- CREATE VIEW ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-surface border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
           <div>
              <h2 className="text-xl font-bold text-slate-100">Create New Self-Hosted Instance</h2>
              <p className="text-xs text-slate-400 mt-1">Configure deployment options for your new AI instance.</p>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
           </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
           {/* Instance Name */}
           <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Instance Name <span className="text-danger">*</span></label>
             <input 
               type="text" 
               className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary/50 placeholder:text-slate-600 transition-all" 
               placeholder="e.g., Production Instance"
               value={formData.name}
               onChange={(e) => setFormData({...formData, name: e.target.value})}
               autoFocus
             />
             <p className="text-[10px] text-slate-500 mt-1.5">A friendly name to identify this instance in your fleet.</p>
           </div>

           {/* Tier & Validity Row */}
           <div className="grid grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Tier <span className="text-danger">*</span></label>
                 <div className="relative">
                    <select 
                      value={formData.tier}
                      onChange={(e) => setFormData({...formData, tier: e.target.value as Tier})}
                      className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                    >
                       <option value={Tier.STARTER}>Starter (Basic RAG)</option>
                       <option value={Tier.PRO}>Pro (Advanced Logic)</option>
                       <option value={Tier.ENTERPRISE}>Enterprise (Custom LLMs)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                       <ArrowRight className="h-4 w-4 rotate-90" />
                    </div>
                 </div>
                 <p className="text-[10px] text-slate-500 mt-1.5">Determines concurrency limits and feature set.</p>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">License Validity</label>
                 <div className="relative">
                    <select 
                      value={formData.validity}
                      onChange={(e) => setFormData({...formData, validity: e.target.value})}
                      className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                    >
                       <option>12 Months</option>
                       <option>24 Months</option>
                       <option>36 Months</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                       <ArrowRight className="h-4 w-4 rotate-90" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Deployment & Env Row */}
           <div className="grid grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Deployment Type</label>
                 <select 
                    value={formData.deployment}
                    onChange={(e) => setFormData({...formData, deployment: e.target.value})}
                    className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary/50"
                 >
                    <option>Binary - Direct executable</option>
                    <option>Docker Container</option>
                    <option>Kubernetes Helm Chart</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Environment</label>
                 <select 
                    value={formData.environment}
                    onChange={(e) => setFormData({...formData, environment: e.target.value})}
                    className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-primary/50"
                 >
                    <option>Production</option>
                    <option>Staging</option>
                    <option>Development</option>
                    <option>Disaster Recovery</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
           <button 
             onClick={onClose} 
             className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
           >
              Cancel
           </button>
           <button 
             onClick={handleCreate} 
             disabled={loading}
             className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl shadow-neon text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait"
           >
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Server className="w-4 h-4" />}
              {loading ? 'Provisioning...' : 'Create Instance'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default InstanceCreationModal;
