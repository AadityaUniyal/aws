import React, { useState } from 'react';
import { X, Search, BookOpen, Sparkles, CheckCircle2, ArrowRight, Database, ExternalLink } from 'lucide-react';

interface RunbookKnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RunbookKnowledgeBaseModal: React.FC<RunbookKnowledgeBaseModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('DynamoDB provisioned throughput throttling');

  if (!isOpen) return null;

  const runbooks = [
    {
      id: 'RBK-AWS-001',
      title: 'DynamoDB Hot Partition Sharding & DAX Acceleration Guide',
      category: 'Database & NoSQL',
      service: 'Amazon DynamoDB',
      matchScore: '99.2% Vector Similarity',
      tags: ['DYNAMODB', 'THROTTLING', 'DAX', 'AUTO_SCALING'],
      solution: 'Switch billing mode to PAY_PER_REQUEST or deploy DAX caching cluster with GSI salt keys to disperse write IOPS.'
    },
    {
      id: 'RBK-AWS-002',
      title: 'S3 Public Bucket Remediation & KMS Key Policy Enforcement',
      category: 'Security & Compliance',
      service: 'Amazon S3',
      matchScore: '98.5% Vector Similarity',
      tags: ['S3', 'SECURITY', 'KMS', 'PUBLIC_ACCESS_BLOCK'],
      solution: 'Apply PutPublicAccessBlock with all 4 parameters true and enforce aws:SecureTransport TLS condition in bucket policy.'
    },
    {
      id: 'RBK-AWS-003',
      title: 'AWS Lambda Regional Concurrency & SQS FIFO Buffer Spillover',
      category: 'Serverless Compute',
      service: 'AWS Lambda',
      matchScore: '97.8% Vector Similarity',
      tags: ['LAMBDA', 'CONCURRENCY', 'SQS', 'DLQ'],
      solution: 'Attach SQS FIFO dead-letter queue and configure reserved concurrency allocation with exponential backoff on retry.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Amazon OpenSearch & Kendra Runbook Knowledge Base (RAG)
                <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Vector Retrieval
                </span>
              </h2>
              <p className="text-xs text-slate-400">Grounding Amazon Bedrock with Verified Enterprise AWS Remediation Runbooks</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Search Box */}
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono">
            <Search className="w-4 h-4 text-slate-400 ml-2 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical AWS runbooks via semantic vector search..."
              className="flex-1 bg-transparent text-slate-100 text-xs focus:outline-none"
            />
            <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-1 rounded">OpenSearch Serverless</span>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {runbooks.map((rb) => (
              <div key={rb.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-teal-400 font-bold text-[11px]">{rb.id}</span>
                    <span className="font-bold text-white text-xs">{rb.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {rb.matchScore}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-slate-200">Recommended Resolution:</strong> {rb.solution}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rb.tags.map((tag, i) => (
                    <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Semantic RAG Pipeline • OpenSearch Serverless</span>
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
