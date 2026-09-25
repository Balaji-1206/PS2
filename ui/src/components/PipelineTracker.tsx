import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import type { PageKey } from '../context/PramaanContext';
import { Check, ChevronRight } from 'lucide-react';

export const PipelineTracker: React.FC = () => {
  const { pipelineStages, currentStageId, setCurrentStageId, setActivePage, isSigned } = usePramaan();

  const currentIndex = pipelineStages.findIndex(s => s.id === currentStageId);

  const getStageStatus = (index: number, stageId: string) => {
    if (stageId === 'published' && isSigned) return 'completed';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  const getModuleBadgeColor = (color: string, status: string) => {
    if (status === 'completed') {
      return 'bg-emerald-600 text-white border-emerald-600';
    }
    if (status === 'active') {
      switch (color) {
        case 'green': return 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200';
        case 'blue': return 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200';
        case 'orange': return 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-200';
        case 'purple': return 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-200';
        case 'gold': return 'bg-amber-700 text-white border-amber-700 ring-2 ring-amber-200';
        case 'black': return 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-300';
        default: return 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200';
      }
    }
    return 'bg-slate-100 text-slate-400 border-slate-200';
  };

  const handleStageClick = (stageId: string) => {
    setCurrentStageId(stageId);
    
    const pageMap: Record<string, PageKey> = {
      'source': 'ingestion',
      'extraction': 'claims',
      'claims': 'claims',
      'configuration': 'configuration',
      'generation': 'generation',
      'fidelity': 'verification',
      'disclosure': 'subset',
      'review': 'review',
      'signing': 'provenance',
      'published': 'outputs'
    };

    if (pageMap[stageId]) {
      setActivePage(pageMap[stageId]);
    }
  };

  return (
    <div className="w-full bg-white border-b border-slate-200 px-6 py-2.5 flex items-center shadow-xs">
      <div className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mr-4 whitespace-nowrap">
        Pipeline Trace:
      </div>

      <div className="flex-1 flex items-center justify-between overflow-x-auto no-scrollbar py-1">
        {pipelineStages.map((stage, idx) => {
          const status = getStageStatus(idx, stage.id);
          const isCurrentActive = stage.id === currentStageId;

          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => handleStageClick(stage.id)}
                className={`group flex items-center gap-2 cursor-pointer transition-all focus:outline-none rounded-md px-2 py-1 ${
                  isCurrentActive ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'
                }`}
                title={`${stage.name}: ${stage.description}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${getModuleBadgeColor(
                    stage.moduleColor,
                    status
                  )}`}
                >
                  {status === 'completed' ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="flex flex-col items-start">
                  <span
                    className={`text-xs whitespace-nowrap ${
                      status === 'active'
                        ? 'text-slate-900 font-bold'
                        : status === 'completed'
                        ? 'text-slate-700 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.shortName}
                  </span>
                </div>
              </button>

              {idx < pipelineStages.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mx-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
