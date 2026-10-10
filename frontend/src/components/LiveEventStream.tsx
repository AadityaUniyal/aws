import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Sparkles, Filter, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Incident } from '../types';

interface LiveEventStreamProps {
  incidents: Incident[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
  message: string;
}

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({ incidents }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'SUCCESS'>('ALL');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate initial live log stream based on active incidents
    const newLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toLocaleTimeString(),
        source: 'aws.eventbridge',
        level: 'INFO',
        message: 'EventBridge event bus [CloudSentinel-Bus] operational in region us-east-1.'
      },
      {
        id: '2',
        timestamp: new Date().toLocaleTimeString(),
        source: 'neon.postgres',
        level: 'SUCCESS',
        message: 'Neon Serverless PostgreSQL connection pool healthy (AWS us-east-2).'
      },
      {
        id: '3',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ai.consensus',
        level: 'INFO',
        message: 'Consensus engine ready: Gemini 2.5 Flash + Groq LPU (48ms) + Bedrock Claude 3.5.'
      }
    ];

    incidents.slice(0, 5).forEach((inc, idx) => {
      newLogs.push({
        id: `inc-${idx}-1`,
        timestamp: new Date(inc.created_at).toLocaleTimeString(),
        source: `aws.${inc.service.toLowerCase().replace(' ', '')}`,
        level: inc.status === 'RESOLVED' ? 'SUCCESS' : 'CRITICAL',
        message: `[${inc.id}] ${inc.title} - Status: ${inc.status}`
      });
      if (inc.root_cause_analysis) {
        newLogs.push({
          id: `inc-${idx}-2`,
          timestamp: new Date().toLocaleTimeString(),
          source: 'bedrock.agent',
          level: 'WARN',
          message: `RCA Isolated: ${inc.root_cause_analysis.slice(0, 110)}...`
        });
      }
    });

    setLogs(newLogs);
  }, [incidents]);

  const filteredLogs = logs.filter((l) => {
    if (filter === 'ALL') return true;
    return l.level === filter;
  });

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'WARN':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'SUCCESS':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const handleCopyLogs = () => {
    const raw = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] (${l.source}) ${l.message}`).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              Live EventBridge & CloudWatch Telemetry Stream
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Stream
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1 text-[10px] font-mono bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['ALL', 'CRITICAL', 'SUCCESS'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded transition ${
                  filter === f ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyLogs}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-[10px] flex items-center gap-1 font-mono"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Log Feed */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="p-3 bg-black/90 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto selection:bg-amber-500/40"
        >
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2.5 hover:bg-slate-900/50 p-1 rounded transition">
              <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${getLevelBadge(log.level)}`}>
                {log.level}
              </span>
              <span className="text-slate-400 shrink-0">[{log.source}]</span>
              <span className="text-slate-200 break-all">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
