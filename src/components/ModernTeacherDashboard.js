import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lecturesAPI, assignmentsAPI, coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LectureModal from './LectureModal';
import AssignmentModal from './AssignmentModal';
import SubmissionsModal from './SubmissionsModal';
import AttendanceModal from './AttendanceModal';
import './ModernDashboard.css';

const ModernTeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('home');
  const [lectures, setLectures] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeView]);

  const loadData = async () => {
    try {
      console.log('Loading teacher data...');
      const [lectureRes, assignRes, courseRes] = await Promise.all([
        lecturesAPI.getAll().catch(err => { console.error('Lectures error:', err); return { data: [] }; }),
        assignmentsAPI.getAll().catch(err => { console.error('Assignments error:', err); return { data: [] }; }),
        coursesAPI.getAll().catch(err => { console.error('Courses error:', err); return { data: [] }; })
      ]);
      console.log('Lectures loaded:', lectureRes.data);
      console.log('Courses loaded:', courseRes.data);
      setLectures(lectureRes.data);
      setAssignments(assignRes.data);
      setCourses(courseRes.data.filter(c => c.teacher?._id === user.id));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddLecture = async (lectureData) => {
    try {
      await lecturesAPI.create(lectureData);
      setShowLectureModal(false);
      loadData();
      alert('Lecture created successfully!');
    } catch (error) {
      console.error('Error creating lecture:', error);
      alert('Failed to create lecture');
    }
  };

  const handleAddAssignment = async (assignmentData) => {
    try {
      await assignmentsAPI.create(assignmentData);
      setShowAssignmentModal(false);
      loadData();
      alert('Assignment created successfully!');
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      const res = await assignmentsAPI.getSubmissions(assignment._id);
      setSubmissions(res.data);
      setSelectedAssignment(assignment);
      setShowSubmissionsModal(true);
    } catch (error) {
      console.error('Error loading submissions:', error);
      alert('Failed to load submissions');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="modern-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-title">
            {activeView === 'home' ? `Hi ${user.name}!` : 
             activeView === 'modules' ? 'Teacher Module' :
             activeView === 'profile' ? 'Profile' : 'Dashboard'}
          </div>
        </div>
      </div>

      {activeView === 'home' && (
        <>
          <div className="welcome-section">
            <div className="user-info-card">
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div className="user-details">
                <h3>{user.name}</h3>
                <div className="user-id">Teacher ID: TCH{user.id.slice(-6)}</div>
                <span className="semester-badge">2025-26</span>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="modules-section">
              <h2 className="section-title">Modules</h2>
              <div className="modules-grid">
                <button className="module-card" onClick={() => setActiveView('lectures')}>
                  <div className="module-icon">📚</div>
                  <div className="module-title">Lectures</div>
                  <div className="module-description">Manage lecture schedule</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('assignments')}>
                  <div className="module-icon">📝</div>
                  <div className="module-title">Assignments</div>
                  <div className="module-description">View assignments</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('courses')}>
                  <div className="module-icon">📖</div>
                  <div className="module-title">My Courses</div>
                  <div className="module-description">Manage your courses</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('attendance')}>
                  <div className="module-icon">✓</div>
                  <div className="module-title">Attendance</div>
                  <div className="module-description">Mark attendance</div>
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-header">
                  <span className="stat-title">Total Lectures</span>
                </div>
                <div className="stat-value">{lectures.length}</div>
                <div className="stat-label">Scheduled lectures</div>
              </div>
              <div className="stat-card success">
                <div className="stat-header">
                  <span className="stat-title">My Courses</span>
                </div>
                <div className="stat-value">{courses.length}</div>
                <div className="stat-label">Active courses</div>
              </div>
            </div>

            <div className="list-card">
              <div className="list-card-header">
                <h3 className="section-title">Recent Lectures</h3>
                <button className="view-btn" onClick={() => setActiveView('lectures')}>View All</button>
              </div>
              {lectures.slice(0, 3).map(lecture => (
                <div key={lecture._id} className="list-item">
                  <div className="list-item-title">{lecture.title}</div>
                  <div className="list-item-meta">
                    <span>📅 {new Date(lecture.scheduledAt).toLocaleDateString()}</span>
                    <span>🕐 {new Date(lecture.scheduledAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="list-item-meta">
                    <span>📚 {lecture.course?.name || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeView === 'modules' && (
        <div className="dashboard-content">
          <h2 className="section-title">Teacher Module</h2>
          <div className="modules-grid">
            <button className="module-card" onClick={() => setActiveView('lectures')}>
              <div className="module-icon">📚</div>
              <div className="module-title">Lecture Management</div>
              <div className="module-description">Create and manage lecture schedules</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('assignments')}>
              <div className="module-icon">📝</div>
              <div className="module-title">Assignment Management</div>
              <div className="module-description">Create and grade assignments</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('attendance')}>
              <div className="module-icon">✓</div>
              <div className="module-title">Attendance Management</div>
              <div className="module-description">Mark and track student attendance</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('courses')}>
              <div className="module-icon">📖</div>
              <div className="module-title">Course Management</div>
              <div className="module-description">Manage your assigned courses</div>
            </button>
          </div>
        </div>
      )}

      {activeView === 'lectures' && (
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title">Lectures</h2>
            <button className="view-btn" onClick={() => setShowLectureModal(true)}>+ Add Lecture</button>
          </div>
          
          {lectures.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">No Lectures Yet</div>
              <div className="empty-description">Click "Add Lecture" to create your first lecture</div>
            </div>
          ) : (
            lectures.map(lecture => (
              <div key={lecture._id} className="list-card">
                <div className="list-item-title">{lecture.title}</div>
                {lecture.description && (
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>{lecture.description}</p>
                )}
                <div className="list-item-meta">
                  <span>📚 {lecture.course?.name}</span>
                  <span>👨‍🏫 {lecture.teacher?.name}</span>
                </div>
                <div className="list-item-meta">
                  <span>📅 {new Date(lecture.scheduledAt).toLocaleDateString()}</span>
                  <span>🕐 {new Date(lecture.scheduledAt).toLocaleTimeString()}</span>
                </div>
                {lecture.location && (
                  <div className="list-item-meta">
                    <span>📍 {lecture.location}</span>
                    {lecture.duration && <span>⏱️ {lecture.duration} min</span>}
                  </div>
                )}
                <div style={{ marginTop: '10px' }}>
                  <span style={{ 
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: lecture.status === 'scheduled' ? '#E3F2FD' : 
                               lecture.status === 'completed' ? '#E8F5E9' : '#FFEBEE',
                    color: lecture.status === 'scheduled' ? '#2196F3' : 
                           lecture.status === 'completed' ? '#4CAF50' : '#F44336'
                  }}>
                    {lecture.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}

          <LectureModal
            isOpen={showLectureModal}
            onClose={() => setShowLectureModal(false)}
            onSubmit={handleAddLecture}
            teacherId={user.id}
          />
        </div>
      )}

      {activeView === 'assignments' && (
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Assignments</h2>
            <button className="view-btn" onClick={() => setShowAssignmentModal(true)}>+ Add Assignment</button>
          </div>
          <AssignmentModal
            isOpen={showAssignmentModal}
            onClose={() => setShowAssignmentModal(false)}
            onSubmit={handleAddAssignment}
            teacherId={user.id}
          />
          {assignments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-title">No Assignments</div>
            </div>
          ) : (
            assignments.map(assignment => (
              <div key={assignment._id} className="list-card">
                <div className="list-item-title">{assignment.title}</div>
                <div className="list-item-meta">
                  <span>📚 {assignment.course?.name}</span>
                  <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                {assignment.maxMarks && (
                  <div className="list-item-meta">
                    <span>📊 Max Marks: {assignment.maxMarks}</span>
                  </div>
                )}
                <button 
                  className="view-btn" 
                  onClick={() => handleViewSubmissions(assignment)}
                  style={{ marginTop: '10px' }}
                >
                  View Submissions
                </button>
              </div>
            ))
          )}
          <SubmissionsModal
            isOpen={showSubmissionsModal}
            onClose={() => setShowSubmissionsModal(false)}
            assignment={selectedAssignment}
            submissions={submissions}
          />
        </div>
      )}

      {activeView === 'courses' && (
        <div className="dashboard-content">
          <h2 className="section-title">My Courses</h2>
          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <div className="empty-title">No Courses Assigned</div>
            </div>
          ) : (
            courses.map(course => (
              <div key={course._id} className="list-card">
                <div className="list-item-title">{course.name}</div>
                <div className="list-item-meta">
                  <span>📋 Code: {course.code}</span>
                  <span>👥 Students: {course.students?.length || 0}</span>
                </div>
                {course.description && (
                  <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>{course.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'attendance' && (
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Mark Attendance</h2>
            <button className="view-btn" onClick={() => setShowAttendanceModal(true)}>+ Mark Attendance</button>
          </div>
          <div className="list-card">
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Click "Mark Attendance" to mark attendance for your courses.
            </p>
            <div style={{ background: '#E3F2FD', padding: '15px', borderRadius: '8px' }}>
              <strong>Instructions:</strong>
              <ul style={{ marginTop: '10px', marginLeft: '20px', color: '#666' }}>
                <li>Select a course from your assigned courses</li>
                <li>Choose the date</li>
                <li>Mark each student as Present, Absent, or Late</li>
                <li>Submit to save attendance</li>
              </ul>
            </div>
          </div>
          <AttendanceModal
            isOpen={showAttendanceModal}
            onClose={() => setShowAttendanceModal(false)}
            onSubmit={() => {
              setShowAttendanceModal(false);
              loadData();
            }}
            teacherId={user.id}
          />
        </div>
      )}

      {activeView === 'profile' && (
        <div className="dashboard-content">
          <div className="list-card">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div className="user-avatar" style={{ 
                width: '80px', 
                height: '80px', 
                margin: '0 auto 15px',
                fontSize: '32px'
              }}>
                {user.name.charAt(0)}
              </div>
              <h2>{user.name}</h2>
              <p style={{ color: '#666' }}>{user.email}</p>
              <span className="semester-badge">Teacher</span>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong>Email:</strong> {user.email}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Role:</strong> {user.role}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Teacher ID:</strong> TCH{user.id.slice(-6)}
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="bottom-nav">
        <button 
          className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
          onClick={() => setActiveView('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button 
          className={`nav-item ${activeView === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveView('modules')}
        >
          <span className="nav-icon">📱</span>
          <span className="nav-label">Modules</span>
        </button>
        <button 
          className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveView('profile')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ModernTeacherDashboard;
