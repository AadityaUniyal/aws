import React from 'react';
import { Cloud, CheckCircle2, Shield, Sparkles, Cpu, Layers, Database, Lock, GitCommit, Bell } from 'lucide-react';

interface AwsServicesBadgeBarProps {
  onOpenMatrix: () => void;
}

export const AwsServicesBadgeBar: React.FC<AwsServicesBadgeBarProps> = ({ onOpenMatrix }) => {
  const badges = [
    { label: 'Amazon Bedrock', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { label: 'AWS Lambda', icon: Layers, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { label: 'Amazon DynamoDB', icon: Database, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
    { label: 'Amazon S3', icon: Lock, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'API Gateway', icon: Cloud, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { label: 'AWS Step Functions', icon: GitCommit, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
    { label: 'Amazon SNS', icon: Bell, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { label: 'Neon Postgres (AWS us-east-2)', icon: Database, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Gemini 2.5 Flash', icon: Cpu, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { label: 'Groq LPU (48ms)', icon: Shield, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 backdrop-blur flex items-center justify-between gap-2 overflow-x-auto select-none">
      <div className="flex items-center space-x-2 shrink-0 pl-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-bold text-slate-300 font-mono">LIVE AWS SERVICES:</span>
      </div>

      <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div
              key={idx}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[10px] font-mono shrink-0 ${b.color}`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{b.label}</span>
              <span className="text-emerald-400 font-bold ml-1">●</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={onOpenMatrix}
        className="shrink-0 px-2.5 py-1 text-[10px] font-mono text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition active:scale-95 ml-2"
      >
        View Grid ↗
      </button>
    </div>
  );
};
