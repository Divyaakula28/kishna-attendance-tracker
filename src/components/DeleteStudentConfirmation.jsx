import { useState } from 'react';
import GoogleSheetsService from '../services/GoogleSheetsService';
import '../styles/StudentForms.css';
import PeacockFeatherBackground from './PeacockFeatherBackground';

function DeleteStudentConfirmation({ student, onClose, onStudentDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Delete the student from the Google Sheet
      await GoogleSheetsService.deleteStudentById(student.id);

      setSuccess(true);

      // Notify parent component that a student was deleted
      if (onStudentDeleted) {
        setTimeout(() => {
          onStudentDeleted();
        }, 1500);
      }
    } catch (deleteError) {
      console.error('Error deleting student:', deleteError);

      // Check if it's an authentication error
      if (deleteError.message && deleteError.message.includes('Authentication error')) {
        setError('You need to sign in with your Google account to delete students. Please sign in and try again.');
      } else if (deleteError.message && deleteError.message.includes('Permission denied')) {
        setError('Permission denied: Make sure your Google Sheet is shared with edit permissions.');
      } else {
        setError(deleteError.message || 'Failed to delete student. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-modal">
      <div className="student-content delete-confirmation">
        {/* Peacock Feather Background */}
        <PeacockFeatherBackground />

        <div className="student-header">
          <h2>Delete Student</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {success && (
          <div className="status-message success">
            Student deleted successfully!
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

        {!success && (
          <div className="confirmation-content">
            <p className="confirmation-message">
              Are you sure you want to delete the following student?
            </p>

            <div className="student-details">
              <p><strong>ID:</strong> {student.id}</p>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Class:</strong> {student.class}</p>
              <p><strong>School:</strong> {student.school}</p>
            </div>

            <p className="warning-message">
              This action cannot be undone.
            </p>

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
                type="button"
                className="delete-button"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeleteStudentConfirmation;
