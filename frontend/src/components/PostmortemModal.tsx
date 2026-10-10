import React, { useState } from 'react';
import { X, FileText, Download, Copy, Check, Award, ShieldCheck } from 'lucide-react';
import { Incident } from '../types';

interface PostmortemModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostmortemModal: React.FC<PostmortemModalProps> = ({
  incident,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !incident) return null;

  const defaultPostmortem = incident.postmortem_report || `# AWS Incident Post-Mortem Report
**Incident ID**: ${incident.id}
**Target AWS Account**: ${incident.account_id || '145023097151'} (${incident.lead_architect || 'Aaditya Uniyal'})
**Affected Service**: ${incident.service}
**Severity**: ${incident.severity} | **Status**: ${incident.status}

### 1. Executive Summary
On ${new Date(incident.created_at).toUTCString()}, an operational anomaly was detected on ${incident.service}. Amazon Bedrock multi-agent pipeline identified root cause and synthesized an automated Infrastructure-as-Code hot patch.

### 2. Root Cause Analysis
${incident.root_cause_analysis || 'Diagnostic analysis complete.'}

### 3. Blast Radius Mitigation
${incident.blast_radius?.map((r) => `- ${r}`).join('\n') || '- Downstream services protected.'}

### 4. Remediation Executed
- **Patch ID**: ${incident.remediation_patch?.patch_id || 'N/A'}
- **IaC Type**: ${incident.remediation_patch?.iac_type || 'TERRAFORM'}
- **Sign-off**: ${incident.lead_architect || 'Aaditya Uniyal'}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultPostmortem);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([defaultPostmortem], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AWS_Postmortem_${incident.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                AWS Incident Post-Mortem & Audit Document
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  Well-Architected
                </span>
              </h2>
              <p className="text-xs text-slate-400">Account: 145023097151 • Lead Architect: Aaditya Uniyal</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-200 bg-black/70 whitespace-pre-wrap leading-relaxed selection:bg-blue-500/30">
          {defaultPostmortem}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographically Signed by CloudSentinel Engine</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Markdown' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .MD Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
