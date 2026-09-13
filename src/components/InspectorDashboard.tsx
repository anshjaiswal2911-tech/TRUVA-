import React from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { triggerSelectionHaptic } from '../services/haptics';
import { MOCK_INSPECTION_STATS } from '../data/mockProducts';

interface InspectorDashboardProps {
  onScanClick: () => void;
  onSelectProduct: (product: Product) => void;
  recentProducts: Product[];
  onStatesClick: () => void;
}

export const InspectorDashboard: React.FC<InspectorDashboardProps> = ({
  onScanClick,
  onSelectProduct,
  recentProducts,
  onStatesClick,
}) => {
  const { profile } = useAuth();
  const officerName = profile?.fullName || 'Rajesh Sharma';
  const badgeId = profile?.badgeNumber || '#889021';
  const jurisdiction = profile?.jurisdiction || 'Zone 4 (Central Metrology Division)';

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* 1. OFFICER TERMINAL BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0f5238] via-[#1b4332] to-[#092b1d] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Legal Metrology Act, 2009 • Section 18 &amp; 36 Enforcement Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
              <span>Inspector {officerName}</span>
              <span className="text-xs font-mono font-bold bg-amber-400 text-black px-2.5 py-1 rounded-lg">
                {badgeId}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Jurisdiction: <strong>{jurisdiction}</strong>. Real-time edge perception engine for automated commodity inspections, Rule 6(1) compliance audits, and Section 36 statutory seizure dossiers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                triggerSelectionHaptic();
                onScanClick();
              }}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
              <span>Statutory Inspection</span>
            </button>

            <button
              onClick={() => {
                triggerSelectionHaptic();
                onStatesClick();
              }}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-emerald-400/30 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">policy</span>
              <span>State Rules Registry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATUTORY ENFORCEMENT METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/60 shadow-xs">
          <div className="text-xs text-[#707973] font-bold uppercase tracking-wider mb-1">
            Total Audits Logged
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#191c1a]">
            {MOCK_INSPECTION_STATS.totalScans.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check</span>
            <span>{MOCK_INSPECTION_STATS.compliantCount.toLocaleString()} Compliant</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/60 shadow-xs">
          <div className="text-xs text-[#707973] font-bold uppercase tracking-wider mb-1">
            Violations Flagged
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600">
            {MOCK_INSPECTION_STATS.violationCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-red-700 font-semibold mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>Sec 36 Show-Cause Ready</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/60 shadow-xs">
          <div className="text-xs text-[#707973] font-bold uppercase tracking-wider mb-1">
            Compounded Penalties
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0f5238]">
            {MOCK_INSPECTION_STATS.totalPenaltiesCompounded}
          </div>
          <div className="text-[11px] text-[#707973] font-semibold mt-1">
            National Enforcement Pool
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c1]/60 shadow-xs">
          <div className="text-xs text-[#707973] font-bold uppercase tracking-wider mb-1">
            Active Zone Officers
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0058be]">
            {MOCK_INSPECTION_STATS.activeOfficersOnline}
          </div>
          <div className="text-[11px] text-[#0058be] font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cryptographic Ledger Synced</span>
          </div>
        </div>
      </div>

      {/* 3. CASE DOSSIERS & SEIZURE LEDGER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#191c1a] tracking-tight">
              Active Seizure Dossiers &amp; Statutory Audits
            </h2>
            <p className="text-xs text-[#707973]">
              All items authenticated with SHA-256 tamper-proof timestamps and laboratory measurement differentials.
            </p>
          </div>
          <button
            onClick={onScanClick}
            className="text-xs font-bold text-[#0f5238] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Audit New Commodity</span>
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

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
                <div className="relative w-full h-44 rounded-xl bg-gray-900 overflow-hidden mb-3">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-emerald-400 border border-emerald-500/30">
                    {prod.inspectionId || 'INSP-2026'}
                  </div>
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-xs ${
                    prod.overallVerdict === 'Compliant'
                      ? 'bg-emerald-600 text-white'
                      : prod.overallVerdict === 'Potential Violation'
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-500 text-black'
                  }`}>
                    {prod.overallVerdict}
                  </span>
                </div>

                <div className="text-[10.5px] font-mono font-bold text-[#0f5238] uppercase tracking-wider mb-1">
                  BARCODE: {prod.barcode}
                </div>
                <h3 className="font-extrabold text-sm text-[#191c1a] group-hover:text-[#0f5238] transition-colors line-clamp-1">
                  {prod.name}
                </h3>
                <p className="text-xs text-[#707973] line-clamp-1 mt-0.5">
                  Packer: {prod.manufacturerName || 'Verified Manufacturer'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e2e8e0] flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-sm text-[#191c1a]">{prod.mrp || '₹140.00'}</span>
                  <span className="text-[10px] text-[#707973] ml-1">({prod.quantity || prod.volume})</span>
                </div>
                <span className="text-[#0f5238] font-bold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Dossier</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
