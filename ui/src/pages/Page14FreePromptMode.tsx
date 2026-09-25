import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  Sparkles, 
  AlertOctagon, 
  Play, 
  AlertTriangle, 
  ShieldOff
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Page14FreePromptMode: React.FC = () => {
  const { 
    freePromptInput, 
    setFreePromptInput, 
    freePromptOutput, 
    generateFreePrompt 
  } = usePramaan();

  return (
    <div className="space-y-8 p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs uppercase tracking-wider">
            <ShieldOff className="w-4 h-4" /> Ungrounded Sandbox Path
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">FREE-PROMPT MODE</h1>
          <p className="text-sm text-slate-500 mt-1">Direct ungrounded model execution without source claims or governance validation.</p>
        </div>

        <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-300 flex items-center gap-1.5">
          <AlertOctagon className="w-4 h-4 text-rose-600" /> UNGOVERNED PATH
        </span>
      </div>

      {/* PROMINENT WARNING BANNER */}
      <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-4 text-rose-900 shadow-sm">
        <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-rose-950">
            WARNING: NO SOURCE CLAIMS AVAILABLE
          </h3>
          <p className="text-xs leading-relaxed text-rose-800">
            Content generated in Free-Prompt Mode is ungrounded and bypasses the PRAMAAN Dual Verification pipeline. Artifacts produced here are permanently tagged as <strong>MODEL-GENERATED / UNVERIFIED</strong> and cannot enter the trusted enterprise output registry.
          </p>
        </div>
      </div>

      {/* FREE PROMPT INPUT ZONE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-600" /> Enter Ungrounded Free-Form Prompt
        </label>

        <textarea
          rows={5}
          value={freePromptInput}
          onChange={(e) => setFreePromptInput(e.target.value)}
          placeholder="e.g. Create an executive summary about quantum computing trends in 2026..."
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500 font-sans"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 font-mono">No document attached</span>
          <button
            onClick={generateFreePrompt}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Synthesize Ungrounded Text</span>
          </button>
        </div>
      </div>

      {/* GENERATED UNVERIFIED OUTPUT DISPLAY */}
      {freePromptOutput && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl border-2 border-rose-500 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
              <h3 className="text-sm font-extrabold text-rose-400 tracking-wide uppercase">
                ⚠ UNVERIFIED ARTIFACT — MODEL-GENERATED
              </h3>
            </div>
            <StatusBadge status="UNVERIFIED" />
          </div>

          <div className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-300 leading-relaxed border border-slate-800 space-y-2">
            <p className="text-amber-400 font-bold">[SYSTEM TAG: Bypassed Dual Gate Verification]</p>
            <p className="whitespace-pre-wrap">{freePromptOutput}</p>
          </div>

          <div className="p-3 bg-rose-950/60 rounded-xl border border-rose-800/80 text-[11px] text-rose-300 flex items-center justify-between">
            <span>
              🔒 Restricted: This artifact cannot be cryptographically signed or added to the provenance ledger.
            </span>
            <span className="font-mono text-rose-400 font-bold">DISALLOWED FROM PUBLICATION</span>
          </div>
        </div>
      )}
    </div>
  );
};
