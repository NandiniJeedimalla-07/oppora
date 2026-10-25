import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PostCard from '../../components/PostCard';
import { Code2, Search, RefreshCw, BriefcaseBusiness, Trophy } from 'lucide-react';

const StudentHackathons = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const hiringHackathons = posts.filter((post) => post.isHiringRelated);
  const generalHackathons = posts.filter((post) => !post.isHiringRelated);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('category', 'HACKATHON');
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const { data } = await api.get(`/posts?${params.toString()}`);
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Code2 className="w-7 h-7 text-indigo-600" /> Hackathons & Coding Contests
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Industry hackathons, corporate challenges, and coding events. Registered events move to My Registrations.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hackathon, organizer..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mr-2" /> Loading hackathons...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
          <Code2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-800 text-sm">No hackathons found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {[
            {
              title: 'Hiring-related hackathons',
              description: 'Events connected to recruitment, internships, or job opportunities.',
              posts: hiringHackathons,
              Icon: BriefcaseBusiness,
              accent: 'text-purple-700',
            },
            {
              title: 'General hackathons',
              description: 'Open competitions, coding challenges, and learning events.',
              posts: generalHackathons,
              Icon: Trophy,
              accent: 'text-indigo-700',
            },
          ].map(({ title, description, posts: sectionPosts, Icon, accent }) => (
            <section key={title} className="space-y-4">
              <div>
                <h2 className={`flex items-center gap-2 text-lg font-extrabold ${accent}`}>
                  <Icon className="w-5 h-5" />
                  {title}
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {sectionPosts.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              </div>
              {sectionPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sectionPosts.map((post) => (
                    <PostCard key={post._id} post={post} onStatusUpdated={fetchHackathons} />
                  ))}
                </div>
              ) : (
                <p className="p-5 bg-white rounded-2xl border border-gray-200 text-sm text-gray-500">
                  No {title.toLowerCase()} found.
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentHackathons;
