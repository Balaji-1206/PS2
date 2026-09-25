import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import StudioPage from "./components/StudioPage";
import AccountStudio from "./components/AccountStudio";
import ReverseTraceModal from "./components/ReverseTraceModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("landing"); // "landing" | "studio" | "account"
  const [tracePointer, setTracePointer] = useState(null);
  const [loadedDocument, setLoadedDocument] = useState(null);
  const [activeDocumentId, setActiveDocumentId] = useState(null);

  const handleLaunchDocumentInStudio = (doc) => {
    setLoadedDocument(doc);
    setActiveDocumentId(doc.id);
    setActiveTab("studio");
  };

  const handleLaunchNewPipeline = () => {
    setLoadedDocument(null);
    setActiveDocumentId(null);
    setActiveTab("studio");
  };

  // 1. Full Page View for Landing Page & Architecture Overview
  if (activeTab === "landing") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
        <LandingPage 
          onLaunchStudio={() => setActiveTab("studio")} 
          onNavigateToAccount={() => setActiveTab("account")}
        />
        {tracePointer && (
          <ReverseTraceModal 
            pointer={tracePointer} 
            onClose={() => setTracePointer(null)} 
          />
        )}
      </div>
    );
  }

  // 2. Standard App Shell (Left Sidebar + Dedicated Top Header + Main Content)
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "var(--bg-primary)",
      overflowX: "hidden",
    }}>
      {/* 1. Left Side Navigation Bar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Layout (Top Header Alone + Body) */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100vh",
        overflowY: "auto",
      }}>
        {/* Top Header Alone */}
        <Header activeTab={activeTab} activeDocumentId={activeDocumentId} />

        {/* Page Content Body */}
        <main style={{ flex: 1 }}>
          {activeTab === "studio" && (
            <StudioPage 
              onOpenTraceModal={(ptr) => setTracePointer(ptr)} 
              onNavigateToAccount={() => setActiveTab("account")}
              loadedDocument={loadedDocument}
              onDocumentIdChange={(id) => setActiveDocumentId(id)}
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
      </div>

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
