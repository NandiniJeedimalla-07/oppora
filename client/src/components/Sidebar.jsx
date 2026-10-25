import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Code2,
  AlertCircle,
  BookOpen,
  CheckSquare,
  FileCheck,
  User,
  PlusCircle,
  Archive,
  Users,
  BarChart3,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/jobs', label: 'Job Postings', icon: Briefcase },
    { to: '/student/hackathons', label: 'Hackathons', icon: Code2 },
    { to: '/student/mandatory', label: 'Mandatory Registrations', icon: AlertCircle, highlight: true },
    { to: '/student/interview-experiences', label: 'Interview Experiences', icon: BookOpen },
    { to: '/student/my-applications', label: 'My Applications', icon: CheckSquare },
    { to: '/student/my-registrations', label: 'My Registrations', icon: FileCheck },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/create-post', label: '+ Create New Post', icon: PlusCircle, special: true },
    { to: '/admin/posts', label: 'All Posts Table', icon: Briefcase },
    { to: '/admin/analytics', label: 'Placement Analytics', icon: BarChart3 },
    { to: '/admin/students', label: 'Student Directory', icon: Users },
    { to: '/admin/archived-posts', label: 'Archived Posts', icon: Archive },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center lg:hidden border-b border-gray-100">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-400">Navigation</span>
          <button onClick={onClose} className="p-1 rounded text-gray-500 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 px-3 flex flex-col h-full justify-between overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {isAdmin ? 'Placement Cell Menu' : 'Student Navigation'}
            </div>

            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      link.special
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
                        : isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-red-500 animate-pulse' : ''}`} />
                  <span className="flex-1">{link.label}</span>
                  {link.highlight && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                      Required
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 mt-6">
            <p className="font-bold mb-1">Single Common Portal</p>
            <p className="text-[11px] text-blue-700 leading-tight">
              Centralized placement listings with eligibility verification & instant student tracking.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
