import React, { useState, useEffect } from 'react';
import {
  Filter,
  ArrowUpDown,
  Eye,
  MousePointerClick,
  MoreVertical,
  Reply,
  Archive,
  Sparkles,
  Paperclip,
  FileText,
  FileSpreadsheet,
  Trash2,
  Star,
  Send,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Briefcase,
  AlertCircle,
  Bell,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Email, SuggestedResponse } from '../types';
import { INITIAL_EMAILS } from '../mockData';
import { api } from "../api/api";
import DOMPurify from "dompurify";

interface InboxViewProps {
  onDraftSend?: (recipient: string, subject: string, body: string) => void;
}

export default function InboxView({ onDraftSend }: InboxViewProps) {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [activeEmailId, setActiveEmailId] = useState<string>('email-1');
  const [filterTab, setFilterTab] = useState<'all' | 'suggestions' | 'drafts'>('all');
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);

  // Gmail integration states
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false);
  const [gmailUserEmail, setGmailUserEmail] = useState<string | null>(null);
  const [activeInboxType, setActiveInboxType] = useState<'mock' | 'gmail'>('mock');
  const [isGmailLoading, setIsGmailLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Active email object
  const activeEmail = emails.find(e => e.id === activeEmailId) || emails[0];

  // Check Gmail connection and load emails
  useEffect(() => {
    const checkGmailAuth = async () => {
      try {
        const data = await api.authStatus();
        if (data.connected) {
          setIsGmailConnected(true);
          setGmailUserEmail(data.email);
          setActiveInboxType('gmail');
          setIsGmailLoading(true);
          const recentData = await api.getRecentEmails();

          if (recentData.emails) {
            setEmails(recentData.emails);
            if (recentData.emails.length > 0) {
              setActiveEmailId(recentData.emails[0].id);
            }
          }
          setIsGmailLoading(false);
        }
      } catch (err) {
        console.error("Failed to check Gmail auth status:", err);
      }
    };
    checkGmailAuth();
  }, []);

  // Listen for login popup window success messages
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
        setIsGmailConnected(true);
        setGmailUserEmail(event.data.email);
        setActiveInboxType('gmail');
        fetchGmailEmails();
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const fetchGmailEmails = async () => {
    setIsGmailLoading(true);
    try {
      const data = await api.getRecentEmails();

      if (data.emails) {
        setEmails(data.emails);
        if (data.emails.length > 0) {
          setActiveEmailId(data.emails[0].id);
        }
      } else {
        console.warn("Gmail load failed:", data.error);
      }
    } catch (err) {
      console.error("Error fetching Gmail:", err);
    } finally {
      setIsGmailLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      api.loginWithGoogle();
    } catch (err) {
      console.error("Failed to connect Gmail:", err);
    }
  };

  const handleDisconnectGmail = async () => {
    const confirmed = window.confirm("Are you sure you want to disconnect your Gmail integration? Your secure local credentials will be removed.");
    if (!confirmed) return;

    try {
      const res = await api.disconnectGoogle();
      if (res.ok) {
        setIsGmailConnected(false);
        setGmailUserEmail(null);
        setActiveInboxType('mock');
        setEmails(INITIAL_EMAILS);
        setActiveEmailId(INITIAL_EMAILS[0]?.id || 'email-1');
        alert("Gmail disconnected successfully.");
      }
    } catch (err) {
      console.error("Failed to disconnect Gmail:", err);
    }
  };

  const handleAnalyzeEmail = async () => {
    if (!activeEmail) return;
    setIsAnalyzing(true);
    try {
      const data = await api.analyzeEmail(
        activeEmail.sender,
        activeEmail.subject,
        activeEmail.body
      );

      if (data.success) {
        setEmails(prev => prev.map(e => {
          if (e.id === activeEmail.id) {
            const scoreNum = Math.round((data.data.engagement + data.data.intent) / 2);
            return {
              ...e,
              score: `${scoreNum}/100`,
              aiSummary: data.data.summary,
              engagement: data.data.engagement,
              intent: data.data.intent,
              sentiment: data.data.sentiment,
              recommendedNudge: data.data.recommendedNudge,
              suggestedResponses: data.data.suggestedResponses
            };
          }
          return e;
        }));
      } else {
        alert(data.error || "Failed to analyze email.");
      }
    } catch (err) {
      console.error("Error analyzing email:", err);
      alert("Error analyzing email with Gemini. Please check connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reply draft state
  const [replyText, setReplyText] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [showReplyArea, setShowReplyArea] = useState<boolean>(false);
  const [reminderChecked, setReminderChecked] = useState<boolean>(true);
  const [reminderDate, setReminderDate] = useState<string>('May 26, 2024');
  const [reminderTime, setReminderTime] = useState<string>('09:00 AM');

  // Load selected template into reply box
  const handleSelectTemplate = (template: SuggestedResponse) => {
    setShowReplyArea(true);
    setReplyText(template.fullText);
    // Smooth scroll to reply area
    setTimeout(() => {
      document.getElementById('inbox-reply-area')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Dynamically generate a custom AI draft from the backend endpoint
  const handleGenerateAIDraft = async (customPrompt?: string) => {
    setIsDrafting(true);
    setShowReplyArea(true);
    setReplyText('Aether AI is analyzing email thread and composing a context-rich reply...');

    const activePrompt = customPrompt || `Draft a quick, professional response addressing the sender's points, asking to coordinate scheduling or details.`;

    try {
      const response = await fetch('/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activePrompt,
          contextText: `Sender: ${activeEmail.sender} (${activeEmail.senderEmail})\nSubject: ${activeEmail.subject}\nEmail Body:\n${activeEmail.body}`
        })
      });

      const data = await response.json();
      if (response.ok && data.draft) {
        setReplyText(data.draft);
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err: any) {
      console.error('Error in AI drafting:', err);
      // Fallback template
      setReplyText(
        `Hi ${activeEmail.sender},\n\nThank you for the update. I have reviewed the proposal and Q4 metrics. Let's arrange a 15-minute sync next Tuesday to walk through how we might align our teams.\n\nBest regards,\nAlex Rivera`
      );
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    if (activeInboxType === 'gmail') {
      const confirmed = window.confirm(`Send this reply to ${activeEmail.sender} (${activeEmail.senderEmail}) via your connected Gmail account?`);
      if (!confirmed) return;

      setIsDrafting(true);
      try {
        const res = await fetch("/api/gmail/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: activeEmail.senderEmail,
            subject: activeEmail.subject.startsWith("Re:") ? activeEmail.subject : `Re: ${activeEmail.subject}`,
            body: replyText
          })
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const newMessage = {
          id: `msg-${Date.now()}`,
          sender: 'You',
          body: replyText,
          date: 'Just Now',
          isMe: true
        };

        setEmails(prevEmails => prevEmails.map(email => {
          if (email.id === activeEmail.id) {
            const currentHistory = email.threadHistory || [];
            return {
              ...email,
              threadHistory: [...currentHistory, newMessage]
            };
          }
          return email;
        }));

        setReplyText('');
        setShowReplyArea(false);
        alert(`Reply successfully sent via Gmail!`);
      } catch (err: any) {
        console.error("Failed to send reply via Gmail:", err);
        alert(`Failed to send email via Gmail: ${err.message || 'Unknown error'}`);
      } finally {
        setIsDrafting(false);
      }
    } else {
      // Simulate sending the email and adding it to history
      const newMessage = {
        id: `msg-${Date.now()}`,
        sender: 'You',
        body: replyText,
        date: 'Just Now',
        isMe: true
      };

      setEmails(prevEmails => prevEmails.map(email => {
        if (email.id === activeEmail.id) {
          const currentHistory = email.threadHistory || [];
          return {
            ...email,
            threadHistory: [...currentHistory, newMessage]
          };
        }
        return email;
      }));

      setReplyText('');
      setShowReplyArea(false);
      alert(`Reply sent to ${activeEmail.sender}!`);

      if (onDraftSend) {
        onDraftSend(activeEmail.senderEmail, `Re: ${activeEmail.subject}`, replyText);
      }
    }
  };

  const filteredEmails = emails.filter(email => {
    if (filterTab === 'suggestions') {
      return typeof email.score === 'string' && email.score.includes('/');
    }
    if (filterTab === 'drafts') {
      return email.threadHistory && email.threadHistory.length > 0;
    }
    return true; // 'all'
  });

  return (
    <div className="flex-1 h-[calc(100vh-64px)] overflow-hidden flex bg-[#f8f9ff]">

      {/* COLUMN 1: Email Scrollable List (Width: 420px, responsive) */}
      <div className={`w-full lg:w-[420px] h-full border-r border-[#c5c5d7] flex flex-col bg-white shrink-0 ${showMobileDetail ? 'hidden lg:flex' : 'flex'
        }`}>

        {/* Inbox Header & Search Filters */}
        <div className="p-4 border-b border-[#c5c5d7] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-[#0b1c30] flex items-center gap-2">
              <span>Inbox</span>
              {isGmailLoading && (
                <span className="w-4 h-4 rounded-full border-2 border-[#571bc1]/25 border-t-[#571bc1] animate-spin"></span>
              )}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => alert('Filter applied')}
                className="p-1.5 rounded hover:bg-[#eff4ff] text-[#454654] transition-colors cursor-pointer"
                title="Filter emails"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert('Sort criteria updated')}
                className="p-1.5 rounded hover:bg-[#eff4ff] text-[#454654] transition-colors cursor-pointer"
                title="Sort emails"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inbox Type Switcher */}
          <div className="flex bg-[#060c18]/5 border border-[#c5c5d7]/30 p-1 rounded-xl items-center justify-between">
            <button
              onClick={() => {
                setActiveInboxType('mock');
                setEmails(INITIAL_EMAILS);
                setActiveEmailId(INITIAL_EMAILS[0]?.id || 'email-1');
              }}
              className={`flex-1 py-1.5 px-2 text-center text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${activeInboxType === 'mock'
                ? 'bg-[#2036bd] text-white shadow-xs'
                : 'text-[#454654] hover:bg-[#eff4ff]'
                }`}
            >
              Simulated Inbox
            </button>
            <button
              onClick={async () => {
                if (!isGmailConnected) {
                  await handleConnectGmail();
                } else {
                  setActiveInboxType('gmail');
                  fetchGmailEmails();
                }
              }}
              className={`flex-1 py-1.5 px-2 text-center text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${activeInboxType === 'gmail'
                ? 'bg-[#571bc1] text-white shadow-xs'
                : 'text-[#454654] hover:bg-[#eff4ff]'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-white/10" />
              <span>Real Gmail</span>
              {isGmailConnected && (
                <span className="w-1.5 h-1.5 bg-[#006c49] rounded-full inline-block animate-pulse"></span>
              )}
            </button>
          </div>

          {/* Gmail Connection Status Banner */}
          {activeInboxType === 'gmail' && (
            <div className="bg-[#571bc1]/5 border border-[#571bc1]/20 p-2.5 rounded-xl flex items-center justify-between text-[11px] animate-in fade-in duration-300">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 bg-[#006c49] rounded-full animate-pulse shrink-0"></div>
                <p className="text-[#571bc1] font-semibold truncate">
                  {gmailUserEmail ? `Synced with ${gmailUserEmail}` : "Gmail Connected"}
                </p>
              </div>
              <button
                onClick={handleDisconnectGmail}
                className="text-xs font-bold text-[#ba1a1a] hover:underline cursor-pointer shrink-0"
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Tab switching list filters */}
          <div className="flex p-1 bg-[#eff4ff] rounded-lg gap-1">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 text-center text-xs rounded-md font-semibold cursor-pointer transition-all ${filterTab === 'all' ? 'bg-white text-[#2036bd] shadow-xs' : 'text-[#454654]'
                }`}
            >
              All Mail
            </button>
            <button
              onClick={() => setFilterTab('suggestions')}
              className={`flex-1 py-1.5 text-center text-xs rounded-md font-semibold cursor-pointer transition-all relative ${filterTab === 'suggestions' ? 'bg-white text-[#2036bd] shadow-xs' : 'text-[#454654]'
                }`}
            >
              Suggestions
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#571bc1] text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-black">
                4
              </span>
            </button>
            <button
              onClick={() => setFilterTab('drafts')}
              className={`flex-1 py-1.5 text-center text-xs rounded-md font-semibold cursor-pointer transition-all ${filterTab === 'drafts' ? 'bg-white text-[#2036bd] shadow-xs' : 'text-[#454654]'
                }`}
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Email Thread Cards Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#c5c5d7]/30">
          {filteredEmails.map((email) => {
            const isActive = email.id === activeEmail.id;

            // Format lead score badges cleanly
            const isScoreString = typeof email.score === 'string';
            const isPriority = isScoreString && email.score.includes('/');
            const isLow = isScoreString && email.score.includes('Low');
            const isNewsletter = isScoreString && email.score.includes('News');

            return (
              <div
                key={email.id}
                onClick={() => {
                  setActiveEmailId(email.id);
                  setShowReplyArea(false);
                  setReplyText('');
                  setShowMobileDetail(true);
                }}
                className={`p-4 cursor-pointer transition-all hover:bg-[#f8f9ff] group relative ${isActive
                  ? 'bg-[#eff4ff] border-l-4 border-[#2036bd]'
                  : 'bg-white'
                  }`}
                id={`inbox-email-card-${email.id}`}
              >
                {/* Header Row: Sender, Time */}
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs ${isActive ? 'text-[#2036bd] font-bold' : 'text-[#0b1c30] font-semibold'}`}>
                    {email.sender}
                  </span>
                  <span className="text-[10px] text-[#454654]/70 font-mono">
                    {email.time ? (email.time.includes('·') ? email.time.split('·')[0].trim() : email.time) : (email.date || '')}
                  </span>
                </div>

                {/* Title Row: Subject, Priority Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`text-xs truncate flex-1 ${isActive ? 'font-bold text-[#0b1c30]' : 'text-[#454654] font-medium'}`}>
                    {email.subject}
                  </h3>

                  {isPriority && (
                    <span className="px-1.5 py-0.5 rounded bg-[#6cf8bb]/10 text-[#00714d] text-[9px] font-mono font-bold flex items-center gap-1 border border-[#6cf8bb]/20">
                      {email.score}
                      <span className="w-1 h-1 bg-[#006c49] rounded-full animate-pulse"></span>
                    </span>
                  )}
                  {isLow && (
                    <span className="px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[9px] font-mono font-bold border border-[#ba1a1a]/15">
                      Low
                    </span>
                  )}
                  {isNewsletter && (
                    <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#454654] text-[9px] font-mono font-semibold border border-[#c5c5d7]/30">
                      News
                    </span>
                  )}
                </div>

                {/* Sparkle Summary */}
                <p className="text-[#571bc1] text-xs italic line-clamp-2 leading-relaxed bg-[#571bc1]/5 p-2 rounded border border-[#571bc1]/10 font-medium">
                  {email.aiSummary}
                </p>

                {/* Read/Clicked Metrics Badge footer */}
                <div className="flex items-center gap-3 mt-3">
                  <div className={`flex items-center gap-1 text-[10px] ${email.isRead ? 'text-[#006c49]' : 'text-[#454654]/40'}`}>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="font-mono">{email.isRead ? 'Opened' : 'Unread'}</span>
                  </div>
                  {email.isClicked && email.clickCount > 0 && (
                    <div className="flex items-center gap-1 text-[#2036bd] text-[10px]">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold">Clicked ({email.clickCount})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredEmails.length === 0 && (
            <div className="text-center py-12 text-[#454654]/50">No matching conversations.</div>
          )}
        </div>
      </div>

      {/* COLUMN 2: Split Email View Panel & Intelligence detail view */}
      <div className={`flex-1 h-full flex flex-col lg:flex-row overflow-hidden ${showMobileDetail ? 'flex' : 'hidden lg:flex'
        }`}>
        {!activeEmail ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f9ff] text-center p-8">
            <Sparkles className="w-12 h-12 text-[#571bc1]/30 mb-4 animate-pulse" />
            <h3 className="text-sm font-bold text-[#0b1c30] mb-1">No Email Selected</h3>
            <p className="text-xs text-[#454654] max-w-sm">
              Connect your Google account or choose a conversation from your inbox to view thread details and get AI-powered insights.
            </p>
          </div>
        ) : (
          <>
            {/* SUBPANEL 1: Email Content Body View (Flex-[3]) */}
            <section className="flex-[3] w-full flex flex-col bg-white lg:border-r border-[#c5c5d7] overflow-y-auto relative min-h-[40%] lg:min-h-0">

              {/* Thread Header */}
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-[#c5c5d7] bg-white sticky top-0 z-10">
                {/* Back to Inbox for mobile */}
                <button
                  onClick={() => setShowMobileDetail(false)}
                  className="lg:hidden mb-4 flex items-center gap-2 text-xs font-semibold text-[#2036bd] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Inbox</span>
                </button>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#2036bd] fill-[#2036bd]" />
                    <span className="bg-[#6cf8bb]/10 text-[#00714d] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#6cf8bb]/20">
                      LEAD SCORE: {activeEmail.score}
                    </span>
                  </div>
                  <p className="text-xs text-[#454654]/70 font-mono">{activeEmail.date} • {activeEmail.time}</p>
                </div>

                <h2 className="text-xl font-bold text-[#0b1c30] mb-4 tracking-tight leading-tight">
                  {activeEmail.subject}
                </h2>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2036bd] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {activeEmail.sender.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0b1c30]">
                      {activeEmail.sender}{' '}
                      <span className="text-[#454654] font-normal text-xs">&lt;{activeEmail.senderEmail}&gt;</span>
                    </p>
                    <p className="text-xs text-[#454654]">to Me</p>
                  </div>
                </div>
              </div>

              {/* Email Body / Content Container */}
              <div className="px-8 py-6 space-y-8 flex-1">

                {/* Email Body Text */}

                {activeEmail.bodyHtml ? (
                  <iframe
                    title="Email Preview"
                    srcDoc={DOMPurify.sanitize(activeEmail.bodyHtml)}
                    className="w-full min-h-[800px] rounded-lg border"
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-sm">
                    {activeEmail.body}
                  </div>
                )}

                {/* Email Attachments */}
                {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-[#c5c5d7]/40">
                    <p className="text-[10px] text-[#454654]/60 uppercase font-mono tracking-wider font-semibold mb-3">
                      Attachments ({activeEmail.attachments.length})
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {activeEmail.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          onClick={() => alert(`Downloading attachment ${file.name}`)}
                          className="flex items-center gap-3 p-3 rounded-lg border border-[#c5c5d7] bg-[#eff4ff]/30 w-64 hover:border-[#2036bd]/40 cursor-pointer transition-all group"
                          id={`inbox-attachment-${idx}`}
                        >
                          <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${file.type === 'pdf'
                            ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                            : 'bg-[#006c49]/10 text-[#006c49]'
                            }`}>
                            {file.type === 'pdf' ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#0b1c30] truncate group-hover:text-[#2036bd] transition-colors">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-[#454654] font-mono mt-0.5">{file.size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* History of Previous Thread */}
                {activeEmail.threadHistory && activeEmail.threadHistory.length > 0 && (
                  <div className="space-y-6 mt-12 pt-8 border-t border-[#c5c5d7]/40">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#c5c5d7]/40"></div>
                      </div>
                      <span className="relative bg-white px-4 text-[#454654]/60 font-mono text-xs">
                        Thread History
                      </span>
                    </div>

                    {activeEmail.threadHistory.map((history) => (
                      <div
                        key={history.id}
                        className={`p-5 rounded-xl border ${history.isMe
                          ? 'bg-[#eff4ff] border-[#c5c5d7]/40 text-[#0b1c30]'
                          : 'bg-white border-[#c5c5d7]'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${history.isMe ? 'bg-[#2036bd] text-white' : 'bg-[#e4d6ff] text-[#5516be]'
                            }`}>
                            {history.sender.split(' ').map(n => n[0]).join('')}
                          </div>
                          <p className="text-xs font-bold text-[#0b1c30]">{history.sender}</p>
                          <p className="text-[10px] text-[#454654]/70 font-mono ml-auto">{history.date}</p>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-line">{history.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Editor Area */}
                {showReplyArea && (
                  <div
                    className="mt-12 pt-8 border-t border-[#c5c5d7]/40 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    id="inbox-reply-area"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2036bd] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 fill-[#2036bd]/10 text-[#2036bd]" />
                        AI-Assisted Composer Draft
                      </span>
                      <button
                        onClick={() => {
                          setReplyText('');
                          setShowReplyArea(false);
                        }}
                        className="text-xs text-[#454654] hover:text-[#ba1a1a]"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Quick Sample Draft Prompts */}
                    <div className="p-3 bg-[#571bc1]/5 border border-[#571bc1]/10 rounded-xl space-y-2">
                      <p className="text-[10px] text-[#571bc1] font-bold uppercase tracking-wider font-mono">Select a sample prompt scenario to draft:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          {
                            label: "📅 Coordinate Meeting",
                            prompt: "Agree enthusiastically and suggest a 15-minute quick alignment sync next Tuesday around 2:00 PM EST.",
                          },
                          {
                            label: "🔒 Send Security Pack",
                            prompt: "Explain that we are SOC2 compliant and attach our latest security packet and questionnaires to accelerate the procurement team review.",
                          },
                          {
                            label: "💰 Retroactive Discount",
                            prompt: "Confirm that the volume discount is applied retroactively to all active nodes as soon as their instance scale crosses 5,000.",
                          }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={isDrafting}
                            onClick={() => handleGenerateAIDraft(item.prompt)}
                            className="p-2 text-left bg-white hover:bg-[#eff4ff] border border-[#c5c5d7]/40 rounded-lg text-[10px] text-[#0b1c30] transition-all hover:border-[#571bc1]/30 cursor-pointer flex flex-col justify-between shadow-3xs disabled:opacity-50"
                          >
                            <span className="font-bold text-[#2036bd] mb-0.5">{item.label}</span>
                            <span className="text-[#454654] line-clamp-1 text-[9px]">{item.prompt}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border border-[#c5c5d7] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#2036bd]/20 focus-within:border-[#2036bd] transition-all bg-white shadow-2xs">
                      <textarea
                        rows={8}
                        className="w-full border-none p-4 text-xs focus:ring-0 outline-none text-[#0b1c30] resize-none"
                        placeholder="Draft your reply or let Aether AI populate ideas..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={isDrafting}
                      />
                      <div className="bg-[#f8f9ff] px-4 py-2 border-t border-[#c5c5d7]/30 flex justify-between items-center text-[10px] text-[#454654]">
                        <span>Focus Hours Active • Warm Tone Selected</span>
                        {isDrafting && <span className="text-[#571bc1] font-semibold animate-pulse">Generating draft...</span>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSendReply}
                        disabled={isDrafting || !replyText.trim()}
                        className="flex-1 bg-[#2036bd] text-white py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                      <button
                        onClick={() => handleGenerateAIDraft()}
                        disabled={isDrafting}
                        className="bg-[#571bc1]/10 text-[#571bc1] hover:bg-[#571bc1]/25 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-[#571bc1]/10" />
                        <span>Regenerate Draft</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Inline Action Footer */}
              {!showReplyArea && (
                <div className="p-6 bg-white border-t border-[#c5c5d7]/40 sticky bottom-0 z-10 flex gap-4">
                  <button
                    onClick={() => {
                      setShowReplyArea(true);
                      setReplyText(`Hi ${activeEmail.sender},\n\n`);
                      setTimeout(() => {
                        document.getElementById('inbox-reply-area')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="flex-1 bg-[#eff4ff] text-[#454654] py-3 rounded-lg border border-[#c5c5d7] hover:bg-[#e5eeff] transition-all font-semibold text-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={() => {
                      alert('Email archived successfully.');
                    }}
                    className="flex-1 bg-[#eff4ff] text-[#454654] py-3 rounded-lg border border-[#c5c5d7] hover:bg-[#e5eeff] transition-all font-semibold text-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                </div>
              )}

            </section>

            {/* SUBPANEL 2: AI Intelligence Analysis Panel (Flex-[2]) */}
            <section className="flex-[2] w-full bg-[#f8f9ff] flex flex-col border-t lg:border-t-0 lg:border-l border-[#c5c5d7] overflow-y-auto min-h-[40%] lg:min-h-0">

              {/* AI Summary Section */}
              <div className="p-6 border-b border-[#c5c5d7] bg-white shadow-3xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#571bc1] fill-[#571bc1]/10 animate-pulse-glow" />
                    <h3 className="font-semibold text-sm text-[#0b1c30]">AI Summary</h3>
                  </div>
                  {activeInboxType === 'gmail' && (
                    <button
                      onClick={handleAnalyzeEmail}
                      disabled={isAnalyzing}
                      className="text-[10px] font-bold text-[#571bc1] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 fill-[#571bc1]/10" />
                      <span>{isAnalyzing ? "Analyzing..." : "Analyze with Gemini"}</span>
                    </button>
                  )}
                </div>
                <div className="p-4 bg-[#571bc1]/5 border border-[#571bc1]/20 rounded-xl hover:shadow-xs transition-all">
                  {isAnalyzing ? (
                    <div className="space-y-2">
                      <div className="h-3 bg-[#571bc1]/10 rounded-sm animate-pulse w-full"></div>
                      <div className="h-3 bg-[#571bc1]/10 rounded-sm animate-pulse w-5/6"></div>
                      <div className="h-3 bg-[#571bc1]/10 rounded-sm animate-pulse w-2/3"></div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#571bc1] leading-relaxed italic font-medium whitespace-pre-line">
                      {activeEmail.aiSummary ? activeEmail.aiSummary.replace('AI SUMMARY: ', '') : "(Select 'Analyze with Gemini' to generate a full dynamic briefing with real-time response suggestions)"}
                    </p>
                  )}
                </div>
              </div>

              {/* Lead Score Analyses Gauges */}
              <div className="p-6 border-b border-[#c5c5d7]">
                <h3 className="text-[10px] text-[#454654] uppercase tracking-widest font-mono font-semibold mb-4">
                  Lead Score Analysis
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {/* Engagement Gauge */}
                  <div className="text-center">
                    <div className="h-1.5 bg-[#dfe0ff] rounded-full mb-2 overflow-hidden">
                      <div
                        className="h-full bg-[#006c49] rounded-full transition-all duration-1000"
                        style={{ width: `${activeEmail.engagement}%` }}
                      />
                    </div>
                    <p className="font-mono text-xs font-black text-[#0b1c30]">{activeEmail.engagement}%</p>
                    <p className="text-[9px] text-[#454654] font-mono font-bold mt-0.5">ENGAGEMENT</p>
                  </div>

                  {/* Intent Gauge */}
                  <div className="text-center">
                    <div className="h-1.5 bg-[#dfe0ff] rounded-full mb-2 overflow-hidden">
                      <div
                        className="h-full bg-[#2036bd] rounded-full transition-all duration-1000"
                        style={{ width: `${activeEmail.intent}%` }}
                      />
                    </div>
                    <p className="font-mono text-xs font-black text-[#0b1c30]">{activeEmail.intent}%</p>
                    <p className="text-[9px] text-[#454654] font-mono font-bold mt-0.5">INTENT</p>
                  </div>

                  {/* Sentiment Gauge */}
                  <div className="text-center">
                    <div className="h-1.5 bg-[#dfe0ff] rounded-full mb-2 overflow-hidden">
                      <div
                        className="h-full bg-[#571bc1] rounded-full transition-all duration-1000"
                        style={{ width: `${activeEmail.sentiment}%` }}
                      />
                    </div>
                    <p className="font-mono text-xs font-black text-[#0b1c30]">{activeEmail.sentiment}%</p>
                    <p className="text-[9px] text-[#454654] font-mono font-bold mt-0.5">SENTIMENT</p>
                  </div>
                </div>
              </div>

              {/* Tracking Clicks Timeline */}
              <div className="p-6 border-b border-[#c5c5d7]">
                <h3 className="text-[10px] text-[#454654] uppercase tracking-widest font-mono font-semibold mb-4">
                  Tracking History
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start justify-between text-xs gap-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-[#454654] mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[#0b1c30] font-semibold">Email opened (3rd time)</span>
                        <p className="text-[10px] text-[#454654] font-mono">From Chrome Browser • Mac OS</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#454654]/70 font-mono shrink-0">12m ago</span>
                  </div>

                  {activeEmail.isClicked && (
                    <div className="flex items-start justify-between text-xs gap-3">
                      <div className="flex items-start gap-3">
                        <MousePointerClick className="w-4 h-4 text-[#006c49] mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[#0b1c30] font-semibold">Clicked CTA Attachment Link</span>
                          <p className="text-[10px] text-[#2036bd] font-mono underline hover:cursor-pointer">pricing_v4.pdf</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#454654]/70 font-mono shrink-0">1h ago</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Salesforce Contact details Card */}
              <div className="p-6 border-b border-[#c5c5d7]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] text-[#454654] uppercase tracking-widest font-mono font-semibold">
                    Salesforce Contact
                  </h3>
                  <button
                    onClick={() => alert('Launching Salesforce Integration client...')}
                    className="text-[#2036bd] hover:text-[#0b1c30] cursor-pointer"
                    title="View in Salesforce"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 bg-white border border-[#c5c5d7] rounded-xl flex items-center gap-4 hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-lg bg-[#eff4ff] border border-[#c5c5d7]/20 flex items-center justify-center overflow-hidden shrink-0 shadow-3xs">
                    {activeEmail.senderAvatar ? (
                      <img src={activeEmail.senderAvatar} className="w-full h-full object-cover" alt="Avatar" referrerPolicy="no-referrer" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-[#2036bd]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-[#0b1c30] truncate">{activeEmail.sender}</p>
                    <p className="text-[10px] text-[#454654] font-mono mt-0.5">CTO @ Vortex Tech</p>
                    <p className="text-[11px] text-[#2036bd] font-semibold flex items-center gap-1 mt-1 font-mono">
                      $240k Opportunity • Q3 Close
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick templates Suggested Responses */}
              {activeInboxType === 'gmail' && (!activeEmail.suggestedResponses || activeEmail.suggestedResponses.length === 0) ? (
                <div className="p-6 border-b border-[#c5c5d7] bg-[#571bc1]/5 text-center">
                  <Sparkles className="w-5 h-5 text-[#571bc1]/40 mx-auto mb-2" />
                  <p className="text-[10px] text-[#571bc1] uppercase tracking-widest font-mono font-bold mb-1">
                    No Suggested Responses Yet
                  </p>
                  <p className="text-[10px] text-[#454654]/70 max-w-xs mx-auto">
                    Trigger Gemini Analysis above to instantly compose contextual replies.
                  </p>
                </div>
              ) : (
                activeEmail.suggestedResponses && activeEmail.suggestedResponses.length > 0 && (
                  <div className="p-6 border-b border-[#c5c5d7] bg-[#571bc1]/5">
                    <h3 className="text-[10px] text-[#571bc1] uppercase tracking-widest font-mono font-semibold mb-4 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-[#571bc1]/10 text-[#571bc1]" />
                      AI Suggested Responses
                    </h3>

                    <div className="space-y-3">
                      {activeEmail.suggestedResponses.map((template, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectTemplate(template)}
                          className="w-full text-left p-3 rounded-lg border border-[#571bc1]/20 bg-white hover:border-[#571bc1] transition-all cursor-pointer shadow-3xs hover:shadow-2xs group"
                          id={`inbox-suggested-reply-${idx}`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#571bc1]" />
                            <span className="font-mono text-[10px] font-black text-[#571bc1] uppercase tracking-wider">
                              {template.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#0b1c30] line-clamp-2 leading-relaxed font-normal">
                            {template.previewText}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Follow-up Reminder calendar picker */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#454654]" />
                    <span className="text-xs font-bold text-[#0b1c30]">Follow-up Reminder</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderChecked}
                      onChange={(e) => setReminderChecked(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#c5c5d7]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#c5c5d7] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2036bd]"></div>
                  </label>
                </div>

                <div className={`flex gap-2 transition-all duration-300 ${reminderChecked ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex-1 relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#454654] h-4" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-[#c5c5d7] rounded-lg text-xs bg-white focus:ring-0 outline-none font-mono"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      id="reminder-date-input"
                    />
                  </div>
                  <div className="relative w-24">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-[#c5c5d7] rounded-lg text-xs bg-white focus:ring-0 outline-none font-mono text-center"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      id="reminder-time-input"
                    />
                  </div>
                </div>
              </div>

            </section>
          </>
        )}
      </div>

      {/* Floating AI Assistant Draft FAB */}
      <button
        onClick={() =>
          handleGenerateAIDraft(
            "Generate a polite follow-up email with a call to action."
          )
        }
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[#571bc1] to-[#2036bd] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer group z-40 animate-pulse-glow"
        title="Generate AI Reply Draft"
        id="inbox-ai-draft-fab"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

    </div>
  );
}
