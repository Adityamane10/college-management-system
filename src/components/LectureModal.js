import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../services/api';
import './LectureModal.css';

const LectureModal = ({ isOpen, onClose, onSubmit, teacherId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    scheduledAt: '',
    duration: '',
    location: '',
    status: 'scheduled'
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.course || !formData.scheduledAt) {
      setError('Please fill in all required fields');
      return;
    }

    onSubmit({ ...formData, teacher: teacherId });
    setFormData({
      title: '',
      description: '',
      course: '',
      scheduledAt: '',
      duration: '',
      location: '',
      status: 'scheduled'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Lecture</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Lecture Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter lecture title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter lecture description"
              rows="3"
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
            <label>Scheduled Date & Time *</label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 60"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Room 101"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Lecture
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureModal;
