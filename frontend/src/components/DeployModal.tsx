import React, { useState } from 'react';
import { X, Cloud, Terminal, Check, Copy, Server, CheckCircle2, Shield } from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const accountId = '145023097151';
  const architect = 'Aaditya Uniyal';

  const commands = [
    {
      title: '1. Configure AWS CLI with Account',
      cmd: `aws configure\n# Enter AWS Access Key, Secret Key, and Region (us-east-1)`
    },
    {
      title: '2. Deploy Complete CloudFormation Infrastructure Stack',
      cmd: `aws cloudformation create-stack \\\n  --stack-name CloudSentinel-Stack \\\n  --template-body file://infrastructure/cloudformation-template.yaml \\\n  --parameters ParameterKey=EnvironmentName,ParameterValue=prod \\\n  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \\\n  --tags Key=Project,Value=CloudSentinel-AI Key=AccountID,Value=${accountId} Key=Architect,Value="${architect}"`
    },
    {
      title: '3. Verify Deployed AWS Resources',
      cmd: `aws cloudformation describe-stacks --stack-name CloudSentinel-Stack --query "Stacks[0].Outputs"`
    }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AWS Cloud Deployment Center</h2>
              <p className="text-xs text-slate-400">Account ID: {accountId} • Architect: {architect}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-400">AWS CLI v2 & Boto3 Ready</span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                The environment is equipped with AWS CLI v2 (`aws-cli/2.37.12`). Use the commands below to deploy the stack to account `{accountId}`.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {commands.map((item, idx) => (
              <div key={idx} className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-300">{item.title}</span>
                  <button
                    onClick={() => handleCopy(item.cmd, idx)}
                    className="flex items-center space-x-1 text-[11px] text-amber-400 hover:text-amber-300 transition"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/90 rounded-lg p-2.5 font-mono text-[11px] text-slate-200 overflow-x-auto selection:bg-amber-500/30">
                  <pre>{item.cmd}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Region: us-east-1 • All Services Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
