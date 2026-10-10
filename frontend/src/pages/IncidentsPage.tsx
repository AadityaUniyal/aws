import React from 'react';
import { Incident } from '../types';
import { IncidentFeed } from '../components/IncidentFeed';
import { BedrockConsole } from '../components/BedrockConsole';
import { LiveEventStream } from '../components/LiveEventStream';
import { AlertOctagon, Flame } from 'lucide-react';

interface IncidentsPageProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  onOpenRemediation: (inc: Incident) => void;
  onTriggerDiagnose: (id: string) => void;
  loadingDiagnoseId: string | null;
  onOpenChaos: () => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onOpenRemediation,
  onTriggerDiagnose,
  loadingDiagnoseId,
  onOpenChaos
}) => {
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REMEDIATED');
  const criticalCount = activeIncidents.filter(i => i.severity === 'CRITICAL').length;
  const activeCount = activeIncidents.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="ios-glass-card rounded-[2rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${criticalCount > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">Active Incident War-Room</h1>
              <p className="text-xs text-slate-400">
                Real-time Amazon CloudWatch anomaly detection & automated Bedrock root-cause consensus
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            <span className="text-slate-400">Total Active:</span>
            <span className={`font-mono font-bold ${activeCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activeCount}
            </span>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                {criticalCount} Critical
              </span>
            )}
          </div>

          <button
            onClick={onOpenChaos}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Fault</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Feed on left (1/3), Deep Diagnosis Console on right (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-[750px] overflow-hidden flex flex-col">
          <IncidentFeed
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
            onTriggerDiagnose={onTriggerDiagnose}
            onOpenRemediation={onOpenRemediation}
            loadingId={loadingDiagnoseId}
          />
        </div>

        <div className="lg:col-span-8 h-[750px] overflow-hidden flex flex-col">
          <BedrockConsole
            incident={selectedIncident}
            onOpenRemediation={onOpenRemediation}
          />
        </div>
      </div>

      {/* Live Event Stream Ledger at bottom */}
      <LiveEventStream incidents={incidents} />
    </div>
  );
};
