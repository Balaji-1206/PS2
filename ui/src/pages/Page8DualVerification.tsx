import React, { useState } from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import { 
  GATE1_SAMPLE_ITEMS, 
  GATE2_SAMPLE_ITEMS 
} from '../data/verification';
import { StatusBadge } from '../components/StatusBadge';

export const Page8DualVerification: React.FC = () => {
  const { setActivePage, setCurrentStageId, setSelectedClaim, claims } = usePramaan();
  const [activeTab, setActiveTab] = useState<'gate1' | 'gate2'>('gate1');

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Dual Verification Module
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">DUAL VERIFICATION GATES</h1>
          <p className="text-sm text-slate-500 mt-1">Rigorous double-pass verification: Gate 1 Entailment & Gate 2 Audience Privilege Policy.</p>
        </div>

        <button
          onClick={() => {
            setActivePage('review');
            setCurrentStageId('review');
          }}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Proceed to Human Review →</span>
        </button>
      </div>

      {/* TWO-STAGE VISUAL TRACKER PIPELINE */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          Dual Verification Gateway Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* GATE 1 BOX */}
          <button
            onClick={() => setActiveTab('gate1')}
            className={`p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
              activeTab === 'gate1'
                ? 'bg-purple-950/70 border-purple-500 ring-2 ring-purple-400'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                GATE 1
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 29 Passed / 2 Review
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-white mt-3">FIDELITY GATE</h4>
            <p className="text-xs text-purple-200 mt-1 font-semibold">&quot;Is it supported by the source?&quot;</p>

            <div className="mt-4 pt-3 border-t border-slate-700/80 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
              <div>Checked: <strong>31</strong></div>
              <div>Passed: <strong className="text-emerald-400">29</strong></div>
              <div>Review: <strong className="text-amber-400">2</strong></div>
            </div>
          </button>

          {/* GATE 2 BOX */}
          <button
            onClick={() => setActiveTab('gate2')}
            className={`p-6 rounded-xl border-2 text-left transition-all cursor-pointer ${
              activeTab === 'gate2'
                ? 'bg-purple-950/70 border-purple-500 ring-2 ring-purple-400'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                GATE 2
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 34 Allowed / 1 Blocked
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-white mt-3">DISCLOSURE GATE</h4>
            <p className="text-xs text-purple-200 mt-1 font-semibold">&quot;Is it allowed for this audience?&quot;</p>

            <div className="mt-4 pt-3 border-t border-slate-700/80 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
              <div>Checked: <strong>35</strong></div>
              <div>Allowed: <strong className="text-emerald-400">34</strong></div>
              <div>Blocked: <strong className="text-rose-400">1</strong></div>
            </div>
          </button>
        </div>
      </div>

      {/* GATE DETAILS TABBED CONTENT */}
      {activeTab === 'gate1' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">GATE 1 — FIDELITY VERIFICATION DETAILS</h3>
              <p className="text-xs text-slate-500">Sentence-level source entailment & exact numerical matching.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                Checks: Claim Traceability • Exact Match • NLI Entailment
              </span>
            </div>
          </div>

          {/* Sample Sentence-Level Verification Cards */}
          <div className="space-y-4">
            {GATE1_SAMPLE_ITEMS.map((item) => (
              <div 
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  item.status === 'PASS' 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-amber-50/50 border-amber-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{item.id}</span>
                    <span className="text-xs font-mono font-semibold text-blue-600">[{item.sourceClaimId}]</span>
                    <span className="text-xs text-slate-400 font-mono">Page {item.pageNumber}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.exactValueMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.exactValueMatch ? '✓ EXACT VALUE' : '⚠ VALUE DIFF'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.sourceMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.sourceMatch ? '✓ SOURCE MATCH' : '⚠ UNMATCHED'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.entailed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.entailed ? '✓ ENTAILED' : '⚠ REVIEW REQUIRED'}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Synthesized Generated Sentence</span>
                    <p className="font-semibold text-slate-900 bg-white p-3 rounded-lg border border-slate-200">
                      "{item.generatedText}"
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Grounding Source Document Claim</span>
                    <p className="font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                      "{item.sourceText}"
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-600">
                  <span className="italic">{item.notes}</span>
                  {item.status === 'REVIEW' && (
                    <button
                      onClick={() => {
                        const matched = claims.find(c => c.id === item.sourceClaimId);
                        if (matched) setSelectedClaim(matched);
                      }}
                      className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 cursor-pointer"
                    >
                      Inspect Item
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">GATE 2 — DISCLOSURE POLICY EVALUATION</h3>
              <p className="text-xs text-slate-500">Audience access privilege & privacy guardrail checks.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-800 rounded border border-purple-200">
                Audience Rules • Sensitivity Matrix • PII Checks
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {GATE2_SAMPLE_ITEMS.map((item) => (
              <div 
                key={item.id}
                className={`p-5 rounded-2xl border ${
                  item.status === 'ALLOWED' ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/50 border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{item.id}</span>
                    <span className="font-mono text-xs font-bold text-blue-600">[{item.claimId}]</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.sensitivity === 'PUBLIC' ? 'bg-emerald-100 text-emerald-800' :
                      item.sensitivity === 'INTERNAL' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.sensitivity}
                    </span>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <div className="pt-3 space-y-2 text-xs">
                  <p className="font-semibold text-slate-900 bg-white p-3 rounded-lg border border-slate-200">
                    "{item.claimText}"
                  </p>
                  <p className="text-slate-600">
                    <strong>Rule Triggered:</strong> <span className="font-mono text-slate-800">{item.ruleTriggered}</span>
                  </p>
                  <p className="text-slate-500">
                    <strong>Reasoning:</strong> {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
