import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentJobs from './pages/student/StudentJobs';
import StudentHackathons from './pages/student/StudentHackathons';
import StudentMandatory from './pages/student/StudentMandatory';
import StudentExperiences from './pages/student/StudentExperiences';
import { StudentApplications, StudentRegistrations } from './pages/student/StudentApplications';
import StudentProfile from './pages/student/StudentProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreatePost from './pages/admin/CreatePost';
import AdminPosts from './pages/admin/AdminPosts';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminStudents from './pages/admin/AdminStudents';
import ArchivedPosts from './pages/admin/ArchivedPosts';

// Protected Layout wrapper
const ProtectedLayout = ({ allowedRole }) => {
  const { user, loading, isAdmin, isStudent } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
        Authenticating placement session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole === 'ADMIN' && !isAdmin) {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (allowedRole === 'STUDENT' && !isStudent) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/student/dashboard" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedLayout allowedRole="STUDENT" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/jobs" element={<StudentJobs />} />
            <Route path="/student/hackathons" element={<StudentHackathons />} />
            <Route path="/student/mandatory" element={<StudentMandatory />} />
            <Route path="/student/interview-experiences" element={<StudentExperiences />} />
            <Route path="/student/my-applications" element={<StudentApplications />} />
            <Route path="/student/my-registrations" element={<StudentRegistrations />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedLayout allowedRole="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/create-post" element={<CreatePost />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/archived-posts" element={<ArchivedPosts />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
