import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  Sliders, 
  ShieldAlert, 
  Check, 
  FileText, 
  Presentation, 
  BarChart2, 
  Video, 
  Info,
  Share2,
  MessageSquare
} from 'lucide-react';

export const Page4Configuration: React.FC = () => {
  const { 
    audience, setAudience,
    tone, setTone,
    language, setLanguage,
    detailLevel, setDetailLevel,
    objective, setObjective,
    style, setStyle,
    disclosureLevel, setDisclosureLevel,
    selectedOutputs, toggleOutputSelection,
    setActivePage,
    setCurrentStageId,
    showToast
  } = usePramaan();

  const audiences = ['Executive Leadership', 'Board of Directors', 'Investors', 'Public Audience'];
  const tones = ['Professional', 'Concise', 'Urgent', 'Technical & Analytical'];
  const languages = ['English', 'Spanish', 'German', 'French'];
  const detailLevels = ['High (Comprehensive)', 'Medium (Standard)', 'Low (Executive Summary)'];
  const objectives = ['Inform', 'Persuade', 'Alert & Advise'];
  const styles = ['Corporate', 'Academic', 'Technical Brief', 'Modern Visual'];

  const availableOutputs = [
    { id: 'OUT-EXEC-01', name: 'Executive Summary', icon: FileText, desc: 'High-level synthesis for leadership' },
    { id: 'OUT-LINKEDIN-01', name: 'LinkedIn Post', icon: Share2, desc: 'Thought leadership & corporate update' },
    { id: 'OUT-PRESENTATION-01', name: 'Presentation Deck', icon: Presentation, desc: '12-slide executive presentation' },
    { id: 'OUT-INFOGRAPHIC-01', name: 'Infographic Package', icon: BarChart2, desc: 'Visual data callout assets' },
    { id: 'OUT-ADVISORY-01', name: 'Strategic Advisory', icon: ShieldAlert, desc: 'Technical & governance memo' },
    { id: 'OUT-TWITTER-01', name: 'X / Twitter Thread', icon: MessageSquare, desc: '4-part micro-content thread' },
    { id: 'OUT-VIDEO-01', name: 'Video Package', icon: Video, desc: '60s AV script & storyboard' }
  ];

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wider">
            <Sliders className="w-4 h-4" /> Workflow Configuration & Governance Rules
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">OUTPUT CONFIGURATION</h1>
          <p className="text-sm text-slate-500 mt-1">Define target generation parameters and strict audience disclosure policies.</p>
        </div>

        <button
          onClick={() => {
            setActivePage('subset');
            setCurrentStageId('disclosure');
            showToast(`Disclosure level set to ${disclosureLevel}. Permitted claims resolved.`);
          }}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Resolve Permitted Claims →</span>
        </button>
      </div>

      {/* CRITICAL CALLOUT: DISCLOSURE ≠ TONE */}
      <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="text-sm font-bold block">CRITICAL ARCHITECTURE PRINCIPLE: DISCLOSURE ≠ TONE</strong>
          <p className="leading-relaxed">
            Tone governs <em>how</em> content is phrased (e.g. professional vs concise). <strong>Disclosure Level</strong> governs <em>what data claims are legally permitted to exist</em> in the output. Renderers NEVER receive claims exceeding the selected disclosure clearance.
          </p>
        </div>
      </div>

      {/* DISCLOSURE LEVEL CONTROL */}
      <div className="bg-white p-6 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> DISCLOSURE LEVEL POLICY
            </h3>
            <p className="text-xs text-slate-500">Select audience security clearance ceiling before sub-agent synthesis.</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
            Current Clearance: {disclosureLevel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* PUBLIC */}
          <button
            onClick={() => setDisclosureLevel('PUBLIC')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              disclosureLevel === 'PUBLIC'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-emerald-800">PUBLIC</span>
              {disclosureLevel === 'PUBLIC' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-xs text-slate-600 mt-2">Only unclassified public claims permitted (31 Claims).</p>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Safe for external distribution</span>
          </button>

          {/* INTERNAL */}
          <button
            onClick={() => setDisclosureLevel('INTERNAL')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              disclosureLevel === 'INTERNAL'
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-blue-800">INTERNAL</span>
              {disclosureLevel === 'INTERNAL' && <Check className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-xs text-slate-600 mt-2">Public + Internal enterprise claims (41 Claims).</p>
            <span className="text-[10px] text-blue-700 font-semibold block mt-1">Blocks 6 Confidential Claims</span>
          </button>

          {/* CONFIDENTIAL */}
          <button
            onClick={() => setDisclosureLevel('CONFIDENTIAL')}
            className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              disclosureLevel === 'CONFIDENTIAL'
                ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-rose-800">CONFIDENTIAL</span>
              {disclosureLevel === 'CONFIDENTIAL' && <Check className="w-4 h-4 text-rose-600" />}
            </div>
            <p className="text-xs text-slate-600 mt-2">Full access including C-suite strategic claims (47 Claims).</p>
            <span className="text-[10px] text-rose-700 font-semibold block mt-1">Executive C-suite clearance</span>
          </button>
        </div>
      </div>

      {/* STYLISTIC & GENERATION PARAMETERS GRID */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Stylistic & Audience Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Audience */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Target Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {audiences.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tone & Voice</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {tones.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Output Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Level of Detail */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Level of Detail</label>
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {detailLevels.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Objective */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Primary Objective</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {objectives.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Formatting Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* OUTPUT SELECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">OUTPUT SELECTION ({selectedOutputs.length} Selected)</h3>
            <p className="text-xs text-slate-500">Each selected format spawns a dedicated sub-agent in the workflow pipeline.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {availableOutputs.map((out) => {
            const Icon = out.icon;
            const isSelected = selectedOutputs.includes(out.id);
            return (
              <button
                key={out.id}
                onClick={() => toggleOutputSelection(out.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-400'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-bold text-slate-900 block">{out.name}</span>
                  <span className="text-[10px] text-slate-500 block">{out.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
