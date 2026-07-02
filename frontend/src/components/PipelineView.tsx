import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Users, 
  Download, 
  CheckCircle, 
  Send 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { INITIAL_LEADS, OPEN_RATE_DATA, CLICK_THROUGH_DATA } from '../mockData';
import { Lead } from '../types';

interface PipelineViewProps {
  onLeadAction: (leadName: string, action: string) => void;
}

export default function PipelineView({ onLeadAction }: PipelineViewProps) {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Lead Pipeline Intelligence report exported successfully as CSV!');
    }, 1500);
  };

  return (
    <div className="p-6 max-w-[#1440px] mx-auto w-full space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight">Lead Scoring Dashboard</h2>
          <p className="text-[#454654] text-xs sm:text-sm">Sales intelligence and engagement metrics for the last 7 days.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#6cf8bb]/10 text-[#00714d] rounded-lg font-mono text-[10px] sm:text-xs font-bold border border-[#6cf8bb]/20">
            <CheckCircle className="w-3.5 h-3.5 text-[#006c49]" />
            <span>CRM Synced 2m ago</span>
          </div>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-[#c5c5d7] rounded-lg hover:bg-[#eff4ff] transition-all text-[11px] sm:text-xs font-semibold flex items-center gap-2 cursor-pointer bg-white"
            id="pipeline-export-btn"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Leaderboard & AI Insights */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Hot Leads Leaderboard (Span 8) */}
        <section className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-[#c5c5d7] p-6 flex flex-col shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#2036bd] fill-[#2036bd]/10" />
              <h3 className="font-bold text-base text-[#0b1c30]">Hot Leads Leaderboard</h3>
            </div>
            <button 
              onClick={() => alert('Viewing full CRM pipeline...')} 
              className="text-[#2036bd] text-xs font-mono font-bold hover:underline cursor-pointer"
            >
              View All Pipeline
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {leads.map((lead) => (
              <div 
                key={lead.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 gap-4 rounded-xl border border-transparent hover:border-[#c5c5d7] hover:bg-[#eff4ff]/30 transition-all bg-white"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#dfe0ff] flex items-center justify-center font-bold text-[#2036bd] text-xs sm:text-sm shrink-0 shadow-2xs">
                    {lead.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#0b1c30] group-hover:text-[#2036bd] transition-colors">{lead.name}</h4>
                    <p className="text-[11px] sm:text-xs text-[#454654]">{lead.role} @ {lead.company}</p>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[#c5c5d7]/30">
                  {/* Engagement Bar Representation */}
                  <div className="text-left">
                    <div className="text-[9px] font-mono font-semibold uppercase text-[#454654]/60 tracking-wider">Engagement</div>
                    <div className="flex gap-1 mt-1 justify-start sm:justify-end">
                      {[1, 2, 3, 4].map((bar) => (
                        <span 
                          key={bar} 
                          className={`w-2 h-3.5 rounded-sm transition-all ${
                            bar <= lead.engagement 
                              ? 'bg-[#2036bd]' 
                              : 'bg-[#c5c5d7]/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Score Badge */}
                  <div className="bg-[#6cf8bb]/10 border border-[#6cf8bb]/20 px-2 sm:px-3 py-1 rounded-lg text-center min-w-[60px] sm:min-w-[70px]">
                    <span className="block text-[8px] font-mono font-bold text-[#00714d] uppercase tracking-wider">SCORE</span>
                    <span className="block text-sm sm:text-base text-[#006c49] font-black">{lead.score}</span>
                  </div>

                  {/* Send Action */}
                  <button 
                    onClick={() => onLeadAction(lead.name, lead.aiNudge)}
                    className="p-1.5 sm:p-2 text-[#454654] hover:text-[#2036bd] hover:bg-[#dfe0ff]/40 rounded-full transition-colors cursor-pointer"
                    title={`Trigger AI Nudge: "${lead.aiNudge}"`}
                    id={`pipeline-lead-action-${lead.id}`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Insights Card (Span 4) */}
        <section className="col-span-12 lg:col-span-4 bg-[#703eda] text-[#e4d6ff] rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md">
          {/* Background overlay */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#6cf8bb] opacity-10 rounded-full blur-3xl -z-10"></div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-white fill-white/10" />
              <h3 className="font-bold text-base text-white">AI Insights</h3>
            </div>

            <div className="space-y-4">
              {/* Insight Item 1 */}
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/15 hover:border-white/20 transition-all">
                <p className="text-xs text-white leading-relaxed mb-3">
                  &quot;Emails sent at <strong className="text-[#6ffbbe]">10:00 AM</strong> have 20% higher engagement rate in your current segment.&quot;
                </p>
                <button 
                  onClick={() => alert('Simulated scheduling AI email campaigns for tomorrow at 10 AM.')}
                  className="text-xs font-mono font-bold text-[#6ffbbe] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Schedule Tomorrow</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Insight Item 2 */}
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/15 hover:border-white/20 transition-all">
                <p className="text-xs text-white leading-relaxed mb-3">
                  &quot;Leads from <strong className="text-[#6ffbbe]">LinkedIn</strong> are converting 3x faster than direct email lists.&quot;
                </p>
                <button 
                  onClick={() => alert('Displaying source breakdown report for LinkedIn integrations...')}
                  className="text-xs font-mono font-bold text-[#6ffbbe] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Source Breakdown</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Intelligence confidence meter */}
          <div className="pt-6 border-t border-white/10 mt-6">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-white/80">Intelligence Confidence</span>
              <span className="text-[#6ffbbe] font-bold">94%</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="w-[94%] bg-[#6ffbbe] h-full rounded-full" />
            </div>
          </div>
        </section>

      </div>

      {/* Bottom Grid: Analytics & Metrics */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Engagement Charts: Open Rate Trend BarChart (Span 6) */}
        <section className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-sm text-[#0b1c30]">Open Rate Trend</h3>
              <p className="text-xs text-[#454654]">Weekly performance by volume</p>
            </div>
            <span className="px-3 py-1 bg-[#2036bd]/10 text-[#2036bd] font-mono text-xs font-bold rounded-full">
              42.5% Avg
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={OPEN_RATE_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#454654', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#454654', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#eff4ff', radius: 4 }}
                  contentStyle={{ background: '#0b1c30', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px' }} 
                />
                <Bar 
                  dataKey="rate" 
                  fill="#2036bd" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Click-Through Rates: Process Bars (Span 6) */}
        <section className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-sm text-[#0b1c30]">Click-Through Rates</h3>
              <p className="text-xs text-[#454654]">Engagement with CTA links</p>
            </div>
            <span className="px-3 py-1 bg-[#006c49]/10 text-[#006c49] font-mono text-xs font-bold rounded-full">
              12.8% Avg
            </span>
          </div>

          <div className="space-y-5">
            {CLICK_THROUGH_DATA.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[#0b1c30] font-medium">{item.label}</span>
                  <span className="text-[#2036bd] font-black">{item.value}%</span>
                </div>
                <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#2036bd] h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${item.rate}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Metrics Row: 3 metric widgets (Span 4 each) */}
        <div className="col-span-12 md:col-span-4 bg-[#eff4ff] rounded-xl border border-[#c5c5d7]/50 p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-white rounded-lg border border-[#c5c5d7]/30 text-[#2036bd] shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#454654] uppercase font-mono tracking-wider font-semibold">New Leads Today</div>
            <div className="text-xl font-bold text-[#0b1c30] mt-0.5">+24</div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-[#eff4ff] rounded-xl border border-[#c5c5d7]/50 p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-white rounded-lg border border-[#c5c5d7]/30 text-[#006c49] shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#454654] uppercase font-mono tracking-wider font-semibold">Pending Actions</div>
            <div className="text-xl font-bold text-[#0b1c30] mt-0.5">12</div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-[#eff4ff] rounded-xl border border-[#c5c5d7]/50 p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-white rounded-lg border border-[#c5c5d7]/30 text-[#ba1a1a] shrink-0 shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-[#454654] uppercase font-mono tracking-wider font-semibold">Stale Leads</div>
            <div className="text-xl font-bold text-[#0b1c30] mt-0.5">08</div>
          </div>
        </div>

      </div>

    </div>
  );
}
