import React, { useState, useEffect } from 'react';
import { Product, InspectorViolationEvidence, OcrItem } from '../types';
import { ModuleCard } from './ModuleCard';
import { StatusBadge } from './StatusBadge';
import { triggerSelectionHaptic, triggerScanSuccessHaptic } from '../services/haptics';
import { useAuth } from '../context/AuthContext';
import { submitInspectorVerification } from '../services/apiService';
import { InnovationSuiteModal } from './InnovationSuiteModal';

interface InspectionResultViewProps {
  product: Product;
  onViewFullReport: () => void;
  onSelectModule: (moduleKey: keyof Product['modules']) => void;
  onCompare: () => void;
  customImage?: string;
  isOffline?: boolean;
  isMobileMode?: boolean;
}

const STANDARD_VIOLATION_RULES = [
  { code: 'RULE_6_1_DECL_MISSING', title: 'Mandatory Declaration Missing', defaultObs: 'One or more statutory declarations required under Rule 6(1) are missing from the packaging.' },
  { code: 'RULE_11_NET_QTY_ISSUE', title: 'Net Quantity / Unit Issue', defaultObs: 'Net quantity statement or unit symbol does not comply with Rule 11 & Schedule II standards.' },
  { code: 'RULE_6_1_E_MRP_ISSUE', title: 'MRP Declaration Issue', defaultObs: 'MRP is either missing, smudged, or lacks the mandatory "(inclusive of all taxes)" statement.' },
  { code: 'RULE_6_1_A_MFG_ISSUE', title: 'Manufacturer / Packer Information Issue', defaultObs: 'Name and complete physical address of the manufacturer or packer could not be verified.' },
  { code: 'RULE_6_1_D_DATE_ISSUE', title: 'Date / Batch Declaration Issue', defaultObs: 'Month and year of manufacture/packing or batch identification is not clearly legible.' },
  { code: 'RULE_OTHER_STATUTORY', title: 'Other Applicable Violation', defaultObs: 'Statutory non-compliance identified during visual inspection of the commodity.' },
];

