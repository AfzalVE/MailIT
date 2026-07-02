import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Globe, 
  Clock, 
  Save, 
  Camera, 
  Shield, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { AuthUser } from '../types';

interface ProfileViewProps {
  currentUser: AuthUser;
  onUpdateProfile: (updated: AuthUser) => void;
  onBackToDashboard?: () => void;
}

export default function ProfileView({ currentUser, onUpdateProfile, onBackToDashboard }: ProfileViewProps) {
  // Main form states
  const [name, setName] = useState(currentUser.name || '');
  const [role, setRole] = useState(currentUser.role || 'Growth Lead');
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 382-9102');
  const [company, setCompany] = useState(currentUser.company || 'Aether Intel');
  const [department, setDepartment] = useState(currentUser.department || 'Revenue Operations');
  const [bio, setBio] = useState(currentUser.bio || 'Automating high-conversion email pipelines and scheduling integrations.');
  const [language, setLanguage] = useState(currentUser.language || 'English (US)');
  const [timezone, setTimezone] = useState(currentUser.timezone || 'America/New_York (EST)');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference switches
  const [dailyDigest, setDailyDigest] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [instantSync, setInstantSync] = useState(true);

  // Status & helper states
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ready-to-use AI avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
  ];

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file type. Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds the 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarUrl(e.target.result as string);
        setSuccessMsg('Profile image prepared successfully! Make sure to save changes.');
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    if (!name.trim()) {
      setErrorMsg('Full Name cannot be empty.');
      setIsSaving(false);
      return;
    }

    // Simulate database write
    setTimeout(() => {
      const updatedUser: AuthUser = {
        ...currentUser,
        name,
        role,
        phone,
        company,
        department,
        bio,
        language,
        timezone,
        avatarUrl
      };

      // Update in active React state & parent
      onUpdateProfile(updatedUser);

      // Persist to user accounts store in localStorage
      const usersRaw = localStorage.getItem('aether_users');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        const index = users.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (index !== -1) {
          users[index] = {
            ...users[index],
            name,
            role,
            phone,
            company,
            department,
            bio,
            language,
            timezone,
            avatarUrl
          };
          localStorage.setItem('aether_users', JSON.stringify(users));
        }
      }

      setIsSaving(false);
      setSuccessMsg('Your system profile has been updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsChangingPassword(true);

    setTimeout(() => {
      // Find matching user and update credentials
      const usersRaw = localStorage.getItem('aether_users');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        const index = users.findIndex(
          (u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase() && u.password === currentPassword
        );
        
        if (index !== -1) {
          users[index].password = newPassword;
          localStorage.setItem('aether_users', JSON.stringify(users));
          
          setSuccessMsg('Password changed successfully!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setErrorMsg('Current password does not match our records.');
        }
      }
      setIsChangingPassword(false);
    }, 1200);
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.floor(Math.random() * 10000);
    setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
    setSuccessMsg('Procedural intelligence avatar generated! Click Save to lock it in.');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24 font-sans text-[#0b1c30]" id="profile-view-container">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer text-[#454654]"
              title="Back to Dashboard"
              id="profile-back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30]">Profile Settings</h1>
            <p className="text-xs text-[#576475] mt-0.5">Control your identity, enterprise roles, security certificates, and notification rules.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 border border-[#c5c5d7] hover:bg-slate-50 text-xs font-semibold text-[#454654] rounded-xl transition-all cursor-pointer"
            >
              Dashboard
            </button>
          )}
          <button
            onClick={handleSaveProfile}
            type="button"
            disabled={isSaving}
            className="px-4 py-2 bg-[#2036bd] hover:bg-[#344be0] disabled:bg-[#2036bd]/60 text-white rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#2036bd]/10 transition-all"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#006c49]/10 border border-[#006c49]/30 text-[#006c49] text-xs font-medium flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Execution Successful</p>
            <p className="text-[#3c4b3a] mt-0.5">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg('')} className="hover:text-black font-semibold text-xs ml-auto">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 text-[#ba1a1a] text-xs font-medium flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Input Error Blocked</p>
            <p className="text-[#5f3c3a] mt-0.5">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg('')} className="hover:text-black font-semibold text-xs ml-auto">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Avatar and status indicators */}
        <div className="space-y-6">
          
          {/* Avatar Management Card */}
          <div className="bg-white rounded-2xl border border-[#c5c5d7]/55 p-6 shadow-sm flex flex-col items-center">
            <h2 className="text-xs font-bold tracking-wider font-mono text-[#576475] uppercase self-start mb-4">Profile Avatar</h2>
            
            {/* Visual avatar wrapper */}
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-slate-100 overflow-hidden shadow-md relative bg-[#f0f4f9] flex items-center justify-center">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Uploaded avatar" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <User className="w-12 h-12" />
                    <span className="text-[10px] mt-1">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Overlapping Quick Upload Trigger */}
              <button 
                onClick={triggerFileSelect}
                className="absolute bottom-1 right-1 p-2 bg-[#2036bd] hover:bg-[#344be0] text-white rounded-full shadow-lg border-2 border-white transition-all scale-100 active:scale-95 cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-5">
              <p className="text-xs font-semibold text-[#0b1c30]">{name || 'Unnamed Agent'}</p>
              <p className="text-[10px] text-[#576475] mt-0.5">{role}</p>
              <p className="text-[9px] font-mono text-slate-400 mt-0.5">{currentUser.email}</p>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`w-full p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-[#2036bd] bg-[#2036bd]/5' 
                  : 'border-[#c5c5d7]/60 hover:border-[#2036bd]/40 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-5 h-5 text-[#576475] mb-1.5" />
              <p className="text-[11px] font-semibold text-[#0b1c30]">Drag & drop avatar here</p>
              <p className="text-[9px] text-[#576475] mt-0.5">Supports JPG, PNG, GIF up to 2MB</p>
              
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Presets Grid Selection */}
            <div className="w-full mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider font-mono text-[#576475] uppercase">Preset Library</span>
                <button 
                  onClick={handleRandomizeAvatar}
                  className="text-[9px] font-semibold text-[#2036bd] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#2036bd]" />
                  Generate AI
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      avatarUrl === preset ? 'border-[#2036bd] scale-105' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Account Tier details */}
          <div className="bg-white rounded-2xl border border-[#c5c5d7]/55 p-6 shadow-sm">
            <h2 className="text-xs font-bold tracking-wider font-mono text-[#576475] uppercase mb-4">Enterprise Node</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#576475]">Licensing Mode</span>
                <span className="font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[9px] uppercase tracking-wider font-mono">Premium Enterprise</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#576475]">Deep Learning Sync</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active Grounding
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-[#576475]">API Requests Done</span>
                <span className="font-mono font-medium text-[#0b1c30]">8,321 / 25,000</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[33%] h-full bg-[#2036bd] rounded-full"></div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Form details & security settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main User Profile Form */}
          <div className="bg-white rounded-2xl border border-[#c5c5d7]/55 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold tracking-wider font-mono text-[#576475] uppercase">Corporate Information</h2>
              <span className="text-[10px] text-slate-400 font-mono">ID: AETHER-{currentUser.email.split('@')[0].toUpperCase()}</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Email (Disabled / Read-only) */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-300" />
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full border border-slate-100 bg-slate-50 text-slate-400 p-2 pl-9 rounded-xl text-xs outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Corporate Role */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Corporate Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white cursor-pointer"
                    >
                      <option value="Growth Lead">Growth Lead</option>
                      <option value="Revenue Operations">Revenue Operations</option>
                      <option value="Sales Director">Sales Director</option>
                      <option value="Strategic Partnership Executive">Strategic Partnership Executive</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Executive Assistant">Executive Assistant</option>
                    </select>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Company Organization */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Organization / Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Synergy Global"
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Department</label>
                  <div className="relative">
                    <Sliders className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Revenue Operations"
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

              </div>

              {/* Professional Biography */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Professional Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about your workflow focus..."
                  className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2.5 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white resize-none"
                />
              </div>

              {/* Localization / Language Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Language preference</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white cursor-pointer"
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="Deutsch (Germany)">Deutsch (Germany)</option>
                      <option value="日本語 (Japan)">日本語 (Japan)</option>
                      <option value="Français (France)">Français (France)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">System Timezone</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white cursor-pointer"
                    >
                      <option value="America/New_York (EST)">America/New_York (EST)</option>
                      <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                      <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
                      <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preferences Toggles */}
              <div className="pt-4 mt-2 border-t border-slate-100 space-y-3">
                <h3 className="text-[10px] font-bold tracking-wider font-mono text-[#576475] uppercase">Workspace Integration Rules</h3>
                
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-[#0b1c30]">Daily AI Pipeline Digest</p>
                    <p className="text-[10px] text-slate-400">Receive an early morning CRM score digest with top follow-up recommendations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={dailyDigest}
                      onChange={() => setDailyDigest(!dailyDigest)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2036bd]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-[#0b1c30]">Haptic Sound Effects</p>
                    <p className="text-[10px] text-slate-400">Play a pleasant feedback chime upon inbox deep scoring runs and updates.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={soundEffects}
                      onChange={() => setSoundEffects(!soundEffects)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2036bd]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-[#0b1c30]">Instant Lead Automation Synchronization</p>
                    <p className="text-[10px] text-slate-400">Instantly register outreach actions inside Salesforce and HubSpot dashboards.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={instantSync}
                      onChange={() => setInstantSync(!instantSync)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2036bd]"></div>
                  </label>
                </div>

              </div>

            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-[#c5c5d7]/55 p-6 shadow-sm">
            <h2 className="text-xs font-bold tracking-wider font-mono text-[#576475] uppercase mb-4 flex items-center gap-1.5 text-[#ba1a1a]">
              <Shield className="w-4 h-4 text-[#ba1a1a]" />
              System Credentials Security
            </h2>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Current Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Current Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-[#576475] uppercase font-mono">Confirm New</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-[#c5c5d7]/60 hover:border-[#2036bd]/40 focus:border-[#2036bd] focus:ring-1 focus:ring-[#2036bd]/20 p-2 pl-9 rounded-xl text-xs text-[#0b1c30] outline-none transition-all bg-white"
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-[#ba1a1a]/5 hover:text-[#ba1a1a] hover:border-[#ba1a1a]/25 text-xs font-bold tracking-wide rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Security...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Change Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
