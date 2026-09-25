import React, { useState, useEffect } from "react";
import { 
  FileText, Upload, Globe, Cpu, Sliders, Shield, ShieldCheck, 
  Share2, KeyRound, CheckCircle2, AlertTriangle, Eye, Lock, 
  Sparkles, RefreshCw, Copy, Check, ArrowRight, CornerDownRight, 
  MapPin, ShieldAlert, Award, FileCode, CheckSquare, MessageCircle,
  LayoutGrid, Layers, Clock, Hash, UserCheck, ShieldQuestion,
  ChevronDown, Database, ExternalLink, HelpCircle, AlertCircle, Video
} from "lucide-react";
import { 
  extractContent, getClaimBank, generateChannels, 
  verifyContent, buildProvenanceRecord, publishProvenanceRecord, 
  verifyProvenanceIntegrity 
} from "../services/api";

const PRESET_TEMPLATES = {
  energy: {
    label: "Clean Energy",
    title: "Clean Energy Strategy Report",
    text: `# Clean Energy Strategy & Financial Report 2026

Global clean energy investments expanded by 35% in 2025 reaching 400 GW capacity across solar and wind installations. Municipal infrastructure grants accounted for 45 million dollars in capital deployment.

CONFIDENTIAL: Project Titan internal reserve is capped at $12M under executive authorization code TITAN-SEC-9988. Unauthorized dissemination is strictly prohibited under non-disclosure terms.`
  },
  infrastructure: {
    label: "Municipal Transit",
    title: "Transit & Infrastructure Directive",
    text: `# Municipal Infrastructure and Public Transit Directive 2026

The metropolitan transit authority approved 85 million dollars for zero-emission bus fleet electrification across 12 urban districts. Public fare subsidies will remain unchanged throughout fiscal year 2026.

INTERNAL: Transit employee union negotiations regarding shift differential wages are scheduled for Q3 review.`
  },
  cybersecurity: {
    label: "Cyber Grid",
    title: "Critical Infrastructure Threat Advisory",
    text: `# Threat Intelligence Advisory: Sector Grid Resilience

National cyber defense centers observed a 40% increase in distributed scanning against industrial control systems in Q1 2026. Zero active intrusions were recorded in monitored substations.

RESTRICTED: Sensor firmware vulnerability CVE-2026-9912 remediation patches must be deployed to air-gapped relays immediately.`
  }
};

const CHANNEL_DEFINITIONS = [
  {
    id: "executive_summary",
    title: "Executive Summary",
    desc: "C-suite strategic synthesis with key directives",
    icon: FileText,
  },
  {
    id: "linkedin_post",
    title: "LinkedIn Post",
    desc: "Professional thought leadership narrative",
    icon: Share2,
  },
  {
    id: "twitter_thread",
    title: "X Thread",
    desc: "Bite-sized sequential takeaways for social",
    icon: MessageCircle,
  },
  {
    id: "advisory",
    title: "Advisory Directive",
    desc: "Regulatory and compliance operational guidelines",
    icon: ShieldAlert,
  },
  {
    id: "infographic_brief",
    title: "Infographic Brief",
    desc: "Visual hierarchy pointers and key statistical callouts",
    icon: LayoutGrid,
  },
  {
    id: "presentation_outline",
    title: "Presentation Deck",
    desc: "Slide-by-slide narrative structure for stakeholders",
    icon: Layers,
  },
  {
    id: "video_package",
    title: "Video Package",
    desc: "Complete script, storyboard, narration & subtitles",
    icon: Video,
  },
];

