import React, { useState, useEffect } from "react";
import { 
  User, Shield, Database, FileText, Share2, KeyRound, Download, 
  Upload, Trash2, ExternalLink, Search, Filter, CheckCircle2, 
  RefreshCw, Copy, Check, Lock, ArrowRight, Sparkles, Building2,
  Calendar, Layers, ShieldCheck, Hash, AlertTriangle, FileCode
} from "lucide-react";
import { StorageService } from "../services/storage";

export default function AccountStudio({ 
  onSelectDocumentForStudio, 
  onLaunchNewPipeline,
  onNavigateToStudio,
  onNavigateToOverview
}) {
  const [activeTab, setActiveTab] = useState("documents"); // documents, claims, collateral, manifests
  const [profile, setProfile] = useState(StorageService.getProfile());
  const [documents, setDocuments] = useState(StorageService.getDocuments());
  const [claims, setClaims] = useState(StorageService.getClaims());
  const [collateral, setCollateral] = useState(StorageService.getCollateral());
  const [manifests, setManifests] = useState(StorageService.getManifests());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSensitivity, setSelectedSensitivity] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);
  const [importStatus, setImportStatus] = useState(null);

  // Sync state
  const refreshData = () => {
    setProfile(StorageService.getProfile());
    setDocuments(StorageService.getDocuments());
    setClaims(StorageService.getClaims());
    setCollateral(StorageService.getCollateral());
    setManifests(StorageService.getManifests());
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteDoc = (id) => {
    if (confirm("Delete this document and its associated records?")) {
      const updated = StorageService.deleteDocument(id);
      setDocuments(updated);
    }
  };

  const handleDeleteCollateral = (id) => {
    if (confirm("Remove this collateral record?")) {
      const updated = StorageService.deleteCollateral(id);
      setCollateral(updated);
    }
  };

  const handleExportJSON = () => {
    const dataStr = StorageService.exportFullJSON();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `veritas_governance_data_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = StorageService.importFullJSON(event.target.result);
      if (res.success) {
        refreshData();
        setImportStatus("Import successful!");
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        alert(`Failed to import JSON: ${res.error}`);
      }
    };
    reader.readAsText(file);
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

  // Filtered claims
  const filteredClaims = claims.filter((c) => {
    const matchesSearch = c.statement.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.claim_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.document_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSensitivity = selectedSensitivity === "ALL" || c.sensitivity_label === selectedSensitivity;
    return matchesSearch && matchesSensitivity;
  });

  return (
    <div style={{ maxWidth: "1680px", margin: "0 auto", padding: "24px 32px 80px", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Embedded Top Header Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        paddingBottom: "20px",
        borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
      }}>
        {/* Brand Area */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 className="text-page-title" style={{ fontSize: "24px", color: "#0f172a" }}>
                User Account & Governance Data Studio
              </h1>
              <span className="badge-pill badge-confidential" style={{ fontSize: "11px", fontWeight: 700 }}>
                DATA STORAGE ACTIVE
              </span>
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
              Manage Ingested Documents, Atomic Claim Banks, Collateral Archives & Cryptographic Seals
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={onNavigateToStudio || onLaunchNewPipeline}
            className="btn btn-secondary btn-sm"
            style={{ gap: "6px", height: "36px", color: "#78350f" }}
          >
            <Sparkles size={14} color="#ea580c" />
            Transformation Studio
          </button>

          {onNavigateToOverview && (
            <button
              onClick={onNavigateToOverview}
              className="btn btn-ghost btn-sm"
              style={{ gap: "6px", height: "36px", color: "#64748b" }}
            >
              <Layers size={14} color="#ea580c" />
              Overview
            </button>
          )}

          {/* Compact Gateway Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "6px 14px",
            borderRadius: "var(--radius-pill)",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            fontSize: "12px",
            fontWeight: 600,
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              boxShadow: "0 0 6px #10b981",
              display: "inline-block",
            }} />
            <span style={{ color: "#047857" }}>Gateway Active</span>
          </div>
        </div>
      </div>
      
      {/* User Account Profile Card Banner */}
      <div className="studio-card" style={{
        padding: "28px 32px",
        background: "linear-gradient(135deg, #ffffff 0%, #fffbf5 60%, #fff7ed 100%)",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        boxShadow: "0 6px 24px -4px rgba(217, 119, 6, 0.10)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
        }}>
          {/* Left: Avatar + Details */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
              border: "2px solid #ffffff",
              boxShadow: "0 4px 16px rgba(234, 88, 12, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
            }}>
              SC
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                  {profile.name}
                </h2>
                <span className="badge-pill badge-restricted" style={{ fontSize: "11px", fontWeight: 700 }}>
                  <Shield size={12} />
                  {profile.clearanceLevel} CLEARANCE
                </span>
                <span className="badge-pill badge-confidential" style={{ fontSize: "11px" }}>
                  Active Operator
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px", fontSize: "13px", color: "#64748b", flexWrap: "wrap" }}>
                <span>{profile.role}</span>
                <span>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Building2 size={13} color="#ea580c" />
                  {profile.organization}
                </span>
                <span>•</span>
                <span className="font-mono text-meta" style={{ color: "#78350f" }}>{profile.email}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleExportJSON}
              className="btn btn-secondary btn-sm"
              style={{ gap: "6px", height: "36px", color: "#78350f" }}
              title="Download full in-memory governance state as JSON"
            >
              <Download size={14} color="#ea580c" />
              Export JSON
            </button>

            <label className="btn btn-secondary btn-sm" style={{ gap: "6px", height: "36px", color: "#78350f", cursor: "pointer" }}>
              <Upload size={14} color="#ea580c" />
              Import JSON
              <input type="file" accept=".json" onChange={handleImportFile} style={{ display: "none" }} />
            </label>

            <button
              onClick={onLaunchNewPipeline}
              className="btn btn-primary btn-sm"
              style={{ gap: "6px", height: "36px", padding: "0 18px" }}
            >
              <Sparkles size={14} />
              New Transformation Run
            </button>
          </div>
        </div>

        {/* Account Metrics Strip */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "16px",
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(245, 158, 11, 0.20)",
        }}>
          {[
            { label: "Processed Documents", val: documents.length, icon: FileText, color: "#ea580c" },
            { label: "Governed Claims", val: claims.length, icon: Database, color: "#d97706" },
            { label: "Generated Collateral", val: collateral.length, icon: Share2, color: "#f59e0b" },
            { label: "Cryptographic Seals", val: manifests.length, icon: KeyRound, color: "#10b981" },
            { label: "Verification Pass Rate", val: profile.stats.verifiedPassRate, icon: ShieldCheck, color: "#047857" },
          ].map((stat, i) => {
            const IconC = stat.icon;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#fff7ed",
                  border: "1px solid rgba(249, 115, 22, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <IconC size={18} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                    {stat.val}
                  </div>
                  <div className="text-meta" style={{ fontSize: "11px", color: "#64748b" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {importStatus && (
          <div style={{
            marginTop: "12px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
            fontSize: "12px",
            fontWeight: 600,
          }}>
            {importStatus}
          </div>
        )}
      </div>

      {/* Main Data Studio Tabs (Documents | Claim Bank | Collateral | Manifests) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* Navigation Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div className="segmented-control" style={{ maxWidth: "560px", width: "100%" }}>
            {[
              { id: "documents", label: "Ingested Documents", count: documents.length, icon: FileText },
              { id: "claims", label: "Claim Bank Catalog", count: claims.length, icon: Database },
              { id: "collateral", label: "Collateral Archive", count: collateral.length, icon: Share2 },
              { id: "manifests", label: "Audit Ledger", count: manifests.length, icon: KeyRound },
            ].map((t) => {
              const IconC = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`segmented-control-btn ${activeTab === t.id ? "active" : ""}`}
                  style={{ padding: "8px 14px", fontSize: "13px" }}
                >
                  <IconC size={14} />
                  {t.label} ({t.count})
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => {
                if (confirm("Reset all user data to initial enterprise defaults?")) {
                  StorageService.resetDefaults();
                  refreshData();
                }
              }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "12px", color: "#94a3b8" }}
            >
              Reset Mock Data
            </button>
          </div>
        </div>

        {/* TAB 1: Ingested Documents */}
        {activeTab === "documents" && (
          <div className="studio-card">
            <div className="studio-card-header">
              <div>
                <h3 className="text-card-title">Processed Document Repository</h3>
                <div className="text-meta">Manage source files, parsed markdown, and extracted assertions</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="claim-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 20px",
                    cursor: "default",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#fff7ed",
                      border: "1px solid rgba(249, 115, 22, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <FileText size={20} color="#ea580c" />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                          {doc.title}
                        </span>
                        <span className="font-mono text-meta" style={{
                          color: "#c2410c",
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}>
                          {doc.id}
                        </span>
                        <span className={`badge-pill ${getBadgeClass(doc.highestSensitivity)}`}>
                          {doc.highestSensitivity}
                        </span>
                      </div>

                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "600px" }}>
                        {doc.summary}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right", marginRight: "6px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                        {doc.claimCount} Claims
                      </div>
                      <div className="text-meta" style={{ fontSize: "11px" }}>
                        {doc.date}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectDocumentForStudio(doc)}
                      className="btn btn-primary btn-sm"
                      style={{ gap: "6px", fontSize: "12px" }}
                    >
                      <Sparkles size={13} />
                      Launch in Studio
                    </button>

                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#ef4444", width: "32px", padding: 0 }}
                      title="Delete document"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Claim Bank Catalog */}
        {activeTab === "claims" && (
          <div className="studio-card">
            <div className="studio-card-header">
              <div>
                <h3 className="text-card-title">Atomic Claim Bank Catalog</h3>
                <div className="text-meta">Searchable database of authoritative assertions with coordinate anchors</div>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", minWidth: "220px" }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assertions..."
                    style={{ height: "36px", paddingLeft: "32px", fontSize: "13px" }}
                  />
                  <Search size={14} color="#ea580c" style={{ position: "absolute", left: "10px", top: "11px" }} />
                </div>

                <select
                  value={selectedSensitivity}
                  onChange={(e) => setSelectedSensitivity(e.target.value)}
                  style={{ height: "36px", fontSize: "12px", width: "140px" }}
                >
                  <option value="ALL">All Levels</option>
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredClaims.map((claim) => (
                <div key={claim.claim_id} className="claim-row" style={{ cursor: "default", padding: "14px 18px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="font-mono text-meta" style={{
                          color: "#c2410c",
                          background: "#fff7ed",
                          border: "1px solid #fed7aa",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}>
                          {claim.source_pointer}
                        </span>
                        <span className={`badge-pill ${getBadgeClass(claim.sensitivity_label)}`}>
                          {claim.sensitivity_label}
                        </span>
                        <span className="font-mono text-meta" style={{ color: "#64748b" }}>
                          ID: {claim.claim_id}
                        </span>
                      </div>

                      <span className="text-meta" style={{ color: "#047857", fontWeight: 600 }}>
                        {((claim.confidence || 0.98) * 100).toFixed(0)}% Fidelity
                      </span>
                    </div>

                    <p style={{ fontSize: "14px", lineHeight: 1.5, color: "#0f172a", margin: 0 }}>
                      {claim.statement}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopy(claim.statement, claim.claim_id)}
                    className="btn btn-secondary btn-sm"
                    style={{ height: "30px", fontSize: "12px", flexShrink: 0 }}
                  >
                    {copiedId === claim.claim_id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Collateral Archive */}
        {activeTab === "collateral" && (
          <div className="studio-card">
            <div className="studio-card-header">
              <div>
                <h3 className="text-card-title">Generated Multi-Channel Collateral Archive</h3>
                <div className="text-meta">Historical outputs rendered under operator governance constraints</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {collateral.map((item) => (
                <div key={item.id} className="claim-row" style={{ cursor: "default", padding: "18px 20px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        {item.title}
                      </span>
                      <span className="badge-pill badge-confidential" style={{ fontSize: "11px" }}>
                        {item.channel.replace("_", " ").toUpperCase()}
                      </span>
                      <span className={`badge-pill ${getBadgeClass(item.disclosureLevel)}`}>
                        {item.disclosureLevel}
                      </span>
                      <span className="text-meta" style={{ color: "#047857", fontWeight: 600 }}>
                        {item.status}
                      </span>
                    </div>

                    <p style={{
                      fontSize: "13.5px",
                      lineHeight: 1.6,
                      color: "#334155",
                      background: "#fffdfa",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid rgba(245, 158, 11, 0.2)",
                      margin: "8px 0 0",
                    }}>
                      "{item.preview}"
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, marginLeft: "16px" }}>
                    <button
                      onClick={() => handleCopy(item.preview, item.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ height: "32px", fontSize: "12px", gap: "5px" }}
                    >
                      {copiedId === item.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      Copy Output
                    </button>

                    <button
                      onClick={() => handleDeleteCollateral(item.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ height: "30px", fontSize: "11px", color: "#ef4444" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Audit Manifest Ledger */}
        {activeTab === "manifests" && (
          <div className="studio-card">
            <div className="studio-card-header">
              <div>
                <h3 className="text-card-title">Cryptographic Audit Manifest Ledger</h3>
                <div className="text-meta">Tamper-sealed provenance records and published cryptographic hashes</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {manifests.map((man) => (
                <div key={man.provenance_id} className="claim-row" style={{ cursor: "default", padding: "18px 20px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <span className="font-mono text-meta" style={{
                        color: "#ea580c",
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 700,
                      }}>
                        {man.provenance_id}
                      </span>
                      <span className="badge-pill badge-public">
                        {man.status}
                      </span>
                      <span className="badge-pill badge-confidential">
                        {man.channel.toUpperCase()}
                      </span>
                      <span className="text-meta" style={{ color: "#64748b" }}>
                        Signer: <strong style={{ color: "#0f172a" }}>{man.approver}</strong>
                      </span>
                      <span className="text-meta">
                        {new Date(man.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "#fef8ee",
                      border: "1px solid rgba(245, 158, 11, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}>
                      <div className="font-mono" style={{ fontSize: "11px", color: "#c2410c", wordBreak: "break-all", fontWeight: 600 }}>
                        SHA-256: {man.integrity_hash}
                      </div>

                      <button
                        onClick={() => handleCopy(man.integrity_hash, man.provenance_id)}
                        className="btn btn-ghost btn-sm"
                        style={{ height: "26px", padding: "0 8px", fontSize: "11px" }}
                      >
                        {copiedId === man.provenance_id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, marginLeft: "16px" }}>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "var(--radius-pill)",
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      color: "#047857",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}>
                      <ShieldCheck size={14} color="#10b981" />
                      Seal Untampered
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
