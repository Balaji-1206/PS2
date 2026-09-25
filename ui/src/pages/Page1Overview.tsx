import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { RECENT_SOURCES } from '../data/sources';

export const Page1Overview: React.FC = () => {
  const { setActivePage, setCurrentStageId, reviews, isSigned } = usePramaan();
  const pendingReviews = reviews.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Governed Content Transformation</h1>
          <p className="text-sm text-slate-500 mt-1">Transform one source into verified multi-format content with end-to-end provenance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActivePage('ingestion');
              setCurrentStageId('source');
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>+ Ingest New Source</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sources</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">12</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ Multi-format ingested</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Claims</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">47</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Grounded from current source</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Generated Outputs</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">7</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Parallel sub-agents</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Outputs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">5</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Dual Gate Verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 font-mono">{pendingReviews}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Operator action required</p>
        </div>
      </div>

      {/* Large Current Transformation Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              PDF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-mono">Annual_Report_2026.pdf</h3>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-semibold">Active Run</span>
              </div>
              <p className="text-xs text-slate-500">42 pages • Ingested today • 47 claims extracted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-semibold">Current Stage</p>
              <p className="text-sm font-bold text-amber-600">GENERATION & VERIFICATION</p>
            </div>
            <StatusBadge status={isSigned ? 'SIGNED' : 'GENERATING'} size="md" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-700">Pipeline Transformation Progress</span>
            <span className="font-mono text-blue-600">72% Completed</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 rounded-full w-[72%] transition-all duration-500 animate-pulse"></div>
          </div>
        </div>

        {/* Workflow Checklist Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Source</span>
              <p className="text-[10px] text-emerald-700 font-medium">✓ Extracted & Parsed</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Claims</span>
              <p className="text-[10px] text-emerald-700 font-medium">✓ 47 Claims Created</p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Disclosure</span>
              <p className="text-[10px] text-emerald-700 font-medium">✓ Internal Policy Resolved</p>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <span className="font-semibold text-amber-900">Generation</span>
              <p className="text-[10px] text-amber-700 font-semibold">● Synthesizing outputs</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">Fidelity Gate</span>
              <p className="text-[10px] text-slate-500">○ 29 Pass, 2 Review</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">Disclosure Gate</span>
              <p className="text-[10px] text-slate-500">○ 34 Allowed, 1 Blocked</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">Human Review</span>
              <p className="text-[10px] text-slate-500">○ 2 Pending Items</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">Signing</span>
              <p className="text-[10px] text-slate-500">{isSigned ? '✓ Cryptographically Signed' : '○ Pending Signoff'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              setActivePage('generation');
              setCurrentStageId('generation');
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Open Workflow Orchestrator Detail →
          </button>
        </div>
      </div>

      {/* Recent Artifacts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ingested Source Repositories</h3>
            <p className="text-xs text-slate-500">Heterogeneous sources ready for governed multi-format generation</p>
          </div>
          <button 
            onClick={() => setActivePage('ingestion')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View All Sources
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
                <th className="p-3">Source ID</th>
                <th className="p-3">Filename</th>
                <th className="p-3">Domain</th>
                <th className="p-3">Claims</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {RECENT_SOURCES.map((src) => (
                <tr key={src.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono text-slate-500">{src.id}</td>
                  <td className="p-3 font-semibold text-slate-900 font-mono flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {src.filename}
                  </td>
                  <td className="p-3">{src.metadata.domain}</td>
                  <td className="p-3 font-mono font-bold text-blue-700">{src.claimCount} claims</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                      {src.metadata.securityClassification}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={src.status} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setActivePage('claims');
                        setCurrentStageId('claims');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-medium transition-colors"
                    >
                      Inspect Claims
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
