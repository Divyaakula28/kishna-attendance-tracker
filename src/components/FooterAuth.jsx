import { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import '../styles/FooterAuth.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

function FooterAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Initialize auth service
  useEffect(() => {
    // Check if user is already signed in
    const currentSignInState = AuthService.isUserSignedIn();
    console.log("Footer Auth - Current sign-in state:", currentSignInState);
    setIsSignedIn(currentSignInState);
    
    if (currentSignInState) {
      const profile = AuthService.getUserProfile();
      console.log("Footer Auth - User profile:", profile);
      setUserProfile(profile);
    }
    
    // Set up auth change listener
    const unsubscribe = AuthService.onSignInChanged((isAuthenticated) => {
      console.log("Footer Auth - Auth state changed:", isAuthenticated);
      setIsSignedIn(isAuthenticated);
      
      if (isAuthenticated) {
        const profile = AuthService.getUserProfile();
        console.log("Footer Auth - Updated user profile:", profile);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    });
    
    // Clean up the subscription
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Handle sign in
  const handleSignIn = async () => {
    try {
      await AuthService.signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="footer-auth">
      {isSignedIn && userProfile ? (
        <div className="footer-auth-signed-in">
          <span className="footer-email">
            <span className="krishna-icon">🪔</span> Signed in as: {userProfile.email}
          </span>
          <button className="footer-sign-out" onClick={handleSignOut}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        <button className="footer-sign-in" onClick={handleSignIn}>
          <FontAwesomeIcon icon={faSignInAlt} />
          <span>Sign In with Google</span>
        </button>
      )}
    </div>
  );
}

export default FooterAuth;
