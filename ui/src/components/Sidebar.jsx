import React, { useState, useEffect } from "react";
import {
  Shield, Zap, User, Layers, BookOpen, ExternalLink,
  Activity, CheckCircle2, ChevronRight, FileText, Database,
  Sliders, ShieldCheck, Lock
} from "lucide-react";
import { checkHealth } from "../services/api";
import { StorageService } from "../services/storage";

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isGatewayOnline, setIsGatewayOnline] = useState(true);
  const profile = StorageService.getProfile();

  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const res = await checkHealth();
        if (isMounted) setIsGatewayOnline(res?.status === "ok");
      } catch {
        if (isMounted) setIsGatewayOnline(false);
      }
    };
    poll();
    const interval = setInterval(poll, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);



  return (
    <aside style={{
      width: "270px",
      minWidth: "270px",
      height: "100vh",
      position: "sticky",
      top: 0,
      background: "#ffffff",
      borderRight: "1px solid rgba(245, 158, 11, 0.20)",
      boxShadow: "2px 0 16px -2px rgba(217, 119, 6, 0.05)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "24px 16px",
      zIndex: 40,
    }}>
      {/* Top: Logo & Main Navigation */}
      <div>
        {/* Top Brand Emblem Button - Architecture Overview Trigger */}
        <div
          onClick={() => setActiveTab("landing")}
          role="button"
          tabIndex={0}
          title="Click to view full-page Architecture Overview & Pipeline Specs"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px",
            marginBottom: "28px",
            cursor: "pointer",
            borderRadius: "12px",
            border: activeTab === "landing" ? "1.5px solid #ea580c" : "1px solid rgba(245, 158, 11, 0.25)",
            background: activeTab === "landing" ? "#fff7ed" : "#fffbf5",
            transition: "all var(--transition-fast)",
            boxShadow: activeTab === "landing" ? "0 3px 12px rgba(234, 88, 12, 0.12)" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#ea580c";
            e.currentTarget.style.background = "#fff7ed";
            e.currentTarget.style.boxShadow = "0 3px 12px rgba(234, 88, 12, 0.12)";
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "landing") {
              e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.25)";
              e.currentTarget.style.background = "#fffbf5";
              e.currentTarget.style.boxShadow = "none";
            }
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
            boxShadow: "0 3px 12px rgba(234, 88, 12, 0.28)",
            flexShrink: 0,
          }}>
            <Shield size={22} color="#ffffff" strokeWidth={2.4} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#0f172a",
              }}>
                VERITAS
              </span>
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "4px",
                background: "#fff7ed",
                border: "1px solid rgba(249, 115, 22, 0.25)",
                color: "#c2410c",
              }}>
                STUDIO
              </span>
            </div>
            <div style={{
              fontSize: "11px",
              color: "#c2410c",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "2px"
            }}>
              <Layers size={11} color="#ea580c" />
              Architecture Overview
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#94a3b8",
            padding: "0 10px",
            marginBottom: "8px",
          }}>
            Workspace
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button
              onClick={() => setActiveTab("studio")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: activeTab === "studio" ? "1px solid rgba(249, 115, 22, 0.35)" : "1px solid transparent",
                background: activeTab === "studio" ? "linear-gradient(90deg, #fff7ed 0%, #fffbf5 100%)" : "transparent",
                color: activeTab === "studio" ? "#c2410c" : "#475569",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                outline: "none",
                transition: "all var(--transition-fast)",
                boxShadow: activeTab === "studio" ? "0 2px 8px rgba(234, 88, 12, 0.08)" : "none",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "studio") {
                  e.currentTarget.style.background = "#fffdf9";
                  e.currentTarget.style.color = "#0f172a";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "studio") {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#475569";
                }
              }}
            >
              <div style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: activeTab === "studio" ? "#ffedd5" : "#f8fafc",
                border: `1px solid ${activeTab === "studio" ? "#fed7aa" : "#e2e8f0"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Zap size={16} color={activeTab === "studio" ? "#ea580c" : "#64748b"} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13.5px", fontWeight: activeTab === "studio" ? 700 : 600, lineHeight: 1.3 }}>
                  Transformation Studio
                </div>
                <div style={{ fontSize: "11px", color: activeTab === "studio" ? "#b45309" : "#94a3b8" }}>
                  Sequential Process Pipeline
                </div>
              </div>

              {activeTab === "studio" && <ChevronRight size={14} color="#ea580c" />}
            </button>
          </nav>
        </div>

        {/* Resources Section */}
        <div>
          <div style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#94a3b8",
            padding: "0 10px",
            marginBottom: "8px",
          }}>
            Developer & Audit
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid transparent",
                color: "#475569",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fffdf9";
                e.currentTarget.style.color = "#ea580c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#475569";
              }}
            >
              <div style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <BookOpen size={15} color="#ea580c" />
              </div>
              <span style={{ flex: 1 }}>API Documentation</span>
              <ExternalLink size={13} color="#94a3b8" />
            </a>
          </nav>
        </div>
      </div>

      {/* Bottom: Gateway Status & User Profile Widget */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Gateway Status Pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderRadius: "10px",
          background: isGatewayOnline ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${isGatewayOnline ? "#a7f3d0" : "#fecaca"}`,
          fontSize: "12px",
          fontWeight: 600,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isGatewayOnline ? "#10b981" : "#ef4444",
              boxShadow: `0 0 6px ${isGatewayOnline ? "#10b981" : "#ef4444"}`,
              display: "inline-block",
            }} />
            <span style={{ color: isGatewayOnline ? "#047857" : "#dc2626" }}>
              {isGatewayOnline ? "Gateway Active" : "Gateway Offline"}
            </span>
          </div>

          <span className="font-mono" style={{ fontSize: "11px", color: isGatewayOnline ? "#059669" : "#b91c1c" }}>
            :8000
          </span>
        </div>

        {/* User Profile Card & Account Studio Access */}
        <div
          onClick={() => setActiveTab("account")}
          role="button"
          tabIndex={0}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 12px",
            borderRadius: "12px",
            background: activeTab === "account"
              ? "linear-gradient(135deg, #fff7ed 0%, #fffbf5 100%)"
              : "#fffdfa",
            border: activeTab === "account"
              ? "1.5px solid #ea580c"
              : "1px solid rgba(245, 158, 11, 0.25)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            boxShadow: activeTab === "account"
              ? "0 3px 12px rgba(234, 88, 12, 0.12)"
              : "none",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "account") {
              e.currentTarget.style.borderColor = "#ea580c";
              e.currentTarget.style.background = "#fff7ed";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "account") {
              e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.25)";
              e.currentTarget.style.background = "#fffdfa";
            }
          }}
          title="Click to open User Account & Data Studio"
        >
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(234, 88, 12, 0.25)",
          }}>
            SC
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {profile.name}
              </div>
              <span style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: "4px",
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fecaca",
              }}>
                {profile.clearanceLevel}
              </span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: activeTab === "account" ? "#c2410c" : "#b45309",
              fontWeight: 600,
              marginTop: "2px"
            }}>
              <Database size={11} color={activeTab === "account" ? "#ea580c" : "#d97706"} />
              <span>Account & Data Studio</span>
            </div>
          </div>

          <ChevronRight size={14} color={activeTab === "account" ? "#ea580c" : "#94a3b8"} />
        </div>
      </div>
    </aside>
  );
}
