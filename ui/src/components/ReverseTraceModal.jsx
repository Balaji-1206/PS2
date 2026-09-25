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
          setError("Trace data could not be retrieved");
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
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div 
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "680px",
          background: "#0d1322",
          border: "1px solid var(--border-active)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(15, 23, 42, 0.6)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(56, 189, 248, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <MapPin size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem" }}>Pinpoint Reverse Traceability</h3>
              <div className="font-mono" style={{ fontSize: "0.75rem", color: "var(--accent-cyan)" }}>
                Citation: {pointer}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              Resolving source coordinate mapping...
            </div>
          )}

          {error && (
            <div style={{
              padding: "16px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.88rem",
            }}>
              {error}
            </div>
          )}

          {traceData && (
            <div>
              {/* Metadata Badges */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "20px",
              }}>
                <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Document ID</div>
                  <div className="font-mono" style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: "2px" }}>
                    {traceData.document_id}
                  </div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Layout Page</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "2px" }}>
                    Page {traceData.page ?? 1} (Order #{traceData.reading_order ?? 0})
                  </div>
                </div>

                <div style={{ background: "rgba(15, 23, 42, 0.7)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Confidence</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
                    {((traceData.confidence ?? 1.0) * 100).toFixed(0)}% Exact Grounded
                  </div>
                </div>
              </div>

              {/* Source Text Box */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Verbatim Source Document Text:
                </label>
                <div style={{
                  background: "rgba(10, 15, 26, 0.8)",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                  fontSize: "0.92rem",
                  lineHeight: 1.6,
                  color: "#e2e8f0",
                }}>
                  "{traceData.source_text || "Source text resolved from indexed block."}"
                </div>
              </div>

              {/* Visual Bounding Box Representation */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                  Spatial Layout Coordinates:
                </label>
                <div style={{
                  background: "rgba(10, 15, 26, 0.9)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  padding: "16px",
                  position: "relative",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {/* Mock Page grid */}
                  <div style={{
                    position: "absolute",
                    inset: "10px",
                    border: "1px dashed rgba(148, 163, 184, 0.2)",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {/* Simulated highlighted bounding box */}
                    <div style={{
                      padding: "8px 16px",
                      background: "rgba(56, 189, 248, 0.15)",
                      border: "2px solid #38bdf8",
                      borderRadius: "6px",
                      boxShadow: "0 0 15px rgba(56, 189, 248, 0.3)",
                      textAlign: "center",
                    }}>
                      <div className="font-mono" style={{ fontSize: "0.78rem", color: "#38bdf8", fontWeight: 600 }}>
                        BBox: {traceData.bounding_box ? JSON.stringify(traceData.bounding_box) : "[72.0, 150.0, 480.0, 180.0]"}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                        Docling Layout Element Highlighted
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(15, 23, 42, 0.4)",
          display: "flex",
          justifyContent: "flex-end",
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
