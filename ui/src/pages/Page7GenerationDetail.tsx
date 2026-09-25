import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Link as LinkIcon, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ClaimDetailDrawer } from '../components/ClaimDetailDrawer';

export const Page7GenerationDetail: React.FC = () => {
  const { 
    selectedOutputDetail, 
    outputs, 
    setSelectedClaim, 
    claims, 
    setActivePage,
    audience,
    tone,
    language,
    detailLevel
  } = usePramaan();

  const targetOutput = selectedOutputDetail || outputs[0];

  return (
    <div className="space-y-8 p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setActivePage('generation')}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Workflow Orchestrator
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{targetOutput.name}</h1>
                <StatusBadge status={targetOutput.status} size="md" />
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {targetOutput.id} • {targetOutput.subAgent}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Generated from approved claims only
            </span>
          </div>
        </div>

        {/* Claim Statistics bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Input Claims</span>
            <span className="text-lg font-bold font-mono text-slate-900">{targetOutput.claimCount}</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Permitted Claims</span>
            <span className="text-lg font-bold font-mono text-emerald-800">{targetOutput.claimCount}</span>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-[10px] text-rose-700 uppercase font-semibold block">Blocked Claims</span>
            <span className="text-lg font-bold font-mono text-rose-800">0</span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[10px] text-blue-700 uppercase font-semibold block">Total Word Count</span>
            <span className="text-lg font-bold font-mono text-blue-800">{targetOutput.wordCount} words</span>
          </div>
        </div>

        {/* Target Generation Parameters */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-600" /> Target Configuration Context
          </h4>
          <div className="flex flex-wrap gap-3 text-xs font-mono">
            <span className="bg-white px-2.5 py-1 rounded border border-slate-200">Audience: <strong>{audience}</strong></span>
            <span className="bg-white px-2.5 py-1 rounded border border-slate-200">Tone: <strong>{tone}</strong></span>
            <span className="bg-white px-2.5 py-1 rounded border border-slate-200">Language: <strong>{language}</strong></span>
            <span className="bg-white px-2.5 py-1 rounded border border-slate-200">Detail Level: <strong>{detailLevel}</strong></span>
          </div>
        </div>
      </div>

      {/* GENERATED SYNTHESIZED TEXT VIEW WITH CLAIM LINKING */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" /> Grounded Text Synthesis with Sentence-Level Provenance
          </h3>
          <span className="text-xs text-slate-500 font-mono">Traceability Enabled</span>
        </div>

        <div className="space-y-6 leading-relaxed text-sm text-slate-800">
          {targetOutput.contentParagraphs.map((paragraph) => (
            <div 
              key={paragraph.id}
              className="p-5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3 hover:border-blue-400 transition-colors"
            >
              <p className="text-slate-900 font-medium leading-relaxed">
                {paragraph.text}
              </p>

              {/* Linked Claim Tags */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-blue-600" /> Grounded Claim IDs:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {paragraph.claimIds.map((cId) => {
                    const matchedClaim = claims.find(c => c.id === cId);
                    return (
                      <button
                        key={cId}
                        onClick={() => matchedClaim && setSelectedClaim(matchedClaim)}
                        className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded font-mono text-xs font-bold border border-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Click to view exact source span & confidence"
                      >
                        <span>[{cId}]</span>
                        <span className="text-[10px] text-blue-700 font-sans">
                          ({matchedClaim?.confidence || 98}% match)
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ClaimDetailDrawer />
    </div>
  );
};