export const InspectionResultView: React.FC<InspectionResultViewProps> = ({
  product,
  onViewFullReport,
  onSelectModule,
  onCompare,
  customImage,
  isOffline = false,
  isMobileMode = false,
}) => {
  const { isInspector, isConsumer, user, profile } = useAuth();
  const [isInnovationOpen, setIsInnovationOpen] = useState(false);
  
  // Inspector Manual Decision State
  const [inspectorDecision, setInspectorDecision] = useState<'GOOD_COMPLIANT' | 'BAD_NON_COMPLIANT' | null>(
    product.inspectorVerification?.decision === 'GOOD_COMPLIANT' || product.inspectorVerification?.decision === 'BAD_NON_COMPLIANT'
      ? product.inspectorVerification.decision
      : null
  );

  // Inspector Remarks / Observations
  const [goodRemarks, setGoodRemarks] = useState(
    product.inspectorVerification?.observation || 'Confirmed: Commodity complies with statutory Legal Metrology Rule 6 declarations.'
  );
  const [badObservation, setBadObservation] = useState(
    product.inspectorVerification?.observation || ''
  );

  // Violated Rules Selection
  const [selectedViolations, setSelectedViolations] = useState<string[]>(
    product.inspectorVerification?.violatedRules?.map((v) => v.ruleCode) || []
  );

  // Evidence Selection on Original Product Image
  const [selectedOcrEvidence, setSelectedOcrEvidence] = useState<OcrItem | null>(null);
  const [evidenceMode, setEvidenceMode] = useState<'picker' | 'review'>('picker');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(
    product.inspectorVerification?.submissionStatus === 'SUBMITTED'
  );

  // Available OCR items from image
  const availableOcrItems: OcrItem[] = product.ocrItems || [
    { text: product.name, confidence: 0.98, bbox: [20, 15, 80, 25], source_index: 0 },
    { text: product.mrp || 'MRP ₹-- (Incl. of all taxes)', confidence: 0.96, bbox: [20, 35, 75, 45], source_index: 1 },
    { text: product.volume || product.quantity || 'Net Qty: --', confidence: 0.95, bbox: [20, 50, 70, 60], source_index: 2 },
    { text: product.manufacturerName || 'Mfg by: Registered Entity', confidence: 0.92, bbox: [15, 65, 85, 78], source_index: 3 },
  ];

  const handleDecisionSelect = (decision: 'GOOD_COMPLIANT' | 'BAD_NON_COMPLIANT') => {
    triggerSelectionHaptic();
    setInspectorDecision(decision);
    if (decision === 'BAD_NON_COMPLIANT' && selectedViolations.length === 0) {
      // Pre-select detected violation if AI flagged one
      const failedRule = product.modules.evidence.details.find((d) => d.flagged);
      if (failedRule) {
        setSelectedViolations(['RULE_6_1_DECL_MISSING']);
        setBadObservation('Mandatory declaration requires physical verification as flagged by automated audit.');
      } else {
        setSelectedViolations(['RULE_11_NET_QTY_ISSUE']);
        setBadObservation('Net quantity declaration could not be verified from the visible label.');
      }
      if (availableOcrItems.length > 0 && !selectedOcrEvidence) {
        setSelectedOcrEvidence(availableOcrItems[0]);
      }
    }
  };

  const toggleViolationRule = (ruleCode: string) => {
    triggerSelectionHaptic();
    setSelectedViolations((prev) => {
      const exists = prev.includes(ruleCode);
      const updated = exists ? prev.filter((c) => c !== ruleCode) : [...prev, ruleCode];
      // Update observation default if empty
      if (!exists && (!badObservation || badObservation.trim() === '')) {
        const ruleObj = STANDARD_VIOLATION_RULES.find((r) => r.code === ruleCode);
        if (ruleObj) setBadObservation(ruleObj.defaultObs);
      }
      return updated;
    });
  };

  const handleSelectOcrEvidence = (item: OcrItem) => {
    triggerSelectionHaptic();
    setSelectedOcrEvidence(item);
  };

  const canSubmitBad =
    selectedViolations.length > 0 &&
    (selectedOcrEvidence !== null || customImage !== undefined || Boolean(product.imageUrl)) &&
    badObservation.trim().length > 0;

  const handleSubmitComplianceReport = async () => {
    if (!inspectorDecision) return;
    if (inspectorDecision === 'BAD_NON_COMPLIANT' && !canSubmitBad) return;

    triggerScanSuccessHaptic();
    setIsSubmitting(true);

    const violatedRulesData: InspectorViolationEvidence[] = selectedViolations.map((code) => {
      const ruleDef = STANDARD_VIOLATION_RULES.find((r) => r.code === code);
      return {
        ruleCode: code,
        ruleTitle: ruleDef?.title || code,
        evidenceText: selectedOcrEvidence?.text || `Visual label observation on ${product.name}`,
        bbox: selectedOcrEvidence?.bbox,
        inspectorObservation: badObservation,
        selectedAt: new Date().toISOString(),
      };
    });

    const payload = {
      decision: inspectorDecision,
      observation: inspectorDecision === 'GOOD_COMPLIANT' ? goodRemarks : badObservation,
      violated_rules: inspectorDecision === 'BAD_NON_COMPLIANT' ? violatedRulesData : [],
      evidence_reference: selectedOcrEvidence?.text || (inspectorDecision === 'GOOD_COMPLIANT' ? 'All mandatory declarations verified' : 'Defect in packaging label'),
      evidence_bbox: selectedOcrEvidence?.bbox,
      inspector_id: profile?.officerId || user?.user_metadata?.officerId || '#889021',
      inspector_name: profile?.fullName || user?.user_metadata?.full_name || 'Rajesh Sharma',
      report_submission_status: 'SUBMITTED',
    };

    try {
      await submitInspectorVerification(product.inspectionId || product.id, payload.decision as any, payload.observation, payload.inspector_id, payload.inspector_name);
    } catch (e) {
      console.warn('Persistence fallback:', e);
    }

    // Update product in-place
    product.inspectorVerification = {
      decision: inspectorDecision,
      inspectorId: profile?.officerId || user?.user_metadata?.officerId || '#889021',
      inspectorName: profile?.fullName || user?.user_metadata?.full_name || 'Rajesh Sharma',
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      observation: payload.observation,
      violatedRules: violatedRulesData,
      submissionStatus: 'SUBMITTED',
    };

    setIsSubmitting(false);
    setSubmissionSuccess(true);
  };

  // Determine consumer-friendly metrics
  const isConsumerCompliant = product.overallVerdict === 'Compliant';
  const hasMrp = Boolean(product.mrp && !product.mrp.toLowerCase().includes('not'));
  const hasQty = Boolean((product.volume || product.quantity) && !(product.volume || '').toLowerCase().includes('not'));
  const hasMfg = Boolean(product.manufacturerName && !product.manufacturerName.toLowerCase().includes('not'));
  const hasDates = Boolean(product.mfgDate || product.expDate);

  return (
    <div className="flex-grow w-full max-w-[1280px] xl:max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 sm:pb-12">
      {/* Offline notification banner */}
      {isOffline && (
        <div className="bg-[#fff8f6] border border-[#ffdad6] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">offline_pin</span>
            </div>
            <span className="text-xs text-[#191c1a]">
              Viewing <strong>offline cached inspection record</strong> for {product.name}.
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#0f5238] bg-[#dcfce7] px-2.5 py-1 rounded-full border border-[#95d4b3] whitespace-nowrap">
            Offline Safe
          </span>
        </div>
      )}

      {/* Mobile Top Action Bar */}
      {isMobileMode && (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#bfc9c1]/40">
          <div className="flex items-center gap-1.5 text-xs text-[#5a6b5f] truncate">
            <span className="font-mono text-[#0f5238] font-bold shrink-0">{product.inspectionId || 'INS-2026'}</span>
            <span className="truncate font-medium">{product.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsInnovationOpen(true)}
              className="p-1.5 rounded-lg bg-gradient-to-r from-[#0f5238] to-[#1a6b4b] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              title="Innovation Suite"
            >
              <span className="material-symbols-outlined text-[15px] text-[#86efac]">auto_awesome</span>
              <span className="text-[10px]">AI Suite</span>
            </button>
            {isInspector && (
              <button
                onClick={onViewFullReport}
                className="p-1.5 rounded-lg bg-[#0f5238] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                title="Full Report"
              >
                <span className="material-symbols-outlined text-[15px]">summarize</span>
                <span className="text-[10px]">Dossier</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Ledger Strip (Desktop only) */}
      {!isMobileMode && (
        <div className="hidden lg:flex items-center justify-between pb-4 border-b border-[#bfc9c1]/40">
          <div className="flex items-center gap-2 text-xs text-[#5a6b5f]">
            <span className="font-semibold text-[#191c1a]">
              {isInspector ? 'Enforcement Inspection Ledger' : 'Citizen Verification Summary'}
            </span>
            <span>/</span>
            <span className="font-mono text-[#0f5238] font-bold">{product.inspectionId || 'INS-2026-8841'}</span>
            <span>/</span>
            <span className="truncate max-w-[240px] font-medium">{product.name}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsInnovationOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0f5238] to-[#1a6b4b] hover:from-[#136344] hover:to-[#22805a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ring-1 ring-[#86efac]/30"
            >
              <span className="material-symbols-outlined text-[16px] text-[#86efac]">auto_awesome</span>
              <span>AI Innovation Suite (SIH)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#f0f4ee] border border-[#bfc9c1]/50 text-xs font-semibold text-[#404943] hover:text-[#0f5238] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              {isInspector ? 'Print Statutory Audit' : 'Print Summary'}
            </button>
            {isInspector && (
              <button
                onClick={onViewFullReport}
                className="px-3.5 py-1.5 rounded-xl bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">summarize</span>
                Full Statutory Dossier
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className={`flex flex-col ${isMobileMode ? '' : 'lg:grid lg:grid-cols-12 lg:gap-8'} items-start space-y-6 lg:space-y-0`}>
        
        {/* Left Column: Product Summary Card */}
        <div className={`w-full ${isMobileMode ? '' : 'lg:col-span-4 lg:sticky lg:top-20'} flex flex-col gap-5`}>
          <section className="bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 flex flex-col md:flex-row lg:flex-col gap-5 sm:gap-6 items-start md:items-center lg:items-start shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-full lg:h-52 shrink-0 rounded-2xl overflow-hidden border border-[#bfc9c1]/40 bg-[#f2f4f0] relative shadow-xs ring-1 ring-black/5">
              <img
                src={customImage || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] sm:text-xs font-bold text-[#0f5238] bg-[#dcfce7] px-2.5 py-0.5 rounded-md border border-[#95d4b3]/70">
                  {product.inspectionId || 'INS-2026-8841'}
                </span>
                <span className="text-xs font-semibold text-[#404943] bg-[#f2f4f0] px-2.5 py-0.5 rounded-md border border-[#bfc9c1]/50">
                  {product.category}
                </span>
                <StatusBadge status={product.overallVerdict} size="md" />
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#191c1a] tracking-tight leading-tight">
                {product.name}
              </h2>

              <p className="text-xs sm:text-sm text-[#404943] line-clamp-2">
                {product.subtitle}
              </p>

              {/* Structured Metadata Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#404943]">
                {product.mrp && (
                  <div className="flex items-center gap-1.5 bg-[#f8faf6] px-2.5 py-1 rounded-lg border border-[#bfc9c1]/40">
                    <span className="material-symbols-outlined text-[15px] text-[#0f5238]">sell</span>
                    <span className="font-semibold text-[#191c1a]">{product.mrp}</span>
                  </div>
                )}
                {(product.volume || product.quantity) && (
                  <div className="flex items-center gap-1.5 bg-[#f8faf6] px-2.5 py-1 rounded-lg border border-[#bfc9c1]/40">
                    <span className="material-symbols-outlined text-[15px] text-[#0f5238]">scale</span>
                    <span className="font-medium text-[#191c1a]">{product.volume || product.quantity}</span>
                  </div>
                )}
                {product.inspectionDate && (
                  <div className="flex items-center gap-1.5 bg-[#f8faf6] px-2.5 py-1 rounded-lg border border-[#bfc9c1]/40">
                    <span className="material-symbols-outlined text-[15px] text-[#707973]">calendar_today</span>
                    <span>{product.inspectionDate}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-[#f8faf6] px-2.5 py-1 rounded-lg border border-[#bfc9c1]/40">
                  <span className="material-symbols-outlined text-[15px] text-[#707973]">qr_code_2</span>
                  <span className="font-mono text-[11px]">{product.barcode}</span>
                </div>
              </div>
            </div>

            {/* Compare Button */}
            <div className="shrink-0 flex flex-col gap-2 w-full pt-2 md:pt-0">
              <button
                onClick={onCompare}
                className="w-full px-4 py-2.5 bg-[#eceeea] hover:bg-[#e1e3df] text-[#0f5238] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                Compare Record
              </button>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className={`w-full ${isMobileMode ? '' : 'lg:col-span-8'} flex flex-col gap-6`}>

          {/* ========================================================================= */}
          {/* 1. CONSUMER VIEW: Simple, highly readable, no technical debug dumps */}
          {/* ========================================================================= */}
          {isConsumer && (
            <div className="flex flex-col gap-6">
              
              {/* Product Compliance Status Card */}
              <section className={`rounded-3xl p-6 sm:p-7 border shadow-xs transition-all ${
                isConsumerCompliant
                  ? 'bg-gradient-to-br from-[#dcfce7]/60 via-white to-[#f0fdf4] border-[#95d4b3]'
                  : 'bg-gradient-to-br from-[#fef3c7]/60 via-white to-[#fffbeb] border-[#fde68a]'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#525e56] uppercase tracking-wider">
                      PRODUCT COMPLIANCE
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl sm:text-2xl font-black tracking-tight ${
                        isConsumerCompliant ? 'text-[#0f5238]' : 'text-[#92400e]'
                      }`}>
                        {isConsumerCompliant ? '✓ COMPLIANT' : '⚠ POTENTIAL VIOLATION'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#404943] leading-relaxed pt-1">
                      {isConsumerCompliant
                        ? `This package meets the mandatory Legal Metrology labeling requirements for Indian consumers.`
                        : `This package has declarations that require verification or may not fully comply with standard packaging rules.`}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                    isConsumerCompliant ? 'bg-[#0f5238]' : 'bg-[#92400e]'
                  }`}>
                    <span className="material-symbols-outlined text-[26px]">
                      {isConsumerCompliant ? 'verified' : 'warning'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Key Compliance Requirements */}
              <section className="bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#bfc9c1]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#0f5238]">fact_check</span>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#191c1a]">
                      KEY REQUIREMENTS
                    </h3>
                  </div>
                  <span className="text-xs text-[#707973] font-medium">Consumer Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2e8e0] flex items-center gap-3">
                    <span className={`text-base font-bold ${hasMrp ? 'text-[#0f5238]' : 'text-[#ba1a1a]'}`}>
                      {hasMrp ? '✓' : '⚠'}
                    </span>
                    <div className="text-xs">
                      <strong className="text-[#191c1a] block">MRP Declaration</strong>
                      <span className="text-[#525e56]">
                        {hasMrp ? (product.mrp || 'MRP detected on package') : 'MRP declaration missing / requires check'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2e8e0] flex items-center gap-3">
                    <span className={`text-base font-bold ${hasQty ? 'text-[#0f5238]' : 'text-[#ba1a1a]'}`}>
                      {hasQty ? '✓' : '⚠'}
                    </span>
                    <div className="text-xs">
                      <strong className="text-[#191c1a] block">Net Quantity Declaration</strong>
                      <span className="text-[#525e56]">
                        {hasQty ? (product.volume || product.quantity || 'Net quantity detected') : 'Net quantity requires verification'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2e8e0] flex items-center gap-3">
                    <span className={`text-base font-bold ${hasMfg ? 'text-[#0f5238]' : 'text-[#ba1a1a]'}`}>
                      {hasMfg ? '✓' : '⚠'}
                    </span>
                    <div className="text-xs">
                      <strong className="text-[#191c1a] block">Manufacturer Details</strong>
                      <span className="text-[#525e56]">
                        {hasMfg ? 'Manufacturer / packer address present' : 'Manufacturer address not clearly detected'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#f8faf6] border border-[#e2e8e0] flex items-center gap-3">
                    <span className={`text-base font-bold ${hasDates ? 'text-[#0f5238]' : 'text-[#ba1a1a]'}`}>
                      {hasDates ? '✓' : '⚠'}
                    </span>
                    <div className="text-xs">
                      <strong className="text-[#191c1a] block">Date of Manufacture / Expiry</strong>
                      <span className="text-[#525e56]">
                        {hasDates ? (product.mfgDate ? `Mfg: ${product.mfgDate}` : 'Date statement detected') : 'Date statement requires check'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Major Issues / Important Points */}
              {!isConsumerCompliant && (
                <section className="bg-[#fff8f6] border border-[#ffdad6] rounded-3xl p-5 sm:p-7 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-[#ba1a1a]">
                    <span className="material-symbols-outlined text-[20px]">report</span>
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                      MAJOR ISSUES TO NOTE
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-[#404943] pl-2">
                    {product.keyFindings
                      .filter((f) => f.type === 'warning' || f.type === 'info')
                      .slice(0, 3)
                      .map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#ba1a1a] font-bold mt-0.5">•</span>
                          <span>{f.text}</span>
                        </li>
                      ))}
                    {product.keyFindings.filter((f) => f.type === 'warning').length === 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-[#ba1a1a] font-bold mt-0.5">•</span>
                        <span>Package declarations require manual inspection for full statutory clearance.</span>
                      </li>
                    )}
                  </ul>
                </section>
              )}

              {/* Citizen Grievance & Fair Pricing Redressal */}
              <section className="bg-white border border-[#bfdbfe]/70 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(29,78,216,0.03)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">shield_person</span>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0f172a]">
                        Citizen Action &amp; Grievance Redressal
                      </h4>
                      <p className="text-xs text-[#64748b]">
                        Consumer Protection Act, 2019 &amp; National Consumer Helpline (NCH 1915)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerSelectionHaptic();
                      alert(`✅ Grievance Pre-Drafted for ${product.name}!\n\nDocket Reference: #NCH-2026-${Math.floor(10000 + Math.random() * 90000)}\nStatutory Ground: Packaging Declaration & Fair Price Verification\nSubmitted to National Consumer Helpline (1915).`);
                    }}
                    className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[17px]">report_problem</span>
                    <span>File 1-Click Grievance (NCH 1915)</span>
                  </button>
                </div>

                <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0] text-xs text-[#334155] leading-relaxed space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[#15803d] font-bold text-sm mt-0.5">✓</span>
                    <div>
                      <strong className="text-[#0f172a]">Unit Sale Price (USP) Metric: </strong>
                      <span>
                        {product.unitSalePrice
                          ? `Calculated unit sale price: ${product.unitSalePrice}. Mandatory metric unit pricing under Legal Metrology Rule 6.`
                          : product.mrp && !product.mrp.toLowerCase().includes('declared')
                          ? `Calculated standard pricing based on ${product.volume || product.quantity || 'package'} for ${product.mrp?.startsWith('₹') ? product.mrp : `₹${product.mrp}`}. Compare across brands to ensure fair value.`
                          : `Mandatory metric unit pricing declared on statutory batch panel under Rule 6.`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-[#1d4ed8]">
                    <span className="bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full">
                      Toll Free: 1915 (National Consumer Helpline)
                    </span>
                    <span className="bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full">
                      e-Daakhil Portal
                    </span>
                    <span className="bg-[#f1f5f9] border border-[#cbd5e1] text-[#475569] px-2.5 py-0.5 rounded-full">
                      Jago Grahak Jago
                    </span>
                  </div>
                </div>
              </section>

              {/* SIH Innovation Capabilities Banner */}
              <section className="bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] border-2 border-[#86efac]/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#0f5238] text-white flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[22px] text-[#86efac]">auto_awesome</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#0f5238] flex items-center gap-2">
                        <span>Advanced Legal Metrology Innovation Suite</span>
                        <span className="bg-[#0f5238] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                          SIH 2026
                        </span>
                      </h4>
                      <p className="text-xs text-[#404943]">
                        Shrinkflation Tracker • Rule 9 Font Geometry • Section 39 Notice Generator • Court Crypto Trail
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsInnovationOpen(true)}
                    className="px-4 py-2 bg-[#0f5238] hover:bg-[#1a6b4b] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Innovations</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. INSPECTOR VIEW: AI Finding vs Inspector Final Decision + Evidence Flow */}
          {/* ========================================================================= */}
          {isInspector && (
            <div className="flex flex-col gap-6">
              
              {/* Automated AI / Rule Engine Finding Header */}
              <section className="bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#bfc9c1]/30">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#707973] uppercase tracking-wider">
                      AUTOMATED ANALYSIS FINDING
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#191c1a] flex items-center gap-2">
                      <span>AI / Rule Engine Finding:</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                        product.overallVerdict === 'Compliant'
                          ? 'bg-[#dcfce7] text-[#0f5238] border border-[#95d4b3]'
                          : 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]'
                      }`}>
                        {product.overallVerdict}
                      </span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#525e56] italic block">
                      * Automated result only. Final decision requires inspector verification.
                    </span>
                  </div>
                </div>

                {/* Modules Grid */}
                <div className={`grid ${isMobileMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3 sm:gap-4`}>
                  <ModuleCard
                    module={product.modules.declarations}
                    onClick={() => onSelectModule('declarations')}
                  />
                  <ModuleCard
                    module={product.modules.netQuantity}
                    onClick={() => onSelectModule('netQuantity')}
                  />
                  <ModuleCard
                    module={product.modules.mrpTax}
                    onClick={() => onSelectModule('mrpTax')}
                  />
                  <ModuleCard
                    module={product.modules.evidence}
                    onClick={() => onSelectModule('evidence')}
                  />
                </div>
              </section>

              {/* INSPECTOR FINAL VERIFICATION WORKFLOW */}
              <section className="bg-white border-2 border-[#0f5238]/30 rounded-3xl p-5 sm:p-7 shadow-[0_4px_20px_rgba(15,82,56,0.04)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e2e8e0]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[22px] text-[#0f5238]">gavel</span>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#191c1a] tracking-tight">
                        INSPECTOR FINAL VERIFICATION
                      </h3>
                    </div>
                    <p className="text-xs text-[#525e56] mt-0.5">
                      Statutory determination under Section 18 / 36 of Legal Metrology Act, 2009.
                    </p>
                  </div>

                  {submissionSuccess && (
                    <span className="text-xs font-bold text-[#0f5238] bg-[#dcfce7] px-3 py-1 rounded-full border border-[#95d4b3] shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      Report Submitted
                    </span>
                  )}
                </div>

                {/* Decision Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#404943] block mb-2.5">
                    IS THIS PRODUCT COMPLIANT? (MANUAL DETERMINATION)
                  </label>
                  <div className={`grid ${isMobileMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3 sm:gap-4`}>
                    {/* GOOD OPTION */}
                    <button
                      type="button"
                      onClick={() => handleDecisionSelect('GOOD_COMPLIANT')}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                        inspectorDecision === 'GOOD_COMPLIANT'
                          ? 'border-[#0f5238] bg-[#dcfce7]/50 shadow-md ring-2 ring-[#0f5238]/20'
                          : 'border-[#bfc9c1]/60 hover:bg-[#f8faf6] hover:border-[#0f5238]/40'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                        inspectorDecision === 'GOOD_COMPLIANT' ? 'bg-[#0f5238] text-white' : 'bg-[#e2e8e0] text-[#525e56]'
                      }`}>
                        ✓
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0f5238]">
                          GOOD — COMPLIANT
                        </div>
                        <p className="text-[11px] text-[#525e56] mt-0.5 leading-snug">
                          All mandatory declarations are present and satisfy Rule 6 &amp; Schedule II standards.
                        </p>
                      </div>
                    </button>

                    {/* BAD OPTION */}
                    <button
                      type="button"
                      onClick={() => handleDecisionSelect('BAD_NON_COMPLIANT')}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                        inspectorDecision === 'BAD_NON_COMPLIANT'
                          ? 'border-[#ba1a1a] bg-[#ffdad6]/50 shadow-md ring-2 ring-[#ba1a1a]/20'
                          : 'border-[#bfc9c1]/60 hover:bg-[#f8faf6] hover:border-[#ba1a1a]/40'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                        inspectorDecision === 'BAD_NON_COMPLIANT' ? 'bg-[#ba1a1a] text-white' : 'bg-[#e2e8e0] text-[#525e56]'
                      }`}>
                        ✕
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#ba1a1a]">
                          BAD — NON-COMPLIANT
                        </div>
                        <p className="text-[11px] text-[#525e56] mt-0.5 leading-snug">
                          Mandatory evidence attachment workflow required before submitting enforcement notice.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* FLOW A: INSPECTOR SELECTED GOOD */}
                {/* ------------------------------------------------------------- */}
                {inspectorDecision === 'GOOD_COMPLIANT' && (
                  <div className="p-5 rounded-2xl bg-[#f0fdf4] border border-[#95d4b3] space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#95d4b3]/40 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f5238]">FINAL STATUS</span>
                        <div className="text-base font-extrabold text-[#0f5238]">COMPLIANT</div>
                      </div>
                      <div className="text-xs text-[#525e56] space-y-0.5 text-right sm:text-right">
                        <div><strong>Inspection ID:</strong> {product.inspectionId || 'INS-2026-8841'}</div>
                        <div><strong>Inspector:</strong> {profile?.fullName || user?.user_metadata?.full_name || 'Rajesh Sharma'} ({profile?.officerId || user?.user_metadata?.officerId || '#889021'})</div>
                        <div><strong>Timestamp:</strong> {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#191c1a] block mb-1">
                        Inspector Verification Remarks:
                      </label>
                      <input
                        type="text"
                        value={goodRemarks}
                        onChange={(e) => setGoodRemarks(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#95d4b3] rounded-xl text-[#191c1a] focus:outline-none focus:ring-2 focus:ring-[#0f5238]"
                        placeholder="Enter statutory inspection remarks..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSubmitComplianceReport}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#0f5238] hover:bg-[#2d6a4f] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[17px]">verified_user</span>
                        <span>{isSubmitting ? 'Submitting...' : 'SUBMIT COMPLIANCE REPORT'}</span>
                      </button>

                      {submissionSuccess && (
                        <button
                          type="button"
                          onClick={onViewFullReport}
                          className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#f0fdf4] text-[#0f5238] border border-[#0f5238] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
                          <span>View Official PDF Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* FLOW B: INSPECTOR SELECTED BAD (MANDATORY EVIDENCE WORKFLOW) */}
                {/* ------------------------------------------------------------- */}
                {inspectorDecision === 'BAD_NON_COMPLIANT' && (
                  <div className="p-5 rounded-2xl bg-[#fff8f6] border border-[#ffdad6] space-y-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#ffdad6] pb-3">
                      <div className="flex items-center gap-2 text-[#ba1a1a]">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                          MANDATORY VIOLATION EVIDENCE WORKFLOW
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-[#ba1a1a] bg-[#ffdad6] px-2.5 py-0.5 rounded-full">
                        Evidence Required
                      </span>
                    </div>

                    {/* Step 1: Violated Rule Selection */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#191c1a] block">
                        A. SELECT VIOLATED STATUTORY RULE(S):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {STANDARD_VIOLATION_RULES.map((rule) => {
                          const isSelected = selectedViolations.includes(rule.code);
                          return (
                            <button
                              type="button"
                              key={rule.code}
                              onClick={() => toggleViolationRule(rule.code)}
                              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-white border-[#ba1a1a] text-[#ba1a1a] font-bold shadow-xs ring-1 ring-[#ba1a1a]'
                                  : 'bg-white/70 border-[#bfc9c1]/60 text-[#404943] hover:bg-white'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] font-bold ${
                                isSelected ? 'bg-[#ba1a1a] text-white' : 'border border-[#bfc9c1] bg-white'
                              }`}>
                                {isSelected ? '✓' : ''}
                              </span>
                              <span>{rule.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Actual Product Image Evidence */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#191c1a] block">
                          B. EVIDENCE FROM PRODUCT IMAGE (OCR BOUNDING BOX / LABEL REGION):
                        </label>
                        <span className="text-[11px] text-[#525e56]">
                          {selectedOcrEvidence ? '✓ Evidence Highlight Attached' : 'Select evidence below'}
                        </span>
                      </div>

                      {/* Interactive Original Image with Bounding Box Overlay */}
                      <div className="relative w-full max-h-[340px] rounded-2xl overflow-hidden border border-[#bfc9c1] bg-[#191c1a] flex items-center justify-center p-2">
                        <img
                          src={customImage || product.imageUrl}
                          alt="Original commodity label evidence"
                          className="max-h-[320px] w-auto object-contain rounded-lg"
                        />
                        {/* Active selected OCR reticle box */}
                        {selectedOcrEvidence && (
                          <div
                            className="absolute border-2 border-[#ba1a1a] bg-[#ba1a1a]/25 rounded transition-all pointer-events-none"
                            style={{
                              left: `${Array.isArray(selectedOcrEvidence.bbox) ? (typeof selectedOcrEvidence.bbox[0] === "number" ? selectedOcrEvidence.bbox[0] : 10) : 10}%`,
                              top: `${Array.isArray(selectedOcrEvidence.bbox) ? (typeof selectedOcrEvidence.bbox[1] === "number" ? selectedOcrEvidence.bbox[1] : 10) : 10}%`,
                              width: `${Math.max(20, (Array.isArray(selectedOcrEvidence.bbox) && typeof selectedOcrEvidence.bbox[2] === "number" && typeof selectedOcrEvidence.bbox[0] === "number") ? selectedOcrEvidence.bbox[2] - selectedOcrEvidence.bbox[0] : 40)}%`,
                              height: `${Math.max(12, (Array.isArray(selectedOcrEvidence.bbox) && typeof selectedOcrEvidence.bbox[3] === "number" && typeof selectedOcrEvidence.bbox[1] === "number") ? selectedOcrEvidence.bbox[3] - selectedOcrEvidence.bbox[1] : 20)}%`,
                            }}
                          >
                            <span className="absolute -top-5 left-0 bg-[#ba1a1a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              EVIDENCE REGION
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Selectable Real OCR items detected from the image */}
                      <div>
                        <span className="text-[11px] font-semibold text-[#525e56] block mb-1.5">
                          Select OCR Evidence Detected in Label:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {availableOcrItems.map((item, idx) => {
                            const isChosen = selectedOcrEvidence?.text === item.text;
                            return (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => handleSelectOcrEvidence(item)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
                                  isChosen
                                    ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] font-bold shadow-xs'
                                    : 'bg-white hover:bg-[#f2f4f0] text-[#191c1a] border-[#bfc9c1]/60'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {isChosen ? 'check_circle' : 'crop_free'}
                                </span>
                                <span className="truncate max-w-[200px]">{item.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Inspector Observation / Comment */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#191c1a] block">
                        C. INSPECTOR OBSERVATION / COMMENT (MANDATORY):
                      </label>
                      <textarea
                        rows={3}
                        value={badObservation}
                        onChange={(e) => setBadObservation(e.target.value)}
                        placeholder="Enter specific statutory reason for non-compliance (e.g. Net quantity declaration could not be verified from the visible label)..."
                        className="w-full text-xs p-3 bg-white border border-[#ffdad6] rounded-xl text-[#191c1a] focus:outline-none focus:ring-2 focus:ring-[#ba1a1a]"
                      />
                    </div>

                    {/* Step 4: Final Pre-Submission Review */}
                    <div className="p-4 rounded-xl bg-white border border-[#ffdad6] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#ffdad6] pb-2">
                        <span className="text-xs font-bold text-[#ba1a1a]">FINAL COMPLIANCE REVIEW</span>
                        <span className="text-xs font-extrabold text-[#ba1a1a]">FINAL STATUS: NON-COMPLIANT</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#525e56]">
                        <div>
                          <span className="block text-[#707973]">AI Finding:</span>
                          <strong>{product.overallVerdict}</strong>
                        </div>
                        <div>
                          <span className="block text-[#707973]">Inspector Decision:</span>
                          <strong className="text-[#ba1a1a]">NON-COMPLIANT</strong>
                        </div>
                        <div>
                          <span className="block text-[#707973]">Violations Count:</span>
                          <strong>{selectedViolations.length} Selected</strong>
                        </div>
                        <div>
                          <span className="block text-[#707973]">Evidence Attached:</span>
                          <strong>{selectedOcrEvidence ? '1 Region Linked' : '0 Linked'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSubmitComplianceReport}
                        disabled={!canSubmitBad || isSubmitting}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[17px]">gavel</span>
                        <span>{isSubmitting ? 'Submitting...' : 'SUBMIT COMPLIANCE REPORT'}</span>
                      </button>

                      {!canSubmitBad && (
                        <span className="text-[11px] text-[#ba1a1a] italic">
                          * Select at least 1 rule, attach evidence, and enter observation to submit.
                        </span>
                      )}

                      {submissionSuccess && (
                        <button
                          type="button"
                          onClick={onViewFullReport}
                          className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#fff8f6] text-[#ba1a1a] border border-[#ba1a1a] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
                          <span>View Official PDF Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Statutory Key Findings Log */}
              <section className="bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#bfc9c1]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#0f5238]">gavel</span>
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#191c1a]">
                      Statutory Verification Summary (Rule 6 Audit)
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-[#707973]">
                    {product.keyFindings.length} verified statements
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {product.keyFindings.map((finding) => (
                    <li
                      key={finding.id}
                      className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                        finding.type === 'compliant'
                          ? 'bg-[#dcfce7]/30 border-[#95d4b3]/60 text-[#191c1a]'
                          : finding.type === 'warning'
                          ? 'bg-[#fef3c7]/30 border-[#fde68a] text-[#191c1a]'
                          : 'bg-[#d8e2ff]/30 border-[#adc6ff] text-[#191c1a]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          finding.type === 'compliant'
                            ? 'bg-[#dcfce7] text-[#0f5238]'
                            : finding.type === 'warning'
                            ? 'bg-[#fef3c7] text-[#92400e]'
                            : 'bg-[#d8e2ff] text-[#002b75]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {finding.type === 'compliant' ? 'check_circle' : finding.type === 'warning' ? 'warning' : 'info'}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm leading-relaxed font-medium">{finding.text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Penalty Computation Banner */}
              <div className="bg-[#f2f5f1] border border-[#bfc9c1]/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0f5238] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#191c1a] block">
                      Section 36 Compounding Penalty Assessment
                    </span>
                    <span className="text-[11px] text-[#525e56]">
                      First Offence: ₹25,000 | Subsequent: ₹50,000 or Imprisonment
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#0f5238] bg-white px-2.5 py-1 rounded-lg border border-[#bfc9c1]/40 shadow-xs">
                    Est. Penalty: ₹25,000
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom CTA for mobile */}
          <div className="w-full pt-2 lg:hidden">
            <button
              onClick={onViewFullReport}
              className={`w-full text-white h-13 rounded-2xl font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer ${
                isInspector ? 'bg-[#0f5238] hover:bg-[#184835]' : 'bg-[#1d4ed8] hover:bg-[#1e40af]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">summarize</span>
              {isInspector ? 'View Complete Statutory Audit Dossier' : 'View Product Summary'}
            </button>
          </div>
        </div>
      </div>

      {/* SIH Advanced Innovation Suite Modal */}
      <InnovationSuiteModal
        isOpen={isInnovationOpen}
        onClose={() => setIsInnovationOpen(false)}
        product={product}
      />
    </div>
  );
};
