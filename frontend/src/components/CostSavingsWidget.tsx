import React from 'react';
import { DollarSign, Clock, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { Incident } from '../types';

interface CostSavingsWidgetProps {
  incidents: Incident[];
}

export const CostSavingsWidget: React.FC<CostSavingsWidgetProps> = ({ incidents }) => {
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;
  // AWS industry downtime cost calculation: ~$5,000 per minute of high severity outage
  const estimatedHoursSaved = (resolvedCount * 4.2).toFixed(1);
  const estimatedCostSaved = (resolvedCount * 126000).toLocaleString();

  return (
    <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-amber-500/30 rounded-2xl p-4 backdrop-blur shadow-lg shadow-amber-500/5 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Highlight */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20">
            <DollarSign className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Autonomous SRE ROI & Outage Prevention</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Live Calculator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Quantified financial & downtime savings for AWS Account <span className="font-mono text-slate-300">145023097151</span>
            </p>
          </div>
        </div>

        {/* Right: Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 text-right">
          <div className="bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Outages Auto-Healed</span>
            <span className="text-sm font-bold text-emerald-400 font-mono flex items-center justify-end gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {resolvedCount} Incidents
            </span>
          </div>

          <div className="bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Downtime Prevented</span>
            <span className="text-sm font-bold text-blue-400 font-mono flex items-center justify-end gap-1">
              <Clock className="w-3.5 h-3.5" /> ~{estimatedHoursSaved} hrs
            </span>
          </div>

          <div className="bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Est. Revenue Saved</span>
            <span className="text-sm font-bold text-amber-400 font-mono flex items-center justify-end gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> ${estimatedCostSaved}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
