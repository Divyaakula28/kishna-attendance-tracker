import { useState, useEffect } from 'react';
import GoogleSheetsService from '../services/GoogleSheetsService';
import PeacockFeatherBackground from './PeacockFeatherBackground';
import '../styles/StudentForms.css';

function AddStudentForm({ onClose, onStudentAdded }) {
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
  const [generatingId, setGeneratingId] = useState(true);

  // Generate student ID automatically when component mounts
  useEffect(() => {
    const generateStudentId = async () => {
      try {
        setGeneratingId(true);
        // Get the current data to determine the next ID
        const data = await GoogleSheetsService.getSheetData('Students', 'A1:A1000');

        // Find the highest ID
        let highestId = 0;
        if (data && data.length > 1) { // Skip header row
          data.slice(1).forEach(row => {
            if (row && row[0]) {
              const idValue = parseInt(row[0], 10);
              if (!isNaN(idValue) && idValue > highestId) {
                highestId = idValue;
              }
            }
          });
        }

        // Set the next ID (highest + 1)
        const nextId = highestId + 1;
        setFormData(prev => ({
          ...prev,
          studentId: nextId.toString()
        }));
      } catch (err) {
        console.error('Error generating student ID:', err);
        // Fallback to a timestamp-based ID if there's an error
        const fallbackId = Math.floor(Date.now() / 1000).toString();
        setFormData(prev => ({
          ...prev,
          studentId: fallbackId
        }));
      } finally {
        setGeneratingId(false);
      }
    };

    generateStudentId();
  }, []);

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
      if (generatingId) {
        throw new Error('Student ID is still being generated. Please wait.');
      }

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

      // Add the student to the Google Sheet
      try {
        await GoogleSheetsService.appendRow('Students', rowData);

        setSuccess(true);

        // Reset form after successful submission
        setFormData({
          studentId: '',
          studentName: '',
          schoolName: '',
          class: '',
          mobileNumber: ''
        });

        // Notify parent component that a student was added
        if (onStudentAdded) {
          setTimeout(() => {
            onStudentAdded();
          }, 1500);
        }
      } catch (appendError) {
        console.error('Error adding student:', appendError);

        // Check if it's an authentication error
        if (appendError.message && appendError.message.includes('Authentication error')) {
          setError('You need to sign in with your Google account to add students. Please sign in and try again.');
        } else if (appendError.message && appendError.message.includes('Permission denied')) {
          setError('Permission denied: Make sure your Google Sheet is shared with edit permissions.');
        } else {
          setError(appendError.message || 'Failed to add student. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err.message || 'Failed to add student. Please try again.');
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
          <h2>Add New Student</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {success && (
          <div className="status-message success">
            Student added successfully!
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
              value={generatingId ? "Generating ID..." : formData.studentId}
              readOnly
              className="readonly-input"
              title="ID is automatically generated"
            />
            {!generatingId && (
              <small className="form-hint">Auto-generated ID based on the last student record</small>
            )}
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
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentForm;
