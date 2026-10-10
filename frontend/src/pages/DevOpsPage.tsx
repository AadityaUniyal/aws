import React from 'react';
import { 
  Terminal, Database, Key, BookOpen, 
  ArrowUpRight, Server, Shield, Cpu, ExternalLink 
} from 'lucide-react';

interface DevOpsPageProps {
  onOpenCli: () => void;
  onOpenDb: () => void;
  onOpenSsm: () => void;
  onOpenRunbooks: () => void;
}

export const DevOpsPage: React.FC<DevOpsPageProps> = ({
  onOpenCli,
  onOpenDb,
  onOpenSsm,
  onOpenRunbooks
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="ios-glass-card rounded-[2rem] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">DevOps Command Grid & Forensic Ledger</h1>
              <p className="text-xs text-slate-400">
                Direct AWS CLI access, immutable PostgreSQL audit ledger, SSM KMS parameters, and RAG runbooks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tool Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={onOpenCli}
          className="ios-glass-card rounded-[1.75rem] p-6 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-48 group border-amber-500/20 hover:border-amber-500/50"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-bold text-white text-base block">Cloud Ops CLI</span>
            <span className="text-xs text-slate-400 mt-1 block">Live AWS Shell, Boto3 SDK, & diagnostic probes</span>
            <span className="text-[10px] text-amber-400 font-mono mt-2 block">aws lambda invoke • aws s3 ls</span>
          </div>
        </div>

        <div 
          onClick={onOpenDb}
          className="ios-glass-card rounded-[1.75rem] p-6 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-48 group border-teal-500/20 hover:border-teal-500/50"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-bold text-white text-base block">Compliance Ledger</span>
            <span className="text-xs text-slate-400 mt-1 block">Neon PostgreSQL on AWS & DynamoDB storage</span>
            <span className="text-[10px] text-teal-400 font-mono mt-2 block">SELECT * FROM incidents_ledger</span>
          </div>
        </div>

        <div 
          onClick={onOpenSsm}
          className="ios-glass-card rounded-[1.75rem] p-6 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-48 group border-purple-500/20 hover:border-purple-500/50"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 group-hover:scale-110 transition-transform">
              <Key className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-bold text-white text-base block">SSM Parameter Vault</span>
            <span className="text-xs text-slate-400 mt-1 block">AWS Systems Manager Parameter Store & KMS</span>
            <span className="text-[10px] text-purple-400 font-mono mt-2 block">/cloudsentinel/circuit_breakers/*</span>
          </div>
        </div>

        <div 
          onClick={onOpenRunbooks}
          className="ios-glass-card rounded-[1.75rem] p-6 cursor-pointer hover:scale-[1.02] transition-all flex flex-col justify-between h-48 group border-blue-500/20 hover:border-blue-500/50"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="font-bold text-white text-base block">Runbook RAG Vault</span>
            <span className="text-xs text-slate-400 mt-1 block">Vector search standard operating procedures</span>
            <span className="text-[10px] text-blue-400 font-mono mt-2 block">SOP-RDS-FAILOVER-01 • SOP-KMS-04</span>
          </div>
        </div>
      </div>
    </div>
  );
};
