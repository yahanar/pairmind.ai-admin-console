
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Appointment } from '../types';
import { AppointmentService } from '../services';
import { useGlobal } from '../store';
import { 
  Calendar, Search, Filter, MoreHorizontal, CheckCircle, 
  Clock, XCircle, Trash2, Edit, ExternalLink, X, RefreshCw,
  ChevronDown, Check, AlertTriangle, Calendar as CalendarIcon, User, Bot,
  Plus, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Save, Link, AlertOctagon,
  Star, Clipboard, FileText, Mail
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

// --- Reusable Components ---

const FilterDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label?: string;
}> = ({ value, onChange, options, label }) => {
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-input border border-white/10 rounded-xl text-slate-300 text-sm hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors min-w-[140px] justify-between"
      >
        <span className="flex items-center gap-2">
           <Filter className="w-4 h-4 text-slate-500" />
           {value === 'All' ? label || 'All' : value}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 animate-fade-in">
           <div className="py-1">
             <button
               onClick={() => { onChange('All'); setIsOpen(false); }}
               className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center justify-between"
             >
               All Statuses
               {value === 'All' && <Check className="w-3 h-3 text-primary" />}
             </button>
            {options.map((option) => (
                <button
                  key={option}
                  onClick={() => { onChange(option); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center justify-between"
                >
                  {option}
                  {value === option && <Check className="w-3 h-3 text-primary" />}
                </button>
            ))}
           </div>
        </div>
      )}
    </div>
  );
};

// --- Modals ---

