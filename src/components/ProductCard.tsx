import React from 'react';
import { Product } from '../types';
import { StatusBadge } from './StatusBadge';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  compact?: boolean;
  isOfflineCached?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  compact = false,
  isOfflineCached,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#bfc9c1]/50 hover:border-[#2d6a4f]/50 rounded-2xl p-3.5 sm:p-4 flex flex-row items-center gap-3.5 sm:gap-4 hover:bg-white hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_-1px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_-4px_rgba(15,82,56,0.08),0_2px_6px_-2px_rgba(0,0,0,0.04)] active:scale-[0.99]"
    >
      {/* Product Image Thumbnail */}
      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[#e7e9e5] flex-shrink-0 border border-[#bfc9c1]/40 ring-1 ring-black/5 relative shadow-xs">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {product.overallVerdict === 'Potential Violation' && (
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#ba1a1a]"></div>
        )}
      </div>

      {/* Main Content Info */}
      <div className="flex flex-col flex-grow min-w-0 justify-center">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#191c1a] tracking-tight truncate group-hover:text-[#0f5238] transition-colors">
            {product.name}
          </h3>
          <div className="shrink-0">
            <StatusBadge status={product.overallVerdict} size="sm" />
          </div>
        </div>

        {/* Structured Metadata Chips */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#404943]">
          {product.inspectionId && (
            <span className="font-mono font-bold text-[#0f5238] bg-[#dcfce7] px-2 py-0.5 rounded-md text-[11px] border border-[#95d4b3]/60 tracking-wider">
              {product.inspectionId}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[#404943] text-[12px] truncate max-w-[160px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#95d4b3]"></span>
            {product.category}
          </span>
          <span className="text-[#707973] text-[11px]">
            • {product.inspectionDate}
          </span>
          {product.mrp && !compact && (
            <span className="font-semibold text-[#191c1a] bg-[#f2f4f0] px-2 py-0.5 rounded-md text-[11px] border border-[#bfc9c1]/50 hidden sm:inline-block">
              MRP {product.mrp}
            </span>
          )}
        </div>
      </div>

      {/* Action Chevron & Desktop Prompt */}
      <div className="flex items-center gap-1.5 shrink-0 text-[#707973] opacity-60 group-hover:opacity-100 group-hover:text-[#0f5238] transition-all">
        <span className="hidden xl:inline text-xs font-bold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
          Open Dossier
        </span>
        <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">
          chevron_right
        </span>
      </div>
    </div>
  );
};
