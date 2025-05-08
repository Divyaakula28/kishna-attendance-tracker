import { gapi } from 'gapi-script';

// This service handles Google OAuth2 authentication
class AuthService {
  constructor() {
    // Replace with your actual client ID from Google Cloud Console
    this.CLIENT_ID = '192289058482-mff9g02nleh6tnhvu0k43de96mvpcfbc.apps.googleusercontent.com';
    // API key (still needed for some operations)
    this.API_KEY = 'AIzaSyAAxHsGKMs7L4QHAPmMAa6kUgP0zPngCxg';

    // The scopes we need for Google Sheets
    this.SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

    // Discovery docs for the API
    this.DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

    // Whether the user is signed in
    this.isSignedIn = false;

    // The current user
    this.currentUser = null;

    // The current access token
    this.accessToken = null;

    // Callbacks for sign-in state changes
    this.signInChangeCallbacks = [];
  }

  // Initialize the Google API client
  async init() {
    return new Promise((resolve, reject) => {
      console.log('Initializing Google API client...');

      // Load the auth2 library and sheets API
      gapi.load('client:auth2', async () => {
        try {
          console.log('Loaded client:auth2, initializing client...');

          await gapi.client.init({
            apiKey: this.API_KEY,
            clientId: this.CLIENT_ID,
            discoveryDocs: this.DISCOVERY_DOCS,
            scope: this.SCOPES,
          });

          console.log('Client initialized, loading sheets API...');

          // Explicitly load the sheets API
          await gapi.client.load('sheets', 'v4');

          console.log('Sheets API loaded successfully');
          console.log('Available APIs:', gapi.client);

          if (!gapi.auth2) {
            console.error('gapi.auth2 is not available');
            reject(new Error('gapi.auth2 is not available'));
            return;
          }

          // Listen for sign-in state changes
          gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSignInStatus.bind(this));

          // Handle the initial sign-in state
          this.updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

          console.log('Auth initialization complete');
          resolve();
        } catch (error) {
          console.error('Error initializing Google API client', error);
          reject(error);
        }
      });
    });
  }

  // Update sign-in status
  updateSignInStatus(isSignedIn) {
    this.isSignedIn = isSignedIn;

    if (isSignedIn) {
      this.currentUser = gapi.auth2.getAuthInstance().currentUser.get();
      this.accessToken = this.currentUser.getAuthResponse().access_token;
      console.log('User is signed in, access token:', this.accessToken);

      // Log more details for debugging
      console.log('User profile:', this.getUserProfile());
      console.log('Auth response:', this.currentUser.getAuthResponse());
      console.log('Scopes granted:', this.currentUser.getGrantedScopes());
    } else {
      this.currentUser = null;
      this.accessToken = null;
      console.log('User is not signed in');
    }

    // Notify all callbacks
    this.signInChangeCallbacks.forEach(callback => callback(isSignedIn));
  }

  // Sign in the user
  signIn() {
    return gapi.auth2.getAuthInstance().signIn();
  }

  // Sign out the user
  signOut() {
    return gapi.auth2.getAuthInstance().signOut();
  }

  // Check if the user is signed in
  isUserSignedIn() {
    return this.isSignedIn;
  }

  // Get the current access token
  getAccessToken() {
    return this.accessToken;
  }

  // Register a callback for sign-in state changes
  onSignInChanged(callback) {
    this.signInChangeCallbacks.push(callback);

    // Call the callback with the current state
    if (this.isSignedIn !== null) {
      callback(this.isSignedIn);
    }

    return () => {
      // Remove the callback when no longer needed
      this.signInChangeCallbacks = this.signInChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  // Get user profile information
  getUserProfile() {
    if (!this.isSignedIn || !this.currentUser) {
      return null;
    }

    const profile = this.currentUser.getBasicProfile();
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl(),
    };
  }
}

export default new AuthService();
