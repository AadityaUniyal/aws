import React, { useState } from 'react';
import { Shield, Sparkles, RefreshCw, Zap, Server, Award, Volume2, VolumeX, Cloud, FileText, Database, Terminal, Image, GitCommit, BookOpen, User, LogOut, Lock } from 'lucide-react';
import { soundFx } from '../utils/audioSynth';
import { UserProfile } from './AuthModal';

interface NavbarProps {
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onOpenChaosModal: () => void;
  onOpenDeployModal: () => void;
  onOpenPostmortemModal: () => void;
  onOpenDbModal: () => void;
  onOpenCliModal: () => void;
  onOpenVisionModal: () => void;
  onOpenPitchDeckModal: () => void;
  onOpenStepFunctionsModal: () => void;
  onOpenRunbooksModal: () => void;
  isAutoHealActive: boolean;
  onToggleAutoHeal: () => void;
  onReset: () => void;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuthModal,
  onOpenChaosModal,
  onOpenDeployModal,
  onOpenPostmortemModal,
  onOpenDbModal,
  onOpenCliModal,
  onOpenVisionModal,
  onOpenPitchDeckModal,
  onOpenStepFunctionsModal,
  onOpenRunbooksModal,
  isAutoHealActive,
  onToggleAutoHeal,
  onReset,
  isConnected
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.getIsMuted());

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PRINCIPAL_SRE_COMMANDER':
        return 'Commander';
      case 'INFRA_AUDITOR':
        return 'Auditor';
      default:
        return 'Operator';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Lead Architect Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">CloudSentinel</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI
              </span>
              <button
                onClick={onOpenPitchDeckModal}
                className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 flex items-center gap-1 transition active:scale-95"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>🏆 Executive Pitch</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Enterprise Resilience Platform • Lead Architect: <span className="text-slate-200 font-semibold">{currentUser.name}</span>
            </p>
          </div>
        </div>

        {/* Feature Navigation Actions */}
        <div className="flex items-center space-x-2">
          {/* Autonomous Flight Loop Toggle */}
          <button
            onClick={onToggleAutoHeal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border active:scale-95 ${
              isAutoHealActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Auto-Pilot: Continuously monitors, diagnoses, and auto-heals anomalies"
          >
            <span className={`w-2 h-2 rounded-full ${isAutoHealActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="hidden sm:inline">{isAutoHealActive ? 'Auto-Pilot Active' : 'Enable Auto-Pilot'}</span>
          </button>

          {/* Voice Alerts Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Voice Alerts' : 'Mute Voice Alerts'}
            className={`p-2 rounded-lg border transition ${
              isMuted ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300' : 'bg-purple-500/20 border-purple-500/30 text-purple-300 shadow-sm'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Orchestrator Pipeline (Step Functions) */}
          <button
            onClick={onOpenStepFunctionsModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold transition active:scale-95"
            title="Distributed Remediation Pipeline"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Orchestrator</span>
          </button>

          {/* Knowledge Runbooks (OpenSearch / Kendra) */}
          <button
            onClick={onOpenRunbooksModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition active:scale-95"
            title="Enterprise Runbooks & Knowledge Base"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Runbooks</span>
          </button>

          {/* Visual Topology Scanner (Gemini Vision) */}
          <button
            onClick={onOpenVisionModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition active:scale-95"
            title="Visual Topology & Vulnerability Scanner"
          >
            <Image className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Scanner</span>
          </button>

          {/* Cloud Ops CLI */}
          <button
            onClick={onOpenCliModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95"
            title="Cloud Ops Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">CLI Ops</span>
          </button>

          {/* Compliance Ledger (Postgres Database) */}
          <button
            onClick={onOpenDbModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition active:scale-95"
            title="Compliance & Audit Ledger"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ledger</span>
          </button>

          {/* Post-Mortem Report Generator */}
          <button
            onClick={onOpenPostmortemModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Post-Mortem</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            title="Reset environment baseline"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Stress Lab (Chaos Injection) */}
          <button
            onClick={onOpenChaosModal}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-orange-500/20 transition active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Stress Lab</span>
          </button>

          {/* User Auth Profile Pill */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl transition active:scale-95 text-left"
            title="User Profile & Security Clearance"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
              AU
            </div>
            <div className="hidden lg:block text-[11px] leading-tight">
              <span className="font-semibold text-white block truncate max-w-[100px]">{currentUser.name}</span>
              <span className="text-[9px] font-mono text-amber-400 block">{getRoleBadge(currentUser.role)}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
