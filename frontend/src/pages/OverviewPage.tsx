import React from 'react';
import { Incident, SystemMetrics, TopologyNode } from '../types';
import { SystemStatusBanner } from '../components/SystemStatusBanner';
import { LiveTelemetrySparklines } from '../components/LiveTelemetrySparklines';
import { CostSavingsWidget } from '../components/CostSavingsWidget';
import { TopologyCanvas } from '../components/TopologyCanvas';
import { 
  Flame, Award, Layers, Sparkles, BookOpen, 
  ArrowUpRight, ShieldCheck, Cpu, Database, Activity, RefreshCw 
} from 'lucide-react';

interface OverviewPageProps {
  metrics: SystemMetrics | null;
  topology: TopologyNode[];
  incidents: Incident[];
  onOpenChaos: () => void;
  onOpenWhitepaper: () => void;
  onOpenPitchDeck: () => void;
  onOpenAwsMatrix: () => void;
  onOpenArena: () => void;
  onOpenDeploy: () => void;
  onSelectIncident: (inc: Incident) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  metrics,
  topology,
  incidents,
  onOpenChaos,
  onOpenWhitepaper,
  onOpenPitchDeck,
  onOpenAwsMatrix,
  onOpenArena,
  onOpenDeploy,
  onSelectIncident
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Real-time System Status Banner */}
      <SystemStatusBanner 
        onOpenArchitecture={onOpenAwsMatrix}
        onOpenArena={onOpenArena}
      />

      {/* Primary KPI & Sparkline Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveTelemetrySparklines metrics={metrics} />
        </div>
        <div className="lg:col-span-1">
          <CostSavingsWidget incidents={incidents} />
        </div>
      </div>

      {/* Global Infrastructure Topology */}
      <div className="ios-glass-card rounded-[2rem] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-bold text-white text-base">Global Microservices Mesh Topology</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live AWS cross-service graph (ap-south-1) with real-time health telemetry & circuit breakers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAwsMatrix}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>AWS Stack Matrix</span>
            </button>
            <button
              onClick={onOpenDeploy}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Deploy Hotfix</span>
            </button>
          </div>
        </div>

        {/* Interactive SVG Canvas */}
        <div className="min-h-[420px] rounded-2xl overflow-hidden border border-white/5 bg-slate-950/40">
          <TopologyCanvas 
            nodes={topology} 
            onSelectNode={(node) => {
              const matchedInc = incidents.find(i => i.service.toLowerCase().includes(node.name.toLowerCase()));
              if (matchedInc) onSelectIncident(matchedInc);
            }} 
          />
        </div>
      </div>

      {/* Quick Launchpad Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={onOpenChaos}
          className="ios-glass-card rounded-[1.75rem] p-5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-red-500/20 text-red-300 border border-red-500/30 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">Chaos Engineering</span>
            <span className="text-xs text-slate-400">Inject memory leaks & DB lock faults</span>
          </div>
        </div>

        <div 
          onClick={onOpenWhitepaper}
          className="ios-glass-card rounded-[1.75rem] p-5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">Technical Whitepaper</span>
            <span className="text-xs text-slate-400">Multi-agent consensus architecture</span>
          </div>
        </div>

        <div 
          onClick={onOpenPitchDeck}
          className="ios-glass-card rounded-[1.75rem] p-5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">Judges Pitch Deck</span>
            <span className="text-xs text-slate-400">Executive value & ROI analysis</span>
          </div>
        </div>

        <div 
          onClick={onOpenAwsMatrix}
          className="ios-glass-card rounded-[1.75rem] p-5 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-36 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">AWS Services Matrix</span>
            <span className="text-xs text-slate-400">16+ native AWS services breakdown</span>
          </div>
        </div>
      </div>
    </div>
  );
};
