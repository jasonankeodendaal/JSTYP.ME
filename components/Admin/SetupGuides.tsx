import React from 'react';

export const LocalFolderGuideContent: React.FC = () => (
    <>
        <h4>Part 1: How It Works</h4>
        <p>This method stores all your kiosk data—products, settings, and media assets—directly in a folder on your computer or a shared network drive. It's the simplest and most reliable option for offline-first or single-location setups.</p>
        <ul>
            <li><strong>Offline Access:</strong> The kiosk can run without an internet connection.</li>
            <li><strong>Data Control:</strong> Your data never leaves your local network.</li>
            <li><strong>Automatic Structure:</strong> The app will automatically create a <code>database.json</code> file for your data and an <code>assets</code> folder for all your uploaded images and videos.</li>
        </ul>
        <hr />
        <h4>Part 2: Step-by-Step Setup</h4>
        <ol>
            <li>In the "Connect a Storage Provider" section, click the <strong>Connect to Folder</strong> button.</li>
            <li>Your browser will open a file dialog asking you to select a folder. Choose an empty folder on your computer or a shared network drive that other kiosks can access.</li>
            <li>A permission pop-up will appear. You <strong>must click "Save changes" or "Allow"</strong> to grant the application read and write access. This is a crucial security step from the browser.</li>
            <li>Once connected, the "Storage" page will show you are connected to "Local Folder" and display the folder's name.</li>
            <li>Navigate to the <strong>"Backup &amp; Restore"</strong> tab.</li>
            <li>Click <strong>"Save to Folder"</strong>. This will create the initial <code>database.json</code> file and <code>assets</code> folder inside your chosen directory.</li>
        </ol>
        <hr />
        <h4>Part 3: Syncing Other Kiosks</h4>
        <ol>
            <li>On your other kiosk devices, ensure they have access to the same shared folder you selected in Part 2.</li>
            <li>In the admin panel on the new kiosk, go to <strong>Storage</strong> and connect to the same shared folder.</li>
            <li>Navigate to the <strong>Backup &amp; Restore</strong> tab and click <strong>"Load from Folder"</strong>. This will pull all the data and media paths from the central folder.</li>
            <li>Enable <strong>"Auto-Sync"</strong> in the "Sync &amp; API Settings" to automatically save any changes you make back to the shared folder.</li>
        </ol>
    </>
);

