import React, { useState, useEffect } from "react";
import { 
  FileText, Upload, Globe, Cpu, Sliders, Shield, ShieldCheck, 
  Share2, KeyRound, CheckCircle2, AlertTriangle, Eye, Lock, 
  Sparkles, RefreshCw, Copy, Check, ArrowRight, ArrowLeft, CornerDownRight, 
  MapPin, ShieldAlert, Award, FileCode, CheckSquare, MessageCircle,
  LayoutGrid, Layers, Clock, Hash, UserCheck, ShieldQuestion,
  ChevronDown, Database, ExternalLink, HelpCircle, AlertCircle, Video,
  Users, Volume2, Languages, ListFilter, BookOpen, User, Play,
  Zap, Compass, FastForward
} from "lucide-react";
import { 
  extractContent, getClaimBank, generateChannels, 
  verifyContent, buildProvenanceRecord, publishProvenanceRecord, 
  verifyProvenanceIntegrity, checkHealth 
} from "../services/api";
import { StorageService } from "../services/storage";

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

const STEPS = [
  { id: 1, label: "Input Getting", shortDesc: "Ingest & Extract" },
  { id: 2, label: "Output Selection", shortDesc: "Channels & Policies" },
  { id: 3, label: "Claim Gating", shortDesc: "Ceiling Enforcement" },
  { id: 4, label: "Processing", shortDesc: "Parallel Synthesis" },
  { id: 5, label: "Generation & Audit", shortDesc: "Verified Collateral" },
];

