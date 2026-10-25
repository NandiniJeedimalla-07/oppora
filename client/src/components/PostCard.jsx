import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import MandatoryBadge from './MandatoryBadge';
import {
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  GraduationCap,
  CheckCircle2,
  Clock,
  Tag,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onStatusUpdated }) => {
  const { isStudent } = useAuth();
  const [studentStatus, setStudentStatus] = useState(post.studentStatus || 'NOT APPLIED');
  const [loadingAction, setLoadingAction] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isJob = post.category === 'JOB';
  const isHackathon = post.category === 'HACKATHON';
  const isMandatoryReg = post.category === 'MANDATORY_REGISTRATION';
  const isExperience = post.category === 'INTERVIEW_EXPERIENCE';

  const isMandatory = post.isMandatory || isMandatoryReg;
  const isTracked = isJob || isHackathon || isMandatoryReg;

  const hasCompleted =
    (isJob && studentStatus === 'APPLIED') ||
    ((isHackathon || isMandatoryReg) && studentStatus === 'REGISTERED');

  const handleApply = async () => {
    if (hasCompleted) return;
    try {
      setLoadingAction(true);
      setErrorMessage('');
      await api.post('/student/apply', { postId: post._id });
      setStudentStatus('APPLIED');
      if (onStatusUpdated) await onStatusUpdated(post._id, 'APPLIED');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnapply = async () => {
    if (!hasCompleted || !isJob) return;
    try {
      setLoadingAction(true);
      setErrorMessage('');
      await api.post('/student/unapply', { postId: post._id });
      setStudentStatus('NOT APPLIED');
      if (onStatusUpdated) await onStatusUpdated(post._id, 'NOT APPLIED');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to unmark application');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRegister = async () => {
    if (hasCompleted) return;
    try {
      setLoadingAction(true);
      setErrorMessage('');
      await api.post('/student/register-event', { postId: post._id });
      setStudentStatus('REGISTERED');
      if (onStatusUpdated) await onStatusUpdated(post._id, 'REGISTERED');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update registration status');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnregister = async () => {
    if (!hasCompleted || isJob) return;
    try {
      setLoadingAction(true);
      setErrorMessage('');
      await api.post('/student/unregister-event', { postId: post._id });
      setStudentStatus('NOT REGISTERED');
      if (onStatusUpdated) await onStatusUpdated(post._id, 'NOT REGISTERED');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to unmark registration');
    } finally {
      setLoadingAction(false);
    }
  };

  const getTargetUrl = () => {
    return post.applicationUrl || post.registrationUrl || post.sourceUrl || '#';
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
        isMandatory && !hasCompleted
          ? 'border-red-300 ring-2 ring-red-100'
          : hasCompleted
          ? 'border-emerald-200 bg-emerald-50/10'
          : 'border-gray-200'
      }`}
    >
      {/* Top Banner Bar */}
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
              {post.category.replace('_', ' ')}
            </span>
            {isHackathon && (
              <span
                className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                  post.isHiringRelated
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {post.isHiringRelated ? 'HIRING-RELATED' : 'GENERAL HACKATHON'}
              </span>
            )}
            {isMandatory && <MandatoryBadge />}
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={post.calculatedStatus} />

            {/* Personal Student Status Badge */}
            {isStudent && isTracked && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                  hasCompleted
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {hasCompleted ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {isJob ? 'APPLIED ✓' : 'REGISTERED ✓'}
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {isJob ? 'NOT APPLIED' : 'NOT REGISTERED'}
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition leading-snug mb-2">
          {post.title}
        </h3>

        {/* Subtitle Details */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-600 mb-4">
          {(post.company || post.organizer) && (
            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{post.company || post.organizer}</span>
            </div>
          )}

          {post.location && (
            <div className="flex items-center gap-1 text-gray-500">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{post.location}</span>
            </div>
          )}

          {post.deadline && (
            <div className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Deadline: {new Date(post.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          )}

          {post.teamSize && (
            <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-0.5 rounded border">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Team: {post.teamSize}</span>
            </div>
          )}
        </div>

        {/* Tags for Interview Experiences */}
        {isExperience && post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <Tag className="w-3 h-3 text-indigo-500" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description snippet */}
        <p className={`text-xs text-gray-600 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {post.description}
        </p>

        {post.description && post.description.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-0.5"
          >
            {expanded ? (
              <>Show Less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Read Full Details <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}

        {/* Eligibility criteria box */}
        {!isExperience && post.eligibility && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-2 text-xs">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-blue-600" /> Eligibility:
            </span>

            {post.eligibility.graduationYears?.length > 0 && (
              <span className="bg-white px-2 py-0.5 rounded border text-gray-700 font-medium">
                Batch: {post.eligibility.graduationYears.join(', ')}
              </span>
            )}

            {post.eligibility.departments?.length > 0 && (
              <span className="bg-white px-2 py-0.5 rounded border text-gray-700 font-medium">
                Dept: {post.eligibility.departments.join(', ')}
              </span>
            )}

            {post.eligibility.minimumCGPA > 0 && (
              <span className="bg-white px-2 py-0.5 rounded border text-gray-700 font-medium">
                Min CGPA: {post.eligibility.minimumCGPA}
              </span>
            )}

            {post.eligibility.backlogsAllowed !== undefined && (
              <span className="bg-white px-2 py-0.5 rounded border text-gray-700 font-medium">
                Backlogs ≤ {post.eligibility.backlogsAllowed}
              </span>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Footer Action Area */}
      <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        {/* External Link Button */}
        {getTargetUrl() !== '#' ? (
          <a
            href={getTargetUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition active:scale-95"
          >
            {isJob ? 'Apply Now' : isHackathon || isMandatoryReg ? 'Register Now' : 'Read Experience'}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-gray-400 italic">No external link provided</span>
        )}

        {/* Student Application Declaration Checkbox */}
        {isStudent && isTracked && (
          <div className="flex items-center gap-2">
            <label
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition select-none ${
                hasCompleted
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={hasCompleted}
                disabled={loadingAction || (post.calculatedStatus === 'EXPIRED' && !hasCompleted)}
                onChange={() => {
                  if (isJob) {
                    if (hasCompleted) handleUnapply();
                    else handleApply();
                  } else if (hasCompleted) {
                    handleUnregister();
                  } else {
                    handleRegister();
                  }
                }}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 disabled:opacity-50"
              />
              <span>
                {hasCompleted
                  ? isJob
                    ? 'I have applied — click to unmark'
                    : 'I have registered on official website'
                  : isJob
                  ? 'I have applied'
                  : 'I have registered'}
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
