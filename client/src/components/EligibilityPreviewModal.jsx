import React from 'react';
import { Users, CheckCircle, X, ShieldAlert, GraduationCap, Building } from 'lucide-react';

const EligibilityPreviewModal = ({ isOpen, onClose, onConfirm, previewData, postTitle, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-md">
              Draft Review & Eligibility Preview
            </span>
            <h3 className="text-xl font-extrabold mt-2 leading-snug">{postTitle || 'New Placement Post'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Eligible Students</p>
              <p className="text-3xl font-extrabold text-blue-900">{previewData?.totalEligible || 0}</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 font-medium">
            Based on your specified eligibility rules, this opportunity will be automatically pushed to the following eligible student feeds:
          </p>

          {/* Department Breakdown */}
          {previewData?.departmentBreakdown && Object.keys(previewData.departmentBreakdown).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" /> By Department
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(previewData.departmentBreakdown).map(([dept, count]) => (
                  <div key={dept} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border text-xs">
                    <span className="font-bold text-gray-800">{dept}</span>
                    <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">{count} students</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graduation Year Breakdown */}
          {previewData?.yearBreakdown && Object.keys(previewData.yearBreakdown).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> By Graduation Year (Batch)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(previewData.yearBreakdown).map(([year, count]) => (
                  <div key={year} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border text-xs">
                    <span className="font-bold text-gray-800">Batch {year}</span>
                    <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">{count} students</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition"
          >
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {loading ? 'Publishing...' : 'Confirm & Publish Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EligibilityPreviewModal;
