import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { 
  KeyRound, 
  FileCheck, 
  Key, 
  Copy, 
  Terminal, 
  Database
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Page10ProvenanceSigning: React.FC = () => {
  const { 
    isSigned, 
    signArtifact, 
    signatureHash, 
    signedTimestamp, 
    source, 
    setActivePage,
    setCurrentStageId,
    showToast
  } = usePramaan();

  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs uppercase tracking-wider">
            <KeyRound className="w-4 h-4" /> Cryptographic Provenance Module
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">PROVENANCE & SIGNING</h1>
          <p className="text-sm text-slate-500 mt-1">Immutable cryptographic verification ledger and append-only audit trail.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={signArtifact}
            disabled={isSigned}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              isSigned 
                ? 'bg-emerald-600 cursor-default' 
                : 'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-600/20'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{isSigned ? 'SIGNED ✓' : 'SIGN ARTIFACT & LOCK'}</span>
          </button>

          <button
            onClick={() => {
              setActivePage('outputs');
              setCurrentStageId('published');
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>View Verified Outputs →</span>
          </button>
        </div>
      </div>

      {/* THREE MAJOR CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: PROVENANCE MANIFEST */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-600" /> Card 1 — Provenance Manifest
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              MANIFEST v2.6
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">Lineage Mapping Graph</span>
              <p className="font-bold text-slate-900">Source → Claim → Output</p>
              <p className="text-[11px] text-slate-500 font-sans">12 Source Pages ➔ 47 Claims ➔ 7 Multi-Format Artifacts</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Approval Lineage</span>
              <p className="font-semibold text-slate-800">Gate 1: Entailment Verified (29 Pass)</p>
              <p className="font-semibold text-slate-800">Gate 2: Privilege Clearance (34 Allowed)</p>
              <p className="font-semibold text-emerald-700">Operator Approval: Senior Governance Lead</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Stable Artifact Metadata</span>
              <p className="font-mono text-slate-600 truncate">Source Hash: {source.hash.substring(0, 18)}...</p>
              <p className="font-mono text-slate-600">Timestamp: {signedTimestamp || 'Pending Signoff'}</p>
            </div>
          </div>
        </div>

        {/* CARD 2: INTEGRITY & SIGNING */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" /> Card 2 — Integrity & Signing
            </h3>
            <StatusBadge status={isSigned ? 'SIGNED' : 'PENDING'} />
          </div>

          <div className="space-y-3 text-xs">
            {/* SHA-256 Hash Display */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SHA-256 Digest Hash</span>
              <div className="p-3 bg-slate-950 text-amber-400 rounded-xl font-mono text-[11px] break-all border border-slate-800 relative group">
                {signatureHash}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(signatureHash);
                    showToast('SHA-256 hash copied to clipboard.');
                  }}
                  className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy Hash"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RSA-4096 Digital Signature</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-600 space-y-1">
                <p>SIGNATURE: {isSigned ? 'SIG-2026-RSA4096-VERIFIED-VALID' : 'UNSIGNED_DRAFT_STATE'}</p>
                <p>KEY FINGERPRINT: 4A2C-8891-FF02-99B4</p>
              </div>
            </div>

            {/* Append-Only Audit Log */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-600" /> Append-Only Audit Log
              </span>
              <p className="text-[11px] font-mono text-emerald-700">✓ Immutable ledger block #104,982 written</p>
            </div>
          </div>
        </div>

        {/* CARD 3: VERIFICATION API */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600" /> Card 3 — Verification API
            </h3>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              REST / GRPC
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2 border border-slate-800">
              <p className="text-emerald-400">// Check artifact authenticity</p>
              <p className="text-slate-400">POST /api/v1/verify</p>
              <p className="text-amber-300">&#123; "artifactId": "PRM-2026-00142" &#125;</p>
              <div className="pt-2 border-t border-slate-800 text-emerald-300">
                &gt; 200 OK: AUTHENTICITY_VERIFIED ✓
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Verification Checks</span>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700">
                <li className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Integrity Check (Hash Match)</li>
                <li className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Provenance Graph Check</li>
                <li className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-emerald-600" /> Signed Artifact Verification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SIGNED STATUS DISPLAY BANNER */}
      {isSigned && (
        <div className="p-6 bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center font-bold text-xl shadow-md">
              ✓
            </div>
            <div>
              <h3 className="text-lg font-extrabold">ARTIFACT CRYPTOGRAPHICALLY SIGNED</h3>
              <p className="text-xs text-emerald-100 font-mono">
                Signed at {signedTimestamp} • Immutable SHA-256 Hash stored in PRAMAAN ledger.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActivePage('outputs');
              setCurrentStageId('published');
            }}
            className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            Open Verified Multi-Format Outputs →
          </button>
        </div>
      )}
    </div>
  );
};
