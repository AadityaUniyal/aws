import React from 'react';
import { 
  Shield, LayoutDashboard, AlertOctagon, Sparkles, GitBranch, 
  ShieldCheck, Terminal, Database, Key, BookOpen, 
  Flame, Award, Layers, LogOut, ChevronLeft, ChevronRight,
  Server, Cpu, Activity, ExternalLink
} from 'lucide-react';
import { UserProfile } from './AuthModal';
import { soundFx } from '../utils/audioSynth';

export type IosTab = 'overview' | 'incidents' | 'ai_arena' | 'orchestrator' | 'governance' | 'devops';

interface SidebarProps {
  activeTab: IosTab;
  onSelectTab: (tab: IosTab) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onOpenAuth: () => void;
  activeIncidentCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenChaos: () => void;
  onOpenCli: () => void;
  onOpenDb: () => void;
  onOpenRunbooks: () => void;
  onOpenPitchDeck: () => void;
  onOpenAwsMatrix: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenAuth,
  activeIncidentCount,
  isCollapsed,
  onToggleCollapse,
  onOpenChaos,
  onOpenCli,
  onOpenDb,
  onOpenRunbooks,
  onOpenPitchDeck,
  onOpenAwsMatrix
}) => {
  const navItems = [
    {
      id: 'overview' as IosTab,
      label: 'Fleet Overview',
      subtitle: 'Telemetry & Topology',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'incidents' as IosTab,
      label: 'Incident War-Room',
      subtitle: 'Active Triage & AI Ops',
      icon: AlertOctagon,
      badge: activeIncidentCount > 0 ? `${activeIncidentCount} active` : null,
      badgeColor: activeIncidentCount > 0 ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' : ''
    },
    {
      id: 'ai_arena' as IosTab,
      label: 'AI Model Arena',
      subtitle: 'Bedrock • Gemini • Groq',
      icon: Sparkles,
      badge: 'Consensus',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      id: 'orchestrator' as IosTab,
      label: 'Orchestrator',
      subtitle: 'Step Functions & IaC',
      icon: GitBranch,
      badge: 'v2.4',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    },
    {
      id: 'governance' as IosTab,
      label: 'Governance & Score',
      subtitle: '6-Pillar Well-Architected',
      icon: ShieldCheck,
      badge: '96%',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    },
    {
      id: 'devops' as IosTab,
      label: 'DevOps & Audit',
      subtitle: 'CLI, SQL, SSM, Runbooks',
      icon: Terminal,
      badge: 'Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    }
  ];

  const handleTabClick = (tab: IosTab) => {
    soundFx.playPop();
    onSelectTab(tab);
  };

  return (
    <aside 
      className={`h-screen sticky top-0 flex flex-col justify-between bg-[#070a11]/90 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Branding Section */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight truncate">CloudSentinel</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Autonomous Cloud Ops
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Control Grid
            </div>
          )}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/40 text-amber-300 font-semibold shadow-md shadow-orange-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                      : 'bg-white/[0.04] group-hover:bg-white/[0.08] text-slate-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div className="truncate">
                        <div className="text-xs truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono shrink-0 ml-1.5 ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Launch Ops Tools */}
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Autonomous Toolkit
            </div>
          )}
          <div className="space-y-1">
            <button
              onClick={onOpenChaos}
              title={isCollapsed ? "Chaos Engineering Lab" : undefined}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-left"
            >
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                <Flame className="w-3.5 h-3.5" />
              </div>
              {!isCollapsed && <span>Chaos Fault Injector</span>}
            </button>

            <button
              onClick={onOpenRunbooks}
              title={isCollapsed ? "RAG Runbook Knowledge Base" : undefined}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all text-left"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              {!isCollapsed && <span>Runbook RAG Vault</span>}
            </button>

            <button
              onClick={onOpenAwsMatrix}
              title={isCollapsed ? "AWS Architecture Matrix" : undefined}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20 transition-all text-left"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
              {!isCollapsed && <span>16+ AWS Stack Matrix</span>}
            </button>

            <button
              onClick={onOpenPitchDeck}
              title={isCollapsed ? "Judges Pitch & Architecture" : undefined}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all text-left"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Award className="w-3.5 h-3.5" />
              </div>
              {!isCollapsed && <span>Executive Presentation</span>}
            </button>
          </div>
        </div>
      </div>

      {/* User Clearance Capsule & Logout */}
      <div className="p-3 border-t border-white/10 bg-white/[0.01]">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div 
              onClick={onOpenAuth}
              className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-amber-500/40 shrink-0" 
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono truncate">
                    {currentUser.role.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span className="font-mono text-[10px]">AWS: {currentUser.accountId}</span>
              <button 
                onClick={onLogout}
                className="text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              onClick={onOpenAuth}
              className="w-8 h-8 rounded-xl object-cover ring-1 ring-amber-500/40 cursor-pointer" 
              title={currentUser.name}
            />
            <button 
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
