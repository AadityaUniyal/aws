import React from 'react';
import { ShieldCheck, Activity, Cpu, Lock, ArrowUpRight, Sparkles } from 'lucide-react';

interface SystemStatusBannerProps {
  onOpenArchitecture: () => void;
  onOpenArena: () => void;
}

export const SystemStatusBanner: React.FC<SystemStatusBannerProps> = ({
  onOpenArchitecture,
  onOpenArena
}) => {
  return (
    <div className="ios-glass rounded-[1.75rem] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xl">
      {/* Left: Overall Health */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-xs tracking-tight">SRE Command Fleet Status:</span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Operational • 99.999% SLA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Autonomous Self-Healing Grid • Multi-Region Fault Tolerance (us-east-1 / us-east-2)
          </p>
        </div>
      </div>

      {/* Middle: Key Operational Metrics */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
        <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>MTTR: <strong className="text-emerald-400">&lt; 2.4s</strong></span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Multi-Model Consensus: <strong className="text-purple-300">Active</strong></span>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span>Security Guardrails: <strong className="text-teal-300">Enforced</strong></span>
        </div>
      </div>

      {/* Right: Quick Action Link */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={onOpenArena}
          className="px-3.5 py-1.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Model Arena</span>
          <ArrowUpRight className="w-3 h-3 opacity-70" />
        </button>

        <button
          onClick={onOpenArchitecture}
          className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 shadow-sm"
        >
          <span>Blueprint</span>
          <ArrowUpRight className="w-3 h-3 opacity-70" />
        </button>
      </div>
    </div>
  );
};
