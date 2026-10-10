import React, { useEffect, useState } from 'react';
import { SystemMetrics } from '../types';
import { Activity, Clock, ShieldAlert, Zap, TrendingUp, DollarSign } from 'lucide-react';

interface LiveTelemetrySparklinesProps {
  metrics: SystemMetrics | null;
}

export const LiveTelemetrySparklines: React.FC<LiveTelemetrySparklinesProps> = ({ metrics }) => {
  const [history, setHistory] = useState<{ req: number[]; lat: number[]; err: number[] }>({
    req: [18000, 18400, 18200, 18900, 18600, 19200, 19800, 19500],
    lat: [34, 38, 36, 42, 39, 41, 44, 38],
    err: [0.02, 0.01, 0.03, 0.02, 0.01, 0.04, 0.02, 0.02]
  });

  useEffect(() => {
    if (!metrics) return;
    setHistory((prev) => ({
      req: [...prev.req.slice(-15), metrics.total_requests],
      lat: [...prev.lat.slice(-15), metrics.avg_latency_ms],
      err: [...prev.err.slice(-15), metrics.error_rate_pct]
    }));
  }, [metrics]);

  const renderSparkline = (data: number[], color: string, maxVal: number) => {
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1 || 1)) * 140;
      const y = 35 - ((val / (maxVal || 1)) * 30);
      return `${x},${Math.max(4, Math.min(35, y))}`;
    }).join(' ');

    return (
      <svg className="w-full h-9 overflow-visible" viewBox="0 0 140 40">
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Ingestion Throughput */}
      <div className="ios-glass-card rounded-[1.75rem] p-4.5 transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> Ingestion Throughput
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" /> Live
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white tracking-tight">
            {metrics ? metrics.total_requests.toLocaleString() : '---'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">req/min</span>
        </div>
        <div className="mt-2.5">
          {renderSparkline(history.req, '#38bdf8', 25000)}
        </div>
      </div>

      {/* 2. p99 Latency */}
      <div className="ios-glass-card rounded-[1.75rem] p-4.5 transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> p99 Latency
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            metrics && metrics.avg_latency_ms > 100 
              ? 'text-rose-300 bg-rose-500/10 border-rose-500/30 animate-pulse' 
              : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
          }`}>
            {metrics && metrics.avg_latency_ms > 100 ? 'SPIKE' : 'Nominal'}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl font-bold tracking-tight ${metrics && metrics.avg_latency_ms > 100 ? 'text-amber-400' : 'text-white'}`}>
            {metrics ? `${metrics.avg_latency_ms} ms` : '---'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">SLA &lt;50ms</span>
        </div>
        <div className="mt-2.5">
          {renderSparkline(history.lat, metrics && metrics.avg_latency_ms > 100 ? '#f59e0b' : '#10b981', 400)}
        </div>
      </div>

      {/* 3. 5xx Error Rate */}
      <div className="ios-glass-card rounded-[1.75rem] p-4.5 transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> 5xx Error Rate
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
            metrics && metrics.error_rate_pct > 1 
              ? 'text-rose-300 bg-rose-500/20 border-rose-500/30 font-bold animate-pulse' 
              : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
          }`}>
            {metrics && metrics.error_rate_pct > 1 ? 'ANOMALY' : '0.00%'}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl font-bold tracking-tight ${metrics && metrics.error_rate_pct > 1 ? 'text-rose-400' : 'text-white'}`}>
            {metrics ? `${metrics.error_rate_pct}%` : '---'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">HTTP 502/504</span>
        </div>
        <div className="mt-2.5">
          {renderSparkline(history.err, metrics && metrics.error_rate_pct > 1 ? '#f43f5e' : '#10b981', 20)}
        </div>
      </div>

      {/* 4. Cost Prevented & AI Tokens */}
      <div className="ios-glass-card rounded-[1.75rem] p-4.5 transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Downtime Prevented
          </span>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
            Autonomous
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">
            {metrics ? `$${metrics.estimated_cost_saved_usd.toFixed(2)}` : '---'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {metrics ? `${(metrics.bedrock_tokens_used / 1000).toFixed(1)}k tokens` : ''}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-white/10">
          <span>MTTR: <strong className="text-white font-mono">{metrics?.mttr_minutes || 0.8}m</strong></span>
          <span>SLA: <strong className="text-emerald-400 font-mono">{metrics?.uptime_pct || 99.99}%</strong></span>
        </div>
      </div>
    </div>
  );
};
