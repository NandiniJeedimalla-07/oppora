import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, AlertOctagon, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    if (type?.includes('MANDATORY')) {
      return <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0" />;
    }
    if (type?.includes('DEADLINE')) {
      return <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />;
    }
    return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.postId) {
      const cat = notif.postId.category;
      if (cat === 'JOB') navigate('/student/jobs');
      else if (cat === 'HACKATHON') navigate('/student/hackathons');
      else if (cat === 'MANDATORY_REGISTRATION') navigate('/student/mandatory');
      else if (cat === 'INTERVIEW_EXPERIENCE') navigate('/student/interview-experiences');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-red-600 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-sm">In-App Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead('all')}
                className="text-xs text-blue-300 hover:text-white flex items-center gap-1 font-medium transition"
              >
                <CheckCheck className="w-4 h-4" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <Bell className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 hover:bg-blue-50/50 transition cursor-pointer flex gap-3 ${
                    !n.isRead ? 'bg-blue-50/30 font-medium' : 'bg-white text-gray-600'
                  }`}
                >
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {new Date(n.sentAt || n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-snug">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
            <span className="text-xs text-gray-500">Placement Cell Notification Center</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
