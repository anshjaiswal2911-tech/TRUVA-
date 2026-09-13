import React, { useState } from 'react';
import { Product } from '../types';
import { triggerSelectionHaptic, triggerTabHaptic } from '../services/haptics';

interface EvidenceCheckDetailViewProps {
  product: Product;
  onBack: () => void;
}

export const EvidenceCheckDetailView: React.FC<EvidenceCheckDetailViewProps> = ({
  product,
  onBack,
}) => {
  const [showRuleModal, setShowRuleModal] = useState(false);

  const evidence = product.evidenceDetail || {
    laboratory: 'Department of Legal Metrology',
    reportDate: '26 Aug 2026',
    sampleBatch: product.inspectionId || 'INS-2026-8841',
    declaredValue: 'Rule 6(1) Declarations Complete',
    observedValue: 'All 8 Mandatory Declarations Present',
    difference: '0 Violations',
    differenceType: 'match',
    explanation: 'Package complies with Section 18 of the Legal Metrology Act 2009 and Rule 6(1) of Packaged Commodities Rules 2011.',
  };

  return (
    <div className="flex-grow w-full max-w-[1280px] xl:max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
      <div className="max-w-3xl lg:max-w-5xl mx-auto space-y-6">
        {/* Section 1: Overall Status Badge */}
        <section className="flex flex-col items-center justify-center bg-white rounded-3xl border border-[#bfc9c1]/50 p-6 sm:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="w-16 h-16 bg-[#0f5238] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <span className="material-symbols-outlined text-white text-[32px]" data-fill="1">
              gavel
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] border border-[#95d4b3] text-[#0f5238] text-[10px] font-bold uppercase tracking-wider mb-2">
            <span>Official Rule Reference</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1a] tracking-tight mb-1.5">
            Statutory Rule Compliance Record
          </h2>
          <p className="text-xs sm:text-sm text-[#404943] max-w-md leading-relaxed">
            Legal Metrology (Packaged Commodities) Rules, 2011 verification audit trail for <strong>{product.name}</strong>.
          </p>
        </section>

        {/* Section 2: Evidence Details */}
        <section className="bg-white rounded-3xl border border-[#bfc9c1]/50 p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-[#e1e3df]">
            <span className="w-1.5 h-4 bg-[#0f5238] rounded-full"></span>
            <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
              Inspection Reference Data
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col bg-[#f8faf6] p-3.5 rounded-2xl border border-[#bfc9c1]/40">
              <span className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1">
                Authority
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#191c1a]">
                {evidence.laboratory}
              </span>
            </div>
            <div className="flex flex-col bg-[#f8faf6] p-3.5 rounded-2xl border border-[#bfc9c1]/40">
              <span className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1">
                Inspection Date
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#191c1a]">
                {evidence.reportDate}
              </span>
            </div>
            <div className="flex flex-col bg-[#f8faf6] p-3.5 rounded-2xl border border-[#bfc9c1]/40">
              <span className="text-[10px] font-bold text-[#707973] uppercase tracking-wider mb-1">
                Inspection ID
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-[#0f5238]">
                {evidence.sampleBatch}
              </span>
            </div>
          </div>
        </section>

        {/* Section 3: Comparison Metrics Table */}
        <section className="bg-white rounded-3xl border border-[#bfc9c1]/50 p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-[#e1e3df]">
            <span className="w-1.5 h-4 bg-[#0f5238] rounded-full"></span>
            <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
              Statutory Verification Metrics
            </h3>
          </div>

          <div className="space-y-3">
            {/* Declared */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-[#e1e3df] gap-2 lg:px-2">
              <span className="text-[11px] sm:text-xs font-bold text-[#707973] uppercase tracking-wider lg:w-1/3">
                STATUTORY REQUIREMENT
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#191c1a] lg:w-2/3 lg:text-right">
                {evidence.declaredValue}
              </span>
            </div>

            {/* Observed */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-[#e1e3df] gap-2 lg:px-2">
              <span className="text-[11px] sm:text-xs font-bold text-[#707973] uppercase tracking-wider lg:w-1/3">
                MEASURED / OBSERVED LABEL STATUS
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#191c1a] lg:w-2/3 lg:text-right">
                {evidence.observedValue}
              </span>
            </div>

            {/* Difference / Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-[#e1e3df] gap-2 lg:px-2">
              <span className="text-[11px] sm:text-xs font-bold text-[#707973] uppercase tracking-wider lg:w-1/3">
                VERDICT DISCREPANCY
              </span>
              <div className="lg:w-2/3 lg:flex lg:justify-end">
                <span
                  className={`text-xs sm:text-sm font-black px-3 py-1 rounded-full border w-fit ${
                    evidence.differenceType === 'match' || evidence.differenceType === 'acceptable'
                      ? 'bg-[#dcfce7] text-[#0f5238] border-[#95d4b3]'
                      : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]'
                  }`}
                >
                  {evidence.difference}
                </span>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="pt-2 bg-[#f8faf6] p-4 rounded-2xl border border-[#bfc9c1]/40">
              <span className="text-[10px] font-bold text-[#707973] uppercase tracking-wider block mb-1">
                Statutory Assessment Rationale
              </span>
              <p className="text-xs sm:text-sm text-[#404943] leading-relaxed">
                {evidence.explanation}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Legal Rule Reference & CTA */}
        <section className="bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] text-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_16px_rgba(15,82,56,0.2)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[20px] text-[#b1f0ce]">menu_book</span>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
              Applicable Legal Provisions
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#b1f0ce] leading-relaxed mb-4">
            Section 18 of the Legal Metrology Act, 2009 prescribes that no person shall manufacture, pack, sell, distribute, deliver, or offer for sale any pre-packaged commodity unless it bears declarations as prescribed under the Packaged Commodities Rules, 2011.
          </p>
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setShowRuleModal(true);
            }}
            className="px-5 py-2.5 bg-white text-[#0f5238] hover:bg-[#b1f0ce] rounded-xl font-bold text-xs transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            View Statutory Sections Reference
          </button>
        </section>

        {/* Back Action */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              triggerTabHaptic();
              onBack();
            }}
            className="px-6 py-2.5 rounded-xl border border-[#bfc9c1]/70 bg-white hover:bg-[#f2f4f0] text-[#191c1a] font-semibold text-xs transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Return to Dossier
          </button>
        </div>
      </div>

      {/* Statutory Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#bfc9c1]/60 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#e1e3df] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0f5238]">gavel</span>
                <h4 className="font-bold text-base text-[#191c1a]">Statutory Act &amp; Rules Reference</h4>
              </div>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-[#707973] hover:text-[#191c1a] p-1.5 rounded-full hover:bg-[#f2f4f0] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#404943] bg-[#f8faf6] p-4 rounded-2xl border border-[#e1e3df]">
              <div className="flex justify-between py-1 border-b border-[#e1e3df]/60">
                <span className="font-semibold text-[#191c1a]">Statutory Act:</span>
                <span className="font-medium">Legal Metrology Act, 2009 (Act No. 1 of 2010)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e1e3df]/60">
                <span className="font-semibold text-[#191c1a]">Applicable Rules:</span>
                <span className="font-medium">Legal Metrology (Packaged Commodities) Rules, 2011</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#e1e3df]/60">
                <span className="font-semibold text-[#191c1a]">Section 18:</span>
                <span className="font-medium text-right max-w-xs">Prohibition on manufacture, packing, sale of un-declared commodities</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-[#191c1a]">Penalty Provision:</span>
                <span className="font-bold text-[#ba1a1a]">Section 36(1) — Penalty for non-conforming packages</span>
              </div>
            </div>

            <p className="text-xs text-[#707973]">
              Inspection dossier indexed under State Legal Metrology Enforcement Registry.
            </p>

            <button
              onClick={() => setShowRuleModal(false)}
              className="w-full py-2.5 bg-[#0f5238] hover:bg-[#2d6a4f] text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
            >
              Close Rule Reference
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
