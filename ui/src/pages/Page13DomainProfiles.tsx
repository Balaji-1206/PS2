import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  Globe, 
  Building2, 
  Activity, 
  GraduationCap, 
  Landmark, 
  AlertTriangle, 
  ShieldCheck, 
  Check
} from 'lucide-react';
import { DOMAIN_PROFILES } from '../data/domains';

export const Page13DomainProfiles: React.FC = () => {
  const { activeDomain, selectDomain, setActivePage, setCurrentStageId } = usePramaan();

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return Building2;
      case 'Activity': return Activity;
      case 'GraduationCap': return GraduationCap;
      case 'Landmark': return Landmark;
      case 'AlertTriangle': return AlertTriangle;
      case 'ShieldCheck': return ShieldCheck;
      default: return Globe;
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
            <Globe className="w-4 h-4" /> Domain Specificity Layer
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">DOMAIN PROFILES</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Domain profiles change sensitivity vocabulary and output schemas while the governed pipeline architecture remains completely unchanged.
          </p>
        </div>

        <button
          onClick={() => {
            setActivePage('configuration');
            setCurrentStageId('configuration');
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <span>Apply Active Domain Rules →</span>
        </button>
      </div>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOMAIN_PROFILES.map((domain) => {
          const Icon = getDomainIcon(domain.iconName);
          const isActive = activeDomain.id === domain.id;

          return (
            <div
              key={domain.id}
              onClick={() => selectDomain(domain.id)}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm ${
                isActive
                  ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{domain.name}</h3>
                      <p className="text-[10px] text-slate-500 font-mono">{domain.code}</p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300 flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {domain.description}
                </p>

                {/* Sensitivity Vocabulary */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Domain Sensitivity Vocabulary
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {domain.sensitivityVocabulary.map((vocab, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[10px] font-medium border border-slate-200">
                        {vocab}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Output Schemas */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Target Output Schemas
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {domain.outputSchemas.map((sch, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded text-[10px] font-medium border border-blue-200">
                        {sch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-right">
                <span className={`text-xs font-bold ${
                  isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                  {isActive ? 'Profile Loaded & Active' : 'Click to Activate Profile'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
