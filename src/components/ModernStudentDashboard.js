import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentsAPI, eventsAPI, lecturesAPI, feesAPI, attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssignmentDetailModal from './AssignmentDetailModal';
import './ModernDashboard.css';

const ModernStudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('home');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [courseAttendance, setCourseAttendance] = useState({});

  useEffect(() => {
    loadData();
  }, [activeView]);

  const loadData = async () => {
    try {
      console.log('=== Loading student data ===');
      console.log('User:', user);
      
      const [assignRes, subRes, lectureRes, feeRes, eventRes, attendanceRes] = await Promise.all([
        assignmentsAPI.getAll().catch(err => { 
          console.error('Assignments error:', err.response?.data || err.message); 
          return { data: [] }; 
        }),
        assignmentsAPI.getStudentSubmissions(user.id).catch(err => { 
          console.error('Submissions error:', err.response?.data || err.message); 
          return { data: [] }; 
        }),
        lecturesAPI.getAll().catch(err => { 
          console.error('Lectures error:', err.response?.data || err.message); 
          return { data: [] }; 
        }),
        feesAPI.getStudent(user.id).catch(err => { 
          console.error('Fees error:', err.response?.data || err.message); 
          return { data: [] }; 
        }),
        eventsAPI.getAll().catch(err => { 
          console.error('Events error:', err.response?.data || err.message); 
          return { data: [] }; 
        }),
        attendanceAPI.getStudent(user.id).catch(err => {
          console.error('Attendance error:', err.response?.data || err.message);
          return { data: [] };
        })
      ]);
      
      console.log('=== Data loaded ===');
      console.log('Lectures count:', lectureRes.data?.length || 0);
      console.log('Lectures data:', lectureRes.data);
      console.log('Assignments count:', assignRes.data?.length || 0);
      console.log('Events count:', eventRes.data?.length || 0);
      
      setAssignments(assignRes.data || []);
      setSubmissions(subRes.data || []);
      setLectures(lectureRes.data || []);
      setFees(feeRes.data || []);
      setEvents(eventRes.data || []);
      setAttendance(attendanceRes.data || []);
      
      const attendanceData = attendanceRes.data || [];
      const courseStats = {};

      attendanceData.forEach(att => {
        const courseId = att.course?._id || att.course;
        const courseName = att.course?.name || 'Unknown Course';
        
        if (!courseStats[courseId]) {
          courseStats[courseId] = {
            courseName,
            total: 0,
            present: 0,
            absent: 0,
            late: 0
          };
        }
        
        courseStats[courseId].total++;
        if (att.status === 'present') courseStats[courseId].present++;
        else if (att.status === 'absent') courseStats[courseId].absent++;
        else if (att.status === 'late') courseStats[courseId].late++;
      });
      
      setCourseAttendance(courseStats);
      console.log('Course attendance stats:', courseStats);
      
      console.log('=== State updated ===');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSubmitted = (assignmentId) => {
    return submissions.some(sub => sub.assignment?._id === assignmentId);
  };

  const handleViewAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const handleSubmitAssignment = async (submissionData) => {
    try {
      await assignmentsAPI.submit({
        assignment: selectedAssignment._id,
        student: user.id,
        submissionText: submissionData.submissionText,
        fileUrl: submissionData.file ? URL.createObjectURL(submissionData.file) : null
      });
      setShowAssignmentModal(false);
      loadData();
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Failed to submit assignment');
    }
  };

  const pendingAssignments = assignments.filter(
    a => !submissions.some(s => s.assignment?._id === a._id)
  );

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = fees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="modern-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-title">
            {activeView === 'home' ? `Hi ${user.name}!` : 
             activeView === 'modules' ? 'Student Module' :
             activeView === 'profile' ? 'Profile' : 'Dashboard'}
          </div>
        </div>
        <div className="header-right">
        </div>
      </div>

      {activeView === 'home' && (
        <>
          <div className="welcome-section">
            <div className="user-info-card">
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div className="user-details">
                <h3>{user.name}</h3>
                <div className="user-id">Student ID: STU{user.id.slice(-6)}</div>
                <span className="semester-badge">2025-26</span>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="modules-section">
              <h2 className="section-title">Modules</h2>
              <div className="modules-grid">
                <button className="module-card" onClick={() => setActiveView('assignments')}>
                  <div className="module-icon">📝</div>
                  <div className="module-title">Assignment</div>
                  <div className="module-description">View and submit assignments</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('lectures')}>
                  <div className="module-icon">📚</div>
                  <div className="module-title">Lectures</div>
                  <div className="module-description">View lecture schedule</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('grades')}>
                  <div className="module-icon">🎓</div>
                  <div className="module-title">Grades</div>
                  <div className="module-description">Check your grades</div>
                </button>
                <button className="module-card" onClick={() => setActiveView('fees')}>
                  <div className="module-icon">💰</div>
                  <div className="module-title">Fees</div>
                  <div className="module-description">View fee details</div>
                </button>
              </div>
            </div>

            <div className="modules-section">
              <h2 className="section-title">Assignments</h2>
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-header">
                    <span className="stat-title">Total Assignments</span>
                  </div>
                  <div className="stat-value">{assignments.length}</div>
                  <div className="stat-label">All assignments</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-header">
                    <span className="stat-title">Pending</span>
                  </div>
                  <div className="stat-value">{pendingAssignments.length}</div>
                  <div className="stat-label">To be submitted</div>
                </div>
              </div>
            </div>

            <div className="list-card">
              <div className="list-card-header">
                <h3 className="section-title">Upcoming Lectures</h3>
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
          <h2 className="section-title">Student Module</h2>
          <div className="modules-grid">
            <button className="module-card" onClick={() => setActiveView('assignments')}>
              <div className="module-icon">📝</div>
              <div className="module-title">Assignment (Internal Test)</div>
              <div className="module-description">Facilitate seamless assignment distribution, submission...</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('lectures')}>
              <div className="module-icon">📚</div>
              <div className="module-title">Academic Planning</div>
              <div className="module-description">Optimize course offerings, better utilization of resources...</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('grades')}>
              <div className="module-icon">📊</div>
              <div className="module-title">Result Analysis</div>
              <div className="module-description">Manage student records, track performance metrics...</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('fees')}>
              <div className="module-icon">💰</div>
              <div className="module-title">Fees</div>
              <div className="module-description">View and manage fee payments</div>
            </button>
            <button className="module-card" onClick={() => setActiveView('events')}>
              <div className="module-icon">🎉</div>
              <div className="module-title">Events</div>
              <div className="module-description">View college events and activities</div>
            </button>
          </div>
        </div>
      )}

      {activeView === 'assignments' && (
        <div className="dashboard-content">
          <div className="tabs-container">
            <button className="tab-btn active">Pending</button>
            <button className="tab-btn">Completed</button>
          </div>
          
          {pendingAssignments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-title">No Pending Assignments</div>
              <div className="empty-description">You're all caught up!</div>
            </div>
          ) : (
            pendingAssignments.map(assignment => (
              <div key={assignment._id} className="list-card">
                <div className="list-item-title">{assignment.title}</div>
                <div className="list-item-meta">
                  <span>📚 {assignment.course?.name}</span>
                </div>
                <div className="list-item-meta">
                  <span>📅 {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span>🕐 Due: {new Date(assignment.dueDate).toLocaleTimeString()}</span>
                </div>
                <button 
                  className="view-btn" 
                  onClick={() => handleViewAssignment(assignment)}
                  style={{ marginTop: '10px' }}
                >
                  {isSubmitted(assignment._id) ? '✓ View' : '📝 Submit'}
                </button>
              </div>
            ))
          )}
          <AssignmentDetailModal
            isOpen={showAssignmentModal}
            onClose={() => setShowAssignmentModal(false)}
            assignment={selectedAssignment}
            onSubmit={handleSubmitAssignment}
            isSubmitted={selectedAssignment ? isSubmitted(selectedAssignment._id) : false}
          />
        </div>
      )}

      {activeView === 'lectures' && (
        <div className="dashboard-content">
          <h2 className="section-title">Academic Planning</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 className="section-title" style={{ fontSize: '16px', marginBottom: '15px' }}>
              📊 Attendance Summary
            </h3>
            {Object.keys(courseAttendance).length === 0 ? (
              <div className="list-card">
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  No attendance records yet
                </div>
              </div>
            ) : (
              Object.entries(courseAttendance).map(([courseId, stats]) => {
                const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
                const isLowAttendance = percentage < 75;
                
                return (
                  <div key={courseId} className="list-card" style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <div className="list-item-title">{stats.courseName}</div>
                        <div className="list-item-meta">
                          <span>Total Classes: {stats.total}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold',
                          color: isLowAttendance ? '#f44336' : '#4CAF50'
                        }}>
                          {percentage}%
                        </div>
                        {isLowAttendance && (
                          <div style={{ fontSize: '11px', color: '#f44336' }}>⚠️ Low</div>
                        )}
                      </div>
                    </div>

                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: '#f0f0f0', 
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '10px'
                    }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: isLowAttendance ? '#f44336' : '#4CAF50',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-around',
                      fontSize: '13px',
                      paddingTop: '10px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '18px' }}>
                          {stats.present}
                        </div>
                        <div style={{ color: '#666' }}>Present</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#f44336', fontWeight: 'bold', fontSize: '18px' }}>
                          {stats.absent}
                        </div>
                        <div style={{ color: '#666' }}>Absent</div>
                      </div>
                      {stats.late > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ color: '#FF9800', fontWeight: 'bold', fontSize: '18px' }}>
                            {stats.late}
                          </div>
                          <div style={{ color: '#666' }}>Late</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <h3 className="section-title" style={{ fontSize: '16px', marginBottom: '15px' }}>
            📅 Upcoming Lectures
          </h3>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
            Total lectures: {lectures.length}
          </p>
          {lectures.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-title">Lectures are not scheduled yet</div>
              <div className="empty-description">
                Please verify the default year and group/semester in settings.
              </div>
            </div>
          ) : (
            lectures.map(lecture => (
              <div key={lecture._id} className="list-card">
                <div className="list-item-title">{lecture.title}</div>
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
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeView === 'fees' && (
        <div className="dashboard-content">
          <h2 className="section-title">Fee Dashboard</h2>
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
                  <div style={{ fontSize: '12px', color: '#666' }}>Pending Fees</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{totalFees - paidFees}/-</div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="section-title" style={{ marginTop: '20px' }}>Receipt</h3>
          {fees.map(fee => (
            <div key={fee._id} className="list-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Receipt Date</span>
                <span>{new Date(fee.dueDate).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Amount</span>
                <span>₹ {fee.amount}/-</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '600' }}>Status</span>
                <span style={{ 
                  color: fee.status === 'paid' ? '#4CAF50' : '#FF9800',
                  fontWeight: 'bold'
                }}>{fee.status.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="view-btn" style={{ flex: 1 }}>💳 Online</button>
                <button className="view-btn" style={{ flex: 1 }}>📥 Download</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'grades' && (
        <div className="dashboard-content">
          <h2 className="section-title">My Grades</h2>
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <div className="empty-title">No Grades Yet</div>
            <div className="empty-description">Your grades will appear here once published</div>
          </div>
        </div>
      )}

      {activeView === 'events' && (
        <div className="dashboard-content">
          <h2 className="section-title">College Events</h2>
          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <div className="empty-title">No Events</div>
              <div className="empty-description">No events scheduled at the moment</div>
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

      {activeView === 'attendance' && (
        <div className="dashboard-content">
          <h2 className="section-title">My Attendance</h2>
          {attendance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>
              <div className="empty-title">No Attendance Records</div>
              <div className="empty-description">Your attendance will appear here once marked by teachers</div>
            </div>
          ) : (
            <div>
              {attendance.map(att => (
                <div key={att._id} className="list-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="list-item-title">{att.course?.name || 'Unknown Course'}</div>
                      <div className="list-item-meta">
                        <span>📅 {new Date(att.date).toLocaleDateString()}</span>
                        <span>🕐 {new Date(att.date).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: att.status === 'present' ? '#E8F5E9' : 
                                   att.status === 'late' ? '#FFF3E0' : '#FFEBEE',
                        color: att.status === 'present' ? '#2E7D32' : 
                               att.status === 'late' ? '#E65100' : '#C62828'
                      }}>
                        {att.status === 'present' ? '✓ Present' : 
                         att.status === 'late' ? '⏰ Late' : '✗ Absent'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                {user.name.charAt(0)}
              </div>
              <h2>{user.name}</h2>
              <p style={{ color: '#666' }}>{user.email}</p>
              <span className="semester-badge">Student</span>
            </div>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong>Email:</strong> {user.email}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Role:</strong> {user.role}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>Student ID:</strong> STU{user.id.slice(-6)}
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

export default ModernStudentDashboard;
