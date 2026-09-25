import React, { useEffect, useState } from "react";
import { Shield, Layers, Sparkles, BookOpen, ExternalLink, Activity } from "lucide-react";
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
    const interval = setInterval(poll, 8000);
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
      background: "rgba(255, 255, 255, 0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
      boxShadow: "0 2px 12px -2px rgba(217, 119, 6, 0.06)",
      padding: "16px 32px",
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
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 14px rgba(234, 88, 12, 0.30)",
            transition: "all var(--transition-fast)",
          }}>
            <Shield size={22} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontSize: "18px",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: "#0f172a",
              }}>
                VERITAS
              </span>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "4px",
                background: "#fff7ed",
                border: "1px solid rgba(249, 115, 22, 0.25)",
                color: "#c2410c",
                letterSpacing: "0.04em",
              }}>
                STUDIO
              </span>
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#64748b", 
              letterSpacing: "0.01em",
              marginTop: "1px",
              fontWeight: 500,
            }}>
              Governed Transformation Engine
            </div>
          </div>
        </div>

        {/* View Switcher: Segmented Control */}
        <nav className="segmented-control" style={{ maxWidth: "380px", width: "100%" }}>
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

        {/* Right Section: Compact Status Pill & Secondary Ghost API Docs Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Gateway Status as Compact Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 12px",
            borderRadius: "var(--radius-pill)",
            background: isOnline ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${isOnline ? "#a7f3d0" : "#fecaca"}`,
            fontSize: "12px",
            fontWeight: 600,
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: isOnline ? "#10b981" : "#ef4444",
              boxShadow: `0 0 6px ${isOnline ? "#10b981" : "#ef4444"}`,
              display: "inline-block",
            }} />
            <span style={{ color: isOnline ? "#047857" : "#dc2626" }}>
              {isOnline ? "Gateway Active" : "Gateway Offline"}
            </span>
          </div>

          {/* Secondary Ghost Button: API Docs */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{
              gap: "6px",
              border: "1px solid rgba(245, 158, 11, 0.28)",
              background: "#ffffff",
              color: "#78350f",
            }}
          >
            <BookOpen size={14} color="#ea580c" />
            API Docs
            <ExternalLink size={12} color="#94a3b8" />
          </a>
        </div>
      </div>
    </header>
  );
}
