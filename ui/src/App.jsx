import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import StudioPage from "./components/StudioPage";
import AccountStudio from "./components/AccountStudio";
import ReverseTraceModal from "./components/ReverseTraceModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("studio"); // "studio" | "account" | "landing"
  const [tracePointer, setTracePointer] = useState(null);
  const [loadedDocument, setLoadedDocument] = useState(null);

  const handleLaunchDocumentInStudio = (doc) => {
    setLoadedDocument(doc);
    setActiveTab("studio");
  };

  const handleLaunchNewPipeline = () => {
    setLoadedDocument(null);
    setActiveTab("studio");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === "landing" && (
          <LandingPage 
            onLaunchStudio={() => setActiveTab("studio")} 
          />
        )}

        {activeTab === "studio" && (
          <StudioPage 
            onOpenTraceModal={(ptr) => setTracePointer(ptr)} 
            onNavigateToAccount={() => setActiveTab("account")}
            onNavigateToOverview={() => setActiveTab("landing")}
            loadedDocument={loadedDocument}
          />
        )}

        {activeTab === "account" && (
          <AccountStudio 
            onSelectDocumentForStudio={handleLaunchDocumentInStudio}
            onLaunchNewPipeline={handleLaunchNewPipeline}
            onNavigateToStudio={() => setActiveTab("studio")}
            onNavigateToOverview={() => setActiveTab("landing")}
          />
        )}
      </main>

      {/* Reverse Traceability Coordinate Modal */}
      {tracePointer && (
        <ReverseTraceModal 
          pointer={tracePointer} 
          onClose={() => setTracePointer(null)} 
        />
      )}
    </div>
  );
}
