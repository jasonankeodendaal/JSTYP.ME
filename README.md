# Interactive Kiosk System - Setup Guide

Welcome to your Interactive Kiosk System. This guide provides the definitive, step-by-step instructions for deploying your kiosk application for global access, while using your main PC as a secure, persistent storage server.

## Conceptual Overview: How It Works

This setup has three parts that work together:

1.  **The Frontend (Your App):** Your interactive kiosk application, which can be deployed to a service like Vercel for global access or built into a native Android app. This is what your users or customers will see.

2.  **The Backend (Your PC Server):** A small, private server program that runs continuously on your main PC. Its only job is to read and write all your data (products, settings, etc.) to files located in the `server/` folder. It is the single source of truth for all your kiosks.

3.  **The Connection (Cloudflare Tunnel):** This is the secure bridge that connects the two. Your app can be public, but your PC server is private. Cloudflare Tunnel creates a free, encrypted, and **persistent** connection between them, so they can sync data without you needing to configure complex network settings like port forwarding.

---

## Part 1: Configure Your Central Server (On Your Main PC)

This is the most critical part. You will turn your main computer into the central hub for all your data. We will use **PM2**, a professional tool, to ensure your server and the connection tunnel run reliably 24/7 and restart automatically.

### Step 1: Install Node.js
If you don't have it, you'll need to install Node.js.
1. Go to the [Node.js official site](https://nodejs.org/).
2. Download the **LTS** version (recommended for most users).
3. Run the installer and accept all default settings. Make sure “Add to PATH” is checked.
4. Verify the installation by opening a new terminal (PowerShell on Windows, or Terminal on Mac/Linux) and running:
   ```bash
   node -v
   npm -v
   ```
   You should see version numbers for both commands.

### Step 2: Install PM2
PM2 is a process manager that will run your services in the background and auto-restart them if they crash or the computer reboots.
1. Open a new terminal.
2. Run this command to install PM2 globally on your system:
   ```bash
   npm install -g pm2
   ```

### Step 3: Install Cloudflare Tunnel
This tool creates the secure connection to your server.
1. Follow the official guide to install the `cloudflared` tool for your operating system:
   - **[Cloudflare Tunnel Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)**
2. **Tip for Windows:** After downloading `cloudflared.exe`, it's easiest to place it directly inside your project's `server` folder. For Mac/Linux, ensure it's in your system's PATH.

### Step 4: Configure the Server Project
1. **Open a Terminal in the `server` Folder:**
   - Navigate into the `server` folder of your project.
   - **On Windows:** Hold `Shift` + Right-click inside the `server` folder and choose **"Open PowerShell window here"**.
   - **On Mac/Linux:** `cd` into the `server` directory.
2. **Install Server Dependencies:** In your terminal, run this command once:
   ```bash
   npm install
   ```
3. **CRITICAL - Configure Your `.env` File:**
   - The server will not start without this file. In the `server` folder, find the file named **`.env.example`**.
   - Rename this file to exactly **`.env`**.
   - Open the new `.env` file with a text editor (like Notepad or VS Code).
   - Replace `your-super-secret-key-here` with a private password of your own. The line should look like this: `API_KEY=MySecurePassword123`
   - Save and close the file.

### Step 5: Run the Server and Tunnel
The project is configured to start both the API server and the Cloudflare tunnel with a single command using PM2.
1. In your terminal (still inside the `server` folder), first clear out any old PM2 processes to ensure a clean start:
   ```bash
   pm2 delete all
   ```
2. Now, start both services using the project's configuration file:
   ```bash
   pm2 start
   ```
3. Check the status. Both `kiosk-api` and `kiosk-tunnel` should now show as `online`.
   ```bash
   pm2 list
   ```

### Step 6: Get Your Public URL
1. Check the logs for your newly running tunnel to find your public address.
   ```bash
   pm2 logs kiosk-tunnel
   ```
2. After a few moments, you will see a box in the logs containing your public URL, like: **`https://random-words-and-letters.trycloudflare.com`**.
3. **This is your public server address.** It will be stable as long as PM2 is running. Copy it and save it somewhere safe for Part 3.
4. Press `Ctrl + C` to exit the log view.

### Step 7: Keep It Always Running
This crucial step makes your setup resilient to computer restarts.
1. Generate the startup script.
   ```bash
   pm2 startup
   ```
2. **Execute the output command.** PM2 will display a command. You must **copy that entire command, paste it back into the same terminal window,** and press Enter.
3. Save your process list so PM2 remembers what to start on boot.
   ```bash
   pm2 save
   ```
Your server is now running 24/7. You can close the terminal window.

---

## Part 2: Deploy the Kiosk App to Vercel

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

---

## Automated APK Builds with GitHub Actions

This project includes a workflow to automatically build a signed, release-ready Android APK every time you push a change to your `main` branch on GitHub.

### One-Time Setup: Keystore & Secrets

To sign your app, you must generate a private key and provide it securely to GitHub. **This is a one-time process.**

**1. Generate a Keystore File**

You need the Java Development Kit (JDK) installed for this step.

*   Open a terminal or command prompt.
*   Navigate to a secure folder on your computer (outside of this project).
*   Run the following command. Replace `your-alias-name` with a unique name you will remember.

    ```bash
    keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias your-alias-name
    ```
*   The tool will ask you for a **keystore password**, your name, organization, etc.
*   It will then ask for a **key password** for your alias. **For simplicity, use the same password as the keystore password.**
*   This will create a `keystore.jks` file in the folder. **Keep this file and your passwords safe!**

**2. Convert Keystore to Base64**

You cannot upload a binary file directly as a secret, so you must encode it as text.

*   **On macOS or Linux:**
    ```bash
    cat keystore.jks | base64
    ```
*   **On Windows (in PowerShell):**
    ```powershell
    [Convert]::ToBase64String([IO.File]::ReadAllBytes("keystore.jks"))
    ```
*   This will output a very long string of text. Copy this entire string.

**3. Add Secrets to your GitHub Repository**

*   Go to your project's repository on GitHub.
*   Click **Settings > Secrets and variables > Actions**.
*   Click **New repository secret** and add the following four secrets:

| Secret Name         | Description                                                                    | Example Value                    |
| ------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| `KEYSTORE_BASE64`   | The long Base64 string you copied in the previous step.                        | `S2V5c3RvcmUgY29udGVudHM...`     |
| `KEYSTORE_PASSWORD` | The password you created for the keystore file.                                | `MySecurePassword123`            |
| `KEY_ALIAS`         | The alias you provided in the `keytool` command (`your-alias-name`).           | `my-app-alias`                   |
| `KEY_PASSWORD`      | The password for your key alias (use the same as the keystore password).       | `MySecurePassword123`            |


### Downloading the APK

Once the secrets are set up, every push to the `main` branch will trigger the build.

1.  Go to the **Actions** tab in your GitHub repository.
2.  Click on the most recent workflow run, titled "Build Android APK".
3.  Wait for the job to complete successfully.
4.  At the bottom of the workflow summary page, you will find an **Artifacts** section.
5.  Click on `app-release-apk` to download a zip file containing your signed `app-release.apk`.
