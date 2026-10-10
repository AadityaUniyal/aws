import React, { useState, useEffect } from 'react';
import { X, Database, Terminal, Play, CheckCircle2, Server, Shield, RefreshCw } from 'lucide-react';

interface DatabaseTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseTerminalModal: React.FC<DatabaseTerminalModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('SELECT id, service, severity, status, created_at FROM incidents ORDER BY created_at DESC LIMIT 10;');
  const [results, setResults] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      handleRunQuery();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/database/status');
      const data = await res.json();
      setDbStatus(data.database);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRunQuery = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      setResults({ success: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const presets = [
    { label: 'View Incidents', sql: 'SELECT id, service, severity, status FROM incidents;' },
    { label: 'Audit Trail', sql: 'SELECT * FROM remediation_audit_trail;' },
    { label: 'Count by Severity', sql: 'SELECT severity, count(*) FROM incidents GROUP BY severity;' },
    { label: 'Postgres Version', sql: 'SELECT version();' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Neon Serverless PostgreSQL Console (AWS us-east-2)
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  TLS 1.3 Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">Host: ep-floral-tree-b40edri4-pooler.c-6.us-east-2.aws.neon.tech</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Presets */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 font-semibold">Quick Queries:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(p.sql)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white text-[10px] font-mono transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* SQL Editor */}
          <div className="relative bg-black/90 rounded-xl border border-slate-800 p-3">
            <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-teal-400" /> SQL Command</span>
              <button
                onClick={handleRunQuery}
                disabled={loading}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition active:scale-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                <span>Execute Query</span>
              </button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={2}
              className="w-full bg-transparent text-teal-300 font-mono text-xs focus:outline-none resize-none selection:bg-teal-500/40"
            />
          </div>

          {/* Query Results Table / Output */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 overflow-x-auto min-h-[160px] max-h-[300px]">
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">Query Output Result</span>
            {loading ? (
              <div className="flex items-center justify-center p-8 text-slate-400 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                <span>Querying Neon Database on AWS...</span>
              </div>
            ) : results && results.success && results.data?.rows ? (
              results.data.rows.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Query returned 0 rows.</p>
              ) : (
                <table className="w-full text-left font-mono text-[11px] text-slate-200">
                  <thead>
                    <tr className="border-b border-slate-800 text-teal-400">
                      {Object.keys(results.data.rows[0]).map((col) => (
                        <th key={col} className="p-2 uppercase text-[10px]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.data.rows.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-slate-900 hover:bg-slate-900/50">
                        {Object.values(row).map((val: any, j: number) => (
                          <td key={j} className="p-2 truncate max-w-[200px]" title={String(val)}>
                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : results ? (
              <pre className="text-rose-400 font-mono text-[11px] whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
            ) : (
              <p className="text-slate-500 text-xs">Run a query to view live database rows.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL 18.6 • Neon on AWS us-east-2</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
