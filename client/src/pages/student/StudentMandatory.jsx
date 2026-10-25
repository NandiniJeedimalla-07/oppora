import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PostCard from '../../components/PostCard';
import { AlertCircle, RefreshCw } from 'lucide-react';

const StudentMandatory = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMandatoryPosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/posts?category=MANDATORY_REGISTRATION');
      let fetched = data.posts || [];

      // Sort: Not Registered first -> Closest deadline -> Registered
      fetched.sort((a, b) => {
        const aCompleted = a.studentStatus === 'REGISTERED';
        const bCompleted = b.studentStatus === 'REGISTERED';
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;

        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      });

      setPosts(fetched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandatoryPosts();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <AlertCircle className="w-4 h-4 animate-bounce" /> High Priority Placement Cell Notice
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Mandatory Registrations</h1>
          <p className="text-xs text-rose-100 mt-1">
            Required assessments, company quizzes, and mandatory registration drives. You must mark yourself as registered.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
          <span className="text-xs text-rose-100 font-semibold block uppercase">Pending Registrations</span>
          <span className="text-2xl font-extrabold text-white">
            {posts.filter((p) => p.studentStatus !== 'REGISTERED').length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-red-600 animate-spin mr-2" /> Loading mandatory events...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
          <AlertCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-gray-800 text-sm">No mandatory registrations pending for your batch!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onStatusUpdated={fetchMandatoryPosts} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMandatory;
