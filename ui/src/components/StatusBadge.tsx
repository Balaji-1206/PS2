import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Loader2, 
  Key, 
  AlertOctagon
} from 'lucide-react';

export type StatusType = 
  | 'READY'
  | 'PROCESSING'
  | 'GENERATING'
  | 'PENDING'
  | 'PASS'
  | 'REVIEW'
  | 'BLOCKED'
  | 'SIGNED'
  | 'PUBLISHED'
  | 'VERIFIED'
  | 'UNVERIFIED';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normStatus = (status || '').toUpperCase();
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  }[size];

  switch (normStatus) {
    case 'VERIFIED':
    case 'PASS':
    case 'READY':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {normStatus}
        </span>
      );

    case 'PUBLISHED':
    case 'SIGNED':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}>
          <Key className="w-3.5 h-3.5 text-amber-600" />
          {normStatus}
        </span>
      );

    case 'PROCESSING':
    case 'GENERATING':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          {normStatus}
        </span>
      );

    case 'REVIEW':
    case 'PENDING':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          {normStatus}
        </span>
      );

    case 'BLOCKED':
    case 'FAILED':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          {normStatus}
        </span>
      );

    case 'UNVERIFIED':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          <AlertOctagon className="w-3.5 h-3.5 text-slate-500" />
          {normStatus}
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {normStatus}
        </span>
      );
  }
};
