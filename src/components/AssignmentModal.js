import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../services/api';
import './LectureModal.css';

const AssignmentModal = ({ isOpen, onClose, onSubmit, teacherId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    maxMarks: '',
    file: null
  });
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    try {
      const res = await coursesAPI.getAll();
      setCourses(res.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.course || !formData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    onSubmit({ ...formData, createdBy: teacherId });
    setFormData({
      title: '',
      description: '',
      course: '',
      dueDate: '',
      maxMarks: '',
      file: null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Assignment</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Assignment Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Data Structures Assignment 1"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Assignment instructions and requirements"
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Course *</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Due Date & Time *</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Maximum Marks</label>
            <input
              type="number"
              name="maxMarks"
              value={formData.maxMarks}
              onChange={handleChange}
              placeholder="e.g., 100"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Upload Assignment File (Optional)</label>
            <input
              type="file"
              name="file"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            {formData.file && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Selected: {formData.file.name}
              </p>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentModal;
