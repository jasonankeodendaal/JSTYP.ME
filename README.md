
# Interactive Kiosk System - Full Setup Guide (Updated & More Reliable)

Welcome to your Interactive Kiosk System. This guide provides the definitive, step-by-step instructions for deploying your kiosk application to Vercel for global access, while using your main PC as a secure, persistent storage server.

## Conceptual Overview: How It Works

This setup has three parts that work together:

1.  **The Frontend (Your App on Vercel):** Your interactive kiosk application will be hosted on Vercel's global network. This makes it fast, reliable, and accessible from any device (like PCs or tablets) with an internet connection.

2.  **The Backend (Your PC Server):** A small, private server program runs continuously on your main PC. Its only job is to read and write all your data (products, settings, etc.) to a file named `data.json` located in the `server` folder. It is the single source of truth for all your kiosks.

3.  **The Connection (Cloudflare Tunnel):** This is the secure bridge that connects the two. Your Vercel app is public, but your PC server is private. Cloudflare Tunnel creates a free, encrypted, and **persistent** connection between them, so they can sync data without you needing to configure complex network settings.

---

## Part 1: Configure Your Central Server (On Your Main PC)

This is the most critical part. You will turn your main computer into the central hub for all your data. We will use **PM2**, a professional tool, to ensure your server and the connection tunnel run reliably 24/7 and restart automatically.

**Step 1.1: Install Prerequisites (One-time setup)**

1.  **Install Node.js:** Go to [**nodejs.org**](https://nodejs.org/), download the **"LTS"** installer, and run it, accepting all default options.
2.  **Install PM2:** PM2 is a process manager that will run your services in the background and auto-restart them. Open a new **PowerShell** or **Terminal** and run:
    ```bash
    npm install -g pm2
    ```
3.  **Install Cloudflare Tunnel:** Follow the official guide to install the `cloudflared` tool for your operating system:
    *   **[Cloudflare Tunnel Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)**
    *   **Tip for Windows:** After downloading `cloudflared.exe`, it's easiest to place it directly inside your project's `server` folder.

**Step 1.2: Configure the Server**

1.  **Open a Terminal in the Server Folder:**
    *   Navigate into the `server` folder of your project.
    *   **On Windows:** Hold `Shift` + Right-click inside the `server` folder and choose **"Open PowerShell window here"**.
2.  **Install Server Dependencies:** In your terminal, run this command once:
    ```bash
    npm install
    ```
3.  **CRITICAL - Configure Your `.env` File:**
    *   The server will not start without this file. In the `server` folder, find the file named **`.env.example`**.
    *   Rename this file to exactly **`.env`**.
    *   Open the new `.env` file with a text editor (like Notepad).
    *   Replace `your-super-secret-key-here` with a private password of your own. The line should look like this: `API_KEY=MySecurePassword123`
    *   Save and close the file.

**Step 1.3: Start Everything with PM2 (The Reliable Way)**

1.  In your terminal (still inside the `server` folder), first clear out any old failed attempts:
    ```bash
    pm2 delete all
    ```
2.  Now, start both the server and the tunnel with one simple command. I've updated your `ecosystem.config.js` file to use the new, reliable method.
    ```bash
    pm2 start
    ```
3.  Check the status. Both `kiosk-api` and `kiosk-tunnel` should now show as `online`.
    ```bash
    pm2 list
    ```

**Step 1.4: Get Your Persistent Public URL**

1.  Check the logs for your newly running tunnel.
    ```bash
    pm2 logs kiosk-tunnel
    ```
2.  After a few moments, you will now see the box you were looking for, containing your public URL like: **`https://random-words-and-letters.trycloudflare.com`**.
3.  **This is your public server address.** It will be stable as long as PM2 is running. Copy it and save it somewhere safe for Part 3.
4.  (Press `Ctrl + C` to exit the log view).

**Step 1.5: Make PM2 Auto-Start on Boot**
This crucial step makes your setup resilient to computer restarts.

1.  Generate the startup script.
    ```bash
    pm2 startup
    ```
2.  **Execute the output command.** PM2 will display a command. You must **copy that entire command, paste it back into the same terminal window,** and press Enter.
3.  Save your process list so PM2 remembers what to start.
    ```bash
    pm2 save
    ```
Your server is now running 24/7. You can close the terminal window.

---

## Part 2: Deploy the Kiosk App to Vercel

*(This section is unchanged)*

1.  **Push your Project to GitHub:**
    *   Create a free account at [GitHub.com](https://github.com/).
    *   Create a new, empty repository.
    *   Follow the instructions on GitHub to upload your entire project folder to this new repository.
2.  **Import to Vercel:**
    *   Create a free account at [Vercel.com](https://vercel.com/).
    *   On your Vercel dashboard, click "Add New..." and select "Project".
    *   Choose your GitHub account and import the repository you just created.
3.  **Configure Your Vercel Project (Critical Step):**
    *   Vercel will automatically detect that you have a Vite project. The default settings are correct.
    *   Expand the **"Environment Variables"** section. You must add your Google Gemini API Key here for AI features to work on the live site.
        *   Name: `API_KEY`
        *   Value: Paste your actual **Google Gemini API Key** here.
    *   Click "Add".
4.  **Deploy:**
    *   Click the "Deploy" button.
    *   After a minute, Vercel will provide you with a public URL (e.g., `your-kiosk-app.vercel.app`). This is the URL you will use on all your kiosk devices.

---

## Part 3: Connect Vercel to Your PC Server

*(This section is unchanged)*

You must repeat these steps on **every single device** you want to sync.

1.  **Open Your Live App:** Go to the Vercel URL you just got.
2.  **Log In as Admin:** Click the "Admin Login" link in the footer (default PIN: `1723`).
3.  **Navigate to API Settings:** In the admin dashboard, click the **"More"** button (the up-arrow) in the floating footer, then select **"System"**, and then select **"Settings"**. Find the **"API Integrations"** section.
4.  In **"Custom API URL"**, paste your public Cloudflare URL and **add `/data`** to the end (e.g., `https://...com/data`).
5.  In **"Custom API Auth Key"**, enter the secret `API_KEY` from your server's `.env` file.
6.  Click **Save Changes**.
7.  **Connect Provider:** In the **"System"** section, select **"Storage"**. Click the **"Connect"** button on the "Custom API Sync" card.
8.  **Perform Initial Sync:** A new **"Cloud Sync"** tab will appear in the "Storage" section.
    *   **On your main admin PC:** Click **"Push to Cloud"**. This uploads your local data to the server for the first time.
    *   **On all other devices:** Click **"Pull from Cloud"**. This downloads the master data from your server.
9.  **Enable Auto-Sync:** On **every device**, go to `Settings > Kiosk Mode` and turn on **"Enable Auto-Sync"**.

Your multi-device kiosk system is now fully configured and running reliably.
