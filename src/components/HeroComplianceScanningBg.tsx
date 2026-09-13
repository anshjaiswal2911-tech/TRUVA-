import React from "react";
import { DynamicMetrologyBackground } from "./DynamicMetrologyBackground";

export const HeroComplianceScanningBg: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. ATMOSPHERIC AMBIENT GLOWING ORBS (Vibrant & Deep Multi-Color) */}
      <div className="absolute -top-28 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#0f5238]/25 via-[#2d6a4f]/20 to-transparent blur-3xl animate-pulse" />
      <div className="absolute top-0 right-0 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-[#0058be]/25 via-[#2563eb]/15 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }} />
      <div className="absolute -bottom-20 left-1/3 w-[600px] h-[400px] rounded-full bg-gradient-to-tr from-[#10b981]/20 via-[#0f5238]/15 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '5s' }} />

      {/* 2. TECHNICAL METROLOGY GRID PATTERN */}
      <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#0f5238_1.5px,transparent_1.5px),linear-gradient(to_bottom,#0f5238_1.5px,transparent_1.5px)] bg-[size:36px_36px]" />

      {/* 3. DYNAMIC INTERACTIVE METROLOGY PARTICLE & LASER CANVAS */}
      <div className="absolute inset-0 pointer-events-auto z-[1]">
        <DynamicMetrologyBackground className="w-full h-full" />
      </div>

      {/* 4. RADIAL SCAN PULSES (Subtle concentric waves behind reticle card) */}
      <div className="absolute top-[38%] right-[22%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-2 border-[#0f5238]/25 truva-radial-pulse z-[2]" />
      <div className="absolute top-[38%] right-[22%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#0058be]/20 truva-radial-pulse-delayed hidden sm:block z-[2]" />
    </div>
  );
};
