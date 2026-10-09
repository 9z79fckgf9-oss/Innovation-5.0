import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  Languages,
  Heart,
  ExternalLink,
  MessageCircle,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CanBogaDossierProps {
  onAskChapter: (inquiry: string) => void;
}

export const CanBogaDossier: React.FC<CanBogaDossierProps> = ({ onAskChapter }) => {
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'languages'>('experience');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 bg-[#091122]/80 border border-[#182a4e]/70 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
      {/* Dossier Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#162544]">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#dfb87a] font-sans font-medium mb-1">
            <span>Dossier Professionnel</span>
            <span>·</span>
            <span>Can Boga</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#f1f5f9] tracking-wide font-normal">
            International Marketing & Luxury Prestige
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://linkedin.com/in/can-boga"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#101b36] hover:bg-[#1a2c56] border border-[#1e335f] text-xs text-[#cbd5e1] hover:text-[#dfb87a] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>LinkedIn Profile</span>
          </a>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#142347] hover:bg-[#1f376e] text-xs font-sans text-[#dfb87a] transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse Dossier' : 'Inspect Full Dossier'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary quote */}
      <div className="py-5 border-b border-[#14213d]">
        <blockquote className="font-serif-luxury text-lg sm:text-xl text-[#cbd5e1] leading-relaxed italic">
          "Driven by the desire to craft exceptional customer experiences. Combining financial auditing rigor with customer experience management to serve projects where analytical precision meets creativity."
        </blockquote>
      </div>

      {/* Segmented Controls for Tabs */}
      <div className="flex items-center gap-2 pt-6 pb-4">
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'experience'
              ? 'bg-[#dfb87a] text-[#070d18] font-semibold shadow-md'
              : 'bg-[#101c38] text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Professional Experience</span>
        </button>

        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'education'
              ? 'bg-[#dfb87a] text-[#070d18] font-semibold shadow-md'
              : 'bg-[#101c38] text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education & Degrees</span>
        </button>

        <button
          onClick={() => setActiveTab('languages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'languages'
              ? 'bg-[#dfb87a] text-[#070d18] font-semibold shadow-md'
              : 'bg-[#101c38] text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Languages & Art de Vivre</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury text-xl text-[#f1f5f9]">Matsuri</h3>
                  <span className="text-xs text-[#94a3b8]">· Paris, France</span>
                </div>
                <p className="text-xs text-[#c59e5e] font-sans font-medium mt-0.5">
                  Waiter · Customer Experience & International Hospitality (August 2026 - Present)
                </p>
                <p className="text-xs text-[#94a3b8] mt-2 font-sans leading-relaxed">
                  Provide professional support to an international clientele with a high focus on customer experience; coordinate service seamlessly during peak business hours.
                </p>
              </div>
              <button
                onClick={() =>
                  onAskChapter(
                    'What has your experience at Matsuri in Paris taught you regarding customer experience in luxury hospitality?'
                  )
                }
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14244a] hover:bg-[#1d356c] text-[11px] text-[#dfb87a] transition-all cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Ask Cano</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury text-xl text-[#f1f5f9]">Villa Neukölln</h3>
                  <span className="text-xs text-[#94a3b8]">· Berlin, Germany</span>
                </div>
                <p className="text-xs text-[#c59e5e] font-sans font-medium mt-0.5">
                  Service Manager (June 2025 - July 2026)
                </p>
                <p className="text-xs text-[#94a3b8] mt-2 font-sans leading-relaxed">
                  Coordinated staff schedules, led team meetings, onboarded new employees. Managed customer service in a dynamic intercultural environment and oversaw point-of-sale financial reconciliations.
                </p>
              </div>
              <button
                onClick={() =>
                  onAskChapter(
                    'Tell me about your leadership and financial management responsibilities as Service Manager at Villa Neukölln in Berlin.'
                  )
                }
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14244a] hover:bg-[#1d356c] text-[11px] text-[#dfb87a] transition-all cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Ask Cano</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury text-xl text-[#f1f5f9]">KPMG Luxembourg</h3>
                  <span className="text-xs text-[#94a3b8]">· Luxembourg</span>
                </div>
                <p className="text-xs text-[#c59e5e] font-sans font-medium mt-0.5">
                  Audit Intern (October 2024 - April 2025)
                </p>
                <p className="text-xs text-[#94a3b8] mt-2 font-sans leading-relaxed">
                  Produced analytical reports and executive summaries for international stakeholders. Rigorously evaluated KPIs using Excel and conducted sample testing.
                </p>
              </div>
              <button
                onClick={() =>
                  onAskChapter(
                    'How does your numerical rigor from auditing at KPMG Luxembourg complement your creative instincts in luxury marketing?'
                  )
                }
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14244a] hover:bg-[#1d356c] text-[11px] text-[#dfb87a] transition-all cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Ask Cano</span>
              </button>
            </div>

            {isExpanded && (
              <>
                <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-luxury text-xl text-[#f1f5f9]">Bar Polikarpov</h3>
                      <span className="text-xs text-[#94a3b8]">· Marseille, France</span>
                    </div>
                    <p className="text-xs text-[#c59e5e] font-sans font-medium mt-0.5">
                      Waiter & Bartender (August 2021 - August 2022)
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-2 font-sans leading-relaxed">
                      Crafted beverages with impeccable aesthetic presentation and served international clientele in an energetic Mediterranean setting.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onAskChapter(
                        'What did your experience in Marseille at Bar Polikarpov teach you about beverage presentation and clientele care?'
                      )
                    }
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14244a] hover:bg-[#1d356c] text-[11px] text-[#dfb87a] transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Ask Cano</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-luxury text-xl text-[#f1f5f9]">Roche Diagnostics</h3>
                      <span className="text-xs text-[#94a3b8]">· Mannheim, Germany</span>
                    </div>
                    <p className="text-xs text-[#c59e5e] font-sans font-medium mt-0.5">
                      Intern (July 2020 - October 2020)
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-2 font-sans leading-relaxed">
                      Supported operational development of assembly processes with high precision and cross-functional initiative.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury text-xl text-[#f1f5f9]">
                    Franco-German Double Master Degree
                  </h3>
                </div>
                <p className="text-xs text-[#c59e5e] font-sans font-medium mt-0.5">
                  Berlin School of Economics and Law (HWR Berlin) & ESCE Paris (April 2026 - Present)
                </p>
                <p className="text-xs text-[#94a3b8] mt-2 font-sans leading-relaxed">
                  Master of Arts in International Marketing & Master of Arts in Communication, Luxury and Prestige Marketing.
                </p>
              </div>
              <button
                onClick={() =>
                  onAskChapter(
                    'Could you explain the dual perspectives of studying luxury communication at ESCE Paris alongside international marketing at HWR Berlin?'
                  )
                }
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14244a] hover:bg-[#1d356c] text-[11px] text-[#dfb87a] transition-all cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Ask Cano</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-luxury text-xl text-[#f1f5f9]">
                    Bachelor of Arts (B.A.) in International Management
                  </h3>
                </div>
                <p className="text-xs text-[#c59e5e] font-sans font-medium mt-0.5">
                  HWR Berlin & ESCE Paris (September 2022 - March 2026)
                </p>
                <p className="text-xs text-[#94a3b8] mt-2 font-sans leading-relaxed">
                  Comprehensive grounding in cross-border management, intercultural communication, and corporate strategy.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#dfb87a]" />
                  <h3 className="font-serif-luxury text-xl text-[#f1f5f9]">
                    Franco-German University (UFA / DFH)
                  </h3>
                  <span className="text-xs text-[#94a3b8]">· Berlin</span>
                </div>
                <p className="text-xs text-[#c59e5e] font-sans font-medium mt-0.5">
                  Official Ambassador (January 2025 - Present)
                </p>
                <p className="text-xs text-[#94a3b8] mt-2 font-sans leading-relaxed">
                  Lead presentations informing students regarding bilingual degree programs and strengthen bilateral academic relations.
                </p>
              </div>
              <button
                onClick={() =>
                  onAskChapter(
                    'What does your mission as an Ambassador for the Franco-German University entail?'
                  )
                }
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14244a] hover:bg-[#1d356c] text-[11px] text-[#dfb87a] transition-all cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Ask Cano</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'languages' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52]">
                <p className="text-xs uppercase tracking-wider text-[#dfb87a] font-medium">German</p>
                <p className="font-serif-luxury text-xl text-[#f1f5f9] mt-0.5">C2 · Native Fluency</p>
                <p className="text-xs text-[#94a3b8] mt-1 font-sans">
                  Cultured, idiomatic precision spoken across Berlin and academic spheres.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52]">
                <p className="text-xs uppercase tracking-wider text-[#dfb87a] font-medium">French</p>
                <p className="font-serif-luxury text-xl text-[#f1f5f9] mt-0.5">C1 · Professional Fluency</p>
                <p className="text-xs text-[#94a3b8] mt-1 font-sans">
                  Polished Parisian nuance, honed through ESCE Paris and Marseille.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52]">
                <p className="text-xs uppercase tracking-wider text-[#dfb87a] font-medium">English</p>
                <p className="font-serif-luxury text-xl text-[#f1f5f9] mt-0.5">C1 · Professional Fluency</p>
                <p className="text-xs text-[#94a3b8] mt-1 font-sans">
                  Refined British inflection, international business fluency.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52]">
                <p className="text-xs uppercase tracking-wider text-[#dfb87a] font-medium">Kurdish</p>
                <p className="font-serif-luxury text-xl text-[#f1f5f9] mt-0.5">C2 · Native Fluency</p>
                <p className="text-xs text-[#94a3b8] mt-1 font-sans">
                  Complete bilingual mastery and rich cultural roots.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0c162d]/60 border border-[#192b52] mt-4 flex items-start gap-3">
              <Heart className="w-4 h-4 text-[#dfb87a] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs uppercase tracking-wider text-[#dfb87a] font-medium">
                  Art de Vivre & Disciplines
                </p>
                <p className="text-xs text-[#cbd5e1] mt-1 font-sans leading-relaxed">
                  Luxury Fashion & Haute Horlogerie · Design & Minimalist Aesthetics · Pure Black Coffee · Distance Running · High-Cadence Spinning · Classical Pilates.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
