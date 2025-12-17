
import React, { useState, useEffect } from 'react';
import { Instance, InstanceStatus, Tier } from '../types';
import { useGlobal } from '../store';
import InstanceCreationModal from './InstanceCreationModal';
import { 
  Search, Filter, Plus, Server, Trash2, Activity,
  Loader2, AlertCircle, CircleOff, Eye, CheckCircle, 
  Clock, Calendar, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const SummaryCard: React.FC<{ label: string; value: number; icon: React.ReactNode; colorClass: string }> = ({ label, value, icon, colorClass }) => (
  <div className="bg-surface border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/20 transition-all shadow-sm">
    <div className={`p-3 rounded-xl ${colorClass}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      <div className="text-xs text-slate-400 font-medium">{label}</div>
    </div>
  </div>
);

const InstanceList: React.FC = () => {
  const { instances, setInstances, selectInstance, settings } = useGlobal();
  const isCompact = settings?.density === 'compact';
  
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreationModal, setShowCreationModal] = useState(false);

  // Metrics
  const total = instances.length;
  const online = instances.filter(i => i.status === InstanceStatus.ONLINE || i.status === InstanceStatus.ACTIVE).length;
  const offline = instances.filter(i => i.status === InstanceStatus.OFFLINE || i.status === InstanceStatus.INACTIVE).length;
  const pending = instances.filter(i => i.status === InstanceStatus.PENDING_APPROVAL).length;
  const expiring = instances.filter(i => {
      if (!i.licenseExpiry) return false;
      const expiry = new Date(i.licenseExpiry);
      const now = new Date();
      const diffTime = Math.abs(expiry.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays < 30;
  }).length;

  // Filter Logic
  const filteredInstances = instances.filter(inst => {
    const matchesText = inst.name.toLowerCase().includes(filterText.toLowerCase()) || 
                        inst.id.toLowerCase().includes(filterText.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Statuses' || inst.status === statusFilter;
    
    return matchesText && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredInstances.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInstances = filteredInstances.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      const updated = instances.filter(i => i.id !== deleteId);
      await setInstances(updated);
      setDeleteId(null);
    }
  };

  const handleCreateSubmit = async (newInstance: Instance) => {
    // The Modal now handles the full instance creation including ID/Keys/Status
    await setInstances([newInstance, ...instances]);
    setShowCreationModal(false);
  };

  const getStatusBadge = (status: InstanceStatus) => {
    switch (status) {
      case InstanceStatus.ONLINE:
      case InstanceStatus.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-success/20 text-success bg-success/5">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            Active
          </span>
        );
      case InstanceStatus.BOOTSTRAPPING:
      case InstanceStatus.PROVISIONING:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-accent/20 text-accent bg-accent/5">
            <Loader2 className="w-3 h-3 animate-spin" />
            Provisioning
          </span>
        );
      case InstanceStatus.PENDING_APPROVAL:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-warning/20 text-warning bg-warning/5">
            <AlertCircle className="w-3 h-3" />
            Pending Approval
          </span>
        );
      case InstanceStatus.OFFLINE:
      case InstanceStatus.INACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-700 text-slate-400 bg-white/5">
            <CircleOff className="w-3 h-3" />
            Inactive
          </span>
        );
      case InstanceStatus.ERROR:
         return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-danger/20 text-danger bg-danger/5">
            <AlertTriangle className="w-3 h-3" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-700 text-slate-400 bg-white/5">
            {status}
          </span>
        );
    }
  };

  const getHealthIcon = (health: number) => {
    if (health >= 90) return <CheckCircle className="w-4 h-4 text-success" />;
    if (health >= 60) return <Activity className="w-4 h-4 text-warning" />;
    return <AlertCircle className="w-4 h-4 text-danger" />;
  };

  // Define styling constants based on density
  const rowPadding = isCompact ? 'p-2' : 'p-4';
  const headerPadding = isCompact ? 'p-2' : 'p-4';
  const iconSize = isCompact ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Instance Manager</h2>
          <p className="text-slate-400 mt-1">Central hub for lifecycle management of self-hosted instances.</p>
        </div>
        <button 
          onClick={() => setShowCreationModal(true)}
          className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl shadow-neon flex items-center gap-2 transition-all font-medium"
        >
          <Plus className="w-5 h-5" /> Create Instance
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <SummaryCard 
          label="Total Instances" 
          value={total} 
          icon={<Server className="w-5 h-5" />} 
          colorClass="bg-primary/10 text-primary" 
        />
        <SummaryCard 
          label="Online" 
          value={online} 
          icon={<CheckCircle className="w-5 h-5" />} 
          colorClass="bg-success/10 text-success" 
        />
        <SummaryCard 
          label="Offline" 
          value={offline} 
          icon={<CircleOff className="w-5 h-5" />} 
          colorClass="bg-slate-700/50 text-slate-400" 
        />
        <SummaryCard 
          label="Pending Approval" 
          value={pending} 
          icon={<Clock className="w-5 h-5" />} 
          colorClass="bg-warning/10 text-warning" 
        />
        <SummaryCard 
          label="Expiring Soon" 
          value={expiring} 
          icon={<Calendar className="w-5 h-5" />} 
          colorClass="bg-danger/10 text-danger" 
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface border border-white/5 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search instances by name or ID..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-input border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600"
          />
        </div>
        
        <div className="flex items-center gap-2">
           <Filter className="w-4 h-4 text-slate-500" />
           <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-input border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-primary/50 cursor-pointer min-w-[180px]"
           >
              <option>All Statuses</option>
              <option value={InstanceStatus.DRAFT}>Draft</option>
              <option value={InstanceStatus.PENDING_APPROVAL}>Pending Approval</option>
              <option value={InstanceStatus.APPROVED}>Approved</option>
              <option value={InstanceStatus.ACTIVE}>Active</option>
              <option value={InstanceStatus.INACTIVE}>Inactive</option>
              <option value={InstanceStatus.ERROR}>Error</option>
              <option value={InstanceStatus.SUSPENDED}>Suspended</option>
              <option value={InstanceStatus.ONLINE}>Online (Legacy)</option>
              <option value={InstanceStatus.OFFLINE}>Offline (Legacy)</option>
           </select>
        </div>
      </div>

      {/* Instance Table */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-input text-slate-400 uppercase text-xs tracking-wider border-b border-white/5">
                <th className={`${headerPadding} font-semibold`}>Instance Name</th>
                <th className={`${headerPadding} font-semibold`}>Tier</th>
                <th className={`${headerPadding} font-semibold`}>Status</th>
                <th className={`${headerPadding} font-semibold`}>Health</th>
                <th className={`${headerPadding} font-semibold`}>Last Seen</th>
                <th className={`${headerPadding} font-semibold`}>License Expiry</th>
                <th className={`${headerPadding} font-semibold text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedInstances.length > 0 ? (
                paginatedInstances.map((inst) => (
                  <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className={rowPadding}>
                      <div className="flex items-center gap-3">
                         <div className={`${iconSize} rounded-lg flex items-center justify-center text-white ${
                            inst.tier === Tier.ENTERPRISE ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 
                            inst.tier === Tier.PRO ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 
                            'bg-slate-700'
                         }`}>
                            <Server className="w-4 h-4" />
                         </div>
                         <div>
                            <div className="font-bold text-slate-100 group-hover:text-primary transition-colors cursor-pointer" onClick={() => selectInstance(inst)}>
                               {inst.name}
                            </div>
                            {!isCompact && <div className="text-xs text-slate-500 font-mono">{inst.id}</div>}
                         </div>
                      </div>
                    </td>
                    <td className={rowPadding}>
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          inst.tier === Tier.ENTERPRISE ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                          inst.tier === Tier.PRO ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                          'border-slate-600 text-slate-400'
                       }`}>
                          {inst.tier}
                       </span>
                    </td>
                    <td className={rowPadding}>
                       {getStatusBadge(inst.status)}
                    </td>
                    <td className={rowPadding}>
                       <div className="flex items-center gap-2">
                          {getHealthIcon(inst.health)}
                          <span className={`${inst.health === 0 ? 'text-slate-500' : 'text-slate-200'}`}>
                             {inst.health > 0 ? `${inst.health}%` : 'N/A'}
                          </span>
                       </div>
                    </td>
                    <td className={`${rowPadding} text-slate-400`}>
                       {inst.lastSeen || '-'}
                    </td>
                    <td className={`${rowPadding} text-slate-400`}>
                       {inst.licenseExpiry ? new Date(inst.licenseExpiry).toLocaleDateString() : '-'}
                    </td>
                    <td className={`${rowPadding} text-right`}>
                       <div className="flex items-center justify-end gap-2">
                          <button 
                             onClick={() => selectInstance(inst)}
                             className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                             title="View Details"
                          >
                             <Eye className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => setDeleteId(inst.id)}
                             className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                             title="Delete Instance"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                         <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                            <Server className="w-6 h-6 opacity-30" />
                         </div>
                         <p>No instances found matching your criteria.</p>
                         <button onClick={() => { setFilterText(''); setStatusFilter('All Statuses'); }} className="text-primary text-sm hover:underline">
                            Clear Filters
                         </button>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredInstances.length > 0 && (
          <div className={`flex items-center justify-between px-4 ${isCompact ? 'py-2' : 'py-3'} border-t border-white/5 bg-surface rounded-b-2xl`}>
              <div className="text-sm text-slate-400">
                  Showing <span className="font-medium text-slate-200">{startIndex + 1}</span> to <span className="font-medium text-slate-200">{Math.min(startIndex + ITEMS_PER_PAGE, filteredInstances.length)}</span> of <span className="font-medium text-slate-200">{filteredInstances.length}</span> results
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
            <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in">
               <div className="flex items-center gap-4 mb-4 text-danger">
                  <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                     <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">Delete Instance?</h3>
               </div>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Are you sure you want to delete this instance? This action cannot be undone and all associated data and configurations will be permanently removed.
               </p>
               <div className="flex gap-3 justify-end">
                  <button 
                     onClick={() => setDeleteId(null)}
                     className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-medium transition-colors"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={handleDeleteConfirm}
                     className="px-4 py-2 rounded-lg bg-danger hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg"
                  >
                     Confirm Delete
                  </button>
               </div>
            </div>
         </div>
      )}

      {showCreationModal && (
        <InstanceCreationModal 
          onClose={() => setShowCreationModal(false)} 
          onSubmit={handleCreateSubmit} 
        />
      )}
    </div>
  );
};

export default InstanceList;
