import React, { useState } from 'react';
import { X, Image, Sparkles, CheckCircle2, ShieldAlert, Cpu, FileCode2, ArrowRight, RefreshCw, UploadCloud } from 'lucide-react';

interface MultimodalVisualInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFix: (fixDescription: string) => void;
}

export const MultimodalVisualInspector: React.FC<MultimodalVisualInspectorProps> = ({
  isOpen,
  onClose,
  onApplyFix
}) => {
  const [description, setDescription] = useState('Inspect active AWS topology for single points of failure, unscaled DynamoDB partition keys, and public S3 ACL leaks.');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunVisionAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Multimodal Visual Architecture & Failure Inspector
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Gemini 2.5 Flash Vision
                </span>
              </h2>
              <p className="text-xs text-slate-400">Visual failure detection across AWS topology and infrastructure diagrams</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Visual Topology Prompt / Upload Area */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-purple-400" />
                Architecture Diagram & Telemetry Context
              </span>
              <span className="text-[10px] font-mono text-slate-500">Account: 145023097151</span>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 font-mono">
                Model: Google Gemini 2.5 Flash • Latency: ~1.2s
              </span>

              <button
                onClick={handleRunVisionAnalysis}
                disabled={loading}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{loading ? 'Analyzing Topology...' : 'Run Visual AI Analysis'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analysis && (
            <div className="space-y-3 animate-fade-in">
              {/* Detected Services */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-2">Detected AWS Microservices</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.detected_services?.map((svc: string, i: number) => (
                    <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Failure Points & Vulnerabilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/20">
                  <span className="text-rose-400 font-bold uppercase text-[10px] block mb-2 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Detected Failure Points
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {analysis.failure_points?.map((fp: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400">•</span>
                        <span>{fp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <span className="text-emerald-400 font-bold uppercase text-[10px] block mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommended IaC Fixes
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {analysis.recommended_iac_fixes?.map((fix: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Scorecard */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400">Post-Remediation Compliance:</span>
                <span className="text-emerald-400 font-bold">{analysis.compliance_rating}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Multimodal AI • Google Gemini 2.5 Flash</span>
          <div className="flex items-center space-x-2">
            {analysis && (
              <button
                onClick={() => {
                  onApplyFix(analysis.recommended_iac_fixes?.[0] || 'Auto-healing applied');
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply IaC Fixes Live</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
