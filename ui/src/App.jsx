import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import StudioPage from "./components/StudioPage";
import ReverseTraceModal from "./components/ReverseTraceModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("studio");
  const [tracePointer, setTracePointer] = useState(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === "landing" ? (
          <LandingPage onLaunchStudio={() => setActiveTab("studio")} />
        ) : (
          <StudioPage 
            onOpenTraceModal={(ptr) => setTracePointer(ptr)} 
            onBackToOverview={() => setActiveTab("landing")}
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
