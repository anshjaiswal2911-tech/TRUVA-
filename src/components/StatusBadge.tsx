import React from 'react';
import { ModuleStatus, Verdict } from '../types';

interface StatusBadgeProps {
  status: ModuleStatus | Verdict | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getStyle = () => {
    switch (status) {
      case 'Compliant':
      case 'Verified':
        return 'bg-[#dcfce7] text-[#15803d] border-[#86efac]';
      case 'Potential Violation':
      case 'Non-Compliant':
      case 'Discrepancy':
        return 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]';
      case 'Requires Verification':
      case 'Review':
      case 'Needs Review':
      default:
        return 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return 'text-[10px] px-2 py-0.5 font-bold rounded-md';
      case 'lg':
        return 'text-xs px-3.5 py-1.5 font-extrabold rounded-xl';
      case 'md':
      default:
        return 'text-[11px] px-2.5 py-1 font-bold rounded-lg';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border uppercase tracking-wider ${getStyle()} ${getSizeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
};
