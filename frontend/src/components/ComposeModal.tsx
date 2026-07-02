import React, { useState } from 'react';
import { X, Sparkles, Send, RefreshCw } from 'lucide-react';

const SAMPLE_AI_PROMPTS = [
  {
    title: "🤝 APAC Partnership Sync",
    prompt: "Draft a collaborative follow-up to Sarah Jenkins at Synergy Global thanking her for the APAC expansion proposal. Share enthusiasm about launching in Singapore and Tokyo, and propose a 15-minute alignment sync next Tuesday afternoon.",
    recipient: "s.jenkins@synergyglobal.io",
    subject: "Re: Q4 Partnership Roadmap & APAC Expansion"
  },
  {
    title: "🔒 SOC2 Security Packet",
    prompt: "Respond to Rohan Kapoor at Flux Digital offering our full SOC2 Type II compliance binder and security questionnaire response pack to assist their procurement team review.",
    recipient: "rohan@fluxdigital.co",
    subject: "Aether SOC2 Compliance Certificate & Security Pack"
  },
  {
    title: "💰 Retroactive Discounting",
    prompt: "Clarify for Elena Henderson that the tier-1 volume discount does indeed apply retroactively to all active nodes once their instance count scale crosses 5,000.",
    recipient: "elena@vorasystems.com",
    subject: "Vora Systems - Volume Discount Pricing Agreement"
  },
  {
    title: "✨ Warm Lead Check-in",
    prompt: "Write a short, professional check-in to VP Growth Jonathan Sterling at Nexus Cloud regarding his trial experience with Aether Mail and offering a technical deep-dive slot this Thursday.",
    recipient: "j.sterling@nexuscloud.io",
    subject: "Aether Mail Evaluation - Technical Sync Invitation"
  }
];

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (recipient: string, subject: string, body: string) => void;
}

export default function ComposeModal({ isOpen, onClose, onSend }: ComposeModalProps) {
  if (!isOpen) return null;

  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setBody('Aether AI is crafting your message details...');

    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          contextText: recipient ? `To: ${recipient}\nSubject: ${subject}` : ''
        })
      });

      const data = await response.json();
      if (response.ok && data.draft) {
        setBody(data.draft);
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err) {
      console.error('Error generating AI email:', err);
      // Fallback
      setBody(
        `Hi,\n\nI hope this email finds you well. I wanted to follow up regarding our previous discussion and check if there are any specific questions or additional technical documentations you require from our end.\n\nLooking forward to hearing your thoughts.\n\nBest regards,\nAlex Rivera`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    if (!recipient.trim() || !body.trim()) {
      alert('Please fill in Recipient and email Body before sending.');
      return;
    }
    onSend(recipient, subject || '(No Subject)', body);
    setRecipient('');
    setSubject('');
    setAiPrompt('');
    setBody('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#c5c5d7] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#eff4ff] p-4 border-b border-[#c5c5d7] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#571bc1] fill-[#571bc1]/10" />
            <h3 className="font-bold text-sm text-[#0b1c30]">Aether Smart Email Composer</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-white text-[#454654] hover:text-[#0b1c30] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Recipient & Subject Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#454654] uppercase tracking-wider font-mono">To (Recipient Email)</label>
              <input
                type="email"
                className="w-full bg-[#eff4ff] border border-[#c5c5d7] p-2.5 rounded-lg text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#2036bd]/15 outline-none font-semibold"
                placeholder="client@company.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#454654] uppercase tracking-wider font-mono">Subject Header</label>
              <input
                type="text"
                className="w-full bg-[#eff4ff] border border-[#c5c5d7] p-2.5 rounded-lg text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#2036bd]/15 outline-none font-semibold"
                placeholder="E.g. Q4 Growth Collaboration"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          {/* AI Instructions Input */}
          <div className="p-4 bg-[#571bc1]/5 border border-[#571bc1]/15 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#571bc1]" />
                <span className="text-xs font-bold text-[#571bc1]">Prompt Assistant for Email Drafting</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#571bc1]/70">GEMINI POWERED</span>
            </div>
            
            {/* Quick Sample Prompts Cards */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-[#454654] font-bold uppercase tracking-wider font-mono">Or quick-fill with sample draft data:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_AI_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRecipient(sample.recipient);
                      setSubject(sample.subject);
                      setAiPrompt(sample.prompt);
                    }}
                    className="p-2.5 text-left bg-white hover:bg-[#eff4ff] border border-[#c5c5d7]/50 rounded-lg text-[10px] text-[#0b1c30] transition-all hover:border-[#571bc1]/40 shadow-3xs cursor-pointer flex flex-col justify-between"
                  >
                    <span className="font-bold text-[#571bc1] mb-1 flex items-center gap-1">
                      <span>{sample.title}</span>
                    </span>
                    <span className="text-[#454654] line-clamp-2 text-[9px] leading-relaxed">{sample.prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              className="w-full border border-[#c5c5d7]/50 p-3 rounded-lg text-xs bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#571bc1]/15 focus:border-[#571bc1] outline-none resize-none mt-2"
              placeholder="Tell Aether AI what to write, e.g. 'Draft a friendly follow-up email to Elena thanking her for our sync, offering to share the updated contract by Friday.'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full bg-[#571bc1] text-white py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#703eda] transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Aether is compiling draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-white/10" />
                  <span>Generate with Aether AI</span>
                </>
              )}
            </button>
          </div>

          {/* Rich Body Text Area */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[#454654] uppercase tracking-wider font-mono">Email Body Content</label>
            <textarea
              rows={8}
              className="w-full border border-[#c5c5d7] p-4 rounded-xl text-xs bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#2036bd]/15 outline-none resize-none"
              placeholder="Your email draft content will appear here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#f8f9ff] px-6 py-4 border-t border-[#c5c5d7] flex gap-3 justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#c5c5d7] rounded-lg text-xs font-semibold text-[#454654] hover:bg-[#eff4ff] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isGenerating || !recipient.trim() || !body.trim()}
            className="bg-[#2036bd] text-white px-5 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
