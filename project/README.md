# Fitness Tracker

A fully responsive fitness tracking application with a "Classic Color Grading" live theme.

## Features
- **User Authentication**: Register and Login (with Google Auth placeholder).
- **Dashboard**: View daily stats (Calories, Weight, Active Minutes).
- **Tracker**: Log Workouts and Meals.
- **Visuals**: Interactive charts using Chart.js.
- **Theme**: Dark mode, neon accents, responsive design.

## Setup Instructions

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    The `.env` file is already created with default values:
    ```
    mongoURI=mongodb://localhost:27017/fitness-tracker
    PORT=5000
    JWT_SECRET=your_secret
    ```
    *Note: Ensure you have MongoDB running locally.*

3.  **Run the Server**:
    ```bash
    npm start
    ```
    Or manually:
    ```bash
    node server.js
    ```

4.  **Access the App**:
    Open your browser and go to: [http://localhost:5000](http://localhost:5000)

## API Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/dashboard` - Fetch user stats
- `POST /api/workouts` - Log workout
- `POST /api/meals` - Log meal

## Google Auth Note
To make Google Sign-In work, replacing `YOUR_GOOGLE_CLIENT_ID` in `public/index.html` with a valid Client ID from Google Cloud Console is required.
