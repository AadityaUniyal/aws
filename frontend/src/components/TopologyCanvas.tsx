import React, { useState, useEffect } from 'react';
import { TopologyNode } from '../types';
import { Database, HardDrive, Network, Sparkles, Layers, Bell, CheckCircle2, AlertTriangle, XCircle, Shield, Info, Activity } from 'lucide-react';

interface TopologyCanvasProps {
  nodes: TopologyNode[];
  onSelectNode?: (node: TopologyNode) => void;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({ nodes, onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [packetOffset, setPacketOffset] = useState(0);

  // Animated packet motion
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'api_gateway': return Network;
      case 'lambda': return Layers;
      case 'dynamodb': return Database;
      case 's3': return HardDrive;
      case 'bedrock': return Sparkles;
      case 'sns': return Bell;
      case 'sqs': return Layers;
      default: return Shield;
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'critical': return { bg: 'bg-rose-500/20', border: 'border-rose-500', stroke: '#f43f5e', text: 'text-rose-400', glow: 'shadow-rose-500/50' };
      case 'degraded': return { bg: 'bg-amber-500/20', border: 'border-amber-500', stroke: '#f59e0b', text: 'text-amber-400', glow: 'shadow-amber-500/50' };
      default: return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', stroke: '#10b981', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' };
    }
  };

  // Build coordinate mapping
  const nodeMap = new Map<string, TopologyNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400" />
              Live AWS Microservice Mesh & Autonomous Flow
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              AWS Account: 145023097151
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time particle packet tracing across serverless microservices</p>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-slate-300">Healthy Flow</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /><span className="text-slate-300">Throttled</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /><span className="text-rose-400 font-semibold">Incident Outage</span></div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[280px] bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden select-none">
        {/* Grid Background Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />

        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          <defs>
            <linearGradient id="healthyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="criticalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Render Connections */}
          {nodes.map((sourceNode) => {
            const sx = sourceNode.x || 100;
            const sy = sourceNode.y || 100;

            return sourceNode.connections.map((targetId) => {
              const targetNode = nodeMap.get(targetId);
              if (!targetNode) return null;

              const tx = targetNode.x || 300;
              const ty = targetNode.y || 100;
              const isBroken = sourceNode.status === 'critical' || targetNode.status === 'critical';
              const strokeColor = isBroken ? '#f43f5e' : sourceNode.status === 'degraded' ? '#f59e0b' : '#10b981';

              // Cubic bezier path
              const dx = tx - sx;
              const pathD = `M ${sx + 60} ${sy + 25} C ${sx + 60 + dx / 2} ${sy + 25}, ${tx - dx / 2} ${ty + 25}, ${tx} ${ty + 25}`;

              return (
                <g key={`${sourceNode.id}-${targetId}`}>
                  {/* Base link line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isBroken ? 2.5 : 1.5}
                    strokeDasharray={isBroken ? '4,4' : 'none'}
                    opacity={isBroken ? 0.9 : 0.4}
                  />
                  {/* Animated Particle */}
                  {!isBroken && (
                    <circle
                      r="3.5"
                      fill="#38bdf8"
                      className="filter drop-shadow-[0_0_6px_#38bdf8]"
                    >
                      <animateMotion
                        path={pathD}
                        dur="2.5s"
                        repeatCount="indefinite"
                        keyPoints="0;1"
                        keyTimes="0;1"
                      />
                    </circle>
                  )}
                </g>
              );
            });
          })}
        </svg>

        {/* Render Interactive Nodes */}
        {nodes.map((node) => {
          const Icon = getNodeIcon(node.type);
          const color = getNodeColor(node.status);
          const isSelected = selectedNode?.id === node.id;
          const leftPct = `${((node.x || 50) / 1000) * 100}%`;
          const topPct = `${((node.y || 50) / 400) * 100}%`;

          return (
            <div
              key={node.id}
              onClick={() => {
                setSelectedNode(node);
                if (onSelectNode) onSelectNode(node);
              }}
              style={{ left: leftPct, top: topPct }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group z-10`}
            >
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900/95 border ${color.border} shadow-lg ${color.glow} hover:scale-105 transition`}
              >
                <div className={`p-1.5 rounded-lg ${color.bg} ${color.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-100 truncate max-w-[130px]">{node.name}</span>
                    {node.status === 'critical' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">{node.type}</span>
                </div>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block z-30 bg-slate-950 border border-slate-700 rounded-lg p-2.5 shadow-2xl min-w-[180px] pointer-events-none">
                <p className="text-[10px] font-mono text-slate-400 break-all">{node.arn || node.id}</p>
                <div className="mt-1.5 pt-1.5 border-t border-slate-800 space-y-0.5">
                  {Object.entries(node.metrics).slice(0, 3).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">{k}:</span>
                      <span className="font-semibold text-slate-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">{selectedNode.name}</span>
              <span className="text-slate-400 ml-2 font-mono text-[11px]">{selectedNode.arn}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getNodeColor(selectedNode.status).text} ${getNodeColor(selectedNode.status).bg}`}>
              {selectedNode.status}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
