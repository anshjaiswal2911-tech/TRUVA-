import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  currentAlpha: number;
  color: string;
  glowColor: string;
  label?: string;
  pulseTimer: number;
  pulseSpeed: number;
  highlighted: boolean;
}

const STATUTORY_LABELS = [
  'Rule 6(1)(a) MFGR',
  'Rule 6(1)(e) MRP',
  'Net Qty 500g',
  'Date of Pkg',
  'Consumer Care',
  'EAN-13 Barcode',
  'Origin: India',
  'USP: ₹0.70/g',
  'Sec 36 LM Act',
  'SHA-256 Ledger',
  'FSSAI 14-Digit',
  'Sched-II Font: 4.2mm',
];

export const DynamicMetrologyBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateDimensions = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width || canvas.parentElement?.clientWidth || window.innerWidth;
      height = rect.height || canvas.parentElement?.clientHeight || 800;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Mouse position
    let mouseX = -1000;
    let mouseY = -1000;
    let mouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      mouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Nodes setup (Increased count for vibrant network)
    const nodeCount = Math.floor(Math.min(Math.max(width / 20, 45), 75));
    const nodes: Node[] = [];

    const palette = [
      { color: '#0f5238', glow: 'rgba(15, 82, 56, 0.6)' },      // Rich Emerald
      { color: '#2d6a4f', glow: 'rgba(45, 106, 79, 0.6)' },     // Mint Forest
      { color: '#0058be', glow: 'rgba(0, 88, 190, 0.65)' },     // Sapphire Blue
      { color: '#0284c7', glow: 'rgba(2, 132, 199, 0.55)' },    // Sky Blue
      { color: '#d97706', glow: 'rgba(217, 119, 6, 0.6)' },     // Amber Statutory
    ];

    for (let i = 0; i < nodeCount; i++) {
      const theme = palette[i % palette.length];
      const hasLabel = i < STATUTORY_LABELS.length;
      nodes.push({
        x: Math.random() * (width || 1200),
        y: Math.random() * (height || 800),
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        radius: hasLabel ? 4.0 : 3.0,
        baseAlpha: Math.random() * 0.3 + 0.65,
        currentAlpha: 0.75,
        color: theme.color,
        glowColor: theme.glow,
        label: hasLabel ? STATUTORY_LABELS[i] : undefined,
        pulseTimer: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        highlighted: false,
      });
    }

    // Scanning wave state (Continuous sweeping laser)
    let scanY = 0;
    const scanSpeed = 1.3;

    // Render loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Move & Draw Laser Sweep Wave
      scanY += scanSpeed;
      if (scanY > height + 80) {
        scanY = -60;
      }

      if (scanY >= -40 && scanY <= height + 40) {
        // Soft glowing beam gradient
        const beamGrad = ctx.createLinearGradient(0, scanY - 35, 0, scanY + 35);
        beamGrad.addColorStop(0, 'rgba(15, 82, 56, 0)');
        beamGrad.addColorStop(0.5, 'rgba(15, 82, 56, 0.16)');
        beamGrad.addColorStop(1, 'rgba(15, 82, 56, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, scanY - 35, width, 70);

        // Core glowing laser line
        const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
        lineGrad.addColorStop(0, 'rgba(15, 82, 56, 0.1)');
        lineGrad.addColorStop(0.2, 'rgba(15, 82, 56, 0.75)');
        lineGrad.addColorStop(0.5, 'rgba(0, 88, 190, 0.9)');
        lineGrad.addColorStop(0.8, 'rgba(15, 82, 56, 0.75)');
        lineGrad.addColorStop(1, 'rgba(15, 82, 56, 0.1)');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
      }

      // 2. Update & Draw Node Connections
      const maxDist = Math.min(width / 6, 175);

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // Physics motion
        n1.x += n1.vx * (delta * 60);
        n1.y += n1.vy * (delta * 60);

        if (n1.x < 15) { n1.x = 15; n1.vx *= -1; }
        if (n1.x > width - 15) { n1.x = width - 15; n1.vx *= -1; }
        if (n1.y < 15) { n1.y = 15; n1.vy *= -1; }
        if (n1.y > height - 15) { n1.y = height - 15; n1.vy *= -1; }

        n1.pulseTimer += n1.pulseSpeed;

        // Mouse proximity
        const dxMouse = n1.x - mouseX;
        const dyMouse = n1.y - mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        const isNearMouse = mouseActive && distMouse < 190;

        // Scan beam proximity
        const distScan = Math.abs(n1.y - scanY);
        const isNearScan = distScan < 35;

        n1.highlighted = isNearMouse || isNearScan;
        const targetAlpha = isNearMouse ? 1.0 : isNearScan ? 0.95 : n1.baseAlpha + Math.sin(n1.pulseTimer) * 0.2;
        n1.currentAlpha += (targetAlpha - n1.currentAlpha) * 0.15;

        // Draw connections to neighboring nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const lineOpacity = (1 - dist / maxDist) * 0.45 * Math.max(n1.currentAlpha, n2.currentAlpha);
            ctx.beginPath();
            ctx.strokeStyle = n1.color === n2.color
              ? `${n1.color}${Math.round(lineOpacity * 255).toString(16).padStart(2, '0')}`
              : `rgba(15, 82, 56, ${lineOpacity})`;
            ctx.lineWidth = n1.highlighted && n2.highlighted ? 1.8 : 1.1;
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Draw magnetic connection to mouse
        if (isNearMouse) {
          const mouseAlpha = (1 - distMouse / 190) * 0.65;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 88, 190, ${mouseAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 3. Draw Nodes & Labels
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Outer Pulsing Glow Halo
        const haloScale = 2.5 + Math.sin(node.pulseTimer) * 0.8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * haloScale, 0, Math.PI * 2);
        ctx.fillStyle = node.glowColor;
        ctx.fill();

        // Outer ring if highlighted
        if (node.highlighted) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        // Solid Center Dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Node Label Pill (Visible on highlighted OR periodic pulse in wide screens)
        if (node.label && (node.highlighted || Math.sin(node.pulseTimer) > 0.75) && width > 640) {
          ctx.font = 'bold 9.5px "Inter", monospace';

          const textWidth = ctx.measureText(node.label).width;
          const pillX = node.x + 8;
          const pillY = node.y - 12;

          // Clean Pill background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
          ctx.fillRect(pillX, pillY, textWidth + 10, 16);

          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.0;
          ctx.strokeRect(pillX, pillY, textWidth + 10, 16);

          // Text
          ctx.fillStyle = node.color;
          ctx.fillText(node.label, pillX + 5, pillY + 11.5);
        }
      }

      // 4. Draw Mouse Cursor Target Reticle
      if (mouseActive) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 88, 190, 0.45)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0058be';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
    />
  );
};
