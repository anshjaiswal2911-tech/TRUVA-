import React, { useState, useEffect } from 'react';
import { getGeminiApiKey, setGeminiApiKey, testGeminiApiKey } from '../services/geminiVisionService';
import { triggerHaptic } from '../services/haptics';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getGeminiApiKey() || '';
      setApiKey(current);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please paste your Google Gemini API key first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    triggerHaptic('medium');

    try {
      const res = await testGeminiApiKey(apiKey.trim());
      setTestResult(res);
      if (res.success) {
        triggerHaptic('success');
      } else {
        triggerHaptic('error');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection test failed.' });
      triggerHaptic('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setGeminiApiKey(apiKey.trim());
    triggerHaptic('success');
    onSaved?.();
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    setGeminiApiKey('');
    setTestResult({ success: true, message: 'Gemini API key cleared. Reverted to client OCR pipeline.' });
    triggerHaptic('light');
    onSaved?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5e9e4] flex flex-col gap-4 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#06b6d4] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[24px]">visibility</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#191c1a] tracking-tight flex items-center gap-2">
                TRUVA AI Vision Scanner
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  Gemini Vision
                </span>
              </h2>
              <p className="text-xs text-[#525e56]">
                Multimodal OCR & Statutory Metrology Inspector
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Informational Box */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3.5 text-xs text-[#166534] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            100% Real Packaging Intelligence
          </div>
          <p className="leading-relaxed">
            Directly reads printed Net Weight, MRP, Manufacturer address, and FSSAI details from live camera photos without static template fallbacks.
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#2d3830] flex items-center justify-between">
            <span>Google Gemini API Key</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              Get free key
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#f8faf6] border border-[#d8deda] rounded-xl px-3.5 py-2.5 text-xs text-[#191c1a] font-mono focus:outline-none focus:border-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 text-gray-400 hover:text-gray-600 p-1"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showKey ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          <span className="text-[11px] text-gray-500">
            Keys are stored securely in your browser's private local storage.
          </span>
        </div>

        {/* Status / Test Response */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">
              {testResult.success ? 'check_circle' : 'error'}
            </span>
            <span className="leading-snug">{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
          {apiKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              Remove Key
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !apiKey.trim()}
              className="px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isTesting && (
                <span className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              )}
              Test Connection
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Save & Activate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
