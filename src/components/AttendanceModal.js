import React, { useState, useEffect } from 'react';
import { lecturesAPI, coursesAPI, attendanceAPI } from '../services/api';
import './LectureModal.css';

const AttendanceModal = ({ isOpen, onClose, onSubmit, teacherId }) => {
  const [selectedLecture, setSelectedLecture] = useState('');
  const [lectures, setLectures] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLectures();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedLecture) {
      loadStudents();
    }
  }, [selectedLecture]);

  const loadLectures = async () => {
    try {
      const res = await lecturesAPI.getAll();
      setLectures(res.data);
    } catch (error) {
      console.error('Error loading lectures:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const lecture = lectures.find(l => l._id === selectedLecture);
      console.log('Selected lecture:', lecture);
      
      if (lecture && lecture.course) {
        const courseId = lecture.course._id || lecture.course;
        console.log('Fetching course with ID:', courseId);
        
        const courseRes = await coursesAPI.getOne(courseId);
        console.log('Course response:', courseRes.data);
        
        if (courseRes.data) {
          const enrolledStudents = courseRes.data.students || [];
          console.log('Enrolled students:', enrolledStudents);
          
          setStudents(enrolledStudents);
          
          // Initialize attendance data
          const initialData = {};
          enrolledStudents.forEach(student => {
            initialData[student._id] = 'present';
          });
          setAttendanceData(initialData);
          
          if (enrolledStudents.length === 0) {
            setError('No students enrolled in this course. Please add students to the course first.');
          } else {
            setError('');
          }
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setError('Failed to load students. Please try again.');
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedLecture) {
      setError('Please select a lecture');
      return;
    }

    if (students.length === 0) {
      setError('No students enrolled in this course');
      return;
    }

    setLoading(true);
    try {
      const lecture = lectures.find(l => l._id === selectedLecture);
      const promises = students.map(student => 
        attendanceAPI.mark({
          student: student._id,
          lecture: selectedLecture,
          course: lecture.course._id || lecture.course,
          date: new Date(lecture.scheduledAt),
          status: attendanceData[student._id] || 'present',
          markedBy: teacherId
        })
      );

      await Promise.all(promises);
      alert('Attendance marked successfully!');
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>Mark Attendance</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Lecture *</label>
            <select
              value={selectedLecture}
              onChange={(e) => setSelectedLecture(e.target.value)}
              required
            >
              <option value="">Choose a lecture</option>
              {lectures.map(lecture => (
                <option key={lecture._id} value={lecture._id}>
                  {lecture.title} - {lecture.course?.name} ({new Date(lecture.scheduledAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {selectedLecture && students.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>
                Students ({students.length})
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {students.map((student, index) => (
                  <div 
                    key={student._id}
                    style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong>{index + 1}. {student.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {student.email}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`attendance-${student._id}`}
                          value="present"
                          checked={attendanceData[student._id] === 'present'}
                          onChange={() => handleAttendanceChange(student._id, 'present')}
                        />
                        <span style={{ color: '#4CAF50', fontSize: '14px' }}>Present</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`attendance-${student._id}`}
                          value="absent"
                          checked={attendanceData[student._id] === 'absent'}
                          onChange={() => handleAttendanceChange(student._id, 'absent')}
                        />
                        <span style={{ color: '#f44336', fontSize: '14px' }}>Absent</span>
                      </label>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedLecture && students.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              No students enrolled in this course
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading || !selectedLecture || students.length === 0}>
              {loading ? 'Marking...' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;
