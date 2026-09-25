import React, { useState, useEffect } from "react";
import { 
  FileText, Upload, Globe, Cpu, Sliders, Shield, ShieldCheck, 
  Share2, KeyRound, CheckCircle2, AlertTriangle, Eye, Lock, 
  Sparkles, RefreshCw, Copy, Check, ArrowRight, CornerDownRight, 
  MapPin, ShieldAlert, Award, FileCode, CheckSquare
} from "lucide-react";
import { 
  extractContent, getClaimBank, generateChannels, 
  verifyContent, buildProvenanceRecord, publishProvenanceRecord, 
  verifyProvenanceIntegrity 
} from "../services/api";

const PRESET_TEMPLATES = {
  energy: {
    title: "Clean Energy & Strategy Report",
    text: `# Clean Energy Strategy & Financial Report 2026

Global clean energy investments expanded by 35% in 2025 reaching 400 GW capacity across solar and wind installations. Municipal infrastructure grants accounted for 45 million dollars in capital deployment.

CONFIDENTIAL: Project Titan internal reserve is capped at $12M under executive authorization code TITAN-SEC-9988. Unauthorized dissemination is strictly prohibited under non-disclosure terms.`
  },
  infrastructure: {
    title: "Municipal Infrastructure & Transit Budget",
    text: `# Municipal Infrastructure and Public Transit Directive 2026

The metropolitan transit authority approved 85 million dollars for zero-emission bus fleet electrification across 12 urban districts. Public fare subsidies will remain unchanged throughout fiscal year 2026.

INTERNAL: Transit employee union negotiations regarding shift differential wages are scheduled for Q3 review.`
  },
  cybersecurity: {
    title: "Critical Infrastructure Threat Advisory",
    text: `# Threat Intelligence Advisory: Sector Grid Resilience

National cyber defense centers observed a 40% increase in distributed scanning against industrial control systems in Q1 2026. Zero active intrusions were recorded in monitored substations.

RESTRICTED: Sensor firmware vulnerability CVE-2026-9912 remediation patches must be deployed to air-gapped relays immediately.`
  }
};

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

  // Helper for disclosure hierarchy comparison
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
        // Automatically fetch or build atomic claim bank
        const bank = await getClaimBank(res.document_id);
        setClaimBank(bank);
        if (bank && bank.claims) {
          // Select all claims that meet initial disclosure ceiling
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
      // Gather claims from current active channel output
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
        setIntegrityStatus({ is_valid: true, hash: res.data.integrity_hash });
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
            title={`Click to trace source layout: ${ptr}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "1px 6px",
              margin: "0 2px",
              borderRadius: "4px",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              color: "var(--accent-cyan)",
              fontSize: "0.78rem",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              cursor: "pointer",
              verticalAlign: "middle",
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

  return (
    <div style={{ maxWidth: "1520px", margin: "0 auto", padding: "24px 20px 80px" }}>
      {/* Workspace Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div>
          <h1 style={{ fontSize: "1.8rem" }}>Studio Governance Workspace</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Execute multi-source ingestion, atomic claim gating, parallel multi-channel rendering, and cryptographic verification.
          </p>
        </div>

        {/* Quick Document ID pill if loaded */}
        {documentId && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "0.82rem",
            color: "var(--accent-cyan)",
          }}>
            <FileText size={14} />
            Active Ingestion: <span className="font-mono">{documentId}</span>
          </div>
        )}
      </div>

      {/* 3-Column Studio Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr 420px",
        gap: "24px",
        alignItems: "start",
      }}>
        {/* ========================================================= */}
        {/* COLUMN 1: Source Ingestion & Operator Configuration */}
        {/* ========================================================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Source Ingestion Panel */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <FileText size={18} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: "1.1rem" }}>1. Source Ingestion</h2>
            </div>

            {/* Input Modality Tabs */}
            <div style={{
              display: "flex",
              gap: "4px",
              background: "rgba(10, 16, 29, 0.8)",
              padding: "4px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}>
              {[
                { id: "text", label: "Text / MD" },
                { id: "file", label: "File Upload" },
                { id: "url", label: "Web URL" },
                { id: "free_prompt", label: "Free Prompt" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setInputMode(m.id)}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    borderRadius: "6px",
                    border: "none",
                    background: inputMode === m.id ? "rgba(56, 189, 248, 0.2)" : "transparent",
                    color: inputMode === m.id ? "var(--accent-cyan)" : "var(--text-dim)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Presets Bar */}
            {inputMode === "text" && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "6px" }}>
                  Load Demo Template:
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {Object.entries(PRESET_TEMPLATES).map(([k, t]) => (
                    <button
                      key={k}
                      onClick={() => setSourceText(t.text)}
                      style={{
                        fontSize: "0.72rem",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-subtle)",
                        background: "rgba(255, 255, 255, 0.03)",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      {t.title.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Controls */}
            {inputMode === "text" && (
              <textarea
                rows={9}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter raw report, strategy document, or policy markdown..."
                style={{ width: "100%", resize: "vertical", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "14px" }}
              />
            )}

            {inputMode === "file" && (
              <div style={{
                border: "2px dashed var(--border-subtle)",
                borderRadius: "10px",
                padding: "24px 16px",
                textAlign: "center",
                marginBottom: "14px",
              }}>
                <Upload size={24} color="var(--accent-cyan)" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  {selectedFile ? selectedFile.name : "Select Document (PDF, TXT, MD)"}
                </div>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "6px" }}
                />
              </div>
            )}

            {inputMode === "url" && (
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/report"
                style={{ width: "100%", marginBottom: "14px" }}
              />
            )}

            {inputMode === "free_prompt" && (
              <div style={{
                padding: "14px",
                borderRadius: "8px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                fontSize: "0.82rem",
                color: "#fbbf24",
                marginBottom: "14px",
              }}>
                <AlertTriangle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                Free Prompt Mode activates ungrounded synthetic text generation tagged with <code>SYNTHETIC_MODEL_GENERATED</code>.
              </div>
            )}

            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {isExtracting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Extracting Layout & Claims...
                </>
              ) : (
                <>
                  <Cpu size={16} /> Ingest & Extract Claim Bank
                </>
              )}
            </button>
          </div>

          {/* Operator Governance Controls */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Sliders size={18} color="#a855f7" />
              <h2 style={{ fontSize: "1.1rem" }}>2. Operator Governance</h2>
            </div>

            {/* Domain Profiles */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                Domain Governance Profile
              </label>
              <select
                value={domainProfile}
                onChange={(e) => setDomainProfile(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="corporate">Corporate Strategy & Governance</option>
                <option value="healthcare">Healthcare & Clinical (Strict Privacy)</option>
                <option value="government">Government & Citizen Accessibility</option>
                <option value="disaster_response">Disaster & Emergency Directives</option>
                <option value="cybersecurity">Cybersecurity Threat Intelligence</option>
              </select>
            </div>

            {/* Disclosure Ceiling Slider / Radio */}
            <div style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" }}>
                  Disclosure Ceiling Gate
                </label>
                <span className={`badge badge-${disclosureLevel.toLowerCase()}`}>
                  {disclosureLevel}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
                {["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setDisclosureLevel(level);
                      if (claimBank && claimBank.claims) {
                        const h = { PUBLIC: 1, INTERNAL: 2, CONFIDENTIAL: 3, RESTRICTED: 4 };
                        const allowed = claimBank.claims
                          .filter((c) => (h[c.sensitivity_label] || 1) <= (h[level] || 1))
                          .map((c) => c.claim_id);
                        setSelectedClaimIds(allowed);
                      }
                    }}
                    style={{
                      padding: "6px 2px",
                      borderRadius: "6px",
                      border: disclosureLevel === level ? "1px solid var(--accent-cyan)" : "1px solid var(--border-subtle)",
                      background: disclosureLevel === level ? "rgba(56, 189, 248, 0.2)" : "rgba(10, 16, 29, 0.6)",
                      color: disclosureLevel === level ? "#ffffff" : "var(--text-dim)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {level.slice(0, 4)}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Parameters Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                  Audience
                </label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ width: "100%", fontSize: "0.8rem" }}>
                  <option value="general_public">General Public</option>
                  <option value="c_suite">C-Suite Leadership</option>
                  <option value="regulators">Regulators & Auditors</option>
                  <option value="technical_experts">Technical Analysts</option>
                  <option value="media">Press & Media</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                  Tone
                </label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ width: "100%", fontSize: "0.8rem" }}>
                  <option value="professional">Professional</option>
                  <option value="urgent">Urgent Directive</option>
                  <option value="objective">Objective & Neutral</option>
                  <option value="empathetic">Empathetic</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                  Language
                </label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: "100%", fontSize: "0.8rem" }}>
                  <option value="en">English (en)</option>
                  <option value="es">Spanish (es)</option>
                  <option value="hi">Hindi (hi)</option>
                  <option value="fr">French (fr)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                  Detail Level
                </label>
                <select value={detailLevel} onChange={(e) => setDetailLevel(e.target.value)} style={{ width: "100%", fontSize: "0.8rem" }}>
                  <option value="concise">Concise</option>
                  <option value="standard">Standard</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: Atomic Claim Bank & Parallel Multi-Channel */}
        {/* ========================================================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Atomic Claim Bank Viewer */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckSquare size={18} color="#34d399" />
                <h2 style={{ fontSize: "1.1rem" }}>Pre-Generation Claim Bank</h2>
              </div>

              {claimBank && (
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Permitted: <strong style={{ color: "#34d399" }}>{selectedClaimIds.length}</strong> / {claimBank.claims?.length || 0} claims
                </div>
              )}
            </div>

            {!claimBank ? (
              <div style={{
                padding: "36px",
                textAlign: "center",
                color: "var(--text-dim)",
                border: "1px dashed var(--border-subtle)",
                borderRadius: "10px",
                fontSize: "0.88rem",
              }}>
                Ingest a source document on the left to extract atomic source assertions.
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "260px",
                overflowY: "auto",
                paddingRight: "6px",
              }}>
                {claimBank.claims?.map((claim) => {
                  const isAllowed = isClaimAllowedByCeiling(claim.sensitivity_label);
                  const isChecked = selectedClaimIds.includes(claim.claim_id);

                  return (
                    <div
                      key={claim.claim_id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: isAllowed ? "rgba(15, 23, 42, 0.7)" : "rgba(30, 15, 15, 0.7)",
                        border: `1px solid ${isAllowed ? "var(--border-subtle)" : "rgba(239, 68, 68, 0.3)"}`,
                        opacity: isAllowed ? 1 : 0.6,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked && isAllowed}
                        disabled={!isAllowed}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClaimIds([...selectedClaimIds, claim.claim_id]);
                          } else {
                            setSelectedClaimIds(selectedClaimIds.filter((id) => id !== claim.claim_id));
                          }
                        }}
                        style={{ marginTop: "3px" }}
                      />

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span className="font-mono" style={{ fontSize: "0.72rem", color: "var(--accent-cyan)" }}>
                            {claim.source_pointer}
                          </span>
                          <span className={`badge badge-${claim.sensitivity_label.toLowerCase()}`}>
                            {claim.sensitivity_label}
                          </span>
                          {!isAllowed && (
                            <span style={{ fontSize: "0.7rem", color: "#f87171", display: "flex", alignItems: "center", gap: "2px" }}>
                              <Lock size={10} /> Gated by {disclosureLevel} ceiling
                            </span>
                          )}
                        </div>

                        <p style={{
                          fontSize: "0.82rem",
                          lineHeight: 1.4,
                          color: isAllowed ? "var(--text-main)" : "var(--text-dim)",
                          textDecoration: isAllowed ? "none" : "line-through",
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

          {/* Parallel Multi-Channel Output Generator */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Share2 size={18} color="#ec4899" />
                <h2 style={{ fontSize: "1.1rem" }}>Parallel Multi-Channel Rendering</h2>
              </div>

              <button
                onClick={handleGenerateChannels}
                disabled={isGenerating || (!documentId && inputMode !== "free_prompt")}
                className="btn btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.85rem" }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Rendering...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Render Governed Channels
                  </>
                )}
              </button>
            </div>

            {/* Channel Selection Checkboxes */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              paddingBottom: "14px",
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: "16px",
            }}>
              {[
                { id: "executive_summary", label: "Executive Summary" },
                { id: "linkedin_post", label: "LinkedIn Post" },
                { id: "twitter_thread", label: "Twitter / X Thread" },
                { id: "advisory", label: "Advisory Directive" },
                { id: "infographic_brief", label: "Infographic Brief" },
                { id: "presentation_outline", label: "Presentation Deck" },
              ].map((ch) => {
                const active = selectedChannels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      if (active) {
                        setSelectedChannels(selectedChannels.filter((c) => c !== ch.id));
                      } else {
                        setSelectedChannels([...selectedChannels, ch.id]);
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      border: active ? "1px solid #ec4899" : "1px solid var(--border-subtle)",
                      background: active ? "rgba(236, 72, 153, 0.15)" : "rgba(10, 16, 29, 0.6)",
                      color: active ? "#f472b6" : "var(--text-muted)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>

            {/* Channel Rendered Display */}
            {!channelOutputs ? (
              <div style={{
                padding: "50px 20px",
                textAlign: "center",
                color: "var(--text-dim)",
                border: "1px dashed var(--border-subtle)",
                borderRadius: "10px",
                fontSize: "0.88rem",
              }}>
                Select your target channels and click "Render Governed Channels" to synthesize.
              </div>
            ) : (
              <div>
                {/* Channel Tabs */}
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "14px" }}>
                  {Object.keys(channelOutputs).map((chKey) => (
                    <button
                      key={chKey}
                      onClick={() => setActiveChannelTab(chKey)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: activeChannelTab === chKey ? "1px solid var(--accent-cyan)" : "1px solid transparent",
                        background: activeChannelTab === chKey ? "rgba(56, 189, 248, 0.15)" : "rgba(15, 23, 42, 0.6)",
                        color: activeChannelTab === chKey ? "var(--accent-cyan)" : "var(--text-muted)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chKey.replace("_", " ").toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Active Channel Text Area */}
                {channelOutputs[activeChannelTab] && (
                  <div style={{
                    background: "rgba(10, 15, 26, 0.85)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "18px",
                    position: "relative",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                        Claims Cited: <strong>{channelOutputs[activeChannelTab]?.claim_count || 0}</strong> | Length: {channelOutputs[activeChannelTab]?.generated_text?.length || 0} chars
                      </div>

                      <button
                        onClick={() => handleCopyChannelText(channelOutputs[activeChannelTab]?.generated_text, activeChannelTab)}
                        className="btn btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                      >
                        {copiedChannel === activeChannelTab ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                        {copiedChannel === activeChannelTab ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div style={{
                      fontSize: "0.92rem",
                      lineHeight: 1.7,
                      color: "#e2e8f0",
                      whiteSpace: "pre-wrap",
                      marginBottom: "16px",
                    }}>
                      {renderTextWithCitations(channelOutputs[activeChannelTab]?.generated_text)}
                    </div>

                    {/* Citations Footer */}
                    <div style={{
                      paddingTop: "12px",
                      borderTop: "1px solid var(--border-subtle)",
                      fontSize: "0.78rem",
                      color: "var(--text-dim)",
                    }}>
                      💡 <em>Click any citation badge above (e.g. <code>[doc_...#p_0]</code>) to verify reverse layout coordinates.</em>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: Dual Verification Gates & Provenance Manifest */}
        {/* ========================================================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Dual Verification Gates Dashboard */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#10b981" />
                <h2 style={{ fontSize: "1.1rem" }}>Dual Verification Gates</h2>
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || !channelOutputs}
                className="btn btn-success"
                style={{ padding: "6px 14px", fontSize: "0.8rem" }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Shield size={12} /> Verify Gates
                  </>
                )}
              </button>
            </div>

            {!verificationResult ? (
              <div style={{
                padding: "24px 16px",
                textAlign: "center",
                color: "var(--text-dim)",
                border: "1px dashed var(--border-subtle)",
                borderRadius: "10px",
                fontSize: "0.82rem",
              }}>
                Generate content and click "Verify Gates" to check fidelity and appropriateness.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Gate 1: Fidelity Card */}
                <div style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" }}>
                      Gate 1: Factual Fidelity
                    </span>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      background: verificationResult.overall_status === "VERIFIED" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      color: verificationResult.overall_status === "VERIFIED" ? "#34d399" : "#f87171",
                    }}>
                      {verificationResult.overall_status}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div style={{
                        width: `${(verificationResult.pass_rate || 1.0) * 100}%`,
                        height: "100%",
                        background: "#10b981",
                      }} />
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#34d399" }}>
                      {((verificationResult.pass_rate || 1.0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                    NLI Entailment strictly verified against source mapping spans.
                  </div>
                </div>

                {/* Gate 2: Appropriateness Card */}
                <div style={{
                  padding: "14px",
                  borderRadius: "10px",
                  background: "rgba(15, 23, 42, 0.7)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)" }}>
                      Gate 2: Appropriateness & PII
                    </span>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      background: verificationResult.overall_appropriateness === "APPROPRIATE" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: verificationResult.overall_appropriateness === "APPROPRIATE" ? "#34d399" : "#fbbf24",
                    }}>
                      {verificationResult.overall_appropriateness || "APPROPRIATE"}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>
                    Scanned for Aadhaar, SSN, API secrets, and disclosure ceiling adherence.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Provenance & Sign & Publish Workflow */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <KeyRound size={18} color="#f59e0b" />
              <h2 style={{ fontSize: "1.1rem" }}>Sign & Publish Audit Manifest</h2>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                Approver Identity
              </label>
              <input
                type="text"
                value={approverId}
                onChange={(e) => setApproverId(e.target.value)}
                placeholder="Compliance Officer Name"
                style={{ width: "100%", fontSize: "0.82rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button
                onClick={handleBuildProvenance}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "8px 10px", fontSize: "0.8rem" }}
              >
                Build Manifest
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="btn btn-primary"
                style={{ flex: 1, padding: "8px 10px", fontSize: "0.8rem" }}
              >
                {isPublishing ? "Signing..." : "Sign & Publish"}
              </button>
            </div>

            {/* Manifest Integrity Box */}
            {integrityStatus && (
              <div style={{
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(10, 16, 29, 0.9)",
                border: "1px solid var(--border-subtle)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "uppercase" }}>
                    SHA-256 Manifest Hash
                  </span>
                  <span className={`badge badge-${integrityStatus.status === "PUBLISHED" ? "public" : "internal"}`}>
                    {integrityStatus.status || "ACTIVE"}
                  </span>
                </div>

                <div className="font-mono" style={{
                  fontSize: "0.72rem",
                  color: "var(--accent-cyan)",
                  wordBreak: "break-all",
                  marginBottom: "12px",
                }}>
                  {integrityStatus.hash || integrityStatus.integrity_hash || provenanceRecord?.integrity_hash}
                </div>

                <button
                  onClick={handleVerifyIntegrity}
                  className="btn btn-outline-cyan"
                  style={{ width: "100%", padding: "6px", fontSize: "0.75rem" }}
                >
                  <ShieldCheck size={14} /> Verify Cryptographic Integrity
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
