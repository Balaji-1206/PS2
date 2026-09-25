import React, { useEffect, useState } from "react";
import { Shield, Activity, Layers, Terminal, Sparkles, ExternalLink } from "lucide-react";
import { checkHealth } from "../services/api";

export default function Navbar({ activeTab, setActiveTab }) {
  const [health, setHealth] = useState({ status: "checking", modules: null });

  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      const res = await checkHealth();
      if (isMounted) {
        setHealth(res);
      }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isOnline = health.status === "ok";

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(8, 12, 20, 0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "14px 28px",
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
      }}>
        {/* Brand */}
        <div 
          onClick={() => setActiveTab("landing")}
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(56, 189, 248, 0.4)",
          }}>
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.2rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              background: "linear-gradient(90deg, #f8fafc 0%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              VERITAS
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Governed Transformation
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(15, 23, 42, 0.8)",
          padding: "4px",
          borderRadius: "12px",
          border: "1px solid var(--border-subtle)",
        }}>
          <button
            onClick={() => setActiveTab("landing")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "landing" ? "linear-gradient(135deg, #1e293b, #0f172a)" : "transparent",
              color: activeTab === "landing" ? "var(--accent-cyan)" : "var(--text-muted)",
              boxShadow: activeTab === "landing" ? "0 2px 8px rgba(0,0,0,0.4), inset 0 0 1px 1px rgba(255,255,255,0.05)" : "none",
              fontFamily: "var(--font-heading)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Layers size={16} />
            Architecture Overview
          </button>

          <button
            onClick={() => setActiveTab("studio")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "studio" ? "linear-gradient(135deg, #0284c7, #2563eb)" : "transparent",
              color: activeTab === "studio" ? "#ffffff" : "var(--text-muted)",
              boxShadow: activeTab === "studio" ? "0 4px 14px rgba(14, 165, 233, 0.4)" : "none",
              fontFamily: "var(--font-heading)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Sparkles size={16} />
            Studio Workspace
          </button>
        </nav>

        {/* Backend Status Pill & Docs Link */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 12px",
            borderRadius: "20px",
            background: isOnline ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
            border: `1px solid ${isOnline ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            fontSize: "0.78rem",
            color: isOnline ? "#34d399" : "#f87171",
            fontFamily: "var(--font-mono)",
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: isOnline ? "#10b981" : "#ef4444",
              boxShadow: isOnline ? "0 0 8px #10b981" : "none",
              display: "inline-block",
            }} />
            {isOnline ? "Gateway :8000 Active" : "Backend Offline"}
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.8rem",
              color: "var(--text-dim)",
              padding: "6px 10px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.03)",
              transition: "color 0.2s ease",
            }}
            title="Open Swagger OpenAPI Documentation"
          >
            <Terminal size={14} />
            API Docs
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </header>
  );
}
