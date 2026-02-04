import React, { useState } from 'react';
import './LectureModal.css';

const EventModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: ''
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

    if (!formData.title || !formData.description || !formData.eventDate) {
      setError('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      location: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Event</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Tech Fest 2025"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Event description"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Event Date *</label>
            <input
              type="datetime-local"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Main Auditorium"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
