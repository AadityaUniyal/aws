import React from 'react';
import { TopologyNode } from '../types';
import { Database, HardDrive, Network, Sparkles, Layers, Bell, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface TopologyViewProps {
  nodes: TopologyNode[];
}

export const TopologyView: React.FC<TopologyViewProps> = ({ nodes }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'api_gateway': return Network;
      case 'lambda': return Layers;
      case 'dynamodb': return Database;
      case 's3': return HardDrive;
      case 'bedrock': return Sparkles;
      case 'sns': return Bell;
      default: return Layers;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Healthy
          </span>
        );
      case 'degraded':
        return (
          <span className="flex items-center text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" /> Degraded
          </span>
        );
      case 'critical':
        return (
          <span className="flex items-center text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full animate-pulse">
            <XCircle className="w-3 h-3 mr-1" /> Outage
          </span>
        );
      default:
        return null;
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'critical': return 'border-rose-500/80 shadow-rose-500/20 ring-2 ring-rose-500/30';
      case 'degraded': return 'border-amber-500/80 shadow-amber-500/20 ring-2 ring-amber-500/30';
      default: return 'border-slate-700/60 hover:border-slate-500';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-amber-400" />
            Live Cloud Architecture & Microservice Topology
          </h2>
          <p className="text-xs text-slate-400">Real-time health telemetry across serverless AWS resources</p>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Degraded</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Impacted</div>
        </div>
      </div>

      {/* Grid of Topology Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {nodes.map((node) => {
          const Icon = getIcon(node.type);
          return (
            <div
              key={node.id}
              className={`p-4 rounded-xl bg-[#131c31]/80 border ${getBorderColor(node.status)} shadow-lg transition duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-lg ${node.type === 'bedrock' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-amber-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{node.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500">{node.type.toUpperCase()}</span>
                  </div>
                </div>
                {getStatusBadge(node.status)}
              </div>

              {/* Metrics preview */}
              <div className="bg-slate-950/60 rounded-lg p-2 mt-2 border border-slate-800/80">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {Object.entries(node.metrics).slice(0, 2).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-slate-500 font-mono uppercase text-[9px]">{k.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-300 truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
