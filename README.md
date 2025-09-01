# Interactive Kiosk System - Developer Guide

This guide provides technical information for developers working on the Interactive Kiosk System. For user-facing setup instructions, please run the application and follow the on-screen setup wizard or navigate to the `Admin > System` section.

## Project Structure

- **`/` (Root)**: Contains the frontend application built with Vite, React, and TypeScript.
- **`/server`**: Contains a simple, self-contained Node.js Express server for data persistence.

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
- Run the server: `npm start`
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

For detailed, user-friendly instructions on connecting the frontend to this server, please use the guides within the application itself in `Admin > System`.
