import React from 'react';
import { AlertCircle } from 'lucide-react';

const MandatoryBadge = () => {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm tracking-wide uppercase">
      <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
      MANDATORY
    </span>
  );
};

export default MandatoryBadge;
