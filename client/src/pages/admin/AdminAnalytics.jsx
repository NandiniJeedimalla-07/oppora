import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ExcelExportButtons from '../../components/ExcelExportButtons';
import StatusBadge from '../../components/StatusBadge';
import {
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Search,
  X,
  Building,
} from 'lucide-react';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Inspector State for Not Applied / Not Registered Students
  const [selectedPost, setSelectedPost] = useState(null);
  const [studentListModalOpen, setStudentListModalOpen] = useState(false);
  const [studentFilter, setStudentFilter] = useState('NOT_APPLIED'); // ALL, APPLIED, NOT_APPLIED
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/analytics');
      setAnalyticsData(data.postAnalytics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleOpenStudentModal = async (post, filter) => {
    setSelectedPost(post);
    setStudentFilter(filter);
    setStudentListModalOpen(true);
    fetchTrackedStudents(post._id, filter);
  };

  const fetchTrackedStudents = async (postId, filter) => {
    try {
      setLoadingStudents(true);
      const { data } = await api.get(`/admin/posts/${postId}/students?filter=${filter}`);
      setStudentList(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredModalStudents = studentList.filter((st) => {
    if (!studentSearch) return true;
    const query = studentSearch.toLowerCase();
    return (
      st.name.toLowerCase().includes(query) ||
      st.email.toLowerCase().includes(query) ||
      (st.rollNumber && st.rollNumber.toLowerCase().includes(query)) ||
      (st.department && st.department.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-blue-600" /> Tracked Posts & Student Compliance Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed response tracking, non-compliant student inspector, and Excel report generation.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-2" /> Loading analytics metrics...
        </div>
      ) : analyticsData.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-800 text-sm">No tracked post analytics available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsData.map((post) => {
            const isJob = post.category === 'JOB';
            const actionLabel = isJob ? 'Applied' : 'Registered';
            const notActionLabel = isJob ? 'Not Applied' : 'Not Registered';

            return (
              <div
                key={post._id}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-5 hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 border">
                      {post.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1.5 leading-snug">{post.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-blue-600" /> {post.company}
                    </p>
                  </div>
                  <StatusBadge status={post.calculatedStatus} />
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Eligible</span>
                    <span className="text-xl font-extrabold text-gray-900">{post.eligibleStudents}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-600 block">{actionLabel}</span>
                    <span className="text-xl font-extrabold text-emerald-700">{post.completedStudents}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-600 block">{notActionLabel}</span>
                    <span className="text-xl font-extrabold text-rose-600">{post.pendingStudents}</span>
                  </div>
                </div>

                {/* Progress Bar & Rate */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-600">{actionLabel} Compliance Rate</span>
                    <span className="text-blue-700">{post.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, post.completionRate)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Inspection Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenStudentModal(post, 'NOT_APPLIED')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition text-center"
                  >
                    View {notActionLabel} Students ({post.pendingStudents})
                  </button>

                  <button
                    onClick={() => handleOpenStudentModal(post, 'APPLIED')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition text-center"
                  >
                    View {actionLabel} Students ({post.completedStudents})
                  </button>
                </div>

                {/* Excel Export Buttons */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Excel Report Export
                  </span>
                  <ExcelExportButtons postId={post._id} postCategory={post.category} postTitle={post.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student List Inspector Modal */}
      {studentListModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-600 text-white px-2.5 py-0.5 rounded-md">
                  Student Compliance Inspector
                </span>
                <h3 className="text-xl font-extrabold mt-1">{selectedPost.title}</h3>
                <p className="text-xs text-gray-400">
                  Showing {studentFilter === 'NOT_APPLIED' ? (selectedPost.category === 'JOB' ? 'Not Applied' : 'Not Registered') : (selectedPost.category === 'JOB' ? 'Applied' : 'Registered')} Students
                </p>
              </div>
              <button
                onClick={() => setStudentListModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Toggle & Search */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student name, roll number..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStudentFilter('NOT_APPLIED');
                    fetchTrackedStudents(selectedPost._id, 'NOT_APPLIED');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    studentFilter === 'NOT_APPLIED'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Not {selectedPost.category === 'JOB' ? 'Applied' : 'Registered'}
                </button>
                <button
                  onClick={() => {
                    setStudentFilter('APPLIED');
                    fetchTrackedStudents(selectedPost._id, 'APPLIED');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    studentFilter === 'APPLIED'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {selectedPost.category === 'JOB' ? 'Applied' : 'Registered'}
                </button>
                <button
                  onClick={() => {
                    setStudentFilter('ALL');
                    fetchTrackedStudents(selectedPost._id, 'ALL');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    studentFilter === 'ALL'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  All Eligible
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingStudents ? (
                <div className="p-8 text-center text-gray-500 flex justify-center items-center">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-2" /> Loading student details...
                </div>
              ) : filteredModalStudents.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No students found matching this criteria.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Dept</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredModalStudents.map((st) => (
                      <tr key={st._id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-800">{st.rollNumber}</td>
                        <td className="p-3 font-semibold text-gray-900">{st.name}</td>
                        <td className="p-3 text-gray-600">{st.email}</td>
                        <td className="p-3 font-medium text-gray-700">{st.department}</td>
                        <td className="p-3 font-medium text-gray-700">{st.graduationYear}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              st.status.includes('NOT')
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">
                Total Count: {filteredModalStudents.length} students
              </span>
              <ExcelExportButtons
                postId={selectedPost._id}
                postCategory={selectedPost.category}
                postTitle={selectedPost.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
