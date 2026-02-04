import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentsAPI, gradesAPI, feesAPI, attendanceAPI, eventsAPI, lecturesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('lectures');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [events, setEvents] = useState([]);
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'assignments') {
        const [assignRes, subRes] = await Promise.all([
          assignmentsAPI.getAll(),
          assignmentsAPI.getStudentSubmissions(user.id)
        ]);
        setAssignments(assignRes.data);
        setSubmissions(subRes.data);
      } else if (activeTab === 'grades') {
        const res = await gradesAPI.getStudent(user.id);
        setGrades(res.data);
      } else if (activeTab === 'fees') {
        const res = await feesAPI.getStudent(user.id);
        setFees(res.data);
      } else if (activeTab === 'attendance') {
        const res = await attendanceAPI.getStudent(user.id);
        setAttendance(res.data);
      } else if (activeTab === 'events') {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
      } else if (activeTab === 'lectures') {
        const res = await lecturesAPI.getAll();
        setLectures(res.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const text = prompt('Enter your submission:');
    if (text) {
      await assignmentsAPI.submit({
        assignment: assignmentId,
        student: user.id,
        submissionText: text
      });
      alert('Assignment submitted!');
      loadData();
    }
  };

  const isSubmitted = (assignmentId) => {
    return submissions.some(sub => sub.assignment._id === assignmentId);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Student Panel</h2>
        <nav>
          <button onClick={() => setActiveTab('lectures')}>Lectures</button>
          <button onClick={() => setActiveTab('assignments')}>Assignments</button>
          <button onClick={() => setActiveTab('grades')}>Grades</button>
          <button onClick={() => setActiveTab('fees')}>Fees</button>
          <button onClick={() => setActiveTab('attendance')}>Attendance</button>
          <button onClick={() => setActiveTab('events')}>Events</button>
          <button onClick={() => setActiveTab('profile')}>Profile</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="content">
        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        
        {activeTab === 'lectures' && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Course</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lectures.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No lectures scheduled yet.
                  </td>
                </tr>
              ) : (
                lectures.map(lecture => (
                  <tr key={lecture._id}>
                    <td>{lecture.title}</td>
                    <td>{lecture.description || '-'}</td>
                    <td>{lecture.course?.name || 'N/A'}</td>
                    <td>{new Date(lecture.scheduledAt).toLocaleString()}</td>
                    <td>{lecture.duration ? `${lecture.duration} min` : '-'}</td>
                    <td>{lecture.location || '-'}</td>
                    <td><span className={`status-${lecture.status}`}>{lecture.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'assignments' && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment._id}>
                  <td>{assignment.title}</td>
                  <td>{assignment.course?.name}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>{isSubmitted(assignment._id) ? 'Submitted' : 'Pending'}</td>
                  <td>
                    {!isSubmitted(assignment._id) && (
                      <button onClick={() => handleSubmitAssignment(assignment._id)}>Submit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'grades' && (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Exam Type</th>
                <th>Marks</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(grade => (
                <tr key={grade._id}>
                  <td>{grade.course?.name}</td>
                  <td>{grade.examType}</td>
                  <td>{grade.marksObtained}/{grade.totalMarks}</td>
                  <td>{grade.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'fees' && (
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee._id}>
                  <td>{fee.description}</td>
                  <td>${fee.amount}</td>
                  <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className={fee.status}>{fee.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'attendance' && (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(att => (
                <tr key={att._id}>
                  <td>{att.course?.name}</td>
                  <td>{new Date(att.date).toLocaleDateString()}</td>
                  <td className={att.status}>{att.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'events' && (
          <div className="events-list">
            {events.map(event => (
              <div key={event._id} className="event-card">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile">
            <h2>{user.name}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
