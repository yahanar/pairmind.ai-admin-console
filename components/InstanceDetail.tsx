
import React, { useState, useEffect, useRef } from 'react';
import { InstanceStatus, InstanceConfiguration, ConfigurationHistoryItem, InstanceUsage, RagDocument, InstanceMonitoringStats, InstanceIntegration, InstancePolicy, PermissionMatrix, PiiRule, InstanceBranding } from '../types';
import { InstanceService, AccessControlService, RagService } from '../services';
import { useGlobal } from '../store';
import {
   ArrowLeft, Copy, Check, FileText, Database, Shield,
   Globe, Cpu, Zap, History, Palette, Code, ExternalLink,
   RefreshCw, Lock, Download, CheckCircle, Loader2, FileCode, AlertCircle,
   Terminal, Trash, X, ShieldCheck, ToggleLeft, ToggleRight, Save, Clock, RotateCcw,
   AlertTriangle, UploadCloud, File, Info, HardDrive, Layers, Server, Activity, XCircle,
   Puzzle, ChevronDown, ChevronUp, Briefcase, Package, Trello, Settings2, Power, Eye, EyeOff,
   MessageSquare, Send, Minus, Plus
} from 'lucide-react';
import {
   AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ANALYTICS_DATA } from '../constants';

// --- Icons Map for Integrations ---
const IntegrationIcons: Record<string, React.ReactNode> = {
   'layers': <Layers className="w-5 h-5" />,
   'cpu': <Cpu className="w-5 h-5" />,
   'briefcase': <Briefcase className="w-5 h-5" />,
   'trello': <Trello className="w-5 h-5" />,
   'package': <Package className="w-5 h-5" />,
};

// --- Live Preview Component ---
const WidgetPreview: React.FC<{ branding: InstanceBranding }> = ({ branding }) => {
   const isRight = branding.position.includes('right');
   const isBottom = branding.position.includes('bottom');

   // Dynamic styles for preview
   const containerStyle = {
      fontFamily: 'Inter, sans-serif',
      backgroundColor: branding.theme === 'light' ? '#ffffff' : '#1e293b',
      color: branding.theme === 'light' ? '#0f172a' : '#f1f5f9',
   };

   const headerStyle = {
      backgroundColor: branding.primaryColor,
      color: '#ffffff'
   };

   const messageStyle = {
      backgroundColor: branding.theme === 'light' ? '#f1f5f9' : '#334155',
      color: branding.theme === 'light' ? '#0f172a' : '#f1f5f9',
   };

   const buttonStyle = {
      backgroundColor: 'transparent',
      borderColor: branding.secondaryColor,
      color: branding.secondaryColor,
   };

   return (
      <div className="relative w-full h-[600px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center p-8 select-none">
         {/* Mock Website Background */}
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-16 bg-slate-400 mb-8"></div>
            <div className="flex gap-8 px-8">
               <div className="w-64 h-96 bg-slate-300 rounded"></div>
               <div className="flex-1 space-y-4">
                  <div className="w-full h-8 bg-slate-300 rounded"></div>
                  <div className="w-3/4 h-4 bg-slate-300 rounded"></div>
                  <div className="w-full h-4 bg-slate-300 rounded"></div>
                  <div className="w-5/6 h-4 bg-slate-300 rounded"></div>
               </div>
            </div>
         </div>

         {/* Widget Container */}
         <div
            className={`absolute flex flex-col w-[350px] h-[500px] rounded-xl shadow-2xl overflow-hidden transition-all duration-300 z-10`}
            style={{
               ...containerStyle,
               [isBottom ? 'bottom' : 'top']: '2rem',
               [isRight ? 'right' : 'left']: '2rem',
            }}
         >
            {/* Widget Header */}
            <div className="p-4 flex items-center justify-between" style={headerStyle}>
               <div className="flex items-center gap-3">
                  {branding.logoUrl ? (
                     <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 rounded-full bg-white object-contain p-0.5" />
                  ) : (
                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                     </div>
                  )}
                  <div>
                     <div className="font-bold text-sm leading-tight">{branding.widgetName}</div>
                     <div className="text-[10px] opacity-80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                     </div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Minus className="w-4 h-4 opacity-70 hover:opacity-100 cursor-pointer" />
                  <X className="w-4 h-4 opacity-70 hover:opacity-100 cursor-pointer" />
               </div>
            </div>

            {/* Widget Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
               <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-200 overflow-hidden">
                     {branding.logoUrl ? <img src={branding.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-300"></div>}
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed max-w-[85%]" style={messageStyle}>
                     {branding.welcomeMessage || "Hello! How can I help you?"}
                  </div>
               </div>

               {/* Quick Suggestions */}
               {branding.quickSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-11">
                     {branding.quickSuggestions.map((s, i) => (
                        <button
                           key={i}
                           className="text-xs px-3 py-1.5 rounded-full border hover:bg-opacity-10 transition-colors"
                           style={buttonStyle}
                        >
                           {s}
                        </button>
                     ))}
                  </div>
               )}
            </div>

            {/* Widget Footer (Input) */}
            <div className="p-3 border-t" style={{ borderColor: branding.theme === 'light' ? '#e2e8f0' : '#334155' }}>
               <div className="flex items-center gap-2 bg-transparent">
                  <input
                     type="text"
                     placeholder={branding.inputPlaceholder}
                     className="flex-1 bg-transparent text-sm focus:outline-none placeholder:opacity-50"
                     style={{ color: branding.theme === 'light' ? '#0f172a' : '#f1f5f9' }}
                     readOnly
                  />
                  <button
                     className="p-2 rounded-full transition-colors"
                     style={{ color: branding.primaryColor }}
                  >
                     <Send className="w-4 h-4" />
                  </button>
               </div>
               <div className="text-[9px] text-center mt-2 opacity-40">
                  Powered by PairMind.AI
               </div>
            </div>
         </div>
      </div>
   );
};

// --- Modals ---

