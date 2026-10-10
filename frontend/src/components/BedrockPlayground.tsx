import React, { useState } from 'react';
import { Bot, Sparkles, Send, Zap, Cpu, Terminal } from 'lucide-react';
import { Incident } from '../types';

interface BedrockPlaygroundProps {
  onInjectCustomPrompt: (payload: Partial<Incident>) => Promise<void>;
  isLoading: boolean;
}

export const BedrockPlayground: React.FC<BedrockPlaygroundProps> = ({
  onInjectCustomPrompt,
  isLoading
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedService, setSelectedService] = useState('Amazon DynamoDB');

  const presetPrompts = [
    {
      title: 'DynamoDB Partition Key Skew',
      service: 'Amazon DynamoDB',
      prompt: 'Table Orders-Production consumed 100% WCU on tenant_id=GLOBAL_FLASH_SALE during prime day sale with 1,842 throttled requests.'
    },
    {
      title: 'S3 Public ACL Leak',
      service: 'Amazon S3',
      prompt: 'GuardDuty reported BucketBlockPublicAccessDisabled on customer-pii-vault with PutBucketAcl granted to AllUsers.'
    },
    {
      title: 'Lambda Concurrency Deadlock',
      service: 'AWS Lambda',
      prompt: 'PaymentGatewayWebhooks reached 1,000 regional concurrent executions causing cascading cold-start failures.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    await onInjectCustomPrompt({
      title: promptText.slice(0, 70),
      service: selectedService,
      severity: 'HIGH',
      incident_type: selectedService === 'Amazon DynamoDB' ? 'DYNAMODB_THROTTLING' : selectedService === 'Amazon S3' ? 'S3_PUBLIC_EXPOSURE' : 'LAMBDA_CONCURRENCY_EXHAUSTION',
      raw_logs: [
        `[AWS CloudWatch Alarm] ${promptText}`,
        `[Amazon Bedrock Orchestrator] Target AWS Account: 145023097151 (Lead Architect: Aaditya Uniyal)`
      ]
    });

    setPromptText('');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white">Bedrock Multi-Agent Playground</span>
        </div>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          Prompt Engine
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {presetPrompts.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPromptText(preset.prompt);
              setSelectedService(preset.service);
            }}
            className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition"
          >
            + {preset.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Type any AWS outage / anomaly scenario or select a preset above..."
            rows={2}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/60 font-mono transition resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="Amazon DynamoDB">Amazon DynamoDB</option>
            <option value="Amazon S3">Amazon S3</option>
            <option value="AWS Lambda">AWS Lambda</option>
            <option value="Amazon API Gateway">Amazon API Gateway</option>
          </select>

          <button
            type="submit"
            disabled={isLoading || !promptText.trim()}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-md shadow-purple-500/20 active:scale-95 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Reasoning...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Simulate & Diagnose</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
