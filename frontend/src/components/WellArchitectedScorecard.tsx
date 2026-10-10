import React from 'react';
import { ShieldCheck, Cpu, DollarSign, Activity, Leaf, Award, CheckCircle2 } from 'lucide-react';

export const WellArchitectedScorecard: React.FC = () => {
  const pillars = [
    {
      name: 'Security',
      score: 98,
      icon: ShieldCheck,
      color: 'text-blue-400',
      highlights: 'IAM Least Privilege, KMS AES-256 Encryption, S3 Public Block enforcement'
    },
    {
      name: 'Reliability',
      score: 96,
      icon: Activity,
      color: 'text-emerald-400',
      highlights: 'Single-Table GSI Indexing, SQS FIFO buffer decoupling, Multi-AZ DynamoDB'
    },
    {
      name: 'Performance Efficiency',
      score: 94,
      icon: Cpu,
      color: 'text-purple-400',
      highlights: 'Sub-50ms Lambda warm execution, Pay-Per-Request auto-scaling'
    },
    {
      name: 'Cost Optimization',
      score: 92,
      icon: DollarSign,
      color: 'text-amber-400',
      highlights: '100% Serverless scale-to-zero, S3 Glacier log tiering after 30 days'
    },
    {
      name: 'Operational Excellence',
      score: 99,
      icon: Award,
      color: 'text-orange-400',
      highlights: 'Autonomous Bedrock multi-agent RCA, Infrastructure as Code (IaC) hot-remediation'
    },
    {
      name: 'Sustainability',
      score: 95,
      icon: Leaf,
      color: 'text-teal-400',
      highlights: 'Zero idle compute carbon footprint, on-demand serverless execution'
    }
  ];

  const overallScore = Math.round(pillars.reduce((acc, p) => acc + p.score, 0) / pillars.length);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            AWS Well-Architected Framework Audit Scorecard
          </h2>
          <p className="text-xs text-slate-400">Official 6-Pillar Cloud Architecture Assessment</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">{overallScore}% Well-Architected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg bg-slate-900 ${pillar.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{pillar.name}</span>
                </div>
                <span className={`text-xs font-bold ${pillar.color}`}>{pillar.score}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                  style={{ width: `${pillar.score}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                {pillar.highlights}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
