import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, usersAPI, feesAPI, eventsAPI, lecturesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseModal from './CourseModal';
import EventModal from './EventModal';
import './ModernDashboard.css';

const ModernAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('home');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [fees, setFees] = useState([]);
  const [events, setEvents] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    loadData();
    
  }, [activeView]);

  const loadData = async () => {
    try {
      console.log('Loading admin data...');
      const [courseRes, studentRes, teacherRes, lectureRes, feeRes, eventRes] = await Promise.all([
        coursesAPI.getAll().catch(err => { console.error('Courses error:', err); return { data: [] }; }),
        usersAPI.getAll('student').catch(err => { console.error('Students error:', err); return { data: [] }; }),
        usersAPI.getAll('teacher').catch(err => { console.error('Teachers error:', err); return { data: [] }; }),
        lecturesAPI.getAll().catch(err => { console.error('Lectures error:', err); return { data: [] }; }),
        feesAPI.getAll().catch(err => { console.error('Fees error:', err); return { data: [] }; }),
        eventsAPI.getAll().catch(err => { console.error('Events error:', err); return { data: [] }; })
      ]);
      console.log('Courses loaded:', courseRes.data);
      console.log('Students loaded:', studentRes.data);
      console.log('Teachers loaded:', teacherRes.data);
      console.log('Lectures loaded:', lectureRes.data);
      setCourses(courseRes.data);
      setStudents(studentRes.data);
      setTeachers(teacherRes.data);
      setLectures(lectureRes.data);
      setFees(feeRes.data);
      setEvents(eventRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddCourse = async (courseData) => {
    try {
      await coursesAPI.create(courseData);
      setShowCourseModal(false);
      loadData();
      alert('Course created successfully!');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  const handleAddEvent = async (eventData) => {
    try {
      await eventsAPI.create(eventData);
      setShowEventModal(false);
      loadData();
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = fees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="modern-dashboard">
  
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-title">
            {activeView === 'home' ? `Hi Admin!` : 
             activeView === 'modules' ? 'Admin Module' :
             activeView === 'profile' ? 'Profile' : 'Dashboard'}
          </div>
        </div>
      </div>

     
      {activeView === 'home' && (
        <>
         
          <div className="welcome-section">
            <div className="user-info-card">
              <div className="user-avatar">A</div>
              <div className="user-details">
                <h3>System Administrator</h3>
                <div className="user-id">Admin Panel</div>
                <span className="semester-badge">2025-26</span>
              </div>
            </div>
          </div>

        
          <div className="dashboard-content">
       
            <div className="modules-section">
              <h2 className="section-title">Overview</h2>
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-header">
                    <span className="stat-title">Total Students</span>
                  </div>
                  <div className="stat-value">{students.length}</div>
                  <div className="stat-label">Enrolled students</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-header">
                    <span className="stat-title">Total Teachers</span>
                  </div>
                  <div className="stat-value">{teachers.length}</div>
                  <div className="stat-label">Active teachers</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-header">
                    <span className="stat-title">Total Courses</span>
                  </div>
                  <div className="stat-value">{courses.length}</div>
                  <div className="stat-label">Active courses</div>
                </div>
              </div>
            </div>

            
            <div className="modules-section">
              <h2 className="section-title">Management Modules</h2>
              <div className="modules-grid">
                <button className="module-card" onClick={() => setActiveView('courses')}>
                  <div className="module-icon">📚</div>
                  <div className="module-title">Courses</div>
                  <div className="module-description">Manage all courses</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('lectures')}>
                  <div className="module-icon">📖</div>
                  <div className="module-title">Lectures</div>
                  <div className="module-description">View all lectures</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('students')}>
                  <div className="module-icon">👨‍🎓</div>
                  <div className="module-title">Students</div>
                  <div className="module-description">Manage students</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('teachers')}>
                  <div className="module-icon">👨‍🏫</div>
                  <div className="module-title">Teachers</div>
                  <div className="module-description">Manage teachers</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('fees')}>
                  <div className="module-icon">💰</div>
                  <div className="module-title">Fees</div>
                  <div className="module-description">Fee management</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('events')}>
                  <div className="module-icon">🎉</div>
                  <div className="module-title">Events</div>
                  <div className="module-description">Manage events</div>
                </button>
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
                    <span>📚 {lecture.course?.name}</span>
                    <span>👨‍🏫 {lecture.teacher?.name}</span>
                  </div>
                  <div className="list-item-meta">
                    <span>📅 {new Date(lecture.scheduledAt).toLocaleDateString()}</span>
                    <span>🕐 {new Date(lecture.scheduledAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

  
      {activeView === 'modules' && (
        <div className="dashboard-content">
          <h2 className="section-title">Admin Module</h2>
          <div className="modules-grid">
            <button className="module-card" onClick={() => setActiveView('courses')}>
              <div className="module-icon">📚</div>
              <div className="module-title">Course Management</div>
              <div className="module-description">Add, edit, and manage all courses</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('lectures')}>
              <div className="module-icon">📖</div>
              <div className="module-title">Lecture Management</div>
              <div className="module-description">View and manage all lectures</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('students')}>
              <div className="module-icon">👨‍🎓</div>
              <div className="module-title">Student Management</div>
              <div className="module-description">Manage student records and enrollment</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('teachers')}>
              <div className="module-icon">👨‍🏫</div>
              <div className="module-title">Teacher Management</div>
              <div className="module-description">Manage teacher assignments</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('fees')}>
              <div className="module-icon">💰</div>
              <div className="module-title">Fee Management</div>
              <div className="module-description">Track and manage student fees</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('events')}>
              <div className="module-icon">🎉</div>
              <div className="module-title">Event Management</div>
              <div className="module-description">Create and manage college events</div>
            </button>
          </div>
        </div>
      )}

   
      {activeView === 'courses' && (
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Courses</h2>
            <button className="view-btn" onClick={() => setShowCourseModal(true)}>+ Add Course</button>
          </div>
          <CourseModal
            isOpen={showCourseModal}
            onClose={() => setShowCourseModal(false)}
            onSubmit={handleAddCourse}
          />
          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">No Courses</div>
              <div className="empty-description">Click "Add Course" to create one</div>
            </div>
          ) : (
            courses.map(course => (
              <div key={course._id} className="list-card">
                <div className="list-item-title">{course.name}</div>
                <div className="list-item-meta">
                  <span>📋 Code: {course.code}</span>
                  <span>👨‍🏫 {course.teacher?.name || 'Not Assigned'}</span>
                </div>
                <div className="list-item-meta">
                  <span>👥 Students: {course.students?.length || 0}</span>
                  {course.credits && <span>📊 Credits: {course.credits}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      
      {activeView === 'lectures' && (
        <div className="dashboard-content">
          <h2 className="section-title">All Lectures</h2>
          {lectures.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">No Lectures Scheduled</div>
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
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'students' && (
        <div className="dashboard-content">
          <h2 className="section-title">Students</h2>
          {students.map(student => (
            <div key={student._id} className="list-card">
              <div className="list-item-title">{student.name}</div>
              <div className="list-item-meta">
                <span>📧 {student.email}</span>
              </div>
              {student.phone && (
                <div className="list-item-meta">
                  <span>📱 {student.phone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Teachers View */}
      {activeView === 'teachers' && (
        <div className="dashboard-content">
          <h2 className="section-title">Teachers</h2>
          {teachers.map(teacher => (
            <div key={teacher._id} className="list-card">
              <div className="list-item-title">{teacher.name}</div>
              <div className="list-item-meta">
                <span>📧 {teacher.email}</span>
              </div>
              {teacher.phone && (
                <div className="list-item-meta">
                  <span>📱 {teacher.phone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

  
      {activeView === 'fees' && (
        <div className="dashboard-content">
          <h2 className="section-title">Fee Management</h2>
          <div className="list-card">
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196F3', marginBottom: '20px' }}>
                {totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0}%
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Total Fees</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{totalFees}/-</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Collected</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{paidFees}/-</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {activeView === 'events' && (
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Events</h2>
            <button className="view-btn" onClick={() => setShowEventModal(true)}>+ Add Event</button>
          </div>
          <EventModal
            isOpen={showEventModal}
            onClose={() => setShowEventModal(false)}
            onSubmit={handleAddEvent}
          />
          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <div className="empty-title">No Events</div>
            </div>
          ) : (
            events.map(event => (
              <div key={event._id} className="list-card">
                <div className="list-item-title">{event.title}</div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>{event.description}</p>
                <div className="list-item-meta">
                  <span>📅 {new Date(event.eventDate).toLocaleDateString()}</span>
                  {event.location && <span>📍 {event.location}</span>}
                </div>
              </div>
            ))
          )}
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
                A
              </div>
              <h2>System Administrator</h2>
              <p style={{ color: '#666' }}>{user.email}</p>
              <span className="semester-badge">Admin</span>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong>Email:</strong> {user.email}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Role:</strong> {user.role}
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

export default ModernAdminDashboard;
