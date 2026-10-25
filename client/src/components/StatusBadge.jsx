import React from 'react';
import { Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        ACTIVE
      </span>
    );
  }

  if (status === 'EXPIRING SOON' || status === 'EXPIRING_SOON') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        EXPIRING SOON
      </span>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        EXPIRED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
      <Clock className="w-3.5 h-3.5 text-gray-500" />
      {status || 'PUBLISHED'}
    </span>
  );
};

export default StatusBadge;
