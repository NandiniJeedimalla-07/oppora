import React, { useState } from 'react';
import api from '../../services/api';
import EligibilityPreviewModal from '../../components/EligibilityPreviewModal';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Save, Send, Sparkles, Building, Code2, AlertCircle, BookOpen } from 'lucide-react';

const CreatePost = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('JOB'); // JOB, HACKATHON, MANDATORY_REGISTRATION, INTERVIEW_EXPERIENCE

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    hackathonName: '',
    eventName: '',
    organizer: '',
    jobTitle: '',
    location: '',
    description: '',
    applicationUrl: '',
    registrationUrl: '',
    sourceUrl: '',
    sourceType: 'PLACEMENT_CELL',
    deadline: '',
    eligibility: {
      graduationYears: [2028],
      departments: ['CSE', 'IT', 'ECE'],
      minimumCGPA: 6.5,
      backlogsAllowed: 0,
    },
    otherEligibility: '',
    teamSize: '',
    instructions: '',
    isMandatory: false,
    isHiringRelated: false,
    tags: 'DSA, Technical Interview',
    author: '',
    docUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    if (cat === 'MANDATORY_REGISTRATION') {
      setFormData((prev) => ({ ...prev, isMandatory: true }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEligibilityChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [field]: value,
      },
    }));
  };

  const toggleGradYear = (year) => {
    const currentYears = formData.eligibility.graduationYears || [];
    const newYears = currentYears.includes(year)
      ? currentYears.filter((y) => y !== year)
      : [...currentYears, year];
    handleEligibilityChange('graduationYears', newYears);
  };

  const toggleDept = (dept) => {
    const currentDepts = formData.eligibility.departments || [];
    const newDepts = currentDepts.includes(dept)
      ? currentDepts.filter((d) => d !== dept)
      : [...currentDepts, dept];
    handleEligibilityChange('departments', newDepts);
  };

  // Build Payload
  const buildPayload = (status = 'DRAFT') => {
    let finalTitle = formData.title;
    if (category === 'JOB' && !finalTitle) finalTitle = `${formData.company} ${formData.jobTitle || 'Placement Drive'}`;
    if (category === 'HACKATHON' && !finalTitle) finalTitle = formData.hackathonName || 'Hackathon Event';
    if (category === 'MANDATORY_REGISTRATION' && !finalTitle) finalTitle = formData.eventName || 'Mandatory Registration Event';

    const tagsArray = typeof formData.tags === 'string'
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : formData.tags;

    return {
      ...formData,
      title: finalTitle || 'Untitled Post',
      category,
      isMandatory: category === 'MANDATORY_REGISTRATION' ? true : formData.isMandatory,
      tags: tagsArray,
      status,
    };
  };

  // Save as Draft
  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = buildPayload('DRAFT');
      await api.post('/posts', payload);
      navigate('/admin/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Open Eligibility Preview Modal before publishing
  const handleOpenPreviewModal = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = buildPayload('PUBLISHED');
      
      if (!payload.description) {
        setError('Description is required before publishing');
        setLoading(false);
        return;
      }

      // Fetch eligibility preview metrics
      const { data } = await api.post('/posts/preview-eligibility', { eligibility: payload.eligibility });
      setPreviewData(data);
      setPreviewModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate eligibility preview');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm & Publish Post
  const handleConfirmPublish = async () => {
    try {
      setLoading(true);
      const payload = buildPayload('PUBLISHED');
      await api.post('/posts', payload);
      setPreviewModalOpen(false);
      navigate('/admin/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">
          <Sparkles className="w-4 h-4 text-amber-300" /> Placement Cell Common Dashboard
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create New Post</h1>
        <p className="text-xs sm:text-sm text-blue-200 mt-1">
          Single common posting interface for jobs, hackathons, mandatory registrations, and interview experiences.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {/* Main Creation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Select Category (Common Posting System)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'JOB', label: '1. Job Posting', icon: Building, color: 'blue' },
              { id: 'HACKATHON', label: '2. Hackathon', icon: Code2, color: 'indigo' },
              { id: 'MANDATORY_REGISTRATION', label: '3. Mandatory Registration', icon: AlertCircle, color: 'red' },
              { id: 'INTERVIEW_EXPERIENCE', label: '4. Interview Experience', icon: BookOpen, color: 'purple' },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-xs leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Dynamic Category Specific Form Fields */}

        {/* CATEGORY = JOB */}
        {category === 'JOB' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" /> Job Opportunity Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. TCS / Infosys / Amazon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineer / SDE Internship"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Post Title (Headline)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. TCS Software Engineer Off-Campus Hiring 2028"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Pan India / Bengaluru / Remote"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Application URL</label>
                <input
                  type="url"
                  name="applicationUrl"
                  value={formData.applicationUrl}
                  onChange={handleInputChange}
                  placeholder="https://company.careers/apply"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Application Deadline</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* CATEGORY = HACKATHON */}
        {category === 'HACKATHON' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" /> Hackathon Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hackathon Name</label>
                <input
                  type="text"
                  name="hackathonName"
                  value={formData.hackathonName}
                  onChange={handleInputChange}
                  placeholder="e.g. Myntra HackerRamp / Smart India Hackathon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Organizer / Sponsor</label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  placeholder="e.g. Myntra / Ministry of Education"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Post Title (Headline)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Myntra HackerRamp 2026 Campus Edition"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Registration URL</label>
                <input
                  type="url"
                  name="registrationUrl"
                  value={formData.registrationUrl}
                  onChange={handleInputChange}
                  placeholder="https://unstop.com/hackathon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Registration Deadline</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Team Size</label>
                <input
                  type="text"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  placeholder="e.g. 1 - 4 members"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isMandatory"
                    checked={formData.isMandatory}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <span>Mark as Mandatory Hackathon for Eligible Students?</span>
                </label>
              </div>
            </div>

            <label className="flex items-start gap-2 p-3 rounded-xl border border-indigo-200 bg-indigo-50 text-xs text-indigo-900 cursor-pointer">
              <input
                type="checkbox"
                name="isHiringRelated"
                checked={formData.isHiringRelated}
                onChange={handleInputChange}
                className="w-4 h-4 mt-0.5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span>
                <span className="font-bold block">Hiring-related hackathon</span>
                Mark this event when participation is connected to recruitment, internships, or job opportunities.
              </span>
            </label>
          </div>
        )}

        {/* CATEGORY = MANDATORY REGISTRATION */}
        {category === 'MANDATORY_REGISTRATION' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" /> This post will automatically carry a MANDATORY badge and require student declaration tracking.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Event / Quiz / Assessment Name</label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="e.g. Capgemini BrandQuest / Company Quiz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Organizer / Company</label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  placeholder="e.g. Capgemini / Placement Cell"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Post Title (Headline)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Capgemini BrandQuest Mandatory Registration Drive 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Official Registration URL</label>
                <input
                  type="url"
                  name="registrationUrl"
                  value={formData.registrationUrl}
                  onChange={handleInputChange}
                  placeholder="https://capgemini.com/register"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Registration Deadline</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY = INTERVIEW EXPERIENCE */}
        {category === 'INTERVIEW_EXPERIENCE' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" /> Interview Experience Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Experience Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Google SDE 1 Off-Campus Interview Experience 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g. Google / Microsoft / Amazon"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Author / Source</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Student / LinkedIn Post / Placement Cell"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">External Article / LinkedIn Link</label>
                <input
                  type="url"
                  name="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/posts/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Technical Interview, HR Interview, DSA, Aptitude, System Design, Preparation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Description Field (Common to all) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Description & Instructions *
          </label>
          <textarea
            rows="5"
            name="description"
            required
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed description, job responsibilities, round breakdown, registration instructions..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Eligibility Criteria Configuration (For JOB, HACKATHON, MANDATORY) */}
        {category !== 'INTERVIEW_EXPERIENCE' && (
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Student Eligibility Rules (Automatic Audience Target)
            </h3>

            {/* Graduation Years */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Eligible Batches (Graduation Year):</label>
              <div className="flex flex-wrap gap-2">
                {[2026, 2027, 2028, 2029].map((year) => {
                  const isChecked = formData.eligibility.graduationYears.includes(year);
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => toggleGradYear(year)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        isChecked
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}Batch {year}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Departments */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Eligible Departments:</label>
              <div className="flex flex-wrap gap-2">
                {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML'].map((dept) => {
                  const isChecked = formData.eligibility.departments.includes(dept);
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDept(dept)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{dept}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum CGPA & Backlogs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum CGPA Criteria:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.eligibility.minimumCGPA}
                  onChange={(e) => handleEligibilityChange('minimumCGPA', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Max Active Backlogs Allowed:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.eligibility.backlogsAllowed}
                  onChange={(e) => handleEligibilityChange('backlogsAllowed', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm bg-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>

          <button
            type="button"
            onClick={handleOpenPreviewModal}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Preview Eligibility & Publish
          </button>
        </div>
      </div>

      {/* Eligibility Preview Confirmation Modal */}
      <EligibilityPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onConfirm={handleConfirmPublish}
        previewData={previewData}
        postTitle={formData.title || formData.company || formData.hackathonName || formData.eventName}
        loading={loading}
      />
    </div>
  );
};

export default CreatePost;
