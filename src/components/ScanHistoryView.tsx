import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { getCacheStats, clearScanCache, resetCacheToDefaults, deleteCachedProduct } from '../services/scanCache';

interface ScanHistoryViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onScanNew: () => void;
  onRefreshProducts?: (updatedProducts: Product[]) => void;
  isOffline?: boolean;
  isMobileMode?: boolean;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  products,
  onSelectProduct,
  onScanNew,
  onRefreshProducts,
  isOffline = false,
  isMobileMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Compliant' | 'Potential Violation' | 'Requires Verification'>('All');
  const [showManageCache, setShowManageCache] = useState(false);
  const cacheStats = getCacheStats();

  const handleClearCache = () => {
    if (window.confirm('Clear all cached scan results from local storage?')) {
      const empty = clearScanCache();
      if (onRefreshProducts) {
        onRefreshProducts(empty);
      }
    }
  };

  const handleResetDefaults = () => {
    const defaults = resetCacheToDefaults();
    if (onRefreshProducts) {
      onRefreshProducts(defaults);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const updated = deleteCachedProduct(productId);
    if (onRefreshProducts) {
      onRefreshProducts(updated);
    }
  };

  const filteredProducts = products.filter((item) => {
    // Search query filter
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.inspectionId && item.inspectionId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Tab category filter
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Compliant') return item.overallVerdict === 'Compliant';
    if (activeFilter === 'Potential Violation') return item.overallVerdict === 'Potential Violation';
    if (activeFilter === 'Requires Verification') return item.overallVerdict === 'Requires Verification';

    return true;
  });

  const counts = {
    All: products.length,
    Compliant: products.filter((p) => p.overallVerdict === 'Compliant').length,
    'Potential Violation': products.filter((p) => p.overallVerdict === 'Potential Violation').length,
    'Requires Verification': products.filter((p) => p.overallVerdict === 'Requires Verification').length,
  };

  return (
    <div className="flex-grow w-full max-w-[1280px] xl:max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8 pb-28 md:pb-12 flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#eef1ed] border border-[#d8deda] text-[11px] font-semibold text-[#0f5238] uppercase tracking-wider mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238]"></span>
            Audit Records & Archive
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#191c1a] tracking-tight">
            Scan History
          </h1>
          <p className="text-xs md:text-sm text-[#404943] mt-0.5">
            Inspect, search, and audit previously analyzed packaged commodities and statutory dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowManageCache(!showManageCache)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showManageCache
                ? 'bg-[#0f5238] text-white border-[#0f5238] shadow-sm'
                : 'bg-white text-[#404943] border-[#bfc9c1]/80 hover:bg-[#f2f4f0] shadow-[0px_1px_2px_rgba(0,0,0,0.04)]'
            }`}
            title="Toggle offline storage details"
          >
            <span className="material-symbols-outlined text-[17px]">storage</span>
            <span>Storage ({cacheStats.sizeKB} KB)</span>
          </button>
          <button
            onClick={onScanNew}
            className="px-4 py-2 bg-[#0f5238] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_2px_8px_rgba(15,82,56,0.25)] hover:shadow-[0_4px_12px_rgba(15,82,56,0.35)] cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">document_scanner</span>
            New Inspection
          </button>
        </div>
      </div>

      {/* Offline Status Alert Banner if disconnected */}
      {isOffline && (
        <div className="bg-[#f2f4f0] border border-[#bfc9c1] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#bfc9c1]/60 flex items-center justify-center text-[#707973] shrink-0">
            <span className="material-symbols-outlined text-[20px]">cloud_off</span>
          </div>
          <div className="flex-1 text-xs">
            <span className="font-bold text-[#191c1a] block text-sm">
              Local Offline Mirror Active
            </span>
            <span className="text-[#404943]">
              Operating without live network connection. Displaying all {products.length} cached statutory dossiers stored locally on this terminal.
            </span>
          </div>
        </div>
      )}

      {/* Cache Management Panel (Collapsible) */}
      {showManageCache && (
        <div className="bg-white border border-[#bfc9c1]/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0f5238]"></span>
              <strong className="text-[#191c1a] text-sm font-bold">LocalStorage Offline Storage Engine</strong>
              <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#0f5238] font-bold text-[10px] tracking-wide uppercase">Active</span>
            </div>
            <p className="text-[#404943] text-xs">
              Cached Scans: <strong className="text-[#191c1a] font-semibold">{products.length} records</strong> • Storage Footprint: <strong className="text-[#191c1a] font-semibold">{cacheStats.sizeKB} KB</strong> • Last Synced: <strong className="text-[#191c1a] font-semibold">{cacheStats.lastUpdated}</strong>
            </p>
            <p className="text-[#707973] text-[11px]">
              Full Legal Metrology declaration checks, audit logs, and evidence photos remain fully available offline.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#0f5238] bg-[#dcfce7] hover:bg-[#bbf7d0] rounded-xl border border-[#bbf7d0] transition-colors cursor-pointer"
            >
              Reset Samples
            </button>
            <button
              onClick={handleClearCache}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6]/60 hover:bg-[#ffdad6] rounded-xl border border-[#ffb4ab] transition-colors cursor-pointer"
            >
              Clear Storage
            </button>
          </div>
        </div>
      )}

      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#707973]">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commodities by brand, title, barcode or inspection ID..."
            className="w-full bg-white border border-[#bfc9c1]/80 rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#191c1a] font-medium focus:outline-none focus:ring-2 focus:ring-[#0f5238]/20 focus:border-[#0f5238] placeholder-[#707973] transition-all shadow-[0px_1px_3px_rgba(0,0,0,0.03)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#707973] hover:text-[#191c1a] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-0.5">
          {(['All', 'Compliant', 'Potential Violation', 'Requires Verification'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            const count = counts[filter];
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0f5238] text-white shadow-sm font-bold'
                    : 'bg-white text-[#404943] border border-[#bfc9c1]/70 hover:bg-[#f2f4f0] shadow-[0px_1px_2px_rgba(0,0,0,0.02)]'
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#eceeea] text-[#404943]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scan History List */}
      <div className={`flex flex-col ${isMobileMode ? '' : 'lg:grid lg:grid-cols-2'} gap-3.5 sm:gap-4`}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard
                product={product}
                onClick={() => onSelectProduct(product)}
                isOfflineCached={true}
              />
              <button
                onClick={(e) => handleDeleteItem(e, product.id)}
                className="absolute right-9 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-[#707973] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-xl transition-all cursor-pointer hidden md:flex items-center justify-center border border-transparent hover:border-[#ffb4ab]"
                title="Remove from local cache"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#bfc9c1]/70 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#eef1ed] flex items-center justify-center text-[#707973] border border-[#d8deda]">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#191c1a]">No matching inspections found</h3>
              <p className="text-xs text-[#404943] max-w-sm leading-relaxed">
                {searchQuery ? `No archived commodity dossiers match "${searchQuery}" under ${activeFilter}.` : 'No inspections are currently archived in the offline storage cache.'}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleResetDefaults}
                className="text-xs font-bold bg-[#0f5238] text-white px-4 py-2 rounded-xl hover:bg-[#2d6a4f] transition-all cursor-pointer shadow-sm"
              >
                Load Sample Dossiers
              </button>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('All');
                  }}
                  className="text-xs font-semibold text-[#404943] hover:text-[#191c1a] px-3 py-2 rounded-xl border border-[#bfc9c1]/70 hover:bg-[#f2f4f0] transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
