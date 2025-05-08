import { useState, useEffect, useRef } from 'react';
import AuthService from '../services/AuthService';
import '../styles/GoogleSignIn.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';

function GoogleSignIn() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize the auth service
  useEffect(() => {
    const initAuth = async () => {
      try {
        setError(null);
        await AuthService.init();
        setIsInitialized(true);

        // Register for sign-in state changes
        const unsubscribe = AuthService.onSignInChanged((signedIn) => {
          setIsSignedIn(signedIn);
          if (signedIn) {
            setUserProfile(AuthService.getUserProfile());
          } else {
            setUserProfile(null);
          }
        });

        // Clean up the subscription
        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth service:', error);
        setError('Failed to initialize Google authentication. Please check your internet connection and try again.');
        setIsInitialized(true); // Still mark as initialized so we can show the error
      }
    };

    initAuth();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // We're using CSS media queries to handle mobile view

  // Handle sign in button click
  const handleSignIn = async () => {
    try {
      setError(null);
      console.log('Attempting to sign in...');
      const result = await AuthService.signIn();
      console.log('Sign in result:', result);
    } catch (error) {
      console.error('Sign in error:', error);

      // Provide more detailed error message
      let errorMessage = 'Failed to sign in. ';

      if (error.error === 'popup_blocked_by_browser') {
        errorMessage += 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (error.error === 'access_denied') {
        errorMessage += 'You denied access to your Google account. Please grant the requested permissions to use this feature.';
      } else if (error.error === 'immediate_failed') {
        errorMessage += 'Automatic sign-in failed. Please try signing in manually.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check the console for more details and try again.';
      }

      setError(errorMessage);
    }
  };

  // Handle sign out button click
  const handleSignOut = async () => {
    try {
      setError(null);
      await AuthService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return <div className="google-auth-loading">Initializing Google authentication...</div>;
  }

  // Show error if initialization failed
  if (error) {
    return (
      <div className="google-auth-error">
        <p>{error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Render hamburger menu for mobile
  const renderHamburgerMenu = () => {
    return (
      <div className="hamburger-menu" onClick={toggleDropdown} ref={dropdownRef}>
        <FontAwesomeIcon icon={faBars} className="hamburger-icon" />

        {dropdownOpen && (
          <div className="hamburger-dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="close-dropdown" onClick={toggleDropdown}>×</div>

            {isSignedIn && userProfile ? (
              <>
                <div className="dropdown-user-info">
                  <p className="dropdown-user-email">
                    <FontAwesomeIcon icon={faEnvelope} className="email-icon" />
                    <span className="email-text">{userProfile.email}</span>
                  </p>
                </div>
                <div className="dropdown-actions">
                  <button
                    onClick={handleSignOut}
                    className="dropdown-sign-out"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="signout-icon" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="dropdown-actions">
                <button
                  onClick={handleSignIn}
                  className="dropdown-sign-in"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Show signed in state for desktop
  const renderDesktopSignedIn = () => {
    return (
      <div className="google-auth-signed-in" ref={dropdownRef}>
        <div
          className="profile-circle"
          onClick={toggleDropdown}
          title={userProfile.name}
        >
          {userProfile.imageUrl ? (
            <img
              src={userProfile.imageUrl}
              alt={userProfile.name}
              className="profile-image-circle"
            />
          ) : (
            <div className="profile-initial">
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>

        {dropdownOpen && (
          <div className="profile-dropdown">
            <div className="dropdown-user-info">
              <p className="dropdown-user-email">
                <FontAwesomeIcon icon={faEnvelope} className="email-icon" />
                {userProfile.email}
              </p>
            </div>
            <div className="dropdown-actions">
              <button onClick={handleSignOut} className="dropdown-sign-out">
                <FontAwesomeIcon icon={faSignOutAlt} className="signout-icon" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show sign in button for desktop
  const renderDesktopSignedOut = () => {
    return (
      <div className="google-auth-signed-out">
        <p>Sign in with your Google account to enable write access to Google Sheets</p>
        <button onClick={handleSignIn} className="sign-in-button">
          Sign in with Google
        </button>
        <div className="auth-details" style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>
          <p>Is Initialized: {isInitialized ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  };

  // Only render desktop version - mobile is handled by MobileMenu component
  return (
    <>
      {/* Desktop version */}
      {isSignedIn && userProfile ? renderDesktopSignedIn() : renderDesktopSignedOut()}
    </>
  );
}

export default GoogleSignIn;
