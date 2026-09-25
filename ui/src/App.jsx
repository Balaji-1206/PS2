import React, { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import StudioPage from "./components/StudioPage";
import ReverseTraceModal from "./components/ReverseTraceModal";

export default function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [tracePointer, setTracePointer] = useState(null);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === "landing" ? (
          <LandingPage onLaunchStudio={() => setActiveTab("studio")} />
        ) : (
          <StudioPage onOpenTraceModal={(ptr) => setTracePointer(ptr)} />
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
