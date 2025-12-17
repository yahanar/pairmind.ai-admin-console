
import React, { useState, useEffect } from 'react';
import { useGlobal } from '../store';
import { UserService } from '../services';
import { DashboardSettings } from '../types';
import { 
  User as UserIcon, Lock, Bell, Layout as LayoutIcon, 
  Save, Check, Shield, Smartphone, Mail, Globe, Monitor, 
  CheckCircle, AlertTriangle, Moon, Sun, MonitorSmartphone,
  ShieldCheck, Loader2, Info
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateUser, settings, updateSettings, notify } = useGlobal();
  const [activeTab, setActiveTab] = useState('Profile');
  
  // --- Profile State ---
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    username: '',
    language: 'English (United States)'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Security State ---
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Initialize from user prop
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Hydrate form data from user prop when available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        username: user.username || '',
        language: user.language || 'English (United States)'
      });
      setMfaEnabled(user.mfaEnabled || false);
    }
  }, [user]);

  if (!user) return null;

  // --- Handlers ---

  const handleSaveProfile = async () => {
    // 1. Basic Validation
    if (!profileData.name) {
      notify('Full Name is required.', 'error');
      return;
    }
    if (!profileData.username) {
      notify('Username is required.', 'error');
      return;
    }
    
    // 2. Format Validation (Lowercase & Alphanumeric)
    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(profileData.username)) {
       notify('Username must be lowercase and alphanumeric (underscores allowed).', 'error');
       return;
    }

    setIsSavingProfile(true);

    try {
        const updatedUserPayload = {
            ...user,
            name: profileData.name,
            phone: profileData.phone,
            username: profileData.username,
            language: profileData.language
        };

        // API Call
        await UserService.update(updatedUserPayload);
        
        // State Update
        updateUser(updatedUserPayload);
        
        notify('Profile updated successfully.', 'success');
    } catch (e) {
        notify('Failed to save profile.', 'error');
    } finally {
        setIsSavingProfile(false);
    }
  };

  const handleSaveSecurity = () => {
    const { newPassword, confirmPassword } = securityData;

    // Validation
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        notify('New passwords do not match.', 'error');
        return;
      }
      if (newPassword.length < 8) {
        notify('Password must be at least 8 characters long.', 'error');
        return;
      }
      const hasLetter = /[a-zA-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!hasLetter || !hasNumber || !hasSymbol) {
        notify('Password must contain letters, numbers, and symbols.', 'error');
        return;
      }
    }

    setIsSavingSecurity(true);
    
    // Simulate API call
    setTimeout(() => {
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsSavingSecurity(false);
      notify('Security settings updated successfully.', 'success');
    }, 1500);
  };

  // MFA is read-only for now
  const toggleMfa = () => {
     notify('MFA configuration is coming soon.', 'info');
  }

  const handleDashboardChange = async (key: keyof DashboardSettings, value: any) => {
     if (!settings) return;
     
     const newConfig = { ...settings, [key]: value };
     await updateSettings(newConfig);
  };

  const toggleWidget = async (key: keyof DashboardSettings['widgets']) => {
     if (!settings) return;
     
     const newConfig = {
        ...settings,
        widgets: { ...settings.widgets, [key]: !settings.widgets[key] }
     };
     await updateSettings(newConfig);
  };

  const navItems = [
    { id: 'Profile', label: 'Profile', sub: 'Personal details', icon: <UserIcon className="w-4 h-4"/> },
    { id: 'Security', label: 'Password & Security', sub: 'Protection & authentication', icon: <Lock className="w-4 h-4"/> },
    { id: 'Notifications', label: 'Notifications', sub: 'Alerts & reminders', icon: <Bell className="w-4 h-4"/> },
    { id: 'Dashboard', label: 'Dashboard Layout & UI', sub: 'Theme & layout options', icon: <LayoutIcon className="w-4 h-4"/> },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10 relative">
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Settings</h2>
      <p className="text-slate-400 text-sm mb-8">Choose a section to configure</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
           {navItems.map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3 border ${
                 activeTab === item.id 
                   ? 'bg-surface border-primary/50 shadow-neon' 
                   : 'border-transparent hover:bg-white/5'
               }`}
             >
               <div className={`mt-0.5 ${activeTab === item.id ? 'text-primary' : 'text-slate-500'}`}>
                 {item.icon}
               </div>
               <div>
                 <div className={`text-sm font-bold ${activeTab === item.id ? 'text-slate-100' : 'text-slate-400'}`}>
                   {item.label}
                 </div>
                 <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>
               </div>
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-surface border border-white/5 rounded-2xl p-8 min-h-[500px]">
           
           {/* --- PROFILE TAB --- */}
           {activeTab === 'Profile' && (
             <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Profile</h3>
                  <p className="text-sm text-slate-400 mt-1">Manage your basic account information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Full Name */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600" 
                        placeholder="Your full name"
                      />
                   </div>

                   {/* Email (Read Only) */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between">
                        Email <span className="bg-primary/20 text-primary px-1.5 rounded text-[10px]">VERIFIED</span>
                      </label>
                      <input 
                        type="email" 
                        defaultValue={user.email} 
                        disabled 
                        className="w-full bg-surfaceHighlight/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed" 
                      />
                      <p className="text-[10px] text-slate-500 mt-1.5">Email changes are managed by an administrator.</p>
                   </div>

                   {/* Phone */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="+1 (555) 000-0000"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full bg-input border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600" 
                        />
                      </div>
                   </div>

                   {/* Role (Read Only) */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role / Title</label>
                      <input 
                        type="text" 
                        defaultValue={user.role} 
                        disabled 
                        className="w-full bg-surfaceHighlight/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed" 
                      />
                      <p className="text-[10px] text-slate-500 mt-1.5">Role is assigned by your administrator.</p>
                   </div>

                   {/* Username */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
                      <input 
                        type="text" 
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-600" 
                        placeholder="username"
                      />
                      <p className="text-[10px] text-slate-500 mt-1.5">Usernames are lowercase, unique, and used for password-based login.</p>
                   </div>

                   {/* Language */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Language Preference</label>
                      <div className="relative">
                         <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                         <select 
                            value={profileData.language}
                            onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                            className="w-full bg-input border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 appearance-none transition-all cursor-pointer"
                         >
                            <option>English (United States)</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                         </select>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">Interface language preference (more locales soon).</p>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end">
                   <button 
                     onClick={handleSaveProfile}
                     disabled={isSavingProfile}
                     className="px-6 py-2.5 bg-primary hover:bg-primaryHover text-white font-medium rounded-xl shadow-neon transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                   >
                      {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} 
                      Save Changes
                   </button>
                </div>
             </div>
           )}

           {/* --- SECURITY TAB --- */}
           {activeTab === 'Security' && (
             <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Password & Security</h3>
                  <p className="text-sm text-slate-400 mt-1">Update credentials and enable additional protections</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Current Password */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter current password" 
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                        className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all" 
                      />
                      <p className="text-[10px] text-slate-500 mt-1.5">If you haven't set a password before, leave this field blank.</p>
                   </div>

                   {/* New Password */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
                      <input 
                        type="password" 
                        placeholder="Create a strong password" 
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                        className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all" 
                      />
                      <p className="text-[10px] text-slate-500 mt-1.5">Must be at least 8 characters with letters, numbers, and symbols.</p>
                   </div>

                   {/* Confirm Password */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Re-enter new password" 
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        className="w-full bg-input border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 transition-all" 
                      />
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${mfaEnabled ? 'bg-success/10 text-success' : 'bg-slate-700/30 text-slate-500'}`}>
                         <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-200">Enable multi-factor authentication (coming soon)</h4>
                            <div 
                              onClick={toggleMfa}
                              className={`w-10 h-5 rounded-full relative cursor-not-allowed transition-colors bg-slate-700/50`}
                            >
                               <div className={`w-3 h-3 bg-slate-500 rounded-full absolute top-1 left-1`}></div>
                            </div>
                         </div>
                         <p className="text-xs text-slate-500 mt-1">
                            MFA support is currently on the roadmap and will be available in a future update.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="flex justify-start">
                   <button 
                     onClick={handleSaveSecurity}
                     disabled={isSavingSecurity}
                     className="px-6 py-2.5 bg-primary hover:bg-primaryHover text-white font-medium rounded-xl shadow-neon transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                   >
                      {isSavingSecurity ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                      Save security settings
                   </button>
                </div>
             </div>
           )}

           {/* --- NOTIFICATIONS TAB --- */}
           {activeTab === 'Notifications' && (
             <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Notifications</h3>
                  <p className="text-sm text-slate-400 mt-1">Control how we keep you in the loop</p>
                </div>

                <div className="space-y-0 divide-y divide-white/5">
                   {[
                      { id: 'product', label: 'Product Updates', desc: 'Release notes, new features, and maintenance windows', default: true },
                      { id: 'usage', label: 'Usage Alerts', desc: 'Get notified when usage nears plan limits', default: true },
                      { id: 'weekly', label: 'Weekly Summary', desc: 'Receive a digest of key metrics every Monday', default: false },
                      { id: 'security', label: 'Security Events', desc: 'Critical security alerts for your organization', default: true },
                   ].map((item) => (
                      <div key={item.id} className="py-6 flex items-start justify-between opacity-60">
                         <div>
                            <div className="text-sm font-bold text-slate-200">{item.label}</div>
                            <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                         </div>
                         <button 
                           disabled
                           className={`w-10 h-5 rounded-full relative transition-colors cursor-not-allowed ${item.default ? 'bg-primary/50' : 'bg-slate-700/50'}`}
                         >
                            <div className={`w-3 h-3 bg-white/50 rounded-full absolute top-1 transition-transform ${item.default ? 'left-6' : 'left-1'}`}></div>
                         </button>
                      </div>
                   ))}
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                   <Info className="w-5 h-5 text-primary" />
                   <p className="text-xs text-primary">
                      Notification preferences are read-only for now. Expect configurable email and in-app alerts soon.
                   </p>
                </div>
             </div>
           )}

           {/* --- DASHBOARD LAYOUT & UI TAB --- */}
           {activeTab === 'Dashboard' && settings ? (
             <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Dashboard Layout & UI Preferences</h3>
                  <p className="text-sm text-slate-400 mt-1">Tune the experience to match your workflow</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Theme */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Theme Selection</label>
                      <div className="flex bg-input border border-white/10 rounded-xl p-1 w-fit">
                         <button 
                            onClick={() => handleDashboardChange('theme', 'light')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${settings.theme === 'light' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                         >
                           <Sun className="w-3 h-3" /> Light
                         </button>
                         <button 
                            onClick={() => handleDashboardChange('theme', 'dark')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${settings.theme === 'dark' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                         >
                           <Moon className="w-3 h-3" /> Dark
                         </button>
                         <button 
                            onClick={() => handleDashboardChange('theme', 'auto')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${settings.theme === 'auto' ? 'bg-surfaceHighlight text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                         >
                           <MonitorSmartphone className="w-3 h-3" /> Auto
                         </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">Auto mode follows OS-level theme preference.</p>
                   </div>

                   {/* Layout Density */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Layout Density</label>
                      <div className="space-y-2">
                         <label 
                           className="flex items-center gap-3 cursor-pointer group"
                           onClick={() => handleDashboardChange('density', 'comfortable')}
                         >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.density === 'comfortable' ? 'border-primary' : 'border-slate-600'}`}>
                               {settings.density === 'comfortable' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                            </div>
                            <span className={`text-sm group-hover:text-white ${settings.density === 'comfortable' ? 'text-white' : 'text-slate-400'}`}>Comfortable (default)</span>
                         </label>
                         <label 
                           className="flex items-center gap-3 cursor-pointer group"
                           onClick={() => handleDashboardChange('density', 'compact')}
                         >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${settings.density === 'compact' ? 'border-primary' : 'border-slate-600'}`}>
                               {settings.density === 'compact' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                            </div>
                            <span className={`text-sm group-hover:text-white ${settings.density === 'compact' ? 'text-white' : 'text-slate-400'}`}>Compact</span>
                         </label>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">Compact mode reduces padding and row height in tables and lists.</p>
                   </div>

                   {/* Default Landing View */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Default Landing View</label>
                      <div className="relative">
                         <Monitor className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                         <select 
                            value={settings.landingView}
                            onChange={(e) => handleDashboardChange('landingView', e.target.value)}
                            className="w-full bg-input border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                         >
                            <option>Home dashboard</option>
                            <option>Instances list</option>
                            <option>Analytics</option>
                         </select>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">Determines where the user is redirected after login.</p>
                   </div>

                   {/* Widgets & Panels */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Widgets & Panels Visibility</label>
                      <div className="space-y-3">
                         {[
                            { id: 'usage', label: 'Show usage summary widget' },
                            { id: 'announcements', label: 'Show announcements panel' },
                            { id: 'actions', label: 'Show action items on home' }
                         ].map((item) => (
                            <label key={item.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleWidget(item.id as any)}>
                               <div className={`w-4 h-4 rounded border flex items-center justify-center ${settings.widgets[item.id as keyof typeof settings.widgets] ? 'bg-primary border-primary' : 'border-slate-600 bg-transparent'}`}>
                                  {settings.widgets[item.id as keyof typeof settings.widgets] && <Check className="w-3 h-3 text-white" />}
                               </div>
                               <span className="text-sm text-slate-300 group-hover:text-white">{item.label}</span>
                            </label>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                   <p className="text-xs text-slate-400">
                      Some layout personalization features are preview-only until backend configuration APIs are available.
                   </p>
                   <button 
                     onClick={() => notify('Preferences saved locally.', 'success')}
                     className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                   >
                      Force Save
                   </button>
                </div>
             </div>
           ) : (
             <div className="flex justify-center py-20">
               <Loader2 className="w-8 h-8 text-primary animate-spin" />
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
