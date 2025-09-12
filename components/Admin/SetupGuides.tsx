import React from 'react';

export const LocalFolderGuideContent: React.FC = () => (
    <>
        <h4>Part 1: How It Works</h4>
        <p>This method stores all your kiosk data—products, settings, and media assets—directly in a folder on your computer or a shared network drive. It's the simplest and most reliable option for offline-first or single-location setups where all devices are on the same local network.</p>
        <ul>
            <li><strong>Offline Access:</strong> The kiosk can run without an internet connection once synced.</li>
            <li><strong>Data Control:</strong> Your data never leaves your local network.</li>
            <li><strong>Automatic Structure:</strong> The app will automatically create a <code>database.json</code> file for your data and an <code>assets</code> folder for all your uploaded images and videos.</li>
        </ul>
        <hr />
        <h4>Part 2: Step-by-Step Setup on your Main Computer</h4>
        <ol>
            <li><strong>Create a Folder:</strong> On your main computer, create a new, empty folder. This will be the central storage for your kiosk. For example, create <code>C:\KioskData</code> on Windows.</li>
            <li><strong>Share the Folder (for multi-device setups):</strong> If you plan to connect other kiosks, you must share this folder on your network so other computers can access it.
                <ul>
                    <li><strong>Windows:</strong> Right-click the folder, go to `Properties` &rarr; `Sharing` tab &rarr; `Advanced Sharing...`. Check "Share this folder" and click "Permissions". Grant "Full Control" to the users or groups that will access the kiosk.</li>
                    <li><strong>macOS:</strong> Go to `System Settings` &rarr; `General` &rarr; `Sharing`. Turn on "File Sharing". Click the 'i' icon, add your folder to the "Shared Folders" list, and configure user permissions.</li>
                </ul>
            </li>
            <li>In the "Connect a Storage Provider" section, click the <strong>Connect to Folder</strong> button.</li>
            <li>Your browser will open a file dialog asking you to select a folder. Choose the folder you just created (e.g., <code>C:\KioskData</code>).</li>
            <li><strong>CRITICAL: Grant Permission:</strong> A permission pop-up will appear from your browser. You <strong>must click "Save changes" or "Allow"</strong> to grant the application read and write access. This is a crucial security step.</li>
            <li>Once connected, the "Storage" page will show you are connected to "Local Folder" and display the folder's name.</li>
            <li>Navigate to the <strong>"Backup &amp; Restore"</strong> tab.</li>
            <li>Click <strong>"Save to Folder"</strong>. This will create the initial <code>database.json</code> file and <code>assets</code> folder inside your chosen directory. Your main kiosk is now set up!</li>
        </ol>
        <hr />
        <h4>Part 3: Syncing Other Kiosks on the Same Network</h4>
        <ol>
            <li>On your other kiosk devices, ensure they have network access to the shared folder from Part 2.</li>
            <li>In the admin panel on the new kiosk, go to <strong>Storage</strong> and connect to the same shared folder, following steps 3-5 from Part 2.</li>
            <li>Navigate to the <strong>Backup &amp; Restore</strong> tab and click <strong>"Load from Folder"</strong>. This will pull all the data and media from the central folder.</li>
            <li>Enable <strong>"Auto-Sync"</strong> in the "Sync &amp; API Settings" to automatically save any changes you make back to the shared folder.</li>
        </ol>
    </>
);

