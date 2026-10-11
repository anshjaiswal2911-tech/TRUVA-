import React, { useState } from 'react';
import { getCacheStats, clearScanCache, resetCacheToDefaults } from '../services/scanCache';
import {
  isVibrationSupported,
  isHapticsEnabled,
  setHapticsEnabled,
  triggerTabHaptic,
  triggerScanSuccessHaptic,
  triggerSelectionHaptic,
} from '../services/haptics';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  onSignOut: () => void;
  onRefreshProducts?: (products: Product[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSignOut, onRefreshProducts }) => {
  const { profile, isInspector, isConsumer, signOut, switchRoleDemo } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [appearanceMode, setAppearanceMode] = useState<'system' | 'light' | 'dark'>('system');
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsState] = useState(() => isHapticsEnabled());
  const [vibrationSupported] = useState(() => isVibrationSupported());
  const [cacheStats, setCacheStats] = useState(() => getCacheStats());
  const [lastHapticTriggered, setLastHapticTriggered] = useState<string | null>(null);

  const handleToggleHaptics = (enabled: boolean) => {
    setHapticsState(enabled);
    setHapticsEnabled(enabled);
    if (enabled) {
      triggerSelectionHaptic();
      setLastHapticTriggered('Enabled haptics (8ms pulse)');
    }
  };

  const testHapticPattern = (type: 'tab' | 'scan' | 'select') => {
    if (type === 'tab') {
      triggerTabHaptic();
      setLastHapticTriggered('Tab Switch Haptic (15ms)');
    } else if (type === 'scan') {
      triggerScanSuccessHaptic();
      setLastHapticTriggered('Scan Success Pattern (40ms, 60ms, 120ms)');
    } else {
      triggerSelectionHaptic();
      setLastHapticTriggered('Selection Tap (8ms)');
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all cached scan dossiers stored on this device?')) {
      const empty = clearScanCache();
      setCacheStats(getCacheStats());
      if (onRefreshProducts) onRefreshProducts(empty);
    }
  };

  const handleResetCache = () => {
    const samples = resetCacheToDefaults();
    setCacheStats(getCacheStats());
    if (onRefreshProducts) onRefreshProducts(samples);
  };

  return (
    <div className="flex-grow w-full max-w-[840px] lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#eef1ed] border border-[#d8deda] text-[11px] font-semibold text-[#0f5238] uppercase tracking-wider mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]"></span>
          {isInspector ? 'Terminal & Officer Profile' : 'Citizen Profile & Terminal'}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#191c1a] tracking-tight">
          Settings & Terminal
        </h1>
        <p className="text-xs md:text-sm text-[#404943] mt-0.5">
          {isInspector
            ? 'Manage officer credentials, local offline cache, appearance, and statutory enforcement parameters.'
            : 'Manage consumer preferences, local scan history cache, appearance, and statutory alerts.'}
        </p>
      </div>

      {/* Main Responsive Grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 items-start space-y-6 lg:space-y-0">
        {/* Left Column on Desktop: Profile & Session Termination */}
        <div className="w-full lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-24">
          {/* Profile Summary Card */}
          <section className="bg-white border border-[#bfc9c1]/80 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start gap-4 md:gap-5 shadow-[0px_2px_8px_rgba(0,0,0,0.02)] w-full">
            <div className="relative">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName || profile.email}
                  className="w-16 h-16 rounded-2xl object-cover shadow-md border border-[#e5e9e4]"
                />
              ) : (
                <div className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center font-bold text-xl shadow-md border ${isInspector ? 'bg-[#0f5238] border-[#0f5238]' : 'bg-[#0058be] border-[#0058be]'}`}>
                  <span>{isInspector ? 'RS' : (profile?.fullName?.[0] || profile?.email?.[0] || 'C').toUpperCase()}</span>
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${isInspector ? 'bg-[#dcfce7] text-[#0f5238]' : 'bg-[#d8e2ff] text-[#0058be]'}`} title={isInspector ? 'Active Officer Badge' : 'Verified Citizen Consumer'}>
                <span className="material-symbols-outlined text-[12px] font-black">
                  {isInspector ? 'verified' : 'person'}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h2 className="text-lg md:text-xl font-extrabold text-[#191c1a] tracking-tight">
                  {isInspector ? (profile?.fullName || 'Rajesh Sharma') : (profile?.fullName || profile?.email?.split('@')[0] || 'Citizen Consumer')}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isInspector ? 'bg-[#eef1ed] border-[#d8deda] text-[#0f5238]' : 'bg-[#d8e2ff] border-[#adc6ff] text-[#0058be]'}`}>
                  {isInspector ? (profile?.badgeNumber || 'Badge #889021') : 'Citizen Account'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#404943] font-medium">{profile?.email || (isInspector ? 'rajesh.sharma@legalmetrology.gov.in' : 'consumer@truva.gov.in')}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="bg-[#f2f4f0] border border-[#bfc9c1]/70 text-[#191c1a] px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                  {isInspector ? 'Legal Metrology Inspector' : 'Informed Consumer'}
                </span>
                <span className="bg-[#dcfce7] border border-[#bbf7d0] text-[#0f5238] px-2.5 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">offline_pin</span>
                  Offline Ready
                </span>
              </div>
            </div>
          </section>

          {/* Fast Role Switcher for Testing / Demonstration */}
          <div className="w-full bg-white border border-[#bfc9c1]/80 rounded-2xl p-4 shadow-2xs flex flex-col gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#707973]">
              Active Access Role
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c1a]">
                {isInspector ? 'Legal Metrology Inspector' : 'Citizen Consumer'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isInspector
                  ? 'bg-[#f0fdf4] text-[#0f5238] border-[#bbf7d0]'
                  : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
              }`}>
                Active
              </span>
            </div>

            <button
              onClick={() => {
                triggerSelectionHaptic();
                switchRoleDemo(isInspector ? 'consumer' : 'inspector');
              }}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 ${
                isInspector
                  ? 'bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe]'
                  : 'bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#0f5238] border border-[#bbf7d0]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>{isInspector ? 'Switch to Citizen Consumer Mode' : 'Switch to Legal Metrology Inspector'}</span>
            </button>
          </div>

          {/* Sign Out Button (Visible on both Mobile and Desktop) */}
          <button
            onClick={async () => {
              await signOut();
              onSignOut();
            }}
            className="flex w-full text-xs font-bold text-[#ba1a1a] hover:text-white hover:bg-[#ba1a1a] border border-[#ba1a1a]/40 hover:border-[#ba1a1a] py-3 rounded-xl transition-all items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[17px]">logout</span>
            Terminate Session / Change Access Role
          </button>
        </div>

        {/* Right Column on Desktop: Grouped Settings Options */}
        <div className="w-full lg:col-span-7 flex flex-col gap-6">
          {/* Settings List Grouped */}
          <section className="bg-white border border-[#bfc9c1]/80 rounded-2xl divide-y divide-[#bfc9c1]/40 overflow-hidden shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
            {/* Offline Storage Cache */}
            <button
              onClick={() => {
                setCacheStats(getCacheStats());
                setActiveModal('cache');
              }}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#f2f4f0]/80 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 text-[#191c1a]">
                <div className="w-10 h-10 rounded-xl bg-[#eef1ed] border border-[#d8deda] flex items-center justify-center text-[#0f5238] group-hover:bg-[#0f5238] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">storage</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-bold text-[#191c1a]">Offline Storage Cache</span>
                  <span className="text-xs text-[#707973]">
                    {cacheStats.count} cached dossiers ({cacheStats.sizeKB} KB storage)
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#bfc9c1] group-hover:text-[#0f5238] group-hover:translate-x-0.5 transition-all">
                chevron_right
              </span>
            </button>

            {/* Account */}
            <button
              onClick={() => setActiveModal('account')}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#f2f4f0]/80 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 text-[#191c1a]">
                <div className="w-10 h-10 rounded-xl bg-[#d8e2ff]/60 border border-[#adc6ff] flex items-center justify-center text-[#0058be] group-hover:bg-[#0058be] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-bold text-[#191c1a]">Officer Profile &amp; Credentials</span>
                  <span className="text-xs text-[#707973]">Department verification credentials and audit logs</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#bfc9c1] group-hover:text-[#0f5238] group-hover:translate-x-0.5 transition-all">
                chevron_right
              </span>
            </button>

            {/* Appearance */}
            <button
              onClick={() => setActiveModal('appearance')}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#f2f4f0]/80 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 text-[#191c1a]">
                <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] border border-[#bae6fd] flex items-center justify-center text-[#0369a1] group-hover:bg-[#0369a1] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">palette</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-bold text-[#191c1a]">Appearance &amp; Theme</span>
                  <span className="text-xs text-[#707973] capitalize">
                    {appearanceMode === 'system' ? 'System default (High contrast)' : `${appearanceMode} mode`}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#bfc9c1] group-hover:text-[#0f5238] group-hover:translate-x-0.5 transition-all">
                chevron_right
              </span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setActiveModal('notifications')}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#f2f4f0]/80 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 text-[#191c1a]">
                <div className="w-10 h-10 rounded-xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-center text-[#b45309] group-hover:bg-[#b45309] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-bold text-[#191c1a]">Alert Preferences</span>
                  <span className="text-xs text-[#707973]">
                    {notifsEnabled ? 'Immediate statutory discrepancy alerts ON' : 'Muted'}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#bfc9c1] group-hover:text-[#0f5238] group-hover:translate-x-0.5 transition-all">
                chevron_right
              </span>
            </button>

            {/* Privacy */}
            <button
              onClick={() => setActiveModal('privacy')}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#f2f4f0]/80 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 text-[#191c1a]">
                <div className="w-10 h-10 rounded-xl bg-[#f3e8ff] border border-[#e9d5ff] flex items-center justify-center text-[#7e22ce] group-hover:bg-[#7e22ce] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">security</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-bold text-[#191c1a]">Privacy &amp; Data Encryption</span>
                  <span className="text-xs text-[#707973]">Local-first offline security and zero-telemetry policy</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#bfc9c1] group-hover:text-[#0f5238] group-hover:translate-x-0.5 transition-all">
                chevron_right
              </span>
            </button>

            {/* About */}
            <button
              onClick={() => setActiveModal('about')}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[#f2f4f0]/80 transition-colors group cursor-pointer text-left"
            >
              <div className="flex items-center gap-4 text-[#191c1a]">
                <div className="w-10 h-10 rounded-xl bg-[#eef1ed] border border-[#d8deda] flex items-center justify-center text-[#404943] group-hover:bg-[#191c1a] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm md:text-base font-bold text-[#191c1a]">About TRUVA Platform</span>
                  <span className="text-xs text-[#707973]">Version 2.4.0 (Build 890) • Legal Metrology Intelligence</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#bfc9c1] group-hover:text-[#0f5238] group-hover:translate-x-0.5 transition-all">
                chevron_right
              </span>
            </button>
          </section>

          {/* Mobile Sign Out Action */}
          <div className="pt-2 flex justify-center lg:hidden">
            <button
              onClick={async () => {
                await signOut();
                onSignOut();
              }}
              className="text-xs font-bold text-[#ba1a1a] hover:text-white hover:bg-[#ba1a1a] border border-[#ba1a1a]/40 hover:border-[#ba1a1a] px-7 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[17px]">logout</span>
              Terminate Session / Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modal Handler */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#bfc9c1]/90 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#e1e3df] pb-3">
              <h3 className="font-extrabold text-lg text-[#191c1a] capitalize">
                {activeModal === 'about' ? 'About TRUVA Platform' : activeModal === 'cache' ? 'Offline Cache Storage' : `${activeModal} Settings`}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#707973] hover:text-[#191c1a] hover:bg-[#eceeea] p-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Offline Cache Modal */}
            {activeModal === 'cache' && (
              <div className="space-y-3.5 text-xs text-[#404943]">
                <p className="leading-relaxed">
                  TRUVA utilizes client-side encrypted localStorage to store commodity dossiers, OCR scan images, ingredient matrices, and Legal Metrology rule evidence offline on this device.
                </p>

                <div className="bg-[#f8faf6] p-4 rounded-xl border border-[#e1e3df] space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#191c1a]">Stored Dossiers:</span>
                    <span className="font-bold text-[#191c1a]">{cacheStats.count} products</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#191c1a]">Storage Footprint:</span>
                    <span className="font-bold text-[#191c1a]">{cacheStats.sizeKB} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#191c1a]">Last Synchronized:</span>
                    <span>{cacheStats.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-[#191c1a]">Offline Verification Engine:</span>
                    <span className="text-[#0f5238] font-bold">Active (Persistent)</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleResetCache}
                    className="flex-1 py-2.5 bg-[#dcfce7] text-[#0f5238] font-bold rounded-xl hover:bg-[#bbf7d0] transition-colors cursor-pointer text-xs"
                  >
                    Reset Samples
                  </button>
                  <button
                    onClick={handleClearCache}
                    className="flex-1 py-2.5 bg-[#ffdad6]/60 text-[#ba1a1a] font-bold rounded-xl hover:bg-[#ffdad6] transition-colors cursor-pointer text-xs"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'appearance' && (
              <div className="space-y-3 text-xs">
                <p className="text-[#404943]">Choose your preferred theme interface:</p>
                {(['system', 'light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAppearanceMode(mode)}
                    className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center cursor-pointer transition-all ${
                      appearanceMode === mode
                        ? 'border-[#0f5238] bg-[#dcfce7]/40 font-bold text-[#0f5238]'
                        : 'border-[#bfc9c1]/60 text-[#191c1a] hover:bg-[#f2f4f0]'
                    }`}
                  >
                    <span className="capitalize font-semibold">{mode} Mode</span>
                    {appearanceMode === mode && (
                      <span className="material-symbols-outlined text-[18px] text-[#0f5238] font-bold">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeModal === 'notifications' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-[#f8faf6] rounded-xl border border-[#e1e3df]">
                  <div>
                    <div className="font-bold text-[#191c1a]">Statutory Discrepancy Alerts</div>
                    <div className="text-[#707973]">Notify when mandatory declarations or net quantity rules fail</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifsEnabled}
                    onChange={(e) => setNotifsEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#0f5238] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="space-y-3 text-xs text-[#404943] leading-relaxed">
                <p>
                  <strong className="text-[#191c1a]">TRUVA Zero-Tracking Guarantee:</strong> Your camera inputs and scan history remain strictly encrypted and cached on your device. We do not sell consumer scanning telemetry to food conglomerates or advertisers.
                </p>
                <p>
                  All Legal Metrology Act cross-references are derived from Department of Consumer Affairs statutory notifications and certified standards databases.
                </p>
              </div>
            )}

            {activeModal === 'about' && (
              <div className="space-y-2 text-xs text-[#404943] leading-relaxed">
                <p>
                  <strong className="text-[#191c1a]">TRUVA:</strong> Legal Metrology Label Verification &amp; Statutory Product Intelligence Platform for field inspectors, enforcement officers, and conscious consumers.
                </p>
                <p>
                  Engineered with sub-pixel typography, WCAG AA compliance, and cryptographic audit trails.
                </p>
              </div>
            )}

            {activeModal === 'account' && (
              <div className="space-y-2.5 text-xs text-[#404943] bg-[#f8faf6] p-4 rounded-xl border border-[#e1e3df]">
                {isInspector ? (
                  <>
                    <div className="flex justify-between"><strong className="text-[#191c1a]">Officer ID:</strong> <span>{profile?.officerId || 'INS-RAJESH-889021'}</span></div>
                    <div className="flex justify-between"><strong className="text-[#191c1a]">Officer Name:</strong> <span>{profile?.fullName || 'Rajesh Sharma'}</span></div>
                    <div className="flex justify-between"><strong className="text-[#191c1a]">Jurisdiction:</strong> <span>{profile?.jurisdiction || 'Zone 4 (Central Metrology Division)'}</span></div>
                    <div className="flex justify-between"><strong className="text-[#191c1a]">Total Inspections:</strong> <span>{cacheStats.count} verified commodities</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between"><strong className="text-[#191c1a]">Account Type:</strong> <span>Informed Citizen Consumer</span></div>
                    <div className="flex justify-between"><strong className="text-[#191c1a]">Email:</strong> <span>{profile?.email}</span></div>
                    <div className="flex justify-between"><strong className="text-[#191c1a]">Authentication:</strong> <span>Supabase Auth (Active)</span></div>
                    <div className="flex justify-between"><strong className="text-[#191c1a]">Zero Telemetry:</strong> <span className="text-[#0f5238] font-bold">Active</span></div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#0f5238] hover:bg-[#2d6a4f] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
