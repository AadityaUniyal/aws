import React, { useState } from 'react';
import { Incident } from '../types';
import { X, CheckCircle2, AlertTriangle, Shield, Terminal, ArrowRight, RefreshCw, Sparkles, FileCode2, Copy, Check } from 'lucide-react';
import { soundFx } from '../utils/audioSynth';

interface RemediationModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onExecute: (id: string) => Promise<void>;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  incident,
  isOpen,
  onClose,
  onExecute
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !incident || !incident.remediation_patch) return null;

  const patch = incident.remediation_patch;

  const handleRunRemediation = async () => {
    setIsExecuting(true);
    soundFx.speak('Applying automated infrastructure remediation');
    try {
      await onExecute(incident.id);
      setIsSuccess(true);
      soundFx.playSuccess();
      soundFx.speak('Incident remediated successfully. Cloud reliability restored.');
      setTimeout(() => {
        setIsSuccess(false);
        setIsExecuting(false);
        onClose();
      }, 1800);
    } catch (e) {
      console.error(e);
      setIsExecuting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(patch.iac_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                IaC Remediation Synthesizer & Diff Reviewer
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {patch.iac_type}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {patch.title} • Target: <span className="font-mono text-amber-400">{incident.account_id || '145023097151'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Target Resource</span>
              <span className="font-semibold text-slate-200 truncate block mt-0.5" title={patch.target_resource_arn}>
                {patch.target_service}
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Risk Assessment</span>
              <span className="font-semibold text-emerald-400 block mt-0.5">
                {patch.risk_level} Risk (Automated Safe)
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Lead Architect</span>
              <span className="font-semibold text-amber-400 block mt-0.5">
                {incident.lead_architect || 'Aaditya Uniyal'}
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-mono block">Rollback Guarantee</span>
              <span className="font-semibold text-blue-400 block mt-0.5 truncate" title={patch.rollback_plan}>
                Zero-Downtime Reversible
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
              Automated Remediation Rationale
            </span>
            <p className="text-slate-300 leading-relaxed">
              {patch.description}
            </p>
          </div>

          {/* Visual Code Diff: Broken (Red) vs Fixed (Green) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Broken State */}
            <div className="border border-rose-500/30 rounded-xl bg-slate-950/80 overflow-hidden">
              <div className="px-3.5 py-2 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Current Broken State
                </span>
                <span className="text-[9px] font-mono text-rose-300/80">Causes Outage</span>
              </div>
              <div className="p-3 font-mono text-[11px] text-rose-200/90 overflow-x-auto max-h-56">
                <pre>{patch.current_broken_code || '# Missing scaling or security configuration'}</pre>
              </div>
            </div>

            {/* Right: Fixed State */}
            <div className="border border-emerald-500/30 rounded-xl bg-slate-950/80 overflow-hidden">
              <div className="px-3.5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Synthesized Hot-Patch Fix
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-[10px] text-emerald-400 hover:text-white flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-56 selection:bg-emerald-500/40">
                <pre>{patch.iac_code}</pre>
              </div>
            </div>
          </div>

          {/* Rollback Details */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 flex items-start space-x-2.5">
            <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-blue-400 font-semibold block text-[11px]">Automated Health Probe & Rollback Strategy</span>
              <p className="text-slate-400 text-[11px] mt-0.5">{patch.rollback_plan}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleRunRemediation}
            disabled={isExecuting || isSuccess || incident.status === 'RESOLVED'}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition active:scale-95 ${
              isSuccess
                ? 'bg-emerald-600 text-white'
                : incident.status === 'RESOLVED'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-orange-500/25'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Applying AWS Configuration Hot-Patch...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Remediation Complete!</span>
              </>
            ) : incident.status === 'RESOLVED' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Already Remediated</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute 1-Click Autonomous Remediation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
