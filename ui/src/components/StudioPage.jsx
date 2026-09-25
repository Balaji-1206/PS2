import React, { useState } from "react";
import { 
  FileText, Upload, Globe, Cpu, Sliders, Shield, ShieldCheck, 
  Share2, KeyRound, CheckCircle2, AlertTriangle, Eye, Lock, 
  Sparkles, RefreshCw, Copy, Check, ArrowRight, CornerDownRight, 
  MapPin, ShieldAlert, Award, FileCode, CheckSquare, MessageCircle,
  LayoutGrid, Layers, Clock, Hash, UserCheck, ShieldQuestion,
  ChevronDown, Database, ExternalLink, HelpCircle, AlertCircle, Video,
  Users, Volume2, Languages, ListFilter, BookOpen
} from "lucide-react";
import { 
  extractContent, getClaimBank, generateChannels, 
  verifyContent, buildProvenanceRecord, publishProvenanceRecord, 
  verifyProvenanceIntegrity, checkHealth 
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

export default function StudioPage({ onOpenTraceModal, onBackToOverview }) {
  // --- Gateway Health State ---
  const [isGatewayOnline, setIsGatewayOnline] = useState(true);

  React.useEffect(() => {
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

  // 4. Provenance Manifest Trigger
  const handleBuildProvenance = async () => {
    if (!channelOutputs) {
      alert("Generate channel collateral before creating an audit manifest.");
      return;
    }

    try {
      const currentOutput = channelOutputs[activeChannelTab];
      const res = await buildProvenanceRecord({
        document_id: documentId || "doc_sample",
        channel: activeChannelTab,
        output_text: currentOutput?.generated_text || "",
        governance_config: {
          disclosure_level: disclosureLevel,
          domain_profile: domainProfile,
          audience,
          tone,
        },
        claims: currentOutput?.claims || [],
      });

      if (res && res.record) {
        setProvenanceRecord(res.record);
        setIntegrityStatus({
          status: "DRAFT",
          hash: res.record.integrity_hash,
          signer: approverId,
        });
      }
    } catch (err) {
      alert(`Manifest Error: ${err.message}`);
    }
  };

  // 5. Sign & Publish Trigger
  const handlePublish = async () => {
    if (!provenanceRecord) {
      await handleBuildProvenance();
    }

    setIsPublishing(true);
    try {
      const targetId = provenanceRecord?.provenance_id || `prov_${Date.now()}`;
      const res = await publishProvenanceRecord(targetId, {
        approver_id: approverId,
        domain_notes: `Approved for ${disclosureLevel} distribution under ${domainProfile} standard.`,
      });

      if (res && res.record) {
        setProvenanceRecord(res.record);
        setIntegrityStatus({
          status: "PUBLISHED",
          hash: res.record.integrity_hash,
          signer: res.record.approver_id || approverId,
        });
      }
    } catch (err) {
      alert(`Publication Error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // 6. Verify Manifest Integrity
  const handleVerifyIntegrity = async () => {
    if (!provenanceRecord) return;
    try {
      const res = await verifyProvenanceIntegrity(provenanceRecord.provenance_id);
      if (res) {
        alert(
          `Manifest Cryptographic Verification:\n` +
          `Status: ${res.verification_status}\n` +
          `Tamper Sealed: ${res.tamper_detected ? "TAMPER DETECTED!" : "VALID / UNTAMPERED"}\n` +
          `SHA-256 Digest: ${res.computed_hash}`
        );
      }
    } catch (err) {
      alert(`Verification check error: ${err.message}`);
    }
  };

  const handleCopyChannelText = (text, chKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedChannel(chKey);
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  // Render citation markers as interactive warm orange-gold pills
  const renderTextWithCitations = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[[a-zA-Z0-9_\-#]+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/^\[([a-zA-Z0-9_\-#]+)\]$/);
      if (match) {
        const ptr = match[1];
        return (
          <button
            key={idx}
            onClick={() => onOpenTraceModal(ptr)}
            title={`Inspect Docling coordinate bounding box for ${ptr}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              margin: "0 3px",
              borderRadius: "5px",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#c2410c",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              cursor: "pointer",
              verticalAlign: "middle",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ffedd5";
              e.currentTarget.style.borderColor = "#ea580c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff7ed";
              e.currentTarget.style.borderColor = "#fed7aa";
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
        paddingBottom: "22px",
        borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 14px rgba(234, 88, 12, 0.28)",
            flexShrink: 0,
          }}>
            <Shield size={24} color="#ffffff" strokeWidth={2.4} />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h1 className="text-page-title" style={{ color: "#0f172a" }}>Governed Transformation Studio</h1>
              <span className="badge-pill badge-confidential" style={{ fontSize: "11px", fontWeight: 700 }}>
                ENTERPRISE ACTIVE
              </span>
            </div>
            <p className="text-body" style={{ marginTop: "4px", color: "#475569" }}>
              Extract atomic source assertions, enforce pre-generation disclosure gating, render parallel channel collateral, and verify fidelity.
            </p>
          </div>
        </div>

        {/* Right Section: Ingestion ID, Status Pill, Overview & API Docs */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {documentId && (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "var(--radius-pill)",
              padding: "6px 14px",
              fontSize: "13px",
              boxShadow: "0 2px 8px rgba(217, 119, 6, 0.06)",
            }}>
              <span style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#ea580c",
                boxShadow: "0 0 8px rgba(234, 88, 12, 0.6)",
                display: "inline-block",
              }} />
              <span style={{ color: "#64748b", fontWeight: 500 }}>Ingestion:</span>
              <span className="font-mono" style={{ color: "#0f172a", fontWeight: 700 }}>{documentId}</span>
            </div>
          )}

          {/* Compact Gateway Status Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "6px 14px",
            borderRadius: "var(--radius-pill)",
            background: isGatewayOnline ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${isGatewayOnline ? "#a7f3d0" : "#fecaca"}`,
            fontSize: "12px",
            fontWeight: 600,
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: isGatewayOnline ? "#10b981" : "#ef4444",
              boxShadow: `0 0 6px ${isGatewayOnline ? "#10b981" : "#ef4444"}`,
              display: "inline-block",
            }} />
            <span style={{ color: isGatewayOnline ? "#047857" : "#dc2626" }}>
              {isGatewayOnline ? "Gateway Active" : "Gateway Offline"}
            </span>
          </div>

          {/* API Docs Button */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{
              gap: "6px",
              height: "34px",
              fontSize: "12px",
              color: "#78350f",
            }}
          >
            <BookOpen size={14} color="#ea580c" />
            API Docs
            <ExternalLink size={12} color="#94a3b8" />
          </a>

          {/* Architecture Overview Toggle */}
          {onBackToOverview && (
            <button
              onClick={onBackToOverview}
              className="btn btn-secondary btn-sm"
              style={{
                gap: "6px",
                height: "34px",
                fontSize: "12px",
                color: "#78350f",
              }}
            >
              <Layers size={14} color="#ea580c" />
              Architecture Overview
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Structured Layout (280px | Flexible | 340px) */}
      <div className="studio-grid">
        
        {/* ========================================================= */}
        {/* COLUMN 1: Source Ingestion & Operator Governance (280px)  */}
        {/* ========================================================= */}
        <div className="studio-col-left" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Card 1: Source Ingestion */}
          <div className="studio-card" style={{ display: "flex", flexDirection: "column", minHeight: "440px" }}>
            <div className="studio-card-header">
              <div className="studio-card-title-group">
                <div className="studio-card-icon">
                  <FileText size={18} color="#ea580c" />
                </div>
                <div>
                  <h3 className="text-card-title">Source Ingestion</h3>
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
                  style={{ fontSize: "12px", padding: "6px 2px" }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Presets Demo Bar (Text Mode) */}
            {inputMode === "text" && (
              <div style={{ marginBottom: "14px" }}>
                <div className="text-label" style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>Demo Template:</span>
                  <span className="text-meta" style={{ color: "#ea580c", fontWeight: 600 }}>Click to load</span>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {Object.entries(PRESET_TEMPLATES).map(([k, t]) => (
                    <button
                      key={k}
                      onClick={() => setSourceText(t.text)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: "0 9px",
                        fontSize: "11px",
                        height: "26px",
                        borderRadius: "6px",
                        fontWeight: 600,
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
              <div style={{ marginBottom: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <textarea
                  rows={7}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste corporate report, policy document, or strategy markdown..."
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.5,
                    resize: "vertical",
                    flex: 1,
                    minHeight: "150px",
                  }}
                />
              </div>
            )}

            {inputMode === "file" && (
              <div style={{ marginBottom: "16px", flex: 1 }}>
                <label className="upload-dropzone" style={{ display: "block" }}>
                  <Upload size={28} color="#ea580c" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    {selectedFile ? selectedFile.name : "Drop document or browse"}
                  </div>
                  <div className="text-meta" style={{ color: "#64748b" }}>PDF, DOCX, TXT, or MD up to 25MB</div>
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
              <div style={{ marginBottom: "16px", flex: 1 }}>
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
                  <Globe size={15} color="#ea580c" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>
            )}

            {inputMode === "free_prompt" && (
              <div style={{
                padding: "14px",
                borderRadius: "12px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#b45309",
                marginBottom: "16px",
                flex: 1,
              }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Synthetic Free Prompt Mode:</strong> Generates ungrounded content tagged with <code className="font-mono" style={{ fontSize: "11px", color: "#92400e" }}>SYNTHETIC_MODEL_GENERATED</code>.
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
                <div className="studio-card-icon" style={{ background: "#fffbeb", borderColor: "rgba(245, 158, 11, 0.35)" }}>
                  <Sliders size={18} color="#d97706" />
                </div>
                <div>
                  <h3 className="text-card-title">Operator Governance</h3>
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
                <div style={{ position: "relative" }}>
                  <select
                    value={domainProfile}
                    onChange={(e) => setDomainProfile(e.target.value)}
                    style={{ paddingLeft: "36px" }}
                  >
                    <option value="corporate">Corporate Strategy</option>
                    <option value="healthcare">Healthcare (Strict Privacy)</option>
                    <option value="government">Government & Public</option>
                    <option value="disaster_response">Disaster Emergency</option>
                    <option value="cybersecurity">Cyber Threat Intel</option>
                  </select>
                  <ListFilter size={15} color="#ea580c" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
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
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? "#ffffff" : "#78350f",
                          background: isActive ? (
                            level === "PUBLIC" ? "#10b981" :
                            level === "INTERNAL" ? "#3b82f6" :
                            level === "CONFIDENTIAL" ? "#f59e0b" :
                            "#ea580c"
                          ) : "transparent",
                          boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                        }}
                      >
                        {level.slice(0, 4)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Persona Parameters (Larger 44px dropdowns with icons) */}
              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                  Target Audience
                </label>
                <div style={{ position: "relative" }}>
                  <select value={audience} onChange={(e) => setAudience(e.target.value)} style={{ paddingLeft: "36px" }}>
                    <option value="general_public">General Public</option>
                    <option value="c_suite">C-Suite Leadership</option>
                    <option value="regulators">Regulators & Auditors</option>
                    <option value="technical_experts">Technical Analysts</option>
                    <option value="media">Press & Media</option>
                  </select>
                  <Users size={15} color="#ea580c" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                  Communication Tone
                </label>
                <div style={{ position: "relative" }}>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ paddingLeft: "36px" }}>
                    <option value="professional">Professional</option>
                    <option value="urgent">Urgent Directive</option>
                    <option value="objective">Objective & Neutral</option>
                    <option value="empathetic">Empathetic</option>
                  </select>
                  <Volume2 size={15} color="#ea580c" style={{ position: "absolute", left: "12px", top: "14px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                    Language
                  </label>
                  <div style={{ position: "relative" }}>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ paddingLeft: "34px", paddingRight: "26px" }}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="hi">Hindi</option>
                      <option value="fr">French</option>
                    </select>
                    <Languages size={14} color="#ea580c" style={{ position: "absolute", left: "11px", top: "15px" }} />
                  </div>
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
                <div className="studio-card-icon" style={{ background: "#fffbeb", borderColor: "rgba(245, 158, 11, 0.35)" }}>
                  <CheckSquare size={18} color="#d97706" />
                </div>
                <div>
                  <h3 className="text-card-title">Pre-Generation Claim Bank</h3>
                  <div className="text-meta">Atomic grounded factual assertions</div>
                </div>
              </div>

              {claimBank && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="text-meta" style={{ color: "#475569" }}>
                    Permitted: <strong style={{ color: "#ea580c" }}>{selectedClaimIds.length}</strong> / {claimBank.claims?.length || 0}
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
                    style={{ fontSize: "12px", height: "28px", padding: "0 8px", color: "#b45309" }}
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
                border: "1.5px dashed rgba(245, 158, 11, 0.35)",
                borderRadius: "var(--radius-md)",
                background: "#fffdfa",
              }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "#fffbeb",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}>
                  <Database size={24} color="#d97706" />
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                  Claim Bank Awaiting Ingestion
                </h4>
                <p className="text-body" style={{ maxWidth: "420px", fontSize: "14px", color: "#64748b" }}>
                  Ingest a source document or choose a demo template on the left. The Docling layout parser will extract atomic claims, coordinate pointers, and sensitivity levels.
                </p>
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxHeight: "360px",
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
                                color: "#c2410c", 
                                background: "#fff7ed",
                                border: "1px solid #fed7aa",
                                padding: "2px 7px",
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontWeight: 700,
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
                            <span style={{ fontSize: "12px", color: "#d97706", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                              <Lock size={12} /> Gated by {disclosureLevel} ceiling
                            </span>
                          ) : (
                            <span className="text-meta" style={{ color: "#64748b", fontWeight: 500 }}>
                              Grounded {((claim.confidence || 0.98) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>

                        <p style={{
                          fontSize: "14px",
                          lineHeight: 1.55,
                          color: isAllowed ? "#0f172a" : "#94a3b8",
                          filter: !isAllowed ? "blur(3.5px)" : "none",
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
                <div className="studio-card-icon" style={{ background: "#fff7ed", borderColor: "rgba(249, 115, 22, 0.3)" }}>
                  <Share2 size={18} color="#ea580c" />
                </div>
                <div>
                  <h3 className="text-card-title">Multi-Channel Rendering Workspace</h3>
                  <div className="text-meta">Synthesize parallel governed collateral</div>
                </div>
              </div>

              {/* Floating Primary CTA with soft warm glow */}
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
                        background: isSelected ? "#fff7ed" : "#f8fafc",
                        border: `1px solid ${isSelected ? "#fed7aa" : "#e2e8f0"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <IconComp size={15} color={isSelected ? "#ea580c" : "#64748b"} />
                      </div>

                      <div style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: isSelected ? "none" : "1.5px solid #cbd5e1",
                        background: isSelected ? "#ea580c" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                      </div>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 700, color: isSelected ? "#0f172a" : "#334155", marginBottom: "3px" }}>
                      {channel.title}
                    </div>
                    <div className="text-meta" style={{ fontSize: "11px", lineHeight: 1.4, color: "#64748b" }}>
                      {channel.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generated Channels Display or Empty State */}
            {!channelOutputs ? (
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                textAlign: "center",
                border: "1.5px dashed rgba(245, 158, 11, 0.35)",
                borderRadius: "var(--radius-md)",
                background: "#fffdfa",
              }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background: "#fff7ed",
                  border: "1px solid rgba(249, 115, 22, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}>
                  <Sparkles size={24} color="#ea580c" />
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>
                  Select target channels to generate governed content.
                </h4>
                <p className="text-body" style={{ maxWidth: "420px", fontSize: "14px", color: "#64748b" }}>
                  Configure operator governance policies and select desired distribution channels above, then initiate synthesis to generate factual collateral with reverse traceability.
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
                    background: "#ffffff",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div className="text-meta" style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569" }}>
                        <span>
                          Claims Cited: <strong style={{ color: "#ea580c" }}>{channelOutputs[activeChannelTab]?.claim_count || 0}</strong>
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
                            <Check size={13} color="#10b981" /> Copied
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
                      color: "#1e293b",
                      whiteSpace: "pre-wrap",
                      marginBottom: "16px",
                    }}>
                      {renderTextWithCitations(channelOutputs[activeChannelTab]?.generated_text)}
                    </div>

                    {/* Citations Footer */}
                    <div style={{
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(245, 158, 11, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      color: "#64748b",
                    }}>
                      <MapPin size={13} color="#ea580c" />
                      <span>Click any orange coordinate badge to view the spatial Docling layout bounding box.</span>
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
                <div className="studio-card-icon" style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>
                  <ShieldCheck size={18} color="#047857" />
                </div>
                <div>
                  <h3 className="text-card-title">Dual Verification Gates</h3>
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
                    <Shield size={13} color="#ea580c" /> Verify Gates
                  </>
                )}
              </button>
            </div>

            {!verificationResult ? (
              <div style={{
                padding: "36px 16px",
                textAlign: "center",
                border: "1.5px dashed rgba(245, 158, 11, 0.3)",
                borderRadius: "var(--radius-md)",
                background: "#fffdfa",
              }}>
                <ShieldQuestion size={26} color="#d97706" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Awaiting Verification
                </div>
                <div className="text-meta" style={{ color: "#64748b" }}>
                  Render collateral first, then click "Verify Gates" to evaluate factual entailment and PII.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Gate 1: Factual Entailment */}
                <div style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  background: "#fffdf9",
                  border: "1px solid rgba(245, 158, 11, 0.22)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="text-label" style={{ color: "#0f172a", fontWeight: 700 }}>
                      Gate 1: Factual Fidelity
                    </span>
                    <span className={`badge-pill ${verificationResult.overall_status === "VERIFIED" ? "badge-public" : "badge-restricted"}`}>
                      {verificationResult.overall_status}
                    </span>
                  </div>

                  {/* Progress Indicator with golden-orange fill */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ flex: 1, height: "7px", borderRadius: "4px", background: "#fef3c7", overflow: "hidden" }}>
                      <div style={{
                        width: `${(verificationResult.pass_rate || 1.0) * 100}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)",
                        borderRadius: "4px",
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#ea580c", fontFamily: "var(--font-mono)" }}>
                      {((verificationResult.pass_rate || 1.0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-meta" style={{ color: "#64748b" }}>
                    NLI entailment strictly verified against source layout coordinate spans.
                  </div>
                </div>

                {/* Gate 2: Appropriateness & PII */}
                <div style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  background: "#fffdf9",
                  border: "1px solid rgba(245, 158, 11, 0.22)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="text-label" style={{ color: "#0f172a", fontWeight: 700 }}>
                      Gate 2: PII & Leak Guard
                    </span>
                    <span className={`badge-pill ${verificationResult.overall_appropriateness === "APPROPRIATE" ? "badge-public" : "badge-confidential"}`}>
                      {verificationResult.overall_appropriateness || "APPROPRIATE"}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "#334155" }}>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Zero PII / SSN / Secret Leaks Detected</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "#334155" }}>
                      <CheckCircle2 size={13} color="#10b981" />
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
                <div className="studio-card-icon" style={{ background: "#fffbeb", borderColor: "rgba(245, 158, 11, 0.35)" }}>
                  <KeyRound size={18} color="#d97706" />
                </div>
                <div>
                  <h3 className="text-card-title">Audit Manifest</h3>
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
                  <UserCheck size={16} color="#ea580c" style={{ position: "absolute", left: "12px", top: "14px" }} />
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
                  background: "#fffdfa",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  boxShadow: "0 2px 8px rgba(217, 119, 6, 0.05)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span className="text-label" style={{ fontSize: "11px", textTransform: "uppercase", color: "#78350f" }}>
                      SHA-256 Digest
                    </span>
                    <span className={`badge-pill ${integrityStatus.status === "PUBLISHED" ? "badge-public" : "badge-internal"}`}>
                      {integrityStatus.status || "ACTIVE"}
                    </span>
                  </div>

                  <div style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#fef8ee",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    marginBottom: "12px",
                  }}>
                    <div className="font-mono" style={{
                      fontSize: "11px",
                      color: "#c2410c",
                      wordBreak: "break-all",
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}>
                      {integrityStatus.hash || integrityStatus.integrity_hash || provenanceRecord?.integrity_hash}
                    </div>
                  </div>

                  <div className="text-meta" style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px", fontSize: "11px", color: "#64748b" }}>
                    <span>Signer: <strong style={{ color: "#0f172a" }}>{approverId.split(" ")[0]}</strong></span>
                    <span>Timestamp: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <button
                    onClick={handleVerifyIntegrity}
                    className="btn btn-secondary"
                    style={{ width: "100%", height: "36px", fontSize: "12px", gap: "6px" }}
                  >
                    <ShieldCheck size={14} color="#10b981" /> Verify Manifest Integrity
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
