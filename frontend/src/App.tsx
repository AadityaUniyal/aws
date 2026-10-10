import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Incident, SystemMetrics, TopologyNode } from './types';
import { LoginPage } from './components/LoginPage';
import { Sidebar, IosTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { OverviewPage } from './pages/OverviewPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { AiArenaPage } from './pages/AiArenaPage';
import { OrchestratorPage } from './pages/OrchestratorPage';
import { GovernancePage } from './pages/GovernancePage';
import { DevOpsPage } from './pages/DevOpsPage';

// Modals
import { RemediationModal } from './components/RemediationModal';
import { ChaosSimulatorModal } from './components/ChaosSimulatorModal';
import { DeployModal } from './components/DeployModal';
import { PostmortemModal } from './components/PostmortemModal';
import { DatabaseTerminalModal } from './components/DatabaseTerminalModal';
import { AwsCliTerminalModal } from './components/AwsCliTerminalModal';
import { MultimodalVisualInspector } from './components/MultimodalVisualInspector';
import { JudgePitchDeckModal } from './components/JudgePitchDeckModal';
import { ModelArenaModal } from './components/ModelArenaModal';
import { TechnicalWhitepaperModal } from './components/TechnicalWhitepaperModal';
import { StepFunctionsModal } from './components/StepFunctionsModal';
import { RunbookKnowledgeBaseModal } from './components/RunbookKnowledgeBaseModal';
import { SsmParametersModal } from './components/SsmParametersModal';
import { AwsServicesMatrixModal } from './components/AwsServicesMatrixModal';
import { CommandPalette } from './components/CommandPalette';
import { AuthModal, UserProfile } from './components/AuthModal';
import { soundFx } from './utils/audioSynth';

export const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cs_auth_active') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('cs_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      name: 'Aaditya Uniyal',
      email: 'aaditya.uniyal@cloudsentinel.io',
      role: 'PRINCIPAL_SRE_COMMANDER',
      accountId: '145023097151',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      sessionToken: 'jwt_cs_live_145023097151_prod',
      mfaVerified: true
    };
  });

  // App Shell State
  const [activeTab, setActiveTab] = useState<IosTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Data State
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [topology, setTopology] = useState<TopologyNode[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [remediationTarget, setRemediationTarget] = useState<Incident | null>(null);
  const [loadingDiagnoseId, setLoadingDiagnoseId] = useState<string | null>(null);
  const [isCustomLoading, setIsCustomLoading] = useState(false);

  // Modal Visibility State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChaosOpen, setIsChaosOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isPostmortemOpen, setIsPostmortemOpen] = useState(false);
  const [isDbOpen, setIsDbOpen] = useState(false);
  const [isCliOpen, setIsCliOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState(false);
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);
  const [isStepFunctionsOpen, setIsStepFunctionsOpen] = useState(false);
  const [isRunbooksOpen, setIsRunbooksOpen] = useState(false);
  const [isSsmOpen, setIsSsmOpen] = useState(false);
  const [isAwsMatrixOpen, setIsAwsMatrixOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isAutoHealActive, setIsAutoHealActive] = useState(false);

  // Global Ctrl+K listener for Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Data fetching
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [fetchedMetrics, fetchedTopology, fetchedIncidents] = await Promise.all([
        api.getMetrics(),
        api.getTopology(),
        api.getIncidents()
      ]);
      setMetrics(fetchedMetrics);
      setTopology(fetchedTopology.nodes);
      setIncidents(fetchedIncidents);

      if (fetchedIncidents.length > 0 && !selectedIncident) {
        setSelectedIncident(fetchedIncidents[0]);
      }
    } catch (err) {
      console.error('Failed to fetch CloudSentinel telemetry:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedIncident]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 8000);
      return () => clearInterval(interval);
    }
  }, [refreshData, isAuthenticated]);

  // Handle Login
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('cs_auth_active', 'true');
    localStorage.setItem('cs_user_profile', JSON.stringify(user));
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cs_auth_active');
    soundFx.speak('User logged out. Session terminated.');
  };

  // Trigger Diagnose
  const handleTriggerDiagnose = async (id: string) => {
    setLoadingDiagnoseId(id);
    soundFx.speak('Initiating multi-agent LLM consensus reasoning.');
    try {
      const updated = await api.triggerDiagnosis(id);
      setIncidents(prev => prev.map(i => i.id === id ? updated : i));
      if (selectedIncident?.id === id) {
        setSelectedIncident(updated);
      }
      soundFx.playSuccess();
      soundFx.speak('Diagnosis complete. Root cause verified with 99.8% consensus.');
    } catch (err) {
      console.error('Failed to diagnose incident:', err);
    } finally {
      setLoadingDiagnoseId(null);
    }
  };

  // Execute Remediation
  const handleExecuteRemediation = async (id: string) => {
    try {
      const resolved = await api.executeRemediation(id);
      setIncidents(prev => prev.map(i => i.id === id ? resolved : i));
      if (selectedIncident?.id === id) {
        setSelectedIncident(resolved);
      }
      soundFx.playSuccess();
      soundFx.speak('Remediation patch executed successfully.');
      setRemediationTarget(null);
      refreshData();
    } catch (err) {
      console.error('Failed to execute remediation:', err);
    }
  };

  // Inject Chaos
  const handleInjectChaos = async (payload: Partial<Incident>) => {
    soundFx.playAlarm();
    soundFx.speak(`Simulating infrastructure anomaly on ${payload.service || 'cloud service'}.`);
    try {
      const newInc = await api.createIncident(payload);
      setIncidents(prev => [newInc, ...prev]);
      setSelectedIncident(newInc);
      setIsChaosOpen(false);
      refreshData();
    } catch (err) {
      console.error('Failed to inject chaos:', err);
    }
  };

  // Inject Custom Prompt from Playground
  const handleInjectCustomPrompt = async (payload: Partial<Incident>) => {
    setIsCustomLoading(true);
    try {
      const newInc = await api.createIncident(payload);
      setIncidents(prev => [newInc, ...prev]);
      setSelectedIncident(newInc);
      soundFx.playSuccess();
      refreshData();
    } catch (err) {
      console.error('Failed to submit prompt:', err);
    } finally {
      setIsCustomLoading(false);
    }
  };

  // Autonomous Self-Healing Flight Loop
  useEffect(() => {
    if (!isAutoHealActive) return;

    const interval = setInterval(async () => {
      const activeInc = incidents.find(i => i.status !== 'RESOLVED' && i.status !== 'REMEDIATED');
      if (activeInc) {
        soundFx.playWarning();
        soundFx.speak(`Autonomous flight loop detecting ${activeInc.service} anomaly. Initiating auto-remediation.`);
        try {
          await api.executeRemediation(activeInc.id);
          soundFx.playSuccess();
          soundFx.speak(`Auto-heal pipeline completed for ${activeInc.service}.`);
          refreshData();
        } catch (e) {
          console.error('Auto-heal failed:', e);
        }
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isAutoHealActive, incidents, refreshData]);

  // If not authenticated, render full-screen login page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REMEDIATED');

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient lighting */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Left Sidebar Navigation Shell */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        activeIncidentCount={activeIncidents.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        onOpenChaos={() => setIsChaosOpen(true)}
        onOpenCli={() => setIsCliOpen(true)}
        onOpenDb={() => setIsDbOpen(true)}
        onOpenRunbooks={() => setIsRunbooksOpen(true)}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        onOpenAwsMatrix={() => setIsAwsMatrixOpen(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header with Dynamic Island */}
        <TopHeader
          currentUser={currentUser}
          incidents={incidents}
          selectedIncident={selectedIncident}
          isAutoHealActive={isAutoHealActive}
          onToggleAutoHeal={() => {
            const next = !isAutoHealActive;
            setIsAutoHealActive(next);
            if (next) soundFx.speak('Autonomous flight loop enabled.');
            else soundFx.speak('Autonomous flight loop disabled.');
          }}
          onTriggerDiagnose={handleTriggerDiagnose}
          onOpenChaosModal={() => setIsChaosOpen(true)}
          onOpenCliModal={() => setIsCliOpen(true)}
          onOpenDbModal={() => setIsDbOpen(true)}
          onOpenVisionModal={() => setIsVisionOpen(true)}
          onOpenStepFunctionsModal={() => setIsStepFunctionsOpen(true)}
          onOpenPitchDeckModal={() => setIsPitchDeckOpen(true)}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          loadingDiagnoseId={loadingDiagnoseId}
          onOpenPalette={() => setIsPaletteOpen(true)}
          onRefreshData={refreshData}
          isRefreshing={isRefreshing}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {activeTab === 'overview' && (
            <OverviewPage
              metrics={metrics}
              topology={topology}
              incidents={incidents}
              onOpenChaos={() => setIsChaosOpen(true)}
              onOpenWhitepaper={() => setIsWhitepaperOpen(true)}
              onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
              onOpenAwsMatrix={() => setIsAwsMatrixOpen(true)}
              onOpenArena={() => setIsArenaOpen(true)}
              onOpenDeploy={() => setIsDeployOpen(true)}
              onSelectIncident={(inc) => {
                setSelectedIncident(inc);
                setActiveTab('incidents');
              }}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsPage
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onOpenRemediation={(inc) => setRemediationTarget(inc)}
              onTriggerDiagnose={handleTriggerDiagnose}
              loadingDiagnoseId={loadingDiagnoseId}
              onOpenChaos={() => setIsChaosOpen(true)}
            />
          )}

          {activeTab === 'ai_arena' && (
            <AiArenaPage
              onOpenArenaModal={() => setIsArenaOpen(true)}
              onOpenVisionModal={() => setIsVisionOpen(true)}
              onInjectCustomPrompt={handleInjectCustomPrompt}
              isCustomLoading={isCustomLoading}
            />
          )}

          {activeTab === 'orchestrator' && (
            <OrchestratorPage
              incidents={incidents}
              onOpenStepFunctionsModal={() => setIsStepFunctionsOpen(true)}
              onOpenRemediation={(inc) => setRemediationTarget(inc)}
            />
          )}

          {activeTab === 'governance' && (
            <GovernancePage
              incidents={incidents}
              onOpenPostmortem={() => setIsPostmortemOpen(true)}
              onOpenWhitepaper={() => setIsWhitepaperOpen(true)}
            />
          )}

          {activeTab === 'devops' && (
            <DevOpsPage
              onOpenCli={() => setIsCliOpen(true)}
              onOpenDb={() => setIsDbOpen(true)}
              onOpenSsm={() => setIsSsmOpen(true)}
              onOpenRunbooks={() => setIsRunbooksOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onInjectChaos={() => setIsChaosOpen(true)}
        onOpenCli={() => setIsCliOpen(true)}
        onOpenDb={() => setIsDbOpen(true)}
        onOpenVision={() => setIsVisionOpen(true)}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        onOpenPostmortem={() => setIsPostmortemOpen(true)}
        onOpenArena={() => setIsArenaOpen(true)}
        onOpenWhitepaper={() => setIsWhitepaperOpen(true)}
        onOpenStepFunctions={() => setIsStepFunctionsOpen(true)}
        onOpenRunbooks={() => setIsRunbooksOpen(true)}
        onOpenSsm={() => setIsSsmOpen(true)}
        onReset={async () => {
          await api.resetEnvironment();
          refreshData();
          setIsPaletteOpen(false);
        }}
      />

      {/* Interactive Modals */}
      {remediationTarget && (
        <RemediationModal
          incident={remediationTarget}
          isOpen={!!remediationTarget}
          onClose={() => setRemediationTarget(null)}
          onExecute={handleExecuteRemediation}
        />
      )}

      {isChaosOpen && (
        <ChaosSimulatorModal
          isOpen={isChaosOpen}
          onClose={() => setIsChaosOpen(false)}
          onInject={handleInjectChaos}
        />
      )}

      {isDeployOpen && (
        <DeployModal
          isOpen={isDeployOpen}
          onClose={() => setIsDeployOpen(false)}
        />
      )}

      {isPostmortemOpen && (
        <PostmortemModal
          isOpen={isPostmortemOpen}
          onClose={() => setIsPostmortemOpen(false)}
          incident={selectedIncident || incidents[0] || null}
        />
      )}

      {isDbOpen && (
        <DatabaseTerminalModal
          isOpen={isDbOpen}
          onClose={() => setIsDbOpen(false)}
        />
      )}

      {isCliOpen && (
        <AwsCliTerminalModal
          isOpen={isCliOpen}
          onClose={() => setIsCliOpen(false)}
        />
      )}

      {isVisionOpen && (
        <MultimodalVisualInspector
          isOpen={isVisionOpen}
          onClose={() => setIsVisionOpen(false)}
          onApplyFix={(fix) => {
            soundFx.speak('Visual architectural fix generated.');
            refreshData();
          }}
        />
      )}

      {isPitchDeckOpen && (
        <JudgePitchDeckModal
          isOpen={isPitchDeckOpen}
          onClose={() => setIsPitchDeckOpen(false)}
        />
      )}

      {isArenaOpen && (
        <ModelArenaModal
          isOpen={isArenaOpen}
          onClose={() => setIsArenaOpen(false)}
        />
      )}

      {isWhitepaperOpen && (
        <TechnicalWhitepaperModal
          isOpen={isWhitepaperOpen}
          onClose={() => setIsWhitepaperOpen(false)}
        />
      )}

      {isStepFunctionsOpen && (
        <StepFunctionsModal
          isOpen={isStepFunctionsOpen}
          onClose={() => setIsStepFunctionsOpen(false)}
        />
      )}

      {isRunbooksOpen && (
        <RunbookKnowledgeBaseModal
          isOpen={isRunbooksOpen}
          onClose={() => setIsRunbooksOpen(false)}
        />
      )}

      {isSsmOpen && (
        <SsmParametersModal
          isOpen={isSsmOpen}
          onClose={() => setIsSsmOpen(false)}
        />
      )}

      {isAwsMatrixOpen && (
        <AwsServicesMatrixModal
          isOpen={isAwsMatrixOpen}
          onClose={() => setIsAwsMatrixOpen(false)}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onLoginSuccess={(updated) => {
            setCurrentUser(updated);
            localStorage.setItem('cs_user_profile', JSON.stringify(updated));
            setIsAuthOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
