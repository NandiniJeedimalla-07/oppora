import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PostCard from '../../components/PostCard';
import { Briefcase, Code2, AlertCircle, Clock, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const { data: resData } = await api.get('/student/dashboard');
      setData(resData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load student dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm font-medium">Loading your placement dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm">
        {error}
      </div>
    );
  }

  const { student, counts, actionRequired } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Opportunity Tracking Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Never miss an opportunity. Keep your placement declarations updated.
            </p>
          </div>

          <div className="flex gap-2 text-xs font-bold">
            <span className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              Batch: {student?.graduationYear}
            </span>
            <span className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              Dept: {student?.department}
            </span>
            <span className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              CGPA: {student?.cgpa}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Primary Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Job Posts</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{counts?.activeJobPosts || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Hackathons</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{counts?.activeHackathons || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Mandatory</span>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-red-600">{counts?.activeMandatory || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Applications</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{counts?.pendingApplications || 0}</p>
        </div>
      </div>

      {/* Action Required Feed */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Action Required
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Opportunities requiring your application declaration, sorted by priority & nearest deadline.
            </p>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300">
            {actionRequired?.length || 0} Pending Items
          </span>
        </div>

        {actionRequired?.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-base">You are all caught up!</h3>
            <p className="text-xs text-gray-500 mt-1">
              You have applied/registered for all currently eligible active opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionRequired.map((post) => (
              <PostCard key={post._id} post={post} onStatusUpdated={fetchDashboard} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
