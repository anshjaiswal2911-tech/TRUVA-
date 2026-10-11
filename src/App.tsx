import React, { useState, useEffect, useRef } from 'react';
import { Product, ActiveTab } from './types';
import { MOCK_PRODUCTS, MOCK_NOTIFICATIONS } from './data/mockProducts';
import { getCachedProducts, saveScannedProduct } from './services/scanCache';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { HeaderBar } from './components/HeaderBar';
import { BottomNavBar } from './components/BottomNavBar';
import { HomeView } from './components/HomeView';
import { NewInspectionView } from './components/NewInspectionView';
import { ProcessingScreen } from './components/ProcessingScreen';
import { InspectionResultView } from './components/InspectionResultView';
import { FullProductReportView } from './components/FullProductReportView';
import { EvidenceCheckDetailView } from './components/EvidenceCheckDetailView';
import { ProductCompareView } from './components/ProductCompareView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { SystemStatesView } from './components/SystemStatesView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthGateModal } from './components/AuthGateModal';

type ViewMode = 'main' | 'processing' | 'result' | 'full_report' | 'evidence_detail';

function TruvaApp() {
  const { isAuthenticated, isInspector, isConsumer, isLoading, signInInspector, signInConsumerWithEmail, switchRoleDemo, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // In mobile app mode: always treat layout as mobile so all inner views render pure native mobile components
  const isMobileAppLayout = true;
  const [isMobileMode, setIsMobileMode] = useState<boolean>(true);

  const handleMobileLogout = async () => {
    await signOut();
  };

  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 640 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleUrlRoute = () => {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      const mobileReq = params.get('view') === 'mobile' || hash.includes('mobile');
      setIsMobileMode(mobileReq);
    };
    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, []);
  
  // Persistent Scan History Cache via localStorage (real scans only)
  const [allProducts, setAllProducts] = useState<Product[]>(() => getCachedProducts());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    const initialCached = getCachedProducts();
    return initialCached.length > 0 ? initialCached[0] : null;
  });
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [customFileBlob, setCustomFileBlob] = useState<File | Blob | undefined>(undefined);

  // Network offline state detection and simulation
  const { isOffline, isSimulatedOffline, toggleSimulatedOffline } = useNetworkStatus();

  // Comparison State
  const [compareProductA, setCompareProductA] = useState<Product | undefined>(() => allProducts[0]);
  const [compareProductB, setCompareProductB] = useState<Product | undefined>(() => allProducts[1]);

  // Unread notification count
  const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => n.isUnread).length;

  const previousUrlRef = useRef<string | null>(null);

  // Handle starting a scan from camera or upload
  const handleStartScan = (product: Product, uploadedImage?: string, fileBlob?: File | Blob) => {
    if (previousUrlRef.current && previousUrlRef.current !== uploadedImage && previousUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrlRef.current);
    }
    previousUrlRef.current = uploadedImage || null;

    setSelectedProduct(product);
    setCustomImage(uploadedImage);
    setCustomFileBlob(fileBlob);
    setViewMode('processing');
  };

  // Handle completing scan animation and committing to cache
  const handleScanComplete = (realProduct?: Product) => {
    const productToSave = realProduct ?? selectedProduct;
    if (productToSave) {
      setSelectedProduct(productToSave);
      setViewMode('result');
      
      setAllProducts((prev) =>
        [productToSave, ...prev.filter((p) => p.id !== productToSave.id && p.inspectionId !== productToSave.inspectionId)].slice(0, 20)
      );

      saveScannedProduct(productToSave);
    } else {
      setViewMode('main');
    }
    setCustomFileBlob(undefined);
  };

  // Handle quick access tiles filter on Home
  const handleQuickAccessFilter = (categoryKey: string) => {
    if (categoryKey === 'requires_verification') {
      const match = allProducts.find((p) => p.overallVerdict === 'Requires Verification') || allProducts[0];
      if (match) {
        setSelectedProduct(match);
        setViewMode('result');
      } else {
        setActiveTab('scan');
        setViewMode('main');
      }
    } else if (categoryKey === 'history' || categoryKey === 'reports') {
      setActiveTab('history');
      setViewMode('main');
    } else {
      if (allProducts.length > 0) {
        setSelectedProduct(allProducts[0]);
        setViewMode('result');
      } else {
        setActiveTab('scan');
        setViewMode('main');
      }
    }
  };

  // State to control auth modal visibility and initial tab
  const [authModalRole, setAuthModalRole] = useState<'inspector' | 'consumer'>('consumer');

  // Handle Launching from Landing Page — prompts authentication modal
  const handleLandingLaunch = (role?: 'inspector' | 'consumer') => {
    setAuthModalRole(role || 'consumer');
    setShowAuthModal(true);
  };

  // Handle Header Back Action
  const handleBack = () => {
    if (viewMode === 'evidence_detail') {
      setViewMode('full_report');
    } else if (viewMode === 'full_report') {
      setViewMode('result');
    } else if (viewMode === 'result' || viewMode === 'processing') {
      setViewMode('main');
      setActiveTab(allProducts.length > 0 ? 'history' : 'home');
      setCustomImage(undefined);
      setCustomFileBlob(undefined);
    } else if (activeTab !== 'home') {
      setActiveTab('home');
    }
  };

  const getPageTitle = () => {
    if (viewMode === 'processing') return 'Legal Metrology Pipeline';
    if (viewMode === 'result') return 'Inspection Record';
    if (viewMode === 'full_report') return 'Statutory Dossier';
    if (viewMode === 'evidence_detail') return 'Statutory Rule Reference';
    if (activeTab === 'landing') return 'Platform Overview';
    if (activeTab === 'compare') return 'Commodity Comparison';
    if (activeTab === 'history') return 'Inspection History';
    if (activeTab === 'notifications') return 'Notifications';
    if (activeTab === 'settings') return 'Settings';
    if (activeTab === 'states') return 'System States';
    return undefined;
  };

  const shouldShowBack =
    viewMode !== 'main' || (activeTab !== 'home' && activeTab !== 'scan');

  const isSubView =
    viewMode === 'processing' ||
    viewMode === 'full_report' ||
    viewMode === 'evidence_detail';

  // Loading state screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faf6] flex flex-col items-center justify-center p-4 selection:bg-[#2d6a4f] selection:text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] flex items-center justify-center text-white shadow-md mb-4 animate-pulse">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-extrabold text-xl text-[#0f5238] tracking-tight">TRUVA</span>
        <span className="text-xs text-[#707973] mt-1 font-medium">Verifying Metrology Auth Session...</span>
      </div>
    );
  }

  // 1. Direct Authentication Screen (NO LANDING PAGE! Login page se sab shuru)
  if (!isAuthenticated) {
    if (isLargeScreen) {
      return (
        <div className="min-h-screen bg-[#0b131f] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617] flex flex-col justify-center items-center py-6 px-4 selection:bg-[#0f5238] selection:text-white relative overflow-hidden">
          {/* Subtle Background Glow & Grid Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Top Badge for Judges / Presentation */}
          <div className="mb-4 flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full shadow-lg z-20">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
              TRUVA Mobile App • Flutter Architecture
            </span>
          </div>

          {/* Flutter-style mobile device mockup */}
          <div className="w-[412px] h-[870px] max-h-[94vh] bg-[#f8faf6] rounded-[44px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6),0_0_0_12px_#1e293b,0_0_0_15px_#334155] border-4 border-[#0f172a] flex flex-col overflow-hidden relative z-10 transition-all">
            {/* Top Phone Dynamic Island / Speaker */}
            <div className="w-full h-8 bg-[#f8faf6] shrink-0 flex items-center justify-between px-7 pt-1.5 select-none z-30 border-b border-[#e5e9e4]/60">
              <span className="text-[11.5px] font-bold text-gray-800">9:41</span>
              <div className="w-20 h-4.5 bg-[#0f172a] rounded-full flex items-center justify-center gap-2 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-[#1e293b]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#0369a1]" />
              </div>
              <div className="flex items-center gap-1.5 text-gray-800">
                <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                <span className="material-symbols-outlined text-[13px]">wifi</span>
                <span className="material-symbols-outlined text-[14px]">battery_full</span>
              </div>
            </div>

            {/* Scrollable Device Content */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col">
              <AuthGateModal initialRole="consumer" />
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="w-full h-5 bg-[#f8faf6] shrink-0 flex items-center justify-center pb-1 border-t border-[#e5e9e4]/60">
              <div className="w-32 h-1 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>
      );
    }

    // Direct Mobile Screen View (Native Full Screen on Mobile Devices)
    return (
      <div className="min-h-screen bg-[#f8faf6] flex flex-col justify-center items-center p-3 sm:p-6">
        <AuthGateModal initialRole="consumer" />
      </div>
    );
  }

  const appContent = (
    <div className="min-h-full flex-1 bg-[#f8faf6] text-[#191c1a] flex flex-col font-sans selection:bg-[#2d6a4f] selection:text-white">

      {/* Top App Header */}
      <HeaderBar
        title={getPageTitle()}
        showBack={shouldShowBack}
        onBack={handleBack}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setViewMode('main');
          setActiveTab(tab);
        }}
        unreadCount={unreadNotifs}
        isOffline={isOffline}
        isMobileMode={isMobileMode || !isLargeScreen}
        onSignOut={handleMobileLogout}
      />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col ${isMobileMode ? 'pb-24' : 'pb-24 sm:pb-8'}`}>
        {/* Processing Pipeline Screen */}
        {viewMode === 'processing' && (
          <ProcessingScreen
            product={selectedProduct || {
              id: 'pending',
              inspectionId: 'INS-2026-PENDING',
              name: 'Analyzing Commodity Label...',
              subtitle: 'Extracting Legal Metrology Declarations',
              category: 'Packaged Commodity',
              barcode: 'Processing...',
              mrp: 'Extracting...',
              volume: 'Extracting...',
              quantity: 'Extracting...',
              imageUrl: customImage || '',
              imageAlt: 'Uploaded commodity label',
              inspectionDate: '07 Mar 2026',
              overallVerdict: 'Requires Verification',
              overallSummary: {
                declarations: { status: 'Compliant', label: 'Processing', icon: 'gavel', type: 'info' },
                netQuantity: { status: 'Compliant', label: 'Processing', icon: 'scale', type: 'info' },
                mrpTax: { status: 'Compliant', label: 'Processing', icon: 'payments', type: 'info' },
                evidence: { status: 'Compliant', label: 'Processing', icon: 'assignment', type: 'info' },
              },
              keyFindings: [{ id: '1', text: 'Analyzing label declarations...', type: 'info' }],
              modules: {
                declarations: { title: 'Declarations', icon: 'gavel', status: 'Compliant', statusType: 'info', subtitle: '', primaryFinding: '', details: [] },
                netQuantity: { title: 'Net Qty', icon: 'scale', status: 'Compliant', statusType: 'info', subtitle: '', primaryFinding: '', details: [] },
                mrpTax: { title: 'MRP', icon: 'payments', status: 'Compliant', statusType: 'info', subtitle: '', primaryFinding: '', details: [] },
                evidence: { title: 'Evidence', icon: 'assignment', status: 'Compliant', statusType: 'info', subtitle: '', primaryFinding: '', details: [] },
              },
            }}
            customImage={customImage}
            fileBlob={customFileBlob}
            onComplete={handleScanComplete}
            onCancel={() => setViewMode('main')}
          />
        )}

        {/* Inspection Result Screen */}
        {viewMode === 'result' && selectedProduct && (
          <InspectionResultView
            product={selectedProduct}
            customImage={customImage}
            isOffline={isOffline}
            isMobileMode={isMobileMode}
            onViewFullReport={() => setViewMode('full_report')}
            onSelectModule={(moduleKey) => {
              if (moduleKey === 'evidence') {
                setViewMode('evidence_detail');
              } else {
                setViewMode('full_report');
              }
            }}
            onCompare={() => {
              setCompareProductA(selectedProduct);
              setActiveTab('compare');
              setViewMode('main');
            }}
          />
        )}

        {/* Full Product Report Screen */}
        {viewMode === 'full_report' && selectedProduct && (
          <FullProductReportView
            product={selectedProduct}
            isMobileMode={isMobileMode}
            onBack={() => setViewMode('result')}
            onOpenEvidenceDetail={() => setViewMode('evidence_detail')}
            onCompare={() => {
              setCompareProductA(selectedProduct);
              setActiveTab('compare');
              setViewMode('main');
            }}
          />
        )}

        {/* Evidence Check Detail Screen */}
        {viewMode === 'evidence_detail' && selectedProduct && (
          <EvidenceCheckDetailView
            product={selectedProduct}
            onBack={() => setViewMode('full_report')}
          />
        )}

        {/* Standard Tab Navigation Views */}
        {viewMode === 'main' && (
          <>
            {activeTab === 'home' && (
              <HomeView
                recentProducts={allProducts.slice(0, 4)}
                isOffline={isOffline}
                isMobileMode={isMobileMode}
                onScanClick={() => setActiveTab('scan')}
                onSelectProduct={(product) => {
                  setSelectedProduct(product);
                  setViewMode('result');
                }}
                onQuickAccessFilter={handleQuickAccessFilter}
              />
            )}

            {activeTab === 'scan' && (
              <NewInspectionView
                onStartScan={handleStartScan}
                isMobileMode={isMobileMode}
                onSelectProduct={(product) => {
                  setSelectedProduct(product);
                  setViewMode('result');
                }}
              />
            )}

            {activeTab === 'history' && (
              <ScanHistoryView
                products={allProducts}
                isOffline={isOffline}
                isMobileMode={isMobileMode}
                onRefreshProducts={(updated) => setAllProducts(updated)}
                onSelectProduct={(product) => {
                  setSelectedProduct(product);
                  setViewMode('result');
                }}
                onScanNew={() => setActiveTab('scan')}
              />
            )}

            {activeTab === 'compare' && (
              <ProductCompareView
                productA={compareProductA}
                productB={compareProductB}
                isMobileMode={isMobileMode}
                onSelectProductA={setCompareProductA}
                onSelectProductB={setCompareProductB}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsView
                onSelectInspection={() => {
                  setSelectedProduct(allProducts[0] || MOCK_PRODUCTS[0]);
                  setViewMode('result');
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onRefreshProducts={(updated) => setAllProducts(updated)}
                onSignOut={() => {
                  setActiveTab('home');
                  setViewMode('main');
                }}
              />
            )}

            {activeTab === 'states' && (
              isInspector ? (
                <SystemStatesView
                  onScanClick={() => setActiveTab('scan')}
                  isOffline={isOffline}
                  isSimulatedOffline={isSimulatedOffline}
                  onToggleSimulatedOffline={toggleSimulatedOffline}
                  cachedProducts={allProducts}
                  onSelectProduct={(product) => {
                    setSelectedProduct(product);
                    setViewMode('result');
                  }}
                />
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-16">
                  <div className="w-12 h-12 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[24px]">gavel</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#191c1a] tracking-tight mb-2">
                    Inspector Access Restricted
                  </h2>
                  <p className="text-xs text-[#525e56] leading-relaxed mb-6">
                    This terminal view is strictly restricted to verified Legal Metrology officers. Your account is currently authenticated under Citizen Consumer access.
                  </p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="h-10 px-4 bg-[#0f5238] hover:bg-[#184835] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    Return to Consumer Dashboard
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isSubView && (
        <BottomNavBar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setViewMode('main');
            setActiveTab(tab);
          }}
          unreadCount={unreadNotifs}
          isMobileMode={isMobileMode && isLargeScreen}
        />
      )}
    </div>
  );

  // On Laptop / Desktop (Large Screen): Always render inside sleek Flutter Mobile Phone Frame
  if (isLargeScreen) {
    return (
      <div className="min-h-screen bg-[#0b131f] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617] flex flex-col justify-center items-center py-5 px-4 selection:bg-[#0f5238] selection:text-white relative overflow-hidden">
        {/* Ambient Glow & Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Top Floating Header for Judges */}
        <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-2 z-20">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
              TRUVA • Flutter Mobile App
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = window.location.origin;
                navigator.clipboard?.writeText(url);
                alert('Copied App Link: ' + url);
              }}
              className="text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-full border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
              title="Copy link to paste in PPT"
            >
              <span className="material-symbols-outlined text-[13px]">link</span>
              <span>Copy App Link</span>
            </button>
          </div>
        </div>

        {/* Flutter-style mobile device mockup */}
        <div className="w-[412px] h-[870px] max-h-[92vh] bg-white rounded-[44px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6),0_0_0_12px_#1e293b,0_0_0_15px_#334155] border-4 border-[#0f172a] flex flex-col overflow-hidden relative z-10 transition-all">
          {/* Top Phone Dynamic Island / Speaker */}
          <div className="w-full h-8 bg-white shrink-0 flex items-center justify-between px-7 pt-1.5 select-none z-30 border-b border-[#e5e9e4]/60">
            <span className="text-[11.5px] font-bold text-gray-800">9:41</span>
            <div className="w-20 h-4.5 bg-[#0f172a] rounded-full flex items-center justify-center gap-2 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-[#1e293b]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#0369a1]" />
            </div>
            <div className="flex items-center gap-1.5 text-gray-800">
              <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
              <span className="material-symbols-outlined text-[13px]">wifi</span>
              <span className="material-symbols-outlined text-[14px]">battery_full</span>
            </div>
          </div>

          {/* Scrollable Device App Content */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative bg-[#f8faf6]">
            {appContent}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-full h-5 bg-[#f8faf6] shrink-0 flex items-center justify-center pb-1 border-t border-[#e5e9e4]/60">
            <div className="w-32 h-1 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // On Mobile: Direct Full Screen Responsive App
  return appContent;
}

export default function App() {
  return (
    <AuthProvider>
      <TruvaApp />
    </AuthProvider>
  );
}
