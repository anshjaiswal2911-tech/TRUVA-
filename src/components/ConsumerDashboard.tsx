import React from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { triggerSelectionHaptic } from '../services/haptics';

interface ConsumerDashboardProps {
  onScanClick: () => void;
  onSelectProduct: (product: Product) => void;
  recentProducts: Product[];
  onCompareClick: () => void;
}

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({
  onScanClick,
  onSelectProduct,
  recentProducts,
  onCompareClick,
}) => {
  const { profile } = useAuth();
  const userName = profile?.fullName || 'Verified Consumer';

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* 1. HERO CITIZEN WELCOME BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#004bb0] via-[#0058be] to-[#1e40af] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping"></span>
              <span>National Consumer Rights &amp; Metrology Shield</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 max-w-xl">
              Audit any grocery or packaged commodity instantly under the <strong>Legal Metrology Rules, 2011</strong>. Detect hidden shrinkflation, verify MRP taxes, and file 1-click grievances with National Consumer Helpline (NCH 1915).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                triggerSelectionHaptic();
                onScanClick();
              }}
              className="px-6 py-3.5 bg-white hover:bg-sky-50 text-[#0058be] rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              <span>Scan Any Package</span>
            </button>

            <button
              onClick={() => {
                triggerSelectionHaptic();
                onCompareClick();
              }}
              className="px-5 py-3.5 bg-sky-900/50 hover:bg-sky-900/80 border border-white/20 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
              <span>Compare Packs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CITIZEN METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#0f5238] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#191c1a]">8-Point</div>
            <div className="text-xs text-[#707973] font-medium">Rule 6(1) Label Audit</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">trending_down</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#191c1a]">Shrinkflation</div>
            <div className="text-xs text-[#707973] font-medium">Auto Pack Reduction Alert</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0058be] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">sell</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#191c1a]">Unit Sale Price</div>
            <div className="text-xs text-[#707973] font-medium">Exact Cost Per 100g / 100ml</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/60 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">support_agent</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#191c1a]">NCH 1915</div>
            <div className="text-xs text-[#707973] font-medium">Direct National Redressal</div>
          </div>
        </div>
      </div>

      {/* 3. RECENT COMMODITY AUDITS & SCAN SAMPLES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#191c1a] tracking-tight">
              Recently Audited Commodities
            </h2>
            <p className="text-xs text-[#707973]">
              Click on any product to inspect detailed legal declarations, ingredients &amp; evidence.
            </p>
          </div>
          <button
            onClick={onScanClick}
            className="text-xs font-bold text-[#0058be] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Scan New Item</span>
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#bfc9c1]/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3.5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0058be] flex items-center justify-center border border-sky-100">
              <span className="material-symbols-outlined text-[30px]">qr_code_scanner</span>
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-bold text-[#191c1a]">Your Scan History is Clean</h3>
              <p className="text-xs text-[#707973] leading-relaxed">
                You haven&apos;t scanned any packaged commodities yet on this account. Tap &quot;Scan Any Package&quot; to inspect your first product.
              </p>
            </div>
            <button
              onClick={() => {
                triggerSelectionHaptic();
                onScanClick();
              }}
              className="mt-1 px-5 py-2.5 bg-[#0058be] hover:bg-[#004bb0] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span>Scan Your First Product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  triggerSelectionHaptic();
                  onSelectProduct(prod);
                }}
                className="bg-white rounded-2xl border border-[#bfc9c1]/60 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-44 rounded-xl bg-gray-100 overflow-hidden mb-3">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shadow-xs ${
                      prod.overallVerdict === 'Compliant'
                        ? 'bg-emerald-600 text-white'
                        : prod.overallVerdict === 'Potential Violation'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-500 text-black'
                    }`}>
                      {prod.overallVerdict}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-[#707973] uppercase tracking-wider mb-1">
                    {prod.category}
                  </div>
                  <h3 className="font-extrabold text-sm text-[#191c1a] group-hover:text-[#0058be] transition-colors line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-[#707973] line-clamp-1 mt-0.5">
                    {prod.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e2e8e0] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-sm text-[#191c1a]">{prod.mrp || '₹140.00'}</span>
                    <span className="text-[10px] text-[#707973] ml-1">({prod.quantity || prod.volume})</span>
                  </div>
                  <span className="text-[#0058be] font-bold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>View Details</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. HELPFUL CONSUMER RIGHTS & REDRESSAL CARD */}
      <div className="bg-white rounded-3xl border border-[#bfc9c1]/60 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] text-[#0058be] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <div>
            <h3 className="font-black text-base sm:text-lg text-[#191c1a]">
              Consumer Protection Act (CPA) 2019 Rights
            </h3>
            <p className="text-xs text-[#404943] max-w-xl mt-1">
              Indian consumers have the statutory <em>Right to be Informed</em> about quality, quantity, purity, and standard of goods under Section 2(9). Report violations directly to National Consumer Helpline 1915.
            </p>
          </div>
        </div>

        <a
          href="https://consumerhelpline.gov.in"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 bg-[#0058be] hover:bg-[#004bb0] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs"
        >
          <span>Visit National Consumer Helpline</span>
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
      </div>
    </div>
  );
};
