import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Globe, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Page2Ingestion: React.FC = () => {
  const { 
    startSourceIngestion, 
    isProcessingIngestion, 
    ingestionStageText, 
    source 
  } = usePramaan();

  const formats = [
    { name: 'PDF', desc: 'Vector layout & text', icon: FileText, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { name: 'DOCX', desc: 'Word structure & styles', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { name: 'TXT', desc: 'Raw plaintext stream', icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-200' },
    { name: 'IMAGE', desc: 'OCR & visual layout', icon: ImageIcon, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { name: 'VIDEO', desc: 'Keyframes & transcript', icon: Video, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { name: 'AUDIO', desc: 'Speech-to-text audio', icon: Mic, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { name: 'URL', desc: 'Web page extraction', icon: Globe, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    { name: 'PROMPT', desc: 'Free-form text source', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
  ];

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> User Interface & Ingestion Layer
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">SOURCE INGESTION</h1>
        <p className="text-sm text-slate-500 mt-1">Bring heterogeneous content into a governed transformation pipeline.</p>
      </div>

      {/* Main Upload Zone */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center space-y-6 shadow-2xs hover:border-blue-500 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">Drag & Drop Heterogeneous Source Content</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Upload document briefs, executive reports, clinical trial logs, audio recordings, or media URLs.
          </p>
        </div>

        {/* Formats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
          {formats.map((fmt) => {
            const Icon = fmt.icon;
            return (
              <div key={fmt.name} className={`p-3 rounded-xl border flex items-center gap-2.5 text-left ${fmt.color}`}>
                <Icon className="w-5 h-5 shrink-0" />
                <div>
                  <span className="text-xs font-bold block leading-tight">{fmt.name}</span>
                  <span className="text-[10px] opacity-80 block">{fmt.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Sample File Box */}
        <div className="max-w-xl mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-left flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              PDF
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 font-mono">{source.filename}</p>
              <p className="text-[11px] text-slate-500">{source.size} • 42 Pages • Prepared for Multi-Format Ingestion</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
            Selected
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={startSourceIngestion}
            disabled={isProcessingIngestion}
            className={`px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 mx-auto cursor-pointer ${
              isProcessingIngestion 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/20'
            }`}
          >
            {isProcessingIngestion ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Source Pipeline...</span>
              </>
            ) : (
              <>
                <span>Process Source & Extract Claims</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Ingestion Animation Status */}
      {isProcessingIngestion && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 space-y-4 animate-pulse">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              Governed Source Extraction Engine Running
            </span>
            <span className="text-xs font-mono text-slate-400">Step Ingestion</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-300 border border-slate-800">
            &gt; {ingestionStageText}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-400 font-mono">
            <div>Uploading: <strong className="text-emerald-400">100%</strong></div>
            <div>Parsing Layout: <strong className="text-emerald-400">Done</strong></div>
            <div>Detecting Media: <strong className="text-emerald-400">Done</strong></div>
            <div>Source Map ID: <strong className="text-emerald-400">MAP-2026-X</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
