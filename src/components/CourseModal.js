import React, { useState } from 'react';
import './LectureModal.css';

const CourseModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: '',
    semester: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.code) {
      setError('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
    setFormData({
      name: '',
      code: '',
      description: '',
      credits: '',
      semester: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Course</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Data Structures"
              required
            />
          </div>

          <div className="form-group">
            <label>Course Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., CS101"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Course description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Credits</label>
            <input
              type="number"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              placeholder="e.g., 4"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Semester</label>
            <input
              type="text"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              placeholder="e.g., SEM 1"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