const SyncCalendarModal: React.FC<{ onClose: () => void, onResult: (res: any) => void }> = ({ onClose, onResult }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSync = async (provider: 'google' | 'outlook') => {
    setLoading(provider);
    try {
      const result = await AppointmentService.syncCalendar(provider);
      onResult({ provider, ...result });
    } catch (e: any) {
      onResult({ provider, status: 'failure', message: e.message || 'Unknown error' });
    } finally {
      setLoading(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
      <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" /> Sync Calendar
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        
        <p className="text-sm text-slate-400 mb-6">Select a calendar provider to sync upcoming appointments.</p>

        <div className="space-y-3">
           <button 
             onClick={() => handleSync('google')}
             disabled={!!loading}
             className="w-full p-4 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-between group transition-colors disabled:opacity-50"
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="w-5 h-5" />
                 </div>
                 <span className="text-slate-200 font-medium">Google Calendar</span>
              </div>
              {loading === 'google' ? <RefreshCw className="w-5 h-5 text-primary animate-spin"/> : <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />}
           </button>

           <button 
             onClick={() => handleSync('outlook')}
             disabled={!!loading}
             className="w-full p-4 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-between group transition-colors disabled:opacity-50"
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#0078D4] flex items-center justify-center text-white font-bold text-xs">
                    O
                 </div>
                 <span className="text-slate-200 font-medium">Outlook Calendar</span>
              </div>
              {loading === 'outlook' ? <RefreshCw className="w-5 h-5 text-primary animate-spin"/> : <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />}
           </button>
        </div>
      </div>
    </div>
  );
};

const CreateAppointmentModal: React.FC<{
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
}> = ({ onClose, onSave }) => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [assignedBot, setAssignedBot] = useState('Sales-Bot-01');

  const handleSubmit = () => {
    if (!customerName || !date || !time) return;

    const newAppointment: Appointment = {
      id: `apt-${Math.floor(Math.random() * 10000)}`,
      customerName,
      date,
      time,
      status: 'Pending',
      assignedBot
    };
    onSave(newAppointment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
      <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Schedule Appointment
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Customer Name</label>
            <input 
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 placeholder:text-slate-600"
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Time</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Assigned Bot</label>
            <select
              value={assignedBot}
              onChange={(e) => setAssignedBot(e.target.value)}
              className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50"
            >
               <option value="Sales-Bot-01">Sales-Bot-01</option>
               <option value="Support-Alpha">Support-Alpha</option>
               <option value="Onboarding-Guide">Onboarding-Guide</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-medium shadow-neon flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Create Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

const RescheduleModal: React.FC<{
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}> = ({ appointment, onClose, onConfirm }) => {
  const [date, setDate] = useState(appointment.date);
  const [time, setTime] = useState(appointment.time);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
       <div className="relative bg-surface border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
             <Calendar className="w-5 h-5 text-primary" /> Reschedule
          </h3>
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">New Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">New Time</label>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50"
                />
             </div>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
             <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
             <button 
               onClick={() => onConfirm(date, time)}
               className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium shadow-neon transition-colors"
             >
                Update Schedule
             </button>
          </div>
       </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
}> = ({ onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose}></div>
    <div className="relative bg-surface border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
      <div className="flex items-center gap-4 mb-4 text-danger">
        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Cancel Appointment?</h3>
      </div>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        This will permanently remove the appointment from the system. This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-medium">Keep It</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-danger hover:bg-red-600 text-white text-sm font-medium shadow-lg">Delete</button>
      </div>
    </div>
  </div>
);

const AppointmentDetailsModal: React.FC<{
  appointment: Appointment;
  onClose: () => void;
}> = ({ appointment, onClose }) => (
   <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
         <div className="flex justify-between items-start mb-6">
            <div>
               <h3 className="text-xl font-bold text-slate-100">{appointment.customerName}</h3>
               <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-mono text-primary text-xs">{appointment.id}</span>
               </p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
         </div>

         <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center text-slate-300">
                  <CalendarIcon className="w-5 h-5" />
               </div>
               <div>
                  <div className="text-sm font-bold text-slate-200">{appointment.date}</div>
                  <div className="text-xs text-slate-400">Scheduled Date</div>
               </div>
               <div className="w-px h-8 bg-white/10 mx-2"></div>
               <div>
                  <div className="text-sm font-bold text-slate-200">{appointment.time}</div>
                  <div className="text-xs text-slate-400">Time Slot</div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-input p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Status</div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${
                     appointment.status === 'Confirmed' ? 'border-success/20 text-success bg-success/5' :
                     appointment.status === 'Pending' ? 'border-warning/20 text-warning bg-warning/5' :
                     'border-danger/20 text-danger bg-danger/5'
                  }`}>
                     {appointment.status}
                  </span>
               </div>
               <div className="bg-input p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Assigned Bot</div>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                     <Bot className="w-3.5 h-3.5 text-primary" />
                     {appointment.assignedBot}
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t border-white/5">
               <div className="text-xs font-bold text-slate-500 uppercase mb-2">Customer Context</div>
               <p className="text-sm text-slate-400 leading-relaxed">
                  Customer requested a demo of the Enterprise plan features. Interested specifically in SSO and Audit Logs integration.
               </p>
            </div>
         </div>
      </div>
   </div>
);

// --- Change Bot Assignment Modal ---
const ChangeBotModal: React.FC<{
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (newBot: string) => void;
}> = ({ appointment, onClose, onConfirm }) => {
  const [selectedBot, setSelectedBot] = useState(appointment.assignedBot);
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-background/60 backdrop-blur-md transition-all duration-300" onClick={onClose}></div>
       <div className="relative bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in z-10">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
             <Bot className="w-5 h-5 text-primary" /> Change Bot Assignment
          </h3>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
             <div className="text-xs text-slate-500 mb-1">Customer</div>
             <div className="text-sm font-bold text-slate-200">{appointment.customerName}</div>
             <div className="text-xs text-slate-500 mt-2">Current Bot</div>
             <div className="text-sm text-slate-300 font-mono flex items-center gap-2">
                <Bot className="w-3 h-3 text-primary" /> {appointment.assignedBot}
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">New Bot</label>
                <select 
                  value={selectedBot}
                  onChange={(e) => setSelectedBot(e.target.value)}
                  className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50"
                >
                   <option value="Sales-Bot-01">Sales-Bot-01</option>
                   <option value="Support-Alpha">Support-Alpha</option>
                   <option value="Onboarding-Guide">Onboarding-Guide</option>
                   <option value="Demo-Specialist">Demo-Specialist</option>
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Reason (Optional)</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full bg-input border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary/50 placeholder:text-slate-600 resize-none"
                  placeholder="Why are you reassigning this appointment?"
                />
             </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-white/5">
             <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors">Cancel</button>
             <button 
               onClick={() => onConfirm(selectedBot)}
               disabled={selectedBot === appointment.assignedBot}
               className="px-4 py-2 bg-primary hover:bg-primaryHover text-white rounded-lg text-sm font-medium shadow-neon transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
                <Bot className="w-4 h-4" /> Reassign Bot
             </button>
          </div>
       </div>
    </div>
  );
};


const Appointments: React.FC = () => {
  const { appointments, setAppointments, notify } = useGlobal();
  
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Appointment | 'dateTime', direction: 'asc' | 'desc' } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [changeBotAppointment, setChangeBotAppointment] = useState<Appointment | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const calcMenuPosition = (rect: DOMRect) => {
    const MENU_WIDTH = 192; // w-48
    const PADDING = 8;
    const top = rect.bottom + 4;
    let left = rect.right - MENU_WIDTH;
    if (left < PADDING) left = PADDING;
    if (left + MENU_WIDTH > window.innerWidth - PADDING) left = window.innerWidth - PADDING - MENU_WIDTH;
    return { top, left };
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu-trigger') && !target.closest('.action-menu')) {
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

  // Sorting Helper
  const handleSort = (key: keyof Appointment | 'dateTime') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Appointment | 'dateTime') => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  // Filter & Sort Logic
  const processedAppointments = appointments.filter(apt => {
     const matchesText = apt.customerName.toLowerCase().includes(filterText.toLowerCase());
     const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
     const matchesDate = !dateFilter || apt.date === dateFilter;
     return matchesText && matchesStatus && matchesDate;
  }).sort((a, b) => {
     if (!sortConfig) return 0;
     
     let aValue: any = a[sortConfig.key as keyof Appointment];
     let bValue: any = b[sortConfig.key as keyof Appointment];

     if (sortConfig.key === 'dateTime') {
       aValue = new Date(`${a.date}T${a.time}`);
       bValue = new Date(`${b.date}T${b.time}`);
     }

     if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
     if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
     return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(processedAppointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAppointments = processedAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, statusFilter, dateFilter, sortConfig]);

  // Handlers
  const handleCreateSubmit = async (newAppointment: Appointment) => {
    const updated = [newAppointment, ...appointments];
    await setAppointments(updated);
    setShowCreateModal(false);
    notify('Appointment created successfully.', 'success');
  };

  const handleSyncResult = (result: any) => {
    if (result.status === 'success') {
      notify(`Synced ${result.count} events successfully.`, 'success');
    } else if (result.status === 'partial') {
      notify(`Synced ${result.count} events. ${result.message}`, 'info');
    } else {
      notify(`Sync failed: ${result.message}`, 'error');
    }
  };

  const handleReschedule = async (date: string, time: string) => {
     if (reschedulingAppointment) {
        const updatedApp = { ...reschedulingAppointment, date, time, status: 'Confirmed' as const };
        const updatedList = appointments.map(a => a.id === updatedApp.id ? updatedApp : a);
        await setAppointments(updatedList);
        setReschedulingAppointment(null);
        notify('Appointment rescheduled.', 'success');
     }
  };

  const handleChangeStatus = async (appointment: Appointment, status: 'Confirmed' | 'Pending' | 'Cancelled') => {
     const updatedApp = { ...appointment, status };
     const updatedList = appointments.map(a => a.id === updatedApp.id ? updatedApp : a);
     await setAppointments(updatedList);
     setOpenMenuId(null);
     notify(`Status updated to ${status}.`, 'info');
  };

  const handleDelete = async () => {
     if (deletingAppointment) {
        const updatedList = appointments.filter(a => a.id !== deletingAppointment.id);
        await setAppointments(updatedList);
        setDeletingAppointment(null);
        notify('Appointment deleted.', 'info');
     }
  };

  const handleChangeBot = async (newBot: string) => {
     if (changeBotAppointment) {
        const updatedApp = { ...changeBotAppointment, assignedBot: newBot };
        const updatedList = appointments.map(a => a.id === updatedApp.id ? updatedApp : a);
        await setAppointments(updatedList);
        setChangeBotAppointment(null);
        setOpenMenuId(null);
        notify(`Bot reassigned to ${newBot}.`, 'success');
     }
  };

  const handleTogglePriority = async (appointment: Appointment) => {
     const isPriority = (appointment as any).isPriority || false;
     const updatedApp = { ...appointment, isPriority: !isPriority } as any;
     const updatedList = appointments.map(a => a.id === updatedApp.id ? updatedApp : a);
     await setAppointments(updatedList);
     setOpenMenuId(null);
     notify(`Appointment ${!isPriority ? 'marked as priority' : 'unmarked as priority'}.`, 'info');
  };

  const handleCopyMeetingLink = (appointmentId: string) => {
     const link = `https://app.example.com/meetings/${appointmentId}`;
     navigator.clipboard.writeText(link);
     setOpenMenuId(null);
     notify('Meeting link copied to clipboard.', 'success');
  };

  const handleSendReminder = (appointmentId: string) => {
     setOpenMenuId(null);
     notify('Reminder sent to customer.', 'success');
  };

  const handleExportAppointment = (appointment: Appointment) => {
     const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI Admin Console//EN
BEGIN:VEVENT
UID:${appointment.id}@example.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${appointment.date.replace(/-/g, '')}T${appointment.time.replace(/:/g, '')}00
SUMMARY:Appointment with ${appointment.customerName}
DESCRIPTION:Bot: ${appointment.assignedBot}\\nStatus: ${appointment.status}
STATUS:${appointment.status === 'Confirmed' ? 'CONFIRMED' : 'TENTATIVE'}
END:VEVENT
END:VCALENDAR`;
     
     const blob = new Blob([icsContent], { type: 'text/calendar' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `appointment-${appointment.id}.ics`;
     link.click();
     URL.revokeObjectURL(url);
     setOpenMenuId(null);
     notify('Appointment exported to calendar.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in min-h-[500px]">
      
      {/* Modals */}
      {showCreateModal && (
        <CreateAppointmentModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreateSubmit} 
        />
      )}
      {showSyncModal && (
        <SyncCalendarModal 
          onClose={() => setShowSyncModal(false)}
          onResult={handleSyncResult}
        />
      )}
      {reschedulingAppointment && (
         <RescheduleModal 
            appointment={reschedulingAppointment} 
            onClose={() => setReschedulingAppointment(null)} 
            onConfirm={handleReschedule} 
         />
      )}
      {deletingAppointment && (
         <DeleteConfirmationModal 
            onClose={() => setDeletingAppointment(null)} 
            onConfirm={handleDelete} 
         />
      )}
      {selectedAppointment && (
         <AppointmentDetailsModal 
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
         />
      )}
      {changeBotAppointment && (
         <ChangeBotModal
            appointment={changeBotAppointment}
            onClose={() => setChangeBotAppointment(null)}
            onConfirm={handleChangeBot}
         />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Appointments</h2>
          <p className="text-slate-400 text-sm">Manage scheduled calls and demos captured by your AI agents.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSyncModal(true)}
            className="bg-surface border border-white/10 hover:bg-white/5 text-slate-300 px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" /> 
            Sync Calendar
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl shadow-neon flex items-center gap-2 transition-all font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> Schedule Appointment
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Search by customer name..." 
             className="w-full bg-input border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600"
             value={filterText}
             onChange={(e) => setFilterText(e.target.value)}
           />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <input 
             type="date"
             value={dateFilter}
             onChange={(e) => setDateFilter(e.target.value)}
             className="bg-input border border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-300 focus:outline-none focus:border-primary/50 min-w-[150px]"
           />
           <FilterDropdown 
              value={statusFilter}
              onChange={setStatusFilter}
              options={['Confirmed', 'Pending', 'Cancelled']}
              label="Filter Status"
           />
        </div>
      </div>
      
      {/* Table Content */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-visible shadow-sm flex flex-col min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-slate-400 uppercase text-xs tracking-wider border-b border-white/5">
                <th className="p-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('customerName')}>
                  <div className="flex items-center">Customer {getSortIcon('customerName')}</div>
                </th>
                <th className="p-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('dateTime')}>
                  <div className="flex items-center">Date & Time {getSortIcon('dateTime')}</div>
                </th>
                <th className="p-4 font-semibold">Assigned Bot</th>
                <th className="p-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center">Status {getSortIcon('status')}</div>
                </th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedAppointments.length > 0 ? (
                 paginatedAppointments.map((apt, index) => (
                  <tr key={apt.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
                             <User className="w-4 h-4" />
                          </div>
                          <div>
                             <div className="font-bold text-slate-100">{apt.customerName}</div>
                             <div className="text-xs text-slate-500 font-mono">{apt.id}</div>
                          </div>
                       </div>
                    </td>
                    <td className="p-4 text-slate-300">
                       <div className="flex flex-col">
                          <span className="font-medium text-slate-200">{apt.date}</span>
                          <span className="text-xs text-slate-500">{apt.time}</span>
                       </div>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2 text-slate-400 text-xs font-mono bg-white/5 px-2 py-1 rounded w-fit border border-white/5">
                          <Bot className="w-3 h-3" /> {apt.assignedBot}
                       </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        apt.status === 'Confirmed' ? 'bg-success/10 text-success border-success/20' :
                        apt.status === 'Pending' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-danger/10 text-danger border-danger/20'
                      }`}>
                        {apt.status === 'Confirmed' && <CheckCircle className="w-3 h-3" />}
                        {apt.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {apt.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="relative inline-block text-left">
                           <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (openMenuId === apt.id) {
                                  setOpenMenuId(null);
                                  setMenuPosition(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const pos = calcMenuPosition(rect);
                                  setMenuPosition(pos);
                                  setOpenMenuId(apt.id);
                              }
                            }}
                             className={`action-menu-trigger p-2 rounded-lg transition-colors ${openMenuId === apt.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                          >
                             <MoreHorizontal className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                         <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 opacity-30" />
                         </div>
                         <h3 className="text-lg font-medium text-slate-300">No appointments found</h3>
                         <p className="text-sm">Try adjusting your filters.</p>
                         <button onClick={() => { setFilterText(''); setStatusFilter('All'); setDateFilter(''); }} className="text-primary text-sm hover:underline mt-2">
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
        {totalPages > 1 && (
           <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-surface rounded-b-2xl mt-auto">
              <div className="text-sm text-slate-400">
                 Showing <span className="font-medium text-slate-200">{startIndex + 1}</span> to <span className="font-medium text-slate-200">{Math.min(startIndex + ITEMS_PER_PAGE, processedAppointments.length)}</span> of <span className="font-medium text-slate-200">{processedAppointments.length}</span> results
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

      {/* Fixed Position Menu Portal */}
      {openMenuId && menuPosition && ReactDOM.createPortal(
        <div 
          className="action-menu fixed w-48 bg-[#0F2E45] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[9999] animate-fade-in origin-top-right"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
            {(() => {
              const apt = appointments.find(a => a.id === openMenuId);
              if (!apt) return null;
              const isPriority = (apt as any).isPriority || false;
              return (
                <>
                  {/* Quick View */}
                  <button 
                    onClick={() => { setSelectedAppointment(apt); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                      <ExternalLink className="w-3.5 h-3.5" /> View Details
                  </button>

                  {/* Management Section */}
                  <div className="border-t border-white/5 my-1"></div>
                  <button 
                    onClick={() => { setReschedulingAppointment(apt); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                      <Edit className="w-3.5 h-3.5" /> Reschedule
                  </button>
                  <button 
                    onClick={() => { setChangeBotAppointment(apt); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                      <Bot className="w-3.5 h-3.5" /> Change Bot
                  </button>
                  <button 
                    onClick={() => handleTogglePriority(apt)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-white/5 flex items-center gap-2 ${
                      isPriority ? 'text-warning' : 'text-slate-300'
                    }`}
                  >
                      <Star className={`w-3.5 h-3.5 ${isPriority ? 'fill-warning' : ''}`} /> {isPriority ? 'Unmark Priority' : 'Mark as Priority'}
                  </button>

                  {/* Communication Section */}
                  <div className="border-t border-white/5 my-1"></div>
                  <button 
                    onClick={() => handleSendReminder(apt.id)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                      <Mail className="w-3.5 h-3.5" /> Send Reminder
                  </button>
                  <button 
                    onClick={() => handleCopyMeetingLink(apt.id)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                      <Clipboard className="w-3.5 h-3.5" /> Copy Meeting Link
                  </button>

                  {/* Status Changes */}
                  <div className="border-t border-white/5 my-1"></div>
                  {apt.status === 'Pending' && (
                      <button 
                        onClick={() => handleChangeStatus(apt, 'Confirmed')}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-success hover:bg-white/5 flex items-center gap-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Confirm Appointment
                      </button>
                  )}
                  {apt.status !== 'Cancelled' && (
                      <button 
                        onClick={() => handleChangeStatus(apt, 'Cancelled')}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-warning hover:bg-white/5 flex items-center gap-2"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Appointment
                      </button>
                  )}
                  {apt.status === 'Cancelled' && (
                      <button 
                        onClick={() => handleChangeStatus(apt, 'Confirmed')}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-success hover:bg-white/5 flex items-center gap-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Reactivate
                      </button>
                  )}
                  {apt.status === 'Confirmed' && (
                      <button 
                        onClick={() => handleChangeStatus(apt, 'Pending')}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                      >
                        <Clock className="w-3.5 h-3.5" /> Mark as Pending
                      </button>
                  )}

                  {/* Data Export */}
                  <div className="border-t border-white/5 my-1"></div>
                  <button 
                    onClick={() => handleExportAppointment(apt)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2"
                  >
                      <FileText className="w-3.5 h-3.5" /> Export to Calendar
                  </button>

                  {/* Destructive Actions */}
                  <div className="border-t border-white/5 my-1"></div>
                  <button 
                    onClick={() => { setDeletingAppointment(apt); setOpenMenuId(null); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-danger hover:bg-white/5 flex items-center gap-2"
                  >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
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

export default Appointments;
