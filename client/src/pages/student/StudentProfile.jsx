import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  User,
  Save,
  CheckCircle2,
  Upload,
  FileText,
  ExternalLink,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const resumeInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    rollNumber: user?.rollNumber || '',
    department: user?.department || 'CSE',
    graduationYear: user?.graduationYear || 2028,
    cgpa: user?.cgpa ?? 8.0,
    backlogs: user?.backlogs ?? 0,
    personalEmail: user?.personalEmail || '',
    contactNumber: user?.contactNumber || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      setError('');
      const { data } = await api.put('/student/profile', formData);
      updateUser(data.user);
      setMessage('Profile updated successfully! Placement eligibility recalculation is active.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      setMessage('');
      setError('');

      const form = new FormData();
      form.append('resume', file);

      const { data } = await api.post('/student/resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(data.user);
      setMessage('Resume uploaded successfully. You can replace it anytime by uploading another file.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-blue-600" /> Student Profile & Academic Eligibility
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Keep your contact details, academic information, and resume up to date for placement opportunities.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-3">
            <User className="w-4 h-4 text-blue-600" /> Personal Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">College Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-gray-700 uppercase mb-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Personal Email ID
              </label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleChange}
                placeholder="yourpersonalmail@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-gray-700 uppercase mb-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={15}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-3 pt-2">
            <FileText className="w-4 h-4 text-blue-600" /> Academic Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="AIDS">AIDS</option>
                <option value="AIML">AIML</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Graduation Year</label>
              <select
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
                <option value={2029}>2029</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                name="cgpa"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Active Backlogs</label>
              <input
                type="number"
                name="backlogs"
                min="0"
                value={formData.backlogs}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingResume}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 mt-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Profile...' : 'Save & Update Profile'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Resume
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Upload your latest resume. Uploading a new file replaces the previous resume.
            </p>
          </div>
          {user?.resumeUrl && (
            <a
              href={user.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              View Resume <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleResumeUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            disabled={uploadingResume}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-60"
          >
            {uploadingResume ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploadingResume ? 'Uploading Resume...' : user?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
          </button>

          <div className="text-xs text-gray-500">
            Accepted: PDF, DOC, DOCX · Maximum size: 5 MB
          </div>
        </div>

        {user?.resumeUrl && (
          <a
            href={user.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            View Current Resume <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