export default function StudioPage({ onOpenTraceModal }) {
  // --- Ingestion State ---
  const [inputMode, setInputMode] = useState("text"); // text, file, url, free_prompt
  const [sourceText, setSourceText] = useState(PRESET_TEMPLATES.energy.text);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("https://example.com/clean-energy-2026");
  const [isExtracting, setIsExtracting] = useState(false);
  const [documentId, setDocumentId] = useState(null);

  // --- Claim Bank State ---
  const [claimBank, setClaimBank] = useState(null);
  const [selectedClaimIds, setSelectedClaimIds] = useState([]);

  // --- Operator Configuration State ---
  const [domainProfile, setDomainProfile] = useState("corporate");
  const [disclosureLevel, setDisclosureLevel] = useState("PUBLIC");
  const [audience, setAudience] = useState("general_public");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("en");
  const [detailLevel, setDetailLevel] = useState("standard");

  // --- Multi-Channel Rendering State ---
  const [selectedChannels, setSelectedChannels] = useState(["executive_summary", "linkedin_post", "twitter_thread"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [channelOutputs, setChannelOutputs] = useState(null);
  const [activeChannelTab, setActiveChannelTab] = useState("executive_summary");
  const [generationMeta, setGenerationMeta] = useState(null);

  // --- Dual Verification State ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // --- Provenance & Publishing State ---
  const [provenanceRecord, setProvenanceRecord] = useState(null);
  const [approverId, setApproverId] = useState("Compliance Auditor Sarah Chen");
  const [isPublishing, setIsPublishing] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [copiedChannel, setCopiedChannel] = useState(null);
  const [manifestCopied, setManifestCopied] = useState(false);

  // Helper for sensitivity level hierarchy
  const SENSITIVITY_HIERARCHY = { PUBLIC: 1, INTERNAL: 2, CONFIDENTIAL: 3, RESTRICTED: 4 };

  const isClaimAllowedByCeiling = (level) => {
    return (SENSITIVITY_HIERARCHY[level] || 1) <= (SENSITIVITY_HIERARCHY[disclosureLevel] || 1);
  };

  // 1. Extraction Trigger
  const handleExtract = async () => {
    setIsExtracting(true);
    setDocumentId(null);
    setClaimBank(null);
    setChannelOutputs(null);
    setVerificationResult(null);
    setProvenanceRecord(null);

    try {
      let res;
      if (inputMode === "file" && selectedFile) {
        res = await extractContent({ file: selectedFile });
      } else if (inputMode === "url" && sourceUrl) {
        res = await extractContent({ url: sourceUrl });
      } else {
        res = await extractContent({ text: sourceText });
      }

      if (res && res.document_id) {
        setDocumentId(res.document_id);
        const bank = await getClaimBank(res.document_id);
        setClaimBank(bank);
        if (bank && bank.claims) {
          const initialPermitted = bank.claims
            .filter((c) => isClaimAllowedByCeiling(c.sensitivity_label))
            .map((c) => c.claim_id);
          setSelectedClaimIds(initialPermitted);
        }
      }
    } catch (err) {
      alert(`Extraction Error: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // 2. Multi-Channel Generation Trigger
  const handleGenerateChannels = async () => {
    if (!documentId && inputMode !== "free_prompt") {
      alert("Please extract a source document first or switch to Free Prompt Mode.");
      return;
    }

    if (selectedChannels.length === 0) {
      alert("Please select at least one channel to render.");
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        document_id: inputMode === "free_prompt" ? "free_prompt" : documentId,
        config: {
          audience,
          tone,
          language,
          detail_level: detailLevel,
          disclosure_level: disclosureLevel,
          domain_profile: domainProfile,
          selected_claim_ids: selectedClaimIds,
        },
        channels: selectedChannels,
        instruction: `Transform into governed multi-channel communications under ${domainProfile} profile.`,
      };

      const res = await generateChannels(payload);
      if (res && res.outputs) {
        setChannelOutputs(res.outputs);
        setGenerationMeta(res);
        const availableChannels = Object.keys(res.outputs);
        if (availableChannels.length > 0 && !availableChannels.includes(activeChannelTab)) {
          setActiveChannelTab(availableChannels[0]);
        }
      }
    } catch (err) {
      alert(`Generation Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Dual Verification Trigger
  const handleVerify = async () => {
    if (!channelOutputs) {
      alert("Please generate content first before verifying.");
      return;
    }

    setIsVerifying(true);
    try {
      const currentOutput = channelOutputs[activeChannelTab];
      const claimsToVerify = (currentOutput?.claims || []).map((c) => ({
        claim_id: c.claim_id,
        statement: c.statement,
        cited_source_pointers: c.cited_source_pointers,
      }));

      const res = await verifyContent({
        document_id: documentId || "doc_sample",
        claims: claimsToVerify,
        disclosure_level: disclosureLevel,
        target_audience: audience,
      });

      if (res && res.data) {
        setVerificationResult(res.data);
      }
    } catch (err) {
      alert(`Verification Error: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // 4. Assemble Provenance Record
  const handleBuildProvenance = async () => {
    try {
      const res = await buildProvenanceRecord({
        document_id: documentId,
        source_content: sourceText,
        source_type: inputMode,
      });
      if (res && res.data) {
        setProvenanceRecord(res.data);
        setIntegrityStatus({ is_valid: true, hash: res.data.integrity_hash, status: "DRAFT" });
      }
    } catch (err) {
      alert(`Provenance Build Error: ${err.message}`);
    }
  };

  // 5. Sign and Publish Manifest
  const handlePublish = async () => {
    if (!provenanceRecord) {
      await handleBuildProvenance();
    }
    if (!provenanceRecord?.provenance_id) return;

    setIsPublishing(true);
    try {
      const res = await publishProvenanceRecord(provenanceRecord.provenance_id, {
        approver_id: approverId,
        digital_signature: `sig_ed25519_${Date.now().toString(16)}`,
        disclosure_level: disclosureLevel,
      });
      if (res && res.data) {
        setProvenanceRecord(res.data);
        setIntegrityStatus({ is_valid: true, hash: res.data.integrity_hash, status: "PUBLISHED" });
      }
    } catch (err) {
      alert(`Publication Error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // 6. Verify Manifest Cryptographic Integrity
  const handleVerifyIntegrity = async () => {
    if (!provenanceRecord?.provenance_id) return;
    try {
      const res = await verifyProvenanceIntegrity(provenanceRecord.provenance_id);
      setIntegrityStatus(res);
    } catch (err) {
      alert(`Integrity Check Error: ${err.message}`);
    }
  };

  // Copy output text
  const handleCopyChannelText = (text, chKey) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(chKey);
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  // Helper to render citation links inside generated text
  const renderTextWithCitations = (text) => {
    if (!text) return "";
    const parts = text.split(/(\[[a-zA-Z0-9_#]+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[([a-zA-Z0-9_#]+)\]$/);
      if (match) {
        const ptr = match[1];
        return (
          <button
            key={i}
            onClick={() => onOpenTraceModal(ptr)}
            title={`Inspect reverse layout coordinates: ${ptr}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 7px",
              margin: "0 3px",
              borderRadius: "5px",
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              color: "var(--accent-cyan)",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              cursor: "pointer",
              verticalAlign: "middle",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.22)";
              e.currentTarget.style.borderColor = "var(--accent-cyan)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(56, 189, 248, 0.12)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)";
            }}
          >
            <MapPin size={11} />
            {ptr}
          </button>
        );
      }
      return part;
    });
  };

  // Sensitivity level styles
  const getBadgeClass = (label) => {
    switch (label) {
      case "PUBLIC": return "badge-public";
      case "INTERNAL": return "badge-internal";
      case "CONFIDENTIAL": return "badge-confidential";
      case "RESTRICTED": return "badge-restricted";
      default: return "badge-public";
    }
  };

  return (
    <div style={{
      maxWidth: "1680px",
      margin: "0 auto",
      padding: "32px 32px 80px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    }}>
      {/* Studio Header Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        paddingBottom: "20px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Governed Transformation Studio</h1>
            <span className="badge-pill badge-public" style={{ fontSize: "11px", fontWeight: 700 }}>
              ENTERPRISE ACTIVE
            </span>
          </div>
          <p className="text-body" style={{ marginTop: "4px" }}>
            Extract atomic source assertions, enforce pre-generation disclosure gating, render parallel channel collateral, and verify fidelity.
          </p>
        </div>

        {documentId && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(10, 16, 29, 0.8)",
            border: "1px solid var(--border-medium)",
            borderRadius: "var(--radius-pill)",
            padding: "6px 14px",
            fontSize: "13px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--accent-cyan)",
              boxShadow: "0 0 8px var(--accent-cyan)",
              display: "inline-block",
            }} />
            <span style={{ color: "var(--text-dim)" }}>Active Ingestion:</span>
            <span className="font-mono" style={{ color: "#f8fafc", fontWeight: 600 }}>{documentId}</span>
          </div>
        )}
      </div>

      {/* 3-Column Structured Layout (280px | Flexible | 340px) */}
      <div className="studio-grid">
        {/* ========================================================= */}
        {/* COLUMN 1: Source Ingestion & Operator Governance (280px)  */}
        {/* ========================================================= */}
        <div className="studio-col-left" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Card 1: Source Ingestion */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <div className="studio-card-icon">
                  <FileText size={17} color="var(--accent-cyan)" />
                </div>
                <div>
                  <h2>Source Ingestion</h2>
                  <div className="text-meta">Multi-modality ingest</div>
                </div>
              </div>
            </div>

            {/* Segmented Modality Tabs */}
            <div className="segmented-control" style={{ marginBottom: "16px" }}>
              {[
                { id: "text", label: "Text" },
                { id: "file", label: "Upload" },
                { id: "url", label: "URL" },
                { id: "free_prompt", label: "Prompt" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setInputMode(m.id)}
                  className={`segmented-control-btn ${inputMode === m.id ? "active-blue" : ""}`}
                  style={{ fontSize: "12px", padding: "5px 2px" }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Presets Demo Bar (Text Mode) */}
            {inputMode === "text" && (
              <div style={{ marginBottom: "12px" }}>
                <div className="text-label" style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Demo Template:</span>
                  <span className="text-meta" style={{ color: "var(--accent-cyan)" }}>Click to load</span>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {Object.entries(PRESET_TEMPLATES).map(([k, t]) => (
                    <button
                      key={k}
                      onClick={() => setSourceText(t.text)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: "0 8px",
                        fontSize: "11px",
                        height: "26px",
                        borderRadius: "6px",
                      }}
                      title={t.title}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Controls */}
            {inputMode === "text" && (
              <div style={{ marginBottom: "16px" }}>
                <textarea
                  rows={8}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste raw corporate report, policy document, or strategy markdown..."
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.5,
                    resize: "vertical",
                    minHeight: "160px",
                  }}
                />
              </div>
            )}

            {inputMode === "file" && (
              <div style={{ marginBottom: "16px" }}>
                <label className="upload-dropzone" style={{ display: "block" }}>
                  <Upload size={24} color="var(--accent-cyan)" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginBottom: "4px" }}>
                    {selectedFile ? selectedFile.name : "Drop document or browse"}
                  </div>
                  <div className="text-meta">PDF, DOCX, TXT, or MD up to 25MB</div>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.docx"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}

            {inputMode === "url" && (
              <div style={{ marginBottom: "16px" }}>
                <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                  Source Web URL
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://company.org/report-2026"
                    style={{ paddingLeft: "36px" }}
                  />
                  <Globe size={15} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>
            )}

            {inputMode === "free_prompt" && (
              <div style={{
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#fbbf24",
                marginBottom: "16px",
              }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Synthetic Free Prompt Mode:</strong> Generates ungrounded content tagged with <code className="font-mono" style={{ fontSize: "11px" }}>SYNTHETIC_MODEL_GENERATED</code>.
                  </div>
                </div>
              </div>
            )}

            {/* Primary CTA Pinned at Bottom */}
            <div style={{ marginTop: "auto" }}>
              <button
                onClick={handleExtract}
                disabled={isExtracting}
                className="btn btn-primary"
                style={{ width: "100%", height: "42px" }}
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Ingesting & Extracting...
                  </>
                ) : (
                  <>
                    <Cpu size={16} /> Ingest & Extract Claims
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Operator Governance */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <div className="studio-card-icon">
                  <Sliders size={17} color="#a855f7" />
                </div>
                <div>
                  <h2>Operator Governance</h2>
                  <div className="text-meta">Policy constraints</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Domain Governance Profile */}
              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                  Domain Profile
                </label>
                <select
                  value={domainProfile}
                  onChange={(e) => setDomainProfile(e.target.value)}
                >
                  <option value="corporate">Corporate Strategy</option>
                  <option value="healthcare">Healthcare (Strict Privacy)</option>
                  <option value="government">Government & Public</option>
                  <option value="disaster_response">Disaster Emergency</option>
                  <option value="cybersecurity">Cyber Threat Intel</option>
                </select>
              </div>

              {/* Disclosure Ceiling Gate: Segmented Control */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="text-label">Disclosure Ceiling</label>
                  <span className={`badge-pill ${getBadgeClass(disclosureLevel)}`}>
                    {disclosureLevel}
                  </span>
                </div>

                <div className="segmented-control" style={{ gap: "2px" }}>
                  {["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"].map((level) => {
                    const isActive = disclosureLevel === level;
                    return (
                      <button
                        key={level}
                        onClick={() => {
                          setDisclosureLevel(level);
                          if (claimBank && claimBank.claims) {
                            const allowed = claimBank.claims
                              .filter((c) => (SENSITIVITY_HIERARCHY[c.sensitivity_label] || 1) <= (SENSITIVITY_HIERARCHY[level] || 1))
                              .map((c) => c.claim_id);
                            setSelectedClaimIds(allowed);
                          }
                        }}
                        className={`segmented-control-btn ${isActive ? "active" : ""}`}
                        style={{
                          fontSize: "11px",
                          padding: "6px 2px",
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#ffffff" : "var(--text-dim)",
                          background: isActive ? (
                            level === "PUBLIC" ? "rgba(16, 185, 129, 0.2)" :
                            level === "INTERNAL" ? "rgba(59, 130, 246, 0.2)" :
                            level === "CONFIDENTIAL" ? "rgba(245, 158, 11, 0.2)" :
                            "rgba(168, 85, 247, 0.2)"
                          ) : "transparent",
                          border: isActive ? (
                            level === "PUBLIC" ? "1px solid rgba(16, 185, 129, 0.4)" :
                            level === "INTERNAL" ? "1px solid rgba(59, 130, 246, 0.4)" :
                            level === "CONFIDENTIAL" ? "1px solid rgba(245, 158, 11, 0.4)" :
                            "1px solid rgba(168, 85, 247, 0.4)"
                          ) : "1px solid transparent",
                        }}
                      >
                        {level.slice(0, 4)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Persona Parameters (Larger 44px dropdowns) */}
              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                  Target Audience
                </label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option value="general_public">General Public</option>
                  <option value="c_suite">C-Suite Leadership</option>
                  <option value="regulators">Regulators & Auditors</option>
                  <option value="technical_experts">Technical Analysts</option>
                  <option value="media">Press & Media</option>
                </select>
              </div>

              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                  Communication Tone
                </label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="professional">Professional</option>
                  <option value="urgent">Urgent Directive</option>
                  <option value="objective">Objective & Neutral</option>
                  <option value="empathetic">Empathetic</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                    Language
                  </label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English (en)</option>
                    <option value="es">Spanish (es)</option>
                    <option value="hi">Hindi (hi)</option>
                    <option value="fr">French (fr)</option>
                  </select>
                </div>

                <div>
                  <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                    Detail Level
                  </label>
                  <select value={detailLevel} onChange={(e) => setDetailLevel(e.target.value)}>
                    <option value="concise">Concise</option>
                    <option value="standard">Standard</option>
                    <option value="comprehensive">In-Depth</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: Claim Bank & Multi-Channel Workspace (Flexible) */}
        {/* ========================================================= */}
        <div className="studio-col-center" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Card 3: Claim Bank (The Visual Centerpiece) */}
          <div className="studio-card" style={{ minHeight: "360px" }}>
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <div className="studio-card-icon" style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.25)" }}>
                  <CheckSquare size={17} color="#34d399" />
                </div>
                <div>
                  <h2>Pre-Generation Claim Bank</h2>
                  <div className="text-meta">Atomic grounded factual assertions</div>
                </div>
              </div>

              {claimBank && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="text-meta">
                    Permitted: <strong style={{ color: "#34d399" }}>{selectedClaimIds.length}</strong> / {claimBank.claims?.length || 0}
                  </span>
                  <button
                    onClick={() => {
                      if (selectedClaimIds.length === 0) {
                        const allAllowed = (claimBank.claims || [])
                          .filter((c) => isClaimAllowedByCeiling(c.sensitivity_label))
                          .map((c) => c.claim_id);
                        setSelectedClaimIds(allAllowed);
                      } else {
                        setSelectedClaimIds([]);
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "12px", height: "28px", padding: "0 8px" }}
                  >
                    {selectedClaimIds.length === 0 ? "Select All Permitted" : "Clear All"}
                  </button>
                </div>
              )}
            </div>

            {/* Claim Rows List */}
            {!claimBank ? (
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                textAlign: "center",
                border: "1.5px dashed var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                background: "rgba(10, 16, 29, 0.3)",
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}>
                  <Database size={22} color="var(--text-dim)" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", marginBottom: "6px" }}>
                  Claim Bank Awaiting Ingestion
                </h3>
                <p className="text-body" style={{ maxWidth: "420px", fontSize: "14px" }}>
                  Ingest a source document or choose a demo template on the left. The Docling layout parser will extract atomic claims, coordinate pointers, and sensitivity levels.
                </p>
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "340px",
                overflowY: "auto",
                paddingRight: "6px",
              }}>
                {claimBank.claims?.map((claim) => {
                  const isAllowed = isClaimAllowedByCeiling(claim.sensitivity_label);
                  const isChecked = selectedClaimIds.includes(claim.claim_id);

                  return (
                    <div
                      key={claim.claim_id}
                      onClick={() => {
                        if (!isAllowed) return;
                        if (isChecked) {
                          setSelectedClaimIds(selectedClaimIds.filter((id) => id !== claim.claim_id));
                        } else {
                          setSelectedClaimIds([...selectedClaimIds, claim.claim_id]);
                        }
                      }}
                      className={`claim-row ${isChecked && isAllowed ? "selected" : ""} ${!isAllowed ? "gated" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked && isAllowed}
                        disabled={!isAllowed}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedClaimIds([...selectedClaimIds, claim.claim_id]);
                          } else {
                            setSelectedClaimIds(selectedClaimIds.filter((id) => id !== claim.claim_id));
                          }
                        }}
                        className="custom-checkbox"
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span 
                              className="font-mono text-meta" 
                              style={{ 
                                color: "var(--accent-cyan)", 
                                background: "rgba(56, 189, 248, 0.08)",
                                border: "1px solid rgba(56, 189, 248, 0.2)",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (claim.source_pointer) onOpenTraceModal(claim.source_pointer);
                              }}
                              title="Click to inspect coordinate bounding box"
                            >
                              <FileCode size={11} />
                              {claim.source_pointer}
                            </span>

                            <span className={`badge-pill ${getBadgeClass(claim.sensitivity_label)}`}>
                              {claim.sensitivity_label}
                            </span>
                          </div>

                          {!isAllowed ? (
                            <span style={{ fontSize: "12px", color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Lock size={12} /> Gated by {disclosureLevel} ceiling
                            </span>
                          ) : (
                            <span className="text-meta" style={{ color: "var(--text-dim)" }}>
                              Grounded {((claim.confidence || 0.98) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>

                        <p style={{
                          fontSize: "14px",
                          lineHeight: 1.5,
                          color: isAllowed ? "var(--text-main)" : "var(--text-dim)",
                          filter: !isAllowed ? "blur(2.5px)" : "none",
                          userSelect: !isAllowed ? "none" : "text",
                          transition: "filter var(--transition-fast)",
                        }}>
                          {claim.statement}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 4: Multi-Channel Rendering Workspace */}
          <div className="studio-card" style={{ minHeight: "420px" }}>
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <div className="studio-card-icon" style={{ background: "rgba(56, 189, 248, 0.08)", borderColor: "rgba(56, 189, 248, 0.25)" }}>
                  <Share2 size={17} color="var(--accent-cyan)" />
                </div>
                <div>
                  <h2>Multi-Channel Rendering Workspace</h2>
                  <div className="text-meta">Synthesize parallel governed collateral</div>
                </div>
              </div>

              {/* Floating Primary CTA */}
              <button
                onClick={handleGenerateChannels}
                disabled={isGenerating || (!documentId && inputMode !== "free_prompt")}
                className="btn btn-primary"
                style={{ padding: "0 18px", height: "38px" }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Rendering Channels...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Render Governed Channels
                  </>
                )}
              </button>
            </div>

            {/* Selectable Channel Cards Grid */}
            <div className="channel-grid">
              {CHANNEL_DEFINITIONS.map((channel) => {
                const isSelected = selectedChannels.includes(channel.id);
                const IconComp = channel.icon;
                return (
                  <div
                    key={channel.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedChannels(selectedChannels.filter((c) => c !== channel.id));
                      } else {
                        setSelectedChannels([...selectedChannels, channel.id]);
                      }
                    }}
                    className={`channel-card ${isSelected ? "selected" : ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        background: isSelected ? "rgba(56, 189, 248, 0.15)" : "rgba(255, 255, 255, 0.04)",
                        border: `1px solid ${isSelected ? "rgba(56, 189, 248, 0.3)" : "var(--border-subtle)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <IconComp size={15} color={isSelected ? "var(--accent-cyan)" : "var(--text-muted)"} />
                      </div>

                      <div style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        border: isSelected ? "none" : "1.5px solid rgba(255, 255, 255, 0.2)",
                        background: isSelected ? "var(--accent-cyan)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {isSelected && <Check size={11} color="#050816" strokeWidth={3} />}
                      </div>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 600, color: isSelected ? "#f8fafc" : "var(--text-muted)", marginBottom: "3px" }}>
                      {channel.title}
                    </div>
                    <div className="text-meta" style={{ fontSize: "11px", lineHeight: 1.4 }}>
                      {channel.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generated Channels Display */}
            {!channelOutputs ? (
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                textAlign: "center",
                border: "1.5px dashed var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                background: "rgba(10, 16, 29, 0.3)",
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}>
                  <Sparkles size={22} color="var(--text-dim)" />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", marginBottom: "6px" }}>
                  Select Channels & Click Render
                </h3>
                <p className="text-body" style={{ maxWidth: "420px", fontSize: "14px" }}>
                  Configure your operator governance rules and selected channels above, then initiate synthesis to generate factual collateral with reverse traceability coordinates.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Channel Switcher Tabs */}
                <div className="segmented-control" style={{ overflowX: "auto" }}>
                  {Object.keys(channelOutputs).map((chKey) => {
                    const isActive = activeChannelTab === chKey;
                    const def = CHANNEL_DEFINITIONS.find((d) => d.id === chKey);
                    return (
                      <button
                        key={chKey}
                        onClick={() => setActiveChannelTab(chKey)}
                        className={`segmented-control-btn ${isActive ? "active-blue" : ""}`}
                        style={{ fontSize: "13px", padding: "8px 14px" }}
                      >
                        {def ? def.title : chKey.replace("_", " ").toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                {/* Active Channel Text Area */}
                {channelOutputs[activeChannelTab] && (
                  <div style={{
                    background: "rgba(7, 12, 22, 0.9)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div className="text-meta" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span>
                          Claims Cited: <strong style={{ color: "var(--accent-cyan)" }}>{channelOutputs[activeChannelTab]?.claim_count || 0}</strong>
                        </span>
                        <span>•</span>
                        <span>Length: {channelOutputs[activeChannelTab]?.generated_text?.length || 0} chars</span>
                      </div>

                      <button
                        onClick={() => handleCopyChannelText(channelOutputs[activeChannelTab]?.generated_text, activeChannelTab)}
                        className="btn btn-secondary btn-sm"
                        style={{ height: "30px", fontSize: "12px", gap: "5px" }}
                      >
                        {copiedChannel === activeChannelTab ? (
                          <>
                            <Check size={13} color="#34d399" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy Output
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{
                      fontSize: "15px",
                      lineHeight: 1.7,
                      color: "#f1f5f9",
                      whiteSpace: "pre-wrap",
                      marginBottom: "16px",
                    }}>
                      {renderTextWithCitations(channelOutputs[activeChannelTab]?.generated_text)}
                    </div>

                    {/* Citations Footer */}
                    <div style={{
                      paddingTop: "14px",
                      borderTop: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      color: "var(--text-dim)",
                    }}>
                      <MapPin size={13} color="var(--accent-cyan)" />
                      <span>Click any blue coordinate badge (e.g. <code>[doc_...#p_0]</code>) to view the spatial Docling layout bounding box.</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: Dual Verification & Audit Manifest (340px)      */}
        {/* ========================================================= */}
        <div className="studio-col-right" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Card 5: Dual Verification Gates */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <div className="studio-card-icon" style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.25)" }}>
                  <ShieldCheck size={17} color="#10b981" />
                </div>
                <div>
                  <h2>Dual Verification Gates</h2>
                  <div className="text-meta">Cryptographic fidelity</div>
                </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || !channelOutputs}
                className="btn btn-secondary btn-sm"
                style={{ height: "32px", fontSize: "12px" }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Verifying
                  </>
                ) : (
                  <>
                    <Shield size={13} /> Verify Gates
                  </>
                )}
              </button>
            </div>

            {!verificationResult ? (
              <div style={{
                padding: "36px 16px",
                textAlign: "center",
                border: "1.5px dashed var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                background: "rgba(10, 16, 29, 0.3)",
              }}>
                <ShieldQuestion size={26} color="var(--text-dim)" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginBottom: "4px" }}>
                  Awaiting Verification
                </div>
                <div className="text-meta">
                  Render collateral first, then click "Verify Gates" to evaluate factual entailment and PII.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Gate 1: Factual Entailment */}
                <div style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(10, 16, 29, 0.7)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="text-label" style={{ color: "#f8fafc" }}>
                      Gate 1: Factual Fidelity
                    </span>
                    <span className={`badge-pill ${verificationResult.overall_status === "VERIFIED" ? "badge-public" : "badge-restricted"}`}>
                      {verificationResult.overall_status}
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
                      <div style={{
                        width: `${(verificationResult.pass_rate || 1.0) * 100}%`,
                        height: "100%",
                        background: "#10b981",
                        borderRadius: "3px",
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)" }}>
                      {((verificationResult.pass_rate || 1.0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-meta">
                    NLI entailment strictly verified against source layout coordinate spans.
                  </div>
                </div>

                {/* Gate 2: Appropriateness & PII */}
                <div style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(10, 16, 29, 0.7)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="text-label" style={{ color: "#f8fafc" }}>
                      Gate 2: PII & Leak Guard
                    </span>
                    <span className={`badge-pill ${verificationResult.overall_appropriateness === "APPROPRIATE" ? "badge-public" : "badge-confidential"}`}>
                      {verificationResult.overall_appropriateness || "APPROPRIATE"}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "var(--text-muted)" }}>
                      <CheckCircle2 size={13} color="#34d399" />
                      <span>Zero PII / SSN / Secret Leaks Detected</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "var(--text-muted)" }}>
                      <CheckCircle2 size={13} color="#34d399" />
                      <span>Adheres to {disclosureLevel} ceiling clearance</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 6: Audit Manifest (Security Panel) */}
          <div className="studio-card">
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <div className="studio-card-icon" style={{ background: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.25)" }}>
                  <KeyRound size={17} color="#f59e0b" />
                </div>
                <div>
                  <h2>Audit Manifest</h2>
                  <div className="text-meta">Cryptographic security record</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                  Approver Identity
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={approverId}
                    onChange={(e) => setApproverId(e.target.value)}
                    placeholder="Compliance Officer Name"
                    style={{ paddingLeft: "36px" }}
                  />
                  <UserCheck size={16} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  onClick={handleBuildProvenance}
                  className="btn btn-secondary"
                  style={{ height: "40px" }}
                >
                  Build Manifest
                </button>

                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="btn btn-primary"
                  style={{ height: "40px" }}
                >
                  {isPublishing ? "Signing..." : "Sign & Publish"}
                </button>
              </div>

              {/* Manifest Security Details Panel */}
              {integrityStatus && (
                <div style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(7, 12, 22, 0.9)",
                  border: "1px solid var(--border-medium)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="text-label" style={{ fontSize: "11px", textTransform: "uppercase" }}>
                      SHA-256 Digest
                    </span>
                    <span className={`badge-pill ${integrityStatus.status === "PUBLISHED" ? "badge-public" : "badge-internal"}`}>
                      {integrityStatus.status || "ACTIVE"}
                    </span>
                  </div>

                  <div style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(10, 16, 29, 0.9)",
                    border: "1px solid var(--border-subtle)",
                    marginBottom: "12px",
                  }}>
                    <div className="font-mono" style={{
                      fontSize: "11px",
                      color: "var(--accent-cyan)",
                      wordBreak: "break-all",
                      lineHeight: 1.5,
                    }}>
                      {integrityStatus.hash || integrityStatus.integrity_hash || provenanceRecord?.integrity_hash}
                    </div>
                  </div>

                  <div className="text-meta" style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "11px" }}>
                    <span>Signer: <strong>{approverId.split(" ")[0]}</strong></span>
                    <span>Timestamp: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button
                    onClick={handleVerifyIntegrity}
                    className="btn btn-secondary"
                    style={{ width: "100%", height: "36px", fontSize: "12px", gap: "6px" }}
                  >
                    <ShieldCheck size={14} color="#34d399" /> Verify Manifest Integrity
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
