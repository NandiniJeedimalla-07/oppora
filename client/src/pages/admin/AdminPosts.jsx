import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import MandatoryBadge from '../../components/MandatoryBadge';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isArchivedFilter, setIsArchivedFilter] = useState('false');
  const [updatingHiringPost, setUpdatingHiringPost] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search) params.append('search', search);
      params.append('isArchived', isArchivedFilter);

      const { data } = await api.get(`/posts?${params.toString()}`);
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter, statusFilter, isArchivedFilter, search]);

  const handlePublish = async (id) => {
    if (!window.confirm('Publish this post to eligible students?')) return;
    try {
      await api.patch(`/posts/${id}/publish`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish post');
    }
  };

  const handleToggleHiringRelated = async (post) => {
    try {
      setUpdatingHiringPost(post._id);
      await api.put(`/posts/${post._id}`, { isHiringRelated: !post.isHiringRelated });
      await fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update hackathon classification');
    } finally {
      setUpdatingHiringPost(null);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this post? Archived posts are hidden from student feeds.')) return;
    try {
      await api.patch(`/posts/${id}/archive`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive post');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-blue-600" /> Placement Cell Posts Table
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage, publish, filter, and archive all placement cell postings</p>
        </div>

        <Link
          to="/admin/create-post"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Create New Post
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, company, organizer..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="JOB">Job Postings</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="MANDATORY_REGISTRATION">Mandatory Registrations</option>
            <option value="INTERVIEW_EXPERIENCE">Interview Experiences</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Post Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
          </select>

          {/* Archival Toggle */}
          <select
            value={isArchivedFilter}
            onChange={(e) => setIsArchivedFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="false">Active Posts</option>
            <option value="true">Archived Posts</option>
          </select>
        </div>
      </div>

      {/* Admin Posts Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">Title</th>
                <th className="p-4">Company / Organizer</th>
                <th className="p-4">Category</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Post Status</th>
                <th className="p-4 text-center">Published?</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    Loading posts table...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No posts found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 leading-snug">{post.title}</span>
                        {post.isMandatory && <MandatoryBadge />}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">
                      {post.company || post.organizer || post.author || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-gray-100 text-gray-700 border">
                        {post.category.replace('_', ' ')}
                      </span>
                      {post.category === 'HACKATHON' && (
                        <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                          post.isHiringRelated
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {post.isHiringRelated ? 'Hiring-related' : 'General'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {post.deadline ? new Date(post.deadline).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={post.calculatedStatus} />
                    </td>
                    <td className="p-4 text-center">
                      {post.status === 'PUBLISHED' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          PUBLISHED
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.category === 'HACKATHON' && (
                          <button
                            onClick={() => handleToggleHiringRelated(post)}
                            disabled={updatingHiringPost === post._id}
                            className="inline-flex items-center gap-1 p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg transition disabled:opacity-50"
                            title={post.isHiringRelated ? 'Mark as a general hackathon' : 'Mark as hiring-related'}
                            aria-label={post.isHiringRelated ? 'Mark as a general hackathon' : 'Mark as hiring-related'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {post.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublish(post._id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Publish Draft"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {!post.isArchived && (
                          <button
                            onClick={() => handleArchive(post._id)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Archive Post"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default AdminPosts;
