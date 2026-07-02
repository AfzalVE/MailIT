import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, EyeOff, Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types';
import { api } from "../api/api";

interface LoginRegisterProps {
  onLoginSuccess: (user: AuthUser) => void;
  userEmailFromMetadata?: string;
}

export default function LoginRegister({ onLoginSuccess, userEmailFromMetadata }: LoginRegisterProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Growth Lead');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Validation & message states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-fill metadata email or default test account
  useEffect(() => {
    if (userEmailFromMetadata) {
      setEmail(userEmailFromMetadata);
    } else {
      setEmail('skmafzal2004@gmail.com');
    }
    setPassword('password123');
  }, [userEmailFromMetadata]);

  // Seed default accounts in localStorage if they don't exist
  

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Excellent'];
  const strengthColors = ['bg-[#ba1a1a]', 'bg-[#b78000]', 'bg-[#006c49]', 'bg-[#2036bd]'];

const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();

  setError("");
  setSuccess("");
  setIsLoading(true);

  try {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    if (mode === "register" && !name) {
      throw new Error("Please enter your full name.");
    }

    if (mode === "login") {
      const response = await api.login(email, password);

      setSuccess("Login successful.");

      onLoginSuccess({
        email: response.user.email,
        name: response.user.name,
        role: response.user.role ?? "User",
        avatarUrl: response.user.avatar_url,
      });
    } else {
      await api.register(
        name,
        email,
        password,
      );

      setSuccess(
        "Registration successful. Logging you in..."
      );

      const response = await api.login(
        email,
        password
      );

      onLoginSuccess({
        email: response.user.email,
        name: response.user.name,
        role: response.user.role ?? "User",
        avatarUrl: response.user.avatar_url,
      });
    }
  } catch (err: any) {
    setError(err.message || "Authentication failed.");
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-[#060c18] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2036bd]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#571bc1]/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#0b1424]/80 backdrop-blur-md border border-[#2036bd]/25 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-[#2036bd]/20 border border-[#2036bd]/40 rounded-xl items-center justify-center text-[#405bf5] mb-3 animate-pulse-glow">
            <Sparkles className="w-6 h-6 fill-[#405bf5]/20" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight font-display text-white">AETHER INTEL</h2>
          <p className="text-xs text-[#7184a3] mt-1">Autonomous Email Intelligence & CRM Synthesizer</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#070e1b] p-1.5 rounded-xl mb-6 border border-[#2036bd]/10">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              mode === 'login'
                ? 'bg-[#2036bd] text-white shadow-lg'
                : 'text-[#7184a3] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              mode === 'register'
                ? 'bg-[#2036bd] text-white shadow-lg'
                : 'text-[#7184a3] hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Status / Message Display */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 text-[#ffb4ab] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-[#006c49]/15 border border-[#006c49]/35 text-[#a8f5cc] text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Registration Extra Fields */}
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-wider text-[#7184a3] uppercase font-mono">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#435470]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-[#070e1b] border border-[#2036bd]/20 hover:border-[#2036bd]/40 focus:border-[#405bf5] focus:ring-1 focus:ring-[#405bf5]/30 p-3 pl-10 rounded-xl text-xs text-slate-100 outline-none transition-all placeholder:text-[#334662]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold tracking-wider text-[#7184a3] uppercase font-mono">Corporate Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-[#435470]" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#070e1b] border border-[#2036bd]/20 hover:border-[#2036bd]/40 focus:border-[#405bf5] focus:ring-1 focus:ring-[#405bf5]/30 p-3 pl-10 rounded-xl text-xs text-slate-100 outline-none transition-all cursor-pointer"
                  >
                    <option value="Growth Lead">Growth Lead</option>
                    <option value="Revenue Operations">Revenue Operations</option>
                    <option value="Sales Director">Sales Director</option>
                    <option value="Strategic Partnership Executive">Partnership Lead</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold tracking-wider text-[#7184a3] uppercase font-mono">Work Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#435470]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#070e1b] border border-[#2036bd]/20 hover:border-[#2036bd]/40 focus:border-[#405bf5] focus:ring-1 focus:ring-[#405bf5]/30 p-3 pl-10 rounded-xl text-xs text-slate-100 outline-none transition-all placeholder:text-[#334662]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold tracking-wider text-[#7184a3] uppercase font-mono">Security Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('For security in this developer environment, you can use any account or simply register a fresh one locally!')}
                  className="text-[10px] font-semibold text-[#405bf5] hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#435470]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#070e1b] border border-[#2036bd]/20 hover:border-[#2036bd]/40 focus:border-[#405bf5] focus:ring-1 focus:ring-[#405bf5]/30 p-3 pl-10 pr-10 rounded-xl text-xs text-slate-100 outline-none transition-all placeholder:text-[#334662]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#435470] hover:text-[#7184a3] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength meter during Registration */}
            {mode === 'register' && password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-[#7184a3]">
                  <span>Strength: {strengthLabels[getPasswordStrength() - 1] || 'Too Short'}</span>
                  <span>Min 6 characters</span>
                </div>
                <div className="h-1 bg-[#070e1b] rounded-full overflow-hidden flex gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 transition-all duration-300 ${
                        i < getPasswordStrength()
                          ? strengthColors[getPasswordStrength() - 1]
                          : 'bg-[#1b253b]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Remember me & terms */}
          {mode === 'login' ? (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#2036bd]/40 bg-[#070e1b] checked:bg-[#2036bd] focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-[#7184a3] font-semibold">Keep me signed in</span>
              </label>
            </div>
          ) : (
            <p className="text-[10px] text-[#7184a3] leading-relaxed pt-1">
              By registering, you confirm access permission for Aether Mail's automated NLP & deep sync routing system parameters.
            </p>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3 px-4 bg-[#2036bd] hover:bg-[#344be0] active:scale-[0.99] text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-wait`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Synchronizing Token...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Access Dashboard' : 'Generate Secure Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick evaluation / bypass section */}
        {/* <div className="mt-8 pt-6 border-t border-[#2036bd]/15 text-center">
          <p className="text-[10px] text-[#7184a3] uppercase tracking-wider font-mono font-semibold mb-3">Quick Developer Sign-In</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleQuickDemoLogin(userEmailFromMetadata || 'skmafzal2004@gmail.com')}
              className="w-full py-2 px-3 rounded-lg bg-[#2036bd]/10 hover:bg-[#2036bd]/20 border border-[#2036bd]/20 text-xs font-semibold text-[#405bf5] text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white font-bold truncate max-w-[220px]">
                  {userEmailFromMetadata || 'skmafzal2004@gmail.com'}
                </span>
                <span className="text-[9px] font-normal text-[#7184a3]">Default Admin account (pre-seeded)</span>
              </div>
              <span className="text-[10px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">Select &rarr;</span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('alex@aether.io')}
              className="w-full py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs font-semibold text-slate-300 text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white font-bold">alex@aether.io</span>
                <span className="text-[9px] font-normal text-[#7184a3]">Alternative Revenue Operations seat</span>
              </div>
              <span className="text-[10px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">Select &rarr;</span>
            </button>
          </div>
        </div> */}

      </div>
    </div>
  );
}
