import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  Cpu, 
  Layers, 
  Bot, 
  FileText, 
  Presentation, 
  BarChart2, 
  Video, 
  ShieldAlert, 
  Play,
  Share2,
  MessageSquare
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Page6GenerationOrchestrator: React.FC = () => {
  const { 
    outputs, 
    setSelectedOutputDetail, 
    setActivePage, 
    setCurrentStageId, 
    startGeneration, 
    isGenerating,
    disclosureLevel
  } = usePramaan();

  const getOutputIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return FileText;
      case 'Linkedin': return Share2;
      case 'Presentation': return Presentation;
      case 'BarChart2': return BarChart2;
      case 'ShieldAlert': return ShieldAlert;
      case 'Twitter': return MessageSquare;
      case 'Video': return Video;
      default: return Layers;
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" /> Workflow Orchestrator Module
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">WORKFLOW ORCHESTRATOR</h1>
          <p className="text-sm text-slate-500 mt-1">Coordinates governed multi-format content generation with dedicated sub-agents.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={startGeneration}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isGenerating ? 'Synthesizing...' : 'Simulate Parallel Sub-Agents'}</span>
          </button>

          <button
            onClick={() => {
              setActivePage('verification');
              setCurrentStageId('fidelity');
            }}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Dual Verification →</span>
          </button>
        </div>
      </div>

      {/* CENTRAL APPROVED CLAIM REPRESENTATION CARD */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 text-center max-w-2xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 text-xs font-mono font-bold">
          APPROVED CLAIM REPRESENTATION NODE
        </div>

        <h3 className="text-lg font-bold">35 Permitted Atomic Claims</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Policy Filter active: <strong className="text-amber-400">{disclosureLevel} CLEARANCE</strong>. Stripped 6 confidential claims. Ready for parallel sub-agent dispatch.
        </p>

        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
          <span>Source: Annual_Report_2026.pdf</span>
          <span>•</span>
          <span>Entities: 14 Mapped</span>
          <span>•</span>
          <span>Confidence Avg: 96.8%</span>
        </div>
      </div>

      {/* PARALLEL GENERATION GRID OF 7 SUB-AGENTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Parallel Multi-Format Sub-Agents ({outputs.length} Active Pipelines)
          </h3>
          <span className="text-xs text-slate-400">Click any card to inspect generated claim lineage</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {outputs.map((out) => {
            const Icon = getOutputIcon(out.iconName);
            return (
              <div
                key={out.id}
                onClick={() => {
                  setSelectedOutputDetail(out);
                  setActivePage('gen-detail');
                }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg transition-all space-y-4 cursor-pointer group hover:border-amber-400"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {out.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">{out.type}</p>
                    </div>
                  </div>
                  <StatusBadge status={out.status} />
                </div>

                {/* Sub-Agent Indicator */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2 text-xs">
                  <Bot className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Dedicated Sub-Agent</span>
                    <span className="font-mono text-slate-800 font-bold truncate block">{out.subAgent}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center py-1 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Claims</span>
                    <span className="font-mono font-bold text-blue-700">{out.claimCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Words</span>
                    <span className="font-mono font-bold text-slate-800">{out.wordCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Version</span>
                    <span className="font-mono font-bold text-amber-700">{out.version}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Synthesis Progress</span>
                    <span className="font-bold text-amber-600">{out.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${out.progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <span className="text-xs font-semibold text-amber-600 group-hover:underline flex items-center gap-1">
                    View Claim Links →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
