import React from 'react';
import { Mail, Compass, Sparkles } from 'lucide-react';

interface HeaderProps {
  isLiveConnected: boolean;
  isSpeaking: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isLiveConnected, isSpeaking }) => {
  return (
    <header className="w-full border-b border-[#14223d]/80 bg-[#070d18]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Identification */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-[#c59e5e]/40 bg-[#0d162a] flex items-center justify-center shadow-inner shadow-[#dfb87a]/20">
            <span className="font-serif-luxury text-lg font-semibold text-[#dfb87a]">C</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-luxury text-2xl tracking-wider text-[#f1f5f9] font-medium leading-none">
                CANO
              </h1>
              <span className="text-[10px] uppercase tracking-widest text-[#94a3b8] font-sans border-l border-[#223554] pl-2">
                Can Boga
              </span>
            </div>
            <p className="text-[11px] text-[#94a3b8] font-sans tracking-wide mt-1">
              Paris <span className="text-[#dfb87a]">·</span> Berlin <span className="text-[#dfb87a]">·</span> Luxury Marketing & Voice Ambassador
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d172e] border border-[#1b2d56] text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking
                  ? 'bg-amber-400 animate-ping'
                  : isLiveConnected
                  ? 'bg-emerald-400'
                  : 'bg-[#64748b]'
              }`}
            />
            <span className="text-[#cbd5e1] font-sans text-[11px]">
              {isSpeaking
                ? 'Baritone Active'
                : isLiveConnected
                ? 'Live Duplex Ready'
                : 'Standby'}
            </span>
          </div>

          <a
            href="mailto:c.boga@icloud.com"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121f3d] hover:bg-[#1a2d59] border border-[#223862] text-xs text-[#cbd5e1] hover:text-[#dfb87a] transition-all"
          >
            <Mail className="w-3.5 h-3.5 text-[#dfb87a]" />
            <span className="hidden md:inline">c.boga@icloud.com</span>
          </a>
        </div>
      </div>
    </header>
  );
};
