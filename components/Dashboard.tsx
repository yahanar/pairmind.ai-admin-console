
import React from 'react';
import { InstanceStatus } from '../types';
import { PRODUCTS } from '../constants';
import { useGlobal } from '../store';
import { 
  Server, Zap, Activity, MoreHorizontal, ArrowUpRight, 
  AlertTriangle 
} from 'lucide-react';

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; trend?: string; trendUp?: boolean }> = ({ label, value, icon, trend, trendUp }) => (
  <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-neon transition-shadow group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl text-primary group-hover:text-white group-hover:bg-primary transition-colors">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold text-slate-100 mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </div>
);

const ProductCard: React.FC<{ name: string; description: string; status: string; version: string; onManage: () => void }> = ({ name, description, status, version, onManage }) => (
  <div className="bg-gradient-to-br from-surface to-input border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/20 transition-colors"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
       <h3 className="text-lg font-bold text-slate-100">{name}</h3>
       <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
         status === 'Live' ? 'border-success/30 text-success' : 
         status === 'Beta' ? 'border-accent/30 text-accent' : 'border-slate-600 text-slate-500'
       }`}>
         {status}
       </span>
    </div>
    <p className="text-slate-400 text-sm mb-6 h-10">{description}</p>
    <div className="flex justify-between items-center text-xs text-slate-500">
      <span>ver {version}</span>
      <button onClick={onManage} className="text-primary hover:text-white flex items-center gap-1 transition-colors">
        Manage <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { instances, navigate, selectInstance } = useGlobal();
  const onlineCount = instances.filter(i => i.status === InstanceStatus.ONLINE).length;
  const totalInstances = instances.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-slate-100 mb-2">Dashboard</h2>
           <p className="text-slate-400">Overview of your AI fleet and product health.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('INSTANCES')} className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-slate-300 text-sm hover:text-white hover:bg-white/5 transition-colors">
            Manage Instances
          </button>
          <button onClick={() => navigate('ANALYTICS')} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow-neon hover:bg-primaryHover transition-colors">
            View Analytics
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Instances" 
          value={totalInstances} 
          icon={<Server className="w-6 h-6" />} 
          trend="+2 this week"
          trendUp={true}
        />
        <StatCard 
          label="Online Instances" 
          value={onlineCount} 
          icon={<Zap className="w-6 h-6" />} 
          trend="98% uptime"
          trendUp={true}
        />
        <StatCard 
          label="Active Alerts" 
          value="1" 
          icon={<AlertTriangle className="w-6 h-6" />} 
          trend="Needs attention"
          trendUp={false}
        />
        <StatCard 
          label="Total Requests" 
          value="1.2M" 
          icon={<Activity className="w-6 h-6" />} 
          trend="+12% vs last mo"
          trendUp={true}
        />
      </div>

      {/* Products Grid */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Your Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCTS.map((p, i) => (
            <ProductCard 
              key={i} 
              {...p} 
              onManage={() => {
                if (p.name === 'Analyst') navigate('ANALYTICS');
                else if (p.name === 'Guardian') navigate('SETTINGS');
                else navigate('INSTANCES');
              }}
            />
          ))}
        </div>
      </div>

      {/* Recent Instances List */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-100">Recent Instances</h3>
          <button onClick={() => navigate('INSTANCES')} className="text-sm text-primary hover:text-white transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-input text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-medium">Instance Name</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Tier</th>
                <th className="p-4 font-medium">Health</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {instances.slice(0, 4).map((inst) => (
                <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-100">{inst.name}</div>
                    <div className="text-xs text-slate-500">{inst.region}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      inst.status === InstanceStatus.ONLINE ? 'bg-success/10 text-success border-success/20' :
                      inst.status === InstanceStatus.OFFLINE ? 'bg-danger/10 text-danger border-danger/20' :
                      inst.status === InstanceStatus.BOOTSTRAPPING ? 'bg-accent/10 text-accent border-accent/20' :
                      'bg-warning/10 text-warning border-warning/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                         inst.status === InstanceStatus.ONLINE ? 'bg-success' :
                         inst.status === InstanceStatus.OFFLINE ? 'bg-danger' :
                         inst.status === InstanceStatus.BOOTSTRAPPING ? 'bg-accent animate-pulse' :
                         'bg-warning'
                      }`}></span>
                      {inst.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="bg-white/5 px-2 py-1 rounded border border-white/10 text-xs">
                       {inst.tier}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${inst.health > 80 ? 'bg-success' : inst.health > 40 ? 'bg-warning' : 'bg-danger'}`} 
                            style={{width: `${inst.health}%`}}
                          ></div>
                       </div>
                       <span className="text-xs text-slate-400">{inst.health}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        selectInstance(inst);
                        navigate('INSTANCE_DETAIL');
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
