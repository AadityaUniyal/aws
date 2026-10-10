import React from 'react';
import { SystemMetrics } from '../types';
import { Activity, ShieldAlert, Clock, DollarSign, Bot, CheckCircle2 } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: SystemMetrics | null;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/40" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Active Incidents',
      value: metrics.active_incidents,
      icon: ShieldAlert,
      color: metrics.active_incidents > 0 ? 'text-rose-400' : 'text-emerald-400',
      bg: metrics.active_incidents > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30',
      subtext: `${metrics.resolved_incidents} auto-remediated`
    },
    {
      label: 'Avg MTT Resolution',
      value: `${metrics.mttr_minutes} min`,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      subtext: 'vs 45m industry avg'
    },
    {
      label: 'Bedrock AI Tokens',
      value: metrics.bedrock_tokens_used.toLocaleString(),
      icon: Bot,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
      subtext: 'Claude 3.5 Sonnet'
    },
    {
      label: 'Cost Saved',
      value: `$${metrics.estimated_cost_saved_usd.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      subtext: 'Downtime prevented'
    },
    {
      label: 'Error Rate',
      value: `${metrics.error_rate_pct}%`,
      icon: Activity,
      color: metrics.error_rate_pct > 1 ? 'text-rose-400' : 'text-slate-300',
      bg: metrics.error_rate_pct > 1 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/40 border-slate-700/40',
      subtext: `${metrics.avg_latency_ms}ms p99 latency`
    },
    {
      label: 'Cloud Availability',
      value: `${metrics.uptime_pct}%`,
      icon: CheckCircle2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
      subtext: 'SLA Compliant'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border backdrop-blur transition hover:border-slate-600 ${item.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">{item.label}</span>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className={`text-xl font-bold tracking-tight ${item.color}`}>
              {item.value}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              {item.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
