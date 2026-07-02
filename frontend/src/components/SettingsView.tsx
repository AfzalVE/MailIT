import React, { useState } from 'react';
import { Settings, Sparkles, Shield, User, Link, HelpCircle, Key, Cpu } from 'lucide-react';

export default function SettingsView() {
  const [modelType, setModelType] = useState('gemini-3.5-flash');
  const [toneMode, setToneMode] = useState('warm');

  return (
    <div className="p-6 max-w-[#1440px] mx-auto w-full space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight">System Settings</h2>
        <p className="text-[#454654] text-xs sm:text-sm">Configure AI assistant models, workspace credentials, and security parameters.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Side options block (Span 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* AI Settings Section */}
          <section className="bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#eff4ff]">
              <Sparkles className="w-5 h-5 text-[#571bc1]" />
              <h3 className="font-bold text-sm text-[#0b1c30]">Aether Intelligence Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider font-mono">
                  Default Language Model
                </label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#c5c5d7] p-3 rounded-lg text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#2036bd]/15 outline-none font-semibold"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default • Superfast)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep reasoning)</option>
                </select>
                <p className="text-[10px] text-[#454654]">
                  Recommended for instant contextual drafting and scoring analysis.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider font-mono">
                  Preferred Tone Profile
                </label>
                <select
                  value={toneMode}
                  onChange={(e) => setToneMode(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-[#c5c5d7] p-3 rounded-lg text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#2036bd]/15 outline-none font-semibold"
                >
                  <option value="warm">Confident & Warm (Recommended)</option>
                  <option value="direct">Direct & Concise</option>
                  <option value="formal">Academic & Formal</option>
                </select>
                <p className="text-[10px] text-[#454654]">
                  Applies directly to AI replies generated via suggested reply buttons.
                </p>
              </div>
            </div>
          </section>

          {/* Connected CRM Platforms */}
          <section className="bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#eff4ff]">
              <Link className="w-5 h-5 text-[#2036bd]" />
              <h3 className="font-bold text-sm text-[#0b1c30]">CRM & Salesforce Workspace integrations</h3>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#eff4ff]/60 border border-[#c5c5d7]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white border border-[#c5c5d7]/20 flex items-center justify-center font-bold text-[#00a1e0] text-xs shadow-3xs">
                    SF
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">Salesforce CRM Core</p>
                    <p className="text-[10px] text-[#006c49] font-mono flex items-center gap-1 font-semibold mt-0.5">
                      <span className="w-1.5 h-1.5 bg-[#006c49] rounded-full animate-pulse"></span>
                      Connected (Workspace-level)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Salesforce integration is managed at workspace level')}
                  className="text-[#454654] hover:text-[#2036bd] font-mono text-[11px] font-bold"
                >
                  Configure
                </button>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-[#eff4ff]/60 border border-[#c5c5d7]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white border border-[#c5c5d7]/20 flex items-center justify-center font-bold text-[#ff7a59] text-xs shadow-3xs">
                    HS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">HubSpot Marketing Suite</p>
                    <p className="text-[10px] text-[#454654]/70 font-mono mt-0.5">Not Linked</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Simulated HubSpot OAuth Setup initiated.')}
                  className="text-[#2036bd] font-mono text-[11px] font-bold hover:underline"
                >
                  Link Account
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* Right Side diagnostics block (Span 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          <section className="bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#0b1c30]">
              <Shield className="w-5 h-5 text-[#006c49]" />
              <h3 className="font-bold text-sm">Security & Secret Keys</h3>
            </div>
            
            <div className="space-y-4 text-xs text-[#454654]">
              <div className="p-3.5 bg-[#006c49]/5 border border-[#006c49]/15 rounded-lg flex gap-3">
                <Key className="w-4 h-4 text-[#006c49] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#006c49]">Gemini Key Confirmed</p>
                  <p className="text-[10px] text-[#454654] mt-0.5 leading-relaxed">
                    Aether server is successfully reading your developer secret token. Dynamic drafting is fully unlocked.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="font-bold text-[#0b1c30] mb-1 font-mono text-[10px] uppercase tracking-wider">Host Node Diagnostics</p>
                <div className="bg-[#eff4ff] p-3 rounded-lg font-mono text-[10px] text-[#454654] space-y-1">
                  <p>Runtime: Node.js (Vite + Express)</p>
                  <p>Model Engine: @google/genai</p>
                  <p>Proxy Port: 3000</p>
                  <p>Environment: Sandbox Container</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-[#0b1c30] mb-2">
              <Cpu className="w-5 h-5 text-[#2036bd]" />
              <h3 className="font-bold text-sm">Hardware Acceleration</h3>
            </div>
            <p className="text-xs text-[#454654] leading-relaxed">
              Real-time lead processing occurs inside specialized serverless pods to ensure maximum prompt execution speed.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
