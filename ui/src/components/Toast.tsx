import React from 'react';
import { usePramaan } from '../context/PramaanContext';
import { CheckCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = usePramaan();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-bounce duration-300 max-w-md">
      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
      <p className="text-xs font-medium text-slate-100 flex-1">{toastMessage}</p>
    </div>
  );
};
