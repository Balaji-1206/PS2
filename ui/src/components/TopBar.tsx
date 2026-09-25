import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { Globe } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const TopBar: React.FC = () => {
  const { currentStageId, activeDomain, isSigned, source } = usePramaan();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            PRAMAAN
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-sm font-semibold text-slate-600">Governed Content Transformation Platform</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span>Active Source: <strong className="text-slate-800 font-sans">{source.filename}</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-sans text-[11px] border border-emerald-200">
              47 Claims Grounded
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Active Domain Profile indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500">Domain:</span>
          <span className="font-semibold text-slate-800">{activeDomain.name}</span>
        </div>

        {/* Current status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Pipeline Status:</span>
          <StatusBadge status={isSigned ? 'SIGNED' : currentStageId === 'generation' ? 'GENERATING' : 'READY'} size="sm" />
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            SG
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Senior Governance Lead</p>
            <p className="text-[10px] text-slate-500 font-mono">ID: GOV-2026-88</p>
          </div>
        </div>
      </div>
    </header>
  );
};