export const CloudSyncGuideContent: React.FC = () => (
    <>
        <p><strong>Use this for:</strong> The most powerful and reliable setup. Manage a main admin PC and multiple display kiosks across different locations, all synced together over the internet.</p>
        <p>This setup uses <strong>PM2</strong>, a professional process manager, to ensure your server and the secure connection run 24/7 and restart automatically.</p>
        
        <hr/>
        <h4>Part 1: One-Time System Installations</h4>
        <p>You only need to do this once on your main computer.</p>
        <ol>
            <li><strong>Install Node.js:</strong> This is the runtime environment for the server. If you don't have it, go to <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">nodejs.org</a>, download and install the <strong>LTS version</strong>. Verify the installation by opening a terminal (like Command Prompt, PowerShell, or Terminal) and running <code>node -v</code>.</li>
            <li><strong>Install PM2:</strong> This is a powerful tool that keeps your server running 24/7. In your terminal, run this command to install PM2 globally: <pre><code>npm install -g pm2</code></pre></li>
            <li><strong>Install Cloudflare Tunnel:</strong> This free tool creates a secure, public URL for your local server. Follow the official guide to install the <code>cloudflared</code> tool from <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" target="_blank" rel="noopener noreferrer">this link</a>.</li>
        </ol>

        <h4>Part 2: Configure the Server Project</h4>
        <ol>
            <li><strong>Open a Terminal in the `server` Folder:</strong> In your kiosk project folder, navigate into the <code>server</code> directory.</li>
            <li><strong>Install Server Dependencies:</strong> Run this command once: <pre><code>npm install</code></pre></li>
            <li><strong>CRITICAL - Set Your Secret API Key:</strong> In the <code>server</code> folder, rename the file <code>.env.example</code> to exactly <code>.env</code>. Open this new file and replace the placeholder key with your own private password. Make it long and secure!</li>
        </ol>

        <h4>Part 3: Run and Persist the Server with PM2</h4>
        <ol>
            <li>
                <strong>Start Both Services:</strong> In your terminal (still inside the <code>server</code> folder), run this command. It uses the project's configuration file to start both your API server and the Cloudflare tunnel in the background.
                <pre><code>pm2 start</code></pre>
                <p className="text-xs"><strong>Tip:</strong> You can check that both <code>kiosk-api</code> and <code>kiosk-tunnel</code> are "online" with the command <code>pm2 list</code>.</p>
            </li>
            <li>
                <strong>Get Your Public URL:</strong> The Cloudflare tunnel is now running in the background. To see its output and get your permanent public URL, run:
                <pre><code>pm2 logs kiosk-tunnel</code></pre>
                Look for a URL like <code>https://...trycloudflare.com</code>. <strong>Copy this URL</strong>. You can press <code>Ctrl + C</code> to exit the logs view.
            </li>
            <li>
                <strong>Make it Permanent (Crucial for Reliability):</strong> To make PM2 restart everything automatically after a computer reboot, run this command:
                <pre><code>pm2 startup</code></pre>
                <strong>The command will output another command.</strong> You must copy that entire new command, paste it back into the same terminal, and press Enter. Finally, save your current process list so it knows what to restart:
                <pre><code>pm2 save</code></pre>
                <p>Your server is now fully configured and will run 24/7. You can close the terminal.</p>
            </li>
        </ol>
        <hr/>
        <h4>Part 4: Connect Your Kiosks to Your Server</h4>
        <p>You must do this on <strong>every single device</strong> you want to sync, including your main PC's browser.</p>
        <ol>
            <li>In the kiosk setup, choose the <strong>"Custom API Sync"</strong> option.</li>
            <li>In <strong>"Custom API URL"</strong>, paste your public Cloudflare URL from Part 1. You do not need to add anything to the end.</li>
            <li>In <strong>"Custom API Auth Key"</strong>, enter the secret <code>API_KEY</code> from your server's <code>.env</code> file.</li>
            <li>Click <strong>"Test &amp; Connect"</strong>. If it succeeds, click <strong>"Finish Setup"</strong>.</li>
            <li>After setup, log in as admin and go to the <strong>System &gt; Backup &amp; Restore</strong> tab.
                <ul>
                    <li><strong>On your main admin PC:</strong> Click <strong>"Push to Cloud"</strong>. This uploads your local data to the server for the first time.</li>
                    <li><strong>On all other devices:</strong> Click <strong>"Pull from Cloud"</strong>. This downloads the master data from your server.</li>
                </ul>
            </li>
            <li><strong>Enable Auto-Sync:</strong> On <strong>every device</strong>, go to <strong>System &gt; Storage &gt; Sync &amp; API Settings</strong> and turn on the <strong>"Enable Auto-Sync"</strong> toggle.</li>
        </ol>
        <p>Your multi-device kiosk system is now fully configured and running!</p>
    </>
);

