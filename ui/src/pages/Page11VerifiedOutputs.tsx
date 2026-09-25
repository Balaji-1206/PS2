import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  Layers, 
  CheckCircle2, 
  Key, 
  FileText, 
  Presentation, 
  BarChart2, 
  Video, 
  ShieldAlert, 
  Download, 
  ExternalLink,
  Share2,
  MessageSquare
} from 'lucide-react';

export const Page11VerifiedOutputs: React.FC = () => {
  const { outputs, setSelectedOutputDetail, setActivePage, isSigned, showToast } = usePramaan();

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
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-emerald-600" /> Output Distribution Layer
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">VERIFIED MULTI-FORMAT OUTPUT</h1>
          <p className="text-sm text-slate-500 mt-1">Governed multi-format deliverables backed by complete dual-verification and provenance.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActivePage('reverse-trace');
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Verify & Reverse Trace →</span>
          </button>
        </div>
      </div>

      {/* OUTPUT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outputs.map((out) => {
          const Icon = getOutputIcon(out.iconName);
          return (
            <div 
              key={out.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{out.name}</h3>
                      <p className="text-[11px] text-slate-500 font-mono">{out.type}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300">
                    TRUSTED
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {out.summaryText}
                </p>

                {/* Verification Checkmarks */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Gate 1 Fidelity Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Gate 2 Disclosure Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Human Approved</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>{isSigned || out.signed ? '✓ Signed & Fingerprinted' : '○ Pending Final Hash Sign'}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Claims: <strong className="text-blue-700 font-bold">{out.claimCount}</strong></span>
                  <span>Version: <strong className="text-slate-800 font-bold">{out.version}</strong></span>
                  <span>Words: <strong className="text-slate-800 font-bold">{out.wordCount}</strong></span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedOutputDetail(out);
                    setActivePage('gen-detail');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Artifact
                </button>

                <button
                  onClick={() => showToast(`Artifact ${out.name} exported with cryptographic manifest.`)}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Export Governed Package"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
