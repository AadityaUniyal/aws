import React from 'react';
import { Incident } from '../types';
import { WellArchitectedScorecard } from '../components/WellArchitectedScorecard';
import { CostSavingsWidget } from '../components/CostSavingsWidget';
import { ShieldCheck, FileText, Award, ArrowUpRight } from 'lucide-react';

interface GovernancePageProps {
  incidents: Incident[];
  onOpenPostmortem: () => void;
  onOpenWhitepaper: () => void;
}

export const GovernancePage: React.FC<GovernancePageProps> = ({
  incidents,
  onOpenPostmortem,
  onOpenWhitepaper
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="ios-glass-card rounded-[2rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">Well-Architected Governance & Compliance</h1>
              <p className="text-xs text-slate-400">
                Continuous compliance audit across all 6 AWS Well-Architected Framework pillars (Score: <strong className="text-emerald-400">96/100</strong>)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPostmortem}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Post-Mortem Report</span>
          </button>
          <button
            onClick={onOpenWhitepaper}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Compliance Whitepaper</span>
          </button>
        </div>
      </div>

      {/* 6-Pillar Well-Architected Framework Interactive Scorecard */}
      <WellArchitectedScorecard />

      {/* Financial ROI and SLA Savings */}
      <CostSavingsWidget incidents={incidents} />
    </div>
  );
};
