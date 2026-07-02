import React, { useState } from 'react';
import { Search, Bell, Bolt, RefreshCw, Check, Menu } from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  searchPlaceholder: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  onQuickSync?: () => void;
  isSyncing?: boolean;
  syncTimeText?: string;
  currentUser?: AuthUser | null;
  onProfileClick?: () => void;
  onMenuClick?: () => void;
}

export default function Header({
  searchPlaceholder,
  onSearchChange,
  searchValue = '',
  onQuickSync,
  isSyncing = false,
  syncTimeText = 'CRM Synced 2m ago',
  currentUser,
  onProfileClick,
  onMenuClick
}: HeaderProps) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  return (
    <header className="h-16 w-full sticky top-0 z-40 bg-white border-b border-[#c5c5d7] flex justify-between items-center px-4 sm:px-6">
      {/* Search & Brand */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 mr-2 sm:mr-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg text-[#454654] hover:bg-[#eff4ff] lg:hidden cursor-pointer shrink-0"
            title="Open sidebar"
            id="header-menu-mobile-btn"
          >
            <Menu className="w-5 h-5 sm:w-6 h-6" />
          </button>
        )}
        <div className="relative w-full max-w-xs sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#454654] w-4 h-4" />
          <input
            type="text"
            className="w-full bg-[#eff4ff] border-none rounded-full pl-9 pr-12 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#2036bd]/20 transition-all outline-none text-[#0b1c30]"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            id="header-search-input"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex gap-0.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#c5c5d7] text-[10px] font-mono text-[#454654]">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#c5c5d7] text-[10px] font-mono text-[#454654]">K</kbd>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Sync Button */}
        <button
          onClick={onQuickSync}
          className={`px-3 py-1.5 sm:px-4 rounded-full font-medium text-xs flex items-center gap-2 transition-all cursor-pointer ${
            isSyncing
              ? 'bg-[#dfe0ff] text-[#2036bd] animate-pulse'
              : 'bg-[#2036bd] text-white hover:opacity-90'
          }`}
          id="header-quick-sync-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Quick Sync'}</span>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-1 border-l border-[#c5c5d7] pl-4">
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 text-[#454654] hover:text-[#2036bd] transition-colors relative cursor-pointer"
              id="header-notifications-btn"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white"></span>
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-[#c5c5d7] shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#eff4ff]">
                  <h4 className="font-semibold text-sm text-[#0b1c30]">Notifications</h4>
                  <span className="text-[10px] bg-[#dfe0ff] text-[#2036bd] px-1.5 py-0.5 rounded font-mono">3 New</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#571bc1] mt-1.5 shrink-0"></span>
                    <div>
                      <p className="font-medium text-[#0b1c30]">Sarah Jenkins opened proposal email</p>
                      <p className="text-[10px] text-[#454654]">12 minutes ago from San Francisco</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#006c49] mt-1.5 shrink-0"></span>
                    <div>
                      <p className="font-medium text-[#0b1c30]">CRM Sync Complete</p>
                      <p className="text-[10px] text-[#454654]">2 minutes ago • updated 24 leads</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a] mt-1.5 shrink-0"></span>
                    <div>
                      <p className="font-medium text-[#0b1c30]">Follow-up Alert: Elena Henderson</p>
                      <p className="text-[10px] text-[#454654]">Pending contract response due Friday</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="p-2 text-[#454654] hover:text-[#2036bd] transition-colors cursor-pointer" id="header-bolt-btn">
            <Bolt className="w-5 h-5" />
          </button>
        </div>

        {/* User profile photo */}
        <button
          onClick={onProfileClick}
          className="w-8 h-8 rounded-full overflow-hidden border border-[#c5c5d7] hover:ring-2 hover:ring-[#2036bd]/30 transition-all cursor-pointer shrink-0"
          title="View profile settings"
          id="header-profile-btn"
        >
          <img
            className="w-full h-full object-cover"
            src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"}
            alt={currentUser?.name || "User profile"}
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </header>
  );
}
