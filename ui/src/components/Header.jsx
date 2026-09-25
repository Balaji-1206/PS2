import React from "react";
import { Shield, Sparkles, Clock, Lock, FileText, Database } from "lucide-react";

export default function Header({ activeTab, activeDocumentId }) {
  const getHeaderInfo = () => {
    switch (activeTab) {
      case "studio":
        return {
          title: "Governed Transformation Studio",
          subtitle: "Guided sequential pipeline with atomic assertions & cryptographic verification",
          badge: "PIPELINE ACTIVE",
          badgeClass: "badge-confidential",
        };
      case "account":
        return {
          title: "User Account & Data Studio",
          subtitle: "Enterprise repository for documents, claim catalogs, and signed audit manifests",
          badge: "STORAGE CONNECTED",
          badgeClass: "badge-public",
        };
      case "landing":
        return {
          title: "Architecture & Verification Overview",
          subtitle: "Technical specifications of the 6-stage content governance pipeline",
          badge: "SPECIFICATION",
          badgeClass: "badge-internal",
        };
      default:
        return {
          title: "Veritas Governance Platform",
          subtitle: "Enterprise Factual Grounding Engine",
          badge: "ACTIVE",
          badgeClass: "badge-public",
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <header style={{
      height: "72px",
      minHeight: "72px",
      background: "rgba(255, 255, 255, 0.90)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 30,
      boxShadow: "0 1px 6px rgba(217, 119, 6, 0.04)",
    }}>
      {/* Left: View Title & Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "19px",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              margin: 0,
            }}>
              {info.title}
            </h1>
            <span className={`badge-pill ${info.badgeClass}`} style={{ fontSize: "10px", fontWeight: 700 }}>
              {info.badge}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
            {info.subtitle}
          </div>
        </div>
      </div>

      {/* Right: Active Document & Status Indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {activeDocumentId && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#ffffff",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: "var(--radius-pill)",
            padding: "5px 14px",
            fontSize: "12px",
            boxShadow: "0 2px 6px rgba(217, 119, 6, 0.05)",
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#ea580c",
              boxShadow: "0 0 6px #ea580c",
              display: "inline-block",
            }} />
            <span style={{ color: "#64748b", fontWeight: 500 }}>Active Document:</span>
            <span className="font-mono" style={{ color: "#0f172a", fontWeight: 700 }}>{activeDocumentId}</span>
          </div>
        )}

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "#78350f",
          background: "#fff7ed",
          padding: "5px 12px",
          borderRadius: "var(--radius-pill)",
          border: "1px solid #fed7aa",
          fontWeight: 600,
        }}>
          <Shield size={13} color="#ea580c" />
          <span>Restricted Clearance Level 4</span>
        </div>
      </div>
    </header>
  );
}
