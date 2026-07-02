import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Filter, MessageSquare, Phone, Mail, MoreHorizontal, UserCheck, Sparkles, Loader2 } from 'lucide-react';
import { INITIAL_LEADS } from '../mockData';

export default function ContactsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<any[]>(INITIAL_LEADS);
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false);
  const [gmailUserEmail, setGmailUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    checkAuthAndLoadContacts();
  }, []);

  const checkAuthAndLoadContacts = async () => {
    try {
      const res = await fetch("/api/gmail/auth-status");
      const data = await res.json();
      if (res.ok && data.connected) {
        setIsGmailConnected(true);
        setGmailUserEmail(data.email);
        fetchGoogleContacts();
      }
    } catch (err) {
      console.error("Failed to check Google auth status:", err);
    }
  };

  const fetchGoogleContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gmail/contacts");
      const data = await res.json();
      if (res.ok && data.contacts && data.contacts.length > 0) {
        setContacts(data.contacts);
      }
    } catch (err) {
      console.error("Failed to fetch Google contacts:", err);
    } finally {
      setIsLoading(false);
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
              fetchGoogleContacts();
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

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[#1440px] mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight flex items-center gap-2">
            <span>CRM Contacts</span>
            {isLoading && <Loader2 className="w-5 h-5 text-[#2036bd] animate-spin" />}
          </h2>
          <p className="text-[#454654] text-xs sm:text-sm">Manage enterprise customer accounts, profiles, and score ratings.</p>
        </div>
        <button 
          onClick={() => alert('New contact modal opened.')} 
          className="bg-[#2036bd] text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 hover:opacity-90 cursor-pointer shadow-sm active:scale-95 transition-all w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Google Contacts Authorization Banner */}
      {!isGmailConnected ? (
        <div className="bg-[#571bc1]/5 border border-[#571bc1]/20 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-[#571bc1] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-[#0b1c30]">Load Original Google Data</h4>
              <p className="text-[11px] text-[#454654] mt-0.5">Connect your Google account to replace simulated leads with your actual live connections and Gmail contacts.</p>
            </div>
          </div>
          <button
            onClick={handleConnectGoogle}
            className="bg-[#571bc1] text-white px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 cursor-pointer shadow-xs active:scale-95 transition-all shrink-0 animate-pulse-glow"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white/10" />
            <span>Connect Google Contacts</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#006c49]/5 border border-[#006c49]/15 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#006c49] rounded-full animate-pulse"></div>
            <p className="text-xs text-[#006c49] font-medium">
              Successfully linked with Google Contacts ({gmailUserEmail}). {isLoading ? "Updating list..." : "All connections loaded and optimized."}
            </p>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 text-[#006c49] animate-spin" />}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#c5c5d7] shadow-xs overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-[#c5c5d7] flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#454654] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="w-full bg-[#eff4ff] border-none rounded-lg pl-10 pr-4 py-2 text-xs text-[#0b1c30] focus:ring-2 focus:ring-[#2036bd]/15 outline-none"
              placeholder="Search contacts by name, company, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-3 py-2 border border-[#c5c5d7] rounded-lg hover:bg-[#eff4ff] text-[#454654] text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Contacts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-0">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#c5c5d7] text-xs font-mono text-[#454654] font-semibold">
                <th className="p-4 pl-6">Contact Info</th>
                <th className="p-4">Enterprise Account</th>
                <th className="p-4">AI Score</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-right pr-6">Quick Connect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5c5d7]/30 text-xs">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-[#f8f9ff]/40 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#dfe0ff] text-[#2036bd] font-bold flex items-center justify-center">
                        {contact.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#0b1c30]">{contact.name}</p>
                        <p className="text-xs text-[#454654]">{contact.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-[#0b1c30]">{contact.company}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-[#6cf8bb]/15 text-[#006c49] rounded-full font-mono font-bold">
                      {contact.score} / 100
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[#454654]">{contact.lastInteraction}</span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => alert(`Email interface opened for ${contact.name}`)}
                        className="p-1.5 rounded-lg border border-[#c5c5d7]/60 text-[#454654] hover:border-[#2036bd] hover:text-[#2036bd] cursor-pointer"
                        title="Send Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => alert(`Starting voice dial to ${contact.name}`)}
                        className="p-1.5 rounded-lg border border-[#c5c5d7]/60 text-[#454654] hover:border-[#2036bd] hover:text-[#2036bd] cursor-pointer"
                        title="Call Contact"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg border border-[#c5c5d7]/60 text-[#454654] hover:bg-[#eff4ff] cursor-pointer">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#454654]/60">No contacts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