export const CloudSyncGuideContent: React.FC = () => (
    <>
        <p><strong>Use this for:</strong> The most powerful and reliable setup. Manage a main admin PC and multiple display kiosks across different locations, all synced together over the internet.</p>
        <p>This setup uses <strong>PM2</strong>, a professional process manager, to ensure your server and the secure connection run 24/7 and restart automatically.</p>
        
        <hr/>
        <h4>Part 1: Configure Your Central Server (On Your Main PC)</h4>
        
        <h5>Step 1.1: One-Time System Installations</h5>
        <ol>
            <li><strong>Install Node.js:</strong> If you don't have it, go to <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">nodejs.org</a>, download and install the <strong>LTS version</strong>. Verify the installation by opening a terminal (like Command Prompt, PowerShell, or Terminal) and running <code>node -v</code> and <code>npm -v</code>.</li>
            <li><strong>Install PM2:</strong> In your terminal, run this command to install PM2 globally: <pre><code>npm install -g pm2</code></pre></li>
            <li><strong>Install Cloudflare Tunnel:</strong> Follow the official guide to install the <code>cloudflared</code> tool from <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" target="_blank" rel="noopener noreferrer">this link</a>.</li>
        </ol>

        <h5>Step 1.2: Configure the Server Project</h5>
        <ol>
            <li><strong>Open a Terminal in the `server` Folder:</strong> In your project, navigate into the <code>server</code> directory.</li>
            <li><strong>Install Server Dependencies:</strong> Run this command once: <pre><code>npm install</code></pre></li>
            <li><strong>CRITICAL - Set Your Secret API Key:</strong> In the <code>server</code> folder, rename the file <code>.env.example</code> to exactly <code>.env</code>. Open this new file and replace the placeholder key with your own private password.</li>
        </ol>

        <h5>Step 1.3: Run and Persist the Server with PM2</h5>
        <ol>
            <li>
                <strong>Start Both Services:</strong> In your terminal (still inside the <code>server</code> folder), run this command. It uses the project's configuration file to start both your API server and the Cloudflare tunnel in the background.
                <pre><code>pm2 start</code></pre>
                <p className="text-xs"><strong>Tip:</strong> You can run <code>pm2 delete all</code> first for a clean start. Check that both <code>kiosk-api</code> and <code>kiosk-tunnel</code> are online with <code>pm2 list</code>.</p>
            </li>
            <li>
                <strong>Get Your Public URL:</strong> The "Cloudflare terminal" is now running in the background. To see its output and get your permanent public URL, run:
                <pre><code>pm2 logs kiosk-tunnel</code></pre>
                Look for a URL like <code>https://...trycloudflare.com</code>. <strong>Copy this URL</strong>. You can press <code>Ctrl + C</code> to exit the logs view.
            </li>
            <li>
                <strong>Make it Permanent (Crucial for Reliability):</strong> To make PM2 restart everything automatically after a computer reboot, run this command:
                <pre><code>pm2 startup</code></pre>
                <strong>The command will output another command.</strong> You must copy that entire new command, paste it back into the same terminal, and press Enter. Finally, save your current process list so it knows what to restart:
                <pre><code>pm2 save</code></pre>
                Your server is now fully configured and running 24/7. You can close the terminal.
            </li>
        </ol>
        <hr/>
        <h4>Part 2: Connect Your Kiosks to Your Server</h4>
        <p>You must do this on <strong>every single device</strong> you want to sync, including your main PC's browser.</p>
        <ol>
            <li>In the kiosk setup, choose the <strong>"Custom API Sync"</strong> option.</li>
            <li>In <strong>"Custom API URL"</strong>, paste your public Cloudflare URL from Part 1 and <strong>add <code>/data</code></strong> to the end (e.g., <code>https://...com/data</code>).</li>
            <li>In <strong>"Custom API Auth Key"</strong>, enter the secret <code>API_KEY</code> from your server's <code>.env</code> file.</li>
            <li>Click <strong>"Test &amp; Connect"</strong>. If it succeeds, click <strong>"Finish Setup"</strong>.</li>
            <li>After setup, log in as admin and go to the <strong>System</strong> tab in the admin panel.
                <ul>
                    <li><strong>On your main admin PC:</strong> Click <strong>"Push to Cloud"</strong> in the Backup/Sync section. This uploads your local data to the server for the first time.</li>
                    <li><strong>On all other devices:</strong> Click <strong>"Pull from Cloud"</strong>. This downloads the master data from your server.</li>
                </ul>
            </li>
            <li><strong>Enable Auto-Sync:</strong> On <strong>every device</strong>, go to <strong>System &gt; Storage &gt; Sync &amp; API Settings</strong> and turn on the <strong>"Enable Auto-Sync"</strong> toggle.</li>
        </ol>
        <p>Your multi-device kiosk system is now fully configured and running!</p>
    </>
);

export const VercelGuideContent: React.FC = () => (
    <>
        <p>You can deploy the included Node.js server from the <code>/server</code> directory as a Serverless Function on Vercel. This is a powerful, scalable option.</p>
        <h4>Part 1: Prepare Your Server Code</h4>
        <ol>
            <li>In the <code>/server</code> directory of your project, create a new file named <code>vercel.json</code>.</li>
            <li>Paste the following configuration into <code>vercel.json</code>. This tells Vercel how to handle the server as a function.
                <pre><code>{`{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}`}</code></pre>
            </li>
            <li>Ensure you have a GitHub account and have pushed your project code to a new repository.</li>
        </ol>
        <hr />
        <h4>Part 2: Deploy on Vercel</h4>
        <ol>
            <li>Sign up or log in to <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">Vercel</a> with your GitHub account.</li>
            <li>Click "Add New..." &rarr; "Project".</li>
            <li>Import your GitHub repository.</li>
            <li>In the "Configure Project" screen, expand the "Environment Variables" section.</li>
            <li>Add a new variable named <code>API_KEY</code> and paste the secret key from your local <code>.env</code> file as the value.</li>
            <li>In the "Root Directory" setting, make sure to specify that your server code is in the <code>server</code> subfolder. Click "Edit" next to the project name and set the Root Directory to <code>server</code>.</li>
            <li>Click <strong>"Deploy"</strong>.</li>
        </ol>
        <hr />
        <h4>Part 3: Connect the Kiosk</h4>
        <ol>
            <li>Once deployment is complete, Vercel will give you a public URL (e.g., <code>https://your-project.vercel.app</code>).</li>
            <li>In the kiosk's Admin Panel &rarr; Storage section, click "Connect" on the "Vercel" card.</li>
            <li>In the modal, for the URL, enter your Vercel URL with <code>/data</code> appended (e.g., <code>https://your-project.vercel.app/data</code>).</li>
            <li>Enter the same <code>API_KEY</code> you set in the Vercel environment variables.</li>
            <li>Click "Test &amp; Connect".</li>
        </ol>
    </>
);

export const SupabaseGuideContent: React.FC = () => (
    <>
        <p>This is an advanced setup. It uses a Supabase Edge Function to read/write from a table and Supabase Storage for files. It fully mimics the custom API server.</p>
        <h4>Part 1: Set up Supabase Project</h4>
        <ol>
            <li>Create a new project on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>.</li>
            <li>Go to the <strong>SQL Editor</strong> and run the following query to create a table to hold your data:
                <pre><code>{`CREATE TABLE kiosk_data (
  id TEXT PRIMARY KEY,
  content JSONB
);`}</code></pre>
            </li>
            <li>Go to <strong>Storage</strong> and create a new public bucket named <code>kiosk-assets</code>. We make it public for easy read access.</li>
        </ol>
        <hr />
        <h4>Part 2: Create the Edge Function</h4>
        <ol>
            <li>Follow the Supabase guide to set up their CLI and link it to your project.</li>
            <li>Create a new Edge Function, for example: <code>supabase functions new kiosk-sync</code>.</li>
            <li>Replace the contents of the new function file (e.g., <code>/supabase/functions/kiosk-sync/index.ts</code>) with the code below.</li>
            <li>Deploy the function: <code>supabase functions deploy kiosk-sync --no-verify-jwt</code>. The <code>--no-verify-jwt</code> is important as we use our own API key.</li>
        </ol>
        <h5>Edge Function Code (`index.ts`):</h5>
        <pre><code>{`import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const KIOSK_DATA_ID = 'main_store';

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const apiKey = Deno.env.get('API_KEY');

  const authKey = req.headers.get('x-api-key');
  if (authKey !== apiKey) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { pathname } = new URL(req.url);

  if (pathname.endsWith('/data') && req.method === 'GET') {
    const { data, error } = await supabase.from('kiosk_data').select('content').eq('id', KIOSK_DATA_ID).single();
    if (error || !data) return new Response('Not Found', { status: 404 });
    return new Response(JSON.stringify(data.content), { headers: { 'Content-Type': 'application/json' } });
  }

  if (pathname.endsWith('/data') && req.method === 'POST') {
    const content = await req.json();
    const { error } = await supabase.from('kiosk_data').upsert({ id: KIOSK_DATA_ID, content });
    if (error) return new Response(error.message, { status: 500 });
    return new Response('Data saved', { status: 200 });
  }

  if (pathname.endsWith('/upload') && req.method === 'POST') {
    const formData = await req.formData();
    const file = formData.get('file');
    const fileName = \`\${Date.now()}-\${file.name}\`;
    const { error } = await supabase.storage.from('kiosk-assets').upload(fileName, file);
    if (error) return new Response(error.message, { status: 500 });
    return new Response(JSON.stringify({ filename: fileName }), { status: 200 });
  }

  if (pathname.startsWith('/files/')) {
    const fileName = pathname.split('/files/')[1];
    const { data } = supabase.storage.from('kiosk-assets').getPublicUrl(fileName);
    return Response.redirect(data.publicUrl, 301);
  }

  return new Response('Not found', { status: 404 });
});`}</code></pre>
        <hr />
        <h4>Part 3: Connect the Kiosk</h4>
        <ol>
            <li>In your Supabase project settings, find the "Environment Variables" for your function and add your secret <code>API_KEY</code>.</li>
            <li>Get your function's URL from the Supabase dashboard.</li>
            <li>In the kiosk, connect to Supabase and use your function's URL (e.g., <code>https://project-ref.supabase.co/functions/v1/kiosk-sync</code>) as the "API URL". You do not need to add `/data`.</li>
            <li>Use your secret <code>API_KEY</code> as the "API Key".</li>
        </ol>
    </>
);
