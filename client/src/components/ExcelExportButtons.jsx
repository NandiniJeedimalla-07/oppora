import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';

const ExcelExportButtons = ({ postId, postCategory, postTitle }) => {
  const [downloading, setDownloading] = useState(null);

  const isJob = postCategory === 'JOB';
  const appliedLabel = isJob ? 'Applied' : 'Registered';
  const notAppliedLabel = isJob ? 'Not Applied' : 'Not Registered';

  const handleDownload = async (filterType) => {
    try {
      setDownloading(filterType);
      const response = await api.get(`/admin/posts/${postId}/excel?filter=${filterType}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeTitle = (postTitle || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${safeTitle}_${filterType}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download Excel:', err);
      alert('Error downloading Excel report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleDownload('ALL')}
        disabled={downloading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
        title="Download spreadsheet of all eligible students"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
        {downloading === 'ALL' ? 'Generating Excel...' : 'All Eligible'}
      </button>

      <button
        onClick={() => handleDownload('APPLIED')}
        disabled={downloading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
        title={`Download spreadsheet of ${appliedLabel} students only`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        {downloading === 'APPLIED' ? 'Downloading...' : `Only ${appliedLabel}`}
      </button>

      <button
        onClick={() => handleDownload('NOT_APPLIED')}
        disabled={downloading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
        title={`Download spreadsheet of ${notAppliedLabel} students only`}
      >
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        {downloading === 'NOT_APPLIED' ? 'Downloading...' : `Only ${notAppliedLabel}`}
      </button>
    </div>
  );
};

export default ExcelExportButtons;
