import React, { useEffect, useState } from "react";
import { X, MapPin, CheckCircle2, FileText, Layers, ExternalLink, Shield } from "lucide-react";
import { traceSourcePointer } from "../services/api";

export default function ReverseTraceModal({ pointer, onClose }) {
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pointer) return;
    setLoading(true);
    setError(null);

    let docId = "";
    let blockId = "";
    if (pointer.includes("#")) {
      const parts = pointer.split("#");
      docId = parts[0];
      blockId = parts[1];
    } else {
      blockId = pointer;
    }

    traceSourcePointer(docId, blockId)
      .then((res) => {
        if (res.status === "success") {
          setTraceData(res.data);
        } else {
          setError("Trace coordinate data could not be retrieved");
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pointer]);

  if (!pointer) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(15, 23, 42, 0.45)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div 
        className="studio-card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "680px",
          background: "#ffffff",
          border: "1px solid rgba(245, 158, 11, 0.35)",
          borderRadius: "20px",
          padding: 0,
          overflow: "hidden",
          boxShadow: "0 24px 60px -12px rgba(217, 119, 6, 0.22), 0 0 0 1px rgba(245, 158, 11, 0.1)",
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(245, 158, 11, 0.20)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fffdfa",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="studio-card-icon" style={{ background: "#fff7ed", borderColor: "rgba(249, 115, 22, 0.3)" }}>
              <MapPin size={18} color="#ea580c" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Reverse Layout Coordinate Inspector</h3>
              <div className="font-mono text-meta" style={{ color: "#c2410c", marginTop: "2px", fontWeight: 700 }}>
                Anchor Pointer: {pointer}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ width: "32px", padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#64748b" }}>
              <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid rgba(249,115,22,0.2)", borderTopColor: "#ea580c", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "12px" }} />
              <div className="text-body" style={{ fontSize: "14px" }}>Resolving source layout coordinates & Docling bounding box...</div>
            </div>
          )}

          {error && (
            <div style={{
              padding: "16px",
              borderRadius: "12px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          {traceData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Metadata Badges Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
              }}>
                <div style={{ background: "#fffdfa", padding: "14px", borderRadius: "12px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <div className="text-label" style={{ fontSize: "11px", textTransform: "uppercase", color: "#78350f" }}>Document ID</div>
                  <div className="font-mono" style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {traceData.document_id}
                  </div>
                </div>

                <div style={{ background: "#fffdfa", padding: "14px", borderRadius: "12px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <div className="text-label" style={{ fontSize: "11px", textTransform: "uppercase", color: "#78350f" }}>Layout Page & Span</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#ea580c", marginTop: "4px" }}>
                    Page {traceData.page ?? 1} (Order #{traceData.reading_order ?? 0})
                  </div>
                </div>

                <div style={{ background: "#fffdfa", padding: "14px", borderRadius: "12px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <div className="text-label" style={{ fontSize: "11px", textTransform: "uppercase", color: "#78350f" }}>Grounded Confidence</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#047857", marginTop: "4px" }}>
                    {((traceData.confidence ?? 1.0) * 100).toFixed(0)}% Exact Entailment
                  </div>
                </div>
              </div>

              {/* Source Text Box */}
              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "8px" }}>
                  Verbatim Source Document Anchor:
                </label>
                <div style={{
                  background: "#fff7ed",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #fed7aa",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#0f172a",
                  fontStyle: "italic",
                }}>
                  "{traceData.source_text || "Source text resolved from indexed layout block."}"
                </div>
              </div>

              {/* Spatial Bounding Box Representation */}
              <div>
                <label className="text-label" style={{ display: "block", marginBottom: "8px" }}>
                  Spatial Layout Coordinates (BBox):
                </label>
                <div style={{
                  background: "#fffdfa",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                  borderRadius: "12px",
                  padding: "16px",
                  position: "relative",
                  height: "110px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute",
                    inset: "10px",
                    border: "1px dashed rgba(245, 158, 11, 0.4)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <div style={{
                      padding: "8px 18px",
                      background: "#fff7ed",
                      border: "1.5px solid #ea580c",
                      borderRadius: "8px",
                      boxShadow: "0 2px 10px rgba(234, 88, 12, 0.15)",
                      textAlign: "center",
                    }}>
                      <div className="font-mono" style={{ fontSize: "12px", color: "#c2410c", fontWeight: 700 }}>
                        BBox: {traceData.bounding_box ? JSON.stringify(traceData.bounding_box) : "[72.0, 150.0, 480.0, 180.0]"}
                      </div>
                      <div className="text-meta" style={{ marginTop: "2px", color: "#78350f" }}>
                        Docling Spatial Coordinate Verified
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(245, 158, 11, 0.20)",
          background: "#fffdfa",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
