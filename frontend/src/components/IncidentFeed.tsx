import React from 'react';
import { Incident } from '../types';
import { AlertCircle, ArrowRight, Bot, CheckCircle2, Clock, Wrench, ShieldAlert, Cpu } from 'lucide-react';

interface IncidentFeedProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
  onTriggerDiagnose: (id: string) => void;
  onOpenRemediation: (inc: Incident) => void;
  loadingId: string | null;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onTriggerDiagnose,
  onOpenRemediation,
  loadingId
}) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">MEDIUM</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 border border-slate-500/30">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DETECTED':
        return <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Detected</span>;
      case 'ANALYZING':
        return <span className="text-[10px] font-semibold text-purple-400 flex items-center gap-1 animate-pulse"><Cpu className="w-3 h-3 animate-spin" /> Bedrock Reasoning...</span>;
      case 'ROOT_CAUSE_IDENTIFIED':
        return <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1"><Wrench className="w-3 h-3" /> Patch Ready</span>;
      case 'RESOLVED':
      case 'REMEDIATED':
        return <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Remediated</span>;
      default:
        return <span className="text-[10px] text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Live Incident Stream ({incidents.length})
        </h2>
        <span className="text-[11px] font-mono text-slate-400">DynamoDB GSI Feed</span>
      </div>

      {incidents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="text-sm font-semibold text-slate-300">All AWS Services Healthy</p>
          <p className="text-xs text-slate-500 mt-1">Zero active anomalies detected in telemetry stream.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
          {incidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const isLoading = loadingId === inc.id;

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-300">{inc.id}</span>
                    {getSeverityBadge(inc.severity)}
                  </div>
                  {getStatusBadge(inc.status)}
                </div>

                <h3 className="text-xs font-semibold text-white line-clamp-1 mb-1">{inc.title}</h3>
                <p className="text-[11px] text-slate-400 mb-3">{inc.service}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    {inc.status === 'DETECTED' && (
                      <button
                        onClick={() => onTriggerDiagnose(inc.id)}
                        disabled={isLoading}
                        className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 transition active:scale-95"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>{isLoading ? 'Diagnosing...' : 'Diagnose AI'}</span>
                      </button>
                    )}

                    {inc.status === 'ROOT_CAUSE_IDENTIFIED' && (
                      <button
                        onClick={() => onOpenRemediation(inc)}
                        className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition active:scale-95"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Review Patch</span>
                      </button>
                    )}

                    {inc.status === 'RESOLVED' && (
                      <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