export const FtpGuideContent: React.FC = () => (
    <>
        <h4>Introduction: Why a "Bridge" Server is Needed</h4>
        <p>For security reasons, web browsers cannot directly connect to FTP/SFTP servers. To work around this, we use a small "bridge" server that runs on your computer. Your kiosk connects to this bridge server using standard web requests (HTTPS), and the bridge server then communicates with your FTP server to store and retrieve files.</p>
        <p>This guide will walk you through setting up a free FTP server on your Windows PC and then setting up the necessary bridge server.</p>
        <hr/>
        <h4>Part 1: Set Up a Free FTP Server (FileZilla Server)</h4>
        <ol>
            <li><strong>Download and Install:</strong> Go to the <a href="https://filezilla-project.org/download.php?type=server" target="_blank" rel="noopener noreferrer">FileZilla Server Website</a> and download the installer. Run it and complete the installation with the default settings.</li>
            <li><strong>Connect to the Server:</strong> After installation, the "FileZilla Server Administration" window will open. Leave the host as `127.0.0.1` and the port as `14148`, then click "Connect".</li>
            <li><strong>Create a Shared Folder:</strong> On your computer, create a new, empty folder where all your kiosk data will be stored (e.g., `C:\kiosk-ftp-data`).</li>
            <li><strong>Create a User:</strong> In the FileZilla admin window, go to `Edit &gt; Users`. In the "Users" panel, click "Add". Enter a username (e.g., `kiosk-user`) and click "OK". Check the "Password" box and enter a strong, secure password.</li>
            <li><strong>Assign the Folder:</strong> With your new user selected, go to the "Shared folders" page. Click "Add" under the "Shared folders" list and select the `C:\kiosk-ftp-data` folder you created.</li>
            <li><strong>Set Permissions:</strong> Once the folder is added, select it in the list. In the "Permissions" area on the right, grant full permissions by checking all the boxes under both "Files" and "Directories" (Read, Write, Delete, Append, etc.).</li>
            <li><strong>Note Your Details:</strong> You will need your PC's local IP address (run `ipconfig` in Command Prompt to find it, e.g., `192.168.1.10`), the username, and the password you just created.</li>
        </ol>
        <hr />
        <h4>Part 2: Set Up the Node.js Bridge Server</h4>
        <p>This small program will run on the same computer as your FTP server. It acts as the secure intermediary.</p>
        <ol>
            <li><strong>Install Node.js:</strong> If you don't have it, go to <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">nodejs.org</a> and install the LTS version.</li>
            <li><strong>Create a Project Folder:</strong> Create a new folder on your PC, for example, `C:\kiosk-ftp-bridge`.</li>
            <li><strong>Create `package.json`:</strong> Inside the new folder, create a file named `package.json` and paste the following content into it:
                <pre><code>{`{
  "name": "kiosk-ftp-bridge",
  "version": "1.0.0",
  "description": "Bridge server for kiosk to connect to an FTP server.",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "basic-ftp": "^5.0.5",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "multer": "^1.4.5-lts.1"
  }
}`}</code></pre>
            </li>
            <li><strong>Create `.env`:</strong> Create another file named `.env` and paste this content. **Fill in your details from Part 1.**
                <pre><code>{`# Bridge Server Settings
PORT=3002
API_KEY=your-super-secret-bridge-api-key

# FTP Server Connection Details
FTP_HOST=127.0.0.1
FTP_USER=kiosk-user
FTP_PASS=your-ftp-password
FTP_BASE_PATH=/`}</code></pre>
            </li>
            <li><strong>Create `server.js`:</strong> Create the main server file named `server.js` and paste the code from the box below.</li>
            <li><strong>Install & Run:</strong> Open a terminal (Command Prompt) in your `C:\kiosk-ftp-bridge` folder. Run `npm install` to download the dependencies. Then, run `node server.js` to start the bridge server.</li>
        </ol>
        <hr/>
        <h4>Part 3: Expose the Bridge with Cloudflare Tunnel</h4>
        <ol>
            <li><strong>Install Cloudflare Tunnel:</strong> Follow the official guide to install the <code>cloudflared</code> tool from <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" target="_blank" rel="noopener noreferrer">this link</a>.</li>
            <li><strong>Start the Tunnel:</strong> In a **new terminal window**, run this command to create a public URL for your local bridge server:
                <pre><code>cloudflared tunnel --url http://localhost:3002</code></pre>
            </li>
            <li><strong>Copy the URL:</strong> Cloudflare will output a URL like <code>https://...trycloudflare.com</code>. Copy this URL. Keep this terminal running.</li>
        </ol>
        <hr />
        <h4>Part 4: Connect the Kiosk</h4>
        <ol>
            <li>In the kiosk app, go to `Admin &gt; Storage` and click "Connect" on the "FTP Server" card.</li>
            <li>In the **URL field**, enter the public Cloudflare URL of your bridge server from Part 3.</li>
            <li>In the **API Key field**, enter the `API_KEY` you set in the bridge server's `.env` file.</li>
            <li>Click **"Test & Connect"**. If successful, you are now connected to your FTP server through the bridge!</li>
        </ol>
        <h5>Bridge Server Code (`server.js`):</h5>
        <pre><code>{`
const express = require('express');
const ftp = require('basic-ftp');
const cors = require('cors');
const multer = require('multer');
const { Readable } = require('stream');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;
const apiKey = process.env.API_KEY;

const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    secure: false, // Set to 'implicit' or true for FTPS
};

const basePath = process.env.FTP_BASE_PATH || '/';
const dbPath = \`\${basePath}/database.json\`;
const assetsPath = \`\${basePath}/assets\`;

app.use(cors());
const upload = multer();

const authenticateKey = (req, res, next) => {
    if (req.header('x-api-key') === apiKey) return next();
    return res.status(401).json({ error: 'Unauthorized' });
};

app.use('/data', authenticateKey);
app.use('/upload', authenticateKey);

async function getClient() {
    const client = new ftp.Client();
    client.ftp.verbose = false; // Set to true for debugging
    await client.access(ftpConfig);
    return client;
}

app.get('/data', async (req, res) => {
    const client = await getClient();
    try {
        const stream = new Readable();
        stream._read = () => {};
        
        let fileContent = '';
        stream.on('data', chunk => fileContent += chunk.toString());
        stream.on('end', () => res.json(JSON.parse(fileContent)));
        
        await client.downloadTo(stream, dbPath);
    } catch (err) {
        if (err.code === 550) return res.status(404).send('No data found.');
        res.status(500).json({ error: err.message });
    } finally {
        client.close();
    }
});

app.post('/data', express.json({ limit: '50mb' }), async (req, res) => {
    const client = await getClient();
    try {
        const dataStream = Readable.from(JSON.stringify(req.body, null, 2));
        await client.uploadFrom(dataStream, dbPath);
        res.status(200).json({ message: 'Data saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        client.close();
    }
});

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const client = await getClient();
    try {
        await client.ensureDir(assetsPath);
        const fileName = \`\${Date.now()}-\${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}\`;
        const filePath = \`\${assetsPath}/\${fileName}\`;
        const dataStream = Readable.from(req.file.buffer);
        await client.uploadFrom(dataStream, filePath);
        res.status(200).json({ filename: fileName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        client.close();
    }
});

app.get('/files/:filename', async (req, res) => {
    const client = await getClient();
    try {
        const filePath = \`\${assetsPath}/\${req.params.filename}\`;
        await client.downloadTo(res, filePath);
    } catch (err) {
        if (err.code === 550) return res.status(404).send('File not found.');
        res.status(500).json({ error: err.message });
    } finally {
        client.close();
    }
});

app.get('/status', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(port, () => console.log(\`FTP Bridge server running on port \${port}\`));
`}</code></pre>
    </>
);

