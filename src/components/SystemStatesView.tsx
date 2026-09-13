import React from 'react';
import { useAuth } from '../context/AuthContext';

interface SystemStatesViewProps {
  onScanClick?: () => void;
  isOffline?: boolean;
  isSimulatedOffline?: boolean;
  onToggleSimulatedOffline?: () => void;
  cachedProducts?: any[];
  onSelectProduct?: (product: any) => void;
}

export const SystemStatesView: React.FC<SystemStatesViewProps> = ({
  onScanClick,
  isOffline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  cachedProducts,
  onSelectProduct,
}) => {
  const { isInspector } = useAuth();

  const stateRules = [
    { state: 'Maharashtra', zone: 'Western Directorate', rules: 'Standard LM Rules 2011 + Marathi label mandatory on PDP', complianceRate: '94.2%', activeOfficers: 210 },
    { state: 'Delhi NCR', zone: 'Northern Directorate', rules: 'Mandatory QR Code on high-value FMCG packaging', complianceRate: '96.8%', activeOfficers: 145 },
    { state: 'Karnataka', zone: 'Southern Directorate', rules: 'Kannada bilingual MRP declaration requirement (Rule 6)', complianceRate: '91.5%', activeOfficers: 180 },
    { state: 'Tamil Nadu', zone: 'Southern Directorate', rules: 'Strict Schedule II numeral height enforcement', complianceRate: '95.1%', activeOfficers: 165 },
    { state: 'Gujarat', zone: 'Western Directorate', rules: 'Dairy & edible oil mandatory density calibration (Rule 12)', complianceRate: '97.4%', activeOfficers: 142 },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0f5238] text-xs font-bold mb-2">
          <span className="material-symbols-outlined text-[16px]">policy</span>
          <span>Inter-State Metrology Harmonization Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#191c1a] tracking-tight">
          State-Wise Statutory Metrology Provisions
        </h1>
        <p className="text-xs sm:text-sm text-[#707973] mt-1">
          State-specific amendments, bilingual labeling requirements, and regional inspection directives under the Legal Metrology Act, 2009.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stateRules.map((st, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-[#bfc9c1]/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#191c1a]">{st.state}</h2>
              <span className="text-[10px] font-bold bg-[#dcfce7] text-[#0f5238] px-2 py-0.5 rounded">
                {st.zone}
              </span>
            </div>

            <p className="text-xs text-[#404943] leading-relaxed">
              <strong>Specific Provision:</strong> {st.rules}
            </p>

            <div className="pt-3 border-t border-[#e2e8e0] grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-[10px] text-[#707973] uppercase font-bold">Compliance Rate</div>
                <div className="font-extrabold text-emerald-700">{st.complianceRate}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#707973] uppercase font-bold">Active Officers</div>
                <div className="font-extrabold text-[#191c1a]">{st.activeOfficers}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
