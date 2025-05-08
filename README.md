# Google Sheets Attendance App

A React application that allows you to view and manage attendance data using Google Sheets as a backend.

## Features

- View data from Google Sheets
- Add new data to Google Sheets
- Responsive design
- Simple and intuitive interface

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up Google Sheets API:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Sheets API
   - Create API credentials (API Key)
   - Copy your API Key

4. Configure the application:
   - Open `src/services/GoogleSheetsService.js`
   - Add your Google API Key to the `API_KEY` field
   - Add your Google Spreadsheet ID to the `SPREADSHEET_ID` field

   The Spreadsheet ID is the part of your Google Sheets URL between `/d/` and `/edit`. For example, in the URL `https://docs.google.com/spreadsheets/d/1ABC123XYZ/edit`, the Spreadsheet ID is `1ABC123XYZ`.

5. Make sure your Google Sheet has appropriate permissions:
   - The sheet should be publicly accessible for reading (for the view functionality)
   - For the write functionality, you'll need to set up proper authentication (the current implementation is simplified)

## Running the Application

Start the development server:

```
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## Building for Production

To create a production build:

```
npm run build
```

The build files will be in the `dist` directory.

## Notes on Google Sheets API

This application uses a simplified approach to the Google Sheets API. In a production environment, you would want to:

1. Use environment variables for API keys
2. Implement proper OAuth2 authentication
3. Add more robust error handling
4. Consider using a backend service to proxy requests to Google Sheets API

## Technologies Used

- React
- Vite
- Axios
- Google Sheets API
