import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ExcelExportButtons from '../../components/ExcelExportButtons';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Code2,
  AlertCircle,
  BookOpen,
  Users,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  RefreshCw,
  Archive,
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get('/admin/analytics');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading placement cell statistics...</p>
      </div>
    );
  }

  const { summary, postAnalytics } = data || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
            Placement Cell Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Placement Cell Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Centralized post creation, audience target monitoring, and Excel export reports.
          </p>
        </div>

        <Link
          to="/admin/create-post"
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Create New Post
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Active</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{summary?.totalActivePosts || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Job Posts</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{summary?.jobPosts || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Hackathons</span>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{summary?.hackathons || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Mandatory</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{summary?.mandatoryRegistrations || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Experiences</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{summary?.interviewExperiences || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Students</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary?.totalStudents || 0}</p>
        </div>
      </div>

      {/* Active Tracked Post Analytics */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Student Response & Tracking Metrics</h2>
            <p className="text-xs text-gray-500">Live application rates and student declaration status across active drives</p>
          </div>
          <Link
            to="/admin/analytics"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            View Detailed Student Lists →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">Post Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Eligible Students</th>
                <th className="p-4 text-center">Applied / Registered</th>
                <th className="p-4 text-center">Not Applied</th>
                <th className="p-4 text-center">Completion Rate</th>
                <th className="p-4 text-right">Excel Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {postAnalytics?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    No active tracked opportunities yet. Create a new post to view live tracking analytics!
                  </td>
                </tr>
              ) : (
                postAnalytics?.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4 font-bold text-gray-900 max-w-xs truncate">{post.title}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-gray-100 text-gray-700 border">
                        {post.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={post.calculatedStatus} />
                    </td>
                    <td className="p-4 text-center font-bold text-gray-800">{post.eligibleStudents}</td>
                    <td className="p-4 text-center font-bold text-emerald-700">{post.completedStudents}</td>
                    <td className="p-4 text-center font-bold text-rose-600">{post.pendingStudents}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, post.completionRate)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900">{post.completionRate}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <ExcelExportButtons postId={post._id} postCategory={post.category} postTitle={post.title} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
