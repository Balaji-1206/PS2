import React, { useState } from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  GitBranch, 
  Search, 
  CheckCircle2, 
  ArrowDown
} from 'lucide-react';
import { ClaimDetailDrawer } from '../components/ClaimDetailDrawer';

export const Page12ReverseTraceability: React.FC = () => {
  const { signatureHash, setSelectedClaim, claims, showToast } = usePramaan();
  const [artifactId, setArtifactId] = useState('PRM-2026-00142');
  const [activeNode, setActiveNode] = useState<string>('CLAIM-001');

  const selectedClaimItem = claims.find(c => c.id === 'CLM-001') || claims[0];

  const handleLookup = () => {
    showToast(`Authenticity verified for ${artifactId}. Reverse lineage graph constructed.`);
  };

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
            <GitBranch className="w-4 h-4" /> Reverse Traceability Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">VERIFY & REVERSE TRACEABILITY</h1>
          <p className="text-sm text-slate-500 mt-1">Audit any published sentence back to exact source document coordinates & page spans.</p>
        </div>
      </div>

      {/* Artifact Lookup Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
          Enter Published Artifact Identifier or Fingerprint Hash
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={artifactId}
              onChange={(e) => setArtifactId(e.target.value)}
              placeholder="e.g. PRM-2026-00142"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleLookup}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Verify Authenticity
          </button>
        </div>

        {/* Verification Result Banner */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-emerald-950">AUTHENTICITY VERIFIED ✓</p>
              <p className="font-mono text-[11px] text-emerald-800">Hash Match: {signatureHash}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-md font-bold border border-emerald-300">
            STABLE PROVENANCE
          </span>
        </div>
      </div>

      {/* REVERSE LINEAGE GRAPH VISUALIZATION */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-400" /> Interactive Reverse Lineage Graph Node Tree
          </h3>
          <span className="text-xs font-mono text-emerald-400">Click any node to inspect details</span>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto text-center">
          {/* NODE 1: PUBLISHED ARTIFACT */}
          <button
            onClick={() => setActiveNode('PUBLISHED')}
            className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
              activeNode === 'PUBLISHED'
                ? 'bg-blue-950 border-blue-500 ring-2 ring-blue-400'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-blue-400">PUBLISHED ARTIFACT</span>
              <span className="text-[10px] font-mono text-slate-400">ID: {artifactId}</span>
            </div>
            <p className="text-sm font-bold text-white mt-1">Executive Summary (FY2026)</p>
          </button>

          <ArrowDown className="w-6 h-6 text-blue-400 animate-bounce" />

          {/* NODE 2: OUTPUT SENTENCE */}
          <button
            onClick={() => setActiveNode('SENTENCE')}
            className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
              activeNode === 'SENTENCE'
                ? 'bg-purple-950 border-purple-500 ring-2 ring-purple-400'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-purple-400">OUTPUT SENTENCE</span>
              <span className="text-[10px] font-mono text-slate-400">Paragraph 1, Sentence 1</span>
            </div>
            <p className="text-xs font-mono text-purple-200 mt-1">
              "Revenue increased by 18% during the reporting period."
            </p>
          </button>

          <ArrowDown className="w-6 h-6 text-purple-400 animate-bounce" />

          {/* NODE 3: CLAIM-001 */}
          <button
            onClick={() => setSelectedClaim(selectedClaimItem)}
            className="w-full p-4 bg-emerald-950 border-2 border-emerald-500 rounded-xl transition-all cursor-pointer text-left ring-2 ring-emerald-400 hover:bg-emerald-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-emerald-400">GROUNDED CLAIM NODE</span>
              <span className="text-xs font-mono font-extrabold px-2 py-0.5 bg-emerald-500 text-slate-950 rounded">
                CLM-001 (98% Conf)
              </span>
            </div>
            <p className="text-xs font-mono text-emerald-200 mt-1">
              "Revenue increased by 18% during fiscal year 2026."
            </p>
            <span className="text-[10px] text-emerald-400 block mt-2 font-bold">➔ Click to inspect full claim drawer</span>
          </button>

          <ArrowDown className="w-6 h-6 text-emerald-400 animate-bounce" />

          {/* NODE 4: SOURCE SPAN */}
          <button
            onClick={() => setActiveNode('SPAN')}
            className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
              activeNode === 'SPAN'
                ? 'bg-amber-950 border-amber-500 ring-2 ring-amber-400'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-amber-400">VERBATIM SOURCE SPAN</span>
              <span className="text-[10px] font-mono text-slate-400">Bounding Box: [42, 180, 420, 68]</span>
            </div>
            <p className="text-xs font-mono text-amber-200 mt-1">
              "Total consolidated revenue reached $4.2B, representing an 18% YoY increase..."
            </p>
          </button>

          <ArrowDown className="w-6 h-6 text-amber-400 animate-bounce" />

          {/* NODE 5: SOURCE DOCUMENT & PAGE 4 */}
          <button
            onClick={() => setActiveNode('DOCUMENT')}
            className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
              activeNode === 'DOCUMENT'
                ? 'bg-rose-950 border-rose-500 ring-2 ring-rose-400'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-rose-400">SOURCE DOCUMENT & PAGE LOCATION</span>
              <span className="text-xs font-mono font-bold text-rose-300">PAGE 4</span>
            </div>
            <p className="text-sm font-bold text-white mt-1">Annual_Report_2026.pdf (Section 3.1)</p>
          </button>
        </div>
      </div>

      <ClaimDetailDrawer />
    </div>
  );
};
