import React from 'react';
import { Screen, AuthUser } from '../types';
import { 
  Sparkles, 
  Inbox, 
  BrainCircuit, 
  BarChart2, 
  Calendar, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut,
  User,
  X
} from 'lucide-react';

interface SidebarProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  onComposeClick: () => void;
  inboxCount: number;
  currentUser: AuthUser | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  activeScreen,
  onScreenChange,
  onComposeClick,
  inboxCount,
  currentUser,
  onLogout,
  isOpen = false,
  onClose
}: SidebarProps) {
  
  const navItems = [
    { id: 'inbox' as Screen, label: 'Inbox', icon: Inbox, badge: inboxCount },
    { id: 'drafts' as Screen, label: 'AI Drafts', icon: BrainCircuit },
    { id: 'pipeline' as Screen, label: 'Lead Pipeline', icon: BarChart2 },
    { id: 'schedule' as Screen, label: 'Schedule', icon: Calendar },
    { id: 'contacts' as Screen, label: 'CRM Contacts', icon: Users },
    { id: 'profile' as Screen, label: 'Profile', icon: User },
    { id: 'settings' as Screen, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`w-[280px] h-screen fixed left-0 top-0 bg-[#eff4ff] border-r border-[#c5c5d7] flex flex-col py-6 px-4 z-50 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Brand Header */}
      <div className="mb-8 px-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2036bd] rounded-lg flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-5 h-5 fill-white text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-semibold text-base text-[#2036bd] tracking-tight leading-tight">Email Intel</h1>
            <p className="text-[10px] text-[#571bc1] uppercase font-mono tracking-wider flex items-center gap-1 mt-0.5 font-semibold">
              <span className="w-1.5 h-1.5 bg-[#571bc1] rounded-full animate-pulse"></span>
              AI Assistant Active
            </p>
          </div>
        </div>

        {/* Close button for mobile */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-[#454654] hover:bg-[#e5eeff] lg:hidden cursor-pointer"
            title="Close sidebar"
            id="sidebar-close-mobile-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Compose Button */}
      <button
        onClick={() => {
          onComposeClick();
          onClose?.();
        }}
        className="mb-8 w-full py-3 px-4 bg-[#571bc1] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#703eda] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]"
        id="sidebar-compose-btn"
      >
        <Sparkles className="w-4 h-4 fill-white" />
        <span>Compose with AI</span>
      </button>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onScreenChange(item.id);
                onClose?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-[#d3e4fe] text-[#2036bd] border-r-4 border-[#2036bd] font-medium shadow-xs'
                  : 'text-[#454654] hover:bg-[#e5eeff] hover:text-[#0b1c30]'
              }`}
              id={`sidebar-nav-${item.id}`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#2036bd]' : 'text-[#454654]'}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-[#2036bd]/10 text-[#2036bd]' : 'bg-[#e5eeff] text-[#454654]'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Actions */}
      <div className="mt-auto pt-6 border-t border-[#c5c5d7]/50 space-y-1">
        {/* Help Link */}
        <button
          onClick={() => {
            onScreenChange('settings');
            onClose?.();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#454654] hover:bg-[#e5eeff] transition-colors cursor-pointer text-left"
          id="sidebar-nav-help"
        >
          <HelpCircle className="w-5 h-5 text-[#454654]" />
          <span>Help & Support</span>
        </button>

        {/* User Card */}
        {currentUser && (
          <div className="flex items-center gap-3 px-3 py-2 mt-2 bg-white/40 rounded-xl border border-[#c5c5d7]/30 animate-in fade-in duration-200">
            <div 
              onClick={() => {
                onScreenChange('profile');
                onClose?.();
              }}
              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer hover:opacity-85 transition-opacity"
              title="View Profile Settings"
            >
              <img
                className="w-8 h-8 rounded-full border border-[#c5c5d7] object-cover shrink-0"
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0b1c30] truncate">{currentUser.name}</p>
                <p className="text-[9px] font-mono text-[#454654] truncate">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-[#454654] hover:text-[#ba1a1a] transition-colors p-1 cursor-pointer shrink-0"
              title="Logout"
              id="sidebar-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
