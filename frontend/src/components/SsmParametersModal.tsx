import React, { useState } from 'react';
import { X, Lock, Key, Shield, CheckCircle2, Copy, Check } from 'lucide-react';

interface SsmParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SsmParametersModal: React.FC<SsmParametersModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const params = [
    {
      name: '/cloudsentinel/prod/auto_heal_enabled',
      type: 'String',
      value: 'true',
      tier: 'Standard',
      kmsKey: 'aws/ssm',
      desc: 'Master circuit breaker toggle for autonomous IaC hot-patch deployment.'
    },
    {
      name: '/cloudsentinel/prod/ai_consensus_threshold',
      type: 'String',
      value: '0.95',
      tier: 'Standard',
      kmsKey: 'aws/ssm',
      desc: 'Minimum multi-model ensemble confidence required before autonomous execution.'
    },
    {
      name: '/cloudsentinel/prod/bedrock_model_id',
      type: 'String',
      value: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      tier: 'Standard',
      kmsKey: 'aws/ssm',
      desc: 'Primary foundation model for Infrastructure as Code synthesis.'
    },
    {
      name: '/cloudsentinel/prod/sns_alert_topic_arn',
      type: 'SecureString',
      value: 'arn:aws:sns:us-east-1:145023097151:CloudSentinel-Alerts',
      tier: 'Advanced',
      kmsKey: 'arn:aws:kms:us-east-1:145023097151:key/cmk-cloudsentinel-prod',
      desc: 'Encrypted ARN for urgent PagerDuty/Slack notification dispatcher.'
    }
  ];

  const handleCopy = (val: string, keyName: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                AWS Systems Manager (SSM) Parameter Store & Secrets
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  KMS Encrypted
                </span>
              </h2>
              <p className="text-xs text-slate-400">Zero-Hardcoding Dynamic Parameter & Secrets Management on AWS</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {params.map((p, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 font-bold text-[11px]">{p.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  p.type === 'SecureString'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {p.type}
                </span>
              </div>

              <div className="bg-black/80 rounded-lg p-2 flex items-center justify-between font-mono text-[11px] text-slate-300">
                <span className="truncate">{p.value}</span>
                <button
                  onClick={() => handleCopy(p.value, p.name)}
                  className="text-slate-400 hover:text-white ml-2 shrink-0 flex items-center gap-1 text-[10px]"
                >
                  {copiedKey === p.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === p.name ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{p.desc}</span>
                <span className="font-mono">KMS: {p.kmsKey}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">AWS SSM Parameter Store • Region: us-east-1</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
