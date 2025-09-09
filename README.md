# Interactive Kiosk System - Developer Guide

This guide provides technical information for developers working on the Interactive Kiosk System. For user-facing setup instructions, please run the application and follow the on-screen setup wizard or navigate to the `Admin > System` section.

## Project Structure

- **`/` (Root)**: Contains the frontend application built with Vite, React, and TypeScript.
- **`/server`**: Contains a simple, self-contained Node.js Express server for data persistence.

---

## Technical Overview

### The "No-Build" PWA Foundation

The most unique aspect of this application is its "build" process—or rather, its lack of one. Traditional React apps use tools like Webpack or Vite to bundle all the code into a few optimized JavaScript files. This app skips that step entirely, which makes the setup incredibly simple.

Here’s how it works:

-   **`index.html` as the Orchestrator:** This is the heart of the "build." It's responsible for loading everything directly.
    -   It pulls in libraries like React and Tailwind CSS from a Content Delivery Network (CDN).
    -   It uses a modern browser feature called an `<script type="importmap">`. This is the magic key. The import map acts like a directory for your browser. It tells the browser, "When you see `import React from 'react'`, go fetch it from this specific CDN URL." This is what replaces the job of a bundler.
    -   Finally, it loads your main application code with `<script type="module" src="/index.tsx">`. The `type="module"` tells the browser to treat this file as an ES Module, allowing it to use `import` and `export` statements just like a bundled app would.

-   **`manifest.json` for Installability:** This is a standard PWA file. It's a simple JSON that tells the browser the app's name, icons, theme color, and that it can be "installed" on a user's desktop or home screen. When a user installs it, the app runs in its own window, feeling more like a native application.

-   **`sw.js` (Service Worker) for Offline Capability:** This is the core of the PWA's offline power. A Service Worker is a special JavaScript file that the browser runs in the background, separate from the main web page.
    -   **Installation:** When you first visit the app, the service worker is installed. It pre-caches the essential files listed in `APP_SHELL_URLS` (like `index.html`).
    -   **Interception:** Once active, it acts like a proxy between your app and the network. When your app requests a file (e.g., an image or a script), the service worker intercepts that request.
    -   **Cache-First Strategy:** It first checks if it has a copy of the requested file in its cache. If it does, it serves it instantly from the cache without ever going to the network. This is why the app loads instantly on subsequent visits, even if you're offline. If the file isn't in the cache, it fetches it from the network, serves it to the app, and saves a copy in the cache for next time.

In summary, the "build" is just a set of instructions in `index.html` that modern browsers understand, combined with the PWA essentials (`manifest.json`, `sw.js`) to make it installable and offline-ready.

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