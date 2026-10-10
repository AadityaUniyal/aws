import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, Zap, CheckCircle2, AlertTriangle, 
  Sparkles, Terminal, Database, Play, Volume2, VolumeX,
  ChevronDown, ChevronUp, Cpu, Server, Lock, Flame,
  Compass, BarChart3, RefreshCw
} from 'lucide-react';
import { Incident } from '../types';
import { soundFx } from '../utils/audioSynth';
import { UserProfile } from './AuthModal';

interface DynamicIslandProps {
  currentUser: UserProfile;
  incidents: Incident[];
  selectedIncident: Incident | null;
  isAutoHealActive: boolean;
  onToggleAutoHeal: () => void;
  onTriggerDiagnose: (id: string) => void;
  onOpenChaosModal: () => void;
  onOpenCliModal: () => void;
  onOpenDbModal: () => void;
  onOpenVisionModal: () => void;
  onOpenStepFunctionsModal: () => void;
  onOpenPitchDeckModal: () => void;
  onOpenAuthModal: () => void;
  loadingDiagnoseId: string | null;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  currentUser,
  incidents,
  selectedIncident,
  isAutoHealActive,
  onToggleAutoHeal,
  onTriggerDiagnose,
  onOpenChaosModal,
  onOpenCliModal,
  onOpenDbModal,
  onOpenVisionModal,
  onOpenStepFunctionsModal,
  onOpenPitchDeckModal,
  onOpenAuthModal,
  loadingDiagnoseId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());
  const [waveformHeights, setWaveformHeights] = useState([40, 70, 30, 90, 60, 45, 80, 55]);

  // Dynamic waveform animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformHeights(prev => prev.map(() => Math.floor(Math.random() * 75) + 25));
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const openIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const activeIncident = selectedIncident || openIncidents[0] || null;
  const isDiagnosing = Boolean(loadingDiagnoseId);
  const isResolved = activeIncident?.status === 'RESOLVED';
  const isCritical = activeIncident?.severity === 'CRITICAL' && !isResolved;

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative z-50 flex justify-center w-full px-4 pt-2 pb-3 pointer-events-none">
      {/* The Dynamic Island Pill Container */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer select-none
          border shadow-2xl backdrop-blur-3xl overflow-hidden
          ${isExpanded 
            ? 'w-full max-w-3xl rounded-[2.25rem] bg-slate-950/95 border-white/20 p-5 ring-2 ring-amber-500/20 shadow-orange-500/10' 
            : isDiagnosing
            ? 'w-[420px] rounded-full bg-gradient-to-r from-purple-950/90 via-slate-950/90 to-indigo-950/90 border-purple-500/50 px-4 py-2 ring-2 ring-purple-500/30'
            : isCritical
            ? 'w-[460px] rounded-full bg-gradient-to-r from-red-950/95 via-slate-950/95 to-orange-950/95 border-red-500/60 px-4 py-2 ring-2 ring-red-500/40 animate-pulse'
            : isAutoHealActive
            ? 'w-[400px] rounded-full bg-gradient-to-r from-emerald-950/90 via-slate-950/90 to-teal-950/90 border-emerald-500/50 px-4 py-2 ring-2 ring-emerald-500/30'
            : 'w-[360px] rounded-full bg-slate-950/90 border-white/10 px-4 py-2 hover:border-white/30 hover:scale-[1.02]'
          }`}
      >
        {/* COMPACT VIEW */}
        {!isExpanded && (
          <div className="flex items-center justify-between gap-3 h-7">
            {/* Left Status Icon & Pulse */}
            <div className="flex items-center gap-2">
              {isDiagnosing ? (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-purple-400 opacity-75"></span>
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                </div>
              ) : isCritical ? (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
                  <Flame className="w-4 h-4 text-red-400 animate-bounce" />
                </div>
              ) : isAutoHealActive ? (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-60"></span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 ring-2 ring-emerald-400/20" />
              )}

              {/* Status Text / Live Feed */}
              <div className="text-[12px] font-medium tracking-tight truncate max-w-[200px]">
                {isDiagnosing ? (
                  <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                    Multi-Model AI Consensus...
                  </span>
                ) : isCritical && activeIncident ? (
                  <span className="text-red-300 font-semibold truncate block">
                    {activeIncident.service}: {activeIncident.title.slice(0, 22)}...
                  </span>
                ) : isAutoHealActive ? (
                  <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/40">Auto-Pilot</span>
                    Autonomous SRE Loop
                  </span>
                ) : (
                  <span className="text-slate-300 font-medium">
                    CloudSentinel • 99.999% SLA
                  </span>
                )}
              </div>
            </div>

            {/* Right Waveform & Quick Trigger */}
            <div className="flex items-center gap-2.5">
              {/* Dynamic Mini Waveform (Apple Style) */}
              <div className="flex items-center gap-[2.5px] h-3.5 px-1">
                {waveformHeights.slice(0, 6).map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-[2.5px] rounded-full transition-all duration-150 ${
                      isDiagnosing 
                        ? 'bg-purple-400' 
                        : isCritical 
                        ? 'bg-red-400' 
                        : isAutoHealActive 
                        ? 'bg-emerald-400' 
                        : 'bg-amber-400'
                    }`}
                  />
                ))}
              </div>

              {/* Quick Action Button */}
              {isCritical && activeIncident && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerDiagnose(activeIncident.id);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold shadow-md shadow-red-500/30 active:scale-95 transition"
                >
                  Heal
                </button>
              )}

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 opacity-60 hover:opacity-100" />
            </div>
          </div>
        )}

        {/* EXPANDED VIEW (iOS Control Center Drawer) */}
        {isExpanded && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Top Bar of Expanded Island */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Dynamic Control Island</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Live Telemetry Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Lead Architect: <span className="text-slate-200 font-semibold">{currentUser.name}</span> • AWS ID: <span className="font-mono text-amber-400">{currentUser.accountId}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMute}
                  className={`p-2 rounded-2xl border transition ${
                    isMuted 
                      ? 'bg-slate-900 border-white/10 text-slate-500' 
                      : 'bg-purple-500/20 border-purple-500/30 text-purple-300'
                  }`}
                  title={isMuted ? 'Unmute Audio Synthesis' : 'Mute Audio Synthesis'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* iOS Bento Quick-Toggle Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Toggle 1: Auto-Pilot SRE */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAutoHeal();
                }}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 ${
                  isAutoHealActive
                    ? 'bg-emerald-500/20 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${isAutoHealActive ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isAutoHealActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isAutoHealActive ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Auto-Pilot SRE</span>
                  <span className="text-[10px] text-slate-400">Continuous Healing</span>
                </div>
              </div>

              {/* Toggle 2: Stress Lab Injection */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  onOpenChaosModal();
                }}
                className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-orange-400">Chaos</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Stress Lab</span>
                  <span className="text-[10px] text-slate-400">Inject Outage Scenarios</span>
                </div>
              </div>

              {/* Toggle 3: Cloud CLI Ops */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  onOpenCliModal();
                }}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 cursor-pointer flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">boto3</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">CLI Ops</span>
                  <span className="text-[10px] text-slate-400">AWS Shell Console</span>
                </div>
              </div>

              {/* Toggle 4: Distributed State Machine */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  onOpenStepFunctionsModal();
                }}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200 cursor-pointer flex flex-col justify-between h-24"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
                    <Server className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-400">Workflow</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Orchestrator</span>
                  <span className="text-[10px] text-slate-400">Step Functions</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar inside Island */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center justify-around text-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Target SLA</span>
                <span className="font-bold text-emerald-400 text-sm">99.999%</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Autonomous MTTR</span>
                <span className="font-bold text-amber-400 text-sm">&lt; 2.4 sec</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Active Incidents</span>
                <span className="font-bold text-white text-sm">{openIncidents.length} active</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">AI Consensus Engine</span>
                <span className="font-bold text-purple-400 text-sm">Claude + Gemini + Groq</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
