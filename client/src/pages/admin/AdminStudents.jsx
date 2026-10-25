import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Upload, Plus, FileSpreadsheet, RefreshCw, X, CheckCircle2 } from 'lucide-react';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (deptFilter) params.append('department', deptFilter);
      if (yearFilter) params.append('graduationYear', yearFilter);

      const { data } = await api.get(`/admin/students?${params.toString()}`);
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, deptFilter, yearFilter]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setImporting(true);
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', uploadFile);

      const { data } = await api.post('/admin/students/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImportResult(data);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" /> Student Database Directory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage student enrollment records, academic CGPA, backlogs, and bulk import Excel/CSV files.
          </p>
        </div>

        <button
          onClick={() => {
            setImportResult(null);
            setImportModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Import Students (CSV / Excel)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, roll number, email..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="AIDS">AIDS</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Batches</option>
            <option value="2026">Batch 2026</option>
            <option value="2027">Batch 2027</option>
            <option value="2028">Batch 2028</option>
            <option value="2029">Batch 2029</option>
          </select>
        </div>
      </div>

      {/* Student Directory Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">Roll Number</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">College Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Batch</th>
                <th className="p-4 text-center">CGPA</th>
                <th className="p-4 text-center">Backlogs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No students found in the database.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4 font-bold text-gray-900">{st.rollNumber || 'N/A'}</td>
                    <td className="p-4 font-bold text-gray-800">{st.name}</td>
                    <td className="p-4 text-gray-600">{st.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {st.department || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{st.graduationYear || 'N/A'}</td>
                    <td className="p-4 text-center font-bold text-emerald-700">{st.cgpa || '0.0'}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          st.backlogs > 0 ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {st.backlogs || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-6 bg-blue-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Import Student Database</h3>
                <p className="text-xs text-blue-200">Upload CSV or Excel file containing student records</p>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                <p className="font-bold">Required File Columns:</p>
                <p className="text-[11px] text-blue-700">
                  <code className="bg-white px-1.5 py-0.5 rounded border">Name</code>,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border">Email</code>,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border">Roll Number</code>,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border">Department</code>,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border">Graduation Year</code>,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border">CGPA</code>,{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border">Backlogs</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Select Excel (.xlsx) or CSV (.csv) File
                </label>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none"
                />
              </div>

              {importResult && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {importResult.message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {importing ? 'Processing File...' : 'Upload & Import Records'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