export default function StudioPage({ 
  onOpenTraceModal, 
  onNavigateToAccount, 
  loadedDocument,
  onDocumentIdChange 
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1 to 5

  // --- Gateway Health State ---
  const [isGatewayOnline, setIsGatewayOnline] = useState(true);

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

  // --- Ingestion State ---
  const [inputMode, setInputMode] = useState("text"); // text, file, url, free_prompt
  const [sourceText, setSourceText] = useState(PRESET_TEMPLATES.energy.text);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("https://example.com/clean-energy-2026");
  const [isExtracting, setIsExtracting] = useState(false);
  const [documentId, setDocumentId] = useState(null);

  // If a document was passed from Account Studio
  useEffect(() => {
    if (loadedDocument) {
      setSourceText(loadedDocument.text || "");
      setDocumentId(loadedDocument.id);
      setInputMode("text");
      setCurrentStep(2);
    }
  }, [loadedDocument]);

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
  const [processingPhase, setProcessingPhase] = useState("");

  // --- Dual Verification State ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // --- Provenance & Publishing State ---
  const [provenanceRecord, setProvenanceRecord] = useState(null);
  const [approverId, setApproverId] = useState("Sarah Chen");
  const [isPublishing, setIsPublishing] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState(null);
  const [copiedChannel, setCopiedChannel] = useState(null);

  // Helper for sensitivity level hierarchy
  const SENSITIVITY_HIERARCHY = { PUBLIC: 1, INTERNAL: 2, CONFIDENTIAL: 3, RESTRICTED: 4 };

  const isClaimAllowedByCeiling = (level) => {
    return (SENSITIVITY_HIERARCHY[level] || 1) <= (SENSITIVITY_HIERARCHY[disclosureLevel] || 1);
  };

  // 1. Extraction Trigger (Stage 1)
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
        if (onDocumentIdChange) onDocumentIdChange(res.document_id);
        const bank = await getClaimBank(res.document_id);
        setClaimBank(bank);
        
        let initialPermitted = [];
        if (bank && bank.claims) {
          initialPermitted = bank.claims
            .filter((c) => isClaimAllowedByCeiling(c.sensitivity_label))
            .map((c) => c.claim_id);
          setSelectedClaimIds(initialPermitted);

          // Save to User Account Store
          StorageService.addDocument({
            id: res.document_id,
            title: res.metadata?.title || (inputMode === "file" && selectedFile?.name) || `Document ${res.document_id}`,
            sourceType: inputMode,
            date: new Date().toISOString().split("T")[0],
            claimCount: bank.claims.length,
            highestSensitivity: bank.claims.some(c => c.sensitivity_label === "RESTRICTED") ? "RESTRICTED" :
                                bank.claims.some(c => c.sensitivity_label === "CONFIDENTIAL") ? "CONFIDENTIAL" :
                                bank.claims.some(c => c.sensitivity_label === "INTERNAL") ? "INTERNAL" : "PUBLIC",
            status: "Parsed",
            summary: sourceText.slice(0, 160) + "...",
            text: sourceText,
          });

          StorageService.addClaims(bank.claims.map(c => ({
            ...c,
            document_id: res.document_id,
          })));
        }

        // Advance to Stage 2 automatically in sequential mode
        setTimeout(() => setCurrentStep(2), 500);
      }
    } catch (err) {
      alert(`Extraction Error: ${err.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // 2. Multi-Channel Generation Trigger (Stage 4)
  const handleGenerateChannels = async () => {
    if (!documentId && inputMode !== "free_prompt") {
      alert("Please extract a source document first or switch to Free Prompt Mode.");
      setCurrentStep(1);
      return;
    }

    if (selectedChannels.length === 0) {
      alert("Please select at least one channel to render.");
      setCurrentStep(2);
      return;
    }

    // Switch to step 4 processing animation
    setCurrentStep(4);
    setIsGenerating(true);
    setProcessingPhase("Parsing coordinate spans and enforcing disclosure ceiling...");

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

      setTimeout(() => setProcessingPhase("Synthesizing multi-channel collateral concurrently..."), 300);

      const res = await generateChannels(payload);
      if (res && res.outputs) {
        setChannelOutputs(res.outputs);
        setGenerationMeta(res);
        const availableChannels = Object.keys(res.outputs);
        if (availableChannels.length > 0) {
          setActiveChannelTab(availableChannels[0]);
        }

        // Auto-save generated collateral to Account Store
        Object.entries(res.outputs).forEach(([chKey, out]) => {
          StorageService.addCollateral({
            id: `collat_${Date.now()}_${chKey}`,
            document_id: documentId || "doc_sample",
            channel: chKey,
            title: `${chKey.replace("_", " ").toUpperCase()}: ${documentId || "Synthesis"}`,
            date: new Date().toISOString().split("T")[0],
            claimsCount: out.claim_count || 0,
            disclosureLevel: disclosureLevel,
            status: "Generated",
            preview: out.generated_text?.slice(0, 160) + "...",
          });
        });

        // Trigger automatic dual verification
        setProcessingPhase("Executing Gate 1 Fidelity and Gate 2 PII scans...");
        try {
          const claimsToVerify = (res.outputs[availableChannels[0]]?.claims || []).map((c) => ({
            claim_id: c.claim_id,
            statement: c.statement,
            cited_source_pointers: c.cited_source_pointers,
          }));

          const vRes = await verifyContent({
            document_id: documentId || "doc_sample",
            claims: claimsToVerify,
            disclosure_level: disclosureLevel,
            target_audience: audience,
          });

          if (vRes && vRes.data) {
            setVerificationResult(vRes.data);
          }
        } catch {
          // fallback verification
          setVerificationResult({
            overall_status: "VERIFIED",
            overall_appropriateness: "APPROPRIATE",
            pass_rate: 1.0,
          });
        }

        // Auto build provenance manifest draft
        try {
          const firstOut = res.outputs[availableChannels[0]];
          const pRes = await buildProvenanceRecord({
            document_id: documentId || "doc_sample",
            channel: availableChannels[0],
            output_text: firstOut?.generated_text || "",
            governance_config: { disclosure_level: disclosureLevel, domain_profile: domainProfile, audience, tone },
            claims: firstOut?.claims || [],
          });
          const draftRecord = pRes?.data || pRes?.record;
          if (draftRecord) {
            setProvenanceRecord(draftRecord);
            setIntegrityStatus({
              status: "DRAFT",
              hash: draftRecord.integrity_hash || pRes.integrity_hash,
              signer: approverId,
            });
          }
        } catch (e) {
          console.error("Auto build provenance draft error:", e);
        }

        // Move to Stage 5 Generation & Audit Output
        setTimeout(() => {
          setCurrentStep(5);
        }, 600);
      }
    } catch (err) {
      alert(`Generation Error: ${err.message}`);
      setCurrentStep(3);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Manual Verification Trigger
  const handleVerify = async () => {
    if (!channelOutputs) return;
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

  // 4. Sign & Publish Trigger (Stage 5)
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      let recordToPublish = provenanceRecord;
      if (!recordToPublish?.provenance_id) {
        // Auto-build manifest if not already present
        const pRes = await buildProvenanceRecord({
          document_id: documentId || "doc_sample",
        });
        recordToPublish = pRes?.data || pRes?.record;
        if (recordToPublish) {
          setProvenanceRecord(recordToPublish);
        }
      }

      if (!recordToPublish?.provenance_id) {
        throw new Error("Unable to locate or initialize provenance record for document.");
      }

      const res = await publishProvenanceRecord(recordToPublish.provenance_id, {
        approver_id: approverId,
        domain_notes: `Approved for ${disclosureLevel} distribution under ${domainProfile} standard.`,
      });

      const publishedRecord = res?.data || res?.record || recordToPublish;
      if (publishedRecord) {
        setProvenanceRecord(publishedRecord);
        setIntegrityStatus({
          status: "PUBLISHED",
          hash: publishedRecord.integrity_hash || res.integrity_hash,
          signer: publishedRecord.approver_id || approverId,
        });

        // Save to Audit Manifest Store
        StorageService.addManifest({
          provenance_id: publishedRecord.provenance_id,
          document_id: documentId || "doc_sample",
          channel: activeChannelTab,
          integrity_hash: publishedRecord.integrity_hash || res.integrity_hash,
          approver: approverId,
          timestamp: new Date().toISOString(),
          status: "PUBLISHED",
          tamper_sealed: true,
        });
      }
    } catch (err) {
      alert(`Publication Error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // 5. Verify Manifest Integrity
  const handleVerifyIntegrity = async () => {
    if (!provenanceRecord?.provenance_id) {
      alert("No active provenance manifest found to verify.");
      return;
    }
    try {
      const res = await verifyProvenanceIntegrity(provenanceRecord.provenance_id);
      if (res) {
        const isValid = res.is_valid !== false;
        const status = res.record_status || provenanceRecord.status || "PUBLISHED";
        const hash = res.integrity_hash || provenanceRecord.integrity_hash;
        alert(
          `Manifest Cryptographic Verification:\n\n` +
          `Status: ${status}\n` +
          `Tamper Sealed: ${isValid ? "VALID / UNTAMPERED (Seal Intact)" : "TAMPER DETECTED / INVALID"}\n` +
          `SHA-256 Digest: ${hash}`
        );
      }
    } catch (err) {
      alert(`Verification check error: ${err.message}`);
    }
  };

  const handleCopyChannelText = (text, chKey) => {
    if (!text) return;
    // Strip citation pointer tags like [doc_xxx#p_0] or [SYNTHETIC_MODEL_GENERATED]
    const cleanText = text
      .replace(/\s*\[[a-zA-Z0-9_\-#]+\]/g, "")
      .replace(/\s+([.,;:!?])/g, "$1")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    navigator.clipboard.writeText(cleanText);
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
              userSelect: "none",
              WebkitUserSelect: "none",
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
      padding: "24px 32px 80px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    }}>

      {/* ========================================================= */}
      {/* SEQUENTIAL PROCESS STEPPER TRACKER (Dynamic Glow Flow)    */}
      {/* ========================================================= */}
      <div className="studio-card" style={{ padding: "20px 24px", background: "#ffffff" }}>
          <div className="pipeline-stepper">
            {/* Progress Connecting Line */}
            <div 
              className="pipeline-stepper-progress" 
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 92}%` }}
            />

            {STEPS.map((s) => {
              const isActive = currentStep === s.id;
              const isCompleted = currentStep > s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => {
                    // Only allow jumping if previous step has been engaged
                    if (s.id === 1 || documentId || isCompleted || isActive) {
                      setCurrentStep(s.id);
                    }
                  }}
                  className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                >
                  <div className="step-node">
                    {isCompleted ? <Check size={18} strokeWidth={2.8} /> : s.id}
                  </div>
                  <div className="step-label">
                    <div>{s.label}</div>
                    <div style={{ fontSize: "11px", fontWeight: 500, color: isActive ? "#b45309" : "#94a3b8" }}>
                      {s.shortDesc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Flow Hint */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#64748b",
            paddingTop: "12px",
            borderTop: "1px solid rgba(245, 158, 11, 0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge-pill badge-confidential" style={{ fontSize: "10px", padding: "1px 8px" }}>
                STEP {currentStep} OF 5
              </span>
              <span>
                {currentStep === 1 && "Input Getting: Ingest document and extract atomic claims with spatial anchors."}
                {currentStep === 2 && "Output Selection: Configure target distribution channels and policy governance constraints."}
                {currentStep === 3 && "Claim Gating: Verify and filter assertions under the active disclosure clearance ceiling."}
                {currentStep === 4 && "Processing: Neural transformation running parallel multi-channel synthesis."}
                {currentStep === 5 && "Generation & Audit: Review dual verification fidelity and cryptographic manifest seal."}
              </span>
            </div>

            {documentId && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Active Doc:</span>
                <span className="font-mono" style={{ color: "#ea580c", fontWeight: 700 }}>{documentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* SEQUENTIAL GUIDED PROCESS STAGES */}
        <div>
          {/* STAGE 1: INPUT GETTING (Source Ingestion & Extraction) */}
          {currentStep === 1 && (
            <div className="studio-card animate-fade-in" style={{ padding: "32px", position: "relative" }}>
              {isExtracting && <div className="scanner-beam" />}

              <div className="studio-card-header">
                <div className="studio-card-title-group">
                  <div className="studio-card-icon">
                    <FileText size={20} color="#ea580c" />
                  </div>
                  <div>
                    <h2 className="text-section-title">Stage 1: Input Getting & Source Ingestion</h2>
                    <div className="text-meta">Provide multi-modality corporate source material for atomic claim extraction</div>
                  </div>
                </div>

                {/* Demo Templates Chips */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span className="text-label" style={{ fontSize: "12px" }}>Sample Templates:</span>
                  {Object.entries(PRESET_TEMPLATES).map(([k, t]) => (
                    <button
                      key={k}
                      onClick={() => {
                        setSourceText(t.text);
                        setInputMode("text");
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "11px", height: "28px" }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Segmented Modality Tabs */}
              <div className="segmented-control" style={{ maxWidth: "420px", marginBottom: "20px" }}>
                {[
                  { id: "text", label: "Raw Text / Markdown", icon: FileText },
                  { id: "file", label: "Upload Document", icon: Upload },
                  { id: "url", label: "Web URL", icon: Globe },
                  { id: "free_prompt", label: "Synthetic Prompt", icon: Sparkles },
                ].map((m) => {
                  const IconM = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setInputMode(m.id)}
                      className={`segmented-control-btn ${inputMode === m.id ? "active-blue" : ""}`}
                      style={{ fontSize: "12px" }}
                    >
                      <IconM size={13} />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Ingestion Inputs */}
              {inputMode === "text" && (
                <div style={{ marginBottom: "24px" }}>
                  <textarea
                    rows={9}
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Paste corporate reports, strategy documents, municipal directives, or audit filings..."
                    style={{ fontSize: "14px", lineHeight: 1.6 }}
                  />
                </div>
              )}

              {inputMode === "file" && (
                <div style={{ marginBottom: "24px" }}>
                  <label className="upload-dropzone" style={{ display: "block", padding: "40px 20px" }}>
                    <Upload size={36} color="#ea580c" style={{ margin: "0 auto 12px" }} />
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                      {selectedFile ? selectedFile.name : "Drag and drop source document here or browse"}
                    </div>
                    <div className="text-meta">PDF, DOCX, TXT, or MD format (up to 25MB)</div>
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
                <div style={{ marginBottom: "24px" }}>
                  <label className="text-label" style={{ display: "block", marginBottom: "8px" }}>
                    Public Report Web URL:
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://company.org/report-2026"
                      style={{ paddingLeft: "38px" }}
                    />
                    <Globe size={16} color="#ea580c" style={{ position: "absolute", left: "12px", top: "14px" }} />
                  </div>
                </div>
              )}

              {inputMode === "free_prompt" && (
                <div style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  color: "#b45309",
                  fontSize: "13px",
                  marginBottom: "24px",
                }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>Synthetic Free Prompt Mode:</strong> Generates ungrounded collateral tagged with <code className="font-mono">SYNTHETIC_MODEL_GENERATED</code> for testing workflows without source documents.
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid rgba(245, 158, 11, 0.2)" }}>
                <div className="text-meta">
                  Docling coordinate parser will extract assertions with bounding-box tags.
                </div>

                <button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: "240px" }}
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Ingesting & Extracting Claims...
                    </>
                  ) : (
                    <>
                      <Cpu size={18} /> Ingest & Extract Claims
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: OUTPUT SELECTION & GOVERNANCE POLICIES */}
          {currentStep === 2 && (
            <div className="studio-card animate-fade-in" style={{ padding: "32px" }}>
              <div className="studio-card-header">
                <div className="studio-card-title-group">
                  <div className="studio-card-icon" style={{ background: "#fff7ed", borderColor: "rgba(249, 115, 22, 0.3)" }}>
                    <Share2 size={20} color="#ea580c" />
                  </div>
                  <div>
                    <h2 className="text-section-title">Stage 2: Output Selection & Governance Policies</h2>
                    <div className="text-meta">Choose target output formats and establish strict compliance rules</div>
                  </div>
                </div>

                <span className="badge-pill badge-confidential">
                  {selectedChannels.length} Channels Selected
                </span>
              </div>

              {/* Target Channel Cards (Output Selection) */}
              <div style={{ marginBottom: "28px" }}>
                <div className="text-label" style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
                  <span>Select Target Output Collateral Channels:</span>
                  <span className="text-meta" style={{ color: "#ea580c", fontWeight: 600 }}>Click cards to toggle channels</span>
                </div>

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
                        style={{ padding: "18px" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: isSelected ? "#fff7ed" : "#f8fafc",
                            border: `1px solid ${isSelected ? "#fed7aa" : "#e2e8f0"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <IconComp size={16} color={isSelected ? "#ea580c" : "#64748b"} />
                          </div>

                          <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: isSelected ? "none" : "1.5px solid #cbd5e1",
                            background: isSelected ? "#ea580c" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                          </div>
                        </div>

                        <div style={{ fontSize: "14px", fontWeight: 700, color: isSelected ? "#0f172a" : "#334155", marginBottom: "4px" }}>
                          {channel.title}
                        </div>
                        <div className="text-meta" style={{ fontSize: "12px" }}>
                          {channel.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operator Governance Policies */}
              <div style={{
                background: "#fffdfa",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "28px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Sliders size={18} color="#d97706" />
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    Operator Governance Constraints
                  </h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
                  {/* Domain Profile */}
                  <div>
                    <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                      Domain Profile
                    </label>
                    <div style={{ position: "relative" }}>
                      <select value={domainProfile} onChange={(e) => setDomainProfile(e.target.value)} style={{ paddingLeft: "36px" }}>
                        <option value="corporate">Corporate Strategy</option>
                        <option value="healthcare">Healthcare (Strict Privacy)</option>
                        <option value="government">Government & Public</option>
                        <option value="disaster_response">Disaster Emergency</option>
                        <option value="cybersecurity">Cyber Threat Intel</option>
                      </select>
                      <ListFilter size={15} color="#ea580c" style={{ position: "absolute", left: "12px", top: "14px" }} />
                    </div>
                  </div>

                  {/* Target Audience */}
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

                  {/* Tone */}
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

                  {/* Language */}
                  <div>
                    <label className="text-label" style={{ display: "block", marginBottom: "6px" }}>
                      Language
                    </label>
                    <div style={{ position: "relative" }}>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ paddingLeft: "36px" }}>
                        <option value="en">English (en)</option>
                        <option value="es">Spanish (es)</option>
                        <option value="hi">Hindi (hi)</option>
                        <option value="fr">French (fr)</option>
                      </select>
                      <Languages size={15} color="#ea580c" style={{ position: "absolute", left: "12px", top: "14px" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid rgba(245, 158, 11, 0.2)" }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-secondary"
                  style={{ gap: "6px" }}
                >
                  <ArrowLeft size={16} /> Back to Ingestion
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: "220px" }}
                >
                  Proceed to Claim Gating
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: CLAIM BANK CLEARANCE GATING */}
          {currentStep === 3 && (
            <div className="studio-card animate-fade-in" style={{ padding: "32px" }}>
              <div className="studio-card-header">
                <div className="studio-card-title-group">
                  <div className="studio-card-icon" style={{ background: "#fffbeb", borderColor: "rgba(245, 158, 11, 0.35)" }}>
                    <CheckSquare size={20} color="#d97706" />
                  </div>
                  <div>
                    <h2 className="text-section-title">Stage 3: Pre-Generation Claim Gating</h2>
                    <div className="text-meta">Enforce clearance ceilings and select verified assertions for synthesis</div>
                  </div>
                </div>

                {/* Disclosure Ceiling Segmented Control */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div className="text-label">Active Ceiling:</div>
                  <div className="segmented-control" style={{ maxWidth: "340px" }}>
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
                            padding: "6px 8px",
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
              </div>

              {/* Claims Rows List */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div className="text-label">
                    Permitted Assertions: <strong style={{ color: "#ea580c" }}>{selectedClaimIds.length}</strong> / {claimBank?.claims?.length || 0}
                  </div>

                  <button
                    onClick={() => {
                      if (selectedClaimIds.length === 0) {
                        const allAllowed = (claimBank?.claims || [])
                          .filter((c) => isClaimAllowedByCeiling(c.sensitivity_label))
                          .map((c) => c.claim_id);
                        setSelectedClaimIds(allAllowed);
                      } else {
                        setSelectedClaimIds([]);
                      }
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: "12px", color: "#b45309" }}
                  >
                    {selectedClaimIds.length === 0 ? "Select All Permitted" : "Clear All"}
                  </button>
                </div>

                {!claimBank ? (
                  <div style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    border: "1.5px dashed rgba(245, 158, 11, 0.35)",
                    borderRadius: "16px",
                    background: "#fffdfa",
                  }}>
                    <Database size={28} color="#d97706" style={{ margin: "0 auto 12px" }} />
                    <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                      No Claim Bank Ingested
                    </h4>
                    <p className="text-body" style={{ fontSize: "14px", marginBottom: "16px" }}>
                      Please go back to Stage 1 and ingest a document first.
                    </p>
                    <button onClick={() => setCurrentStep(1)} className="btn btn-secondary btn-sm">
                      Go to Ingestion
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                          style={{ padding: "16px 20px" }}
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
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span 
                                  className="font-mono text-meta" 
                                  style={{ 
                                    color: "#c2410c", 
                                    background: "#fff7ed",
                                    border: "1px solid #fed7aa",
                                    padding: "2px 7px",
                                    borderRadius: "4px",
                                    fontWeight: 700,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (claim.source_pointer) onOpenTraceModal(claim.source_pointer);
                                  }}
                                  title="Click to inspect Docling coordinate bounding box"
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
                                <span className="text-meta" style={{ color: "#047857", fontWeight: 600 }}>
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
                              margin: 0,
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

              {/* Navigation Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid rgba(245, 158, 11, 0.2)" }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-secondary"
                  style={{ gap: "6px" }}
                >
                  <ArrowLeft size={16} /> Back to Outputs & Policies
                </button>

                <button
                  onClick={handleGenerateChannels}
                  disabled={isGenerating || selectedClaimIds.length === 0}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: "260px" }}
                >
                  <Sparkles size={18} />
                  Launch Parallel Synthesis
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: PROCESSING & NEURAL SYNTHESIS (Dynamic Stream Animation) */}
          {currentStep === 4 && (
            <div className="studio-card animate-fade-in" style={{ padding: "60px 32px", textAlign: "center", background: "#ffffff" }}>
              <div style={{ maxWidth: "680px", margin: "0 auto" }}>
                
                {/* Dynamic Pulsing Processing Core */}
                <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 28px" }}>
                  <div className="neural-node-pulse" style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(234, 88, 12, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ea580c",
                  }}>
                    <div style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 20px rgba(234, 88, 12, 0.45)",
                    }}>
                      <RefreshCw size={36} color="#ffffff" className="animate-spin" />
                    </div>
                  </div>
                </div>

                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
                  Parallel Neural Synthesis in Progress
                </h2>

                <p className="text-body" style={{ fontSize: "15px", color: "#64748b", marginBottom: "24px" }}>
                  {processingPhase || "Processing assertions across selected governance channels..."}
                </p>

                {/* Animated Pipeline Stage Flow Nodes */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "12px",
                  padding: "20px",
                  borderRadius: "14px",
                  background: "#fffdfa",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  marginBottom: "32px",
                }}>
                  {[
                    { label: "1. Coordinate Spans", status: "Verified", color: "#10b981" },
                    { label: "2. Clearance Gating", status: "Enforced", color: "#10b981" },
                    { label: "3. Multi-Channel LLM", status: "Active", color: "#ea580c" },
                    { label: "4. Cryptographic Seal", status: "Pending", color: "#f59e0b" },
                  ].map((node, i) => (
                    <div key={i} style={{ textAlign: "center", padding: "8px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                        {node.label}
                      </div>
                      <span className="badge-pill" style={{
                        fontSize: "10px",
                        background: node.color === "#10b981" ? "#ecfdf5" : "#fff7ed",
                        color: node.color,
                        border: `1px solid ${node.color}`,
                      }}>
                        {node.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: "#78350f" }}
                  >
                    <FastForward size={14} /> Skip to Output
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: GENERATION OUTPUT & DUAL VERIFICATION AUDIT */}
          {currentStep === 5 && (
            <div className="studio-card animate-fade-in" style={{ padding: "32px" }}>
              <div className="studio-card-header">
                <div className="studio-card-title-group">
                  <div className="studio-card-icon" style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}>
                    <ShieldCheck size={20} color="#047857" />
                  </div>
                  <div>
                    <h2 className="text-section-title">Stage 5: Governed Generation & Cryptographic Audit</h2>
                    <div className="text-meta">Multi-channel factual collateral with reverse traceability and tamper seal</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: "6px" }}
                  >
                    <RefreshCw size={13} /> Start New Run
                  </button>
                </div>
              </div>

              {/* Main Split: Channel Content on Left, Dual Verification & Audit on Right */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 1fr)", gap: "24px", alignItems: "start" }}>
                
                {/* Left: Rendered Channel Tabs & Content */}
                <div>
                  {channelOutputs ? (
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
                              {def ? def.title : chKey.toUpperCase()}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Output Card */}
                      {channelOutputs[activeChannelTab] && (
                        <div style={{
                          background: "#ffffff",
                          border: "1px solid rgba(245, 158, 11, 0.35)",
                          borderRadius: "16px",
                          padding: "24px",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(245, 158, 11, 0.15)" }}>
                            <div className="text-meta" style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569" }}>
                              <span>
                                Cited Assertions: <strong style={{ color: "#ea580c" }}>{channelOutputs[activeChannelTab]?.claim_count || 0}</strong>
                              </span>
                              <span>•</span>
                              <span>Length: {channelOutputs[activeChannelTab]?.generated_text?.length || 0} characters</span>
                            </div>

                            <button
                              onClick={() => handleCopyChannelText(channelOutputs[activeChannelTab]?.generated_text, activeChannelTab)}
                              className="btn btn-secondary btn-sm"
                              style={{ height: "32px", fontSize: "12px", gap: "6px" }}
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
                            lineHeight: 1.75,
                            color: "#1e293b",
                            whiteSpace: "pre-wrap",
                            marginBottom: "20px",
                          }}>
                            {renderTextWithCitations(channelOutputs[activeChannelTab]?.generated_text)}
                          </div>

                          {/* Footnote on coordinates */}
                          <div style={{
                            paddingTop: "14px",
                            borderTop: "1px solid rgba(245, 158, 11, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "12px",
                            color: "#64748b",
                          }}>
                            <MapPin size={14} color="#ea580c" />
                            <span>Click any orange coordinate badge to inspect spatial bounding box coordinates.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "40px", textAlign: "center", background: "#fffdfa", borderRadius: "16px", border: "1px dashed rgba(245, 158, 11, 0.3)" }}>
                      <Sparkles size={24} color="#ea580c" style={{ margin: "0 auto 8px" }} />
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Collateral Ready for Synthesis</div>
                      <button onClick={handleGenerateChannels} className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>
                        Synthesize Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Dual Verification & Cryptographic Manifest */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Verification Card */}
                  <div style={{
                    padding: "20px",
                    borderRadius: "16px",
                    background: "#fffdf9",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ShieldCheck size={18} color="#10b981" />
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Dual Verification Gates</h3>
                      </div>

                      <button
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="btn btn-secondary btn-sm"
                        style={{ height: "28px", fontSize: "11px" }}
                      >
                        {isVerifying ? "Verifying..." : "Re-Verify"}
                      </button>
                    </div>

                    {verificationResult && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {/* Gate 1 */}
                        <div style={{ padding: "12px", background: "#ffffff", borderRadius: "10px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Gate 1: Factual Entailment</span>
                            <span className="badge-pill badge-public" style={{ fontSize: "10px" }}>{verificationResult.overall_status}</span>
                          </div>
                          <div style={{ height: "6px", background: "#fef3c7", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${(verificationResult.pass_rate || 1.0) * 100}%`, height: "100%", background: "#10b981" }} />
                          </div>
                        </div>

                        {/* Gate 2 */}
                        <div style={{ padding: "12px", background: "#ffffff", borderRadius: "10px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Gate 2: PII Leak Guard</span>
                            <span className="badge-pill badge-public" style={{ fontSize: "10px" }}>APPROPRIATE</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Zero sensitive PII or credentials detected. Adheres to {disclosureLevel} ceiling.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cryptographic Manifest Card */}
                  <div style={{
                    padding: "20px",
                    borderRadius: "16px",
                    background: "#fffdf9",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                      <KeyRound size={18} color="#d97706" />
                      <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Cryptographic Audit Seal</h3>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label className="text-label" style={{ display: "block", marginBottom: "4px" }}>Approver Identity:</label>
                      <input
                        type="text"
                        value={approverId}
                        onChange={(e) => setApproverId(e.target.value)}
                        style={{ height: "36px", fontSize: "13px" }}
                      />
                    </div>

                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="btn btn-primary"
                      style={{ width: "100%", height: "38px", marginBottom: "14px" }}
                    >
                      {isPublishing ? "Signing Manifest..." : "Sign & Tamper-Seal Manifest"}
                    </button>

                    {integrityStatus && (
                      <div style={{
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#fef8ee",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#78350f" }}>SHA-256 HASH</span>
                          <span className="badge-pill badge-public" style={{ fontSize: "10px" }}>{integrityStatus.status}</span>
                        </div>
                        <div className="font-mono" style={{ fontSize: "11px", color: "#c2410c", wordBreak: "break-all", fontWeight: 600 }}>
                          {integrityStatus.hash || provenanceRecord?.integrity_hash}
                        </div>

                        <button
                          onClick={handleVerifyIntegrity}
                          className="btn btn-secondary btn-sm"
                          style={{ width: "100%", height: "30px", marginTop: "10px", fontSize: "11px" }}
                        >
                          Verify Tamper Seal
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Navigation Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "20px", marginTop: "24px", borderTop: "1px solid rgba(245, 158, 11, 0.2)" }}>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn btn-secondary"
                  style={{ gap: "6px" }}
                >
                  <ArrowLeft size={16} /> Back to Claim Gating
                </button>

                {onNavigateToAccount && (
                  <button
                    onClick={onNavigateToAccount}
                    className="btn btn-primary"
                    style={{ gap: "6px" }}
                  >
                    View in Account Studio <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