export const VercelGuideContent: React.FC = () => (
    <>
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-300 p-4 rounded-r-lg mb-4">
            <p className="font-bold">Important Compatibility Notice</p>
            <p className="text-sm mt-1">
                The default server included in the <code>/server</code> directory is <strong>NOT compatible</strong> with Vercel's serverless environment. It relies on a local filesystem for storing data (<code>data.json</code>) and uploads, which is not available on Vercel.
            </p>
        </div>
        <p>To deploy your backend on Vercel, you must use a serverless-friendly storage solution. Vercel offers excellent, easy-to-use options:</p>
        <ul>
            <li><strong>Vercel KV:</strong> A serverless Redis database for your <code>database.json</code> content.</li>
            <li><strong>Vercel Blob:</strong> A serverless object storage for your media files (images, videos).</li>
        </ul>
        <hr/>
        <h4>Part 1: Prepare Your Serverless Backend</h4>
        <ol>
            <li><strong>Create a Vercel Project:</strong> Create a new project on <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a>, connected to a new GitHub repository containing your server code. You can start with the code from <code>/server_examples/custom_api_redis</code> as a template, but you will need to adapt it for Vercel's storage.</li>
            <li><strong>Add Vercel Storage:</strong> In your Vercel project dashboard, go to the "Storage" tab and create a new KV database and a new Blob store. Connect them to your project.</li>
            <li>
                <strong>Update Server Code:</strong> Modify your <code>server.js</code> to use the <code>@vercel/kv</code> and <code>@vercel/blob</code> packages instead of <code>fs</code> and <code>multer</code>. Vercel will automatically inject the necessary environment variables.
                <pre><code>{`// Example server.js adapted for Vercel
const { kv } = require('@vercel/kv');
const { put } = require('@vercel/blob');
// ... your express app setup ...

// GET /data
app.get('/data', async (req, res) => {
  const data = await kv.get('kiosk_data');
  if (data) res.status(200).json(data);
  else res.status(404).send('No data found.');
});

// POST /data
app.post('/data', async (req, res) => {
  await kv.set('kiosk_data', req.body);
  res.status(200).send('Data saved.');
});

// POST /upload
app.post('/upload', async (req, res) => {
  const fileName = req.headers['x-vercel-filename'] || 'file.bin';
  const { url } = await put(fileName, req.body, { access: 'public' });
  // IMPORTANT: The kiosk expects a 'filename', not a full URL.
  // You need to return just the part Vercel Blob generates.
  const vercelFilename = new URL(url).pathname.split('/').pop();
  res.status(200).json({ filename: vercelFilename });
});

// GET /files/:filename
app.get('/files/:filename', async (req, res) => {
  const fileUrl = \`https://\${process.env.BLOB_READ_WRITE_TOKEN.split('_')[2].toLowerCase()}.public.blob.vercel-storage.com/\${req.params.filename}\`;
  // Redirect to the public blob URL
  res.redirect(301, fileUrl);
});
`}</code></pre>
                 <p className="text-xs"><strong>Note:</strong> This is a simplified example. You will need to handle `multer`-like streaming for uploads correctly by adapting your frontend or using a Vercel-compatible library.</p>
            </li>
            <li><strong>Deploy to Vercel:</strong> Commit and push your updated server code to GitHub. Vercel will automatically deploy it.</li>
        </ol>
        <hr />
        <h4>Part 2: Connect the Kiosk</h4>
        <ol>
            <li>Get your project's public URL from the Vercel dashboard.</li>
            <li>In the kiosk's Admin Panel &rarr; Storage section, click "Connect" on the "Vercel" card.</li>
            <li>In the modal, for the URL, enter your Vercel deployment URL. You do not need to add anything to the end.</li>
            <li>Enter your custom <code>API_KEY</code> (which you should set as an Environment Variable in Vercel).</li>
            <li>Click "Test &amp; Connect".</li>
        </ol>
    </>
);

