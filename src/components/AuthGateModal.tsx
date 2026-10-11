import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AuthGateModalProps {
  initialRole?: UserRole;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({ initialRole = 'consumer' }) => {
  const {
    signInWithGoogle,
    signInConsumerWithEmail,
    signUpConsumerWithEmail,
    signInInspector,
    authError,
    clearError,
    isLoading,
  } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [consumerMode, setConsumerMode] = useState<'signin' | 'signup'>('signin');

  // Google Account Chooser state
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Consumer email form state
  const [consumerEmail, setConsumerEmail] = useState('');
  const [consumerPassword, setConsumerPassword] = useState('');

  // Inspector credentials state
  const [inspectorId, setInspectorId] = useState('INS-RAJESH-889021');
  const [inspectorSecret, setInspectorSecret] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleSelectGoogleAccount = async (email: string, name?: string) => {
    if (isLoading || isSubmitting) return;
    clearError();
    setIsSubmitting(true);
    setLoadingAction(`Signing in as ${email}...`);
    setShowGooglePicker(false);
    try {
      await signInWithGoogle(email, name);
    } finally {
      setIsSubmitting(false);
      setLoadingAction(null);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    await handleSelectGoogleAccount(customGoogleEmail.trim(), customGoogleName.trim() || undefined);
  };

  const handleGoogleSignIn = async () => {
    clearError();
    if (isSupabaseConfigured) {
      setIsSubmitting(true);
      setLoadingAction('Connecting to Google OAuth...');
      try {
        await signInWithGoogle();
      } catch (err: any) {
        setShowGooglePicker(true);
      } finally {
        setIsSubmitting(false);
        setLoadingAction(null);
      }
    } else {
      setShowGooglePicker(true);
    }
  };

  const handleConsumerEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSubmitting) return;
    clearError();
    setIsSubmitting(true);
    setLoadingAction(consumerMode === 'signin' ? 'Signing in as Consumer...' : 'Creating Citizen Account...');
    try {
      if (consumerMode === 'signin') {
        await signInConsumerWithEmail(consumerEmail, consumerPassword || undefined);
      } else {
        await signUpConsumerWithEmail(consumerEmail, consumerPassword || undefined);
      }
    } finally {
      setIsSubmitting(false);
      setLoadingAction(null);
    }
  };

  const handleInspectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSubmitting) return;
    clearError();
    setIsSubmitting(true);
    setLoadingAction('Verifying officer statutory authorization...');
    try {
      await signInInspector(inspectorId, inspectorSecret || undefined);
    } finally {
      setIsSubmitting(false);
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-full w-full bg-[#f8faf6] flex flex-col items-center justify-center p-3 sm:p-5 text-[#191c1a] font-sans selection:bg-[#0f5238] selection:text-white">
      {/* Background Subtle Metrology Watermark */}
      <div className="w-full max-w-[460px] flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0f5238] flex items-center justify-center text-white shadow-sm">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-black text-2xl sm:text-[26px] tracking-tight text-[#0f5238]">
              TRUVA
            </span>
          </div>

          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#525e56]">
            Legal Metrology Regulatory Intelligence
          </span>
        </div>

        {/* Auth Container Card */}
        <div className="w-full bg-white rounded-2xl border border-[#e5e9e4] p-6 sm:p-8 shadow-sm">
          {/* Access Mode Selector */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-[#525e56] uppercase tracking-wider mb-2">
              Select Access Type
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#f2f5f1] rounded-xl border border-[#e5e9e4] gap-1">
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setSelectedRole('consumer');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'consumer'
                    ? 'bg-white text-[#0f5238] shadow-xs font-bold'
                    : 'text-[#525e56] hover:text-[#191c1a]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">person</span>
                <span>Consumer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clearError();
                  setSelectedRole('inspector');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'inspector'
                    ? 'bg-[#0f5238] text-white shadow-xs font-bold'
                    : 'text-[#525e56] hover:text-[#191c1a]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">shield</span>
                <span>Inspector</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-5 bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] rounded-xl p-3 text-xs flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">error</span>
              <div className="flex-1 leading-snug">{authError}</div>
              <button
                type="button"
                onClick={clearError}
                className="text-[#991b1b] hover:text-[#7f1d1d] text-xs font-bold px-1 cursor-pointer"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* 1. CONSUMER AUTHENTICATION FLOW */}
          {selectedRole === 'consumer' && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10.5px] font-medium text-[#1d4ed8] bg-[#eff6ff] border border-[#bfdbfe]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
                  Citizen Transparency Portal
                </span>
                <p className="text-xs text-[#525e56] mt-1.5 leading-relaxed">
                  Verify packaged commodity declarations, metric net quantities, and statutory MRP compliance.
                </p>
              </div>

              {/* Primary Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isSubmitting}
                className="w-full h-11 bg-white hover:bg-[#f8faf6] border border-[#d0d7cf] hover:border-[#0f5238]/60 text-[#191c1a] font-semibold text-xs sm:text-[13px] rounded-xl px-4 flex items-center justify-center gap-2.5 transition-all duration-150 shadow-2xs cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.41 7.37 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.59 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-[#e5e9e4]" />
                <span className="text-[10px] font-semibold text-[#707973] uppercase tracking-wider">
                  or email access
                </span>
                <div className="flex-1 h-px bg-[#e5e9e4]" />
              </div>

              {/* Consumer Email Form */}
              <form onSubmit={handleConsumerEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#404943] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={consumerEmail}
                    onChange={(e) => setConsumerEmail(e.target.value)}
                    placeholder="citizen@example.com"
                    className="w-full px-3.5 py-2 bg-white border border-[#d0d7cf] rounded-lg text-xs sm:text-[13px] text-[#191c1a] focus:outline-none focus:border-[#0f5238] focus:ring-1 focus:ring-[#0f5238] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#404943] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={consumerPassword}
                    onChange={(e) => setConsumerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-white border border-[#d0d7cf] rounded-lg text-xs sm:text-[13px] text-[#191c1a] focus:outline-none focus:border-[#0f5238] focus:ring-1 focus:ring-[#0f5238] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="w-full h-10 bg-[#0f5238] hover:bg-[#184835] active:bg-[#0c3e2b] text-white font-semibold text-xs sm:text-[13px] rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[17px]">login</span>
                  <span>{consumerMode === 'signin' ? 'Sign In as Consumer' : 'Register Citizen Account'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setConsumerMode(consumerMode === 'signin' ? 'signup' : 'signin')}
                    className="text-[11px] text-[#0f5238] hover:underline font-medium cursor-pointer"
                  >
                    {consumerMode === 'signin'
                      ? 'New citizen user? Register here'
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. INSPECTOR AUTHENTICATION FLOW */}
          {selectedRole === 'inspector' && (
            <div className="space-y-4">
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#16a34a] shrink-0 mt-0.5">
                  verified
                </span>
                <div className="text-xs">
                  <span className="font-semibold text-[#0f5238] block">Statutory Enforcement Portal</span>
                  <span className="text-[#525e56] leading-tight block mt-0.5">
                    Restricted to authorized Legal Metrology officers under Section 18/36.
                  </span>
                </div>
              </div>

              <form onSubmit={handleInspectorSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#404943] mb-1">
                    Officer Badge ID or Department Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={inspectorId}
                      onChange={(e) => setInspectorId(e.target.value)}
                      placeholder="INS-RAJESH-889021 or rajesh.sharma@legalmetrology.gov.in"
                      className="w-full px-3.5 py-2 bg-white border border-[#d0d7cf] rounded-lg text-xs sm:text-[13px] text-[#191c1a] focus:outline-none focus:border-[#0f5238] focus:ring-1 focus:ring-[#0f5238] transition-colors"
                    />
                    <span className="absolute right-3 top-2 text-[#525e56] material-symbols-outlined text-[17px]">
                      badge
                    </span>
                  </div>
                  <span className="text-[10px] text-[#707973] mt-1 block">
                    Authoritative Roster: Officer Rajesh Sharma (#889021)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#404943] mb-1">
                    Department Passcode / Secret
                  </label>
                  <input
                    type="password"
                    value={inspectorSecret}
                    onChange={(e) => setInspectorSecret(e.target.value)}
                    placeholder="Enter officer passcode"
                    className="w-full px-3.5 py-2 bg-white border border-[#d0d7cf] rounded-lg text-xs sm:text-[13px] text-[#191c1a] focus:outline-none focus:border-[#0f5238] focus:ring-1 focus:ring-[#0f5238] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="w-full h-10 bg-[#0f5238] hover:bg-[#184835] active:bg-[#0c3e2b] text-white font-semibold text-xs sm:text-[13px] rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                >
                  <span className="material-symbols-outlined text-[17px]">gavel</span>
                  <span>Authorize &amp; Access Terminal</span>
                </button>
              </form>

              {/* Quick Fill Button for Authorized Officer Demo */}
              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setInspectorId('INS-RAJESH-889021');
                    setInspectorSecret('');
                  }}
                  className="text-[11px] text-[#0f5238] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">autorenew</span>
                  <span>Use Verified Inspector Credentials (#889021)</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Feedback */}
          {(isLoading || isSubmitting) && (
            <div className="flex items-center justify-center gap-2 pt-3 text-xs font-semibold text-[#0f5238] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238] animate-ping" />
              <span>{loadingAction || 'Verifying authentication session...'}</span>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-4 text-center text-[10.5px] text-[#707973] flex items-center gap-1.5 justify-center">
          <span className="material-symbols-outlined text-[14px] text-[#525e56]">lock</span>
          <span>Secured under Legal Metrology Act, 2009 &amp; Rule 6 Specifications</span>
        </div>
      </div>

      {/* Interactive Google Account Chooser Dialog */}
      {showGooglePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#e5e9e4] relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f2ef]">
              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.41 7.37 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.59 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="font-bold text-sm text-[#191c1a]">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowGooglePicker(false);
                  setShowCustomGoogleInput(false);
                }}
                className="text-[#707973] hover:text-[#191c1a] p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#525e56] my-3 leading-relaxed">
              Choose an account or enter any Google email to continue to <strong>TRUVA</strong>:
            </p>

            <div className="space-y-2.5">
              {/* Pre-configured Account 1 */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('priyanjali.jaiswal@gmail.com', 'Priyanjali Jaiswal')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f8faf6] border border-[#e5e9e4] hover:border-[#0f5238] text-left transition-all cursor-pointer group"
              >
                <img
                  src="https://ui-avatars.com/api/?name=Priyanjali+Jaiswal&background=0F5238&color=fff&bold=true"
                  alt="Avatar"
                  className="w-9 h-9 rounded-full shrink-0 border border-[#0f5238]/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#191c1a] group-hover:text-[#0f5238] truncate">
                    Priyanjali Jaiswal
                  </div>
                  <div className="text-[11px] text-[#707973] truncate">
                    priyanjali.jaiswal@gmail.com
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#707973] group-hover:text-[#0f5238]">
                  chevron_right
                </span>
              </button>

              {/* Pre-configured Account 2 */}
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('judge.sih@gov.in', 'Smart India Hackathon Evaluator')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f8faf6] border border-[#e5e9e4] hover:border-[#0058be] text-left transition-all cursor-pointer group"
              >
                <img
                  src="https://ui-avatars.com/api/?name=SIH+Judge&background=0058BE&color=fff&bold=true"
                  alt="Avatar"
                  className="w-9 h-9 rounded-full shrink-0 border border-[#0058be]/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#191c1a] group-hover:text-[#0058be] truncate">
                    SIH Judge / Ministry Evaluator
                  </div>
                  <div className="text-[11px] text-[#707973] truncate">
                    judge.sih@gov.in
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#707973] group-hover:text-[#0058be]">
                  chevron_right
                </span>
              </button>

              {/* Custom Google Email Input Toggle */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f8faf6] border border-dashed border-[#bfc9c1] text-left transition-all cursor-pointer text-xs font-semibold text-[#0f5238]"
                >
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  <span>Use another Google account</span>
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="pt-2 space-y-2.5 border-t border-[#f0f2ef]">
                  <div>
                    <label className="block text-[10.5px] font-semibold text-[#525e56] mb-1">
                      Your Google Email Address
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="e.g. yourname@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#d0d7cf] rounded-lg focus:border-[#0f5238] focus:ring-1 focus:ring-[#0f5238] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-semibold text-[#525e56] mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ansh Jaiswal"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#d0d7cf] rounded-lg focus:border-[#0f5238] focus:ring-1 focus:ring-[#0f5238] focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={!customGoogleEmail.trim()}
                      className="flex-1 py-2 bg-[#0f5238] hover:bg-[#184835] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Sign In with Google
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="px-3 py-2 bg-[#f2f4f0] hover:bg-[#e2e8e0] text-[#525e56] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
