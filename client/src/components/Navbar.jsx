import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { LogOut, User, ShieldCheck, GraduationCap, Menu, X, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [cronMessage, setCronMessage] = useState(null);

  const handleCronTrigger = async () => {
    try {
      setTriggeringCron(true);
      const { data } = await api.post('/admin/cron/trigger');
      setCronMessage('Cron executed!');
      setTimeout(() => setCronMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringCron(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Mobile menu toggle & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 tracking-tight block leading-none">
                  Placement<span className="text-blue-600">Hub</span>
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mt-0.5">
                  {isAdmin ? 'Placement Cell Admin' : 'Student Opportunity Portal'}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Admin Manual Cron Testing Button */}
            {isAdmin && (
              <button
                onClick={handleCronTrigger}
                disabled={triggeringCron}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                title="Run automatic deadline check & notifications now"
              >
                <Play className={`w-3.5 h-3.5 ${triggeringCron ? 'animate-spin' : ''}`} />
                {triggeringCron ? 'Running Cron...' : cronMessage || 'Run Deadline Check'}
              </button>
            )}

            {/* Notification Bell */}
            <NotificationDropdown />

            {/* User Profile Badge & Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="hidden md:block text-right">
                <p className="text-xs font-bold text-gray-900 leading-none">{user?.name}</p>
                <span className="text-[11px] font-medium text-gray-500">
                  {isAdmin ? (
                    <span className="text-indigo-600 font-semibold inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Placement Cell
                    </span>
                  ) : (
                    `${user?.department || 'Student'} • ${user?.graduationYear || ''}`
                  )}
                </span>
              </div>

              <div className="relative group">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm border-2 border-blue-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
