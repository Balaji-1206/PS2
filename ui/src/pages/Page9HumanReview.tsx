import React, { useState } from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  UserCheck, 
  Check, 
  Edit3, 
  X, 
  Clock, 
  Bot, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Page9HumanReview: React.FC = () => {
  const { reviews, approveReviewItem, setActivePage, setCurrentStageId, showToast } = usePramaan();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');

  const pendingCount = reviews.filter(r => r.status === 'PENDING').length;

  const handleStartEdit = (revId: string, currentText: string) => {
    setEditingId(revId);
    setEditedText(currentText);
  };

  const handleSaveEdit = (revId: string) => {
    approveReviewItem(revId);
    setEditingId(null);
    showToast('Operator modifications saved and item approved.');
  };

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider">
            <UserCheck className="w-4 h-4" /> Human-in-the-Loop Governance
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">HUMAN REVIEW & APPROVAL</h1>
          <p className="text-sm text-slate-500 mt-1">Operator verification queue for flagged entailments and high-impact disclosures.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold font-mono px-3 py-1.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
            {pendingCount} Items Require Attention
          </span>

          <button
            onClick={() => {
              setActivePage('provenance');
              setCurrentStageId('signing');
            }}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Provenance & Signing →</span>
          </button>
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-6">
        {reviews.map((item) => (
          <div 
            key={item.id}
            className={`bg-white rounded-2xl border p-6 shadow-sm space-y-6 transition-all ${
              item.status === 'APPROVED' ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
            }`}
          >
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-900 rounded">
                  {item.id}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.outputName}</h3>
                  <p className="text-xs text-slate-500">Flagged Claim: <strong className="font-mono text-blue-600">[{item.claimId}]</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={item.status} size="md" />
              </div>
            </div>

            {/* Flag Reason Banner */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Flag Reason:</strong> {item.flagReason}</span>
            </div>

            {/* SIDE-BY-SIDE COMPARISON */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: GENERATED CONTENT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-amber-600" /> Synthesized Output Content
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Machine Authored</span>
                </div>

                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full p-3 bg-white border-2 border-blue-500 rounded-xl text-xs font-medium text-slate-900 focus:outline-none h-28"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                      >
                        Save & Approve
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed font-medium min-h-[90px]">
                    "{item.generatedContent}"
                  </div>
                )}
              </div>

              {/* RIGHT: ORIGINAL SOURCE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" /> Grounding Source Document Span
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Page {item.pageNumber}</span>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-slate-800 font-mono leading-relaxed min-h-[90px]">
                  {item.originalSourceSnippet}
                </div>
              </div>
            </div>

            {/* AUTHORSHIP BADGES & TIMELINE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              {/* Authorship */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lineage Authorship Metadata</span>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    Machine: {item.authorship.machineAuthored}
                  </span>
                  {item.authorship.operatorModified && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                      Operator: {item.authorship.operatorModified}
                    </span>
                  )}
                  {item.authorship.reviewerApproved && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200 font-bold">
                      Approved: {item.authorship.reviewerApproved}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Timeline */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Review Audit Trail</span>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 overflow-x-auto">
                  {item.timeline.map((tl, idx) => (
                    <React.Fragment key={idx}>
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                        {tl.time} — {tl.action}
                      </span>
                      {idx < item.timeline.length - 1 && <span className="text-slate-300">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex items-center justify-end gap-3">
              {item.status === 'PENDING' ? (
                <>
                  <button
                    onClick={() => handleStartEdit(item.id, item.generatedContent)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Sentence
                  </button>

                  <button
                    onClick={() => {
                      approveReviewItem(item.id);
                      showToast(`Review item ${item.id} rejected.`);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-rose-600" /> Reject
                  </button>

                  <button
                    onClick={() => approveReviewItem(item.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Approve Statement
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Human Approved & Locked
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
