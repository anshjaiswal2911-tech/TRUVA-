import React, { useState } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { StatusBadge } from './StatusBadge';
import { triggerSelectionHaptic } from '../services/haptics';

interface ProductCompareViewProps {
  productA?: Product;
  productB?: Product;
  onSelectProductA: (p: Product) => void;
  onSelectProductB: (p: Product) => void;
}

export const ProductCompareView: React.FC<ProductCompareViewProps> = ({
  productA = MOCK_PRODUCTS[0], // Pepsi
  productB = MOCK_PRODUCTS[5], // Coke
  onSelectProductA,
  onSelectProductB,
}) => {
  const [showSelectorA, setShowSelectorA] = useState(false);
  const [showSelectorB, setShowSelectorB] = useState(false);

  return (
    <div className="flex-grow w-full max-w-[1280px] xl:max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-12 flex flex-col gap-6 sm:gap-8">
      {/* Header Section */}
      <section className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 bg-[#dcfce7] border border-[#95d4b3] px-3 py-1 rounded-full w-fit">
          <span className="material-symbols-outlined text-[#0f5238] text-[18px]">
            compare_arrows
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#0f5238] uppercase tracking-wider">
            COMMODITY COMPARISON AUDIT
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191c1a] tracking-tight">
          {productA.name} <span className="text-[#707973] font-light">vs</span> {productB.name}
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-[#404943] max-w-3xl leading-relaxed">
          Side-by-side statutory verification of declaration compliance, net quantities, ingredients, and regulatory certifications based on empirical package evidence.
        </p>
      </section>

      {/* Sticky Product Image & Name Headers */}
      <section className="grid grid-cols-3 gap-3 sm:gap-6 sticky top-[60px] bg-[#f8faf6]/95 backdrop-blur-md z-30 py-4 border-b border-[#bfc9c1]/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="col-span-1 flex flex-col justify-end pb-1">
          <span className="text-xs sm:text-sm font-bold text-[#404943] uppercase tracking-wider">
            Parameters
          </span>
        </div>

        {/* Product A */}
        <div className="col-span-1 flex flex-col items-center gap-2 relative">
          <div 
            onClick={() => {
              triggerSelectionHaptic();
              setShowSelectorA(!showSelectorA);
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white overflow-hidden border-2 border-[#0f5238] shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 transition-transform ring-2 ring-[#0f5238]/10"
            title="Click to switch Product A"
          >
            <img
              src={productA.imageUrl}
              alt={productA.name}
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
            <span className="truncate">{productA.name}</span>
            <span className="material-symbols-outlined text-[14px] shrink-0">swap_horiz</span>
          </button>
          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 bg-[#dcfce7] border border-[#95d4b3] rounded-full text-[#0f5238]">
            Commodity A
          </span>

          {/* Selector Dropdown A */}
          {showSelectorA && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-[#bfc9c1]/70 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-60 overflow-y-auto">
              <div className="text-[10px] font-bold text-[#707973] px-2.5 py-1 uppercase tracking-wider">Select Commodity A</div>
              {MOCK_PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    triggerSelectionHaptic();
                    onSelectProductA(p);
                    setShowSelectorA(false);
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[#f2f4f0] hover:text-[#0f5238] truncate block cursor-pointer transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product B */}
        <div className="col-span-1 flex flex-col items-center gap-2 relative">
          <div 
            onClick={() => {
              triggerSelectionHaptic();
              setShowSelectorB(!showSelectorB);
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white overflow-hidden border-2 border-[#0058be] shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 transition-transform ring-2 ring-[#0058be]/10"
            title="Click to switch Product B"
          >
            <img
              src={productB.imageUrl}
              alt={productB.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setShowSelectorB(!showSelectorB);
            }}
            className="text-xs sm:text-sm font-bold text-[#191c1a] text-center hover:text-[#0058be] flex items-center gap-1 cursor-pointer truncate max-w-full"
          >
            <span className="truncate">{productB.name}</span>
            <span className="material-symbols-outlined text-[14px] shrink-0">swap_horiz</span>
          </button>
          <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 bg-[#d8e2ff] border border-[#adc6ff] rounded-full text-[#002b75]">
            Commodity B
          </span>

          {/* Selector Dropdown B */}
          {showSelectorB && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-[#bfc9c1]/70 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-60 overflow-y-auto">
              <div className="text-[10px] font-bold text-[#707973] px-2.5 py-1 uppercase tracking-wider">Select Commodity B</div>
              {MOCK_PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    triggerSelectionHaptic();
                    onSelectProductB(p);
                    setShowSelectorB(false);
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-[#f2f4f0] hover:text-[#0058be] truncate block cursor-pointer transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 1. Nutrition Facts Section */}
      <section className="flex flex-col gap-3 bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 pb-3 border-b border-[#bfc9c1]/40">
          <div className="w-8 h-8 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">nutrition</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">Nutritional Declarations</h3>
          <span className="ml-auto text-[11px] font-medium text-[#707973] bg-[#f8faf6] px-2.5 py-0.5 rounded-full border border-[#bfc9c1]/40">
            Serving: {productA.nutritionFacts?.servingSize || 'Standard Serving'}
          </span>
        </div>

        {/* Calories */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-2.5 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] transition-colors rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">Calories</div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {productA.nutritionFacts?.calories || '150'}
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {productB.nutritionFacts?.calories || '140'}
          </div>
        </div>

        {/* Total Sugars */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-2.5 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] transition-colors rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">Total Sugars</div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {productA.nutritionFacts?.totalSugars || '41g'}
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {productB.nutritionFacts?.totalSugars || '39g'}
          </div>
        </div>

        {/* Sodium */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-2.5 items-center hover:bg-[#f8faf6] transition-colors rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">Sodium</div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {productA.nutritionFacts?.sodium || '30mg'}
          </div>
          <div className="col-span-1 text-xs sm:text-sm font-bold text-center text-[#191c1a]">
            {productB.nutritionFacts?.sodium || '45mg'}
          </div>
        </div>
      </section>

      {/* 2. Ingredients Profile Section */}
      <section className="flex flex-col gap-3 bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 pb-3 border-b border-[#bfc9c1]/40">
          <div className="w-8 h-8 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">science</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">Ingredients Profile</h3>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-1">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">
            Primary Ingredients
          </div>

          {/* Product A Ingredients */}
          <div className="col-span-1 flex flex-col gap-1.5">
            {(productA.primaryIngredients || ['Carbonated Water', 'Sugar', 'Caramel Color']).map((ing, i) => (
              <span
                key={i}
                className="text-xs bg-[#f8faf6] py-1 px-2.5 rounded-lg border border-[#bfc9c1]/50 font-medium text-[#191c1a] shadow-2xs"
              >
                {ing}
              </span>
            ))}
          </div>

          {/* Product B Ingredients */}
          <div className="col-span-1 flex flex-col gap-1.5">
            {(productB.primaryIngredients || ['Carbonated Water', 'Sugar', 'Caramel Color']).map((ing, i) => (
              <span
                key={i}
                className="text-xs bg-[#f8faf6] py-1 px-2.5 rounded-lg border border-[#bfc9c1]/50 font-medium text-[#191c1a] shadow-2xs"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Distinctive Additives */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-3 border-t border-[#e1e3df]/60 mt-2 items-center">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">
            Distinctive Additives
          </div>
          <div className="col-span-1 text-xs font-semibold border-l-2 border-[#0058be] pl-2 text-[#191c1a]">
            {productA.distinctiveAdditives || 'Citric Acid'}
          </div>
          <div className="col-span-1 text-xs font-semibold border-l-2 border-[#bfc9c1] pl-2 text-[#707973]">
            {productB.distinctiveAdditives || 'None specific'}
          </div>
        </div>
      </section>

      {/* 3. Regulatory & Evidence Section */}
      <section className="flex flex-col gap-3 bg-white border border-[#bfc9c1]/50 rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 pb-3 border-b border-[#bfc9c1]/40">
          <div className="w-8 h-8 rounded-xl bg-[#dcfce7] text-[#0f5238] flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#191c1a]">Regulatory &amp; Evidence Declarations</h3>
        </div>

        {/* FDA Status */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-2.5 border-b border-[#e1e3df]/60 items-center hover:bg-[#f8faf6] transition-colors rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">Regulatory Status</div>
          <div className="col-span-1 flex justify-center">
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-[#dcfce7] text-[#0f5238] border border-[#95d4b3] rounded-full inline-flex items-center gap-1 shadow-2xs">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              {productA.fdaStatus || 'GRAS'}
            </span>
          </div>
          <div className="col-span-1 flex justify-center">
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-[#dcfce7] text-[#0f5238] border border-[#95d4b3] rounded-full inline-flex items-center gap-1 shadow-2xs">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              {productB.fdaStatus || 'GRAS'}
            </span>
          </div>
        </div>

        {/* Public Data Availability */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 py-2.5 items-center hover:bg-[#f8faf6] transition-colors rounded-xl px-2">
          <div className="col-span-1 text-xs sm:text-sm font-medium text-[#404943]">
            Public Data Availability
          </div>
          <div className="col-span-1 flex justify-center">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-[#f2f4f0] text-[#191c1a] border border-[#bfc9c1]/60 rounded-full shadow-2xs">
              {productA.publicDataAvailability || 'High'}
            </span>
          </div>
          <div className="col-span-1 flex justify-center">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-[#f2f4f0] text-[#191c1a] border border-[#bfc9c1]/60 rounded-full shadow-2xs">
              {productB.publicDataAvailability || 'High'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
