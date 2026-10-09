import React, { useEffect, useRef } from 'react';

interface AudioOrbProps {
  isSpeaking: boolean;
  isListening: boolean;
  isConnected: boolean;
  audioLevel?: number; // 0 to 1
  onClick?: () => void;
}

export const AudioOrb: React.FC<AudioOrbProps> = ({
  isSpeaking,
  isListening,
  isConnected,
  audioLevel = 0,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      phase += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Base radius calculation
      const dynamicScale = Math.min(1, Math.max(0, audioLevel));
      const targetRadius = isSpeaking
        ? 64 + dynamicScale * 45
        : isListening
        ? 60 + dynamicScale * 30
        : isConnected
        ? 55 + Math.sin(phase) * 3
        : 50;

      // Outer ambient glow ring
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        targetRadius * 0.4,
        centerX,
        centerY,
        targetRadius * 1.8
      );

      if (isSpeaking) {
        gradient.addColorStop(0, 'rgba(217, 175, 107, 0.45)');
        gradient.addColorStop(0.5, 'rgba(163, 120, 58, 0.2)');
        gradient.addColorStop(1, 'rgba(7, 13, 24, 0)');
      } else if (isListening) {
        gradient.addColorStop(0, 'rgba(96, 165, 250, 0.35)');
        gradient.addColorStop(0.6, 'rgba(30, 58, 138, 0.15)');
        gradient.addColorStop(1, 'rgba(7, 13, 24, 0)');
      } else if (isConnected) {
        gradient.addColorStop(0, 'rgba(197, 158, 94, 0.25)');
        gradient.addColorStop(0.7, 'rgba(26, 43, 86, 0.1)');
        gradient.addColorStop(1, 'rgba(7, 13, 24, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(51, 65, 85, 0.2)');
        gradient.addColorStop(1, 'rgba(7, 13, 24, 0)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, targetRadius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Organic wavy ripple rings
      const rippleCount = isSpeaking ? 3 : isListening ? 2 : 1;
      for (let r = 0; r < rippleCount; r++) {
        ctx.beginPath();
        const numPoints = 64;
        const radius = targetRadius + r * 14;

        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const waveFreq = isSpeaking ? 6 : 4;
          const waveAmp = (isSpeaking ? 6 + dynamicScale * 14 : isListening ? 4 : 2) * (1 / (r + 1));
          const wave = Math.sin(angle * waveFreq + phase + r) * waveAmp;
          const currentR = radius + wave;

          const x = centerX + Math.cos(angle) * currentR;
          const y = centerY + Math.sin(angle) * currentR;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        if (isSpeaking) {
          ctx.strokeStyle = `rgba(223, 184, 122, ${0.45 / (r + 1)})`;
        } else if (isListening) {
          ctx.strokeStyle = `rgba(147, 197, 253, ${0.4 / (r + 1)})`;
        } else {
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.2 / (r + 1)})`;
        }
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Inner sphere / core
      const coreGrad = ctx.createRadialGradient(
        centerX - targetRadius * 0.3,
        centerY - targetRadius * 0.3,
        2,
        centerX,
        centerY,
        targetRadius
      );

      if (isSpeaking) {
        coreGrad.addColorStop(0, '#fef08a');
        coreGrad.addColorStop(0.4, '#dfb87a');
        coreGrad.addColorStop(0.85, '#78531d');
        coreGrad.addColorStop(1, '#1e1b18');
      } else if (isListening) {
        coreGrad.addColorStop(0, '#93c5fd');
        coreGrad.addColorStop(0.5, '#3b82f6');
        coreGrad.addColorStop(0.9, '#1e3a8a');
        coreGrad.addColorStop(1, '#0b1329');
      } else if (isConnected) {
        coreGrad.addColorStop(0, '#e2e8f0');
        coreGrad.addColorStop(0.4, '#c59e5e');
        coreGrad.addColorStop(0.9, '#1a2b56');
        coreGrad.addColorStop(1, '#070d18');
      } else {
        coreGrad.addColorStop(0, '#64748b');
        coreGrad.addColorStop(0.8, '#1e293b');
        coreGrad.addColorStop(1, '#0f172a');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, targetRadius * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = isSpeaking ? '#dfb87a' : isListening ? '#3b82f6' : 'transparent';
      ctx.shadowBlur = isSpeaking ? 24 : isListening ? 16 : 0;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Subtle specular highlight on luxury core
      ctx.beginPath();
      ctx.arc(centerX - targetRadius * 0.28, centerY - targetRadius * 0.28, targetRadius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isListening, isConnected, audioLevel]);

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center cursor-pointer select-none group"
    >
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-4">
          <p className="font-serif-luxury text-2xl sm:text-3xl tracking-widest text-[#f5ebd9] font-medium drop-shadow-md">
            CANO
          </p>
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#c59e5e] font-sans mt-0.5 opacity-90">
            {isSpeaking
              ? 'Speaking'
              : isListening
              ? 'Listening'
              : isConnected
              ? 'Live Ready'
              : 'Standby'}
          </p>
        </div>
      </div>
    </div>
  );
};
