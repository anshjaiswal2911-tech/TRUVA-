import React from 'react';
import { ActiveTab } from '../types';
import { triggerTabHaptic } from '../services/haptics';
import { useAuth } from '../context/AuthContext';

interface HeaderBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount?: number;
  isOffline?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  showBack = false,
  onBack,
  activeTab,
  setActiveTab,
  unreadCount = 2,
  isOffline = false,
}) => {
  const { profile, isInspector, isAuthenticated, signOut } = useAuth();

  const handleNavTab = (tab: ActiveTab) => {
    if (tab !== activeTab) {
      triggerTabHaptic();
    }
    setActiveTab(tab);
  };

  const primaryColorClass = isInspector ? 'text-[#0f5238]' : 'text-[#1d4ed8]';
  const primaryBgClass = isInspector ? 'bg-[#0f5238]' : 'bg-[#1d4ed8]';
  const primaryHoverBgClass = isInspector ? 'hover:bg-[#184835]' : 'hover:bg-[#1e40af]';
  const activeTabClass = isInspector
    ? 'text-[#0f5238] bg-[#0f5238]/10 font-bold'
    : 'text-[#1d4ed8] bg-[#1d4ed8]/10 font-bold';

  return (
    <header className="w-full top-0 sticky bg-white/95 backdrop-blur-md border-b border-[#e5e9e4] z-40 transition-colors shadow-2xs">
      <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 w-full max-w-[1440px] mx-auto h-16">
        {/* Left: Brand Anchor & Back Button */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => {
                triggerTabHaptic();
                onBack?.();
              }}
              aria-label="Go back"
              className={`${primaryColorClass} hover:bg-[#f2f5f1] transition-colors active:scale-95 p-1.5 rounded-lg flex items-center justify-center cursor-pointer border border-[#e5e9e4]`}
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}

          <div
            onClick={() => handleNavTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="Go to Home"
          >
            <div className={`w-8 h-8 rounded-xl ${primaryBgClass} flex items-center justify-center text-white shrink-0 shadow-xs transition-colors`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>

            <div className="flex items-center gap-2">
              <span className={`font-black text-xl tracking-tight ${primaryColorClass} leading-none`}>
                TRUVA
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isInspector
                  ? 'bg-[#f0fdf4] text-[#0f5238] border-[#bbf7d0]'
                  : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
              }`}>
                {isInspector ? 'Enforcement Desk' : 'Citizen Portal'}
              </span>
            </div>
          </div>

          {title && (
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#e5e9e4] ml-2">
              <span className="text-xs font-semibold text-[#525e56]">
                {title}
              </span>
            </div>
          )}
        </div>

        {/* Center: Reorganized, Well-Arranged Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#f8faf6] p-1 rounded-xl border border-[#e5e9e4]">
          <button
            onClick={() => handleNavTab('home')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'home'
                ? activeTabClass
                : 'text-[#525e56] hover:text-[#191c1a] hover:bg-black/[0.03] font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]" data-fill={activeTab === 'home' ? '1' : '0'}>
              dashboard
            </span>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavTab('scan')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'scan'
                ? activeTabClass
                : 'text-[#525e56] hover:text-[#191c1a] hover:bg-black/[0.03] font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]" data-fill={activeTab === 'scan' ? '1' : '0'}>
              document_scanner
            </span>
            <span>{isInspector ? 'Statutory Audit' : 'Scan Product'}</span>
          </button>

          <button
            onClick={() => handleNavTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? activeTabClass
                : 'text-[#525e56] hover:text-[#191c1a] hover:bg-black/[0.03] font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]" data-fill={activeTab === 'history' ? '1' : '0'}>
              inventory_2
            </span>
            <span>{isInspector ? 'Audit Dossiers' : 'My Scans'}</span>
          </button>

          <button
            onClick={() => handleNavTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compare'
                ? activeTabClass
                : 'text-[#525e56] hover:text-[#191c1a] hover:bg-black/[0.03] font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]" data-fill={activeTab === 'compare' ? '1' : '0'}>
              compare_arrows
            </span>
            <span>Compare</span>
          </button>

          {isInspector && (
            <button
              onClick={() => handleNavTab('states')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'states'
                  ? activeTabClass
                  : 'text-[#525e56] hover:text-[#191c1a] hover:bg-black/[0.03] font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]" data-fill={activeTab === 'states' ? '1' : '0'}>
                policy
              </span>
              <span>State Provisions</span>
            </button>
          )}

          <button
            onClick={() => handleNavTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? activeTabClass
                : 'text-[#525e56] hover:text-[#191c1a] hover:bg-black/[0.03] font-medium'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]" data-fill={activeTab === 'settings' ? '1' : '0'}>
              settings
            </span>
            <span>Settings</span>
          </button>
        </nav>

        {/* Right Actions: New Scan CTA, Notifications, Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Primary Action Button */}
          <button
            onClick={() => handleNavTab('scan')}
            className={`flex items-center gap-1.5 h-9 px-3.5 rounded-xl ${primaryBgClass} ${primaryHoverBgClass} text-white text-xs font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-95`}
          >
            <span className="material-symbols-outlined text-[17px]">add_a_photo</span>
            <span className="hidden sm:inline">{isInspector ? 'New Audit' : 'Scan Product'}</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => handleNavTab('notifications')}
            className="w-9 h-9 flex items-center justify-center text-[#525e56] hover:text-[#191c1a] hover:bg-[#f2f5f1] rounded-xl transition-colors relative cursor-pointer border border-[#e5e9e4]"
            title="Notifications"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#dc2626] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* User Profile & Sign Out Account Group */}
          {isAuthenticated && profile && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#e5e9e4]">
              <button
                onClick={() => handleNavTab('settings')}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#f2f5f1] transition-colors cursor-pointer text-left group"
                title={`${profile.fullName || profile.email} (${profile.role})`}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || profile.email}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${isInspector ? 'bg-[#0f5238]' : 'bg-[#1d4ed8]'}`}>
                    {profile.role === 'inspector' ? 'RS' : (profile.fullName?.[0] || profile.email[0] || 'C').toUpperCase()}
                  </div>
                )}
                <div className="hidden xl:flex flex-col">
                  <span className={`text-xs font-bold text-[#191c1a] ${isInspector ? 'group-hover:text-[#0f5238]' : 'group-hover:text-[#1d4ed8]'} transition-colors truncate max-w-[110px] leading-tight`}>
                    {profile.fullName || profile.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-[#707973] capitalize leading-none">
                    {profile.role}
                  </span>
                </div>
              </button>

              <button
                onClick={signOut}
                className="p-2 text-[#707973] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
