import React, { useState } from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  FileText, 
  Eye, 
  Video, 
  Mic, 
  CheckCircle2, 
  Code2, 
  MapPin, 
  Search
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ClaimDetailDrawer } from '../components/ClaimDetailDrawer';

export const Page3ExtractionClaims: React.FC = () => {
  const { claims, setSelectedClaim, setActivePage, setCurrentStageId } = usePramaan();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSensitivity, setFilterSensitivity] = useState<string>('ALL');

  const filteredClaims = claims.filter(c => {
    const matchesSearch = c.claim.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()) || c.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSens = filterSensitivity === 'ALL' || c.sensitivity === filterSensitivity;
    return matchesSearch && matchesSens;
  });

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" /> Extraction & Claim Layer Module
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            MULTI-FORMAT EXTRACTION & CLAIM LAYER
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            "Understand the source once" — Deconstruct heterogeneous documents into atomic, traceable claims.
          </p>
        </div>

        <button
          onClick={() => {
            setActivePage('configuration');
            setCurrentStageId('configuration');
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>Configure Output Generation →</span>
        </button>
      </div>

      {/* SECTION A — INPUT PROCESSING CARDS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Section A — Input Processing Engine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Document Parser</h4>
            <p className="text-xs text-slate-500">Extracts text and elements while preserving layout hierarchy.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Image / Vision</h4>
            <p className="text-xs text-slate-500">Detects visual information & associates it with source locations.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Video Processing</h4>
            <p className="text-xs text-slate-500">Extracts keyframes, visual OCR & syncs timeline timestamps.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Audio / Speech-to-Text</h4>
            <p className="text-xs text-slate-500">Transcribes audio stream with speaker diarization & attribution.</p>
          </div>
        </div>
      </div>

      {/* SECTION B & SECTION C — STRUCTURED REPRESENTATION & SOURCE MAPPING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION B — STRUCTURED REPRESENTATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" /> Section B — Structured Representation
            </h3>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">STRUCTURED JSON</span>
          </div>

          <p className="text-xs text-slate-500">Unified representation mapping document syntax to semantic claim nodes:</p>

          <div className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto space-y-1 shadow-inner border border-slate-800">
            <div><span className="text-slate-500 font-bold">&#123;</span></div>
            <div className="pl-4"><span className="text-blue-300">"documentHierarchy"</span>: <span className="text-amber-300">"Root &gt; Sec 3.1 &gt; Par 2"</span>,</div>
            <div className="pl-4"><span className="text-blue-300">"boundingBoxes"</span>: [<span className="text-emerald-300">&#123;"x1": 42, "y1": 180, "w": 420, "h": 68&#125;</span>],</div>
            <div className="pl-4"><span className="text-blue-300">"coordinates"</span>: <span className="text-amber-300">"Page 4 [142, 210, 562, 278]"</span>,</div>
            <div className="pl-4"><span className="text-blue-300">"layoutMetadata"</span>: <span className="text-emerald-300">&#123;"font": "Inter-Bold", "fontSize": 14&#125;</span>,</div>
            <div className="pl-4"><span className="text-blue-300">"elementIDs"</span>: [<span className="text-amber-300">"ELEM-004-B"</span>, <span className="text-amber-300">"ELEM-005-A"</span>]</div>
            <div><span className="text-slate-500 font-bold">&#125;</span></div>
          </div>
        </div>

        {/* SECTION C — SOURCE MAPPING */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Section C — Source Mapping Formula
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">CLAIM TUPLE</span>
          </div>

          <p className="text-xs text-slate-500">Every claim extracted forms a strict 4-property tuple:</p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded font-bold">Source Span</span>
              <span className="text-slate-400">+</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded font-bold">Confidence %</span>
              <span className="text-slate-400">+</span>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded font-bold">Sensitivity</span>
              <span className="text-slate-400">+</span>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded font-bold">Entities</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">Example Mapped Claim Tuple:</p>
              <p className="text-[11px] font-mono text-slate-600">
                (&quot;Revenue increased by 18%&quot;, Page 4) | 98% Confidence | PUBLIC | [Financial Performance]
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CLAIM TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Extracted Atomic Claim Repository</h3>
            <p className="text-xs text-slate-500">47 claims extracted from Annual_Report_2026.pdf. Click any claim to inspect source lineage.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search claims or IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 w-56"
              />
            </div>

            {/* Filter Sensitivity */}
            <select
              value={filterSensitivity}
              onChange={(e) => setFilterSensitivity(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Sensitivity Classes</option>
              <option value="PUBLIC">PUBLIC Only</option>
              <option value="INTERNAL">INTERNAL Only</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
                <th className="p-3">Claim ID</th>
                <th className="p-3">Claim Text</th>
                <th className="p-3">Source Location</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Sensitivity</th>
                <th className="p-3">Entity Tag</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredClaims.map((claim) => (
                <tr 
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="p-3 font-mono font-bold text-blue-700">{claim.id}</td>
                  <td className="p-3 font-medium max-w-md">{claim.claim}</td>
                  <td className="p-3 font-mono text-slate-500">Page {claim.page}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">{claim.confidence}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      claim.sensitivity === 'PUBLIC' ? 'bg-emerald-100 text-emerald-800' :
                      claim.sensitivity === 'INTERNAL' ? 'bg-blue-100 text-blue-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {claim.sensitivity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 font-medium">{claim.entity}</td>
                  <td className="p-3">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Inspect Lineage →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ClaimDetailDrawer />
    </div>
  );
};
