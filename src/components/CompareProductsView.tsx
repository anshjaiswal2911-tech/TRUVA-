import React, { useState } from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { triggerSelectionHaptic } from '../services/haptics';

interface CompareProductsViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const CompareProductsView: React.FC<CompareProductsViewProps> = ({
  products,
  onSelectProduct,
}) => {
  const { isInspector } = useAuth();
  const [prodAId, setProdAId] = useState<string>(products[0]?.id || '');
  const [prodBId, setProdBId] = useState<string>(products[1]?.id || products[0]?.id || '');

  const prodA = products.find((p) => p.id === prodAId) || products[0];
  const prodB = products.find((p) => p.id === prodBId) || products[1] || products[0];

  const activeColor = isInspector ? 'text-[#0f5238]' : 'text-[#0058be]';
  const activeBg = isInspector ? 'bg-[#0f5238]' : 'bg-[#0058be]';

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#191c1a] tracking-tight">
          {isInspector ? 'Statutory Commodity Comparative Audit' : 'Compare Packages & Detect Shrinkflation'}
        </h1>
        <p className="text-xs sm:text-sm text-[#707973] mt-1">
          Compare Unit Sale Prices (USP), font height compliance, declared vs actual net weights, and statutory declarations side-by-side.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl border border-[#bfc9c1]/60 shadow-xs">
          <label className="block text-xs font-bold text-[#404943] mb-2">
            Select First Commodity:
          </label>
          <select
            value={prodAId}
            onChange={(e) => {
              triggerSelectionHaptic();
              setProdAId(e.target.value);
            }}
            className="w-full p-2.5 bg-[#f8faf6] border border-[#bfc9c1] rounded-xl text-xs font-bold text-[#191c1a] focus:outline-hidden"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.quantity || p.volume} - {p.mrp})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#bfc9c1]/60 shadow-xs">
          <label className="block text-xs font-bold text-[#404943] mb-2">
            Select Second Commodity:
          </label>
          <select
            value={prodBId}
            onChange={(e) => {
              triggerSelectionHaptic();
              setProdBId(e.target.value);
            }}
            className="w-full p-2.5 bg-[#f8faf6] border border-[#bfc9c1] rounded-xl text-xs font-bold text-[#191c1a] focus:outline-hidden"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.quantity || p.volume} - {p.mrp})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[prodA, prodB].map((item, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-[#bfc9c1]/60 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="relative w-full h-52 rounded-2xl bg-gray-900 overflow-hidden mb-4">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase shadow-xs ${
                  item.overallVerdict === 'Compliant'
                    ? 'bg-emerald-600 text-white'
                    : item.overallVerdict === 'Potential Violation'
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-500 text-black'
                }`}>
                  {item.overallVerdict}
                </span>
              </div>

              <div className="text-xs font-bold text-[#707973] uppercase">{item.category}</div>
              <h2 className="text-lg font-black text-[#191c1a] mt-1">{item.name}</h2>
              <p className="text-xs text-[#707973] mb-4">{item.subtitle}</p>

              <div className="space-y-3 border-t border-[#e2e8e0] pt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-[#f2f4f0]">
                  <span className="text-[#707973] font-semibold">Maximum Retail Price (MRP):</span>
                  <span className="font-extrabold text-[#191c1a]">{item.mrp}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#f2f4f0]">
                  <span className="text-[#707973] font-semibold">Declared Net Quantity:</span>
                  <span className="font-bold text-[#191c1a]">{item.quantity || item.volume}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#f2f4f0]">
                  <span className="text-[#707973] font-semibold">Rule 6(1)(s) Unit Sale Price:</span>
                  <span className="font-mono font-extrabold text-[#0f5238]">
                    {item.modules.declarations.details.find((d) => d.label.includes('Unit Sale Price'))?.value || 'Rule 6 compliant'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#f2f4f0]">
                  <span className="text-[#707973] font-semibold">Manufacturer / Packer:</span>
                  <span className="font-medium text-[#191c1a] text-right truncate max-w-[200px]">{item.manufacturerName}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[#707973] font-semibold">Barcode Standard:</span>
                  <span className="font-mono text-[#191c1a]">{item.barcode}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerSelectionHaptic();
                onSelectProduct(item);
              }}
              className={`w-full mt-6 py-3 ${activeBg} text-white font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition-all cursor-pointer`}
            >
              Open Complete Inspection Dossier
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
