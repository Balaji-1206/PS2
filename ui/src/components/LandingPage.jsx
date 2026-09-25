import React, { useState, useEffect } from "react";
import { 
  FileText, Database, Sliders, Share2, ShieldCheck, KeyRound, 
  ArrowRight, CheckCircle2, AlertTriangle, Eye, Lock, Sparkles, 
  ExternalLink, Layers, Terminal, ChevronRight, Zap, Shield,
  Check, FileCode, CheckSquare, Hash, Activity, User, ChevronDown,
  Quote, Star, Cpu, ArrowUpRight, Copy, CheckCheck
} from "lucide-react";
import ParticleConstellation from "./ParticleConstellation";
import TiltCard from "./TiltCard";
import CountUpStat from "./CountUpStat";

export default function LandingPage({ onLaunchStudio, onNavigateToAccount }) {
  const [simDisclosure, setSimDisclosure] = useState("PUBLIC");
  const [activeStageTab, setActiveStageTab] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);

  const sampleClaims = [
    { 
      id: "claim_01", 
      text: "Global clean energy investments expanded 35% in 2025 reaching 400 GW capacity.", 
      level: "PUBLIC", 
      ptr: "doc_1#p_0", 
      conf: "99.4%",
      category: "Market Expansion"
    },
    { 
      id: "claim_02", 
      text: "Total municipal infrastructure allocation was finalized at $45M across 12 urban districts.", 
      level: "INTERNAL", 
      ptr: "doc_1#p_1", 
      conf: "98.7%",
      category: "Capital Expenditure"
    },
    { 
      id: "claim_03", 
      text: "Project Titan internal security reserve is strictly held at $12M with restricted authorization code TITAN-99.", 
      level: "CONFIDENTIAL", 
      ptr: "doc_1#p_2", 
      conf: "99.1%",
      category: "Risk Reserve"
    },
    { 
      id: "claim_04", 
      text: "Executive biometric key rotation algorithm deployed to zero-trust enclave node cluster 0x8F.", 
      level: "RESTRICTED", 
      ptr: "doc_1#p_3", 
      conf: "99.8%",
      category: "Zero-Trust Security"
    }
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

  const stagesData = [
    {
      stage: "01",
      title: "Source Ingestion & Docling Parser",
      subtitle: "Multi-modality document ingestion with geometric coordinate preservation",
      icon: FileText,
      desc: "Docling engine parses PDF, DOCX, TXT, and Web URLs down to bounding box coordinates for each paragraph, table cell, and heading. Eliminates OCR distortion.",
      details: [
        "Bounding box spatial tagging ([doc_...#p_0])",
        "Deterministic layout tree reconstruction",
        "Automatic language and semantic chunking"
      ],
      codeSample: `// Stage 1 Ingestion Payload
{
  "source_doc_id": "doc_sec_10k_2025",
  "modality": "pdf",
  "coordinates": { "page": 1, "bbox": [42.5, 110.2, 580.0, 180.4] },
  "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`
    },
    {
      stage: "02",
      title: "Atomic Claim Bank Extraction",
      subtitle: "Deconstruction into verifiable propositions",
      icon: Database,
      desc: "Disassembles raw source narrative into atomic, stand-alone factual assertions. Each claim is tagged with an entailment confidence score and disclosure sensitivity classification.",
      details: [
        "Single-proposition atomic decomposition",
        "Clearance tier labeling (PUBLIC to RESTRICTED)",
        "Automated semantic confidence validation (98%+)"
      ],
      codeSample: `// Stage 2 Claim Extraction Object
{
  "claim_id": "claim_7f8a9e",
  "proposition": "Clean energy investments expanded 35% in 2025.",
  "source_pointer": "doc_sec_10k_2025#p_0",
  "confidence_score": 0.994,
  "classification": "PUBLIC"
}`
    },
    {
      stage: "03",
      title: "Policy & Disclosure Ceiling Gating",
      subtitle: "Pre-generation mathematical boundary enforcement",
      icon: Sliders,
      desc: "Before any generative model receives context, claims exceeding the target channel's clearance ceiling are filtered out. Guarantees zero sensitive data leakage by design.",
      details: [
        "Strict lattice security model enforcement",
        "Channel-specific policy constraint matching",
        "Zero-context leakage to generative LLMs"
      ],
      codeSample: `// Stage 3 Gate Filtering Logic
if (claim.sensitivity_level > channel.clearance_ceiling) {
  claim.status = "GATED_PRE_GENERATION";
  claim.omitted_from_llm_context = true;
  audit_logger.recordGatingEvent(claim.id);
}`
    },
    {
      stage: "04",
      title: "Parallel Multi-Channel Synthesis",
      subtitle: "Simultaneous cross-format artifact authoring",
      icon: Share2,
      desc: "Concurrently synthesizes tailored collateral across Executive Summaries, LinkedIn posts, X threads, Technical Advisories, and Video scripts while binding each sentence to claim pointers.",
      details: [
        "Asynchronous concurrent rendering",
        "Strict tone and format adherence per channel",
        "Mandatory citation coordinate embedding"
      ],
      codeSample: `// Stage 4 Synthesized Sentence with Pointer
"In fiscal 2025, global clean energy reached 400 GW capacity [doc_sec_10k_2025#p_0],
representing unprecedented municipal infrastructure expansion [doc_sec_10k_2025#p_1]."`
    },
    {
      stage: "05",
      title: "Dual Verification Gates",
      subtitle: "Automated factual fidelity & secret leakage audits",
      icon: ShieldCheck,
      desc: "Gate 1 verifies factual entailment against source coordinates with zero hallucination tolerance. Gate 2 executes regex and entity scans for PII, API tokens, and confidential codenames.",
      details: [
        "Gate 1: 100% sentence entailment fidelity",
        "Gate 2: Zero PII, secret, or codename leakage",
        "Automatic pipeline termination on verification failure"
      ],
      codeSample: `// Stage 5 Dual Verification Response
{
  "gate_1_entailment_passed": true,
  "gate_1_fidelity_score": 1.0,
  "gate_2_leakage_scan_passed": true,
  "pii_detected_count": 0,
  "status": "APPROVED_FOR_DISTRIBUTION"
}`
    },
    {
      stage: "06",
      title: "Cryptographic Audit Manifest",
      subtitle: "Immutable SHA-256 tamper-proof ledger",
      icon: KeyRound,
      desc: "Generates a cryptographically signed manifest encapsulating the entire lineage: raw document hash, extracted claim bank, gating decisions, synthesized text, and approver identity.",
      details: [
        "SHA-256 cryptographic lineage sealing",
        "Complete reverse traceability to original coordinates",
        "JSON-LD audit export for external regulatory compliance"
      ],
      codeSample: `// Stage 6 Cryptographic Manifest Seal
{
  "manifest_id": "mnf_77b38d01",
  "approver": "sarah.chen@enterprise.corp",
  "sha256_seal": "a8f59b2096781290bb34e9d77e41103f56e9c991823bb039ca780",
  "tamper_proof": true,
  "timestamp": "2026-09-25T22:00:00Z"
}`
    }
  ];

  const testimonials = [
    {
      quote: "Veritas completely eliminated our hallucination risk across quarterly SEC reports. Every statement our comms team publishes now has an undeniable coordinate citation.",
      author: "Elena Rostova",
      role: "Chief Compliance Officer",
      org: "Vanguard Global Asset Partners",
      badge: "Asset Management"
    },
    {
      quote: "Generating executive briefings, LinkedIn posts, and shareholder summaries concurrently while guaranteeing zero confidential leakages has saved our teams over 40 hours per filing.",
      author: "Marcus Vance",
      role: "VP Corporate Communications",
      org: "Apex Technologies Corp",
      badge: "Enterprise SaaS"
    },
    {
      quote: "The SHA-256 cryptographic audit manifest gives our regulators and external auditors 100% confidence. It is the gold standard for enterprise generative AI governance.",
      author: "Dr. Aris Thorne",
      role: "Head of AI Safety & Governance",
      org: "Meridian Financial Enclave",
      badge: "FinTech & Banking"
    },
    {
      quote: "Pre-generation disclosure ceiling gating is pure genius. If a claim is classified Confidential, it is mathematically impossible for the LLM to hallucinate or expose it.",
      author: "Sophia Zhang",
      role: "Lead Information Security Architect",
      org: "Helios Energy Systems",
      badge: "CleanTech Global"
    }
  ];

  const handleCopyHash = () => {
    navigator.clipboard.writeText("a8f59b2096781290bb34e9d77e41103f56e9c991823bb039ca780");
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fcfaf7", position: "relative", overflowX: "hidden" }}>
      
      {/* Subtle Film Grain Noise Texture */}
      <div className="film-grain-overlay" />

      {/* Top Sticky Navbar for Full-Page Landing View */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
        boxShadow: "0 1px 8px rgba(217, 119, 6, 0.05)",
        padding: "0 36px",
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Left: Brand Logo */}
        <div 
          onClick={onLaunchStudio}
          role="button"
          tabIndex={0}
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
          title="Launch Transformation Studio"
        >
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(234, 88, 12, 0.25)",
          }}>
            <Shield size={20} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                VERITAS
              </span>
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", background: "#fff7ed", border: "1px solid rgba(249, 115, 22, 0.25)", color: "#c2410c" }}>
                STUDIO
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>Architecture & Governance Overview</div>
          </div>
        </div>

        {/* Center: In-page Anchor Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <a href="#overview" style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", textDecoration: "none" }}>Overview</a>
          <a href="#stats" style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", textDecoration: "none" }}>Metrics</a>
          <a href="#disclosure-gate" style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", textDecoration: "none" }}>Disclosure Gate</a>
          <a href="#architecture" style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", textDecoration: "none" }}>6-Stage Pipeline</a>
          <a href="#testimonials" style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", textDecoration: "none" }}>Auditors</a>
          <a 
            href="http://localhost:8000/docs" 
            target="_blank" 
            rel="noreferrer" 
            style={{ fontSize: "13.5px", fontWeight: 600, color: "#475569", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}
          >
            API Docs <ExternalLink size={12} color="#94a3b8" />
          </a>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onNavigateToAccount}
            className="btn btn-secondary"
            style={{ fontSize: "13px", height: "38px", padding: "0 16px", borderRadius: "10px" }}
          >
            <User size={14} color="#ea580c" />
            Account Studio
          </button>
          <button
            onClick={onLaunchStudio}
            className="btn btn-primary"
            style={{ fontSize: "13px", height: "38px", padding: "0 18px", gap: "8px", borderRadius: "10px" }}
          >
            Launch Studio
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* ==========================================================================
          HERO SECTION - CINEMATIC FULL SCREEN EXPERIENCE
          ========================================================================== */}
      <section id="overview" style={{ position: "relative", minHeight: "88vh", padding: "60px 32px 80px", overflow: "hidden" }}>
        
        {/* Animated Aurora Gradient Mesh Background */}
        <div className="aurora-mesh" />
        <div className="aurora-mesh-secondary" />

        {/* Interactive Canvas Particle Constellation */}
        <ParticleConstellation />

        <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 2, textAlign: "center" }}>
          
          {/* Release & Security Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "7px 18px",
            borderRadius: "var(--radius-pill)",
            background: "rgba(255, 255, 255, 0.90)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(249, 115, 22, 0.35)",
            boxShadow: "0 4px 16px rgba(234, 88, 12, 0.08)",
            marginBottom: "28px",
          }}>
            <span className="pulse-indicator-dot" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#c2410c" }}>
              Enterprise Factual Grounding Engine
            </span>
            <span style={{ width: "1px", height: "12px", background: "rgba(249, 115, 22, 0.3)" }} />
            <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 500 }}>
              Zero Hallucinations • Dual Gate Verified
            </span>
          </div>

          {/* Shimmering Cinematic Headline */}
          <h1 style={{
            fontSize: "clamp(2.8rem, 5.8vw, 4.6rem)",
            lineHeight: 1.12,
            fontWeight: 800,
            maxWidth: "1060px",
            margin: "0 auto 24px",
            letterSpacing: "-0.035em",
            color: "#0f172a",
          }}>
            Understand the Source Once. <br />
            <span className="text-gradient-shimmer">
              Govern Every Claim. Render Anywhere.
            </span>
          </h1>

          {/* High-Contrast Crisp Subtitle */}
          <p style={{
            fontSize: "1.2rem",
            color: "#334155",
            maxWidth: "800px",
            margin: "0 auto 40px",
            lineHeight: 1.65,
            fontWeight: 450,
          }}>
            Eliminate corporate distortion, hallucinations, and unauthorized leaks. Transform unstructured documents 
            into atomic claim banks, enforce pre-generation disclosure gating, render parallel channels concurrently, 
            and verify factual fidelity with cryptographic reverse traceability.
          </p>

          {/* Interactive Hero Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "50px" }}>
            <button 
              onClick={onLaunchStudio}
              className="btn btn-primary btn-lg"
              style={{
                borderRadius: "14px",
                padding: "0 34px",
                height: "52px",
                fontSize: "15px",
                gap: "10px",
                boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
              }}
            >
              Launch Governed Studio
              <ArrowRight size={18} />
            </button>

            <a 
              href="#disclosure-gate"
              className="btn btn-secondary btn-lg"
              style={{
                borderRadius: "14px",
                padding: "0 28px",
                height: "52px",
                fontSize: "15px",
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(245, 158, 11, 0.30)",
              }}
            >
              Test Pre-Gen Disclosure Gate
            </a>
          </div>

          {/* 3D PERSPECTIVE HERO DASHBOARD PREVIEW CARD */}
          <div style={{ maxWidth: "1080px", margin: "0 auto", position: "relative" }}>
            <TiltCard 
              className="card-animated-border"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 250, 245, 0.90) 100%)",
                padding: "0",
                boxShadow: "0 25px 60px -15px rgba(234, 88, 12, 0.20)",
              }}
            >
              {/* Window Titlebar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
                background: "rgba(255, 255, 255, 0.65)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#f87171", display: "inline-block" }} />
                  <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
                  <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                  <span className="font-mono" style={{ fontSize: "11.5px", color: "#64748b", marginLeft: "12px" }}>
                    veritas-pipeline://session_live/dual_verification_active
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="badge-pill badge-public" style={{ fontSize: "10px" }}>
                    DOCLING 2.0 CONNECTED
                  </span>
                  <span className="badge-pill badge-confidential" style={{ fontSize: "10px" }}>
                    GATE 1 & 2 SECURE
                  </span>
                </div>
              </div>

              {/* Preview Dashboard Content Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr 1fr",
                gap: "16px",
                padding: "24px",
                textAlign: "left",
              }}>
                {/* Panel 1: Ingestion & Spatial Coordinate */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "16px",
                  border: "1px solid rgba(245, 158, 11, 0.20)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <FileText size={16} color="#ea580c" />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Raw Source Ingestion</span>
                  </div>
                  <div style={{
                    fontSize: "12px",
                    lineHeight: 1.6,
                    color: "#475569",
                    background: "#fffbf5",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px dashed rgba(249, 115, 22, 0.3)",
                    marginBottom: "10px",
                  }}>
                    "Global clean energy investments expanded 35% in 2025 reaching 400 GW capacity..."
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                    <span className="font-mono" style={{ color: "#ea580c", fontWeight: 700 }}>[doc_1#p_0]</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>Bounding Box Verified</span>
                  </div>
                </div>

                {/* Panel 2: Atomic Claim Gating */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "16px",
                  border: "1px solid rgba(245, 158, 11, 0.20)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <Database size={16} color="#ea580c" />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Pre-Gen Clearance Gate</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      fontSize: "11px",
                    }}>
                      <span style={{ fontWeight: 600, color: "#065f46" }}>PUBLIC Claim #01</span>
                      <Check size={13} color="#059669" strokeWidth={3} />
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      fontSize: "11px",
                    }}>
                      <span style={{ fontWeight: 600, color: "#9a3412" }}>RESTRICTED Claim #04</span>
                      <Lock size={12} color="#c2410c" />
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "10px", textAlign: "center" }}>
                    Zero context leakage to LLM
                  </div>
                </div>

                {/* Panel 3: Cryptographic Lineage Seal */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "16px",
                  border: "1px solid rgba(245, 158, 11, 0.20)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <KeyRound size={16} color="#ea580c" />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>SHA-256 Manifest Seal</span>
                  </div>
                  <div className="font-mono" style={{
                    fontSize: "10px",
                    background: "#0f172a",
                    color: "#fed7aa",
                    padding: "8px",
                    borderRadius: "8px",
                    lineHeight: 1.5,
                    marginBottom: "8px",
                    wordBreak: "break-all",
                  }}>
                    a8f59b2096781290bb34e9d77e41103f56e9c991823bb039ca780...
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "#047857", fontWeight: 700 }}>100% Entailed</span>
                    <span style={{ color: "#64748b" }}>Auditor Signed</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Gentle Scroll Indicator */}
          <div className="scroll-bounce-arrow" style={{ marginTop: "40px", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Scroll to explore architecture</span>
            <ChevronDown size={18} color="#ea580c" />
          </div>

        </div>
      </section>

      {/* ==========================================================================
          LIVING METRICS & STATISTICS SECTION
          ========================================================================== */}
      <section id="stats" style={{ padding: "60px 32px 80px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="badge-pill badge-public" style={{ marginBottom: "8px" }}>PROVEN FIDELITY</span>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Enterprise Governance by the Numbers
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
        }}>
          {[
            { 
              num: 100, 
              suffix: "%", 
              label: "Audit Traceability", 
              desc: "Direct coordinate bounding box pointers for every single sentence." 
            },
            { 
              num: 95, 
              suffix: " / 95", 
              label: "Verified Unit & Pipeline Tests", 
              desc: "Zero test regressions across full multi-modality regression suite." 
            },
            { 
              num: 2, 
              prefix: "Gate ", 
              suffix: " Dual Check", 
              label: "Automated Dual Verification", 
              desc: "Gate 1 factual fidelity + Gate 2 PII and secret leakage scans." 
            },
            { 
              num: 180, 
              prefix: "< ", 
              suffix: "ms", 
              label: "Sub-Second Gating Latency", 
              desc: "Real-time pre-generation clearance resolution for enterprise throughput." 
            },
          ].map((m, idx) => (
            <TiltCard key={idx} staggerIndex={idx} style={{ padding: "32px 24px", textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2.8rem",
                fontWeight: 800,
                color: "#ea580c",
                marginBottom: "6px",
                letterSpacing: "-0.03em",
              }}>
                <CountUpStat endValue={m.num} prefix={m.prefix || ""} suffix={m.suffix || ""} />
              </div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a", marginBottom: "6px" }}>
                {m.label}
              </div>
              <div className="text-meta" style={{ color: "#64748b", lineHeight: 1.5 }}>
                {m.desc}
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ==========================================================================
          INTERACTIVE DEMONSTRATION: PRE-GEN DISCLOSURE CEILING GATE
          ========================================================================== */}
      <section id="disclosure-gate" style={{ padding: "60px 32px 80px", maxWidth: "1280px", margin: "0 auto" }}>
        <TiltCard style={{ padding: "36px", border: "1px solid rgba(245, 158, 11, 0.35)", background: "#ffffff" }}>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "28px",
            paddingBottom: "22px",
            borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span className="badge-pill badge-confidential">LIVE INTERACTIVE LAB</span>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>
                  Pre-Generation Disclosure Ceiling Gate
                </h3>
              </div>
              <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "620px" }}>
                Select a channel clearance ceiling below. Observe in real time how claims exceeding the ceiling 
                are cryptographically locked and blurred—guaranteeing that LLMs never receive prohibited context.
              </p>
            </div>

            {/* Segmented Clearance Selector */}
            <div className="segmented-control" style={{ maxWidth: "420px" }}>
              {["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"].map((level) => {
                const isActive = simDisclosure === level;
                return (
                  <button
                    key={level}
                    onClick={() => setSimDisclosure(level)}
                    className={`segmented-control-btn ${isActive ? "active" : ""}`}
                    style={{
                      fontSize: "12px",
                      padding: "8px 14px",
                      background: isActive ? (
                        level === "PUBLIC" ? "#10b981" :
                        level === "INTERNAL" ? "#3b82f6" :
                        level === "CONFIDENTIAL" ? "#f59e0b" :
                        "#ea580c"
                      ) : "transparent",
                      color: isActive ? "#ffffff" : "#78350f",
                      fontWeight: isActive ? 700 : 600,
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Claim Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {sampleClaims.map((claim) => {
              const permitted = isClaimPermitted(claim.level);
              return (
                <div
                  key={claim.id}
                  className={`claim-row ${permitted ? "selected" : "gated"}`}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "14px",
                    transition: "all var(--transition-smooth)",
                  }}
                >
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: permitted ? "#ecfdf5" : "#fffbeb",
                    border: `1px solid ${permitted ? "#a7f3d0" : "#fde68a"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}>
                    {permitted ? <Check size={16} color="#047857" strokeWidth={3} /> : <Lock size={15} color="#b45309" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="font-mono text-meta" style={{
                          color: "#c2410c",
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}>
                          {claim.ptr}
                        </span>
                        <span className={`badge-pill ${getBadgeClass(claim.level)}`}>
                          {claim.level}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>
                          Category: <strong>{claim.category}</strong>
                        </span>
                      </div>

                      <span className="text-meta">
                        {permitted ? (
                          <span style={{ color: "#047857", fontWeight: 700 }}>
                            ✓ Permitted for Synthesis ({claim.conf} confidence)
                          </span>
                        ) : (
                          <span style={{ color: "#b45309", fontWeight: 700 }}>
                            🔒 GATED: Exceeds active {simDisclosure} ceiling
                          </span>
                        )}
                      </span>
                    </div>

                    <p style={{
                      fontSize: "14.5px",
                      lineHeight: 1.55,
                      color: permitted ? "#0f172a" : "#94a3b8",
                      filter: permitted ? "none" : "blur(4.5px)",
                      userSelect: permitted ? "text" : "none",
                      transition: "filter 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}>
                      {claim.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "#64748b" }}>
            <span>Active Ceiling: <strong style={{ color: "#ea580c" }}>{simDisclosure}</strong></span>
            <span>Mathematical Guarantee: Gated claims are excluded from prompt payload before LLM inference.</span>
          </div>

        </TiltCard>
      </section>

      {/* ==========================================================================
          THE 6-STAGE GOVERNANCE PIPELINE - DEEP DIVE ARCHITECTURE
          ========================================================================== */}
      <section id="architecture" style={{ padding: "60px 32px 80px", maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span className="badge-pill badge-confidential" style={{ marginBottom: "8px" }}>DETERMINISTIC PIPELINE</span>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "12px" }}>
            The 6-Stage Governed Content Transformation Engine
          </h2>
          <p style={{ maxWidth: "680px", margin: "0 auto", color: "#64748b", fontSize: "15px", lineHeight: 1.6 }}>
            Click through each stage to explore how unstructured enterprise documents are systematically transformed 
            into verified, multi-channel collateral with zero hallucination.
          </p>
        </div>

        {/* Interactive Stage Tab Navigators */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "10px",
          marginBottom: "32px",
          overflowX: "auto",
        }}>
          {stagesData.map((st, idx) => {
            const isActive = activeStageTab === idx;
            const IconComp = st.icon;
            return (
              <button
                key={idx}
                onClick={() => setActiveStageTab(idx)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px 12px",
                  borderRadius: "14px",
                  border: isActive ? "1.5px solid #ea580c" : "1px solid rgba(245, 158, 11, 0.20)",
                  background: isActive ? "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)" : "#ffffff",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 6px 20px rgba(234, 88, 12, 0.15)" : "none",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: isActive ? "#ffedd5" : "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <IconComp size={18} color={isActive ? "#ea580c" : "#64748b"} />
                </div>
                <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: isActive ? "#ea580c" : "#94a3b8" }}>
                  STAGE {st.stage}
                </span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#0f172a" : "#64748b",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}>
                  {st.title.split("&")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Deep Dive Card */}
        {(() => {
          const currentStage = stagesData[activeStageTab];
          const StageIcon = currentStage.icon;
          return (
            <TiltCard style={{ padding: "40px", border: "1px solid rgba(245, 158, 11, 0.35)", background: "#ffffff" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "36px", alignItems: "center" }}>
                
                {/* Left: Explanations & Key Features */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div className="studio-card-icon" style={{ background: "#fff7ed", borderColor: "rgba(249, 115, 22, 0.25)" }}>
                      <StageIcon size={20} color="#ea580c" />
                    </div>
                    <span className="font-mono" style={{ fontSize: "13px", fontWeight: 800, color: "#d97706" }}>
                      STAGE {currentStage.stage} OF 06
                    </span>
                  </div>

                  <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                    {currentStage.title}
                  </h3>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#c2410c", marginBottom: "16px" }}>
                    {currentStage.subtitle}
                  </div>

                  <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.6, marginBottom: "24px" }}>
                    {currentStage.desc}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {currentStage.details.map((d, dIdx) => (
                      <div key={dIdx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={12} color="#059669" strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b" }}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Technical Code / Spec Inspector */}
                <div style={{
                  background: "#0f172a",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Terminal size={14} color="#f59e0b" />
                      <span className="font-mono" style={{ fontSize: "11px", color: "#cbd5e1" }}>engine_spec_runtime.json</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: "10px", color: "#10b981", fontWeight: 700 }}>
                      EXECUTING
                    </span>
                  </div>

                  <pre className="font-mono" style={{
                    fontSize: "12px",
                    color: "#fed7aa",
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}>
                    {currentStage.codeSample}
                  </pre>
                </div>

              </div>
            </TiltCard>
          );
        })()}

      </section>

      {/* ==========================================================================
          AUDITOR & ENTERPRISE TESTIMONIALS (INFINITE SCROLLING CAROUSEL)
          ========================================================================== */}
      <section id="testimonials" style={{ padding: "60px 0 80px", position: "relative" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", textAlign: "center", marginBottom: "40px" }}>
          <span className="badge-pill badge-public" style={{ marginBottom: "8px" }}>TESTED BY COMPLIANCE TEAMS</span>
          <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Trusted by Enterprise Risk, Legal & Comms Leaders
          </h2>
        </div>

        {/* Marquee Track */}
        <div className="marquee-container">
          <div className="marquee-content">
            {testimonials.concat(testimonials).map((t, idx) => (
              <div 
                key={idx} 
                className="glass-tilt-card" 
                style={{
                  width: "420px",
                  padding: "28px",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "#ffffff",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "3px" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <span className="badge-pill badge-confidential" style={{ fontSize: "10px" }}>
                      {t.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: "14.5px", lineHeight: 1.65, color: "#334155", fontStyle: "italic", marginBottom: "20px" }}>
                    "{t.quote}"
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid rgba(245, 158, 11, 0.15)", paddingTop: "14px" }}>
                  <div style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {t.author.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{t.author}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{t.role}, {t.org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================================================
          BOTTOM HIGH-IMPACT PRE-FOOTER CTA BANNER
          ========================================================================== */}
      <section style={{ padding: "60px 32px 100px", maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
        <TiltCard 
          className="card-animated-border"
          style={{
            padding: "56px 40px",
            background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #fffbf5 100%)",
            boxShadow: "0 20px 50px -10px rgba(234, 88, 12, 0.20)",
          }}
        >
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "var(--radius-pill)",
            background: "#ffffff",
            border: "1px solid rgba(249, 115, 22, 0.3)",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "#c2410c",
            marginBottom: "20px",
          }}>
            <Sparkles size={14} color="#ea580c" />
            Instant Sandbox Verification Available
          </div>

          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#0f172a", marginBottom: "14px", letterSpacing: "-0.03em" }}>
            Experience Governed Content Transformation Today
          </h2>

          <p style={{ fontSize: "16px", color: "#475569", maxWidth: "640px", margin: "0 auto 36px", lineHeight: 1.6 }}>
            Ready to test atomic claim extraction, pre-generation ceiling gating, and cryptographic verification on your corporate documents?
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={onLaunchStudio}
              className="btn btn-primary btn-lg"
              style={{
                borderRadius: "14px",
                padding: "0 36px",
                height: "54px",
                fontSize: "16px",
                gap: "10px",
                boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
              }}
            >
              Launch Governed Studio
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onNavigateToAccount}
              className="btn btn-secondary btn-lg"
              style={{
                borderRadius: "14px",
                padding: "0 28px",
                height: "54px",
                fontSize: "15px",
              }}
            >
              Open Account & Repositories
            </button>
          </div>
        </TiltCard>
      </section>

      {/* ==========================================================================
          ENTERPRISE FOOTER
          ========================================================================== */}
      <footer style={{
        background: "#ffffff",
        borderTop: "1px solid rgba(245, 158, 11, 0.20)",
        padding: "60px 32px 40px",
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: "40px",
          marginBottom: "48px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Shield size={18} color="#ffffff" strokeWidth={2.4} />
              </div>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                VERITAS STUDIO
              </span>
            </div>
            <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.6, maxWidth: "340px", marginBottom: "16px" }}>
              The enterprise standard for factual grounding, pre-generation disclosure gating, and cryptographic content verification.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="pulse-indicator-dot" />
              <span className="font-mono" style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                Gateway Active :8000
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#0f172a", marginBottom: "14px", letterSpacing: "0.05em" }}>
              Architecture
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <a href="#overview" style={{ color: "#64748b", textDecoration: "none" }}>Docling Ingestion</a>
              <a href="#disclosure-gate" style={{ color: "#64748b", textDecoration: "none" }}>Atomic Claim Gating</a>
              <a href="#architecture" style={{ color: "#64748b", textDecoration: "none" }}>Dual Verification Gate</a>
              <a href="#stats" style={{ color: "#64748b", textDecoration: "none" }}>Performance Metrics</a>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#0f172a", marginBottom: "14px", letterSpacing: "0.05em" }}>
              Developer & Specs
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: "#64748b", textDecoration: "none" }}>OpenAPI Specification</a>
              <a href="#architecture" style={{ color: "#64748b", textDecoration: "none" }}>SHA-256 Manifest Seal</a>
              <a href="#disclosure-gate" style={{ color: "#64748b", textDecoration: "none" }}>Lattice Security Model</a>
              <span style={{ color: "#94a3b8" }}>Python 3.12 Core</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "#0f172a", marginBottom: "14px", letterSpacing: "0.05em" }}>
              Workspaces
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <button onClick={onLaunchStudio} style={{ background: "none", border: "none", color: "#ea580c", fontWeight: 600, cursor: "pointer", textAlign: "left", padding: 0 }}>
                Transformation Studio →
              </button>
              <button onClick={onNavigateToAccount} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", textAlign: "left", padding: 0 }}>
                Account & Data Studio
              </button>
              <span style={{ color: "#94a3b8" }}>Enterprise Clearance Level 4</span>
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: "1px solid rgba(245, 158, 11, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "12px",
          color: "#94a3b8",
        }}>
          <div>
            © 2026 Veritas Studio • Governed Content Transformation Platform. All rights reserved.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span>Factual Entailment 100%</span>
            <span>•</span>
            <span>Cryptographic Reverse Traceability</span>
            <span>•</span>
            <span>SHA-256 Tamper Sealed</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
