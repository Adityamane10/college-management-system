import React, { useState } from 'react';
import './LectureModal.css';

const AssignmentDetailModal = ({ isOpen, onClose, assignment, onSubmit, isSubmitted }) => {
  const [submissionText, setSubmissionText] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!submissionText && !file) {
      setError('Please provide submission text or upload a file');
      return;
    }

    onSubmit({
      submissionText,
      file
    });

    setSubmissionText('');
    setFile(null);
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{assignment.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>Course:</strong> {assignment.course?.name || 'N/A'}
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Description:</strong>
            <p style={{ color: '#666', marginTop: '5px' }}>{assignment.description}</p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleString()}
          </div>
          {assignment.maxMarks && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Maximum Marks:</strong> {assignment.maxMarks}
            </div>
          )}
          {assignment.fileUrl && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Assignment File:</strong>
              <div style={{ marginTop: '5px' }}>
                <a 
                  href={assignment.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#2196F3', 
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  📎 Download Assignment File
                </a>
              </div>
            </div>
          )}
        </div>

        {!isSubmitted && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Submission *</label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your answer or solution here..."
                rows="5"
              />
            </div>

            <div className="form-group">
              <label>Upload File (Optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.zip"
              />
              {file && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Selected: {file.name}
                </p>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Submit Assignment
              </button>
            </div>
          </form>
        )}

        {isSubmitted && (
          <div style={{ 
            background: '#E8F5E9', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'center',
            color: '#2E7D32'
          }}>
            ✓ Assignment Already Submitted
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetailModal;
