import React from 'react';
import { NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface NotificationsViewProps {
  onSelectInspection?: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onSelectInspection }) => {
  const { isInspector } = useAuth();

  const notifications: NotificationItem[] = isInspector
    ? [
        {
          id: 'n1',
          title: 'Section 36 Notice Generated',
          description: 'Compounding notice auto-drafted for Detergent Pack (1.1mm font violation)',
          timeAgo: '10 mins ago',
          type: 'error',
          isUnread: true,
          actionRequired: true,
        },
        {
          id: 'n2',
          title: 'Ledger Node Synchronization Complete',
          description: '14 statutory inspection dossiers anchored to Zone 4 SHA-256 Metrology Ledger',
          timeAgo: '1 hour ago',
          type: 'sync',
          isUnread: true,
        },
        {
          id: 'n3',
          title: 'Regional Directorate Circular 2026/08',
          description: 'Special audit drive initiated for shrinkflation monitoring in edible oils',
          timeAgo: 'Yesterday',
          type: 'analytics',
          isUnread: false,
        },
      ]
    : [
        {
          id: 'n1',
          title: 'Shrinkflation Alert: Lay\'s Magic Masala',
          description: 'Pack size reduced from 52g to 48g while maintaining ₹20 price point',
          timeAgo: '20 mins ago',
          type: 'analytics',
          isUnread: true,
          actionRequired: false,
        },
        {
          id: 'n2',
          title: 'Scan Verified: Tata Tea Gold 250g',
          description: 'All 8 statutory declarations compliant with Legal Metrology Rules 2011',
          timeAgo: '2 hours ago',
          type: 'check',
          isUnread: false,
        },
        {
          id: 'n3',
          title: 'National Consumer Helpline (NCH 1915)',
          description: 'Your previous commodity inquiry ticket #NCH-88902 has been resolved',
          timeAgo: 'Yesterday',
          type: 'check',
          isUnread: false,
        },
      ];

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#191c1a] tracking-tight">
          Notifications &amp; Alerts
        </h1>
        <p className="text-xs sm:text-sm text-[#707973] mt-1">
          Stay updated with statutory enforcement notices, verification logs, and consumer advisories.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
              n.isUnread ? 'bg-white border-[#0f5238]/30 shadow-xs ring-1 ring-[#0f5238]/10' : 'bg-[#f8faf6] border-[#e2e8e0]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              n.type === 'error'
                ? 'bg-red-100 text-red-700'
                : n.type === 'analytics'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              <span className="material-symbols-outlined text-[20px]">
                {n.type === 'error' ? 'warning' : n.type === 'analytics' ? 'analytics' : 'verified'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#191c1a] truncate">{n.title}</h3>
                <span className="text-[10px] text-[#707973] shrink-0 font-mono">{n.timeAgo}</span>
              </div>
              <p className="text-xs text-[#404943] mt-0.5">{n.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
