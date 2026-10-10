import React, { useState } from 'react';
import { 
  Search, Volume2, VolumeX, RefreshCw, 
  Flame, Radio
} from 'lucide-react';
import { DynamicIsland } from './DynamicIsland';
import { Incident } from '../types';
import { UserProfile } from './AuthModal';
import { soundFx } from '../utils/audioSynth';

interface TopHeaderProps {
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
  onOpenPalette: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
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
  loadingDiagnoseId,
  onOpenPalette,
  onRefreshData,
  isRefreshing
}) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const toggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    if (next) {
      soundFx.speak('Voice alerts enabled.');
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full px-4 sm:px-6 py-3 bg-[#06080d]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between gap-4">
      {/* Left Search / Command Palette Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all text-xs group"
        >
          <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">Search AI tools & AWS ops...</span>
          <span className="md:hidden">Search...</span>
          <kbd className="ml-1.5 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-slate-400 border border-white/10">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className={`p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-400 hover:text-white transition ${
            isRefreshing ? 'animate-spin text-amber-400' : ''
          }`}
          title="Refresh Telemetry"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Centered Dynamic Island */}
      <div className="flex-1 flex justify-center max-w-xl min-w-0">
        <DynamicIsland
          currentUser={currentUser}
          incidents={incidents}
          selectedIncident={selectedIncident}
          isAutoHealActive={isAutoHealActive}
          onToggleAutoHeal={onToggleAutoHeal}
          onTriggerDiagnose={onTriggerDiagnose}
          onOpenChaosModal={onOpenChaosModal}
          onOpenCliModal={onOpenCliModal}
          onOpenDbModal={onOpenDbModal}
          onOpenVisionModal={onOpenVisionModal}
          onOpenStepFunctionsModal={onOpenStepFunctionsModal}
          onOpenPitchDeckModal={onOpenPitchDeckModal}
          onOpenAuthModal={onOpenAuthModal}
          loadingDiagnoseId={loadingDiagnoseId}
        />
      </div>

      {/* Right Controls: Auto-Pilot Loop, Voice Alert, Chaos Trigger */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-end">
        {/* Auto-Pilot Autonomous Loop Toggle */}
        <button
          type="button"
          onClick={onToggleAutoHeal}
          className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all border ${
            isAutoHealActive
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10 animate-pulse'
              : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border-white/10'
          }`}
          title="Autonomous self-healing flight loop"
        >
          <Radio className={`w-3.5 h-3.5 ${isAutoHealActive ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
          <span className="hidden xl:inline">{isAutoHealActive ? 'Auto-Heal Active' : 'Auto-Heal Off'}</span>
        </button>

        {/* Voice Synth Alert Toggle */}
        <button
          type="button"
          onClick={toggleVoice}
          className={`p-2 rounded-xl border transition-all ${
            isVoiceEnabled
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-white/[0.03] text-slate-500 border-white/10'
          }`}
          title={isVoiceEnabled ? "Voice Alerts Mute" : "Voice Alerts Unmute"}
        >
          {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Chaos Button */}
        <button
          type="button"
          onClick={onOpenChaosModal}
          className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
        >
          <Flame className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Inject Fault</span>
        </button>
      </div>
    </header>
  );
};
