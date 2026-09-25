import React, { useState } from "react";
import { 
  FileText, Database, Sliders, Share2, ShieldCheck, KeyRound, 
  ArrowRight, CheckCircle2, AlertTriangle, Eye, Lock, Sparkles, 
  ExternalLink, Layers, Terminal, ChevronRight, Zap
} from "lucide-react";

export default function LandingPage({ onLaunchStudio }) {
  const [simDisclosure, setSimDisclosure] = useState("PUBLIC");
  const [simActiveClaim, setSimActiveClaim] = useState(0);

  const sampleClaims = [
    { id: "sclaim_01", text: "Global clean energy investments expanded 35% in 2025 reaching 400 GW capacity.", level: "PUBLIC", ptr: "doc_1#p_0" },
    { id: "sclaim_02", text: "Total municipal infrastructure allocation was finalized at $45M.", level: "INTERNAL", ptr: "doc_1#p_1" },
    { id: "sclaim_03", text: "Project Titan internal security reserve is strictly held at $12M with restricted code TITAN-99.", level: "CONFIDENTIAL", ptr: "doc_1#p_2" },
  ];

  const isClaimPermitted = (level) => {
    const hierarchy = { PUBLIC: 1, INTERNAL: 2, CONFIDENTIAL: 3, RESTRICTED: 4 };
    return hierarchy[level] <= hierarchy[simDisclosure];
  };

  return (
    <div style={{ maxWidth: "1340px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "40px 0 60px" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          borderRadius: "9999px",
          background: "rgba(56, 189, 248, 0.1)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          color: "var(--accent-cyan)",
          fontSize: "0.82rem",
          fontWeight: 600,
          marginBottom: "24px",
        }}>
          <Sparkles size={14} />
          Enterprise-Grade Governed Content Transformation Platform
        </div>

        <h1 style={{
          fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
          lineHeight: 1.15,
          fontWeight: 800,
          maxWidth: "960px",
          margin: "0 auto 24px",
          background: "linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Understand the Source Once. <br />
          <span style={{
            background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Govern Every Claim. Render Anywhere.
          </span>
        </h1>

        <p style={{
          fontSize: "1.15rem",
          color: "var(--text-muted)",
          maxWidth: "760px",
          margin: "0 auto 36px",
          lineHeight: 1.6,
        }}>
          Eliminate corporate distortion, hallucinations, and unauthorized leaks. Transform unstructured documents 
          into atomic claim banks, enforce pre-generation disclosure gating, render parallel channels concurrently, 
          and verify factual fidelity with cryptographic reverse traceability.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <button 
            onClick={onLaunchStudio}
            className="btn btn-primary"
            style={{ fontSize: "1.05rem", padding: "14px 28px", borderRadius: "12px" }}
          >
            Launch Studio Workspace
            <ArrowRight size={18} />
          </button>

          <a 
            href="#architecture"
            className="btn btn-secondary"
            style={{ fontSize: "1.05rem", padding: "14px 24px", borderRadius: "12px" }}
          >
            Explore Technical Approach
          </a>
        </div>
      </section>

      {/* Metrics Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "70px",
      }}>
        {[
          { label: "Audit Traceability", val: "100%", desc: "Direct to bounding box coordinates" },
          { label: "Verified Test Suite", val: "95 / 95", desc: "Automated unit & pipeline tests passing" },
          { label: "Dual Verification", val: "Gate 1 & 2", desc: "Fidelity entailment + PII leakage scans" },
          { label: "Manifest Tamper Seal", val: "SHA-256", desc: "Cryptographically resealed audit trail" },
        ].map((m, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "var(--accent-cyan)",
              marginBottom: "4px",
            }}>
              {m.val}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "4px" }}>
              {m.label}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
              {m.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Live Governance Showcase */}
      <section style={{ marginBottom: "80px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Live Architectural Demonstration
          </div>
          <h2 style={{ fontSize: "2rem", marginTop: "6px" }}>How Pre-Generation Claim Gating Works</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Toggle the operator disclosure ceiling to see how unpermitted facts are blocked before reaching generation.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "28px", border: "1px solid var(--border-active)" }}>
          {/* Controls Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            paddingBottom: "20px",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Lock size={18} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Operator Disclosure Ceiling:</span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"].map((level) => (
                <button
                  key={level}
                  onClick={() => setSimDisclosure(level)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: simDisclosure === level ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                    background: simDisclosure === level ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.6)",
                    color: simDisclosure === level ? "#ffffff" : "var(--text-muted)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Claims Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {sampleClaims.map((claim, idx) => {
              const permitted = isClaimPermitted(claim.level);
              return (
                <div
                  key={claim.id}
                  style={{
                    background: permitted ? "rgba(30, 41, 59, 0.5)" : "rgba(30, 20, 20, 0.5)",
                    border: `1px solid ${permitted ? "rgba(56, 189, 248, 0.25)" : "rgba(239, 68, 68, 0.3)"}`,
                    borderRadius: "12px",
                    padding: "18px",
                    position: "relative",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                      {claim.ptr}
                    </span>
                    <span className={`badge badge-${claim.level.toLowerCase()}`}>
                      {claim.level}
                    </span>
                  </div>

                  <p style={{
                    fontSize: "0.9rem",
                    color: permitted ? "var(--text-main)" : "var(--text-dim)",
                    textDecoration: permitted ? "none" : "line-through",
                    marginBottom: "14px",
                  }}>
                    {claim.text}
                  </p>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: permitted ? "#34d399" : "#f87171",
                  }}>
                    {permitted ? (
                      <>
                        <CheckCircle2 size={14} /> Permitted for LLM Synthesis
                      </>
                    ) : (
                      <>
                        <Lock size={14} /> Gated by Disclosure Policy
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Approach 6 Pillars Section */}
      <section id="architecture" style={{ marginBottom: "80px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Architectural Blueprint
          </div>
          <h2 style={{ fontSize: "2rem", marginTop: "6px" }}>The 6 Pillars of Governed Transformation</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Engineered strictly according to zero-trust factual grounding and verifiable provenance.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "24px",
        }}>
          {[
            {
              num: "01",
              title: "Multi-Format Ingestion & Layout Parsing",
              icon: FileText,
              color: "#38bdf8",
              items: [
                "Docling layout hierarchy & reading order recovery",
                "PDF, DOCX, TXT, HTML, and Audio speech ingestion",
                "Preserves bounding boxes [x1, y1, x2, y2] per block",
                "Extracts structured tables with row/column cells",
              ],
            },
            {
              num: "02",
              title: "Atomic Claim Layer & Sensitivity Bank",
              icon: Database,
              color: "#6366f1",
              items: [
                "Decomposes content into discrete verifiable assertions",
                "Automatic entity extraction: currency, dates, figures",
                "Categorizes sensitivity: PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED",
                "Enables deterministic pre-generation subset gating",
              ],
            },
            {
              num: "03",
              title: "Operator Configuration & Domain Profiles",
              icon: Sliders,
              color: "#a855f7",
              items: [
                "Configures Audience, Tone, Language, and Detail Level",
                "Profiles for Corporate, Healthcare, Government, Emergency, Cyber",
                "Enforces strict disclosure ceiling before generation",
                "Prevents restricted facts from ever reaching the prompt",
              ],
            },
            {
              num: "04",
              title: "Parallel Multi-Channel Rendering",
              icon: Share2,
              color: "#ec4899",
              items: [
                "Concurrent synthesis via dedicated format sub-agents",
                "Executive Summary, LinkedIn, X/Twitter, Advisory Notice",
                "Infographic Data Brief and Slide Presentation Outlines",
                "Free Prompt Mode with explicit synthetic claim tagging",
              ],
            },
            {
              num: "05",
              title: "Dual Verification Gates",
              icon: ShieldCheck,
              color: "#10b981",
              items: [
                "Gate 1 (Fidelity): NLI Entailment reasoning against source",
                "Secondary Verifier: Numerical & entity strict cross-check",
                "Gate 2 (Disclosure): Compliance ceiling & secret scanning",
                "PII Scanners: Indian Aadhaar, US SSN, and API tokens",
              ],
            },
            {
              num: "06",
              title: "Provenance Manifest & Reverse Traceability",
              icon: KeyRound,
              color: "#f59e0b",
              items: [
                "Immutable lineage: Source -> Extraction -> Gen -> Verify",
                "SHA-256 deterministic manifest integrity hash",
                "Sign & Publish workflow with approver signature",
                "Pinpoint reverse lookup from claim back to visual bounding box",
              ],
            },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx} 
                className="glass-panel" 
                style={{ 
                  padding: "28px", 
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: `rgba(${pillar.color === "#38bdf8" ? "56, 189, 248" : "99, 102, 241"}, 0.15)`,
                      border: `1px solid ${pillar.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Icon size={22} color={pillar.color} />
                    </div>
                    <span className="font-mono" style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dim)" }}>
                      {pillar.num}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.25rem", marginBottom: "14px", color: "var(--text-main)" }}>
                    {pillar.title}
                  </h3>

                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {pillar.items.map((it, i) => (
                      <li key={i} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        marginBottom: "8px",
                      }}>
                        <ChevronRight size={14} color={pillar.color} style={{ flexShrink: 0, marginTop: "4px" }} />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="glass-panel" style={{
        padding: "50px 30px",
        textAlign: "center",
        border: "1px solid var(--border-active)",
        background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)",
      }}>
        <h2 style={{ fontSize: "2.2rem", marginBottom: "16px" }}>
          Ready to Test Governed Content Transformation?
        </h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 28px", fontSize: "1.05rem" }}>
          Jump straight into the Studio Workspace. Ingest source reports, configure domain policies, render multi-channel outputs, and audit with cryptographic verification.
        </p>
        <button 
          onClick={onLaunchStudio}
          className="btn btn-primary"
          style={{ fontSize: "1.1rem", padding: "14px 32px", borderRadius: "12px" }}
        >
          Open Studio Workspace
          <ArrowRight size={20} />
        </button>
      </section>
    </div>
  );
}
