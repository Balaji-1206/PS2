import React from 'react';
import { PramaanProvider, usePramaan } from './context/PramaanContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PipelineTracker } from './components/PipelineTracker';
import { Toast } from './components/Toast';

import { Page1Overview } from './pages/Page1Overview';
import { Page2Ingestion } from './pages/Page2Ingestion';
import { Page3ExtractionClaims } from './pages/Page3ExtractionClaims';
import { Page4Configuration } from './pages/Page4Configuration';
import { Page5DisclosureSubset } from './pages/Page5DisclosureSubset';
import { Page6GenerationOrchestrator } from './pages/Page6GenerationOrchestrator';
import { Page7GenerationDetail } from './pages/Page7GenerationDetail';
import { Page8DualVerification } from './pages/Page8DualVerification';
import { Page9HumanReview } from './pages/Page9HumanReview';
import { Page10ProvenanceSigning } from './pages/Page10ProvenanceSigning';
import { Page11VerifiedOutputs } from './pages/Page11VerifiedOutputs';
import { Page12ReverseTraceability } from './pages/Page12ReverseTraceability';
import { Page13DomainProfiles } from './pages/Page13DomainProfiles';
import { Page14FreePromptMode } from './pages/Page14FreePromptMode';

const AppContent: React.FC = () => {
  const { activePage } = usePramaan();

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview': return <Page1Overview />;
      case 'ingestion': return <Page2Ingestion />;
      case 'claims': return <Page3ExtractionClaims />;
      case 'configuration': return <Page4Configuration />;
      case 'subset': return <Page5DisclosureSubset />;
      case 'generation': return <Page6GenerationOrchestrator />;
      case 'gen-detail': return <Page7GenerationDetail />;
      case 'verification': return <Page8DualVerification />;
      case 'review': return <Page9HumanReview />;
      case 'provenance': return <Page10ProvenanceSigning />;
      case 'outputs': return <Page11VerifiedOutputs />;
      case 'reverse-trace': return <Page12ReverseTraceability />;
      case 'domains': return <Page13DomainProfiles />;
      case 'freeprompt': return <Page14FreePromptMode />;
      default: return <Page1Overview />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <TopBar />

        {/* Global Pipeline Tracker Bar */}
        <PipelineTracker />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-16">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <PramaanProvider>
      <AppContent />
    </PramaanProvider>
  );
}
