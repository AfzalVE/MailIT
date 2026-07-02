import React, { useState } from 'react';
import { Screen, AuthUser } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ScheduleView from './components/ScheduleView';
import PipelineView from './components/PipelineView';
import InboxView from './components/InboxView';
import ContactsView from './components/ContactsView';
import SettingsView from './components/SettingsView';
import ComposeModal from './components/ComposeModal';
import LoginRegister from './components/LoginRegister';
import ProfileView from './components/ProfileView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('aether_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeScreen, setActiveScreen] = useState<Screen>('schedule');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('aether_logged_in_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aether_logged_in_user');
  };

  // Handle Quick Sync from Header
  const handleQuickSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setInboxUnreadCount(prev => prev + 1);
      alert('Aether Intel engine successfully synchronized! 24 leads updated, 1 new high-score suggestion received.');
    }, 1500);
  };

  // Follow-up actions from Schedule view
  const handleSendNudge = (recipientName: string, nudgeText: string) => {
    alert(
      `AI NUDGE ACTION TRIGGERED:\n\nDrafting an automated follow-up email to ${recipientName} regarding:\n"${nudgeText}"\n\nOpening draft reply box to review before sending.`
    );
    setActiveScreen('inbox');
  };

  const handleScheduleCall = (recipientName: string) => {
    alert(
      `AI CALL BOOKING TRIGGERED:\n\nAnalyzing availability calendars for ${recipientName} and yourself...\n\nBlocking out optimized 15-minute slot in Outlook and Google Calendars.`
    );
  };

  // Nudge actions from Pipeline leaderboard
  const handleLeadAction = (leadName: string, actionText: string) => {
    alert(
      `Salesforce Automation action triggered for ${leadName}:\n\n"${actionText}"\n\nDrafting email sequence with high-engagement warm-tone configurations.`
    );
    setIsComposeOpen(true);
  };

  // New compose email dispatch
  const handleSendComposeEmail = (recipient: string, subject: string, body: string) => {
    alert(
      `Email sent successfully!\n\nTo: ${recipient}\nSubject: ${subject}\n\nActivity logged in Salesforce CRM.`
    );
  };

  // Determine search bar placeholder based on active view
  const getSearchPlaceholder = () => {
    switch (activeScreen) {
      case 'inbox':
        return 'Search inbox, tags, or AI summaries...';
      case 'pipeline':
        return 'Search leads, companies, or score levels...';
      case 'schedule':
        return 'Search events, slot recommendations...';
      case 'contacts':
        return 'Search CRM contacts list...';
      default:
        return 'Search email, scheduling, or crm insights...';
    }
  };

  if (!currentUser) {
    return (
      <LoginRegister 
        onLoginSuccess={handleLoginSuccess} 
        userEmailFromMetadata="skmafzal2004@gmail.com" 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex text-[#0b1c30]">
      {/* Sidebar Backdrop Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-in fade-in duration-250"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Left column) */}
      <Sidebar
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        onComposeClick={() => setIsComposeOpen(true)}
        inboxCount={inboxUnreadCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Workspace (pl-[280px] offsets Sidebar width, made responsive) */}
      <div className="flex-1 lg:pl-[280px] pl-0 min-h-screen flex flex-col overflow-x-hidden">
        {/* Header Appbar */}
        <Header
          searchPlaceholder={getSearchPlaceholder()}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickSync={handleQuickSync}
          isSyncing={isSyncing}
          currentUser={currentUser}
          onProfileClick={() => setActiveScreen('profile')}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Dynamic Inner View Frame with slide transitions */}
        <main className="flex-1 bg-[#f8f9ff] relative overflow-y-auto">
          {activeScreen === 'schedule' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ScheduleView 
                onSendNudge={handleSendNudge} 
                onScheduleCall={handleScheduleCall} 
              />
            </div>
          )}
          
          {activeScreen === 'pipeline' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <PipelineView 
                onLeadAction={handleLeadAction} 
              />
            </div>
          )}
          
          {activeScreen === 'inbox' && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
              <InboxView 
                onDraftSend={handleSendComposeEmail} 
              />
            </div>
          )}

          {activeScreen === 'contacts' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ContactsView />
            </div>
          )}

          {activeScreen === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SettingsView />
            </div>
          )}

          {activeScreen === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ProfileView 
                currentUser={currentUser} 
                onUpdateProfile={handleLoginSuccess}
                onBackToDashboard={() => setActiveScreen('schedule')}
              />
            </div>
          )}
        </main>
      </div>

      {/* Compose Email Drawer Modal Overlay */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendComposeEmail}
      />
    </div>
  );
}
