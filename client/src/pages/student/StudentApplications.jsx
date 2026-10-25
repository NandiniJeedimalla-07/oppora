import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PostCard from '../../components/PostCard';
import { CheckSquare, FileCheck, RefreshCw } from 'lucide-react';

export const StudentApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/student/applications');
      setApps(data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <CheckSquare className="w-7 h-7 text-emerald-600" /> My Applied Jobs
        </h1>
        <p className="text-xs text-gray-500 mt-1">History of all job opportunities you have marked as applied</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mr-2" /> Loading applied jobs...
        </div>
      ) : apps.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
          <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-800 text-sm">You haven't marked any job application as applied yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((item) => (
            <PostCard key={item._id} post={item.post} onStatusUpdated={fetchApps} />
          ))}
        </div>
      )}
    </div>
  );
};

export const StudentRegistrations = () => {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/student/registrations');
      setRegs(data.registrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegs();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <FileCheck className="w-7 h-7 text-indigo-600" /> My Completed Event Registrations
        </h1>
        <p className="text-xs text-gray-500 mt-1">History of mandatory events and hackathons you have marked as registered</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mr-2" /> Loading registered events...
        </div>
      ) : regs.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">
          <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-800 text-sm">You haven't marked any event registration yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regs.map((item) => (
            <PostCard key={item._id} post={item.post} onStatusUpdated={fetchRegs} />
          ))}
        </div>
      )}
    </div>
  );
};
