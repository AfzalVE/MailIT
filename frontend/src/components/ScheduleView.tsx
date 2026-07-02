import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Bolt, 
  CheckCircle2, 
  MoreHorizontal, 
  PlusCircle, 
  Check, 
  Clock, 
  MapPin, 
  Plus, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { SuggestedTime, CalendarEvent } from '../types';
import { SUGGESTED_TIMES as initialSuggestedTimes, CALENDAR_EVENTS as initialEvents } from '../mockData';

interface ScheduleViewProps {
  onSendNudge: (recipientName: string, nudgeText: string) => void;
  onScheduleCall: (recipientName: string) => void;
}

export default function ScheduleView({ onSendNudge, onScheduleCall }: ScheduleViewProps) {
  const [suggestedTimes, setSuggestedTimes] = useState<SuggestedTime[]>(initialSuggestedTimes);
  const [addedEvents, setAddedEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Google Calendar Integration states
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false);
  const [gmailUserEmail, setGmailUserEmail] = useState<string | null>(null);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);

  // Follow-up card interactions
  const [nudgedSarah, setNudgedSarah] = useState(false);
  const [scheduledMarcus, setScheduledMarcus] = useState(false);

  useEffect(() => {
    checkAuthAndLoadEvents();
  }, []);

  const checkAuthAndLoadEvents = async () => {
    try {
      const res = await fetch("/api/gmail/auth-status");
      const data = await res.json();
      if (res.ok && data.connected) {
        setIsGmailConnected(true);
        setGmailUserEmail(data.email);
        fetchGoogleCalendar();
      }
    } catch (err) {
      console.error("Failed to check Google auth status:", err);
    }
  };

  const fetchGoogleCalendar = async () => {
    setIsLoadingEvents(true);
    try {
      const res = await fetch("/api/gmail/calendar");
      const data = await res.json();
      if (res.ok && data.events) {
        setGoogleEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to fetch Google calendar events:", err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch("/api/gmail/login");
      const data = await res.json();
      if (data.url) {
        const popup = window.open(data.url, "gmail_oauth_popup", "width=600,height=700");
        if (popup) {
          const handleOAuthMessage = (event: MessageEvent) => {
            const origin = event.origin;
            if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
              return;
            }
            if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
              setIsGmailConnected(true);
              setGmailUserEmail(event.data.email);
              fetchGoogleCalendar();
              window.removeEventListener('message', handleOAuthMessage);
            }
          };
          window.addEventListener('message', handleOAuthMessage);
        } else {
          alert("Popup was blocked! Please enable popups to authorize Google Workspace.");
        }
      }
    } catch (err) {
      console.error("Failed to connect Google:", err);
    }
  };

  // Helper to generate current week's dates (Monday to Sunday)
  const getCurrentWeekDates = () => {
    const dates = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayDiff);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getCurrentWeekDates();

  const getMockEventsForWeekday = (index: number) => {
    if (index === 1) { // Tuesday
      return [
        { id: 'evt-1', title: 'Sync with Acme Corp', time: '10:00 AM', type: 'primary' as const },
        { id: 'evt-2', title: 'Lead Score: 98 Review', time: '2:30 PM', type: 'secondary' as const }
      ];
    }
    if (index === 3) { // Thursday
      return [
        { id: 'evt-3', title: 'AI Recommended Slot', time: '11:00 AM', type: 'tertiary' as const }
      ];
    }
    return [];
  };

  const getEventsForDate = (dateObj: Date) => {
    const dateStr = dateObj.toDateString();
    const manuallyAdded = addedEvents[dateStr] || [];
    
    if (isGmailConnected) {
      const apiEvents = googleEvents.filter((evt: any) => {
        if (!evt.startISO) return false;
        const d = new Date(evt.startISO);
        return d.toDateString() === dateStr;
      }).map((evt: any) => ({
        id: evt.id,
        title: evt.title,
        time: evt.time,
        type: evt.type
      }));
      return [...apiEvents, ...manuallyAdded];
    } else {
      const dayIndex = weekDates.findIndex(d => d.toDateString() === dateStr);
      const mock = getMockEventsForWeekday(dayIndex);
      return [...mock, ...manuallyAdded];
    }
  };

  // Add event from suggested time
  const handleAddSuggestedTime = (time: SuggestedTime) => {
    let targetIndex = 1; // Default Tomorrow / Tuesday
    if (time.day.includes('Thu') || time.day.includes('26')) {
      targetIndex = 3; // Thursday
    }

    const targetDate = weekDates[targetIndex];
    const dateStr = targetDate.toDateString();

    const newEvent: CalendarEvent = {
      id: `evt-added-${Date.now()}`,
      title: `Meeting with Sarah Jenkins`,
      time: time.timeRange.split(' — ')[0], // get start time
      type: 'tertiary'
    };

    setAddedEvents(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), newEvent]
    }));

    // Remove from suggested list with a nice visual feedback
    setSuggestedTimes(prev => prev.filter(t => t.id !== time.id));
    alert(`Successfully scheduled meeting for ${time.day} at ${time.timeRange}!`);
  };

  const handleRefreshAvailability = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Reset suggested times
      setSuggestedTimes(initialSuggestedTimes);
      alert('AI optimized schedule refreshed based on focus hours!');
    }, 1200);
  };

  return (
    <div className="p-6 max-w-[#1440px] mx-auto w-full space-y-6">
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Calendar & Follow-ups (Span 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Calendar Header Card */}
          <div className="bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#571bc1]/5 blur-3xl rounded-full -z-10"></div>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-[#0b1c30]">
                  {weekDates[0].getMonth() === weekDates[6].getMonth() 
                    ? weekDates[0].toLocaleDateString([], { month: 'long', year: 'numeric' })
                    : `${weekDates[0].toLocaleDateString([], { month: 'short' })} — ${weekDates[6].toLocaleDateString([], { month: 'short', year: 'numeric' })}`}
                </h3>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-[#eff4ff] transition-colors cursor-pointer text-[#454654]" id="calendar-prev-week-btn">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-1 rounded hover:bg-[#eff4ff] transition-colors cursor-pointer text-[#454654]" id="calendar-next-week-btn">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex bg-[#eff4ff] p-1 rounded-lg border border-[#c5c5d7]">
                <button
                  onClick={() => setViewType('week')}
                  className={`px-4 py-1 text-xs rounded-md font-semibold cursor-pointer transition-all ${
                    viewType === 'week' ? 'bg-white text-[#2036bd] shadow-xs' : 'text-[#454654]'
                  }`}
                  id="calendar-toggle-week"
                >
                  Week
                </button>
                <button
                  onClick={() => setViewType('month')}
                  className={`px-4 py-1 text-xs rounded-md font-semibold cursor-pointer transition-all ${
                    viewType === 'month' ? 'bg-white text-[#2036bd] shadow-xs' : 'text-[#454654]'
                  }`}
                  id="calendar-toggle-month"
                >
                  Month
                </button>
              </div>
            </div>

            {/* Simplified Weekly Calendar Grid */}
            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <div className="grid grid-cols-7 gap-px bg-[#c5c5d7]/30 rounded-lg overflow-hidden border border-[#c5c5d7] min-w-[700px] lg:min-w-0">
                {/* Day Headers */}
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                  <div key={day} className="bg-[#eff4ff] py-2 text-center select-none">
                    <span className="font-mono text-[10px] font-semibold text-[#454654] tracking-wider">{day}</span>
                  </div>
                ))}

                {/* Day Slots: Monday to Sunday of the current week */}
                {weekDates.map((dateObj, idx) => {
                  const dayNum = dateObj.getDate();
                  const isToday = dateObj.toDateString() === new Date().toDateString();
                  const events = getEventsForDate(dateObj);

                  return (
                    <div
                      key={dateObj.toDateString()}
                      className={`bg-white min-h-[192px] p-2 transition-colors relative flex flex-col group ${
                        idx >= 5 ? 'bg-[#eff4ff]/30' : 'hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            isToday ? 'text-[#2036bd] font-bold bg-[#dfe0ff] w-6 h-6 rounded-full flex items-center justify-center' : 'text-[#0b1c30]/40'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>

                      {/* Events list */}
                      <div className="mt-2 space-y-2 flex-1">
                        {events.map((evt) => {
                          const styleClass = 
                            evt.type === 'primary' 
                              ? 'bg-[#2036bd]/10 border-l-2 border-[#2036bd] text-[#2036bd]' 
                              : evt.type === 'secondary'
                              ? 'bg-[#006c49]/10 border-l-2 border-[#006c49] text-[#006c49]'
                              : 'bg-[#571bc1]/10 border-l-2 border-[#571bc1] text-[#571bc1] border-dashed animate-pulse-glow';

                          return (
                            <div
                              key={evt.id}
                              className={`p-1.5 rounded-sm cursor-pointer hover:brightness-95 transition-all text-[11px] ${styleClass}`}
                              title={`${evt.title} at ${evt.time}`}
                              id={`calendar-event-${evt.id}`}
                            >
                              <p className="font-semibold truncate">{evt.title}</p>
                              <p className="text-[9px] opacity-70 mt-0.5">{evt.time}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pending Follow-ups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-[#0b1c30]">Pending Follow-ups</h3>
              <span className="bg-[#e4d6ff] text-[#5516be] px-3 py-1 rounded-full font-mono text-xs font-semibold">
                3 Attention Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Follow up Card 1: Sarah Jenkins */}
              <div className="bg-white p-5 rounded-xl border border-[#c5c5d7] hover:border-[#2036bd]/40 transition-all group shadow-xs">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-sm text-[#0b1c30]">Sarah Jenkins</p>
                    <p className="text-xs text-[#454654]">VP Product at TechFlow</p>
                  </div>
                  <span className="bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                    SCORE 92
                  </span>
                </div>
                <div className="bg-[#eff4ff] p-3 rounded-lg border border-dashed border-[#571bc1]/30 mb-4 relative overflow-hidden">
                  <Sparkles className="w-4 h-4 text-[#571bc1] absolute top-2.5 right-2.5" />
                  <p className="text-xs italic text-[#454654] pr-6">
                    &quot;Haven't heard back since the demo. Suggest sending the 'Security Whitepaper' nudge.&quot;
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onSendNudge('Sarah Jenkins', "Hi Sarah, checking if you had any questions on the security compliance whitepaper from our demo!");
                      setNudgedSarah(true);
                    }}
                    disabled={nudgedSarah}
                    className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      nudgedSarah 
                        ? 'bg-[#006c49]/10 text-[#006c49] border border-[#006c49]/20' 
                        : 'bg-[#2036bd] text-white hover:opacity-90'
                    }`}
                    id="followup-nudge-sarah"
                  >
                    {nudgedSarah ? 'Nudge Sent' : 'Send Nudge'}
                  </button>
                  <button className="px-3 py-2 border border-[#c5c5d7] rounded-lg text-[#454654] hover:bg-[#eff4ff] transition-all cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Follow up Card 2: Marcus Chen */}
              <div className="bg-white p-5 rounded-xl border border-[#c5c5d7] hover:border-[#2036bd]/40 transition-all group shadow-xs">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-sm text-[#0b1c30]">Marcus Chen</p>
                    <p className="text-xs text-[#454654]">Decision Maker at Horizon</p>
                  </div>
                  <span className="bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                    SCORE 85
                  </span>
                </div>
                <div className="bg-[#eff4ff] p-3 rounded-lg border border-dashed border-[#571bc1]/30 mb-4 relative overflow-hidden">
                  <Sparkles className="w-4 h-4 text-[#571bc1] absolute top-2.5 right-2.5" />
                  <p className="text-xs italic text-[#454654] pr-6">
                    &quot;Marcus opened your last email 4 times. He's likely ready for a follow-up call.&quot;
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onScheduleCall('Marcus Chen');
                      setScheduledMarcus(true);
                    }}
                    disabled={scheduledMarcus}
                    className={`flex-1 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                      scheduledMarcus 
                        ? 'bg-[#006c49]/10 text-[#006c49] border border-[#006c49]/20' 
                        : 'bg-[#2036bd] text-white hover:opacity-90'
                    }`}
                    id="followup-schedule-marcus"
                  >
                    {scheduledMarcus ? 'Call Scheduled' : 'Schedule Call'}
                  </button>
                  <button className="px-3 py-2 border border-[#c5c5d7] rounded-lg text-[#454654] hover:bg-[#eff4ff] transition-all cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Suggested Times & Connected Apps (Span 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Suggested Times Panel */}
          <section className="bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#571bc1] fill-[#571bc1]/10" />
              <h3 className="font-bold text-base text-[#0b1c30]">Suggested Times</h3>
            </div>
            <p className="text-xs text-[#454654] leading-relaxed mb-6">
              AI optimized based on overlap with <span className="text-[#2036bd] font-semibold">Sarah Jenkins</span> and your focus hours.
            </p>

            <div className="space-y-3">
              {suggestedTimes.map((time) => (
                <div
                  key={time.id}
                  onClick={() => handleAddSuggestedTime(time)}
                  className="p-4 rounded-xl border border-[#c5c5d7] bg-white hover:border-[#571bc1]/50 transition-all cursor-pointer group shadow-2xs hover:shadow-xs relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#571bc1]/10 flex items-center justify-center text-[#571bc1]">
                        {time.type === 'bolt' ? <Bolt className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#0b1c30]">{time.day}</p>
                        <p className="font-mono text-[11px] text-[#454654] mt-0.5">{time.timeRange}</p>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[#571bc1] p-1 rounded-full hover:bg-[#571bc1]/10">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                  </div>

                  {time.badges && time.badges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {time.badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className={`font-mono text-[9px] px-2 py-0.5 rounded font-semibold ${
                            badge.includes('Probability') 
                              ? 'bg-[#e4d6ff] text-[#5516be]' 
                              : 'bg-[#eff4ff] text-[#454654]'
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {suggestedTimes.length === 0 && (
                <div className="text-center py-6 bg-[#eff4ff]/20 rounded-xl border border-dashed border-[#c5c5d7]">
                  <Check className="w-6 h-6 text-[#006c49] mx-auto mb-2" />
                  <p className="text-xs text-[#454654] font-medium">All suggested meetings booked!</p>
                </div>
              )}
            </div>

            <button
              onClick={handleRefreshAvailability}
              disabled={refreshing}
              className="w-full mt-6 py-3 border border-dashed border-[#c5c5d7] rounded-xl text-xs text-[#454654] font-semibold hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center justify-center gap-2"
              id="refresh-availability-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Analyzing slots...' : 'Refresh Availability'}</span>
            </button>
          </section>

          {/* Connected Apps Integration Settings */}
          <section className="bg-white rounded-xl border border-[#c5c5d7] p-6 shadow-xs">
            <h3 className="font-bold text-sm text-[#0b1c30] mb-4">Connected Apps</h3>
            
            <div className="space-y-3">
              {/* Google Calendar (Active) */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#eff4ff] border border-[#c5c5d7]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white border border-[#c5c5d7]/20 flex items-center justify-center shadow-2xs">
                    <CalendarIcon className="w-5 h-5 text-[#4285F4]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">Google Calendar</p>
                    {isGmailConnected ? (
                      <p className="text-[10px] text-[#006c49] font-mono flex items-center gap-1 font-semibold mt-0.5">
                        <span className="w-1.5 h-1.5 bg-[#006c49] rounded-full"></span>
                        Active ({gmailUserEmail})
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#454654]/70 font-mono mt-0.5">Not Linked</p>
                    )}
                  </div>
                </div>
                {isGmailConnected ? (
                  <button className="text-[#454654] hover:text-[#2036bd] transition-colors cursor-pointer p-1">
                    <Settings className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    className="text-[#571bc1] font-mono text-[11px] font-bold hover:underline cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Outlook 365 (Dynamic) */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#eff4ff] border border-[#c5c5d7]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white border border-[#c5c5d7]/20 flex items-center justify-center shadow-2xs">
                    <Clock className="w-5 h-5 text-[#0078D4]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">Outlook 365</p>
                    {outlookConnected ? (
                      <p className="text-[10px] text-[#006c49] font-mono flex items-center gap-1 font-semibold mt-0.5">
                        <span className="w-1.5 h-1.5 bg-[#006c49] rounded-full animate-pulse"></span>
                        Active
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#454654]/70 font-mono mt-0.5">Not Linked</p>
                    )}
                  </div>
                </div>
                {outlookConnected ? (
                  <button className="text-[#454654] hover:text-[#2036bd] transition-colors cursor-pointer p-1">
                    <Settings className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setOutlookConnected(true);
                      alert('Outlook 365 Connected successfully!');
                    }}
                    className="text-[#2036bd] font-mono text-[11px] font-bold hover:underline cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Mini Map or Data Visualization Placeholder */}
          <div className="rounded-xl overflow-hidden h-48 border border-[#c5c5d7] relative shadow-xs">
            <div className="absolute inset-0 bg-[#cbdbf5]">
              <img 
                className="w-full h-full object-cover grayscale opacity-50 contrast-125" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBjCQdzJcemj9GKC2XxeGbdn0cfQbCwwiBDMpOmmnfT_1AT_Lhy2twdkHwrcLDXpXCq_wSwrz2yBTet3EDJfeET2sSZGRvH-UJT1lF_Om1K__BIVN2yxyToS0zfcRJxyeQi5Gdd9AgKf32fFbF2dKgAuldEMB5FEKRrEqJAGEqdhmIAGNOIrZmqahmGsVqnnhO12Bd_8bbwAUKRQyp4igbYGoyNfHhvJbSdJJHDElOXO5HjE9B-Z6DeNc7NbxHpQGP87He6b7-uj1s" 
                alt="Minimalist urban architectural render" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9ff] to-transparent"></div>
            
            <div className="absolute bottom-4 left-4">
              <p className="font-mono text-[9px] text-[#454654] uppercase tracking-widest font-semibold">Global Outreach</p>
              <p className="font-bold text-sm text-[#0b1c30]">San Francisco, CA</p>
            </div>
            <div className="absolute top-4 right-4">
              <span className="bg-[#2036bd] text-white w-2.5 h-2.5 rounded-full inline-block animate-pulse"></span>
            </div>
          </div>

        </div>

      </div>

      {/* Contextual FAB (Schedule New) */}
      <button 
        onClick={() => {
          const title = prompt('Enter meeting title:');
          if (title) {
            const todayDate = new Date();
            const dateStr = todayDate.toDateString();
            const newEvent: CalendarEvent = {
              id: `evt-added-${Date.now()}`,
              title,
              time: '11:30 AM',
              type: 'primary'
            };
            setAddedEvents(prev => ({
              ...prev,
              [dateStr]: [...(prev[dateStr] || []), newEvent]
            }));
            alert(`Added meeting "${title}" to today's schedule at 11:30 AM!`);
          }
        }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#2036bd] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 hover:shadow-xl transition-all cursor-pointer group z-40"
        title="Schedule New Event"
        id="schedule-fab-btn"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}
