
import React, { useState, useEffect } from 'react';
import { AnalyticsService } from '../services';
import { AnalyticsData } from '../types';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Activity, DollarSign, Clock, AlertOctagon, Download, Loader2 } from 'lucide-react';

const MetricCard: React.FC<{ label: string; value: string; icon: React.ReactNode; trend: string }> = ({ label, value, icon, trend }) => (
  <div className="bg-surface border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
    <div className="flex justify-between items-start mb-2">
      <div className="p-3 bg-surfaceHighlight rounded-xl text-primary group-hover:text-white group-hover:bg-primary transition-colors">
        {icon}
      </div>
      <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">{trend}</span>
    </div>
    <div className="text-2xl font-bold text-slate-100 mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </div>
);

const Analytics: React.FC = () => {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await AnalyticsService.getData(range);
        setData(result);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  // Calculations for summary cards
  const totalTokens = data.reduce((acc, curr) => acc + curr.queries * 150, 0); // Approx 150 tokens per query
  const totalCost = data.reduce((acc, curr) => acc + curr.cost, 0);
  const avgLatency = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.latency, 0) / data.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[600px]">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Fleet Analytics</h2>
          <p className="text-slate-400 text-sm">Aggregate performance metrics across all deployed instances.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-input p-1 rounded-lg border border-white/5">
              {(['7D', '30D', '90D'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    range === r 
                      ? 'bg-surfaceHighlight text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
           </div>
           <button className="p-2 bg-surface border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <Download className="w-5 h-5" />
           </button>
        </div>
      </div>

      {loading && (
         <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard 
           label="Est. Token Usage" 
           value={(totalTokens / 1000000).toFixed(1) + 'M'} 
           icon={<Activity className="w-5 h-5" />} 
           trend="+12.5%" 
         />
         <MetricCard 
           label="Est. Cost" 
           value={`$${totalCost.toLocaleString()}`} 
           icon={<DollarSign className="w-5 h-5" />} 
           trend="+5.2%" 
         />
         <MetricCard 
           label="Avg. Latency" 
           value={`${avgLatency}ms`} 
           icon={<Clock className="w-5 h-5" />} 
           trend="-8.1%" 
         />
         <MetricCard 
           label="Error Rate" 
           value="0.04%" 
           icon={<AlertOctagon className="w-5 h-5" />} 
           trend="-0.01%" 
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Request Volume</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} interval={range === '90D' ? 6 : range === '30D' ? 2 : 0} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#04293A', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="queries" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-surface border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Cost Breakdown</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} interval={range === '90D' ? 6 : range === '30D' ? 2 : 0} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#04293A', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="cost" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
