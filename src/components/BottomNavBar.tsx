import React from 'react';
import { ActiveTab } from '../types';
import { triggerTabHaptic } from '../services/haptics';
import { useAuth } from '../context/AuthContext';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
}) => {
  const { isInspector } = useAuth();

  const navItems = isInspector
    ? [
        { id: 'home' as ActiveTab, label: 'Desk', icon: 'shield' },
        { id: 'scan' as ActiveTab, label: 'Audit', icon: 'document_scanner' },
        { id: 'history' as ActiveTab, label: 'Dossiers', icon: 'inventory_2' },
        { id: 'compare' as ActiveTab, label: 'Compare', icon: 'compare_arrows' },
        { id: 'settings' as ActiveTab, label: 'Terminal', icon: 'settings' },
      ]
    : [
        { id: 'home' as ActiveTab, label: 'Home', icon: 'home' },
        { id: 'scan' as ActiveTab, label: 'Scan', icon: 'qr_code_scanner' },
        { id: 'history' as ActiveTab, label: 'My Scans', icon: 'history' },
        { id: 'compare' as ActiveTab, label: 'Compare', icon: 'compare_arrows' },
        { id: 'settings' as ActiveTab, label: 'Profile', icon: 'person' },
      ];

  const handleTabClick = (tabId: ActiveTab) => {
    if (tabId !== activeTab) {
      triggerTabHaptic();
    }
    setActiveTab(tabId);
  };

  const activeBg = isInspector ? 'bg-[#0f5238]' : 'bg-[#1d4ed8]';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-1.5 bg-[#f8faf6]/95 backdrop-blur-lg border-t border-[#bfc9c1]/50 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] pb-safe">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? `${activeBg} text-white shadow-xs scale-100`
                : 'text-[#404943] hover:text-[#191c1a] active:scale-95'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] transition-transform ${
                isActive ? 'text-white' : 'text-[#404943]'
              }`}
              data-fill={isActive ? '1' : '0'}
            >
              {item.icon}
            </span>
            <span
              className={`text-[9.5px] tracking-tight mt-0.5 ${
                isActive ? 'text-white font-bold' : 'text-[#404943] font-medium'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
