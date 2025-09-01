# Interactive Kiosk System - Developer Guide

This guide provides technical information for developers working on the Interactive Kiosk System. For user-facing setup instructions, please run the application and follow the on-screen setup wizard or navigate to the `Admin > System` section.

## Project Structure

- **`/` (Root)**: Contains the frontend application built with Vite, React, and TypeScript.
  - `src/`: Source code for the React application.
  - `public/`: Static assets.
- **`/server`**: Contains a simple, self-contained Node.js Express server for data persistence.
  - `server.js`: The main server file.
  - `data.json`: The local JSON file used as a database.
  - `uploads/`: Directory where all media files are stored.
  - `ecosystem.config.js`: Configuration for the PM2 process manager.
  - `.env.example`: Template for environment variables.

---

## Getting Started (Development)

### 1. Frontend Setup
- Navigate to the project's root directory.
- Install dependencies: `npm install`
- Run the development server: `npm run dev`

### 2. Backend Server Setup
- Navigate to the `/server` directory: `cd server`
- Install dependencies: `npm install`
- **Crucially**, rename `.env.example` to `.env` and set a secure `API_KEY`.
- Run the server: `npm start` or `node server.js`
- The server will be available at `http://localhost:3001`.

---

## Production Deployment & Syncing

The recommended production setup uses a main PC as a central server and deploys the frontend to a hosting service like Vercel. Kiosk devices (PCs, Android tablets) then connect to the central server.

### Server Deployment (Main PC)

The server is designed to be run persistently using **PM2**, a process manager for Node.js. This ensures it runs 24/7 and restarts automatically.

1.  **Install PM2 Globally**:
    ```bash
    npm install -g pm2
    ```
2.  **Start Services with PM2**:
    In the `/server` directory, run:
    ```bash
    pm2 start
    ```
    This command uses `ecosystem.config.js` to start both the API server (`kiosk-api`) and a secure Cloudflare Tunnel (`kiosk-tunnel`).

3.  **Enable Automatic Startup**:
    To ensure PM2 starts on boot, run `pm2 startup` and execute the command it provides. Then, save the process list with `pm2 save`.

For detailed, user-friendly instructions on connecting the frontend to this server, please use the guides within the application itself.

### Frontend Deployment (Vercel)

1.  Push your project to a GitHub repository.
2.  Import the project into Vercel.
3.  **Add Environment Variable**:
    -   Name: `VITE_GEMINI_API_KEY`
    -   Value: Your Google Gemini API Key.
    *(Note: The variable must be prefixed with `VITE_` for Vite to expose it to the frontend code.)*
4.  Deploy.

---

## Building a Native Android App (APK)

This project uses Capacitor to bundle the web app into a native Android application.

### One-Time Setup
1.  **Install Capacitor CLI**:
    ```bash
    npm install @capacitor/cli
    ```
2.  **Generate a Keystore**: You need a signing key to create a release build. Follow the official Android guide to generate a `keystore.jks` file.

### Build Process
1.  **Build the Web App**:
    ```bash
    npm run build
    ```
2.  **Sync with Capacitor**:
    ```bash
    npx cap sync android
    ```
3.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
4.  **Build the Signed APK**:
    In Android Studio, go to `Build > Generate Signed Bundle / APK...` and follow the prompts, using the keystore you generated.

An automated APK build process using GitHub Actions is also included. See the workflow file for details on required repository secrets.