const ConfigEditModal: React.FC<{
   currentConfig: InstanceConfiguration;
   onClose: () => void;
   onSave: (config: InstanceConfiguration) => void;
   isSaving: boolean;
}> = ({ currentConfig, onClose, onSave, isSaving }) => {
   const [formData, setFormData] = useState<InstanceConfiguration>(currentConfig);

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
         <div className="relative bg-surface border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-primary" /> Edit Configuration
               </h3>
               <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6">
               {/* PII */}
               <div className="flex items-center justify-between p-4 bg-input rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${formData.piiAnonymization ? 'bg-success/10 text-success' : 'bg-slate-700/50 text-slate-400'}`}>
                        <ShieldCheck className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-slate-100">PII Anonymization</div>
                        <div className="text-xs text-slate-400">Redact sensitive info before logging</div>
                     </div>
                  </div>
                  <button
                     onClick={() => setFormData({ ...formData, piiAnonymization: !formData.piiAnonymization })}
                     className={`transition-colors ${formData.piiAnonymization ? 'text-primary' : 'text-slate-600'}`}
                  >
                     {formData.piiAnonymization ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
               </div>

               {/* Vector Store */}
               <div className="flex items-center justify-between p-4 bg-input rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${formData.vectorStore ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700/50 text-slate-400'}`}>
                        <Database className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-slate-100">Vector Store (RAG)</div>
                        <div className="text-xs text-slate-400">Enable retrieval augmented generation</div>
                     </div>
                  </div>
                  <button
                     onClick={() => setFormData({ ...formData, vectorStore: !formData.vectorStore })}
                     className={`transition-colors ${formData.vectorStore ? 'text-primary' : 'text-slate-600'}`}
                  >
                     {formData.vectorStore ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
               </div>

               {/* Prompt Caching */}
               <div className="flex items-center justify-between p-4 bg-input rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${formData.promptCaching ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-700/50 text-slate-400'}`}>
                        <Zap className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-slate-100">Prompt Caching</div>
                        <div className="text-xs text-slate-400">Cache common prompts to reduce latency</div>
                     </div>
                  </div>
                  <button
                     onClick={() => setFormData({ ...formData, promptCaching: !formData.promptCaching })}
                     className={`transition-colors ${formData.promptCaching ? 'text-primary' : 'text-slate-600'}`}
                  >
                     {formData.promptCaching ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
               </div>

               {/* Max ReAct */}
               <div className="p-4 bg-input rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                        <Cpu className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-slate-100">Max ReAct Iterations</div>
                        <div className="text-xs text-slate-400">Limit reasoning steps per query</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <input
                        type="range"
                        min="1"
                        max="20"
                        value={formData.maxReactIterations}
                        onChange={(e) => setFormData({ ...formData, maxReactIterations: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                     />
                     <div className="w-12 text-center bg-black/20 rounded border border-white/10 py-1 text-sm font-mono text-slate-200">
                        {formData.maxReactIterations}
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
               <button onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
               <button
                  onClick={() => onSave(formData)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait"
               >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Configuration
               </button>
            </div>
         </div>
      </div>
   );
};

const ConfigHistoryModal: React.FC<{
   history: ConfigurationHistoryItem[];
   onClose: () => void;
   onRollback: (versionId: string) => void;
   isRollingBack: boolean;
}> = ({ history, onClose, onRollback, isRollingBack }) => {
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
         <div className="relative bg-surface border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl p-6 animate-fade-in z-10 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Configuration History
               </h3>
               <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
               {history.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                     <p>No history available yet.</p>
                  </div>
               ) : (
                  history.map((item, index) => (
                     <div key={item.id} className="bg-input border border-white/5 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                        {index === 0 && <div className="absolute top-0 right-0 bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-bl-lg border-l border-b border-white/5">CURRENT</div>}

                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                                 <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                 <div className="text-sm font-bold text-slate-200">{item.versionId}</div>
                                 <div className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs text-slate-400">Modified by</div>
                              <div className="text-xs font-medium text-slate-300">{item.author}</div>
                           </div>
                        </div>

                        <div className="bg-black/20 rounded-lg p-3 text-xs font-mono text-slate-400 border border-white/5">
                           <div className="grid grid-cols-2 gap-2">
                              <span className={item.config.piiAnonymization ? "text-success" : "text-slate-500"}>PII: {item.config.piiAnonymization ? 'ON' : 'OFF'}</span>
                              <span className={item.config.vectorStore ? "text-purple-400" : "text-slate-500"}>RAG: {item.config.vectorStore ? 'ON' : 'OFF'}</span>
                              <span className={item.config.promptCaching ? "text-yellow-400" : "text-slate-500"}>Cache: {item.config.promptCaching ? 'ON' : 'OFF'}</span>
                              <span>MaxReAct: {item.config.maxReactIterations}</span>
                           </div>
                        </div>

                        {index > 0 && (
                           <div className="flex justify-end pt-2">
                              <button
                                 onClick={() => onRollback(item.versionId)}
                                 disabled={isRollingBack}
                                 className="text-xs flex items-center gap-1.5 text-primary hover:text-white transition-colors disabled:opacity-50"
                              >
                                 <RotateCcw className="w-3 h-3" /> Rollback to this version
                              </button>
                           </div>
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
};

// --- Upload RAG Document Modal ---
const UploadRagModal: React.FC<{
   onClose: () => void;
   onUpload: (file: File) => void;
   isUploading: boolean;
}> = ({ onClose, onUpload, isUploading }) => {
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [error, setError] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setError(null);
      if (!file) return;

      // Validate size (50MB)
      if (file.size > 50 * 1024 * 1024) {
         setError("File size exceeds 50MB limit.");
         return;
      }

      // Validate type
      const validTypes = ['.pdf', '.txt', '.md', '.doc', '.docx', '.html'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(extension)) {
         setError("Unsupported file format.");
         return;
      }

      setSelectedFile(file);
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
         <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-primary" /> Upload RAG Document
               </h3>
               <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
               <div
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${selectedFile ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                     }`}
                  onClick={() => fileInputRef.current?.click()}
               >
                  <input
                     type="file"
                     ref={fileInputRef}
                     className="hidden"
                     onChange={handleFileChange}
                     accept=".pdf,.txt,.md,.doc,.docx,.html"
                  />

                  {selectedFile ? (
                     <>
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3 text-primary">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-bold text-slate-100 break-all">{selectedFile.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                     </>
                  ) : (
                     <>
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-slate-400">
                           <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-medium text-slate-300">Click to select file</div>
                        <div className="text-xs text-slate-500 mt-1">PDF, TXT, MD, DOC, DOCX, HTML (Max 50MB)</div>
                     </>
                  )}
               </div>

               {error && (
                  <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-2 text-danger text-xs">
                     <AlertCircle className="w-4 h-4" />
                     {error}
                  </div>
               )}
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
               <button onClick={onClose} disabled={isUploading} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
               <button
                  onClick={() => selectedFile && onUpload(selectedFile)}
                  disabled={!selectedFile || isUploading || !!error}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait"
               >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  Upload
               </button>
            </div>
         </div>
      </div>
   );
};

// --- Manage Integrations Modal ---
const ManageIntegrationsModal: React.FC<{
   integrations: InstanceIntegration[];
   onClose: () => void;
   onSave: (updatedIntegrations: InstanceIntegration[]) => void;
}> = ({ integrations, onClose, onSave }) => {
   const [localIntegrations, setLocalIntegrations] = useState<InstanceIntegration[]>(JSON.parse(JSON.stringify(integrations)));
   const [isSaving, setIsSaving] = useState(false);

   const toggleStatus = (id: string) => {
      setLocalIntegrations(prev => prev.map(int =>
         int.id === id ? { ...int, status: int.status === 'Enabled' ? 'Disabled' : 'Enabled' } : int
      ));
   };

   const handleSave = async () => {
      setIsSaving(true);
      // Simulate API delay locally before calling parent
      await new Promise(r => setTimeout(r, 800));
      onSave(localIntegrations);
      setIsSaving(false);
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
         <div className="relative bg-surface border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" /> Manage Integrations
               </h3>
               <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
               {localIntegrations.map(int => (
                  <div key={int.id} className="flex items-center justify-between p-4 bg-input rounded-xl border border-white/5">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${int.status === 'Enabled' ? 'bg-primary/10 text-primary' : 'bg-slate-700/50 text-slate-400'}`}>
                           {IntegrationIcons[int.icon] || <Puzzle className="w-5 h-5" />}
                        </div>
                        <div>
                           <div className="text-sm font-bold text-slate-100">{int.name}</div>
                           <div className="text-xs text-slate-500 font-mono">{int.identifier}</div>
                        </div>
                     </div>
                     <button
                        onClick={() => toggleStatus(int.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${int.status === 'Enabled' ? 'bg-primary' : 'bg-slate-700'}`}
                     >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${int.status === 'Enabled' ? 'left-6' : 'left-1'}`}></span>
                     </button>
                  </div>
               ))}
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
               <button onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait"
               >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
               </button>
            </div>
         </div>
      </div>
   );
};

// --- Helper Components (reused) ---

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
   <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${active
         ? 'border-primary text-primary'
         : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10'
         }`}
   >
      {children}
   </button>
);

const DetailCard: React.FC<{ title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }> = ({ title, children, className, action }) => (
   <div className={`bg-surface border border-white/5 rounded-lg shadow-sm ${className}`}>
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
         <h3 className="text-slate-100 font-bold text-sm">{title}</h3>
         {action}
      </div>
      <div className="p-6">
         {children}
      </div>
   </div>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
   <div className={`flex justify-between items-center py-2 ${className}`}>
      <span className="text-slate-300 text-sm font-medium">{label}</span>
      <div className="text-sm text-right text-slate-100">{value}</div>
   </div>
);

const ProgressBar: React.FC<{ value: number; max: number; color?: string; label?: string; unit?: string }> = ({ value, max, color = 'bg-primary', label, unit = '' }) => {
   const percentage = Math.min(100, Math.max(0, (value / max) * 100));
   return (
      <div className="mb-4">
         <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="text-slate-200 font-mono">{value.toLocaleString()}{unit} / {max.toLocaleString()}{unit}</span>
         </div>
         <div className="w-full bg-slate-700/30 rounded-full h-1.5 overflow-hidden">
            <div className={`h-1.5 rounded-full transition-all duration-500 ease-out ${color}`} style={{ width: `${percentage}%` }}></div>
         </div>
      </div>
   );
};

const MonitoringCard: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactNode; subtext?: string; progress?: number; progressColor?: string }> = ({ label, value, icon, subtext, progress, progressColor = 'bg-blue-500' }) => (
   <div className="bg-surface border border-white/5 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
         <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</div>
         <div className="text-slate-500">{icon}</div>
      </div>
      <div className="text-xl font-bold text-slate-100">{value}</div>
      {progress !== undefined && (
         <div className="w-full bg-slate-700/30 h-1 rounded-full overflow-hidden mt-1">
            <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${Math.min(100, progress)}%` }}></div>
         </div>
      )}
      {subtext && <div className="text-[10px] text-slate-500 mt-0.5">{subtext}</div>}
   </div>
);

// --- Log Viewer Modal ---
const LogViewerModal: React.FC<{ logs: string[], onClose: () => void, title: string, isLoading: boolean }> = ({ logs, onClose, title, isLoading }) => {
   const endRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [logs, isLoading]);

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
         <div className="relative bg-[#0d1117] border border-white/10 w-full max-w-4xl rounded-xl shadow-2xl flex flex-col h-[80vh] font-mono text-sm animate-fade-in overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#161b22]">
               <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-200 font-bold">{title}</span>
               </div>
               <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-1 bg-[#0d1117]">
               {isLoading ? (
                  <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                     <Loader2 className="w-5 h-5 animate-spin" /> Fetching logs stream...
                  </div>
               ) : logs.length === 0 ? (
                  <div className="text-slate-500 italic">No logs available.</div>
               ) : (
                  logs.map((log, i) => {
                     // Basic highlighting
                     let colorClass = 'text-slate-400';
                     if (log.includes('[ERROR]')) colorClass = 'text-red-400';
                     else if (log.includes('[WARN]')) colorClass = 'text-yellow-400';
                     else if (log.includes('[DEBUG]')) colorClass = 'text-blue-400';
                     else if (log.includes('[INFO]')) colorClass = 'text-green-400';

                     return (
                        <div key={i} className={`whitespace-pre-wrap break-all hover:bg-white/[0.03] px-1 ${colorClass}`}>
                           <span className="text-slate-600 mr-3 select-none w-6 inline-block text-right">{i + 1}</span>
                           {log}
                        </div>
                     );
                  })
               )}
               <div ref={endRef} />
            </div>
         </div>
      </div>
   );
};

// --- Helper Icon for Settings ---
const SettingsIcon = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0-2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
   </svg>
);


