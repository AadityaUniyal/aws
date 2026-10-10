import React, { useState } from 'react';
import { X, GitCommit, ArrowDown, ArrowRight, CheckCircle2, Play, RefreshCw, Layers, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface StepFunctionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StepFunctionsModal: React.FC<StepFunctionsModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(4);

  if (!isOpen) return null;

  const states = [
    {
      id: 1,
      name: 'TriageAndFilter (Lambda)',
      service: 'AWS Lambda',
      status: 'SUCCEEDED',
      duration: '42ms',
      desc: 'Ingests EventBridge storm, dedupes alarms, and creates incident record.'
    },
    {
      id: 2,
      name: 'Parallel AI & Security (Bedrock + Groq)',
      service: 'Amazon Bedrock & Groq LPU',
      status: 'SUCCEEDED',
      duration: '1,140ms',
      desc: 'Parallel execution: Bedrock Claude 3.5 RCA + Groq 48ms IAM Guardrail check.'
    },
    {
      id: 3,
      name: 'SynthesizeIaCHotPatch (Bedrock)',
      service: 'Amazon Bedrock',
      status: 'SUCCEEDED',
      duration: '820ms',
      desc: 'Generates declarative Terraform / CloudFormation hot patch with rollback guarantees.'
    },
    {
      id: 4,
      name: 'AutonomousRemediationExecutor',
      service: 'AWS Lambda & AWS CloudFormation',
      status: isRunning ? 'RUNNING' : 'SUCCEEDED',
      duration: '310ms',
      desc: 'Applies zero-downtime hot-patch directly to active AWS infrastructure.'
    },
    {
      id: 5,
      name: 'VerifyPostRemediationCanary',
      service: 'CloudWatch Synthetics',
      status: isRunning ? 'WAITING' : 'SUCCEEDED',
      duration: '95ms',
      desc: 'Runs synthetic health checks to verify error rate has returned to 0% baseline.'
    },
    {
      id: 6,
      name: 'PublishResolutionSNS',
      service: 'Amazon SNS',
      status: isRunning ? 'WAITING' : 'SUCCEEDED',
      duration: '38ms',
      desc: 'Dispatches resolution broadcast to PagerDuty, Slack, and SRE commanders.'
    }
  ];

  const handleSimulateExecution = () => {
    setIsRunning(true);
    setActiveStep(1);
    let cur = 1;
    const interval = setInterval(() => {
      cur++;
      setActiveStep(cur);
      if (cur >= 6) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <GitCommit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Amazon Step Functions Distributed State Machine
                <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  CloudSentinel-IncidentOrchestrator
                </span>
              </h2>
              <p className="text-xs text-slate-400">Visual Distributed Orchestration with Automated Retries & Rollback Branches</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Controls Bar */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">State Machine ARN:</span>
              <span className="text-[10px] font-mono text-slate-400">
                arn:aws:states:us-east-1:145023097151:stateMachine:CloudSentinel-IncidentOrchestrator
              </span>
            </div>

            <button
              onClick={handleSimulateExecution}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Running Pipeline...' : 'Test Step Functions Execution'}</span>
            </button>
          </div>

          {/* State Machine Step Flow */}
          <div className="space-y-3">
            {states.map((st) => {
              const isCurrent = activeStep === st.id;
              const isPast = activeStep > st.id || (!isRunning && activeStep === 4);

              return (
                <div
                  key={st.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-orange-500/10 border-orange-500 shadow-md shadow-orange-500/10'
                      : isPast
                      ? 'bg-slate-950/80 border-slate-800'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isCurrent
                          ? 'bg-orange-500 text-white animate-pulse'
                          : isPast
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {st.id}
                      </span>
                      <div>
                        <span className="font-bold text-white text-xs">{st.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{st.service}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 font-mono text-[11px]">
                      <span className="text-slate-500">{st.duration}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                          : isPast
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {isCurrent ? 'RUNNING' : isPast ? 'SUCCEEDED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 pl-9">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">AWS Step Functions • Region: us-east-1</span>
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
