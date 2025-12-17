
import React, { useState } from 'react';
import { McpProvider } from '../types';
import { McpService } from '../services';
import { useGlobal } from '../store';
import { 
  Search, Database, Search as SearchIcon, MessageSquare, 
  CreditCard, Trello, DownloadCloud, Check, RefreshCw, 
  Settings, X, Shield, Terminal, Zap, Trash2, AlertTriangle, Loader2
} from 'lucide-react';

const IconMap: Record<string, React.ReactNode> = {
  'database': <Database className="w-6 h-6" />,
  'search': <SearchIcon className="w-6 h-6" />,
  'message-square': <MessageSquare className="w-6 h-6" />,
  'credit-card': <CreditCard className="w-6 h-6" />,
  'trello': <Trello className="w-6 h-6" />,
};

// --- Config Modal ---

const McpConfigModal: React.FC<{
  provider: McpProvider;
  onClose: () => void;
  onSave: (provider: McpProvider) => void;
  onUninstall: (id: string) => Promise<void>;
}> = ({ provider, onClose, onSave, onUninstall }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);

  const handleSave = async () => {
     setIsSaving(true);
     try {
       // Call service to save configuration
       const updated = await McpService.configure(provider.id, { apiKey });
       onSave(updated);
       onClose();
     } catch (e) {
       console.error("Failed to save config", e);
     } finally {
       setIsSaving(false);
     }
  };

  const handleUninstall = async () => {
    if (confirm(`Are you sure you want to uninstall ${provider.name}? This will remove all configuration.`)) {
      setIsUninstalling(true);
      try {
        await onUninstall(provider.id);
        onClose();
      } catch (e) {
        console.error("Failed to uninstall", e);
        setIsUninstalling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
       <div className="relative bg-surface border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-0 overflow-hidden animate-fade-in z-10">
          
          {/* Header */}
          <div className="bg-surfaceHighlight/30 p-6 border-b border-white/5 flex justify-between items-start">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-primary shadow-lg">
                   {IconMap[provider.icon]}
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-100">{provider.name}</h3>
                   <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="bg-success/10 text-success px-1.5 py-0.5 rounded border border-success/20">v{provider.installedVersion || provider.version}</span>
                      <span>•</span>
                      <span>Official Connector</span>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
             <p className="text-sm text-slate-300 leading-relaxed">
                Configure connection settings for <strong>{provider.name}</strong>. This allows your agents to securely access data and perform actions.
             </p>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">API Endpoint</label>
                   <div className="flex items-center gap-2 bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-400 text-sm">
                      <Terminal className="w-4 h-4" />
                      <span className="font-mono">https://api.gateway.pairmind.ai/v1/{provider.id}</span>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Secret Key / Token</label>
                   <input 
                      type="password" 
                      className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 placeholder:text-slate-600"
                      placeholder={provider.isConfigured ? "••••••••••••••••" : "sk_prod_..."}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                   />
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                   <Shield className="w-4 h-4 text-blue-400" />
                   <p className="text-xs text-blue-300">Credentials are encrypted at rest using AES-256.</p>
                </div>
             </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-between items-center gap-3">
             <button 
                onClick={handleUninstall}
                disabled={isUninstalling}
                className="text-danger hover:text-red-400 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
             >
                {isUninstalling ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />} 
                Uninstall
             </button>
             <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">Cancel</button>
                <button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                   {isSaving ? (
                      <> <Loader2 className="w-4 h-4 animate-spin" /> Saving... </>
                   ) : (
                      <> <Check className="w-4 h-4" /> Save Configuration </>
                   )}
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};


const McpMarketplace: React.FC = () => {
  const { mcpProviders, setMcpProviders } = useGlobal();
  const [searchTerm, setSearchTerm] = useState('');
  const [configuringProvider, setConfiguringProvider] = useState<McpProvider | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredProviders = mcpProviders.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateProviderState = async (updatedProvider: McpProvider) => {
    const updatedList = mcpProviders.map(p => p.id === updatedProvider.id ? updatedProvider : p);
    await setMcpProviders(updatedList);
  };

  const handleInstall = async (provider: McpProvider) => {
     setProcessingId(provider.id);
     try {
       const updated = await McpService.install(provider.id);
       await handleUpdateProviderState(updated);
       // Auto-open config after install
       setConfiguringProvider(updated);
     } catch (e) {
       console.error("Install failed", e);
     } finally {
       setProcessingId(null);
     }
  };

  const handleUpdateProvider = async (provider: McpProvider) => {
     setProcessingId(provider.id);
     try {
       const updated = await McpService.performUpdate(provider.id);
       await handleUpdateProviderState(updated);
     } catch (e) {
       console.error("Update failed", e);
     } finally {
       setProcessingId(null);
     }
  };

  const handleUninstallProvider = async (id: string) => {
     const updated = await McpService.uninstall(id);
     await handleUpdateProviderState(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[500px]">
      
      {/* Modals */}
      {configuringProvider && (
         <McpConfigModal 
            provider={configuringProvider}
            onClose={() => setConfiguringProvider(null)}
            onSave={handleUpdateProviderState}
            onUninstall={handleUninstallProvider}
         />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">MCP Providers</h2>
          <p className="text-slate-400 text-sm">Connect your agents to external tools and data sources via Model Context Protocol.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Search providers..." 
             className="w-full bg-input border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary/50 placeholder:text-slate-600 transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Grid */}
      {filteredProviders.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map(provider => {
               const isProcessing = processingId === provider.id;

               return (
                  <div key={provider.id} className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all group flex flex-col h-full relative overflow-hidden">
                     {/* Install Progress Overlay */}
                     {isProcessing && (
                        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-fade-in">
                           <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
                           <span className="text-sm font-bold text-white">
                              {provider.status === 'Update Available' ? 'Updating...' : 'Installing...'}
                           </span>
                        </div>
                     )}

                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-surfaceHighlight border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                           {IconMap[provider.icon] || <Database className="w-6 h-6" />}
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${
                           provider.status === 'Installed' ? 'bg-success/10 text-success border-success/20' :
                           provider.status === 'Update Available' ? 'bg-warning/10 text-warning border-warning/20' :
                           'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                           {provider.status === 'Installed' && <Check className="w-3 h-3" />}
                           {provider.status === 'Update Available' && <AlertTriangle className="w-3 h-3" />}
                           {provider.status}
                        </div>
                     </div>

                     <div className="mb-2">
                        <h3 className="text-lg font-bold text-slate-100 flex items-center justify-between">
                           {provider.name}
                           <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-500 font-mono font-normal">v{provider.version}</span>
                        </h3>
                     </div>
                     <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed">{provider.description}</p>

                     {provider.status === 'Installed' && !provider.isConfigured && (
                        <div className="mb-4 px-3 py-2 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4 text-warning" />
                           <span className="text-xs text-warning font-medium">Configuration Required</span>
                        </div>
                     )}

                     <div className="mt-auto pt-4 border-t border-white/5">
                        {provider.status === 'Installed' ? (
                        <button 
                           onClick={() => setConfiguringProvider(provider)}
                           className="w-full py-2.5 bg-surfaceHighlight border border-white/10 rounded-xl text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 group-hover:border-primary/30"
                        >
                           <Settings className="w-4 h-4" /> Configure
                        </button>
                        ) : provider.status === 'Update Available' ? (
                        <button 
                           onClick={() => handleUpdateProvider(provider)}
                           disabled={isProcessing}
                           className="w-full py-2.5 bg-warning/10 border border-warning/20 rounded-xl text-warning text-sm font-bold hover:bg-warning/20 transition-colors flex items-center justify-center gap-2"
                        >
                           <RefreshCw className="w-4 h-4" /> Update to v{provider.version}
                        </button>
                        ) : (
                        <button 
                           onClick={() => handleInstall(provider)}
                           disabled={isProcessing}
                           className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primaryHover shadow-neon transition-colors flex items-center justify-center gap-2"
                        >
                           <DownloadCloud className="w-4 h-4" /> Install Provider
                        </button>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
               <Zap className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-lg font-medium text-slate-300">No providers found</h3>
            <p className="text-sm mt-1">Try a different search term.</p>
         </div>
      )}
    </div>
  );
};

export default McpMarketplace;