export const SupabaseGuideContent: React.FC = () => (
    <>
        <p>This is an advanced setup. It uses a Supabase Edge Function to read/write from a table and Supabase Storage for files. It fully mimics the custom API server and provides a robust, scalable backend.</p>
        <h4>Part 1: Set up Supabase Project</h4>
        <ol>
            <li>Create a new project on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>.</li>
            <li>Go to the <strong>SQL Editor</strong> and run the following query to create a table to hold your data:
                <pre><code>{`CREATE TABLE kiosk_data (
  id TEXT PRIMARY KEY,
  content JSONB
);`}</code></pre>
            </li>
            <li>Go to <strong>Storage</strong> and create a new public bucket named <code>kiosk-assets</code>. We make it public for easy read access without complex policies.</li>
        </ol>
        <hr />
        <h4>Part 2: Create the Edge Function</h4>
        <p>An Edge Function is a piece of code that runs on Supabase's servers, acting as our API.</p>
        <ol>
            <li>Follow the Supabase guide to set up their CLI and link it to your project.</li>
            <li>In your terminal, create a new Edge Function: <pre><code>supabase functions new kiosk-sync</code></pre></li>
            <li>This creates a folder like <code>/supabase/functions/kiosk-sync/index.ts</code>. Open this <code>index.ts</code> file and replace its entire contents with the code below.</li>
            <li><strong>Deploy the function:</strong> In your terminal, run <pre><code>supabase functions deploy kiosk-sync --no-verify-jwt</code></pre> The <code>--no-verify-jwt</code> is important because we use our own API key for security instead of Supabase's user authentication.</li>
        </ol>
        <h5>Edge Function Code (`index.ts`):</h5>
        <pre><code>{`// Deno - Used in Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Use a constant ID to always update the same row in our table
const KIOSK_DATA_ID = 'main_store';

serve(async (req) => {
  try {
    // Get secrets from Supabase Function settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // Use service key for full access
    const apiKey = Deno.env.get('API_KEY'); // Our custom secret key

    // --- Authentication ---
    const authKey = req.headers.get('x-api-key');
    if (authKey !== apiKey) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { pathname } = new URL(req.url);

    // --- Route: GET /data ---
    if (pathname.endsWith('/data') && req.method === 'GET') {
      const { data, error } = await supabase.from('kiosk_data').select('content').eq('id', KIOSK_DATA_ID).single();
      if (error || !data) return new Response('Not Found', { status: 404 });
      return new Response(JSON.stringify(data.content), { headers: { 'Content-Type': 'application/json' } });
    }

    // --- Route: POST /data ---
    if (pathname.endsWith('/data') && req.method === 'POST') {
      const content = await req.json();
      const { error } = await supabase.from('kiosk_data').upsert({ id: KIOSK_DATA_ID, content });
      if (error) throw error;
      return new Response('Data saved', { status: 200 });
    }

    // --- Route: POST /upload ---
    if (pathname.endsWith('/upload') && req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file');
      const fileName = \`\${Date.now()}-\${file.name}\`;
      const { error } = await supabase.storage.from('kiosk-assets').upload(fileName, file);
      if (error) throw error;
      return new Response(JSON.stringify({ filename: fileName }), { status: 200 });
    }
    
    // --- Route: GET /files/:filename ---
    if (pathname.startsWith('/files/')) {
        const fileName = pathname.split('/files/')[1];
        const { data } = supabase.storage.from('kiosk-assets').getPublicUrl(fileName);
        return Response.redirect(data.publicUrl, 301); // Redirect to the public file URL
    }
    
    // --- Route: GET /status ---
    if (pathname.endsWith('/status')) {
        return new Response(JSON.stringify({ status: 'ok' }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response('Not found', { status: 404 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
});`}</code></pre>
        <hr />
        <h4>Part 3: Connect the Kiosk</h4>
        <ol>
            <li>In your Supabase project dashboard, go to <strong>Edge Functions</strong>, select your <code>kiosk-sync</code> function, and go to its <strong>Settings &gt; Environment Variables</strong>. Add a new secret named <code>API_KEY</code> and set its value to your desired secret password.</li>
            <li>Get your function's URL from the Supabase dashboard.</li>
            <li>In the kiosk, connect to Supabase and use your function's URL (e.g., <code>https://project-ref.supabase.co/functions/v1/kiosk-sync</code>) as the "API URL". You do not need to add `/data`.</li>
            <li>Use your secret <code>API_KEY</code> as the "API Key".</li>
        </ol>
    </>
);
