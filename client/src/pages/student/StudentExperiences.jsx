import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PostCard from '../../components/PostCard';
import { BookOpen, Search, Tag, RefreshCw } from 'lucide-react';

const StudentExperiences = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('category', 'INTERVIEW_EXPERIENCE');
      if (search) params.append('search', search);

      const { data } = await api.get(`/posts?${params.toString()}`);
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [search]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-600" /> Interview Experiences & Preparation
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real interview experiences shared by seniors, LinkedIn posts, company round analyses, and preparation resources.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, tags (e.g. DSA, Technical Interview, HR, System Design)..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mr-2" /> Loading interview experiences...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-800 text-sm">No interview experience posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExperiences;
