
import React from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InstanceList from './components/InstanceList';
import InstanceDetail from './components/InstanceDetail';
import Settings from './components/Settings';
import Users from './components/Users';
import Chat from './components/Chat';
import Appointments from './components/Appointments';
import Tenants from './components/Tenants';
import Analytics from './components/Analytics';
import McpMarketplace from './components/McpMarketplace';
import { GlobalProvider, useGlobal } from './store';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const GlobalToast = () => {
  const { toast } = useGlobal();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
       <div className={`px-4 py-3 rounded-lg shadow-2xl border flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-surface border-success/30 text-success' : 
          toast.type === 'error' ? 'bg-surface border-danger/30 text-danger' : 
          'bg-surface border-primary/30 text-primary'
       }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
          {toast.type === 'info' && <Info className="w-5 h-5" />}
          <span className="font-medium text-sm text-slate-100">{toast.message}</span>
       </div>
    </div>
  );
};

const MainContent = () => {
  const { user, currentView, isLoadingData, selectedInstance } = useGlobal();

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <GlobalToast />
      {isLoadingData && currentView !== 'DASHBOARD' ? (
         <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading Workspace...</p>
         </div>
      ) : (
        <>
          {currentView === 'DASHBOARD' && <Dashboard />}
          {currentView === 'INSTANCES' && <InstanceList />}
          {currentView === 'INSTANCE_DETAIL' && selectedInstance && <InstanceDetail />}
          {currentView === 'SETTINGS' && <Settings />}
          {currentView === 'USERS' && <Users />}
          {currentView === 'CHAT' && <Chat />}
          {currentView === 'APPOINTMENTS' && <Appointments />}
          {currentView === 'TENANTS' && <Tenants />}
          {currentView === 'ANALYTICS' && <Analytics />}
          {currentView === 'MCP_MARKETPLACE' && <McpMarketplace />}
        </>
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <GlobalProvider>
      <MainContent />
    </GlobalProvider>
  );
}
