
import React, { useState, useEffect } from 'react';
import { AuthService } from '../services';
import { useGlobal } from '../store';
import { Lock, ArrowRight, X, Loader2, AlertCircle } from 'lucide-react';

// Mock Google One Tap Component
const GoogleOneTapMock = ({ show, onLogin, onClose }: { show: boolean, onLogin: () => void, onClose: () => void }) => {
  if (!show) return null;
  
  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 w-[350px] bg-[#202124] text-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.5)] border border-[#5f6368] font-sans animate-fade-in overflow-hidden">
       {/* Header */}
       <div className="flex items-center justify-between p-3 border-b border-[#5f6368] bg-[#2d2e31]">
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center p-0.5">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" className="w-full h-full" />
             </div>
             <span className="text-[11px] font-medium text-gray-300">Sign in to PairMind.AI with Google</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
       </div>
       
       {/* Body */}
       <div className="p-4 flex gap-3 hover:bg-white/5 cursor-pointer transition-colors" onClick={onLogin}>
          <img src="https://picsum.photos/100/100" alt="Avatar" className="w-10 h-10 rounded-full" />
          <div className="flex-1 min-w-0">
             <div className="text-sm font-medium text-white">Alex Sterling</div>
             <div className="text-xs text-gray-400 truncate">alex.super@pairmind.ai</div>
          </div>
       </div>

       {/* Footer */}
       <div className="p-3 pt-0">
          <button 
            onClick={onLogin}
            className="w-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] text-sm font-medium py-2 rounded-full transition-colors"
          >
             Continue as Alex
          </button>
       </div>
    </div>
  );
}

const Login: React.FC = () => {
  const { login } = useGlobal();
  const [activeTab, setActiveTab] = useState<'gmail' | 'password'>('gmail');
  const [showOneTap, setShowOneTap] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset One Tap visibility when switching to gmail tab
  useEffect(() => {
    if (activeTab === 'gmail') {
       setShowOneTap(true);
    } else {
       setShowOneTap(false);
    }
  }, [activeTab]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use predefined email for "Google" login if triggered via OneTap
      const loginEmail = e ? email : 'alex.super@pairmind.ai';
      
      const user = await AuthService.login(loginEmail, password);
      login(user);
    } catch (err) {
      setError('Invalid credentials or network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />

      {/* Simulated Google One Tap */}
      <GoogleOneTapMock 
        show={showOneTap} 
        onLogin={handleGoogleLogin} 
        onClose={() => setShowOneTap(false)} 
      />

      <div className="w-full max-w-[500px] z-10 p-6 flex flex-col gap-8">
        {/* Title Section */}
        <div className="text-center space-y-2">
           <h1 className="text-4xl font-bold text-slate-100">Welcome to Side Kick<br/>Dashboard</h1>
           <p className="text-slate-400 text-sm">Choose how you would like to sign in.</p>
        </div>

        <div>
          {/* Tabs */}
          <div className="flex gap-4 mb-4">
             <button
               onClick={() => setActiveTab('gmail')}
               className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all border ${
                 activeTab === 'gmail'
                   ? 'bg-surface border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                   : 'bg-transparent border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200'
               }`}
             >
               Gmail Based Login
             </button>
             <button
               onClick={() => setActiveTab('password')}
               className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all border ${
                 activeTab === 'password'
                   ? 'bg-primary border-primary text-white shadow-neon'
                   : 'bg-transparent border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200'
               }`}
             >
               User + Password Login
             </button>
          </div>

          {/* Content Card */}
          <div className="bg-surface border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden">
             
             {/* Gmail Tab Content */}
             {activeTab === 'gmail' && (
               <div className="space-y-4 animate-fade-in">
                  <div>
                     <h2 className="text-2xl font-semibold text-slate-100 mb-2">Gmail Based Login</h2>
                     <p className="text-slate-400 text-sm leading-relaxed">
                        Use Google One Tap to sign in with your Gmail account.
                     </p>
                  </div>
                  
                  <div className="p-4 bg-background/50 border border-white/5 rounded-lg text-xs text-slate-400 mt-4">
                     <p>Google One Tap is unchanged and remains the primary login path for Gmail users.</p>
                     <p className="mt-2 text-primary">Look for the prompt in the top-right corner.</p>
                  </div>

                   <button
                    onClick={() => setShowOneTap(true)}
                    className="mt-4 text-xs text-slate-500 underline hover:text-slate-300"
                   >
                     Re-open popup if closed
                   </button>
               </div>
             )}

             {/* Password Tab Content */}
             {activeTab === 'password' && (
               <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                  <div>
                     <h2 className="text-2xl font-semibold text-slate-100 mb-2">User & Password Login</h2>
                     <p className="text-slate-400 text-sm">Use credentials provisioned by your Super Admin or Tenant Admin.</p>
                  </div>

                  {error && (
                    <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-2 text-danger text-xs">
                       <AlertCircle className="w-4 h-4" />
                       {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-input border border-white/10 rounded-lg py-3 px-4 text-slate-100 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                        placeholder="admin@pairmind.ai"
                      />
                      <div className="text-[10px] text-slate-500 mt-1">
                         Try <span className="text-slate-300">alex.super@...</span> or <span className="text-slate-300">jamie.admin@...</span> to test roles.
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-input border border-white/10 rounded-lg py-3 px-4 text-slate-100 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                        placeholder="Enter your password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primaryHover text-white font-medium py-3 rounded-lg shadow-neon transition-all flex items-center justify-center gap-2 mt-2 group disabled:opacity-70 disabled:cursor-wait"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </div>
               </form>
             )}
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs">
          &copy; 2024 PairMind.AI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
