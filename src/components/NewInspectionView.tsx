import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { triggerSelectionHaptic, triggerHaptic } from '../services/haptics';

interface NewInspectionViewProps {
  onStartScan: (product: Product, customImage?: string, fileBlob?: File | Blob) => void;
  onSelectProduct?: (product: Product) => void;
}

function createPendingProduct(imageUrl?: string): Product {
  return {
    id: `insp-${Date.now()}`,
    inspectionId: `INS-2026-PENDING`,
    name: 'Analyzing Commodity Label...',
    subtitle: 'Extracting Legal Metrology Declarations',
    category: 'Packaged Commodity',
    barcode: 'Processing...',
    mrp: 'Extracting...',
    volume: 'Extracting...',
    quantity: 'Extracting...',
    inspectionDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    imageUrl: imageUrl || '',
    imageAlt: 'Uploaded commodity label',
    overallVerdict: 'Requires Verification',
    overallSummary: {
      declarations: { status: 'Compliant', label: 'Processing', icon: 'gavel', type: 'info' },
      netQuantity: { status: 'Compliant', label: 'Processing', icon: 'scale', type: 'info' },
      mrpTax: { status: 'Compliant', label: 'Processing', icon: 'payments', type: 'info' },
      evidence: { status: 'Compliant', label: 'Processing', icon: 'assignment', type: 'info' },
    },
    keyFindings: [
      { id: '1', text: 'Processing statutory declarations under Legal Metrology Rule 6...', type: 'info' },
    ],
    modules: {
      declarations: {
        title: 'Statutory Declarations',
        icon: 'gavel',
        status: 'Compliant',
        statusType: 'info',
        subtitle: 'Statutory & Manufacturer Declarations',
        primaryFinding: 'Extracting statements from label scan...',
        details: [],
      },
      netQuantity: {
        title: 'Net Quantity Verification',
        icon: 'scale',
        status: 'Compliant',
        statusType: 'info',
        subtitle: 'Metric units verification',
        primaryFinding: 'Extracting net quantity...',
        details: [],
      },
      mrpTax: {
        title: 'MRP & Tax Declaration Check',
        icon: 'payments',
        status: 'Compliant',
        statusType: 'info',
        subtitle: 'Statutory inclusive of all taxes verification',
        primaryFinding: 'Extracting MRP and tax statements...',
        details: [],
      },
      evidence: {
        title: 'Statutory Rule Evaluations & Evidence',
        icon: 'assignment',
        status: 'Compliant',
        statusType: 'info',
        subtitle: 'Legal Metrology (Packaged Commodities) Rules, 2011',
        primaryFinding: 'Running statutory rule evaluation...',
        details: [],
      },
    },
  };
}

