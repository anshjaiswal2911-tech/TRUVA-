import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { triggerSelectionHaptic, triggerTabHaptic } from '../services/haptics';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { Product } from '../types';

interface LandingPageProps {
  onLaunchApp: (role?: 'inspector' | 'consumer') => void;
  onOpenLogin: (role?: 'inspector' | 'consumer') => void;
  onQuickScanProduct?: (product: Product) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onOpenLogin,
  onQuickScanProduct,
}) => {
  const { isAuthenticated, switchRoleDemo } = useAuth();
  const [activePersonaTab, setActivePersonaTab] = useState<'inspector' | 'consumer'>('inspector');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'fmcg' | 'beverages'>('fmcg');
  const [selectedDemoProduct, setSelectedDemoProduct] = useState<Product>(MOCK_PRODUCTS[0]);
  const [simulatedScanning, setSimulatedScanning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSimulateScan = (prod: Product) => {
    triggerSelectionHaptic();
    setSelectedDemoProduct(prod);
    setSimulatedScanning(true);
    setTimeout(() => {
      setSimulatedScanning(false);
    }, 600);
  };

  const handlePersonaToggle = (persona: 'inspector' | 'consumer') => {
    triggerTabHaptic();
    setActivePersonaTab(persona);
    if (isAuthenticated) {
      switchRoleDemo(persona);
    }
  };

  const handleActionClick = (targetRole: 'inspector' | 'consumer') => {
    triggerSelectionHaptic();
    if (isAuthenticated) {
      onLaunchApp(targetRole);
    } else {
      onOpenLogin(targetRole);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8faf6] text-[#191c1a] font-sans antialiased selection:bg-[#0f5238] selection:text-white">
      {/* 1. CLEAN USER-FRIENDLY NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e8e0] shadow-2xs transition-all">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo & Official Subtitle (Clean Branding without AI/v2.4 boxes) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] flex items-center justify-center text-white shadow-sm shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-[#0f5238] block leading-tight">
                TRUVA
              </span>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#707973] leading-none mt-0.5 hidden sm:block">
                Ministry of Consumer Affairs • Legal Metrology
              </p>
            </div>
          </div>

          {/* Centered Arranged Navigation Links */}
          <nav className="hidden xl:flex items-center gap-7 text-xs font-semibold text-[#404943]">
            <a href="#how-it-works" className="hover:text-[#0f5238] transition-colors py-1 flex items-center gap-1.5">
              <span>How It Works</span>
            </a>
            <a href="#commodity-showcase" className="hover:text-[#0f5238] transition-colors py-1 flex items-center gap-1.5">
              <span>Packaged Goods</span>
            </a>
            <a href="#dual-personas" className="hover:text-[#0f5238] transition-colors py-1 flex items-center gap-1.5">
              <span>Portals &amp; Roles</span>
            </a>
            <a href="#rule-6" className="hover:text-[#0f5238] transition-colors py-1 flex items-center gap-1.5">
              <span>Statutory Rule 6</span>
            </a>
            <a href="#problem" className="hover:text-[#0f5238] transition-colors py-1 flex items-center gap-1.5">
              <span>Market Impact</span>
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => onLaunchApp()}
                className="px-4.5 py-2.5 bg-[#0f5238] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Go to Dashboard</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenLogin('consumer')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0058be] hover:text-[#004bb0] bg-[#eff6ff] hover:bg-[#dbeafe] border border-[#bfdbfe] rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  <span>Citizen Portal</span>
                </button>
                <button
                  onClick={() => handleActionClick('inspector')}
                  className="px-4 py-2.5 bg-[#0f5238] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  <span>Inspector Login</span>
                </button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-[#e2e8e0] px-4 py-4 flex flex-col gap-3 text-xs font-bold text-[#404943] shadow-md animate-fade-in">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#f2f4f0] hover:text-[#0f5238]"
            >
              How It Works
            </a>
            <a
              href="#commodity-showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#f2f4f0] hover:text-[#0f5238]"
            >
              Packaged Goods
            </a>
            <a
              href="#dual-personas"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#f2f4f0] hover:text-[#0f5238]"
            >
              Portals &amp; Roles
            </a>
            <a
              href="#rule-6"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#f2f4f0] hover:text-[#0f5238]"
            >
              Statutory Rule 6
            </a>
            <a
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-[#f2f4f0] hover:text-[#0f5238]"
            >
              Market Impact
            </a>

            {!isAuthenticated && (
              <div className="pt-2 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin('consumer');
                  }}
                  className="flex-1 py-2 text-center bg-[#eff6ff] text-[#0058be] font-bold rounded-lg border border-[#bfdbfe]"
                >
                  Citizen Portal
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleActionClick('inspector');
                  }}
                  className="flex-1 py-2 text-center bg-[#0f5238] text-white font-bold rounded-lg"
                >
                  Inspector Login
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 max-w-[1360px] mx-auto">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#0f5238]/15 via-[#0058be]/10 to-transparent blur-3xl pointer-events-none -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Vision & Pitch (Cleaned up, no AI/next-gen box) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#191c1a] leading-[1.14]">
              Empowering <span className="text-[#0f5238] underline decoration-[#95d4b3] decoration-wavy decoration-2">1.4 Billion</span> Citizens &amp; Officers with <span className="text-[#0058be]">Instant Metrology AI.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#404943] leading-relaxed max-w-2xl font-normal">
              TRUVA automates package label compliance under the <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong>. Expose hidden shrinkflation, misleading MRPs, and missing statutory declarations across Indian FMCG, groceries, packaged snacks, and cold beverages in milliseconds — generating court-admissible <strong>Section 36</strong> enforcement dossiers and <strong>NCH 1915</strong> consumer grievances.
            </p>

            {/* Persona Action Launchers */}
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => handleActionClick('inspector')}
                className="flex-1 px-5 py-3.5 bg-[#0f5238] hover:bg-[#2d6a4f] text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
              >
                <span className="material-symbols-outlined text-[20px] text-emerald-300">gavel</span>
                <span>{isAuthenticated ? 'Enter Inspector Terminal' : 'Sign in as Inspector'}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>

              <button
                onClick={() => handleActionClick('consumer')}
                className="flex-1 px-5 py-3.5 bg-[#0058be] hover:bg-[#004bb0] text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
              >
                <span className="material-symbols-outlined text-[20px] text-sky-200">person</span>
                <span>{isAuthenticated ? 'Enter Citizen Portal' : 'Sign in as Citizen'}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#707973] pt-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0f5238] text-[18px]">verified</span>
                <span>Rule 6(1) 8-Point Audit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0f5238] text-[18px]">offline_pin</span>
                <span>100% Offline Edge Mirror</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0f5238] text-[18px]">security</span>
                <span>SHA-256 Tamper Proof</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive HUD Scanner Preview Card */}
          <div id="demo-sandbox" className="lg:col-span-5 relative">
            <div className="relative bg-white rounded-3xl border-2 border-[#bfc9c1]/60 shadow-2xl p-5 overflow-hidden">
              {/* Top Card Bar with Category Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e1e3df] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-[#191c1a]">Live Commodity Perception Reticle</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#dcfce7] text-[#0f5238] px-2 py-0.5 rounded">
                  ISO/IEC 17025
                </span>
              </div>

              {/* Product Preview Image with Laser Reticle */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-white border border-[#e2e8e0] mt-3 overflow-hidden flex items-center justify-center p-2">
                <img
                  src={selectedDemoProduct.imageUrl}
                  alt={selectedDemoProduct.name}
                  className={`w-full h-full object-contain transition-all duration-300 ${simulatedScanning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}
                />

                {/* Laser Scan Beam */}
                <div className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-scan-laser pointer-events-none"></div>

                {/* Corner HUD Reticles */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#0f5238]"></div>
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#0f5238]"></div>
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#0f5238]"></div>
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#0f5238]"></div>

                {/* Floating Optical Detection Tags */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[9.5px] font-mono px-2 py-1 rounded border border-emerald-500/60 shadow-md">
                  Rule 6(1) PDP Area: 280 cm² | Numeral: 4.8mm ✓
                </div>
                <div className="absolute bottom-3 right-3 bg-[#0f5238]/95 backdrop-blur-xs text-white text-[9.5px] font-mono px-2 py-1 rounded border border-emerald-400/40 shadow-md">
                  MRP &amp; USP: Verified (Taxes Included) ✓
                </div>
              </div>

              {/* Quick Sample Selector Buttons: 4 distinct category collections */}
              <div className="mt-4 pt-3 border-t border-[#e1e3df]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#707973] mb-2 flex items-center justify-between">
                  <span>Select Sample Packaged Commodity:</span>
                  <span className="text-[9px] text-[#0f5238] font-semibold">4 Major Retail Sectors</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {MOCK_PRODUCTS.slice(0, 4).map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleSimulateScan(prod)}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedDemoProduct.id === prod.id
                          ? 'border-[#0f5238] bg-[#dcfce7]/60 font-bold ring-2 ring-[#0f5238]/20 shadow-2xs'
                          : 'border-[#bfc9c1]/60 hover:bg-[#f2f4f0]'
                      }`}
                    >
                      <div className="w-11 h-11 mx-auto mb-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center p-0.5 shadow-2xs">
                        <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[9.5px] font-semibold truncate block text-[#191c1a]">
                        {prod.id === 'fmcg-packaged-basket' ? 'Groceries' :
                         prod.id === 'cold-drinks-beverages' ? 'Cold Drinks' :
                         prod.id === 'packaged-snacks-biscuits' ? 'Snacks' :
                         prod.id === 'personal-care-household' ? 'Hygiene' :
                         prod.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Result Drawer */}
              <div className="mt-4 bg-[#f8faf6] p-3.5 rounded-2xl border border-[#bfc9c1]/50 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#191c1a] text-xs line-clamp-1">{selectedDemoProduct.name}</div>
                  <div className="text-[11px] text-[#707973]">
                    Status: <strong className="text-[#0f5238] font-bold">{selectedDemoProduct.overallVerdict}</strong> • {selectedDemoProduct.category}
                  </div>
                </div>
                <button
                  onClick={() => handleActionClick('inspector')}
                  className="px-3.5 py-2 bg-[#0f5238] hover:bg-[#2d6a4f] text-white font-bold rounded-xl text-[11px] cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  {isAuthenticated ? 'Inspect Dossier' : 'Launch Inspection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW TRUVA WORKS (4-Step Pipeline) */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 max-w-[1360px] mx-auto border-t border-[#e2e8e0]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dcfce7] border border-[#95d4b3] text-[#0f5238] text-xs font-bold uppercase tracking-wider mb-2">
            <span>The Automated Verification Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#191c1a] tracking-tight">
            How TRUVA Audits a Package in 1.2 Seconds
          </h2>
          <p className="text-xs sm:text-base text-[#404943] max-w-xl mx-auto mt-2">
            From raw camera frame to court-admissible Section 36 dossier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#bfc9c1]/50 shadow-xs relative">
            <span className="text-3xl font-black font-mono text-[#0f5238]/20 absolute top-4 right-5">01</span>
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center font-bold mb-4">
              <span className="material-symbols-outlined text-[20px]">crop_free</span>
            </div>
            <h3 className="font-bold text-sm text-[#191c1a] mb-1">Perspective Deskew</h3>
            <p className="text-xs text-[#404943]">
              Binarization, perspective correction &amp; contrast normalization for curved and glossy packaging.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#bfc9c1]/50 shadow-xs relative">
            <span className="text-3xl font-black font-mono text-[#0f5238]/20 absolute top-4 right-5">02</span>
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center font-bold mb-4">
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            </div>
            <h3 className="font-bold text-sm text-[#191c1a] mb-1">OCR &amp; NLP Extraction</h3>
            <p className="text-xs text-[#404943]">
              Extracts Principal Display Panel (PDP) text, dates, pricing, packer addresses &amp; customer care info.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#bfc9c1]/50 shadow-xs relative">
            <span className="text-3xl font-black font-mono text-[#0f5238]/20 absolute top-4 right-5">03</span>
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center font-bold mb-4">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <h3 className="font-bold text-sm text-[#191c1a] mb-1">Rule 6 &amp; Schedule II Audit</h3>
            <p className="text-xs text-[#404943]">
              Validates all 8 mandatory declarations and computes numeral height-to-package ratio automatically.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#bfc9c1]/50 shadow-xs relative">
            <span className="text-3xl font-black font-mono text-[#0f5238]/20 absolute top-4 right-5">04</span>
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center font-bold mb-4">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <h3 className="font-bold text-sm text-[#191c1a] mb-1">SHA-256 Ledger Stamp</h3>
            <p className="text-xs text-[#404943]">
              Locks evidence into tamper-proof hash and generates Form A Notice or NCH 1915 grievance draft.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PACKAGED COMMODITIES SHOWCASE GALLERY (4 Major Sectors) */}
      <section id="commodity-showcase" className="py-16 bg-[#f0f4ee] border-y border-[#e2e8e0] px-4 sm:px-6">
        <div className="max-w-[1360px] mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dcfce7] border border-[#95d4b3] text-[#0f5238] text-xs font-bold uppercase tracking-wider mb-2">
              <span>National Commodity Registry</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#191c1a] tracking-tight">
              Statutory Audits Across 4 Major Indian Retail Sectors
            </h2>
            <p className="text-xs sm:text-base text-[#404943] max-w-2xl mx-auto mt-2">
              Every Kirana store staple, cold beverage, packaged snack, and hygiene commodity is instantly verifiable under Legal Metrology Rule 6(1).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Showcase Card 1: FMCG & Groceries */}
            <div className="bg-white rounded-3xl border border-[#bfc9c1]/70 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌾</span>
                    <h3 className="text-lg font-black text-[#191c1a]">Indian FMCG &amp; Groceries Basket</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#dcfce7] text-[#0f5238] px-2 py-0.5 rounded">
                    Rule 6(1) Compliant
                  </span>
                </div>

                <div className="w-full h-56 rounded-2xl bg-white border border-gray-200 overflow-hidden mb-4 p-2 flex items-center justify-center">
                  <img
                    src="/images/fmcg_packaged_goods.jpg"
                    alt="Indian FMCG Packaged Groceries"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <p className="text-xs text-[#404943] leading-relaxed mb-4">
                  Includes staples like <strong>Annapurna Atta</strong>, <strong>Tata Salt</strong>, <strong>Taj Mahal Tea</strong>, <strong>Gowardhan Ghee</strong>, <strong>Maggi Noodles</strong>, <strong>Mother's Recipe Pickles</strong>, and <strong>Kissan Jams</strong>. Verified for Net Weight tolerance, MRP inclusive of taxes, and Schedule II font standards.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#525e56] bg-[#f8faf6] p-3 rounded-xl border border-gray-200">
                  <div>✓ Net Quantity: Standard Units</div>
                  <div>✓ Unit Sale Price (USP): Present</div>
                  <div>✓ Country of Origin: India</div>
                  <div>✓ FSSAI &amp; Batch No: Valid</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0f5238]">Staples &amp; Groceries</span>
                <button
                  onClick={() => {
                    handleSimulateScan(MOCK_PRODUCTS[0]);
                    const el = document.getElementById('demo-sandbox');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Test Reticle Scan
                </button>
              </div>
            </div>

            {/* Showcase Card 2: Cold Drinks & Beverages */}
            <div className="bg-white rounded-3xl border border-[#bfc9c1]/70 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🥤</span>
                    <h3 className="text-lg font-black text-[#191c1a]">Packaged Cold Drinks &amp; Beverages</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#eff6ff] text-[#0058be] px-2 py-0.5 rounded">
                    Rule 6(1)(s) Verified
                  </span>
                </div>

                <div className="w-full h-56 rounded-2xl bg-white border border-gray-200 overflow-hidden mb-4 p-2 flex items-center justify-center">
                  <img
                    src="/images/beverages_cold_drinks.jpg"
                    alt="Indian Packaged Cold Drinks & Beverages"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <p className="text-xs text-[#404943] leading-relaxed mb-4">
                  Includes leading bottled beverages like <strong>Frooti</strong>, <strong>Coca-Cola</strong>, <strong>Sprite</strong>, <strong>Thums Up</strong>, <strong>Limca</strong>, <strong>Paper Boat</strong>, <strong>Real Fruit Juice</strong>, and <strong>Tropicana</strong>. Audited for statutory bottle-cap MRP printing, caffeine warnings, and price per 100ml.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#525e56] bg-[#f8faf6] p-3 rounded-xl border border-gray-200">
                  <div>✓ Volume: 250ml - 2000ml</div>
                  <div>✓ Price / ml (USP): Declared</div>
                  <div>✓ Best Before Date: Stamped</div>
                  <div>✓ Customer Care Toll-Free: Yes</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0058be]">Beverages &amp; Juices</span>
                <button
                  onClick={() => {
                    handleSimulateScan(MOCK_PRODUCTS[1]);
                    const el = document.getElementById('demo-sandbox');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-[#0058be] hover:bg-[#004bb0] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Test Reticle Scan
                </button>
              </div>
            </div>

            {/* Showcase Card 3: Snacks & Biscuits */}
            <div className="bg-white rounded-3xl border border-[#bfc9c1]/70 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍪</span>
                    <h3 className="text-lg font-black text-[#191c1a]">Packaged Snacks, Biscuits &amp; Namkeen</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#fef3c7] text-[#b45309] px-2 py-0.5 rounded">
                    Shrinkflation Monitored
                  </span>
                </div>

                <div className="w-full h-56 rounded-2xl bg-white border border-gray-200 overflow-hidden mb-4 p-2 flex items-center justify-center">
                  <img
                    src="/images/packaged_snacks_biscuits.jpg"
                    alt="Indian Packaged Snacks & Biscuits"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <p className="text-xs text-[#404943] leading-relaxed mb-4">
                  Includes everyday snacks like <strong>Parle-G</strong>, <strong>Britannia Good Day</strong>, <strong>Haldiram's Aloo Bhujia</strong>, <strong>Kurkure</strong>, <strong>Lay's Magic Masala</strong>, <strong>Hide &amp; Seek</strong>, <strong>Bikaji Sev</strong>, and <strong>Bourbon</strong>. Audited for grammage changes, USP accuracy, and allergen declarations.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#525e56] bg-[#f8faf6] p-3 rounded-xl border border-gray-200">
                  <div>✓ Net Quantity: 30g - 200g</div>
                  <div>✓ Unit Price (₹/g): Audited</div>
                  <div>✓ Green Veg Dot: Verified</div>
                  <div>✓ Tamper-proof Date Stamp</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#b45309]">Snacks &amp; Confectionery</span>
                <button
                  onClick={() => {
                    handleSimulateScan(MOCK_PRODUCTS[2]);
                    const el = document.getElementById('demo-sandbox');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Test Reticle Scan
                </button>
              </div>
            </div>

            {/* Showcase Card 4: Personal Care & Household */}
            <div className="bg-white rounded-3xl border border-[#bfc9c1]/70 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧼</span>
                    <h3 className="text-lg font-black text-[#191c1a]">Personal Care, Soaps &amp; Detergents</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#f3e8ff] text-[#7e22ce] px-2 py-0.5 rounded">
                    Schedule II Compliant
                  </span>
                </div>

                <div className="w-full h-56 rounded-2xl bg-white border border-gray-200 overflow-hidden mb-4 p-2 flex items-center justify-center">
                  <img
                    src="/images/personal_care_household.jpg"
                    alt="Personal Care and Detergent Products"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <p className="text-xs text-[#404943] leading-relaxed mb-4">
                  Includes daily home essentials like <strong>Dettol Soap &amp; Antiseptic</strong>, <strong>Lifebuoy Handwash</strong>, <strong>Surf Excel</strong>, <strong>Ariel Matic</strong>, <strong>Colgate Toothpaste</strong>, <strong>Parachute Coconut Oil</strong>, <strong>Clinic Plus</strong>, and <strong>Lizol Cleaner</strong>. Audited for net weight/volume standards and statutory packer marks.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#525e56] bg-[#f8faf6] p-3 rounded-xl border border-gray-200">
                  <div>✓ Net Volume/Weight: Verified</div>
                  <div>✓ Mandatory Packer Address</div>
                  <div>✓ Max Retail Price (All Taxes)</div>
                  <div>✓ Customer Care Toll-Free</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#7e22ce]">Personal Care &amp; Hygiene</span>
                <button
                  onClick={() => {
                    handleSimulateScan(MOCK_PRODUCTS[3]);
                    const el = document.getElementById('demo-sandbox');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-[#7e22ce] hover:bg-[#6b21a8] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Test Reticle Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL PERSONA DEEP DIVE (Inspector vs Consumer) */}
      <section id="dual-personas" className="py-16 sm:py-20 bg-white border-b border-[#e2e8e0] px-4 sm:px-6">
        <div className="max-w-[1360px] mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d8e2ff] border border-[#adc6ff] text-[#002b75] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Dual Stakeholder Portals</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#191c1a] tracking-tight">
              Two Tailored Experiences in One Platform
            </h2>
            <p className="text-xs sm:text-base text-[#404943] max-w-xl mx-auto mt-2">
              Toggle between the Enforcement Desk for government officers and Transparency Portal for citizens.
            </p>
          </div>

          {/* Interactive Persona Selector Buttons */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 bg-[#f2f4f0] rounded-2xl border border-[#bfc9c1]/60">
              <button
                onClick={() => handlePersonaToggle('inspector')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activePersonaTab === 'inspector'
                    ? 'bg-[#0f5238] text-white shadow-sm'
                    : 'text-[#525e56] hover:text-[#191c1a]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">shield</span>
                <span>Legal Metrology Inspector</span>
              </button>
              <button
                onClick={() => handlePersonaToggle('consumer')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activePersonaTab === 'consumer'
                    ? 'bg-[#0058be] text-white shadow-sm'
                    : 'text-[#525e56] hover:text-[#191c1a]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Citizen Consumer</span>
              </button>
            </div>
          </div>

          {/* Persona Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
              activePersonaTab === 'inspector'
                ? 'bg-[#f0fdf4] border-[#95d4b3]'
                : 'bg-[#eff6ff] border-[#adc6ff]'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold shadow-sm ${
                  activePersonaTab === 'inspector' ? 'bg-[#0f5238]' : 'bg-[#0058be]'
                }`}>
                  <span className="material-symbols-outlined text-[24px]">
                    {activePersonaTab === 'inspector' ? 'gavel' : 'support_agent'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#191c1a]">
                    {activePersonaTab === 'inspector' ? 'Enforcement Officer Desk' : 'Informed Citizen Consumer'}
                  </h3>
                  <span className="text-xs text-[#707973]">
                    {activePersonaTab === 'inspector' ? 'Empowering field officers under Section 18 & 36' : 'Protecting consumer rights under CPA 2019'}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#191c1a] mb-6">
                {activePersonaTab === 'inspector' ? (
                  <>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#0f5238] text-[18px]">check_circle</span>
                      <span><strong>Section 36 Compounding Calculator:</strong> Instant penalty estimation (₹25,000 / ₹50,000).</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#0f5238] text-[18px]">check_circle</span>
                      <span><strong>Statutory Form A Notice Generator:</strong> Auto-draft show-cause memo with digital signature.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#0f5238] text-[18px]">check_circle</span>
                      <span><strong>Schedule II Numeral Height Audit:</strong> Camera bounding box checks minimum mm requirement.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#0f5238] text-[18px]">check_circle</span>
                      <span><strong>State Enforcement Archive:</strong> Offline cryptographic mirror of all seized batches.</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#0058be] text-[18px]">check_circle</span>
                      <span><strong>National Consumer Helpline (NCH 1915):</strong> 1-Click prefilled grievance filing.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#0058be] text-[18px]">check_circle</span>
                      <span><strong>Shrinkflation &amp; USP Detector:</strong> Reveals hidden pack downsizing and exact cost per 100g.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#0058be] text-[18px]">check_circle</span>
                      <span><strong>Additive &amp; Ingredient Transparency:</strong> Plain English explanation of additives.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#0058be] text-[18px]">check_circle</span>
                      <span><strong>WhatsApp Consumer Alert:</strong> Share verified report directly with family &amp; friends.</span>
                    </li>
                  </>
                )}
              </ul>

              <button
                onClick={() => handleActionClick(activePersonaTab)}
                className={`w-full py-3 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer ${
                  activePersonaTab === 'inspector' ? 'bg-[#0f5238] hover:bg-[#2d6a4f]' : 'bg-[#0058be] hover:bg-[#004bb0]'
                }`}
              >
                {isAuthenticated
                  ? `Enter ${activePersonaTab === 'inspector' ? 'Inspector Terminal' : 'Consumer Portal'}`
                  : `Sign in as ${activePersonaTab === 'inspector' ? 'Inspector' : 'Citizen'}`}
              </button>
            </div>

            {/* Persona Visual Preview */}
            <div className="bg-[#111827] text-white p-6 sm:p-7 rounded-3xl shadow-xl font-mono text-xs border border-gray-800">
              <div className="flex justify-between items-center pb-3 border-gray-800 text-gray-400 text-[11px] border-b">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activePersonaTab === 'inspector' ? 'bg-emerald-400' : 'bg-sky-400'}`}></span>
                  {activePersonaTab === 'inspector' ? 'STATE METROLOGY LEDGER #889021' : 'CITIZEN SCANNER INTERFACE'}
                </span>
                <span>STATUS: OPERATIONAL</span>
              </div>
              <div className="py-4 space-y-2 text-gray-300 text-[11.5px]">
                <div>› TARGET: {selectedDemoProduct.name}</div>
                <div>› CATEGORY: {selectedDemoProduct.category}</div>
                <div>› BARCODE: {selectedDemoProduct.barcode}</div>
                <div>› RULE 6(1) AUDIT: <span className="text-emerald-400 font-bold">{selectedDemoProduct.overallVerdict}</span></div>
                <div>› {activePersonaTab === 'inspector' ? 'COMPOUNDING PENALTY: ₹25,000 (Sec 36)' : 'NCH GRIEVANCE STATUS: READY (CPA 2019)'}</div>
                <div>› CRYPTOGRAPHIC HASH: sha256:{selectedDemoProduct.id.slice(0, 8)}...889f01</div>
              </div>
              <div className="pt-2 border-t border-gray-800 text-right text-[10px] text-gray-500">
                LEGAL METROLOGY CORE SYSTEM
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STATUTORY RULE 6(1) MANDATORY DECLARATIONS CHECKLIST */}
      <section id="rule-6" className="py-16 sm:py-20 px-4 sm:px-6 max-w-[1360px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dcfce7] border border-[#95d4b3] text-[#0f5238] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Statutory Legal Framework</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#191c1a] tracking-tight">
            The 8 Mandatory Declarations Audited Under Rule 6(1)
          </h2>
          <p className="text-xs sm:text-base text-[#404943] max-w-xl mx-auto mt-2">
            Every pre-packaged commodity in India must carry these 8 declarations under Section 18.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { rule: 'Rule 6(1)(a)', name: 'Name & Address', desc: 'Manufacturer, Packer, or Importer identification with full address.' },
            { rule: 'Rule 6(1)(b)', name: 'Generic Commodity Name', desc: 'Common or generic name of commodity contained in the package.' },
            { rule: 'Rule 6(1)(c)', name: 'Net Quantity', desc: 'Standard metric units (g, kg, ml, l) with Schedule II minimum font height.' },
            { rule: 'Rule 6(1)(d)', name: 'Month & Year of Mfg', desc: 'Date of packing/manufacture and Best Before / Expiry date.' },
            { rule: 'Rule 6(1)(e)', name: 'MRP (Inclusive of Taxes)', desc: 'Maximum Retail Price rounded with all statutory taxes included.' },
            { rule: 'Rule 6(1)(s)', name: 'Unit Sale Price (USP)', desc: 'Mandatory price per gram/ml to prevent deceptive packaging.' },
            { rule: 'Rule 6(1)(f)', name: 'Consumer Care Details', desc: 'Name, address, email & phone number of grievance officer.' },
            { rule: 'Rule 6(1)(g)', name: 'Country of Origin', desc: 'Mandatory origin statement for all domestic and imported goods.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/50 shadow-2xs">
              <span className="text-[10px] font-mono font-bold text-[#0f5238] bg-[#dcfce7] px-2 py-0.5 rounded">
                {item.rule}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-[#191c1a] mt-2 mb-1">{item.name}</h4>
              <p className="text-xs text-[#707973] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PROBLEM STATEMENT IN INDIA (Market Impact) */}
      <section id="problem" className="py-16 sm:py-20 bg-white border-t border-[#e2e8e0] px-4 sm:px-6">
        <div className="max-w-[1360px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>The Reality of Indian Retail Markets</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#191c1a] tracking-tight">
            Why 1.4 Billion Indian Consumers Need TRUVA Today
          </h2>
          <p className="text-xs sm:text-base text-[#404943] max-w-2xl mx-auto mt-2 mb-10">
            Millions of packaged products in Kirana stores and supermarkets violate statutory rules every day without detection.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Problem 1 */}
            <div className="bg-[#f8faf6] p-6 rounded-3xl border border-[#bfc9c1]/60 shadow-xs hover:border-[#ba1a1a] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">trending_down</span>
              </div>
              <h3 className="font-extrabold text-base text-[#191c1a] mb-1.5">Rampant Shrinkflation</h3>
              <p className="text-xs text-[#404943] leading-relaxed">
                Companies quietly reduce pack sizes from 100g to 85g while keeping the ₹10 price tag intact, violating <strong>Rule 6(1)(s) Unit Sale Price</strong> declarations.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-[#f8faf6] p-6 rounded-3xl border border-[#bfc9c1]/60 shadow-xs hover:border-[#ba1a1a] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">text_fields</span>
              </div>
              <h3 className="font-extrabold text-base text-[#191c1a] mb-1.5">Microscopic Font Tricks</h3>
              <p className="text-xs text-[#404943] leading-relaxed">
                Mandatory declarations like Net Weight, Expiry, and Ingredients are printed in unreadable 1mm fonts to evade consumer scrutiny (violating <strong>Schedule II</strong>).
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-[#f8faf6] p-6 rounded-3xl border border-[#bfc9c1]/60 shadow-xs hover:border-[#ba1a1a] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">balance</span>
              </div>
              <h3 className="font-extrabold text-base text-[#191c1a] mb-1.5">3,500 Inspectors vs 1.4B</h3>
              <p className="text-xs text-[#404943] leading-relaxed">
                Only ~3,500 enforcement officers exist for over 12 Million retail shops in India. Manual physical inspections cannot scale without automated AI vision reticles.
              </p>
            </div>

            {/* Problem 4 */}
            <div className="bg-[#f8faf6] p-6 rounded-3xl border border-[#bfc9c1]/60 shadow-xs hover:border-[#ba1a1a] transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <h3 className="font-extrabold text-base text-[#191c1a] mb-1.5">No Direct Redressal Bridge</h3>
              <p className="text-xs text-[#404943] leading-relaxed">
                Consumers rarely know their statutory rights under <strong>Consumer Protection Act 2019</strong> or how to lodge 1-click grievances with National Consumer Helpline (NCH 1915).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. STATS IMPACT BANNER */}
      <section className="py-12 bg-gradient-to-r from-[#0f5238] via-[#1b4332] to-[#002b75] text-white px-4 sm:px-6">
        <div className="max-w-[1360px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-emerald-300">1.2s</div>
            <div className="text-xs sm:text-sm text-gray-200 mt-1 font-semibold">Audit Scan Speed</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-amber-300">₹25,000+</div>
            <div className="text-xs sm:text-sm text-gray-200 mt-1 font-semibold">Section 36 Penalty Engine</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-sky-300">100%</div>
            <div className="text-xs sm:text-sm text-gray-200 mt-1 font-semibold">Offline Edge Mirror</div>
          </div>
          <div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight text-white">NCH 1915</div>
            <div className="text-xs sm:text-sm text-gray-200 mt-1 font-semibold">Direct Citizen Redressal</div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-12 bg-white border-t border-[#e2e8e0] px-4 sm:px-6 text-xs text-[#707973]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0f5238] flex items-center justify-center text-white font-bold text-xs">
              T
            </div>
            <span className="font-extrabold text-sm text-[#191c1a]">TRUVA Legal Metrology Platform</span>
            <span>• Ministry of Consumer Affairs Initiative</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Legal Metrology Act, 2009 (Act No. 1 of 2010)</span>
            <span>• ISO/IEC 17025 Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
