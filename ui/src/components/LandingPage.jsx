import React, { useState } from "react";
import { 
  FileText, Database, Sliders, Share2, ShieldCheck, KeyRound, 
  ArrowRight, CheckCircle2, AlertTriangle, Eye, Lock, Sparkles, 
  ExternalLink, Layers, Terminal, ChevronRight, Zap, Shield,
  Check, FileCode, CheckSquare, Hash, Activity
} from "lucide-react";

export default function LandingPage({ onLaunchStudio }) {
  const [simDisclosure, setSimDisclosure] = useState("PUBLIC");

  const sampleClaims = [
    { 
      id: "claim_01", 
      text: "Global clean energy investments expanded 35% in 2025 reaching 400 GW capacity.", 
      level: "PUBLIC", 
      ptr: "doc_1#p_0", 
      conf: "99.4%" 
    },
    { 
      id: "claim_02", 
      text: "Total municipal infrastructure allocation was finalized at $45M across 12 urban districts.", 
      level: "INTERNAL", 
      ptr: "doc_1#p_1", 
      conf: "98.7%" 
    },
    { 
      id: "claim_03", 
      text: "Project Titan internal security reserve is strictly held at $12M with restricted authorization code TITAN-99.", 
      level: "CONFIDENTIAL", 
      ptr: "doc_1#p_2", 
      conf: "99.1%" 
    },
  ];

  const hierarchy = { PUBLIC: 1, INTERNAL: 2, CONFIDENTIAL: 3, RESTRICTED: 4 };
  const isClaimPermitted = (level) => {
    return hierarchy[level] <= hierarchy[simDisclosure];
  };

  const getBadgeClass = (level) => {
    switch (level) {
      case "PUBLIC": return "badge-public";
      case "INTERNAL": return "badge-internal";
      case "CONFIDENTIAL": return "badge-confidential";
      case "RESTRICTED": return "badge-restricted";
      default: return "badge-public";
    }
  };

  return (
    <div style={{ maxWidth: "1380px", margin: "0 auto", padding: "40px 32px 100px" }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "50px 0 70px", position: "relative" }}>
        
        {/* Warm Golden-Orange Ambient Radial Glow */}
        <div style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "550px",
          height: "260px",
          background: "radial-gradient(ellipse, rgba(245, 158, 11, 0.14) 0%, rgba(249, 115, 22, 0.08) 50%, transparent 75%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Release Pill Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 18px",
            borderRadius: "var(--radius-pill)",
            background: "#fff7ed",
            border: "1px solid rgba(249, 115, 22, 0.3)",
            color: "#c2410c",
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "28px",
            boxShadow: "0 2px 8px rgba(234, 88, 12, 0.08)",
          }}>
            <Sparkles size={14} color="#ea580c" />
            Enterprise-Grade Governed Content Transformation Platform
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 5.2vw, 4rem)",
            lineHeight: 1.15,
            fontWeight: 800,
            maxWidth: "1000px",
            margin: "0 auto 24px",
            letterSpacing: "-0.035em",
            color: "#0f172a",
          }}>
            Understand the Source Once. <br />
            <span style={{
              background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 50%, #d97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Govern Every Claim. Render Anywhere.
            </span>
          </h1>

          <p style={{
            fontSize: "1.15rem",
            color: "#334155",
            maxWidth: "780px",
            margin: "0 auto 38px",
            lineHeight: 1.65,
          }}>
            Eliminate corporate distortion, hallucinations, and unauthorized leaks. Transform unstructured documents 
            into atomic claim banks, enforce pre-generation disclosure gating, render parallel channels concurrently, 
            and verify factual fidelity with cryptographic reverse traceability.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button 
              onClick={onLaunchStudio}
              className="btn btn-primary btn-lg"
              style={{ borderRadius: "12px", gap: "10px" }}
            >
              Launch Studio Workspace
              <ArrowRight size={18} />
            </button>

            <a 
              href="#architecture"
              className="btn btn-secondary btn-lg"
              style={{ borderRadius: "12px" }}
            >
              Explore Architecture
            </a>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "80px",
      }}>
        {[
          { label: "Audit Traceability", val: "100%", desc: "Direct coordinate bounding box pointers" },
          { label: "Verified Test Suite", val: "95 / 95", desc: "Automated unit & pipeline tests passing" },
          { label: "Dual Verification", val: "Gate 1 & 2", desc: "Factual fidelity + PII leakage scans" },
          { label: "Manifest Tamper Seal", val: "SHA-256", desc: "Cryptographically signed audit records" },
        ].map((m, idx) => (
          <div key={idx} className="studio-card" style={{ padding: "24px 20px", textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.1rem",
              fontWeight: 800,
              color: "#ea580c",
              marginBottom: "4px",
              letterSpacing: "-0.02em",
            }}>
              {m.val}
            </div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", marginBottom: "4px" }}>
              {m.label}
            </div>
            <div className="text-meta" style={{ color: "#64748b" }}>
              {m.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Live Demonstration: Pre-Gen Disclosure Gate */}
      <section style={{ marginBottom: "80px" }}>
        <div className="studio-card" style={{ padding: "32px", border: "1px solid rgba(245, 158, 11, 0.35)", background: "#ffffff" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
            paddingBottom: "18px",
            borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span className="badge-pill badge-confidential">LIVE PREVIEW</span>
                <h3 className="text-card-title" style={{ color: "#0f172a" }}>Pre-Generation Disclosure Ceiling Gate</h3>
              </div>
              <p className="text-body" style={{ fontSize: "14px", color: "#64748b" }}>
                Switch the ceiling below to observe real-time gating of atomic claims before synthesis occurs.
              </p>
            </div>

            {/* Segmented Control for Disclosure Simulation */}
            <div className="segmented-control" style={{ maxWidth: "380px" }}>
              {["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"].map((level) => {
                const isActive = simDisclosure === level;
                return (
                  <button
                    key={level}
                    onClick={() => setSimDisclosure(level)}
                    className={`segmented-control-btn ${isActive ? "active" : ""}`}
                    style={{
                      fontSize: "12px",
                      padding: "8px 12px",
                      background: isActive ? (
                        level === "PUBLIC" ? "#10b981" :
                        level === "INTERNAL" ? "#3b82f6" :
                        level === "CONFIDENTIAL" ? "#f59e0b" :
                        "#ea580c"
                      ) : "transparent",
                      color: isActive ? "#ffffff" : "#78350f",
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Claim Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sampleClaims.map((claim) => {
              const permitted = isClaimPermitted(claim.level);
              return (
                <div
                  key={claim.id}
                  className={`claim-row ${permitted ? "selected" : "gated"}`}
                  style={{ minHeight: "68px" }}
                >
                  <div style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    background: permitted ? "#ecfdf5" : "#fffbeb",
                    border: `1px solid ${permitted ? "#a7f3d0" : "#fde68a"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}>
                    {permitted ? <Check size={13} color="#047857" strokeWidth={2.5} /> : <Lock size={12} color="#b45309" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="font-mono text-meta" style={{
                          color: "#c2410c",
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}>
                          {claim.ptr}
                        </span>
                        <span className={`badge-pill ${getBadgeClass(claim.level)}`}>
                          {claim.level}
                        </span>
                      </div>

                      <span className="text-meta">
                        {permitted ? (
                          <span style={{ color: "#047857", fontWeight: 600 }}>Permitted for Synthesis ({claim.conf})</span>
                        ) : (
                          <span style={{ color: "#b45309", fontWeight: 600 }}>Gated: Requires {claim.level} clearance</span>
                        )}
                      </span>
                    </div>

                    <p style={{
                      fontSize: "14px",
                      lineHeight: 1.5,
                      color: permitted ? "#0f172a" : "#94a3b8",
                      filter: permitted ? "none" : "blur(3.5px)",
                      userSelect: permitted ? "text" : "none",
                      transition: "filter var(--transition-fast)",
                    }}>
                      {claim.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture System Grid */}
      <section id="architecture" style={{ marginBottom: "80px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 className="text-section-title" style={{ fontSize: "28px", marginBottom: "10px", color: "#0f172a" }}>
            The 6-Stage Governance Pipeline
          </h2>
          <p className="text-body" style={{ maxWidth: "600px", margin: "0 auto", color: "#64748b" }}>
            A deterministic, auditable pipeline ensuring every word generated is grounded in authoritative source coordinates.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
        }}>
          {[
            {
              stage: "01",
              title: "Source Ingestion & Docling Parser",
              icon: FileText,
              desc: "Multi-modality ingest across PDF, DOCX, TXT, and Web URLs. Preserves bounding box coordinates for each paragraph, table, and heading.",
            },
            {
              stage: "02",
              title: "Atomic Claim Extraction",
              icon: Database,
              desc: "Deconstructs narrative source material into discrete, verifiable atomic claims. Tags each claim with confidence scores and sensitivity classifications.",
            },
            {
              stage: "03",
              title: "Operator Configuration & Ceiling Gating",
              icon: Sliders,
              desc: "Enforces pre-generation disclosure gating. Claims above the authorized clearance level are mathematically filtered out before reaching generation.",
            },
            {
              stage: "04",
              title: "Parallel Multi-Channel Synthesis",
              icon: Share2,
              desc: "Generates tailored collateral across Executive Summaries, LinkedIn posts, X threads, Advisories, Infographic briefs, Decks, and Video packages concurrently.",
            },
            {
              stage: "05",
              title: "Dual Verification Gates",
              icon: ShieldCheck,
              desc: "Gate 1 validates factual entailment against source coordinates. Gate 2 performs rigorous scans for PII, secrets, and unauthorized disclosure leaks.",
            },
            {
              stage: "06",
              title: "Cryptographic Audit Manifest",
              icon: KeyRound,
              desc: "Signs the entire transformation chain with SHA-256 hashes, approver identity, timestamps, and reverse traceability coordinates.",
            },
          ].map((col, idx) => {
            const IconC = col.icon;
            return (
              <div key={idx} className="studio-card" style={{ padding: "26px", background: "#ffffff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div className="studio-card-icon" style={{ background: "#fff7ed", borderColor: "rgba(249, 115, 22, 0.25)" }}>
                    <IconC size={18} color="#ea580c" />
                  </div>
                  <span className="font-mono" style={{ fontSize: "13px", fontWeight: 800, color: "#d97706" }}>
                    {col.stage}
                  </span>
                </div>
                <h3 className="text-card-title" style={{ marginBottom: "8px", color: "#0f172a" }}>
                  {col.title}
                </h3>
                <p className="text-body" style={{ fontSize: "14px", color: "#475569" }}>
                  {col.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ textAlign: "center", padding: "60px 20px" }}>
        <div className="studio-card" style={{
          padding: "48px 32px",
          background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)",
          border: "1px solid rgba(249, 115, 22, 0.35)",
          boxShadow: "0 10px 40px -8px rgba(234, 88, 12, 0.15)",
          maxWidth: "800px",
          margin: "0 auto",
        }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "12px", color: "#0f172a" }}>
            Experience Governed Content Transformation
          </h2>
          <p className="text-body" style={{ marginBottom: "26px", maxWidth: "560px", margin: "0 auto 26px", color: "#475569" }}>
            Ready to test atomic claim extraction, pre-generation gating, and cryptographic verification?
          </p>
          <button
            onClick={onLaunchStudio}
            className="btn btn-primary btn-lg"
            style={{ borderRadius: "12px", padding: "0 32px" }}
          >
            Launch Governed Studio
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

    </div>
  );
}
