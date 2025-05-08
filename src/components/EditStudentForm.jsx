import { useState, useEffect } from 'react';
import GoogleSheetsService from '../services/GoogleSheetsService';
import '../styles/StudentForms.css';
import PeacockFeatherBackground from './PeacockFeatherBackground';

function EditStudentForm({ student, onClose, onStudentUpdated }) {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    schoolName: '',
    class: '',
    mobileNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with student data
  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.id || '',
        studentName: student.name || '',
        schoolName: student.school || '',
        class: student.class || '',
        mobileNumber: student.mobileNumber || ''
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      if (!formData.studentId || !formData.studentName || !formData.schoolName || !formData.class) {
        throw new Error('Please fill in all required fields');
      }

      // Format data for Google Sheets
      const rowData = [
        formData.studentId,
        formData.studentName,
        formData.schoolName,
        formData.class,
        formData.mobileNumber
      ];

      // Update the student in the Google Sheet
      try {
        await GoogleSheetsService.updateStudentById(formData.studentId, rowData);

        setSuccess(true);

        // Notify parent component that a student was updated
        if (onStudentUpdated) {
          setTimeout(() => {
            onStudentUpdated();
          }, 1500);
        }
      } catch (updateError) {
        console.error('Error updating student:', updateError);

        // Check if it's an authentication error
        if (updateError.message && updateError.message.includes('Authentication error')) {
          setError('You need to sign in with your Google account to update students. Please sign in and try again.');
        } else if (updateError.message && updateError.message.includes('Permission denied')) {
          setError('Permission denied: Make sure your Google Sheet is shared with edit permissions.');
        } else {
          setError(updateError.message || 'Failed to update student. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err.message || 'Failed to update student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-modal">
      <div className="student-content">
        {/* Peacock Feather Background */}
        <PeacockFeatherBackground />

        <div className="student-header">
          <h2>Edit Student</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {success && (
          <div className="status-message success">
            Student updated successfully!
          </div>
        )}

        {error && (
          <div className="status-message error">
            {error}
            {error.includes('sign in') && (
              <div className="login-prompt">
                <p>Please make sure you're signed in with your Google account:</p>
                <button
                  className="login-button"
                  onClick={() => window.location.reload()}
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-group">
            <label htmlFor="studentId">Student ID *</label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={formData.studentId}
              readOnly
              className="readonly-input"
              title="ID cannot be changed"
            />
            <small className="form-hint">Student ID cannot be modified</small>
          </div>

          <div className="form-group">
            <label htmlFor="studentName">Student Name *</label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="schoolName">School Name *</label>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="Enter school name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="class">Class *</label>
            <input
              type="text"
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              placeholder="Enter class"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudentForm;