const InstanceDetail: React.FC = () => {
   const { selectedInstance: instance, navigate, instances, setInstances, notify, user } = useGlobal();

   if (!instance) return null;

   const onUpdateStatus = async (id: string, status: InstanceStatus) => {
      const updatedList = instances.map(i => i.id === id ? { ...i, status } : i);
      await setInstances(updatedList);
   };

   const tabs = [
      'Overview', 'Configuration', 'Usage Statistics', 'Analytics', 'Branding',
      'Policies', 'Integrations', 'Monitoring', 'RAG Documents', 'Embed'
   ];

   const [activeTab, setActiveTab] = useState('Overview');
   const [copied, setCopied] = useState(false);

   // --- Real-time Monitoring State ---
   const [metrics, setMetrics] = useState({
      cpu: 45,
      memory: 1024,
      disk: 23,
      latency: 120
   });

   // --- Logs & Cache State ---
   const [showLogs, setShowLogs] = useState(false);
   const [logs, setLogs] = useState<string[]>([]);
   const [isLoadingLogs, setIsLoadingLogs] = useState(false);
   const [isClearingCache, setIsClearingCache] = useState(false);

   // --- Download State ---
   const [isDownloading, setIsDownloading] = useState(false);
   const [isDownloadingBoot, setIsDownloadingBoot] = useState(false);

   // --- Configuration State ---
   const [config, setConfig] = useState<InstanceConfiguration | null>(null);
   const [configHistory, setConfigHistory] = useState<ConfigurationHistoryItem[]>([]);
   const [isLoadingConfig, setIsLoadingConfig] = useState(false);
   const [showEditConfig, setShowEditConfig] = useState(false);
   const [showConfigHistory, setShowConfigHistory] = useState(false);
   const [isSavingConfig, setIsSavingConfig] = useState(false);
   const [isRollingBack, setIsRollingBack] = useState(false);

   // --- Overview State ---
   const [usage, setUsage] = useState<InstanceUsage | null>(null);
   const [latestConfigVersion, setLatestConfigVersion] = useState<string>('Loading...');

   // --- Embed State ---
   const [mcpHost, setMcpHost] = useState('');

   // --- RAG Documents State ---
   const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
   const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
   const [showUploadModal, setShowUploadModal] = useState(false);
   const [isUploading, setIsUploading] = useState(false);

   // --- Monitoring State ---
   const [monitoringData, setMonitoringData] = useState<InstanceMonitoringStats | null>(null);

   // --- Integrations State ---
   const [integrations, setIntegrations] = useState<InstanceIntegration[]>([]);
   const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
   const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);
   const [showManageIntegrations, setShowManageIntegrations] = useState(false);

   // --- Policies State ---
   const [policies, setPolicies] = useState<InstancePolicy | null>(null);
   const [isEditingPolicies, setIsEditingPolicies] = useState(false);
   const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
   const [localPolicyState, setLocalPolicyState] = useState<InstancePolicy | null>(null);

   // --- Branding State ---
   const [branding, setBranding] = useState<InstanceBranding | null>(null);
   const [isLoadingBranding, setIsLoadingBranding] = useState(false);
   const [isEditingBranding, setIsEditingBranding] = useState(false);
   const [localBrandingState, setLocalBrandingState] = useState<InstanceBranding | null>(null);

   // Load Config on Tab Change or Mount
   useEffect(() => {
      if (activeTab === 'Configuration') {
         const loadConfig = async () => {
            setIsLoadingConfig(true);
            try {
               const cfg = await InstanceService.getConfiguration(instance.id);
               setConfig(cfg);
            } catch (e) {
               console.error("Failed to load config", e);
            } finally {
               setIsLoadingConfig(false);
            }
         };
         loadConfig();
      } else if (activeTab === 'Overview' || activeTab === 'Usage Statistics') {
         const fetchData = async () => {
            try {
               const [stats, history] = await Promise.all([
                  InstanceService.getUsageStatistics(instance.id),
                  InstanceService.getConfigurationHistory(instance.id)
               ]);
               setUsage(stats);
               if (history.length > 0) {
                  setLatestConfigVersion(history[0].versionId);
               } else {
                  setLatestConfigVersion('v1.0.0 (Initial)');
               }
            } catch (e) {
               console.error(e);
            }
         };
         fetchData();
      } else if (activeTab === 'RAG Documents') {
         const fetchDocs = async () => {
            setIsLoadingDocuments(true);
            try {
               const docs = await RagService.getDocuments(instance.id);
               setRagDocuments(docs);
            } catch (e) {
               console.error("Failed to load docs", e);
            } finally {
               setIsLoadingDocuments(false);
            }
         };
         fetchDocs();
      } else if (activeTab === 'Integrations') {
         const fetchIntegrations = async () => {
            setIsLoadingIntegrations(true);
            try {
               const ints = await InstanceService.getIntegrations(instance.id);
               setIntegrations(ints);
            } catch (e) {
               console.error("Failed to load integrations", e);
            } finally {
               setIsLoadingIntegrations(false);
            }
         };
         fetchIntegrations();
      } else if (activeTab === 'Policies') {
         const fetchPolicies = async () => {
            setIsLoadingPolicies(true);
            try {
               const pols = await InstanceService.getPolicies(instance.id);
               setPolicies(pols);
               setLocalPolicyState(JSON.parse(JSON.stringify(pols)));
            } catch (e) {
               console.error("Failed to load policies", e);
            } finally {
               setIsLoadingPolicies(false);
            }
         };
         fetchPolicies();
      } else if (activeTab === 'Branding') {
         const fetchBranding = async () => {
            setIsLoadingBranding(true);
            try {
               const brand = await InstanceService.getBranding(instance.id);
               setBranding(brand);
               setLocalBrandingState(JSON.parse(JSON.stringify(brand)));
            } catch (e) {
               console.error("Failed to load branding", e);
            } finally {
               setIsLoadingBranding(false);
            }
         };
         fetchBranding();
      }
   }, [activeTab, instance.id]);

   // Poll Monitoring Data
   useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (activeTab === 'Monitoring') {
         const fetchStats = async () => {
            try {
               const stats = await InstanceService.getMonitoringStats(instance.id);
               setMonitoringData(stats);
            } catch (e) {
               console.error("Monitoring fetch failed", e);
            }
         };

         fetchStats();
         interval = setInterval(fetchStats, 10000);
      }
      return () => clearInterval(interval);
   }, [activeTab, instance.id]);

   const fetchHistory = async () => {
      try {
         const hist = await InstanceService.getConfigurationHistory(instance.id);
         setConfigHistory(hist);
      } catch (e) {
         notify("Failed to load history", "error");
      }
   };

   // Simulate Real-time Metrics (Overview only)
   useEffect(() => {
      if (instance.status !== InstanceStatus.ONLINE && instance.status !== InstanceStatus.ACTIVE) return;

      const interval = setInterval(() => {
         setMetrics(prev => ({
            cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() * 10 - 5))),
            memory: Math.min(4096, Math.max(512, prev.memory + (Math.random() * 200 - 100))),
            disk: Math.min(100, Math.max(10, prev.disk + (Math.random() * 1 - 0.5))),
            latency: Math.max(20, prev.latency + (Math.random() * 30 - 15))
         }));
      }, 2000);
      return () => clearInterval(interval);
   }, [instance.status]);

   // Helper for status dot
   const getStatusColor = (status: InstanceStatus) => {
      switch (status) {
         case InstanceStatus.ONLINE: return 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]';
         case InstanceStatus.BOOTSTRAPPING: return 'bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.5)] animate-pulse';
         case InstanceStatus.OFFLINE: return 'bg-slate-500';
         case InstanceStatus.PENDING_APPROVAL: return 'bg-warning';
         case InstanceStatus.PROVISIONED: return 'bg-[#F472B6]';
         default: return 'bg-slate-500';
      }
   };

   const getStatusLabel = (status: InstanceStatus) => {
      switch (status) {
         case InstanceStatus.ONLINE:
            return <span className="text-success font-bold flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-success"></div> Online</span>;
         case InstanceStatus.BOOTSTRAPPING:
            return <span className="text-[#22D3EE] font-bold flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></div> Provisioning</span>;
         case InstanceStatus.OFFLINE:
            return <span className="text-slate-400 font-bold flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Offline</span>;
         case InstanceStatus.PENDING_APPROVAL:
            return <span className="text-warning font-bold flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-warning"></div> Need Approval</span>;
         case InstanceStatus.PROVISIONED:
            return <span className="text-[#F472B6] font-bold flex items-center justify-end gap-2"><div className="w-2 h-2 rounded-full bg-[#F472B6]"></div> Binary Ready</span>;
         default:
            return <span className="text-slate-500">Unknown</span>;
      }
   };

   // --- Functional Handlers ---

   const handleApprove = () => {
      onUpdateStatus(instance.id, InstanceStatus.BOOTSTRAPPING);
      setTimeout(() => {
         onUpdateStatus(instance.id, InstanceStatus.PROVISIONED);
      }, 3000);
   };

   const handleDownloadBinary = async () => {
      setIsDownloading(true);
      try {
         await InstanceService.downloadMcpBinary(instance.id);

         const element = document.createElement("a");
         const content = `PairMind.AI Instance Binary\n\nInstance ID: ${instance.id}\nName: ${instance.name}\nLicense: ${instance.licenseKey}\nTier: ${instance.tier}\nGenerated: ${new Date().toISOString()}\n\n[BINARY PAYLOAD PLACEHOLDER]`;
         const file = new Blob([content], { type: 'text/plain' });
         element.href = URL.createObjectURL(file);
         element.download = `${instance.name.toLowerCase().replace(/\s+/g, '-')}-setup.bin`;
         document.body.appendChild(element);
         element.click();
         document.body.removeChild(element);

         notify('Binary downloaded successfully.', 'success');

         if (instance.status === InstanceStatus.PROVISIONED) {
            onUpdateStatus(instance.id, InstanceStatus.ONLINE);
         }
      } catch (e) {
         notify('Failed to download binary.', 'error');
      } finally {
         setIsDownloading(false);
      }
   };

   const handleDownloadBootstrap = async () => {
      setIsDownloadingBoot(true);
      try {
         await InstanceService.downloadOperatorBootstrap(instance.id);
         // Simulate file DL
         const element = document.createElement("a");
         element.href = '#';
         element.click();
         notify('Operator Bootstrap download started.', 'success');
      } catch (e) {
         notify('Failed to start bootstrap download.', 'error');
      } finally {
         setIsDownloadingBoot(false);
      }
   };

   const handleViewLogs = async () => {
      setShowLogs(true);
      setIsLoadingLogs(true);
      try {
         const fetchedLogs = await InstanceService.getLogs(instance.id);
         setLogs(fetchedLogs);
      } catch (e) {
         notify('Failed to fetch logs.', 'error');
      } finally {
         setIsLoadingLogs(false);
      }
   };

   const handleClearCache = async () => {
      setIsClearingCache(true);
      try {
         await InstanceService.clearCache(instance.id);
         notify('Cache cleared successfully.', 'success');
      } catch (e) {
         notify('Failed to clear cache.', 'error');
      } finally {
         setIsClearingCache(false);
      }
   };

   const handleSaveConfig = async (newConfig: InstanceConfiguration) => {
      setIsSavingConfig(true);
      try {
         const updated = await InstanceService.updateConfiguration(instance.id, newConfig, user?.name || 'Unknown');
         setConfig(updated);
         setShowEditConfig(false);
         notify('Configuration updated successfully.', 'success');
      } catch (e) {
         notify('Failed to update configuration.', 'error');
      } finally {
         setIsSavingConfig(false);
      }
   };

   const handleRollback = async (versionId: string) => {
      if (!AccessControlService.canEditConfiguration(user!)) {
         notify('Unauthorized', 'error');
         return;
      }

      if (confirm(`Are you sure you want to rollback to ${versionId}?`)) {
         setIsRollingBack(true);
         try {
            const rolledBackConfig = await InstanceService.rollbackConfiguration(instance.id, versionId, user?.name || 'Unknown');
            setConfig(rolledBackConfig);
            // Refresh history list to show the rollback event
            const hist = await InstanceService.getConfigurationHistory(instance.id);
            setConfigHistory(hist);
            notify(`Rolled back to ${versionId}.`, 'success');
         } catch (e) {
            notify('Rollback failed.', 'error');
         } finally {
            setIsRollingBack(false);
         }
      }
   };

   const handleCopyEmbed = () => {
      const host = mcpHost.trim() || 'https://YOUR_MCP_HOST';
      const code = `<!-- PairMind.AI Widget Embed -->
<script src="${host}/widget.js"></script>
<script>
  window.addEventListener('load', function() {
    if (window.SidekickWidget) {
      window.SidekickWidget.init({
        instanceId: '${instance.id}',
        // apiBaseUrl: '${host}',
      });
    }
  });
</script>`;
      navigator.clipboard.writeText(code);
      setCopied(true);
      notify('Embed snippet copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
   };

   const handleUploadDocument = async (file: File) => {
      setIsUploading(true);
      try {
         const newDoc = await RagService.uploadDocument(instance.id, file);
         setRagDocuments(prev => [newDoc, ...prev]);
         setShowUploadModal(false);
         notify('Document uploaded and queued for indexing.', 'success');
      } catch (e) {
         notify('Failed to upload document.', 'error');
      } finally {
         setIsUploading(false);
      }
   };

   const handleDeleteDocument = async (id: string) => {
      if (confirm('Are you sure you want to delete this document?')) {
         try {
            await RagService.deleteDocument(id);
            setRagDocuments(prev => prev.filter(d => d.id !== id));
            notify('Document deleted.', 'success');
         } catch (e) {
            notify('Failed to delete document.', 'error');
         }
      }
   };

   const handleSaveIntegrations = async (updatedIntegrations: InstanceIntegration[]) => {
      try {
         await InstanceService.saveIntegrations(instance.id, updatedIntegrations);
         setIntegrations(updatedIntegrations);
         setShowManageIntegrations(false);
         notify('Integrations updated successfully.', 'success');
      } catch (e) {
         notify('Failed to update integrations.', 'error');
      }
   };

   // --- Policy Handlers ---
   const handleToggleEditPolicies = () => {
      if (isEditingPolicies) {
         // Cancel edit: revert local state
         setLocalPolicyState(JSON.parse(JSON.stringify(policies)));
         setIsEditingPolicies(false);
      } else {
         // Start edit
         setLocalPolicyState(JSON.parse(JSON.stringify(policies)));
         setIsEditingPolicies(true);
      }
   };

   const handleSavePolicies = async () => {
      if (!localPolicyState) return;
      try {
         await InstanceService.savePolicies(instance.id, localPolicyState);
         setPolicies(localPolicyState);
         setIsEditingPolicies(false);
         notify('Policies updated successfully.', 'success');
      } catch (e) {
         notify('Failed to save policies.', 'error');
      }
   };

   const updatePermission = (integrationIdx: number, type: keyof PermissionMatrix, value: boolean) => {
      if (!localPolicyState) return;
      const newPermissions = [...localPolicyState.permissions];
      if (newPermissions[integrationIdx]) {
         // @ts-ignore
         newPermissions[integrationIdx][type] = value;
         setLocalPolicyState({ ...localPolicyState, permissions: newPermissions });
      }
   };

   const updateRateLimit = (key: 'queriesPerHour' | 'queriesPerDay', value: string) => {
      if (!localPolicyState) return;
      const numValue = parseInt(value) || 0;
      setLocalPolicyState({
         ...localPolicyState,
         rateLimits: { ...localPolicyState.rateLimits, [key]: numValue }
      });
   };

   const togglePiiRule = (idx: number) => {
      if (!localPolicyState) return;
      const newRules = [...localPolicyState.piiRules];
      newRules[idx].enabled = !newRules[idx].enabled;
      setLocalPolicyState({ ...localPolicyState, piiRules: newRules });
   };

   // --- Branding Handlers ---
   const handleToggleEditBranding = () => {
      if (isEditingBranding) {
         // Cancel
         setLocalBrandingState(JSON.parse(JSON.stringify(branding)));
         setIsEditingBranding(false);
      } else {
         // Edit
         setLocalBrandingState(JSON.parse(JSON.stringify(branding)));
         setIsEditingBranding(true);
      }
   };

   const handleSaveBranding = async () => {
      if (!localBrandingState) return;
      try {
         await InstanceService.saveBranding(instance.id, localBrandingState);
         setBranding(localBrandingState);
         setIsEditingBranding(false);
         notify('Branding updated successfully.', 'success');
      } catch (e) {
         notify('Failed to save branding.', 'error');
      }
   };

   const updateBrandingField = (field: keyof InstanceBranding, value: any) => {
      if (!localBrandingState) return;
      setLocalBrandingState({ ...localBrandingState, [field]: value });
   };

   const handleSuggestionChange = (idx: number, val: string) => {
      if (!localBrandingState) return;
      const newSuggestions = [...localBrandingState.quickSuggestions];
      newSuggestions[idx] = val;
      setLocalBrandingState({ ...localBrandingState, quickSuggestions: newSuggestions });
   };

   const addSuggestion = () => {
      if (!localBrandingState || localBrandingState.quickSuggestions.length >= 6) return;
      setLocalBrandingState({
         ...localBrandingState,
         quickSuggestions: [...localBrandingState.quickSuggestions, 'New Suggestion']
      });
   };

   const removeSuggestion = (idx: number) => {
      if (!localBrandingState) return;
      const newSuggestions = localBrandingState.quickSuggestions.filter((_, i) => i !== idx);
      setLocalBrandingState({ ...localBrandingState, quickSuggestions: newSuggestions });
   };

   return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10 relative">

         {/* Modals */}
         {showLogs && <LogViewerModal logs={logs} isLoading={isLoadingLogs} title={`Logs: ${instance.name}`} onClose={() => setShowLogs(false)} />}

         {showEditConfig && config && (
            <ConfigEditModal
               currentConfig={config}
               onClose={() => setShowEditConfig(false)}
               onSave={handleSaveConfig}
               isSaving={isSavingConfig}
            />
         )}

         {showConfigHistory && (
            <ConfigHistoryModal
               history={configHistory}
               onClose={() => setShowConfigHistory(false)}
               onRollback={handleRollback}
               isRollingBack={isRollingBack}
            />
         )}

         {showUploadModal && (
            <UploadRagModal
               onClose={() => setShowUploadModal(false)}
               onUpload={handleUploadDocument}
               isUploading={isUploading}
            />
         )}

         {showManageIntegrations && (
            <ManageIntegrationsModal
               integrations={integrations}
               onClose={() => setShowManageIntegrations(false)}
               onSave={handleSaveIntegrations}
            />
         )}

         {/* Header Section */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4">
            <div className="flex items-start gap-4">
               <button
                  onClick={() => navigate('INSTANCES')}
                  className="mt-1.5 p-1 -ml-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Back to Instances"
               >
                  <ArrowLeft className="w-6 h-6" />
               </button>

               <div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-3xl font-bold text-slate-100">{instance.name}</h1>
                     <div className={`w-3 h-3 rounded-full ${getStatusColor(instance.status)}`} title={`Status: ${instance.status}`} />

                     {/* Status Switch */}
                     <div className="flex items-center gap-2 ml-2">
                        <button
                           onClick={() => onUpdateStatus(instance.id, instance.status === InstanceStatus.ONLINE ? InstanceStatus.OFFLINE : InstanceStatus.ONLINE)}
                           className={`relative w-12 h-6 rounded-full transition-colors ${instance.status === InstanceStatus.ONLINE ? 'bg-success' : 'bg-slate-700'}`}
                           title="Toggle Instance Status"
                        >
                           <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${instance.status === InstanceStatus.ONLINE ? 'left-7' : 'left-1'}`}></span>
                        </button>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-sm">
                     <span className="text-[#F472B6] font-mono">{instance.id}</span>
                     <span className="w-px h-3 bg-white/20"></span>
                     <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                        {instance.tier}
                     </span>
                     <span className="w-px h-3 bg-white/20"></span>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-3 pl-10 lg:pl-0">
               {instance.status === InstanceStatus.PENDING_APPROVAL && (
                  <button
                     onClick={handleApprove}
                     className="px-4 py-2 bg-warning text-black hover:bg-warning/90 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2"
                  >
                     <CheckCircle className="w-4 h-4" /> Approve Provisioning
                  </button>
               )}

               {instance.status === InstanceStatus.BOOTSTRAPPING && (
                  <button disabled className="px-4 py-2 bg-accent/20 text-accent border border-accent/20 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 cursor-wait">
                     <Loader2 className="w-4 h-4 animate-spin" /> Provisioning...
                  </button>
               )}

               {instance.status === InstanceStatus.PROVISIONED && (
                  <button
                     onClick={handleDownloadBinary}
                     disabled={isDownloading}
                     className="px-4 py-2 bg-[#F472B6] text-white hover:bg-[#F472B6]/90 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                  >
                     {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                     {isDownloading ? 'Generating...' : 'Download Binary'}
                  </button>
               )}

               {(instance.status === InstanceStatus.ONLINE || instance.status === InstanceStatus.ACTIVE) && (
                  <>
                     <button
                        onClick={handleDownloadBootstrap}
                        disabled={isDownloadingBoot}
                        className="px-4 py-2 border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-70"
                     >
                        {isDownloadingBoot && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Download Operator Bootstrap
                     </button>
                     <button
                        onClick={handleDownloadBinary}
                        disabled={isDownloading}
                        className="px-4 py-2 border border-slate-600 text-slate-400 hover:text-white hover:border-white hover:bg-white/5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-70"
                     >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} MCP Binary
                     </button>
                  </>
               )}
            </div>
         </div>

         {/* Tabs Navigation */}
         <div className="border-b border-white/10 flex gap-0 overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
               <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                  {tab}
               </TabButton>
            ))}
         </div>

         {/* Tab Content Area */}
         <div className="min-h-[400px]">

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'Overview' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                  <DetailCard title="Instance Information">
                     <InfoRow label="Instance Name" value={instance.name} />
                     <InfoRow label="Instance ID" value={<span className="text-[#F472B6] font-mono">{instance.id}</span>} />
                     <InfoRow label="Version" value={instance.version} />
                     <InfoRow label="Deployment Type" value="Binary" />
                     <InfoRow label="Environment" value="Production" />
                     <InfoRow label="Created Timestamp" value={new Date(instance.created).toLocaleDateString()} />
                  </DetailCard>
                  <DetailCard title="Health & Status">
                     <InfoRow label="Lifecycle Status" value={getStatusLabel(instance.status)} />
                     <InfoRow label="Health State" value={
                        <span className={instance.health > 90 ? "text-success" : instance.health > 50 ? "text-warning" : "text-danger"}>
                           {instance.health > 90 ? 'Healthy' : instance.health > 50 ? 'Degraded' : 'Unknown'}
                        </span>
                     } />
                     <InfoRow label="Last Heartbeat" value={instance.lastSeen || 'N/A'} />
                     <InfoRow label="Active Config Version" value={<span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded">{latestConfigVersion}</span>} />
                  </DetailCard>
                  <DetailCard title="Usage This Month">
                     {usage ? (
                        <>
                           <ProgressBar value={usage.queriesUsed} max={usage.queriesLimit} label="Queries" />
                           <ProgressBar value={usage.concurrentUsers} max={usage.concurrentUsersLimit} label="Concurrent Users" color="bg-accent" />
                           <ProgressBar value={usage.ragDocuments} max={usage.ragDocumentsLimit} label="RAG Documents" color="bg-purple-500" />
                        </>
                     ) : (
                        <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
                     )}
                  </DetailCard>
                  <DetailCard title="License Information">
                     <InfoRow label="License Tier" value={<span className="font-bold text-slate-200">{instance.tier}</span>} />
                     <InfoRow label="License Expiry" value={instance.licenseExpiry ? new Date(instance.licenseExpiry).toLocaleDateString() : 'N/A'} />
                  </DetailCard>
               </div>
            )}

            {/* --- MONITORING TAB --- */}
            {activeTab === 'Monitoring' && (
               <div className="space-y-6 animate-fade-in">
                  {/* Banner */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-200 text-sm font-medium">Real-Time Monitoring – Data refreshes every 10 seconds</span>
                     </div>
                     <div className="text-xs text-slate-400 flex items-center gap-2">
                        {monitoringData && <>Last updated: {new Date(monitoringData.lastUpdated).toLocaleTimeString()}</>}
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                     </div>
                  </div>

                  {/* Metrics Grid */}
                  {!monitoringData ? (
                     <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
                  ) : (
                     <>
                        {/* Top Row: Health & Infrastructure */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           <MonitoringCard
                              label="Health Status"
                              value={<span className={`${monitoringData.status === 'Healthy' ? 'text-success' : 'text-warning'}`}>{monitoringData.status}</span>}
                              icon={<Activity className="w-5 h-5 text-slate-500" />}
                           />
                           <MonitoringCard
                              label="CPU Usage"
                              value={`${monitoringData.cpu}%`}
                              icon={<Cpu className="w-5 h-5 text-slate-500" />}
                              progress={monitoringData.cpu}
                              progressColor={monitoringData.cpu > 80 ? 'bg-danger' : 'bg-primary'}
                           />
                           <MonitoringCard
                              label="Memory Usage"
                              value={`${(monitoringData.memoryUsed / 1024).toFixed(1)} GB`}
                              icon={<HardDrive className="w-5 h-5 text-slate-500" />}
                              progress={(monitoringData.memoryUsed / monitoringData.memoryTotal) * 100}
                              subtext={`${monitoringData.memoryUsed} MB / ${monitoringData.memoryTotal} MB`}
                           />
                           <MonitoringCard
                              label="Disk Usage"
                              value={`${(monitoringData.diskUsed / 1024).toFixed(1)} GB`}
                              icon={<Database className="w-5 h-5 text-slate-500" />}
                              progress={(monitoringData.diskUsed / monitoringData.diskTotal) * 100}
                              subtext={`${monitoringData.diskUsed} MB / ${monitoringData.diskTotal} MB`}
                           />
                        </div>

                        {/* Second Row: Application Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           <MonitoringCard
                              label="Active Sessions"
                              value={monitoringData.activeSessions}
                              icon={<UsersIcon className="w-5 h-5 text-slate-500" />}
                           />
                           <MonitoringCard
                              label="Queries Today"
                              value={monitoringData.queriesToday.toLocaleString()}
                              icon={<SearchIcon className="w-5 h-5 text-slate-500" />}
                           />
                           <MonitoringCard
                              label="Cache Hit Rate"
                              value={`${monitoringData.cacheHitRate}%`}
                              icon={<Layers className="w-5 h-5 text-slate-500" />}
                              progress={monitoringData.cacheHitRate}
                              progressColor="bg-success"
                           />
                           <MonitoringCard
                              label="Avg Response Time"
                              value={`${monitoringData.avgResponseTime} ms`}
                              icon={<Clock className="w-5 h-5 text-slate-500" />}
                           />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                           {/* Integrations Table (2/3 width) */}
                           <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6 flex flex-col">
                              <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                                 <Server className="w-5 h-5 text-slate-500" /> Integration Health
                              </h3>
                              {monitoringData.integrations.length === 0 ? (
                                 <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No integration data available</div>
                              ) : (
                                 <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                       <thead>
                                          <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
                                             <th className="pb-3 font-semibold">Integration</th>
                                             <th className="pb-3 font-semibold">Status</th>
                                             <th className="pb-3 font-semibold">Success Rate (1h)</th>
                                             <th className="pb-3 font-semibold">Last Call</th>
                                             <th className="pb-3 font-semibold text-right">Last Error</th>
                                          </tr>
                                       </thead>
                                       <tbody className="divide-y divide-white/5">
                                          {monitoringData.integrations.map((int) => (
                                             <tr key={int.id}>
                                                <td className="py-3 font-medium text-slate-200">{int.name}</td>
                                                <td className="py-3">
                                                   <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${int.status === 'Healthy' ? 'bg-success/10 text-success border-success/20' :
                                                      int.status === 'Degraded' ? 'bg-warning/10 text-warning border-warning/20' :
                                                         'bg-danger/10 text-danger border-danger/20'
                                                      }`}>
                                                      {int.status === 'Healthy' && <CheckCircle className="w-3 h-3" />}
                                                      {int.status === 'Error' && <XCircle className="w-3 h-3" />}
                                                      {int.status}
                                                   </span>
                                                </td>
                                                <td className="py-3 text-slate-300">{int.successRate}%</td>
                                                <td className="py-3 text-slate-400 text-xs">{new Date(int.lastCall).toLocaleTimeString()}</td>
                                                <td className="py-3 text-right text-danger text-xs font-mono">{int.lastError || '-'}</td>
                                             </tr>
                                          ))}
                                       </tbody>
                                    </table>
                                 </div>
                              )}
                           </div>

                           {/* Quotas (1/3 width) */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6">
                              <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                                 <Zap className="w-5 h-5 text-slate-500" /> Quotas & Limits
                              </h3>
                              <div className="space-y-6">
                                 <ProgressBar
                                    label="Queries This Month"
                                    value={monitoringData.quotas.queriesMonth}
                                    max={monitoringData.quotas.queriesMonthLimit}
                                 />
                                 <ProgressBar
                                    label="Storage Used (MB)"
                                    value={monitoringData.quotas.storageUsed}
                                    max={monitoringData.quotas.storageLimit}
                                    color="bg-purple-500"
                                    unit=" MB"
                                 />
                              </div>
                           </div>
                        </div>
                     </>
                  )}
               </div>
            )}

            {/* --- BRANDING TAB --- */}
            {activeTab === 'Branding' && (
               <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
                     <div>
                        <h3 className="text-lg font-bold text-slate-100">Widget Branding & Appearance</h3>
                        <p className="text-sm text-slate-400 mt-1">Customize the look and feel of the embedded chat widget.</p>
                     </div>
                     <div className="flex gap-3">
                        {isEditingBranding ? (
                           <>
                              <button
                                 onClick={handleToggleEditBranding}
                                 className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
                              >
                                 Cancel
                              </button>
                              <button
                                 onClick={handleSaveBranding}
                                 className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-neon hover:bg-primaryHover flex items-center gap-2 transition-all"
                              >
                                 <Save className="w-4 h-4" /> Save Changes
                              </button>
                           </>
                        ) : (
                           <button
                              onClick={handleToggleEditBranding}
                              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 flex items-center gap-2 transition-all"
                           >
                              <Palette className="w-4 h-4" /> Edit Branding
                           </button>
                        )}
                     </div>
                  </div>

                  {isLoadingBranding || !localBrandingState ? (
                     <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Configuration Column */}
                        <div className="space-y-8">
                           {/* Identity */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6">
                              <h4 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                                 <Info className="w-4 h-4" /> Identity
                              </h4>
                              <div className="space-y-4">
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Widget Name</label>
                                    <input
                                       type="text"
                                       value={localBrandingState.widgetName}
                                       onChange={(e) => updateBrandingField('widgetName', e.target.value)}
                                       disabled={!isEditingBranding}
                                       className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Displayed in the widget header.</p>
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Logo URL</label>
                                    <input
                                       type="text"
                                       value={localBrandingState.logoUrl}
                                       onChange={(e) => updateBrandingField('logoUrl', e.target.value)}
                                       disabled={!isEditingBranding}
                                       className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                                       placeholder="https://example.com/logo.png"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Allowed Origins</label>
                                    <textarea
                                       value={localBrandingState.allowedOrigins.join('\n')}
                                       onChange={(e) => updateBrandingField('allowedOrigins', e.target.value.split('\n'))}
                                       disabled={!isEditingBranding}
                                       rows={3}
                                       className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono focus:outline-none focus:border-primary/50 disabled:opacity-50 resize-none"
                                       placeholder="https://yoursite.com"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">One URL per line. Wildcards (*) allowed for development.</p>
                                 </div>
                              </div>
                           </div>

                           {/* Appearance */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6">
                              <h4 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                                 <Palette className="w-4 h-4" /> Appearance
                              </h4>
                              <div className="space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Primary Color</label>
                                       <div className="flex gap-2">
                                          <input
                                             type="color"
                                             value={localBrandingState.primaryColor}
                                             onChange={(e) => updateBrandingField('primaryColor', e.target.value)}
                                             disabled={!isEditingBranding}
                                             className="h-9 w-9 p-0 border-0 rounded overflow-hidden cursor-pointer disabled:opacity-50"
                                          />
                                          <input
                                             type="text"
                                             value={localBrandingState.primaryColor}
                                             onChange={(e) => updateBrandingField('primaryColor', e.target.value)}
                                             disabled={!isEditingBranding}
                                             className="flex-1 bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono focus:outline-none focus:border-primary/50 disabled:opacity-50 uppercase"
                                          />
                                       </div>
                                    </div>
                                    <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Secondary Color</label>
                                       <div className="flex gap-2">
                                          <input
                                             type="color"
                                             value={localBrandingState.secondaryColor}
                                             onChange={(e) => updateBrandingField('secondaryColor', e.target.value)}
                                             disabled={!isEditingBranding}
                                             className="h-9 w-9 p-0 border-0 rounded overflow-hidden cursor-pointer disabled:opacity-50"
                                          />
                                          <input
                                             type="text"
                                             value={localBrandingState.secondaryColor}
                                             onChange={(e) => updateBrandingField('secondaryColor', e.target.value)}
                                             disabled={!isEditingBranding}
                                             className="flex-1 bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono focus:outline-none focus:border-primary/50 disabled:opacity-50 uppercase"
                                          />
                                       </div>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Position</label>
                                       <select
                                          value={localBrandingState.position}
                                          onChange={(e) => updateBrandingField('position', e.target.value)}
                                          disabled={!isEditingBranding}
                                          className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                                       >
                                          <option value="bottom-right">Bottom Right</option>
                                          <option value="bottom-left">Bottom Left</option>
                                          <option value="top-right">Top Right</option>
                                          <option value="top-left">Top Left</option>
                                       </select>
                                    </div>
                                    <div>
                                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Theme</label>
                                       <select
                                          value={localBrandingState.theme}
                                          onChange={(e) => updateBrandingField('theme', e.target.value)}
                                          disabled={!isEditingBranding}
                                          className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                                       >
                                          <option value="light">Light</option>
                                          <option value="dark">Dark</option>
                                       </select>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Content */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6">
                              <h4 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                                 <MessageSquare className="w-4 h-4" /> Content
                              </h4>
                              <div className="space-y-4">
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Welcome Message</label>
                                    <textarea
                                       value={localBrandingState.welcomeMessage}
                                       onChange={(e) => updateBrandingField('welcomeMessage', e.target.value)}
                                       disabled={!isEditingBranding}
                                       rows={2}
                                       className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50 resize-none"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Input Placeholder</label>
                                    <input
                                       type="text"
                                       value={localBrandingState.inputPlaceholder}
                                       onChange={(e) => updateBrandingField('inputPlaceholder', e.target.value)}
                                       disabled={!isEditingBranding}
                                       className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                                    />
                                 </div>
                              </div>
                           </div>

                           {/* Suggestions */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6">
                              <div className="flex justify-between items-center mb-4">
                                 <h4 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Quick Suggestions
                                 </h4>
                                 {isEditingBranding && localBrandingState.quickSuggestions.length < 6 && (
                                    <button onClick={addSuggestion} className="text-xs text-primary hover:text-white flex items-center gap-1">
                                       <Plus className="w-3 h-3" /> Add
                                    </button>
                                 )}
                              </div>
                              <div className="space-y-2">
                                 {localBrandingState.quickSuggestions.map((suggestion, idx) => (
                                    <div key={idx} className="flex gap-2">
                                       <input
                                          type="text"
                                          value={suggestion}
                                          onChange={(e) => handleSuggestionChange(idx, e.target.value)}
                                          disabled={!isEditingBranding}
                                          className="flex-1 bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                                       />
                                       {isEditingBranding && (
                                          <button onClick={() => removeSuggestion(idx)} className="p-2 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                                             <Trash className="w-4 h-4" />
                                          </button>
                                       )}
                                    </div>
                                 ))}
                                 {localBrandingState.quickSuggestions.length === 0 && (
                                    <div className="text-xs text-slate-500 italic text-center py-2">No suggestions added.</div>
                                 )}
                              </div>
                           </div>
                        </div>

                        {/* Live Preview Column */}
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-300 uppercase">Live Preview</h4>
                              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">
                                 Updates in real-time
                              </span>
                           </div>
                           <div className="sticky top-6">
                              <WidgetPreview branding={localBrandingState} />
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}
            {/* --- USAGE STATISTICS TAB --- */}
            {activeTab === 'Usage Statistics' && (
               <div className="animate-fade-in space-y-6">
                  <div className="bg-surface border border-white/5 rounded-2xl p-6">
                     <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Resource Utilization
                     </h3>
                     {usage ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <div className="p-4 bg-input rounded-xl border border-white/5">
                              <ProgressBar value={usage.queriesUsed} max={usage.queriesLimit} label="Monthly Queries" unit="" />
                              <p className="text-xs text-slate-500 mt-2">Resets in 12 days</p>
                           </div>
                           <div className="p-4 bg-input rounded-xl border border-white/5">
                              <ProgressBar value={usage.concurrentUsers} max={usage.concurrentUsersLimit} label="Concurrent Users" unit="" color="bg-accent" />
                              <p className="text-xs text-slate-500 mt-2">Active sessions right now</p>
                           </div>
                           <div className="p-4 bg-input rounded-xl border border-white/5">
                              <ProgressBar value={usage.ragDocuments} max={usage.ragDocumentsLimit} label="RAG Documents" unit="" color="bg-purple-500" />
                              <p className="text-xs text-slate-500 mt-2">Knowledge base capacity</p>
                           </div>
                        </div>
                     ) : (
                        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
                     )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-surface border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-slate-300 uppercase mb-4">Historical Consumption</h3>
                        <div className="h-[250px] flex items-center justify-center text-slate-500 text-xs italic bg-white/5 rounded-lg border border-dashed border-white/10">
                           Usage history chart would appear here
                        </div>
                     </div>
                     <div className="bg-surface border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-slate-300 uppercase mb-4">Plan Quotas</h3>
                        <div className="space-y-4">
                           <InfoRow label="Plan Tier" value={instance.tier} />
                           <InfoRow label="API Requests / Month" value={usage?.queriesLimit.toLocaleString() || '-'} />
                           <InfoRow label="Storage Limit" value="10 GB" />
                           <InfoRow label="Max Concurrent Sessions" value={usage?.concurrentUsersLimit.toLocaleString() || '-'} />
                           <InfoRow label="Support Level" value={instance.tier === 'Enterprise' ? '24/7 Dedicated' : 'Standard Business Hours'} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* --- CONFIGURATION TAB --- */}
            {activeTab === 'Configuration' && (
               <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
                     <div>
                        <h3 className="text-lg font-bold text-slate-100">Instance Configuration</h3>
                        <p className="text-sm text-slate-400 mt-1">Runtime parameters and behavior controls.</p>
                     </div>
                     <div className="flex gap-3">
                        {AccessControlService.canEditConfiguration(user!) && (
                           <button
                              onClick={() => setShowEditConfig(true)}
                              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-neon hover:bg-primaryHover flex items-center gap-2"
                           >
                              <SettingsIcon className="w-4 h-4" /> Edit Configuration
                           </button>
                        )}
                     </div>
                  </div>

                  {isLoadingConfig || !config ? (
                     <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                     </div>
                  ) : (
                     <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           {/* PII Card */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                              <div className="flex justify-between items-start mb-4">
                                 <div className={`p-3 rounded-xl ${config.piiAnonymization ? 'bg-success/10 text-success' : 'bg-slate-700/50 text-slate-400'}`}>
                                    <ShieldCheck className="w-6 h-6" />
                                 </div>
                                 <div className={`text-xs font-bold px-2 py-1 rounded border ${config.piiAnonymization ? 'border-success/20 text-success bg-success/5' : 'border-slate-600 text-slate-400'}`}>
                                    {config.piiAnonymization ? 'ENABLED' : 'DISABLED'}
                                 </div>
                              </div>
                              <div className="text-lg font-bold text-slate-100 mb-1">PII Anonymization</div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                 Automatically detects and redacts sensitive personally identifiable information from logs and storage.
                              </p>
                           </div>

                           {/* RAG Card */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                              <div className="flex justify-between items-start mb-4">
                                 <div className={`p-3 rounded-xl ${config.vectorStore ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                    <Database className="w-6 h-6" />
                                 </div>
                                 <div className={`text-xs font-bold px-2 py-1 rounded border ${config.vectorStore ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' : 'border-slate-600 text-slate-400'}`}>
                                    {config.vectorStore ? 'ENABLED' : 'DISABLED'}
                                 </div>
                              </div>
                              <div className="text-lg font-bold text-slate-100 mb-1">Vector Store (RAG)</div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                 Retrieval Augmented Generation using the attached vector database for context-aware responses.
                              </p>
                           </div>

                           {/* Prompt Caching Card */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                              <div className="flex justify-between items-start mb-4">
                                 <div className={`p-3 rounded-xl ${config.promptCaching ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                    <Zap className="w-6 h-6" />
                                 </div>
                                 <div className={`text-xs font-bold px-2 py-1 rounded border ${config.promptCaching ? 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' : 'border-slate-600 text-slate-400'}`}>
                                    {config.promptCaching ? 'ENABLED' : 'DISABLED'}
                                 </div>
                              </div>
                              <div className="text-lg font-bold text-slate-100 mb-1">Prompt Caching</div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                 Caches frequent prompts and embeddings to improve latency and reduce inference costs.
                              </p>
                           </div>

                           {/* Max ReAct Card */}
                           <div className="bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                    <Cpu className="w-6 h-6" />
                                 </div>
                                 <div className="text-xs font-bold px-2 py-1 rounded border border-blue-500/20 text-blue-400 bg-blue-500/5">
                                    VALUE: {config.maxReactIterations}
                                 </div>
                              </div>
                              <div className="text-lg font-bold text-slate-100 mb-1">Max ReAct Iterations</div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                 Maximum number of reasoning steps the agent can take before forcing a final response.
                              </p>
                           </div>
                        </div>

                        {/* Configuration History Section */}
                        <div className="bg-surface border border-white/5 rounded-2xl p-6">
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                 <History className="w-5 h-5 text-primary" />
                                 <h3 className="text-lg font-bold text-slate-100">Configuration History</h3>
                              </div>
                              {configHistory.length === 0 && (
                                 <button
                                    onClick={fetchHistory}
                                    className="px-3 py-1.5 text-xs border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 flex items-center gap-2"
                                 >
                                    <RefreshCw className="w-3 h-3" /> Load History
                                 </button>
                              )}
                           </div>

                           <div className="space-y-4">
                              {configHistory.length === 0 ? (
                                 <div className="text-center py-10 text-slate-500">
                                    <p className="text-sm">No history loaded yet.</p>
                                    <p className="text-xs mt-1">Click "Load History" to view configuration changes.</p>
                                 </div>
                              ) : (
                                 configHistory.map((item, index) => (
                                    <div key={item.id} className="bg-input border border-white/5 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                                       {index === 0 && <div className="absolute top-0 right-0 bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-bl-lg border-l border-b border-white/5">CURRENT</div>}

                                       <div className="flex justify-between items-start">
                                          <div className="flex items-center gap-3">
                                             <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                                                <Clock className="w-4 h-4" />
                                             </div>
                                             <div>
                                                <div className="text-sm font-bold text-slate-200">{item.versionId}</div>
                                                <div className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</div>
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <div className="text-xs text-slate-400">Modified by</div>
                                             <div className="text-xs font-medium text-slate-300">{item.author}</div>
                                          </div>
                                       </div>

                                       <div className="bg-black/20 rounded-lg p-3 text-xs font-mono text-slate-400 border border-white/5">
                                          <div className="grid grid-cols-2 gap-2">
                                             <span className={item.config.piiAnonymization ? "text-success" : "text-slate-500"}>PII: {item.config.piiAnonymization ? 'ON' : 'OFF'}</span>
                                             <span className={item.config.vectorStore ? "text-purple-400" : "text-slate-500"}>RAG: {item.config.vectorStore ? 'ON' : 'OFF'}</span>
                                             <span className={item.config.promptCaching ? "text-yellow-400" : "text-slate-500"}>Cache: {item.config.promptCaching ? 'ON' : 'OFF'}</span>
                                             <span>MaxReAct: {item.config.maxReactIterations}</span>
                                          </div>
                                       </div>

                                       {index > 0 && (
                                          <div className="flex justify-end pt-2">
                                             <button
                                                onClick={() => handleRollback(item.versionId)}
                                                disabled={isRollingBack}
                                                className="text-xs flex items-center gap-1.5 text-primary hover:text-white transition-colors disabled:opacity-50"
                                             >
                                                <RotateCcw className="w-3 h-3" /> Rollback to this version
                                             </button>
                                          </div>
                                       )}
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>
                     </>
                  )}
               </div>
            )}


            {/* --- POLICIES TAB --- */}
            {activeTab === 'Policies' && (
               <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
                     <div>
                        <h3 className="text-lg font-bold text-slate-100">Policies & Security</h3>
                        <p className="text-sm text-slate-400 mt-1">Configure access controls, rate limits, and data protection rules.</p>
                     </div>
                     <div className="flex gap-3">
                        {isEditingPolicies ? (
                           <>
                              <button
                                 onClick={handleToggleEditPolicies}
                                 className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
                              >
                                 Cancel
                              </button>
                              <button
                                 onClick={handleSavePolicies}
                                 className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-neon hover:bg-primaryHover flex items-center gap-2 transition-all"
                              >
                                 <Save className="w-4 h-4" /> Save Changes
                              </button>
                           </>
                        ) : (
                           <button
                              onClick={handleToggleEditPolicies}
                              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/10 flex items-center gap-2 transition-all"
                           >
                              <Settings2 className="w-4 h-4" /> Edit Policies
                           </button>
                        )}
                     </div>
                  </div>

                  {isLoadingPolicies || !localPolicyState ? (
                     <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                     </div>
                  ) : (
                     <div className="space-y-6">
                        {/* Operation Permissions */}
                        <div className="bg-surface border border-white/5 rounded-2xl p-6">
                           <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                              <Lock className="w-5 h-5 text-primary" /> Operation Permissions
                           </h3>
                           <p className="text-sm text-slate-400 mb-6">Control what operations users can perform in each integration.</p>

                           <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm">
                                 <thead>
                                    <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
                                       <th className="pb-3 font-semibold w-1/3">Integration</th>
                                       <th className="pb-3 font-semibold text-center">Read</th>
                                       <th className="pb-3 font-semibold text-center">Create</th>
                                       <th className="pb-3 font-semibold text-center">Update</th>
                                       <th className="pb-3 font-semibold text-center">Delete</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                    {localPolicyState.permissions.map((perm, idx) => (
                                       <tr key={perm.integration}>
                                          <td className="py-4 font-medium text-slate-200">{perm.integration}</td>
                                          <td className="py-4 text-center">
                                             <input
                                                type="checkbox"
                                                checked={perm.read}
                                                onChange={(e) => updatePermission(idx, 'read', e.target.checked)}
                                                disabled={!isEditingPolicies}
                                                className="w-4 h-4 rounded border-slate-600 bg-input text-primary focus:ring-primary/50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                             />
                                          </td>
                                          <td className="py-4 text-center">
                                             <input
                                                type="checkbox"
                                                checked={perm.create}
                                                onChange={(e) => updatePermission(idx, 'create', e.target.checked)}
                                                disabled={!isEditingPolicies}
                                                className="w-4 h-4 rounded border-slate-600 bg-input text-primary focus:ring-primary/50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                             />
                                          </td>
                                          <td className="py-4 text-center">
                                             <input
                                                type="checkbox"
                                                checked={perm.update}
                                                onChange={(e) => updatePermission(idx, 'update', e.target.checked)}
                                                disabled={!isEditingPolicies}
                                                className="w-4 h-4 rounded border-slate-600 bg-input text-primary focus:ring-primary/50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                             />
                                          </td>
                                          <td className="py-4 text-center">
                                             <input
                                                type="checkbox"
                                                checked={perm.delete}
                                                onChange={(e) => updatePermission(idx, 'delete', e.target.checked)}
                                                disabled={!isEditingPolicies}
                                                className="w-4 h-4 rounded border-slate-600 bg-input text-primary focus:ring-primary/50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                             />
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>

                        {/* Rate Limiting */}
                        <div className="bg-surface border border-white/5 rounded-2xl p-6">
                           <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                              <Activity className="w-5 h-5 text-accent" /> Rate Limiting
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Queries per User per Hour</label>
                                 <input
                                    type="number"
                                    value={localPolicyState.rateLimits.queriesPerHour}
                                    onChange={(e) => updateRateLimit('queriesPerHour', e.target.value)}
                                    disabled={!isEditingPolicies}
                                    className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                 />
                                 <p className="text-[10px] text-slate-500 mt-1.5">Maximum number of requests a single user can make in an hour.</p>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Queries per User per Day</label>
                                 <input
                                    type="number"
                                    value={localPolicyState.rateLimits.queriesPerDay}
                                    onChange={(e) => updateRateLimit('queriesPerDay', e.target.value)}
                                    disabled={!isEditingPolicies}
                                    className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                 />
                                 <p className="text-[10px] text-slate-500 mt-1.5">Daily cap per user. Resets at 00:00 UTC.</p>
                              </div>
                           </div>
                        </div>

                        {/* PII Redaction Rules */}
                        <div className="bg-surface border border-white/5 rounded-2xl p-6">
                           <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                              <Shield className="w-5 h-5 text-warning" /> PII Redaction Rules
                           </h3>
                           <p className="text-sm text-slate-400 mb-6">Automatically detect and redact sensitive information using regex patterns.</p>

                           <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm">
                                 <thead>
                                    <tr className="text-slate-500 text-xs uppercase border-b border-white/5">
                                       <th className="pb-3 font-semibold">Rule Name</th>
                                       <th className="pb-3 font-semibold">Pattern (Regex)</th>
                                       <th className="pb-3 font-semibold">Replacement</th>
                                       <th className="pb-3 font-semibold text-right">Enabled</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                    {localPolicyState.piiRules.map((rule, idx) => (
                                       <tr key={rule.id}>
                                          <td className="py-4 font-medium text-slate-200">{rule.name}</td>
                                          <td className="py-4 font-mono text-xs text-slate-400 bg-black/10 px-2 rounded w-fit">{rule.pattern}</td>
                                          <td className="py-4 text-slate-300">{rule.replacement}</td>
                                          <td className="py-4 text-right">
                                             <button
                                                onClick={() => togglePiiRule(idx)}
                                                disabled={!isEditingPolicies}
                                                className={`relative w-10 h-5 rounded-full transition-colors ${rule.enabled ? 'bg-success' : 'bg-slate-700'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                             >
                                                <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${rule.enabled ? 'left-6' : 'left-1'}`}></span>
                                             </button>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {/* --- INTEGRATIONS TAB --- */}
            {activeTab === 'Integrations' && (
               <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
                     <div>
                        <h3 className="text-lg font-bold text-slate-100">External Integrations</h3>
                        <p className="text-sm text-slate-400 mt-1">Connect your AI instance to third-party services.</p>
                     </div>
                     <button
                        onClick={() => setShowManageIntegrations(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-neon hover:bg-primaryHover flex items-center gap-2"
                     >
                        <Settings2 className="w-4 h-4" /> Edit Integrations
                     </button>
                  </div>

                  {isLoadingIntegrations ? (
                     <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {integrations.map(int => (
                           <div key={int.id} className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-white/10">
                              {/* Row Header */}
                              <div
                                 className="flex items-center justify-between p-6 cursor-pointer"
                                 onClick={() => setExpandedIntegration(expandedIntegration === int.id ? null : int.id)}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl border border-white/10 ${int.status === 'Enabled' ? 'bg-primary/10 text-primary' : 'bg-surfaceHighlight text-slate-500'}`}>
                                       {IntegrationIcons[int.icon] || <Puzzle className="w-6 h-6" />}
                                    </div>
                                    <div>
                                       <h4 className="text-base font-bold text-slate-100">{int.name}</h4>
                                       <div className="text-xs text-slate-500 font-mono mt-0.5">{int.identifier}</div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${int.status === 'Enabled' ? 'bg-success/10 text-success border-success/20' : 'bg-white/5 text-slate-500 border-white/10'
                                       }`}>
                                       {int.status}
                                    </span>
                                    {expandedIntegration === int.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                 </div>
                              </div>

                              {/* Expanded Details */}
                              {expandedIntegration === int.id && (
                                 <div className="px-6 pb-6 pt-0 animate-fade-in border-t border-white/5 bg-white/[0.01]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                       <div>
                                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Configuration Details</h5>
                                          <div className="space-y-3">
                                             <div>
                                                <label className="text-xs text-slate-400 block mb-1">API Endpoint</label>
                                                <div className="bg-input border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono flex items-center gap-2">
                                                   <Lock className="w-3 h-3" /> https://api.gateway.pairmind.ai/v1/{int.id}
                                                </div>
                                             </div>
                                             <div>
                                                <label className="text-xs text-slate-400 block mb-1">Webhook URL</label>
                                                <div className="bg-input border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono">
                                                   https://hooks.pairmind.ai/callback/{instance.id}/{int.id}
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                       <div>
                                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Connection Status</h5>
                                          <div className="flex items-center gap-3 mb-4">
                                             <div className={`w-3 h-3 rounded-full ${int.status === 'Enabled' ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                                             <span className={`text-sm font-medium ${int.status === 'Enabled' ? 'text-slate-200' : 'text-slate-500'}`}>
                                                {int.status === 'Enabled' ? 'Connected & Healthy' : 'Disconnected'}
                                             </span>
                                          </div>
                                          <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Credentials</h5>
                                          <div className="bg-input border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono flex justify-between items-center opacity-60">
                                             <span>sk_live_••••••••••••••••</span>
                                             <span className="text-[10px] text-slate-600 bg-white/5 px-1.5 rounded">HIDDEN</span>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            )}

            {/* --- RAG DOCUMENTS TAB --- */}
            {activeTab === 'RAG Documents' && (
               <div className="animate-fade-in space-y-6">
                  <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                     <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <div>
                           <h3 className="text-lg font-bold text-slate-100">RAG Knowledge Base Documents</h3>
                           <p className="text-sm text-slate-400 mt-1">Manage documents used for retrieval augmented generation.</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-xs font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                              {ragDocuments.length} / 10000 Documents
                           </div>
                           <button
                              onClick={() => setShowUploadModal(true)}
                              className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium shadow-neon flex items-center gap-2 transition-all"
                           >
                              <UploadCloud className="w-4 h-4" /> Upload Document
                           </button>
                        </div>
                     </div>

                     {isLoadingDocuments ? (
                        <div className="flex justify-center py-20">
                           <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                     ) : ragDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                              <FileText className="w-8 h-8 opacity-40" />
                           </div>
                           <h3 className="text-lg font-medium text-slate-300">No documents uploaded yet</h3>
                           <p className="text-sm mt-1 max-w-xs text-center">Upload your first document to populate the knowledge base.</p>
                        </div>
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm">
                              <thead>
                                 <tr className="bg-white/[0.02] text-slate-400 uppercase text-xs tracking-wider border-b border-white/5">
                                    <th className="p-4 font-semibold">Filename</th>
                                    <th className="p-4 font-semibold">Type</th>
                                    <th className="p-4 font-semibold">Size</th>
                                    <th className="p-4 font-semibold">Uploaded</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 {ragDocuments.map(doc => (
                                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                                       <td className="p-4">
                                          <div className="flex items-center gap-3">
                                             <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                                                <FileText className="w-4 h-4" />
                                             </div>
                                             <div className="font-medium text-slate-200">{doc.filename}</div>
                                          </div>
                                       </td>
                                       <td className="p-4 text-slate-400 text-xs font-mono">{doc.type}</td>
                                       <td className="p-4 text-slate-400">{(doc.size / 1024).toFixed(1)} KB</td>
                                       <td className="p-4 text-slate-400">{new Date(doc.uploadedAt).toLocaleString()}</td>
                                       <td className="p-4">
                                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${doc.status === 'Indexed' ? 'bg-success/10 text-success border-success/20' :
                                             doc.status === 'Processing' ? 'bg-accent/10 text-accent border-accent/20' :
                                                doc.status === 'Queued' ? 'bg-warning/10 text-warning border-warning/20' :
                                                   'bg-danger/10 text-danger border-danger/20'
                                             }`}>
                                             {doc.status === 'Indexed' && <CheckCircle className="w-3 h-3" />}
                                             {doc.status === 'Processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                                             {doc.status === 'Queued' && <Clock className="w-3 h-3" />}
                                             {doc.status === 'Failed' && <AlertCircle className="w-3 h-3" />}
                                             {doc.status}
                                          </span>
                                       </td>
                                       <td className="p-4 text-right">
                                          <button
                                             onClick={() => handleDeleteDocument(doc.id)}
                                             className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                             title="Delete Document"
                                          >
                                             <Trash className="w-4 h-4" />
                                          </button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
                     <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                     <div className="text-sm text-slate-300">
                        <p className="font-bold text-primary mb-1">Supported Formats: PDF, TXT, MD, DOC, DOCX, HTML</p>
                        <p>Documents are automatically indexed and searchable within a few minutes of upload. Ensure files are under 50MB.</p>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'Analytics' && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-2 h-[300px] bg-surface border border-white/5 rounded-lg p-6">
                        <h3 className="text-slate-100 font-bold text-sm mb-4">Request Volume (7D)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={ANALYTICS_DATA}>
                              <defs>
                                 <linearGradient id="colorQueries2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#04293A', borderColor: '#ffffff20', color: '#fff' }} />
                              <Area type="monotone" dataKey="queries" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorQueries2)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="h-[300px] bg-surface border border-white/5 rounded-lg p-6">
                        <h3 className="text-slate-100 font-bold text-sm mb-4">Tokens Generated</h3>
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={ANALYTICS_DATA}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#04293A', borderColor: '#ffffff20', color: '#fff' }} />
                              <Bar dataKey="cost" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>
            )}

            {/* --- EMBED TAB --- */}
            {activeTab === 'Embed' && (
               <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
                  <div className="bg-surface border border-white/5 rounded-2xl p-6">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-lg font-bold text-slate-100">Embed on Your Website</h3>
                           <p className="text-sm text-slate-400 mt-1">Integrate the AI chat widget into your own applications.</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg">
                           <Code className="w-6 h-6 text-primary" />
                        </div>
                     </div>

                     <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3 mb-8">
                        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                        <div className="space-y-2">
                           <p className="text-sm text-warning font-bold">Integration Requirements</p>
                           <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                              <li>The embed code must be pasted before the closing <code className="bg-black/20 px-1 py-0.5 rounded text-warning/80">&lt;/body&gt;</code> tag.</li>
                              <li>You must replace <code className="bg-black/20 px-1 py-0.5 rounded text-warning/80">YOUR_MCP_HOST</code> with your deployed MCP server URL.</li>
                              <li><strong>Important:</strong> You must add your website's origin (e.g., https://mysite.com) under the <button onClick={() => setActiveTab('Branding')} className="underline hover:text-white">Branding &rarr; Allowed Origins</button> settings, otherwise the widget will be blocked.</li>
                           </ul>
                        </div>
                     </div>

                     <div className="space-y-4 mb-6">
                        <label className="block text-sm font-medium text-slate-300">MCP Host Configuration</label>
                        <div className="flex gap-3">
                           <div className="relative flex-1">
                              <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                              <input
                                 type="text"
                                 value={mcpHost}
                                 onChange={(e) => setMcpHost(e.target.value)}
                                 className="w-full bg-input border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600"
                                 placeholder="https://YOUR_MCP_HOST"
                              />
                           </div>
                        </div>
                        <p className="text-xs text-slate-500">This URL is used to load the widget script and establish the WebSocket connection.</p>
                     </div>

                     <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
                        <div className="absolute right-4 top-4 z-10">
                           <button
                              onClick={handleCopyEmbed}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium rounded-lg transition-colors backdrop-blur-md border border-white/5"
                           >
                              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              {copied ? 'Copied!' : 'Copy Snippet'}
                           </button>
                        </div>
                        <div className="p-6 overflow-x-auto">
                           <pre className="text-sm font-mono leading-relaxed">
                              <span className="text-slate-500">&lt;!-- PairMind.AI Widget Embed --&gt;</span>
                              <br />
                              <span className="text-blue-400">&lt;script</span> <span className="text-purple-400">src</span>=<span className="text-green-400">"{mcpHost.trim() || 'https://YOUR_MCP_HOST'}/widget.js"</span><span className="text-blue-400">&gt;&lt;/script&gt;</span>
                              <br />
                              <span className="text-blue-400">&lt;script&gt;</span>
                              <br />
                              <span className="text-yellow-200">window</span>.<span className="text-blue-300">addEventListener</span>(<span className="text-green-400">'load'</span>, <span className="text-primary">function</span>() {'{'}
                              <br />
                              <span className="text-primary">if</span> (<span className="text-yellow-200">window</span>.SidekickWidget) {'{'}
                              <br />
                              <span className="text-yellow-200">window</span>.SidekickWidget.<span className="text-blue-300">init</span>({'{'}
                              <br />
                              <span className="text-slate-300">instanceId</span>: <span className="text-green-400">'{instance.id}'</span>,
                              <br />
                              <span className="text-slate-500">// allowedOrigins: ['https://yoursite.com'], // Configured in Dashboard</span>
                              <br />
                              <span className="text-slate-500">// apiBaseUrl: '{mcpHost.trim() || 'https://YOUR_MCP_HOST'}', // Optional override</span>
                              <br />
                              {'}'});
                              <br />
                              {'}'}
                              <br />
                              {'}'});
                              <br />
                              <span className="text-blue-400">&lt;/script&gt;</span>
                           </pre>
                        </div>
                     </div>

                     <div className="mt-6 flex items-center gap-3 text-xs text-slate-500 bg-white/5 p-3 rounded-lg border border-white/5">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>Security Note: Widget appearance, behavior, and allowed origins are managed in the Branding and Policies tabs.</span>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default InstanceDetail;
// Extra Imports needed: HardDrive, Layers, Server, Activity, UsersIcon (renamed), SearchIcon (renamed), XCircle
const UsersIcon = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
   </svg>
);
const SearchIcon = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
   </svg>
);
