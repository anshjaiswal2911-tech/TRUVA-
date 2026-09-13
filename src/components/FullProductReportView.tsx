import React, { useState } from 'react';
import { Product, DetailedModule } from '../types';
import { StatusBadge } from './StatusBadge';
import { triggerSelectionHaptic } from '../services/haptics';

interface FullProductReportViewProps {
  product: Product;
  onBack: () => void;
  onOpenEvidenceDetail: () => void;
  onCompare: () => void;
}

export const FullProductReportView: React.FC<FullProductReportViewProps> = ({
  product,
  onBack,
  onOpenEvidenceDetail,
  onCompare,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeDrilldown, setActiveDrilldown] = useState<string | null>(null);

  const handleShare = async () => {
    triggerSelectionHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `TRUVA Statutory Dossier - ${product.name}`,
          text: `Verified Legal Metrology inspection dossier for ${product.name}. Overall Verdict: ${product.overallVerdict}.`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(
      `TRUVA Statutory Dossier: ${product.name} (${product.category})\nOverall Verdict: ${product.overallVerdict}\nInspection ID: ${product.inspectionId || 'N/A'}\nBarcode: ${product.barcode}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExport = () => {
    triggerSelectionHaptic();
    window.print();
  };

  const toggleDrilldown = (key: string) => {
    triggerSelectionHaptic();
    setActiveDrilldown(activeDrilldown === key ? null : key);
  };

  return (
    <div className="w-full max-w-[1280px] xl:max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-36">
      {/* Dossier Header Section */}
      <section className="bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row gap-5 sm:gap-6 items-start md:items-center shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden border border-[#bfc9c1]/40 bg-[#f2f4f0] shadow-xs ring-1 ring-black/5">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-[#0f5238] bg-[#dcfce7] px-2.5 py-0.5 rounded-md border border-[#95d4b3]/70">
              {product.inspectionId || 'INS-2026-8841'}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-[#404943] bg-[#f2f4f0] px-2.5 py-0.5 rounded-md border border-[#bfc9c1]/50">
              {product.category}
            </span>
            <StatusBadge status={product.overallVerdict} size="md" />
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-[#191c1a] tracking-tight leading-tight">
            {product.name}
          </h1>

          <p className="text-xs sm:text-sm text-[#404943] mt-1 mb-2.5">{product.subtitle}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#707973]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
              <span className="font-mono text-[11px]">Barcode: {product.barcode}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              <span>Dossier Date: {product.inspectionDate}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
          <div className="bg-[#f8faf6] px-5 py-3 rounded-2xl border border-[#bfc9c1]/50 text-center shadow-xs">
            <div className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-0.5">
              Statutory Verdict
            </div>
            <div
              className={`text-base sm:text-lg font-black tracking-tight ${
                product.overallVerdict.includes('Violation') || product.overallVerdict === 'Discrepancy'
                  ? 'text-[#ba1a1a]'
                  : product.overallVerdict.includes('Verification') || product.overallVerdict === 'Needs Review'
                  ? 'text-[#92400e]'
                  : 'text-[#0f5238]'
              }`}
            >
              {product.overallVerdict}
            </div>
          </div>
        </div>
      </section>

      {/* Overall Summary & Key Findings Grid (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Status Indicators 2x2 Grid */}
        <section className="lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#0f5238] rounded-full"></span>
            <h2 className="text-base sm:text-lg font-bold text-[#191c1a] tracking-tight">Compliance Summary</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Declarations */}
            <div className="bg-white border border-[#bfc9c1]/50 rounded-2xl p-3.5 flex flex-col items-center text-center justify-center min-h-[100px] shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center mb-1.5">
                <span className="material-symbols-outlined text-[20px]" data-fill="1">gavel</span>
              </div>
              <span className="text-[11px] text-[#707973] font-medium">Declarations</span>
              <span className="text-xs font-bold text-[#0f5238] mt-0.5">
                {product.overallSummary?.declarations?.status || product.modules.declarations.status}
              </span>
            </div>

            {/* Net Quantity */}
            <div className="bg-white border border-[#bfc9c1]/50 rounded-2xl p-3.5 flex flex-col items-center text-center justify-center min-h-[100px] shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#fef3c7] text-[#92400e] flex items-center justify-center mb-1.5">
                <span className="material-symbols-outlined text-[20px]" data-fill="1">scale</span>
              </div>
              <span className="text-[11px] text-[#707973] font-medium">Net Quantity</span>
              <span
                className={`text-xs font-bold mt-0.5 ${
                  (product.overallSummary?.netQuantity?.status || product.modules.netQuantity.status).includes('Violation') ||
                  (product.overallSummary?.netQuantity?.status || product.modules.netQuantity.status).includes('Requires')
                    ? 'text-[#ba1a1a]'
                    : 'text-[#0f5238]'
                }`}
              >
                {product.overallSummary?.netQuantity?.status || product.modules.netQuantity.status}
              </span>
            </div>

            {/* MRP & Tax */}
            <div className="bg-white border border-[#bfc9c1]/50 rounded-2xl p-3.5 flex flex-col items-center text-center justify-center min-h-[100px] shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center mb-1.5">
                <span className="material-symbols-outlined text-[20px]" data-fill="1">payments</span>
              </div>
              <span className="text-[11px] text-[#707973] font-medium">MRP &amp; Tax</span>
              <span className="text-xs font-bold text-[#0f5238] mt-0.5">
                {product.overallSummary?.mrpTax?.status || product.modules.mrpTax.status}
              </span>
            </div>

            {/* Evidence */}
            <div 
              onClick={onOpenEvidenceDetail}
              className="bg-white border border-[#bfc9c1]/50 hover:border-[#adc6ff] rounded-2xl p-3.5 flex flex-col items-center text-center justify-center min-h-[100px] shadow-xs cursor-pointer hover:bg-[#f8faf6] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#d8e2ff] text-[#002b75] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]" data-fill="1">assignment</span>
              </div>
              <span className="text-[11px] text-[#707973] font-medium">Rule Evidence</span>
              <span className="text-xs font-bold text-[#002b75] mt-0.5 flex items-center gap-1">
                {product.overallSummary?.evidence?.status || product.modules.evidence.status}
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </span>
            </div>
          </div>
        </section>

        {/* Key Findings List */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#0f5238] rounded-full"></span>
            <h2 className="text-base sm:text-lg font-bold text-[#191c1a] tracking-tight">Key Statutory Findings</h2>
          </div>
          <div className="bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-center min-h-[210px]">
            <ul className="space-y-3">
              {product.keyFindings.map((finding) => (
                <li key={finding.id} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      finding.type === 'compliant'
                        ? 'bg-[#dcfce7] text-[#0f5238]'
                        : finding.type === 'warning'
                        ? 'bg-[#ffdad6] text-[#ba1a1a]'
                        : 'bg-[#d8e2ff] text-[#002b75]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" data-fill="1">
                      {finding.type === 'compliant' ? 'check_circle' : finding.type === 'warning' ? 'warning' : 'info'}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#191c1a] leading-relaxed font-medium">
                    {finding.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="h-px w-full bg-[#bfc9c1]/40 my-2"></div>

      {/* Detailed Module Reports */}
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#0f5238] rounded-full"></span>
          <h2 className="text-base sm:text-xl font-bold text-[#191c1a] tracking-tight">
            Detailed Statutory Verification Modules
          </h2>
        </div>

        {/* 1. Mandatory Declarations Module */}
        <div className="bg-white border border-[#bfc9c1]/50 rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bfc9c1]/40 bg-[#f8faf6]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">gavel</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
                Mandatory Declarations Check (Rule 6(1))
              </h3>
            </div>
            <StatusBadge status={product.modules.declarations.status} size="sm" />
          </div>

          <div className="p-5 sm:p-6 space-y-3.5">
            <div>
              <p className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1">
                Primary Statutory Finding
              </p>
              <p className="text-xs sm:text-sm text-[#191c1a] leading-relaxed font-medium">
                {product.modules.declarations.primaryFinding}
              </p>
            </div>

            {/* Sub-details accordion/table */}
            <div className="pt-1">
              <button
                onClick={() => toggleDrilldown('reg')}
                className="text-xs font-bold text-[#0058be] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{activeDrilldown === 'reg' ? 'Hide Declaration Breakdown' : 'View Full Mandatory Declarations List'}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {activeDrilldown === 'reg' ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {activeDrilldown === 'reg' && (
                <div className="mt-3 bg-[#f8faf6] border border-[#bfc9c1]/50 rounded-2xl p-4 space-y-2.5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
                  {product.modules.declarations.details.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 px-3 bg-white rounded-xl border border-[#e1e3df] text-xs gap-1 shadow-2xs">
                      <span className="font-semibold text-[#404943]">{item.label}</span>
                      <span className="font-bold text-[#191c1a]">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Net Quantity Module */}
        <div className="bg-white border border-[#bfc9c1]/50 rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bfc9c1]/40 bg-[#f8faf6]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">scale</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
                Net Quantity Verification (Rule 11 &amp; Schedule II)
              </h3>
            </div>
            <StatusBadge status={product.modules.netQuantity.status} size="sm" />
          </div>

          <div className="p-5 sm:p-6 space-y-3.5">
            <div>
              <p className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1">
                Primary Statutory Finding
              </p>
              <p className="text-xs sm:text-sm text-[#191c1a] leading-relaxed font-medium">
                {product.modules.netQuantity.primaryFinding}
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={() => toggleDrilldown('ing')}
                className="text-xs font-bold text-[#0058be] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{activeDrilldown === 'ing' ? 'Hide Net Quantity Breakdown' : 'View Net Quantity Font & Unit Verification'}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {activeDrilldown === 'ing' ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {activeDrilldown === 'ing' && (
                <div className="mt-3 bg-[#f8faf6] border border-[#bfc9c1]/50 rounded-2xl p-4 space-y-2.5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
                  {product.modules.netQuantity.details.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-[#e1e3df] text-xs shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#191c1a]">{item.label}</span>
                        <span className={`font-bold ${item.flagged ? 'text-[#ba1a1a]' : 'text-[#0f5238]'}`}>
                          {item.value}
                        </span>
                      </div>
                      {item.note && (
                        <p className="mt-1.5 text-[11px] text-[#ba1a1a] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          {item.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. MRP & Tax Module */}
        <div className="bg-white border border-[#bfc9c1]/50 rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bfc9c1]/40 bg-[#f8faf6]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
                MRP &amp; Tax Declaration Check (Rule 6(1)(e))
              </h3>
            </div>
            <StatusBadge status={product.modules.mrpTax.status} size="sm" />
          </div>

          <div className="p-5 sm:p-6 space-y-3.5">
            <div>
              <p className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1">
                Primary Statutory Finding
              </p>
              <p className="text-xs sm:text-sm text-[#191c1a] leading-relaxed font-medium">
                {product.modules.mrpTax.primaryFinding}
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={() => toggleDrilldown('claim')}
                className="text-xs font-bold text-[#0058be] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{activeDrilldown === 'claim' ? 'Hide MRP Breakdown' : 'View Price & Unit Sale Price Verification'}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {activeDrilldown === 'claim' ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {activeDrilldown === 'claim' && (
                <div className="mt-3 bg-[#f8faf6] border border-[#bfc9c1]/50 rounded-2xl p-4 space-y-2.5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
                  {product.modules.mrpTax.details.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-[#e1e3df] text-xs shadow-xs">
                      <span className="font-semibold text-[#191c1a] block mb-0.5">{item.label}</span>
                      <span className="text-[#404943] font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Evidence Check Module */}
        <div className="bg-white border border-[#bfc9c1]/50 rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bfc9c1]/40 bg-[#f8faf6]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d8e2ff] text-[#002b75] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">assignment</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
                Applicable Statutory Rule &amp; Evidentiary Reference
              </h3>
            </div>
            <StatusBadge status={product.modules.evidence.status} size="sm" />
          </div>

          <div className="p-5 sm:p-6 space-y-3.5">
            <div>
              <p className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1">
                Primary Statutory Finding
              </p>
              <p className="text-xs sm:text-sm text-[#191c1a] leading-relaxed font-medium">
                {product.modules.evidence.primaryFinding}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onOpenEvidenceDetail}
                className="text-xs font-bold text-[#002b75] hover:text-[#0058be] flex items-center gap-1.5 cursor-pointer bg-[#d8e2ff]/60 px-4 py-2 rounded-xl border border-[#adc6ff] transition-colors shadow-2xs"
              >
                <span>Open Complete Statutory Rule Dossier</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Contextual Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-[#bfc9c1]/50 px-4 sm:px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-safe">
        <div className="max-w-[1280px] xl:max-w-[1400px] mx-auto flex gap-3 justify-end items-center">
          <button
            onClick={onCompare}
            className="hidden sm:flex items-center justify-center h-11 px-4 rounded-xl border border-[#bfc9c1]/70 bg-white text-[#191c1a] font-semibold text-xs hover:bg-[#f2f4f0] transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined mr-1.5 text-[18px]">compare_arrows</span>
            Compare Product
          </button>

          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial flex items-center justify-center h-11 px-4 rounded-xl border border-[#bfc9c1]/70 bg-white text-[#191c1a] font-semibold text-xs hover:bg-[#f2f4f0] transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined mr-1.5 text-[18px]">share</span>
            {copied ? 'Link Copied!' : 'Share Dossier'}
          </button>

          <button
            onClick={handleExport}
            className="flex-1 sm:flex-initial flex items-center justify-center h-11 px-5 rounded-xl bg-[#0f5238] hover:bg-[#2d6a4f] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined mr-1.5 text-[18px]">download</span>
            Export / Print PDF
          </button>
        </div>
      </div>
    </div>
  );
};
