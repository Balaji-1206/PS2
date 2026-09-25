import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { Filter, ArrowDown, Lock, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Page5DisclosureSubset: React.FC = () => {
  const { disclosureLevel, claims, setActivePage, setCurrentStageId } = usePramaan();

  const totalCount = 47;
  const publicCount = 31;
  const internalCount = 10;
  const confidentialCount = 6;

  const permittedCount = disclosureLevel === 'PUBLIC' ? publicCount : disclosureLevel === 'INTERNAL' ? (publicCount + internalCount) : totalCount;
  const blockedCount = totalCount - permittedCount;

  const blockedClaimsList = claims.filter(c => c.sensitivity === 'CONFIDENTIAL');

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4" /> Claim Subset & Governance Control
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">PERMITTED CLAIM SET</h1>
          <p className="text-sm text-slate-500 mt-1">Resolve permitted content before generation. Renderers NEVER receive blocked claims.</p>
        </div>

        <button
          onClick={() => {
            setActivePage('generation');
            setCurrentStageId('generation');
          }}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Launch Workflow Orchestrator →</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Claims</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{totalCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
          <span className="text-xs text-emerald-700 font-semibold uppercase">Public Claims</span>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1 font-mono">{publicCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30">
          <span className="text-xs text-blue-700 font-semibold uppercase">Internal Claims</span>
          <p className="text-2xl font-extrabold text-blue-800 mt-1 font-mono">{internalCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30">
          <span className="text-xs text-rose-700 font-semibold uppercase">Confidential</span>
          <p className="text-2xl font-extrabold text-rose-800 mt-1 font-mono">{confidentialCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-300 bg-amber-50">
          <span className="text-xs text-amber-800 font-semibold uppercase">Active Policy</span>
          <p className="text-lg font-extrabold text-amber-900 mt-1 font-mono uppercase">{disclosureLevel}</p>
        </div>
      </div>

      {/* VISUAL DISCLOSURE PIPELINE */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          Deterministic Disclosure Filtering Flow
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center max-w-4xl mx-auto">
          {/* Box 1 */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 w-full md:w-56 space-y-1">
            <p className="text-2xl font-extrabold font-mono text-blue-400">47</p>
            <p className="text-xs font-bold uppercase text-slate-200">SOURCE CLAIMS</p>
            <p className="text-[10px] text-slate-400">Grounded from document</p>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-500 hidden md:block" />
          <ArrowDown className="w-6 h-6 text-slate-500 block md:hidden" />

          {/* Box 2 */}
          <div className="p-4 bg-amber-500/20 border-2 border-amber-500/50 rounded-xl w-full md:w-64 space-y-1">
            <p className="text-sm font-bold text-amber-300 uppercase font-mono">DISCLOSURE POLICY</p>
            <p className="text-xs font-bold text-white">Ceiling: {disclosureLevel}</p>
            <p className="text-[10px] text-amber-200">Enforces privilege boundary</p>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-500 hidden md:block" />
          <ArrowDown className="w-6 h-6 text-slate-500 block md:hidden" />

          {/* Box 3 */}
          <div className="p-4 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-xl w-full md:w-56 space-y-1">
            <p className="text-2xl font-extrabold font-mono text-emerald-400">{permittedCount}</p>
            <p className="text-xs font-bold uppercase text-emerald-300">PERMITTED CLAIMS</p>
            <p className="text-[10px] text-emerald-200">Sent to Sub-Agents</p>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-500 hidden md:block" />
          <ArrowDown className="w-6 h-6 text-slate-500 block md:hidden" />

          {/* Box 4 */}
          <div className="p-4 bg-blue-600 rounded-xl w-full md:w-48 space-y-1">
            <p className="text-xs font-bold uppercase text-white">GENERATION</p>
            <p className="text-[10px] text-blue-100">Multi-format sub-agents</p>
          </div>
        </div>
      </div>

      {/* EXCLUDED / BLOCKED CLAIMS LIST */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600" /> EXCLUDED / BLOCKED CLAIMS ({blockedCount})
            </h3>
            <p className="text-xs text-rose-600">The following claims exceed the active {disclosureLevel} clearance policy and are stripped before prompt construction.</p>
          </div>
          <span className="text-xs font-bold font-mono px-2.5 py-1 bg-rose-100 text-rose-800 rounded border border-rose-200">
            STRIPPED AT GATEWAY
          </span>
        </div>

        <div className="space-y-3">
          {blockedClaimsList.map((claim) => (
            <div key={claim.id} className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">{claim.id}</span>
                  <span className="font-semibold text-slate-900">{claim.claim}</span>
                </div>
                <p className="text-[11px] text-slate-500">Source: Page {claim.page} • Entity: {claim.entity}</p>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <StatusBadge status="BLOCKED" />
                <p className="text-[10px] text-rose-700 font-medium">Exceeds selected disclosure level</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
