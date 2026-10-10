import React, { useState, useEffect } from 'react';
import { X, Terminal, Play, CheckCircle2, Server, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';

interface AwsCliTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AwsCliTerminalModal: React.FC<AwsCliTerminalModalProps> = ({ isOpen, onClose }) => {
  const [command, setCommand] = useState('aws sts get-caller-identity');
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleRunCli('aws sts get-caller-identity');
    }
  }, [isOpen]);

  const handleRunCli = async (cmdToRun?: string) => {
    const cmd = cmdToRun || command;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/aws/cli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setOutput(data.output || 'Command executed successfully.');
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const presets = [
    { label: 'STS Caller Identity', cmd: 'aws sts get-caller-identity' },
    { label: 'DynamoDB Tables', cmd: 'aws dynamodb list-tables' },
    { label: 'Lambda Functions', cmd: 'aws lambda list-functions' },
    { label: 'S3 Buckets', cmd: 'aws s3 ls' },
    { label: 'Bedrock Models', cmd: 'aws bedrock list-foundation-models' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                AWS CLI v2 Interactive Cloud Terminal
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  aws-cli/2.37.12
                </span>
              </h2>
              <p className="text-xs text-slate-400">Account: 145023097151 • Architect: Aaditya Uniyal • Region: us-east-1</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCommand(p.cmd);
                  handleRunCli(p.cmd);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white text-[10px] font-mono transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Command Input Bar */}
          <div className="relative flex items-center bg-black/90 border border-slate-800 rounded-xl p-2 font-mono">
            <span className="text-amber-400 font-bold px-2">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunCli()}
              placeholder="Enter aws cli command (e.g. aws sts get-caller-identity)..."
              className="flex-1 bg-transparent text-slate-100 text-xs focus:outline-none"
            />
            <button
              onClick={() => handleRunCli()}
              disabled={loading}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition active:scale-95 disabled:opacity-50 flex items-center gap-1"
            >
              {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
              <span>Run</span>
            </button>
          </div>

          {/* Terminal Output */}
          <div className="bg-black/95 rounded-xl border border-slate-800 p-4 font-mono text-[11px] text-emerald-400 min-h-[220px] max-h-[340px] overflow-y-auto selection:bg-amber-500/40">
            <div className="flex items-center justify-between text-slate-500 text-[10px] pb-2 mb-2 border-b border-slate-900">
              <span>OUTPUT TERMINAL STREAM</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between font-mono text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AWS CLI Terminal Live</span>
          </div>
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
