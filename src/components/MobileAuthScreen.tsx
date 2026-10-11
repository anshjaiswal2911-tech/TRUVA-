import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { triggerSelectionHaptic, triggerScanSuccessHaptic } from '../services/haptics';

interface MobileAuthScreenProps {
  onSuccess?: () => void;
}

export const MobileAuthScreen: React.FC<MobileAuthScreenProps> = ({ onSuccess }) => {
  const { switchRoleDemo, signInInspector, signInConsumerWithEmail, isLoading, authError, clearError } = useAuth();
  const [showAdvancedCredentials, setShowAdvancedCredentials] = useState(false);
  const [officerBadge, setOfficerBadge] = useState('INS-RAJESH-889021');
  const [officerSecret, setOfficerSecret] = useState('');
  const [consumerEmail, setConsumerEmail] = useState('');
  const [activeTab, setActiveTab] = useState<UserRole>('inspector');

  const handleSelectDemoRole = (role: UserRole) => {
    triggerScanSuccessHaptic();
    clearError();
    switchRoleDemo(role);
    onSuccess?.();
  };

  const handleOfficerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerSelectionHaptic();
    clearError();
    const res = await signInInspector(officerBadge, officerSecret || undefined);
    if (!res.error) {
      onSuccess?.();
    }
  };

  const handleConsumerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerSelectionHaptic();
    clearError();
    const res = await signInConsumerWithEmail(consumerEmail || 'consumer@truva.gov.in');
    if (!res.error) {
      onSuccess?.();
    }
  };

  return (
    <div className="min-h-full flex-1 w-full bg-[#f8faf6] flex flex-col justify-center px-4 py-6 sm:py-10 text-[#191c1a] font-sans selection:bg-[#0f5238] selection:text-white">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Brand Emblem */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f5238] to-[#1e7250] flex items-center justify-center text-white shadow-lg mb-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-[#191c1a] tracking-tight">TRUVA</h1>
        <p className="text-[11px] font-bold text-[#0f5238] uppercase tracking-wider mt-0.5 text-center">
          National Legal Metrology & Consumer Platform
        </p>
        <p className="text-xs text-[#525e56] text-center mt-1 mb-5 max-w-xs">
          Select your access profile to enter the mobile terminal
        </p>

        {/* Error Notice */}
        {authError && (
          <div className="w-full mb-4 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-xs text-[#991b1b] flex items-center justify-between">
            <span>{authError}</span>
            <button onClick={clearError} className="font-bold text-sm ml-2">✕</button>
          </div>
        )}

        {/* Two Prominent Role Cards */}
        <div className="w-full flex flex-col gap-3.5">
          {/* Card 1: Official Inspector Portal */}
          <div className="bg-white border-2 border-[#0f5238] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0f5238] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">shield</span>
                </div>
                <div>
                  <span className="text-sm font-extrabold text-[#191c1a] block leading-tight">
                    Legal Metrology Inspector
                  </span>
                  <span className="text-[10.5px] font-bold text-[#0f5238] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Statutory Enforcement Desk
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11.5px] text-[#525e56] leading-relaxed">
              Full officer authorization: Conduct Rule 6 audits, review statutory evidence, and inspect commodity packaging non-compliance.
            </p>

            <button
              onClick={() => handleSelectDemoRole('inspector')}
              disabled={isLoading}
              className="w-full h-11 bg-[#0f5238] hover:bg-[#184835] active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Open Inspector Enforcement Desk</span>
            </button>
          </div>

          {/* Card 2: Citizen Consumer Portal */}
          <div className="bg-white border-2 border-[#1d4ed8] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1d4ed8] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">person</span>
                </div>
                <div>
                  <span className="text-sm font-extrabold text-[#191c1a] block leading-tight">
                    Citizen Consumer
                  </span>
                  <span className="text-[10.5px] font-bold text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Public Consumer Protection
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11.5px] text-[#525e56] leading-relaxed">
              Scan commodity packaging, verify printed MRP, detect hidden price inflation, and report packaged commodity grievances.
            </p>

            <button
              onClick={() => handleSelectDemoRole('consumer')}
              disabled={isLoading}
              className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Open Citizen Consumer Portal</span>
            </button>
          </div>
        </div>

        {/* Collapsible Manual Credentials Accordion */}
        <div className="w-full mt-4">
          <button
            type="button"
            onClick={() => setShowAdvancedCredentials(!showAdvancedCredentials)}
            className="w-full py-2 text-center text-[11px] font-semibold text-[#525e56] hover:text-[#191c1a] flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{showAdvancedCredentials ? 'Hide Custom Credentials' : 'Or Sign In with Official Badge / Email'}</span>
            <span className="material-symbols-outlined text-[16px]">
              {showAdvancedCredentials ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {showAdvancedCredentials && (
            <div className="bg-white border border-[#e5e9e4] rounded-2xl p-4 mt-2 shadow-xs transition-all">
              <div className="flex border-b border-[#e5e9e4] mb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('inspector')}
                  className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'inspector'
                      ? 'border-[#0f5238] text-[#0f5238]'
                      : 'border-transparent text-[#707973]'
                  }`}
                >
                  Officer Badge
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('consumer')}
                  className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 cursor-pointer transition-colors ${
                    activeTab === 'consumer'
                      ? 'border-[#1d4ed8] text-[#1d4ed8]'
                      : 'border-transparent text-[#707973]'
                  }`}
                >
                  Citizen Email
                </button>
              </div>

              {activeTab === 'inspector' ? (
                <form onSubmit={handleOfficerLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#525e56] uppercase mb-1">
                      Officer Badge or Govt Email
                    </label>
                    <input
                      type="text"
                      value={officerBadge}
                      onChange={(e) => setOfficerBadge(e.target.value)}
                      placeholder="INS-RAJESH-889021"
                      className="w-full px-3 py-2 text-xs border border-[#d0d7cf] rounded-lg focus:outline-none focus:border-[#0f5238]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#525e56] uppercase mb-1">
                      Passcode (Optional for demo)
                    </label>
                    <input
                      type="password"
                      value={officerSecret}
                      onChange={(e) => setOfficerSecret(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs border border-[#d0d7cf] rounded-lg focus:outline-none focus:border-[#0f5238]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-9 bg-[#0f5238] hover:bg-[#184835] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Authenticate Inspector
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConsumerLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#525e56] uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={consumerEmail}
                      onChange={(e) => setConsumerEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full px-3 py-2 text-xs border border-[#d0d7cf] rounded-lg focus:outline-none focus:border-[#1d4ed8]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-9 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Continue as Citizen
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Security watermark footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#707973]">
          <span className="material-symbols-outlined text-[13px]">lock</span>
          <span>Secured under Legal Metrology Act, 2009 & Rule 6 Regulations</span>
        </div>
      </div>
    </div>
  );
};
