import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lecturesAPI, attendanceAPI, assignmentsAPI, coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LectureModal from './LectureModal';
import './Dashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('lectures');
  const [lectures, setLectures] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showLectureModal, setShowLectureModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'lectures') {
        const res = await lecturesAPI.getAll();
        setLectures(res.data);
      } else if (activeTab === 'assignments') {
        const res = await assignmentsAPI.getAll();
        setAssignments(res.data);
      } else if (activeTab === 'courses') {
        const res = await coursesAPI.getAll();
        setCourses(res.data.filter(c => c.teacher?._id === user.id));
      }
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

  const handleMarkAttendance = async (courseId) => {
    const studentId = prompt('Student ID:');
    const status = prompt('Status (present/absent/late):');
    if (studentId && status) {
      await attendanceAPI.mark({
        student: studentId,
        course: courseId,
        date: new Date(),
        status,
        markedBy: user.id
      });
      alert('Attendance marked!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Teacher Panel</h2>
        <nav>
          <button onClick={() => setActiveTab('lectures')}>Lectures</button>
          <button onClick={() => setActiveTab('assignments')}>Assignments</button>
          <button onClick={() => setActiveTab('courses')}>My Courses</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div className="content">
        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        
        {activeTab === 'lectures' && (
          <div>
            <button onClick={() => setShowLectureModal(true)} className="add-btn">Add Lecture</button>
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
                      No lectures found. Click "Add Lecture" to create one.
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
            <LectureModal
              isOpen={showLectureModal}
              onClose={() => setShowLectureModal(false)}
              onSubmit={handleAddLecture}
              teacherId={user.id}
            />
          </div>
        )}

        {activeTab === 'assignments' && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Due Date</th>
                <th>Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment._id}>
                  <td>{assignment.title}</td>
                  <td>{assignment.course?.name}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>{assignment.maxMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'courses' && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id}>
                  <td>{course.name}</td>
                  <td>{course.code}</td>
                  <td>{course.students?.length || 0}</td>
                  <td>
                    <button onClick={() => handleMarkAttendance(course._id)}>Mark Attendance</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
