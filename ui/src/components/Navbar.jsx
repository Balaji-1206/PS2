import React, { useEffect, useState } from "react";
import { Shield, Layers, Sparkles, Terminal, ExternalLink, Activity } from "lucide-react";
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
      background: "rgba(5, 8, 22, 0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "14px 32px",
    }}>
      <div style={{
        maxWidth: "1680px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
      }}>
        {/* Brand / Logo Area */}
        <div 
          onClick={() => setActiveTab("landing")}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "14px", 
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(2, 132, 199, 0.85), rgba(37, 99, 235, 0.85))",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(2, 132, 199, 0.25)",
            transition: "all var(--transition-fast)",
          }}>
            <Shield size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontSize: "17px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#f8fafc",
              }}>
                VERITAS
              </span>
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                letterSpacing: "0.04em",
              }}>
                STUDIO
              </span>
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "var(--text-dim)", 
              letterSpacing: "0.01em",
              marginTop: "1px",
            }}>
              Governed Transformation Engine
            </div>
          </div>
        </div>

        {/* View Switcher: Segmented Control (Linear/Arc style) */}
        <nav className="segmented-control" style={{ maxWidth: "360px", width: "100%" }}>
          <button
            onClick={() => setActiveTab("landing")}
            className={`segmented-control-btn ${activeTab === "landing" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            <Layers size={15} />
            Architecture Overview
          </button>

          <button
            onClick={() => setActiveTab("studio")}
            className={`segmented-control-btn ${activeTab === "studio" ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            <Sparkles size={15} />
            Studio Workspace
          </button>
        </nav>

        {/* Gateway Status Pill & API Docs Ghost Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Status Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 12px",
            borderRadius: "var(--radius-pill)",
            background: isOnline ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
            border: `1px solid ${isOnline ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
            fontSize: "12px",
            color: isOnline ? "#34d399" : "#f87171",
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isOnline ? "#10b981" : "#ef4444",
              boxShadow: isOnline ? "0 0 8px rgba(16, 185, 129, 0.6)" : "none",
              display: "inline-block",
            }} />
            {isOnline ? "Gateway :8000 Active" : "Backend Offline"}
          </div>

          {/* API Docs Ghost Button */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{
              gap: "6px",
              fontSize: "13px",
              padding: "0 12px",
              color: "var(--text-muted)",
              height: "32px",
            }}
            title="Open Interactive API Docs (Swagger OpenAPI)"
          >
            <Terminal size={14} />
            API Docs
            <ExternalLink size={12} style={{ opacity: 0.6 }} />
          </a>
        </div>
      </div>
    </header>
  );
}
