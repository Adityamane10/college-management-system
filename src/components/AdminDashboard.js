import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, usersAPI, feesAPI, eventsAPI, attendanceAPI, lecturesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [fees, setFees] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'courses') {
        const res = await coursesAPI.getAll();
        setCourses(res.data);
      } else if (activeTab === 'students') {
        const res = await usersAPI.getAll('student');
        setStudents(res.data);
      } else if (activeTab === 'teachers') {
        const res = await usersAPI.getAll('teacher');
        setTeachers(res.data);
      } else if (activeTab === 'fees') {
        const res = await feesAPI.getAll();
        setFees(res.data);
      } else if (activeTab === 'events') {
        const res = await eventsAPI.getAll();
        setEvents(res.data);
      } else if (activeTab === 'attendance') {
        const res = await attendanceAPI.getAll();
        setAttendance(res.data);
      } else if (activeTab === 'lectures') {
        const res = await lecturesAPI.getAll();
        setLectures(res.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddCourse = async () => {
    const name = prompt('Course Name:');
    const code = prompt('Course Code:');
    if (name && code) {
      await coursesAPI.create({ name, code });
      loadData();
    }
  };

  const handleAddEvent = async () => {
    const title = prompt('Event Title:');
    const description = prompt('Description:');
    const eventDate = prompt('Date (YYYY-MM-DD):');
    if (title && description && eventDate) {
      await eventsAPI.create({ title, description, eventDate });
      loadData();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <button onClick={() => setActiveTab('courses')}>Courses</button>
          <button onClick={() => setActiveTab('lectures')}>Lectures</button>
          <button onClick={() => setActiveTab('students')}>Students</button>
          <button onClick={() => setActiveTab('teachers')}>Teachers</button>
          <button onClick={() => setActiveTab('fees')}>Fees</button>
          <button onClick={() => setActiveTab('events')}>Events</button>
          <button onClick={() => setActiveTab('attendance')}>Attendance</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="content">
        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        
        {activeTab === 'courses' && (
          <div>
            <button onClick={handleAddCourse} className="add-btn">Add Course</button>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td>{course.name}</td>
                    <td>{course.code}</td>
                    <td>{course.teacher?.name || 'Not Assigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'lectures' && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Course</th>
                <th>Teacher</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lectures.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No lectures found.
                  </td>
                </tr>
              ) : (
                lectures.map(lecture => (
                  <tr key={lecture._id}>
                    <td>{lecture.title}</td>
                    <td>{lecture.description || '-'}</td>
                    <td>{lecture.course?.name || 'N/A'}</td>
                    <td>{lecture.teacher?.name || 'N/A'}</td>
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

        {activeTab === 'students' && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'teachers' && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(teacher => (
                <tr key={teacher._id}>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'fees' && (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee._id}>
                  <td>{fee.student?.name}</td>
                  <td>${fee.amount}</td>
                  <td>{fee.status}</td>
                  <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'events' && (
          <div>
            <button onClick={handleAddEvent} className="add-btn">Add Event</button>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{event.description}</td>
                    <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'attendance' && (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(att => (
                <tr key={att._id}>
                  <td>{att.student?.name}</td>
                  <td>{att.course?.name}</td>
                  <td>{new Date(att.date).toLocaleDateString()}</td>
                  <td>{att.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
