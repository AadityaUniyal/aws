import React from 'react';
import { BedrockPlayground } from '../components/BedrockPlayground';
import { Sparkles, Cpu, Eye } from 'lucide-react';
import { Incident } from '../types';

interface AiArenaPageProps {
  onOpenArenaModal: () => void;
  onOpenVisionModal: () => void;
  onInjectCustomPrompt: (payload: Partial<Incident>) => Promise<void>;
  isCustomLoading: boolean;
}

export const AiArenaPage: React.FC<AiArenaPageProps> = ({
  onOpenArenaModal,
  onOpenVisionModal,
  onInjectCustomPrompt,
  isCustomLoading
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="ios-glass-card rounded-[2rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">AI Model Arena & Bedrock Intelligence</h1>
              <p className="text-xs text-slate-400">
                Multi-Agent LLM consensus engine comparing Claude 3.5 Sonnet, Gemini 2.5 Pro, and Groq LPU Llama 3.3
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVisionModal}
            className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Multimodal Vision OCR</span>
          </button>
          <button
            onClick={onOpenArenaModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-orange-500/20"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Full Arena Matrix</span>
          </button>
        </div>
      </div>

      {/* Model Spec Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="ios-glass-card rounded-[1.75rem] p-5 border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 font-mono">PRIMARY AGENT</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Bedrock Live
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Anthropic Claude 3.5 Sonnet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Deep semantic root cause analysis, AST code patch generation, and distributed consensus validation.
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Latency: <strong className="text-white">~380ms</strong></span>
            <span>Accuracy: <strong className="text-emerald-400">99.4%</strong></span>
          </div>
        </div>

        <div className="ios-glass-card rounded-[1.75rem] p-5 border-blue-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 font-mono">CROSS-AUDITOR</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              API Active
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Google Gemini 2.5 Pro</h3>
            <p className="text-xs text-slate-400 mt-1">
              1M+ token context window for exhaustive VPC network graph log analysis and multi-modal trace correlation.
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Latency: <strong className="text-white">~290ms</strong></span>
            <span>Accuracy: <strong className="text-emerald-400">98.9%</strong></span>
          </div>
        </div>

        <div className="ios-glass-card rounded-[1.75rem] p-5 border-teal-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 font-mono">HIGH-SPEED LPU</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Sub-50ms
            </span>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Groq LPU Llama 3.3 70B</h3>
            <p className="text-xs text-slate-400 mt-1">
              Ultra-fast hardware inference for micro-second security triage, rapid SQL ledger checks, and rate-limit guardrails.
            </p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Latency: <strong className="text-emerald-400">48ms</strong></span>
            <span>Throughput: <strong className="text-white">750 tps</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Bedrock Playground */}
      <div className="ios-glass-card rounded-[2rem] p-6">
        <BedrockPlayground
          onInjectCustomPrompt={onInjectCustomPrompt}
          isLoading={isCustomLoading}
        />
      </div>
    </div>
  );
};
