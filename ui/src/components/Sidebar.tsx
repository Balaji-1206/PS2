import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import type { PageKey } from '../context/PramaanContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  Sliders, 
  Filter, 
  Cpu, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Layers, 
  GitBranch, 
  Globe, 
  Sparkles,
  Lock,
  Shield
} from 'lucide-react';

interface NavItem {
  key: PageKey;
  label: string;
  icon: React.ElementType;
  badge?: string;
  category?: string;
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, reviews } = usePramaan();
  const pendingReviewCount = reviews.filter(r => r.status === 'PENDING').length;

  const navItems: NavItem[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'ingestion', label: 'Source Ingestion', icon: UploadCloud },
    { key: 'claims', label: 'Claim Layer', icon: FileText, badge: '47' },
    { key: 'configuration', label: 'Configuration', icon: Sliders },
    { key: 'subset', label: 'Permitted Claims', icon: Filter, badge: '35' },
    { key: 'generation', label: 'Generation', icon: Cpu },
    { key: 'verification', label: 'Dual Verification', icon: ShieldCheck },
    { key: 'review', label: 'Human Review', icon: UserCheck, badge: pendingReviewCount > 0 ? String(pendingReviewCount) : undefined },
    { key: 'provenance', label: 'Provenance & Signing', icon: KeyRound },
    { key: 'outputs', label: 'Verified Outputs', icon: Layers, badge: '7' },
    { key: 'reverse-trace', label: 'Verify & Reverse Trace', icon: GitBranch },
    { key: 'domains', label: 'Domain Profiles', icon: Globe },
    { key: 'freeprompt', label: 'Free-Prompt Mode', icon: Sparkles }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                PRAMAAN
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">v2.6</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Governed Transformation</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : item.key === 'review'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 m-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-[11px]">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Status
          </span>
          <span className="text-emerald-400 font-semibold">Operational</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Demo Mode</span>
          <span className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Active</span>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <Lock className="w-3 h-3 text-slate-500" />
            No LLM Connected
          </span>
          <span className="text-[10px] text-amber-400 font-mono">Governed Pure Rules</span>
        </div>
      </div>
    </aside>
  );
};
