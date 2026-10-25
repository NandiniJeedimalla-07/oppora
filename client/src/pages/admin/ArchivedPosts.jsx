import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ExcelExportButtons from '../../components/ExcelExportButtons';
import { Archive, RefreshCw, Calendar, FileSpreadsheet } from 'lucide-react';

const ArchivedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchivedPosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/posts?isArchived=true');
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedPosts();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Archive className="w-7 h-7 text-amber-600" /> Archived Placement Posts History
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Historical posts automatically archived after 7 days past deadline. All student application records remain permanently preserved.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mr-2" /> Loading archived records...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
          <Archive className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-800 text-sm">No archived posts in history.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4">Post Title</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Archived At</th>
                  <th className="p-4 text-right">Preserved Excel History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-4 font-bold text-gray-900">{post.title}</td>
                    <td className="p-4 font-semibold text-gray-700">{post.company || post.organizer || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-gray-100 text-gray-700 border">
                        {post.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {post.deadline ? new Date(post.deadline).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-amber-700 font-medium">
                      {post.archivedAt ? new Date(post.archivedAt).toLocaleDateString() : 'Auto-Archived'}
                    </td>
                    <td className="p-4 text-right">
                      <ExcelExportButtons postId={post._id} postCategory={post.category} postTitle={post.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedPosts;
