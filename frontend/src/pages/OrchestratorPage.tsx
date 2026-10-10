import React from 'react';
import { Incident } from '../types';
import { LiveEventStream } from '../components/LiveEventStream';
import { 
  GitBranch, ArrowUpRight, Play, CheckCircle2, 
  ShieldCheck, Activity, Cpu, Database, Cloud, Zap 
} from 'lucide-react';

interface OrchestratorPageProps {
  incidents: Incident[];
  onOpenStepFunctionsModal: () => void;
  onOpenRemediation: (inc: Incident) => void;
}

export const OrchestratorPage: React.FC<OrchestratorPageProps> = ({
  incidents,
  onOpenStepFunctionsModal,
  onOpenRemediation
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* State Machine Overview Header */}
      <div className="ios-glass-card rounded-[2rem] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base">AWS Step Functions Distributed State Machine</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  State Machine ARN: <span className="font-mono text-amber-400">arn:aws:states:ap-south-1:145023097151:stateMachine:CloudSentinel-IncidentOrchestrator</span>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onOpenStepFunctionsModal}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-orange-500/20 shrink-0"
          >
            <span>Launch Live State Machine Inspector</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5-Step Distributed Execution Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between hover:border-amber-500/30 transition">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Step 1 • Ingestion</span>
            <span className="font-bold text-white text-xs mt-2">EventBridge Router</span>
            <span className="text-[11px] text-emerald-400 mt-1">AWS CloudWatch Alarm</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between hover:border-purple-500/30 transition">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Step 2 • Diagnostic</span>
            <span className="font-bold text-white text-xs mt-2">Parallel Diagnostics</span>
            <span className="text-[11px] text-purple-400 mt-1">Claude 3.5 + Gemini</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between hover:border-teal-500/30 transition">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Step 3 • Validation</span>
            <span className="font-bold text-white text-xs mt-2">Security Guardrails</span>
            <span className="text-[11px] text-teal-400 mt-1">Groq LPU (48ms)</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between hover:border-orange-500/30 transition">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Step 4 • Execution</span>
            <span className="font-bold text-white text-xs mt-2">Remediation Patch</span>
            <span className="text-[11px] text-amber-400 mt-1">Lambda Hot-Reload</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between hover:border-blue-500/30 transition">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Step 5 • Audit</span>
            <span className="font-bold text-white text-xs mt-2">Immutable Ledger</span>
            <span className="text-[11px] text-blue-400 mt-1">Neon PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Real-time State Event Stream */}
      <LiveEventStream incidents={incidents} />
    </div>
  );
};
