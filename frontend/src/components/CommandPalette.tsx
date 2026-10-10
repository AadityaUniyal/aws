import React, { useState, useEffect } from 'react';
import { Search, Zap, Terminal, Database, FileText, Image, Award, RefreshCw, X, Shield, Cpu, GitCommit, BookOpen, Key } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectChaos: () => void;
  onOpenCli: () => void;
  onOpenDb: () => void;
  onOpenVision: () => void;
  onOpenPitchDeck: () => void;
  onOpenPostmortem: () => void;
  onOpenArena: () => void;
  onOpenWhitepaper: () => void;
  onOpenStepFunctions: () => void;
  onOpenRunbooks: () => void;
  onOpenSsm: () => void;
  onReset: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onInjectChaos,
  onOpenCli,
  onOpenDb,
  onOpenVision,
  onOpenPitchDeck,
  onOpenPostmortem,
  onOpenArena,
  onOpenWhitepaper,
  onOpenStepFunctions,
  onOpenRunbooks,
  onOpenSsm,
  onReset
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Handled in parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'AWS Step Functions Distributed State Machine', icon: GitCommit, color: 'text-orange-400', shortcut: 'S', run: onOpenStepFunctions },
    { label: 'Amazon OpenSearch & Kendra Runbook RAG Search', icon: BookOpen, color: 'text-teal-400', shortcut: 'K', run: onOpenRunbooks },
    { label: 'AWS Systems Manager (SSM) Parameter Store', icon: Key, color: 'text-purple-400', shortcut: 'P', run: onOpenSsm },
    { label: 'Inject Chaos Anomaly', icon: Zap, color: 'text-amber-400', shortcut: 'C', run: onInjectChaos },
    { label: 'Open AWS CLI v2 Terminal', icon: Terminal, color: 'text-amber-400', shortcut: 'T', run: onOpenCli },
    { label: 'Open Neon Serverless PostgreSQL Terminal', icon: Database, color: 'text-teal-400', shortcut: 'D', run: onOpenDb },
    { label: 'Open AI Model Benchmark Arena', icon: Cpu, color: 'text-blue-400', shortcut: 'M', run: onOpenArena },
    { label: 'Multimodal Vision Failure Inspector', icon: Image, color: 'text-purple-400', shortcut: 'V', run: onOpenVision },
    { label: 'Executive Judge Pitch Deck', icon: Award, color: 'text-amber-400', shortcut: 'J', run: onOpenPitchDeck },
    { label: 'Download Technical Whitepaper', icon: FileText, color: 'text-emerald-400', shortcut: 'W', run: onOpenWhitepaper },
    { label: 'View AWS Post-Mortem Report', icon: FileText, color: 'text-blue-400', shortcut: 'R', run: onOpenPostmortem },
    { label: 'Reset Baseline Environment', icon: RefreshCw, color: 'text-slate-400', shortcut: 'B', run: onReset },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/80">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action (e.g. chaos, cli, arena)..."
            className="flex-1 bg-transparent text-sm text-slate-100 focus:outline-none placeholder-slate-500"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded">ESC</kbd>
        </div>

        {/* Action List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No actions found matching "{query}"</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 text-left transition text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-slate-200 font-medium group-hover:text-white">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {item.shortcut}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target Account: 145023097151 • Lead: Aaditya Uniyal</span>
          <span>Press <strong>Enter</strong> to run</span>
        </div>
      </div>
    </div>
  );
};
