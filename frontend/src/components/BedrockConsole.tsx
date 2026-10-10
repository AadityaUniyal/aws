import React from 'react';
import { Incident } from '../types';
import { Bot, Sparkles, Terminal, FileCode2, Zap, ArrowRight, ShieldCheck, Database, HardDrive, Cpu, CheckCircle2, Lock } from 'lucide-react';

interface BedrockConsoleProps {
  incident: Incident | null;
  onOpenRemediation: (inc: Incident) => void;
}

export const BedrockConsole: React.FC<BedrockConsoleProps> = ({ incident, onOpenRemediation }) => {
  if (!incident) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur flex flex-col items-center justify-center text-center h-full min-h-[480px]">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
          <Bot className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">Hybrid Multi-Model AI Reasoning Console</h3>
        <p className="text-xs text-slate-400 max-w-md">
          Orchestrates Google Gemini 2.5 Flash, Groq LPU, and Amazon Bedrock (Claude 3.5 Sonnet) in an automated consensus pipeline.
        </p>
      </div>
    );
  }

  const thoughts = incident.agent_thoughts || [];
  const consensus = incident.ai_consensus;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">Hybrid Multi-Model AI Consensus Engine</span>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 99.4% Consensus
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {incident.id} • {incident.service} (Lead: <span className="text-slate-200">{incident.lead_architect || 'Aaditya Uniyal'}</span>)
            </p>
          </div>
        </div>

        {incident.remediation_patch && (
          <button
            onClick={() => onOpenRemediation(incident)}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-orange-500/20 transition active:scale-95 shrink-0"
          >
            <FileCode2 className="w-4 h-4" />
            <span>Review IaC Remediation Patch</span>
          </button>
        )}
      </div>

      {/* Multi-Model AI Service Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-blue-500/30 flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-blue-400 block uppercase font-bold">1. Diagnosis & RCA</span>
            <span className="text-[11px] font-semibold text-slate-200 truncate block">Google Gemini 2.5 Flash</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-teal-500/30 flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-teal-400 block uppercase font-bold">2. Security & IAM Audit</span>
            <span className="text-[11px] font-semibold text-slate-200 truncate block">Groq LPU (48.2ms)</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <FileCode2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-purple-400 block uppercase font-bold">3. IaC Synthesizer</span>
            <span className="text-[11px] font-semibold text-slate-200 truncate block">Amazon Bedrock Claude</span>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis Banner */}
      {incident.root_cause_analysis && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Root Cause Analysis (RCA)</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {incident.root_cause_analysis}
          </p>
        </div>
      )}

      {/* Blast Radius */}
      {incident.blast_radius && incident.blast_radius.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3.5">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-2">
            Downstream Blast Radius Impact ({incident.blast_radius.length} Resources)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {incident.blast_radius.map((res, i) => (
              <div key={i} className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="truncate">{res}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chain-of-Thought Agent Steps */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Ensemble Multi-Agent Execution Trace
        </span>
        <div className="space-y-3">
          {thoughts.length === 0 ? (
            <div className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-lg">
              No thought steps recorded yet. Click "Diagnose AI" to invoke the hybrid AI pipeline.
            </div>
          ) : (
            thoughts.map((step) => (
              <div
                key={step.step_number}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold border border-purple-500/30">
                      {step.step_number}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{step.agent_name}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                      {Math.round((step.confidence_score || 0.98) * 100)}% Conf
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans pl-7">
                  <strong className="text-purple-300 font-semibold">Hypothesis:</strong> {step.thought}
                </p>

                <div className="pl-7 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                    <span className="text-amber-400 font-semibold block mb-0.5">ACTION:</span>
                    <span className="text-slate-400">{step.action_taken}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                    <span className="text-emerald-400 font-semibold block mb-0.5">OBSERVATION:</span>
                    <span className="text-slate-400">{step.observation}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Raw S3 Logs Preview */}
      {incident.raw_logs && incident.raw_logs.length > 0 && (
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              S3 Incident Log Snapshot ({incident.s3_log_uri || `s3://customer-pii-vault-${incident.account_id || '145023097151'}/logs`})
            </span>
          </div>
          <div className="bg-black/80 rounded-lg p-2.5 font-mono text-[10px] text-slate-300 space-y-1 overflow-x-auto max-h-28">
            {incident.raw_logs.map((log, i) => (
              <div key={i} className="text-emerald-400/90 leading-tight">
                &gt; {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
