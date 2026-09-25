import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { X, FileText, Shield, Percent, Layers, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const ClaimDetailDrawer: React.FC = () => {
  const { selectedClaim, setSelectedClaim, setActivePage } = usePramaan();

  if (!selectedClaim) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 overflow-y-auto">
        {/* Header */}
        <div>
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                  {selectedClaim.id}
                </span>
                <StatusBadge status={selectedClaim.status} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">Claim Inspection & Lineage</h3>
            </div>
            <button
              onClick={() => setSelectedClaim(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Claim Statement */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Extracted Claim Statement
              </label>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed">
                "{selectedClaim.claim}"
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Source Document
                </span>
                <p className="text-xs font-bold text-slate-800 font-mono truncate">{selectedClaim.sourceDoc}</p>
                <p className="text-[10px] text-slate-500">Page Number: <strong>{selectedClaim.page}</strong></p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-600" /> Extraction Confidence
                </span>
                <p className="text-xs font-bold text-emerald-700 font-mono">{selectedClaim.confidence}% Confidence</p>
                <p className="text-[10px] text-slate-500">NLI & Layout Verified</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-600" /> Sensitivity Class
                </span>
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                  selectedClaim.sensitivity === 'PUBLIC' ? 'bg-emerald-100 text-emerald-800' :
                  selectedClaim.sensitivity === 'INTERNAL' ? 'bg-blue-100 text-blue-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {selectedClaim.sensitivity}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-600" /> Linked Entity
                </span>
                <p className="text-xs font-bold text-slate-800">{selectedClaim.entity}</p>
              </div>
            </div>

            {/* Source Span Context */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Verbatim Source Span (Exact Document Location)
              </label>
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs font-mono text-slate-800 leading-relaxed">
                {selectedClaim.sourceSpan}
              </div>
            </div>

            {/* Dependent Outputs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                Dependent Output Artifacts ({selectedClaim.dependentOutputs.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedClaim.dependentOutputs.map((out, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-slate-400" />
                    {out}
                  </span>
                ))}
                {selectedClaim.dependentOutputs.length === 0 && (
                  <p className="text-xs text-rose-600 font-medium">None (Claim is blocked by disclosure policy)</p>
                )}
              </div>
            </div>

            {/* If Blocked Warning */}
            {selectedClaim.reasonIfBlocked && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Blocked Reason:</strong> {selectedClaim.reasonIfBlocked}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedClaim(null);
              setActivePage('reverse-trace');
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Open Reverse Lineage Graph →
          </button>
          <button
            onClick={() => setSelectedClaim(null)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
