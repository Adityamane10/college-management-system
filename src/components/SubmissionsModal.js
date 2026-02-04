import React from 'react';
import './LectureModal.css';

const SubmissionsModal = ({ isOpen, onClose, assignment, submissions }) => {
  if (!isOpen || !assignment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>Submissions: {assignment.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#666' }}>
            Total Submissions: <strong>{submissions.length}</strong>
          </p>
        </div>

        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📝</div>
            <p>No submissions yet</p>
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {submissions.map((submission, index) => (
              <div 
                key={submission._id} 
                style={{ 
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  borderLeft: '3px solid #2196F3'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '16px' }}>
                      {submission.student?.name || 'Unknown Student'}
                    </strong>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                      ID: STU{submission.student?._id?.slice(-6) || 'N/A'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                    </div>
                    {submission.isUploaded && (
                      <span style={{ 
                        background: '#4CAF50',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        marginTop: '5px',
                        display: 'inline-block'
                      }}>
                        ✓ Uploaded
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px' }}>Submission:</strong>
                  <p style={{ 
                    color: '#333', 
                    marginTop: '5px',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {submission.submissionText || 'No text submission'}
                  </p>
                </div>

                {submission.fileUrl && (
                  <div style={{ marginBottom: '10px' }}>
                    <a 
                      href={submission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#2196F3', 
                        textDecoration: 'none',
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      📎 Download Submission File
                    </a>
                  </div>
                )}

                {submission.marksObtained !== undefined && (
                  <div style={{ 
                    background: 'white',
                    padding: '8px',
                    borderRadius: '5px',
                    marginTop: '10px'
                  }}>
                    <strong>Marks:</strong> {submission.marksObtained} / {assignment.maxMarks || 'N/A'}
                    {submission.feedback && (
                      <div style={{ marginTop: '5px', fontSize: '13px', color: '#666' }}>
                        <strong>Feedback:</strong> {submission.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsModal;
