import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ModernAdminDashboard from './components/ModernAdminDashboard';
import ModernTeacherDashboard from './components/ModernTeacherDashboard';
import ModernStudentDashboard from './components/ModernStudentDashboard';
import './App.css';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}-dashboard`} />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={
            <PrivateRoute role="admin">
              <ModernAdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/teacher-dashboard" element={
            <PrivateRoute role="teacher">
              <ModernTeacherDashboard />
            </PrivateRoute>
          } />
          <Route path="/student-dashboard" element={
            <PrivateRoute role="student">
              <ModernStudentDashboard />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