export const NewInspectionView: React.FC<NewInspectionViewProps> = ({ onStartScan, onSelectProduct }) => {
  const [dragActive, setDragActive] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      triggerSelectionHaptic();
      setUseCamera(true);
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable. You can upload an image file from your device.');
      setUseCamera(false);
    }
  };

  const captureCameraPhoto = () => {
    triggerHaptic('medium');
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          const stream = videoRef.current?.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
          setUseCamera(false);
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            const pending = createPendingProduct(previewUrl);
            onStartScan(pending, previewUrl, blob);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (JPEG, PNG, WEBP).');
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const pending = createPendingProduct(previewUrl);
    onStartScan(pending, previewUrl, file);

    // Allow re-selecting the same file later
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please drop a valid image file.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const pending = createPendingProduct(previewUrl);
    onStartScan(pending, previewUrl, file);
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center px-4 sm:px-6 py-6 sm:py-10 max-w-[1280px] xl:max-w-[1400px] mx-auto w-full pb-28 sm:pb-12">
      <div className="w-full max-w-xl lg:max-w-5xl bg-white rounded-3xl border border-[#bfc9c1]/50 p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center text-center lg:text-left">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Header Title Section */}
        <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between items-center gap-3 mb-6 sm:mb-8 lg:pb-6 lg:border-b lg:border-[#bfc9c1]/40">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#191c1a] tracking-tight">
              Inspect Commodity Label
            </h2>
            <p className="text-xs sm:text-sm text-[#404943] max-w-sm lg:max-w-xl leading-relaxed">
              Upload or capture a sharp photo of the principal display panel to run automated statutory declaration audits.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] border border-[#95d4b3] text-[#0f5238] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0f5238] animate-pulse"></span>
            Legal Metrology Rule 6 Ingestion
          </div>
        </div>

        {/* Responsive Workspace Body */}
        <div className="w-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Dropzone / Camera & Upload Actions */}
          <div className="w-full lg:col-span-7 flex flex-col items-center">
            {/* Scan Area Box */}
            {useCamera ? (
              <div className="w-full h-72 sm:h-80 bg-black rounded-2xl overflow-hidden relative flex flex-col items-center justify-center mb-5 border-2 border-[#2d6a4f] shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Overlay Viewfinder */}
                <div className="absolute inset-5 border-2 border-dashed border-[#b1f0ce] rounded-xl pointer-events-none flex flex-col items-center justify-between p-2">
                  <span className="text-[10px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    ALIGN LABEL WITHIN RETICLE
                  </span>
                  <div className="w-full h-0.5 bg-[#95d4b3] animate-scan-laser absolute shadow-[0_0_12px_#95d4b3]"></div>
                </div>

                <div className="absolute bottom-4 flex gap-3">
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="bg-[#0f5238] hover:bg-[#2d6a4f] text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    Capture Label
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current && videoRef.current.srcObject) {
                        const stream = videoRef.current.srcObject as MediaStream;
                        stream.getTracks().forEach((track) => track.stop());
                      }
                      setUseCamera(false);
                    }}
                    className="bg-white/90 hover:bg-white text-[#191c1a] px-4 py-2.5 rounded-xl font-semibold text-xs shadow cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 relative overflow-hidden group transition-all duration-200 cursor-pointer mb-5 ${
                  dragActive
                    ? 'bg-[#dcfce7]/40 border-[#0f5238] scale-[1.01]'
                    : 'bg-[#f8faf6] border-[#bfc9c1]/70 hover:border-[#2d6a4f] hover:bg-[#f2f4f0]/70'
                }`}
              >
                {/* Pulsing Icon Badge */}
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-[#bfc9c1]/50 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:border-[#95d4b3] transition-all">
                  <span className="material-symbols-outlined text-[32px] text-[#0f5238]" data-fill="1">
                    cloud_upload
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm sm:text-base font-bold text-[#191c1a] group-hover:text-[#0f5238] transition-colors">
                    Drop package photo here, or <span className="text-[#0f5238] underline underline-offset-2">browse</span>
                  </span>
                  <p className="text-xs text-[#707973] max-w-[280px]">
                    High-resolution JPEG, PNG, or WEBP photos of commodity packaging
                  </p>
                </div>

                {/* Format Tags */}
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="text-[10px] font-bold text-[#404943] bg-white border border-[#bfc9c1]/50 px-2 py-0.5 rounded-md shadow-2xs">JPG</span>
                  <span className="text-[10px] font-bold text-[#404943] bg-white border border-[#bfc9c1]/50 px-2 py-0.5 rounded-md shadow-2xs">PNG</span>
                  <span className="text-[10px] font-bold text-[#404943] bg-white border border-[#bfc9c1]/50 px-2 py-0.5 rounded-md shadow-2xs">WEBP</span>
                  <span className="text-[10px] font-medium text-[#707973] ml-1">Up to 25MB</span>
                </div>

                {/* Subtle Laser Line */}
                <div className="w-full h-0.5 bg-[#2d6a4f]/50 animate-scan-laser absolute pointer-events-none"></div>
              </div>
            )}

            {cameraError && (
              <div className="w-full mb-4 p-3 bg-[#ffdad6] border border-[#ffb4ab] rounded-xl text-left flex items-start gap-2 text-xs text-[#93000a] shadow-xs">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                <span>{cameraError}</span>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-12 bg-[#0f5238] hover:bg-[#2d6a4f] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px]">upload_file</span>
                Upload from Device
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    startCamera();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="flex-1 h-12 bg-white hover:bg-[#f2f4f0] text-[#191c1a] border border-[#bfc9c1]/70 hover:border-[#0f5238] rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[19px] text-[#0f5238]">photo_camera</span>
                Capture with Camera
              </button>
            </div>

            {/* Desktop Instant Sample Testing Presets */}
            {onSelectProduct && (
              <div className="w-full mt-4 pt-3.5 border-t border-[#bfc9c1]/40 hidden sm:flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[#707973]">
                  <span className="font-semibold text-[#191c1a]">Or test with standard regulatory samples:</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#0f5238]">Instant Ingestion</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerSelectionHaptic();
                      const sample = MOCK_PRODUCTS[0];
                      onSelectProduct(sample);
                    }}
                    className="p-2.5 px-3 rounded-xl bg-[#f8faf6] hover:bg-[#ebf3ea] border border-[#bfc9c1]/40 hover:border-[#0f5238]/40 transition-all text-left flex items-center gap-2.5 cursor-pointer group shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#0f5238] group-hover:scale-110 transition-transform">eco</span>
                    <div className="truncate">
                      <span className="text-[11px] font-bold text-[#191c1a] block truncate">Pure Honey 500g</span>
                      <span className="text-[10px] text-[#0f5238] font-semibold">Rule 6 Compliant</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerSelectionHaptic();
                      const sample = MOCK_PRODUCTS[1] || MOCK_PRODUCTS[0];
                      onSelectProduct(sample);
                    }}
                    className="p-2.5 px-3 rounded-xl bg-[#f8faf6] hover:bg-[#fff0ed] border border-[#bfc9c1]/40 hover:border-[#ba1a1a]/40 transition-all text-left flex items-center gap-2.5 cursor-pointer group shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#ba1a1a] group-hover:scale-110 transition-transform">warning</span>
                    <div className="truncate">
                      <span className="text-[11px] font-bold text-[#191c1a] block truncate">Olive Oil 1L</span>
                      <span className="text-[10px] text-[#ba1a1a] font-semibold">Flagged Violation</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Regulatory Checklist & Guidance (Stacks naturally on mobile, right panel on desktop) */}
          <div className="w-full lg:col-span-5 flex flex-col mt-6 lg:mt-0 pt-5 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#bfc9c1]/40 lg:pl-8 text-left space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#707973] uppercase tracking-wider block mb-2.5">
                Key Rule 6 Declarations Detected:
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 text-xs text-[#404943]">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f8faf6] border border-[#bfc9c1]/30">
                  <span className="material-symbols-outlined text-[17px] text-[#0f5238]" data-fill="1">check_circle</span>
                  <span className="font-medium">MRP (incl. of all taxes)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f8faf6] border border-[#bfc9c1]/30">
                  <span className="material-symbols-outlined text-[17px] text-[#0f5238]" data-fill="1">check_circle</span>
                  <span className="font-medium">Net Quantity (Metric units)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f8faf6] border border-[#bfc9c1]/30">
                  <span className="material-symbols-outlined text-[17px] text-[#0f5238]" data-fill="1">check_circle</span>
                  <span className="font-medium">Manufacturer &amp; Packer Details</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f8faf6] border border-[#bfc9c1]/30">
                  <span className="material-symbols-outlined text-[17px] text-[#0f5238]" data-fill="1">check_circle</span>
                  <span className="font-medium">Date of Packing &amp; Expiry</span>
                </div>
              </div>
            </div>

            {/* Desktop Supported Specs Summary Card */}
            <div className="bg-[#f2f4f0]/60 p-4 rounded-2xl border border-[#bfc9c1]/40 text-xs text-[#404943] leading-relaxed">
              <span className="font-bold text-[#191c1a] block mb-1">Optical Extraction Engine</span>
              <p className="text-[11px] text-[#707973]">
                Processes high-resolution label imagery through rapid OCR and statutory rule evaluators to extract mandatory consumer declarations without manual transcription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
