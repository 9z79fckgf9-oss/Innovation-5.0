import React from 'react';
import { Linkedin, Mail, Coffee } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#13223f] bg-[#050912] py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-serif-luxury text-xl text-[#f1f5f9] tracking-wide">
            Cano <span className="text-[#dfb87a]">·</span> The Voice of Can Boga
          </p>
          <p className="text-xs text-[#64748b] mt-1 font-sans">
            M.A. International Marketing & Luxury Communication · HWR Berlin & ESCE Paris
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#94a3b8]">
          <div className="flex items-center gap-1.5 text-[#64748b]">
            <Coffee className="w-3.5 h-3.5 text-[#dfb87a]" />
            <span>Black Coffee Only</span>
          </div>

          <a
            href="https://linkedin.com/in/can-boga"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#dfb87a] transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </a>

          <a
            href="mailto:c.boga@icloud.com"
            className="flex items-center gap-1 hover:text-[#dfb87a] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>c.boga@icloud.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
