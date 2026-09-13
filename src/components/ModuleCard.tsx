import React from 'react';
import { DetailedModule } from '../types';
import { StatusBadge } from './StatusBadge';
import { triggerSelectionHaptic } from '../services/haptics';

interface ModuleCardProps {
  module: DetailedModule;
  onClick?: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  return (
    <div
      onClick={() => {
        triggerSelectionHaptic();
        onClick?.();
      }}
      className="bg-[#f8faf6] hover:bg-white border border-[#bfc9c1]/60 hover:border-[#0f5238]/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#bfc9c1]/40 flex items-center justify-center text-[#0f5238] shadow-2xs group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">{module.icon}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-[#191c1a] group-hover:text-[#0f5238] transition-colors line-clamp-1">
              {module.title}
            </h4>
          </div>
          <StatusBadge status={module.status} size="sm" />
        </div>

        <p className="text-[11.5px] text-[#525e56] line-clamp-2 leading-relaxed mt-1">
          {module.primaryFinding}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#bfc9c1]/30 flex items-center justify-between text-[11px] text-[#707973] font-medium">
        <span>{module.details.length} parameters audited</span>
        <span className="text-[#0f5238] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          <span>View Details</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </span>
      </div>
    </div>
  );
};
