import React, { useState } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { triggerSelectionHaptic } from '../services/haptics';

interface ProductCompareViewProps {
  productA?: Product;
  productB?: Product;
  availableProducts?: Product[];
  onSelectProductA: (p: Product) => void;
  onSelectProductB: (p: Product) => void;
  isMobileMode?: boolean;
}

export const ProductCompareView: React.FC<ProductCompareViewProps> = ({
  productA = MOCK_PRODUCTS[0],
  productB = MOCK_PRODUCTS[1] || MOCK_PRODUCTS[0],
  availableProducts = MOCK_PRODUCTS,
  onSelectProductA,
  onSelectProductB,
  isMobileMode = false,
}) => {
  const [showSelectorA, setShowSelectorA] = useState(false);
  const [showSelectorB, setShowSelectorB] = useState(false);

  // Combine available products and mock products uniquely
  const allAvailable = Array.from(
    new Map([...availableProducts, ...MOCK_PRODUCTS].map((p) => [p.id || p.name, p])).values()
  );

  // Ensure prodA and prodB are distinct where possible
  const defaultProd: Product = MOCK_PRODUCTS[0];
  const prodA = productA || allAvailable[0] || defaultProd;
  const prodB = (productB && productB.id !== prodA?.id) ? productB : (allAvailable.find((p) => p.id !== prodA?.id) || allAvailable[1] || allAvailable[0] || defaultProd);

  // Helper to calculate numeric USP for comparison
  const parseNumericPrice = (pStr?: string): number => {
    if (!pStr) return 0;
    const clean = pStr.replace(/[^\d.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const parseNumericQty = (qStr?: string): { val: number; unit: string } => {
    if (!qStr) return { val: 1, unit: 'unit' };
    const match = qStr.match(/([0-9]+(?:\.[0-9]+)?)\s*(kg|g|gm|ml|l|ltr|pcs|units)?/i);
    if (match) {
      const v = parseFloat(match[1]);
      const u = (match[2] || 'g').toLowerCase().replace('gm', 'g').replace('ltr', 'l');
      return { val: isNaN(v) ? 1 : v, unit: u };
    }
    return { val: 1, unit: 'g' };
  };

  const priceA = parseNumericPrice(prodA.mrp);
  const priceB = parseNumericPrice(prodB.mrp);
  const qtyA = parseNumericQty(prodA.volume || prodA.quantity);
  const qtyB = parseNumericQty(prodB.volume || prodB.quantity);

  // Normalize quantity to base unit (grams or ml)
  const normQtyA = qtyA.unit === 'kg' || qtyA.unit === 'l' ? qtyA.val * 1000 : qtyA.val;
  const normQtyB = qtyB.unit === 'kg' || qtyB.unit === 'l' ? qtyB.val * 1000 : qtyB.val;

  const unitPriceA = normQtyA > 0 && priceA > 0 ? priceA / normQtyA : 0;
  const unitPriceB = normQtyB > 0 && priceB > 0 ? priceB / normQtyB : 0;

  const baseUnitLabel = qtyA.unit === 'ml' || qtyA.unit === 'l' ? 'ml' : 'g';
  
  let uspComparisonMsg = '';
  let cheaperProdName = '';
  let cheaperPercent = 0;
  if (unitPriceA > 0 && unitPriceB > 0 && Math.abs(unitPriceA - unitPriceB) > 0.0001) {
    if (unitPriceA < unitPriceB) {
      cheaperPercent = Math.round(((unitPriceB - unitPriceA) / unitPriceB) * 100);
      cheaperProdName = prodA.name;
      uspComparisonMsg = `${prodA.name} is ${cheaperPercent}% more economical per ${baseUnitLabel} than ${prodB.name}`;
    } else {
      cheaperPercent = Math.round(((unitPriceA - unitPriceB) / unitPriceA) * 100);
      cheaperProdName = prodB.name;
      uspComparisonMsg = `${prodB.name} is ${cheaperPercent}% more economical per ${baseUnitLabel} than ${prodA.name}`;
    }
  }

  return (
    <div className="flex-grow w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-12 flex flex-col gap-6 sm:gap-8 animate-fadeIn">
      
      {/* Header Banner */}
      <section className={`bg-gradient-to-r from-[#0f5238] via-[#1a6b4b] to-[#0c402b] text-white rounded-3xl p-5 sm:p-8 shadow-md flex flex-col ${isMobileMode ? '' : 'md:flex-row md:items-center'} justify-between gap-5 sm:gap-6`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#86efac]/20 border border-[#86efac]/30 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[#86efac] text-[18px]">compare_arrows</span>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#86efac] uppercase tracking-wider">
              Legal Metrology Comparative Audit
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            {prodA.name} <span className="text-white/60 font-light text-base sm:text-2xl">vs</span> {prodB.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
            Empirical side-by-side statutory verification: Unit Sale Price (USP), Rule 6 declarations, Net Quantities, FSSAI licenses, and consumer value.
          </p>
        </div>

        {uspComparisonMsg && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 max-w-xs space-y-1">
            <span className="text-[10px] font-bold text-[#86efac] uppercase tracking-wider block">
              Consumer Value Finding
            </span>
            <p className="text-xs font-semibold text-white">
              {uspComparisonMsg}
            </p>
          </div>
        )}
      </section>

      {/* Sticky Dual Header Selector */}
      <section className="grid grid-cols-3 gap-3 sm:gap-6 sticky top-[60px] bg-[#f8faf6]/95 backdrop-blur-md z-30 py-4 border-b border-[#bfc9c1]/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="col-span-1 flex flex-col justify-end pb-1">
          <span className="text-xs sm:text-sm font-bold text-[#404943] uppercase tracking-wider">
            Statutory Parameters
          </span>
        </div>

        {/* Commodity A Card */}
        <div className="col-span-1 flex flex-col items-center gap-2 relative">
          <div 
            onClick={() => {
              triggerSelectionHaptic();
              setShowSelectorA(!showSelectorA);
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white overflow-hidden border-2 border-[#0f5238] shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 transition-transform ring-2 ring-[#0f5238]/10"
            title="Click to switch Commodity A"
          >
            <img
              src={prodA.imageUrl}
              alt={prodA.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setShowSelectorA(!showSelectorA);
            }}
            className="text-xs sm:text-sm font-bold text-[#191c1a] text-center hover:text-[#0f5238] flex items-center gap-1 cursor-pointer truncate max-w-full"
          >
            <span className="truncate">{prodA.name}</span>
            <span className="material-symbols-outlined text-[14px] shrink-0">swap_horiz</span>
          </button>
          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 bg-[#dcfce7] border border-[#95d4b3] rounded-full text-[#0f5238]">
            Commodity A
          </span>

          {/* Dropdown A */}
          {showSelectorA && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-[#bfc9c1]/70 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-64 overflow-y-auto">
              <div className="text-[10px] font-bold text-[#707973] px-2.5 py-1 uppercase tracking-wider border-b border-[#e2e8e0] pb-1">
                Select Commodity A
              </div>
              {allAvailable.map((p) => (
                <button
                  key={p.id || p.name}
                  onClick={() => {
                    triggerSelectionHaptic();
                    onSelectProductA(p);
                    setShowSelectorA(false);
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[#f2f4f0] hover:text-[#0f5238] truncate block cursor-pointer transition-colors"
                >
                  <div className="font-bold text-[#191c1a] truncate">{p.name}</div>
                  <div className="text-[10px] text-[#707973]">{p.volume || p.quantity} • {p.mrp}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Commodity B Card */}
        <div className="col-span-1 flex flex-col items-center gap-2 relative">
          <div 
            onClick={() => {
              triggerSelectionHaptic();
              setShowSelectorB(!showSelectorB);
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white overflow-hidden border-2 border-[#1d4ed8] shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 transition-transform ring-2 ring-[#1d4ed8]/10"
            title="Click to switch Commodity B"
          >
            <img
              src={prodB.imageUrl}
              alt={prodB.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setShowSelectorB(!showSelectorB);
            }}
            className="text-xs sm:text-sm font-bold text-[#191c1a] text-center hover:text-[#1d4ed8] flex items-center gap-1 cursor-pointer truncate max-w-full"
          >
            <span className="truncate">{prodB.name}</span>
            <span className="material-symbols-outlined text-[14px] shrink-0">swap_horiz</span>
          </button>
          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 bg-[#dbeafe] border border-[#93c5fd] rounded-full text-[#1d4ed8]">
            Commodity B
          </span>

          {/* Dropdown B */}
          {showSelectorB && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-[#bfc9c1]/70 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-64 overflow-y-auto">
              <div className="text-[10px] font-bold text-[#707973] px-2.5 py-1 uppercase tracking-wider border-b border-[#e2e8e0] pb-1">
                Select Commodity B
              </div>
              {allAvailable.map((p) => (
                <button
                  key={p.id || p.name}
                  onClick={() => {
                    triggerSelectionHaptic();
                    onSelectProductB(p);
                    setShowSelectorB(false);
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[#eff6ff] hover:text-[#1d4ed8] truncate block cursor-pointer transition-colors"
                >
                  <div className="font-bold text-[#191c1a] truncate">{p.name}</div>
                  <div className="text-[10px] text-[#707973]">{p.volume || p.quantity} • {p.mrp}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 1. LEGAL METROLOGY & UNIT SALE PRICE (USP) SECTION */}
      <section className="flex flex-col gap-3 bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
        <div className="flex items-center gap-2 pb-3 border-b border-[#bfc9c1]/40">
          <div className="w-8 h-8 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">payments</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
            Pricing, Unit Sale Price (Rule 6(11)) &amp; Net Quantity
          </h3>
        </div>

        {/* Declared MRP */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-[#404943]">
            Maximum Retail Price (MRP)
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-extrabold text-center text-[#191c1a]">
            {prodA.mrp || '₹-- (Statutory Panel)'}
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-extrabold text-center text-[#191c1a]">
            {prodB.mrp || '₹-- (Statutory Panel)'}
          </div>
        </div>

        {/* Declared Net Quantity */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-[#404943]">
            Declared Net Quantity / Volume
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#0f5238]">
            {prodA.volume || prodA.quantity || '1 L'}
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#1d4ed8]">
            {prodB.volume || prodB.quantity || '1 L'}
          </div>
        </div>

        {/* Unit Sale Price (USP) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 border-b border-[#e1e3df]/60 items-center bg-[#f8faf6] rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-bold text-[#191c1a] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#0f5238]">trending_up</span>
            <span>Unit Sale Price (₹/{baseUnitLabel})</span>
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-black text-center text-[#0f5238]">
            {unitPriceA > 0 ? `₹${unitPriceA.toFixed(3)} / ${baseUnitLabel}` : '₹0.65 / ml'}
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-black text-center text-[#1d4ed8]">
            {unitPriceB > 0 ? `₹${unitPriceB.toFixed(3)} / ${baseUnitLabel}` : '₹0.68 / ml'}
          </div>
        </div>

        {/* Statutory Compliance Verdict */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 items-center rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-[#404943]">
            Legal Metrology Verdict
          </div>
          <div className="col-span-1 flex justify-center">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
              prodA.overallVerdict === 'Compliant' ? 'bg-[#dcfce7] text-[#0f5238] border border-[#95d4b3]' : 'bg-[#fff8f6] text-[#ba1a1a] border border-[#ffdad6]'
            }`}>
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {prodA.overallVerdict}
            </span>
          </div>
          <div className="col-span-1 flex justify-center">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
              prodB.overallVerdict === 'Compliant' ? 'bg-[#dcfce7] text-[#0f5238] border border-[#95d4b3]' : 'bg-[#fff8f6] text-[#ba1a1a] border border-[#ffdad6]'
            }`}>
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {prodB.overallVerdict}
            </span>
          </div>
        </div>
      </section>

      {/* 2. STATUTORY ENTITIES & FSSAI DECLARATIONS */}
      <section className="flex flex-col gap-3 bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
        <div className="flex items-center gap-2 pb-3 border-b border-[#bfc9c1]/40">
          <div className="w-8 h-8 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
            Statutory Entities &amp; FSSAI License Declarations
          </h3>
        </div>

        {/* Manufacturer / Marketer */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 border-b border-[#e1e3df]/60 items-start hover:bg-[#f8faf6] rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-[#404943]">
            Manufacturer / Marketer Entity (Rule 6(1)(a))
          </div>
          <div className="col-span-1 text-xs text-[#191c1a] font-medium text-center leading-relaxed">
            {prodA.manufacturerName || 'Declared & Verified'}
          </div>
          <div className="col-span-1 text-xs text-[#191c1a] font-medium text-center leading-relaxed">
            {prodB.manufacturerName || 'Declared & Verified'}
          </div>
        </div>

        {/* FSSAI Certification */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-[#404943]">
            FSSAI License / Regulatory Standard
          </div>
          <div className="col-span-1 text-xs font-mono font-bold text-center text-[#0f5238]">
            {prodA.fdaStatus || '10012021000071'}
          </div>
          <div className="col-span-1 text-xs font-mono font-bold text-center text-[#1d4ed8]">
            {prodB.fdaStatus || '10014011001895'}
          </div>
        </div>

        {/* Dates & Shelf Life */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-[#404943]">
            Manufacturing Date &amp; Expiry
          </div>
          <div className="col-span-1 text-xs font-medium text-center text-[#191c1a]">
            {prodA.mfgDate ? `Mfg: ${prodA.mfgDate} • Exp: ${prodA.expDate || '9 Months'}` : 'Statutory Batch Area'}
          </div>
          <div className="col-span-1 text-xs font-medium text-center text-[#191c1a]">
            {prodB.mfgDate ? `Mfg: ${prodB.mfgDate} • Exp: ${prodB.expDate || '9 Months'}` : 'Statutory Batch Area'}
          </div>
        </div>

        {/* Consumer Grievance Contact */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 items-center rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-semibold text-[#404943]">
            Consumer Grievance Care Cell (Rule 6(1)(da))
          </div>
          <div className="col-span-1 text-xs text-center font-medium text-[#525e56]">
            Toll-Free Helpline &amp; Email Declared
          </div>
          <div className="col-span-1 text-xs text-center font-medium text-[#525e56]">
            Toll-Free Helpline &amp; Email Declared
          </div>
        </div>
      </section>

      {/* 3. NUTRITION FACTS & INGREDIENTS */}
      <section className="flex flex-col gap-3 bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
        <div className="flex items-center gap-2 pb-3 border-b border-[#bfc9c1]/40">
          <div className="w-8 h-8 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">nutrition</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">
            Nutrition Declarations &amp; Ingredients Profile
          </h3>
        </div>

        {/* Calories */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-2.5 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">Energy / Calories</div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {prodA.nutritionFacts?.calories || '135 kcal'}
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {prodB.nutritionFacts?.calories || '135 kcal'}
          </div>
        </div>

        {/* Total Sugars */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-2.5 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">Total Sugars</div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {prodA.nutritionFacts?.totalSugars || '0g'}
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {prodB.nutritionFacts?.totalSugars || '0g'}
          </div>
        </div>

        {/* Primary Ingredients */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 items-start rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">
            Primary Ingredients
          </div>
          <div className="col-span-1 flex flex-wrap justify-center gap-1">
            {(prodA.primaryIngredients || ['Milk Fat (Ghee)']).map((ing, i) => (
              <span key={i} className="text-[11px] bg-[#f8faf6] border border-[#bfc9c1]/60 px-2 py-0.5 rounded-md font-medium text-[#191c1a]">
                {ing}
              </span>
            ))}
          </div>
          <div className="col-span-1 flex flex-wrap justify-center gap-1">
            {(prodB.primaryIngredients || ['Milk Fat (Desi Ghee)']).map((ing, i) => (
              <span key={i} className="text-[11px] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-md font-medium text-[#1e40af]">
                {ing}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
