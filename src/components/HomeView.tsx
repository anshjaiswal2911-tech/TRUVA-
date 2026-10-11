import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { triggerTabHaptic, triggerSelectionHaptic } from '../services/haptics';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  recentProducts: Product[];
  onScanClick: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickAccessFilter: (category: string) => void;
  isOffline?: boolean;
  isMobileMode?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  recentProducts,
  onScanClick,
  onSelectProduct,
  onQuickAccessFilter,
  isOffline = false,
  isMobileMode = false,
}) => {
  const { isInspector, profile } = useAuth();

  const verifiedCount = recentProducts.filter((p) => p.overallVerdict === 'Compliant').length;
  const reviewCount = recentProducts.filter((p) => p.overallVerdict === 'Requires Verification' || p.overallVerdict === 'Potential Violation').length;

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterVerdict, setFilterVerdict] = React.useState<'all' | 'compliant' | 'review'>('all');

  const filteredProducts = recentProducts.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery)) ||
      (p.inspectionId && p.inspectionId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterVerdict === 'compliant') return p.overallVerdict === 'Compliant';
    if (filterVerdict === 'review') return p.overallVerdict !== 'Compliant';
    return true;
  });

  return (
    <div className="flex-1 w-full max-w-[1280px] xl:max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 pb-28 sm:pb-12">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-[#fff8f6] border border-[#ffdad6] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">cloud_off</span>
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-[#191c1a] block">
                Offline Mode Active
              </span>
              <span className="text-xs text-[#404943]">
                Serving from local storage cache. All recent inspection dossiers are accessible offline.
              </span>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shadow-xs ${isInspector ? 'bg-[#dcfce7] text-[#0f5238] border-[#95d4b3]' : 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'}`}>
            {recentProducts.length} Scans Cached
          </span>
        </div>
      )}

      {/* =========================================================================
          1. CONSUMER / CITIZEN DASHBOARD (Blue/Emerald Consumer Rights Mode)
         ========================================================================= */}
      {!isInspector ? (
        <>
          {/* Consumer Hero Banner */}
          <section className={`bg-gradient-to-br from-white via-[#f0f7ff]/70 to-[#e8f2ff] border border-[#bfdbfe]/70 rounded-3xl p-5 sm:p-8 shadow-[0_2px_12px_rgba(29,78,216,0.04)] flex flex-col ${isMobileMode ? '' : 'lg:flex-row lg:items-center lg:justify-between'} gap-5 sm:gap-6`}>
            <div className="flex flex-col gap-2.5 sm:gap-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#eff6ff] border border-[#bfdbfe] px-3 py-1 rounded-full w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#1d4ed8] uppercase tracking-wider">
                  🇮🇳 National Consumer Rights &amp; Label Verification Portal
                </span>
              </div>

              <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0f172a] leading-[1.15]">
                Smart Product &amp; <span className="text-[#1d4ed8]">Fair Price Intelligence</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-[#475569] leading-relaxed max-w-xl">
                Scan packaged food, FMCG, and commodities to verify printed MRPs against hidden inflation, detect missing manufacturing dates, and verify Unit Sale Price (USP) accuracy.
              </p>

              <div className="pt-2 w-full">
                <button
                  onClick={() => {
                    triggerTabHaptic();
                    onScanClick();
                  }}
                  className="w-full sm:w-auto bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs sm:text-sm rounded-xl px-5 py-3 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px]" data-fill="1">qr_code_scanner</span>
                  <span>Scan Packaged Product</span>
                </button>
              </div>
            </div>

            {/* Consumer Quick Metrics */}
            <div className={`grid grid-cols-2 ${isMobileMode ? 'grid-cols-2' : 'sm:grid-cols-3 lg:grid-cols-1 lg:w-64 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6'} gap-2.5 sm:gap-3 shrink-0 border-t border-[#bfdbfe]/50 pt-4`}>
              <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                  My Scanned Products
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#0f172a] mt-0.5">
                  {recentProducts.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#1d4ed8] font-semibold mt-0.5">
                  Citizen verified
                </span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                  Fairly Priced &amp; Safe
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#15803d] mt-0.5">
                  {verifiedCount}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#16a34a] font-medium mt-0.5">
                  Statutory compliant
                </span>
              </div>

              <div className={`bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col ${isMobileMode ? 'col-span-2' : 'col-span-2 sm:col-span-1'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                  Price / Label Warnings
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#b91c1c] mt-0.5">
                  {reviewCount}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#dc2626] font-medium mt-0.5">
                  Actionable flags
                </span>
              </div>
            </div>
          </section>

          {/* Consumer Action Tools Grid */}
          <section className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#1d4ed8] rounded-full"></span>
                <h2 className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
                  Citizen Consumer Tools &amp; Actions
                </h2>
              </div>
              <span className="text-xs text-[#64748b] font-medium">Jago Grahak Jago</span>
            </div>

            <div className={`grid ${isMobileMode ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-2.5 sm:gap-4`}>
              {/* Tool 1: Instant Scan */}
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  onScanClick();
                }}
                className="bg-white border border-[#e2e8f0] hover:border-[#1d4ed8]/50 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 hover:-translate-y-1 transition-all duration-200 text-center shadow-xs hover:shadow-md group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#0f172a] group-hover:text-[#1d4ed8] transition-colors">
                    Check Any Label
                  </span>
                  <span className="text-[11px] text-[#64748b] hidden sm:block mt-0.5">
                    Scan front &amp; back packaging
                  </span>
                </div>
              </button>

              {/* Tool 2: Fair Price & Unit Price (USP) */}
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  onQuickAccessFilter('requires_verification');
                }}
                className="bg-white border border-[#e2e8f0] hover:border-[#fde68a] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 hover:-translate-y-1 transition-all duration-200 text-center shadow-xs hover:shadow-md group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] border border-[#fde68a] text-[#b45309] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">price_check</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#0f172a] group-hover:text-[#b45309] transition-colors">
                    Fair Price &amp; USP
                  </span>
                  <span className="text-[11px] text-[#64748b] hidden sm:block mt-0.5">
                    Price per 100g / 100ml
                  </span>
                </div>
              </button>

              {/* Tool 3: Consumer Grievance NCH */}
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  if (recentProducts.length > 0) {
                    onSelectProduct(recentProducts[0]);
                  } else {
                    onScanClick();
                  }
                }}
                className="bg-white border border-[#e2e8f0] hover:border-[#fecaca] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 hover:-translate-y-1 transition-all duration-200 text-center shadow-xs hover:shadow-md group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">gavel</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#0f172a] group-hover:text-[#dc2626] transition-colors">
                    NCH 1915 Helpline
                  </span>
                  <span className="text-[11px] text-[#64748b] hidden sm:block mt-0.5">
                    File 1-Click Consumer Complaint
                  </span>
                </div>
              </button>

              {/* Tool 4: Consumer Care Directory */}
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  onQuickAccessFilter('history');
                }}
                className="bg-white border border-[#e2e8f0] hover:border-[#95d4b3] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 hover:-translate-y-1 transition-all duration-200 text-center shadow-xs hover:shadow-md group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">contact_support</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#0f172a] group-hover:text-[#15803d] transition-colors">
                    Manufacturer Care
                  </span>
                  <span className="text-[11px] text-[#64748b] hidden sm:block mt-0.5">
                    Statutory grievance contacts
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* Citizen Consumer Rights Awareness Strip */}
          <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[20px] text-[#1d4ed8]">lightbulb</span>
              <h3 className="text-sm font-bold text-[#0f172a]">Your Statutory Consumer Rights under Rule 6</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                <span className="text-xs font-bold text-[#0f172a] block">🏷️ All-Inclusive MRP</span>
                <span className="text-[11px] text-[#64748b] mt-0.5 block">No seller or platform can charge higher than the printed MRP.</span>
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                <span className="text-xs font-bold text-[#0f172a] block">⚖️ Unit Sale Price (USP)</span>
                <span className="text-[11px] text-[#64748b] mt-0.5 block">Packages must state ₹/g or ₹/ml so you can compare true value.</span>
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                <span className="text-xs font-bold text-[#0f172a] block">📅 Clear Expiry &amp; Mfg</span>
                <span className="text-[11px] text-[#64748b] mt-0.5 block">Date of manufacture and Best Before must be clearly legible.</span>
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
                <span className="text-xs font-bold text-[#0f172a] block">📞 Customer Support</span>
                <span className="text-[11px] text-[#64748b] mt-0.5 block">Company name, full address, phone &amp; email are legally mandatory.</span>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* =========================================================================
            2. INSPECTOR / STATUTORY ENFORCEMENT DESK (Government Forest Green)
           ========================================================================= */
        <>
          {/* Inspector Hero Banner */}
          <section className={`bg-gradient-to-br from-white via-[#f2f5f1] to-[#e7ece5] border border-[#bfc9c1]/60 rounded-3xl p-5 sm:p-8 shadow-[0_2px_12px_rgba(15,82,56,0.04)] flex flex-col ${isMobileMode ? '' : 'lg:flex-row lg:items-center lg:justify-between'} gap-5 sm:gap-6`}>
            <div className="flex flex-col gap-2.5 sm:gap-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#dcfce7] border border-[#95d4b3]/70 px-3 py-1 rounded-full w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0f5238] animate-pulse"></span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0f5238] uppercase tracking-wider">
                  🏛️ Legal Metrology Division • Statutory Enforcement Terminal
                </span>
              </div>

              <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#191c1a] leading-[1.15]">
                Packaged Commodity <span className="text-[#0f5238]">Enforcement Terminal</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-[#404943] leading-relaxed max-w-xl">
                Automated 8-point statutory declaration audit under Rule 6, metric net quantity precision checks, Principal Display Panel (PDP) font ratio analysis, and Section 18/36 compounding penalty calculation.
              </p>

              <div className="pt-2 w-full">
                <button
                  onClick={() => {
                    triggerTabHaptic();
                    onScanClick();
                  }}
                  className="w-full sm:w-auto bg-[#0f5238] hover:bg-[#184835] text-white font-bold text-xs sm:text-sm rounded-xl px-5 py-3 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[19px]" data-fill="1">document_scanner</span>
                  <span>Start Statutory Audit</span>
                </button>
              </div>
            </div>

            {/* Inspector Statutory KPI Matrix */}
            <div className={`grid grid-cols-2 ${isMobileMode ? 'grid-cols-2' : 'sm:grid-cols-3 lg:grid-cols-1 lg:w-64 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6'} gap-2.5 sm:gap-3 shrink-0 border-t border-[#bfc9c1]/50 pt-4`}>
              <div className="bg-white p-3 rounded-2xl border border-[#bfc9c1]/40 shadow-xs flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#707973]">
                  Enforcement Dossiers
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#191c1a] mt-0.5">
                  {recentProducts.length}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#0f5238] font-semibold mt-0.5">
                  Zone 4 Division Roster
                </span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#bfc9c1]/40 shadow-xs flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#707973]">
                  Rule 6 Compliant Pass
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#0f5238] mt-0.5">
                  {verifiedCount}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#16a34a] font-medium mt-0.5">
                  Full statutory clearance
                </span>
              </div>

              <div className={`bg-white p-3 rounded-2xl border border-[#bfc9c1]/40 shadow-xs flex flex-col ${isMobileMode ? 'col-span-2' : 'col-span-2 sm:col-span-1'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#707973]">
                  Section 36 Penalty Action
                </span>
                <span className="text-lg sm:text-2xl font-black text-[#93000a] mt-0.5">
                  {reviewCount}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#ba1a1a] font-medium mt-0.5">
                  ₹{(reviewCount * 25000).toLocaleString('en-IN')} Est. Compounding
                </span>
              </div>
            </div>
          </section>

          {/* Inspector Tactical Operations Grid */}
          <section className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#0f5238] rounded-full"></span>
                <h2 className="text-base sm:text-lg font-bold text-[#191c1a] tracking-tight">
                  Officer Tactical Operations &amp; Statutory Actions
                </h2>
              </div>
              <span className="text-xs text-[#707973] font-medium">Authorized Enforcement</span>
            </div>

            <div className={`grid ${isMobileMode ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-2.5 sm:gap-4`}>
              {/* Action 1: New Audit */}
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  onScanClick();
                }}
                className="bg-white border border-[#bfc9c1]/50 hover:border-[#0f5238]/60 rounded-2xl p-3.5 sm:p-5 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-200 text-center shadow-xs hover:shadow-md group cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#dcfce7] border border-[#95d4b3]/60 text-[#0f5238] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[22px] sm:text-[24px]">gavel</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#191c1a] group-hover:text-[#0f5238] transition-colors">
                    Statutory Audit
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#707973] hidden sm:block mt-0.5">
                    Execute Rule 6(1) audit
                  </span>
                </div>
              </button>

              {/* Action 2: Seizure Queue */}
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  onQuickAccessFilter('requires_verification');
                }}
                className="bg-white border border-[#bfc9c1]/50 hover:border-[#fde68a] rounded-2xl p-3.5 sm:p-5 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-200 text-center shadow-xs hover:shadow-md group cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#fef3c7] border border-[#fde68a] text-[#92400e] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[22px] sm:text-[24px]">policy</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#191c1a] group-hover:text-[#92400e] transition-colors">
                    Non-Compliance
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#707973] hidden sm:block mt-0.5">
                    Show cause &amp; seizure
                  </span>
                </div>
              </button>

              {/* Action 3: Notice Generator */}
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  if (recentProducts.length > 0) {
                    onSelectProduct(recentProducts[0]);
                  } else {
                    onScanClick();
                  }
                }}
                className="bg-white border border-[#bfc9c1]/50 hover:border-[#adc6ff] rounded-2xl p-3.5 sm:p-5 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-200 text-center shadow-xs hover:shadow-md group cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#d8e2ff] border border-[#adc6ff] text-[#002b75] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[22px] sm:text-[24px]">description</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#191c1a] group-hover:text-[#0058be] transition-colors">
                    Form A Notice Draft
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#707973] hidden sm:block mt-0.5">
                    Section 18 inspection memo
                  </span>
                </div>
              </button>

              {/* Action 4: Court Evidence Export */}
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  onQuickAccessFilter('reports');
                }}
                className="bg-white border border-[#bfc9c1]/50 hover:border-[#0f5238]/60 rounded-2xl p-3.5 sm:p-5 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-200 text-center shadow-xs hover:shadow-md group cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#dcfce7] border border-[#95d4b3]/60 text-[#0f5238] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[22px] sm:text-[24px]">fact_check</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-[#191c1a] group-hover:text-[#0f5238] transition-colors">
                    Court Evidence Dossier
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#707973] hidden sm:block mt-0.5">
                    Section 36 digital audit log
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* Legal Metrology Statutory Rule Matrix */}
          <section className="bg-white border border-[#bfc9c1]/60 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[20px] text-[#0f5238]">balance</span>
              <h3 className="text-sm font-bold text-[#191c1a]">Statutory Checklist: Rule 6(1) Mandatory Declarations</h3>
            </div>
            <div className={`grid ${isMobileMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-2.5 sm:gap-3`}>
              <div className="bg-[#f8faf6] p-3 rounded-xl border border-[#bfc9c1]/40">
                <span className="text-xs font-bold text-[#191c1a] block">Rule 6(1)(a): Mfr Identity</span>
                <span className="text-[11px] text-[#525e56] mt-0.5 block">Name &amp; complete address of manufacturer/packer/importer.</span>
              </div>
              <div className="bg-[#f8faf6] p-3 rounded-xl border border-[#bfc9c1]/40">
                <span className="text-xs font-bold text-[#191c1a] block">Rule 6(1)(b): Generic Name</span>
                <span className="text-[11px] text-[#525e56] mt-0.5 block">Common/generic name of commodity on PDP.</span>
              </div>
              <div className="bg-[#f8faf6] p-3 rounded-xl border border-[#bfc9c1]/40">
                <span className="text-xs font-bold text-[#191c1a] block">Rule 6(1)(c): Net Quantity</span>
                <span className="text-[11px] text-[#525e56] mt-0.5 block">Standard units (g, kg, ml, l) adhering to Schedule II area ratio.</span>
              </div>
              <div className="bg-[#f8faf6] p-3 rounded-xl border border-[#bfc9c1]/40">
                <span className="text-xs font-bold text-[#191c1a] block">Rule 6(1)(e): MRP &amp; USP</span>
                <span className="text-[11px] text-[#525e56] mt-0.5 block">MRP inclusive of all taxes + Unit Sale Price (USP) mandatory.</span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* =========================================================================
          3. COMMON RECENT RECORDS LEDGER (Filtered & Tailored for Role)
         ========================================================================= */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-4 rounded-full ${isInspector ? 'bg-[#0f5238]' : 'bg-[#1d4ed8]'}`}></span>
            <h2 className="text-base sm:text-lg font-bold text-[#191c1a] tracking-tight">
              {isInspector ? 'Recent Statutory Inspection Dossiers' : 'My Recent Scanned Commodities'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Filter Chips */}
            <div className="flex items-center gap-1.5 bg-[#f4f7f2] p-1 rounded-xl border border-[#bfc9c1]/40">
              <button
                onClick={() => setFilterVerdict('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterVerdict === 'all'
                    ? isInspector ? 'bg-white text-[#0f5238] shadow-xs' : 'bg-white text-[#1d4ed8] shadow-xs'
                    : 'text-[#5a6b5f] hover:text-[#191c1a]'
                }`}
              >
                All ({recentProducts.length})
              </button>
              <button
                onClick={() => setFilterVerdict('compliant')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterVerdict === 'compliant'
                    ? 'bg-white text-[#16a34a] shadow-xs'
                    : 'text-[#5a6b5f] hover:text-[#16a34a]'
                }`}
              >
                {isInspector ? 'Compliant' : 'Safe & Fair'} ({verifiedCount})
              </button>
              <button
                onClick={() => setFilterVerdict('review')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filterVerdict === 'review'
                    ? 'bg-white text-[#dc2626] shadow-xs'
                    : 'text-[#5a6b5f] hover:text-[#dc2626]'
                }`}
              >
                {isInspector ? 'Action Req' : 'Alerts'} ({reviewCount})
              </button>
            </div>

            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-xs border ${isInspector ? 'text-[#0f5238] bg-[#dcfce7] border-[#95d4b3]/60' : 'text-[#1d4ed8] bg-[#eff6ff] border-[#bfdbfe]'}`}>
              {filteredProducts.length} items
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl border border-[#bfc9c1]/50 shadow-2xs">
          <span className="material-symbols-outlined text-[#707973] text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isInspector ? "Search dossiers by commodity, manufacturer, batch, or inspection ID..." : "Search scanned products by brand name, barcode, or category..."}
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#191c1a] placeholder-[#707973] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#707973] hover:text-[#191c1a] font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-[#bfc9c1]/50 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-3.5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#f2f4f0] flex items-center justify-center text-[#707973] border border-[#bfc9c1]/40">
              <span className="material-symbols-outlined text-[30px]">inventory_2</span>
            </div>
            <div className="max-w-sm">
              <h3 className="text-sm sm:text-base font-bold text-[#191c1a] mb-1">
                No Matching Scans Found
              </h3>
              <p className="text-xs text-[#404943] leading-relaxed">
                {searchQuery || filterVerdict !== 'all'
                  ? 'Try adjusting your search terms or filter criteria.'
                  : isInspector
                    ? 'Upload or capture commodity packaging label photo to execute automated Rule 6 verification.'
                    : 'Scan any commodity packaging to inspect printed price, ingredients, and manufacturer credentials.'}
              </p>
            </div>
            {(searchQuery || filterVerdict !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterVerdict('all');
                }}
                className={`mt-1 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer ${isInspector ? 'bg-[#0f5238] hover:bg-[#184835]' : 'bg-[#1d4ed8] hover:bg-[#1e40af]'}`}
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className={`flex flex-col ${isMobileMode ? '' : 'lg:grid lg:grid-cols-2'} gap-3 sm:gap-4`}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onSelectProduct(product)}
                isOfflineCached={true}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};