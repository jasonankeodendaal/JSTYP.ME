import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { ServerStackIcon, ChevronDownIcon, ArchiveBoxArrowDownIcon, LinkIcon } from '../Icons.tsx';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';

const CodeBracketIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
);


const ProviderCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children?: React.ReactNode;
    disabled?: boolean;
}> = ({ icon, title, description, children, disabled = false }) => (
    <div className={`bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50 flex flex-col items-center text-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-800 dark:bg-gray-700 text-white mb-4">
            {icon}
        </div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex-grow">{description}</p>
        <div className="mt-6 w-full">
            {children}
        </div>
    </div>
);

const ConnectedCard: React.FC<{ icon: React.ReactNode; title: string; onDisconnect: () => void; name?: string; }> = ({ icon, title, onDisconnect, name }) => {
    
    return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border border-green-300 dark:border-green-700">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-green-600 text-white">
                {icon}
            </div>
            <div className="flex-grow min-w-0">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Connected to {title}</h4>
                <p className="mt-1 text-sm text-green-700 dark:text-green-400 font-medium truncate" title={name}>
                    {name ? `Active: ${name}` : `Your assets are managed by ${title}.`}
                </p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button onClick={onDisconnect} className="btn btn-destructive">
                    Disconnect
                </button>
            </div>
        </div>
    </div>
    )
};

const SetupInstruction: React.FC<{ title: string, children: React.ReactNode, id?: string, defaultOpen?: boolean }> = ({ title, children, id, defaultOpen = false }) => (
    <details id={id} className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden border dark:border-gray-700/50" open={defaultOpen}>
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h4>
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                <ChevronDownIcon className="w-5 h-5"/>
            </div>
        </summary>
        <div className="px-5 py-4 border-t border-gray-200/80 dark:border-gray-700/50 prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-gray-200 prose-code:dark:bg-gray-700 prose-code:p-1 prose-code:rounded-md prose-code:font-mono prose-strong:text-gray-800 dark:prose-strong:text-gray-100">
            {children}
        </div>
    </details>
);

const AdminStorage: React.FC = () => {
    const { 
        connectToLocalProvider,
        connectToCloudProvider,
        connectToSharedUrl,
        disconnectFromStorage,
        storageProvider,
        directoryHandle,
        loggedInUser,
        settings,
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPotentiallyRestricted, setIsPotentiallyRestricted] = useState(false);
    const [sharedUrl, setSharedUrl] = useState('');
    
    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSystem;

    useEffect(() => {
        if (window.self !== window.top) {
            setIsPotentiallyRestricted(true);
        }
    }, []);

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage system settings.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }
    
    const handleLocalConnect = async () => {
        setIsLoading(true);
        await connectToLocalProvider();
        setIsLoading(false);
    };

    const handleSharedUrlConnect = () => {
        connectToSharedUrl(sharedUrl);
    };
    
    const handleDownloadGuide = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
    
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.backgroundColor = '#ffffff';
        container.style.color = '#1f2937'; // Explicitly set a dark text color for the render context.

        try {
            const response = await fetch('/README.md');
            if (!response.ok) throw new Error('README.md not found');
            const markdown = await response.text();
            
            const sanitizedHtml = window.DOMPurify.sanitize(window.marked.parse(markdown));
            
            const professionalStyles = `
                body { margin: 0; }
                #pdf-render-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }
                #pdf-render-container h1, #pdf-render-container h2, #pdf-render-container h3, #pdf-render-container h4 { font-weight: 600; color: #111; margin-top: 1.5em; margin-bottom: 0.7em; line-height: 1.3; }
                #pdf-render-container h1 { font-size: 26pt; font-weight: 800; margin-top: 0; padding-bottom: 0.3em; border-bottom: 2px solid #e5e7eb; }
                #pdf-render-container h2 { font-size: 18pt; font-weight: 700; padding-bottom: 0.25em; border-bottom: 1px solid #e5e7eb; }
                #pdf-render-container h3 { font-size: 14pt; }
                #pdf-render-container h4 { font-size: 12pt; text-transform: uppercase; color: #4b5563; }
                #pdf-render-container p { margin-bottom: 1em; }
                #pdf-render-container ul, #pdf-render-container ol { margin-bottom: 1em; padding-left: 1.5em; }
                #pdf-render-container li { margin-bottom: 0.5em; }
                #pdf-render-container code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; background-color: #f3f4f6; padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 6px; }
                #pdf-render-container pre { background-color: #f3f4f6; border-radius: 8px; padding: 1em; white-space: pre-wrap; word-break: break-all; font-size: 10pt; }
                #pdf-render-container pre code { background-color: transparent; padding: 0; font-size: inherit; }
                #pdf-render-container blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; margin: 1.5em 0; color: #4b5563; font-style: italic; }
                #pdf-render-container a { color: #2563eb; text-decoration: none; } #pdf-render-container a:hover { text-decoration: underline; }
                #pdf-render-container hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
            `;
            
            // 1. Render full content in a measuring container to get element dimensions
            const measuringContainer = document.createElement('div');
            measuringContainer.style.width = '780px';
            measuringContainer.innerHTML = `<style>${professionalStyles}</style><div id="pdf-render-container" style="padding: 40px; box-sizing: border-box;">${sanitizedHtml}</div>`;
            container.appendChild(measuringContainer);
            document.body.appendChild(container);

            const contentToRender = container.querySelector('#pdf-render-container');
            if (!contentToRender) throw new Error("Could not find content to render.");

            // 2. Group elements into pages based on their rendered height
            const A4_WIDTH_PX = 780;
            const A4_HEIGHT_PX = Math.floor(A4_WIDTH_PX * 1.414);
            const PAGE_PADDING = 40;
            const A4_TARGET_CONTENT_HEIGHT = A4_HEIGHT_PX - (PAGE_PADDING * 2);
    
            const elements = Array.from(contentToRender.children) as HTMLElement[];
            const pages: HTMLElement[][] = [];
            let currentPageElements: HTMLElement[] = [];
            let currentPageHeight = 0;
    
            elements.forEach(el => {
                const isHeading = el.tagName === 'H1' || el.tagName === 'H2';
                const isPageBreak = el.tagName === 'HR';
    
                if ((isHeading && currentPageElements.length > 0) || isPageBreak) {
                    if (currentPageElements.length > 0) pages.push(currentPageElements);
                    currentPageElements = [];
                    currentPageHeight = 0;
                    if(isPageBreak) return;
                }
                
                const style = window.getComputedStyle(el);
                const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
                const elHeight = el.offsetHeight + margin;
    
                if (elHeight > A4_TARGET_CONTENT_HEIGHT && currentPageElements.length > 0) {
                    pages.push(currentPageElements);
                    currentPageElements = [];
                    currentPageHeight = 0;
                }
    
                if (currentPageElements.length > 0 && currentPageHeight + elHeight > A4_TARGET_CONTENT_HEIGHT) {
                    pages.push(currentPageElements);
                    currentPageElements = [el];
                    currentPageHeight = elHeight;
                } else {
                    currentPageElements.push(el);
                    currentPageHeight += elHeight;
                }
            });
            if (currentPageElements.length > 0) pages.push(currentPageElements);
            
            // 3. Render each page to a canvas and add to zip
            const zip = new JSZip();
            for (let i = 0; i < pages.length; i++) {
                const pageContent = document.createElement('div');
                pageContent.style.width = `${A4_WIDTH_PX}px`;
                pageContent.style.height = `${A4_HEIGHT_PX}px`;
                pageContent.style.backgroundColor = '#ffffff';
                pageContent.style.display = 'flex';
                pageContent.style.flexDirection = 'column';
                pageContent.innerHTML = `<style>${professionalStyles}</style>`;
                
                const pageInner = document.createElement('div');
                pageInner.style.padding = `${PAGE_PADDING}px`;
                pageInner.style.boxSizing = 'border-box';
                pageInner.style.flexGrow = '1';
                
                pages[i].forEach(el => pageInner.appendChild(el.cloneNode(true)));
                pageContent.appendChild(pageInner);
                container.appendChild(pageContent);

                const canvas = await window.html2canvas(pageContent, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    zip.file(`guide-page-${String(i + 1).padStart(2, '0')}.png`, blob);
                }
                container.removeChild(pageContent);
            }

            // 4. Generate and download zip
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Kiosk-Setup-Guide-Images.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Image generation failed:", error);
            alert("Failed to generate guide images.");
        } finally {
            document.body.removeChild(container);
            setIsDownloading(false);
        }
    };
    
    const getProviderDetails = () => {
        switch (storageProvider) {
            case 'local':
                return {
                    icon: <ServerStackIcon className="h-8 w-8" />,
                    title: 'Local or Network Folder',
                    name: directoryHandle?.name,
                };
            case 'customApi':
                return {
                    icon: <CodeBracketIcon className="h-8 w-8" />,
                    title: 'Custom API Sync',
                    name: 'Remote cloud sync active',
                };
            case 'sharedUrl':
                 return {
                    icon: <LinkIcon className="h-8 w-8" />,
                    title: 'Shared URL',
                    name: settings.sharedUrl,
                };
            default: return null;
        }
    }

    const renderProviderSelection = () => (
        <>
            <div>
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Storage Provider</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Choose how to store your kiosk data and media assets. You can only connect to one provider at a time.
                </p>
            </div>
             {isPotentiallyRestricted && (
                 <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 rounded-r-lg">
                    <p className="font-bold">Potential Restriction Detected</p>
                    <p className="text-sm mt-1">
                       It looks like this app is running in an embedded window. Due to browser security, "Local Folder" storage might be disabled.
                    </p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <ProviderCard
                    icon={<ServerStackIcon className="h-8 w-8" />}
                    title="Local or Network Folder"
                    description="Store all assets and data in a folder on your computer or a shared network drive. Ideal for offline use or manual syncing."
                    disabled={isPotentiallyRestricted || isLoading}
                >
                        <button onClick={handleLocalConnect} className="btn btn-primary w-full max-w-xs mx-auto" disabled={isPotentiallyRestricted || isLoading}>
                        {isLoading ? 'Connecting...' : 'Connect to Folder'}
                    </button>
                </ProviderCard>
                <ProviderCard
                    icon={<LinkIcon className="h-8 w-8" />}
                    title="Shared URL / Simple API"
                    description="Connect to a simple cloud endpoint. For read-only access, use a URL to a database.json file. For read/write, the URL must be a server endpoint that accepts POST requests."
                    disabled={isLoading}
                >
                    <div className="space-y-2">
                        <input type="url" value={sharedUrl} onChange={e => setSharedUrl(e.target.value)} placeholder="https://.../database.json" className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 text-sm"/>
                        <button onClick={handleSharedUrlConnect} className="btn btn-primary w-full max-w-xs mx-auto" disabled={isLoading || !sharedUrl}>
                            {isLoading ? 'Connecting...' : 'Connect to URL'}
                        </button>
                    </div>
                </ProviderCard>
                 <ProviderCard
                    icon={<CodeBracketIcon className="h-8 w-8" />}
                    title="Custom API Sync"
                    description="For advanced users. Sync data with your own backend API (e.g., Node.js with Redis, MongoDB, etc.)."
                    disabled={isLoading}
                >
                    <button onClick={() => connectToCloudProvider('customApi')} className="btn btn-primary w-full max-w-xs mx-auto" disabled={isLoading}>
                        Connect
                    </button>
                </ProviderCard>
            </div>
        </>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-800 dark:bg-gray-700 text-white">
                    <ArchiveBoxArrowDownIcon className="h-8 w-8" />
                </div>
                <div className="flex-grow text-center sm:text-left">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Complete Setup Guide</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Download the full step-by-step documentation as a collection of images for offline use.</p>
                </div>
                <button onClick={handleDownloadGuide} disabled={isDownloading} className="btn btn-primary mt-2 sm:mt-0 flex-shrink-0">
                    {isDownloading ? 'Generating...' : 'Download Guide as Images'}
                </button>
            </div>
            
            {storageProvider !== 'none' ? <ConnectedCard {...getProviderDetails()!} onDisconnect={() => disconnectFromStorage()} /> : renderProviderSelection()}
            
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading text-center">
                    Setup Instructions
                </h3>

                <SetupInstruction title="The Definitive Guide: Cloud Sync Setup (Recommended)" defaultOpen>
                    <p><strong>Use this for:</strong> The most powerful setup. Manage a main admin PC and multiple display kiosks (PCs, Android tablets) across different locations, all synced together over the internet.</p>
                    <p>This guide is in three parts. You will have two terminal windows running on your main computer by the end.</p>
                    
                    <hr/>
                    <h4>Part 1: Start Your Central Server (On Your Main PC)</h4>
                    <p>This turns your main PC into the central "brain" for all your kiosks.</p>
                    <ol>
                        <li>
                            <strong>Open a Terminal in the Server Folder:</strong><br/>
                            Navigate into the <code>server_examples</code> folder, and then into the <code>custom_api_local_json</code> folder. You need to open a terminal *inside this specific folder*. On Windows, Shift + Right-click and choose "Open PowerShell window here". On Mac, type <code>cd </code> and drag the folder into the terminal window.
                        </li>
                        <li>
                            <strong>Install Server Dependencies (First time only):</strong><br/>
                            Copy and paste this command into your terminal and press Enter:
                            <pre><code>npm install</code></pre>
                        </li>
                        <li>
                            <strong>Create Your Secret API Key:</strong><br/>
                            In the <code>custom_api_local_json</code> folder, create a new file named exactly <strong><code>.env</code></strong>. Open it and add this line, replacing the placeholder with your own private password:
                            <pre><code>API_KEY=your-super-secret-key-here</code></pre>
                        </li>
                        <li>
                            <strong>Start the Server:</strong><br/>
                            Go back to your terminal window, paste this command, and press Enter. <strong>LEAVE THIS TERMINAL WINDOW OPEN.</strong>
                            <pre><code>node server.js</code></pre>
                        </li>
                    </ol>

                    <hr/>
                    <h4>Part 2: Make Your Server Publicly Accessible</h4>
                    <p>This step uses a free, secure tool called Cloudflare Tunnel to create a "bridge" from the public internet to the server running on your PC.</p>
                     <ol>
                        <li>
                            <strong>Install Cloudflare Tunnel (First time only):</strong><br/>
                            Follow the official guide: <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" target="_blank" rel="noopener noreferrer">Cloudflare Tunnel Installation Guide</a>.
                        </li>
                        <li>
                            <strong>Open a NEW Terminal Window:</strong><br/>
                            Do not close the first terminal. Open a second, completely new terminal window.
                        </li>
                        <li>
                            <strong>Run the Tunnel:</strong><br/>
                            Copy and paste the following command into your <strong>new</strong> terminal window and press Enter:
                            <pre><code>cloudflared tunnel --url http://localhost:3001</code></pre>
                        </li>
                         <li>
                            <strong>Get Your Public URL:</strong><br/>
                            The terminal will show a public URL like <code>https://random-words.trycloudflare.com</code>. This is your public server address. Copy it. <strong>LEAVE THIS SECOND TERMINAL WINDOW OPEN.</strong>
                        </li>
                    </ol>

                    <hr/>
                    <h4>Part 3: Configure All Your Kiosk Devices</h4>
                    <p>You must repeat these steps on <strong>every single device</strong> you want to sync (your main PC and all your Android devices).</p>
                    <ol>
                        <li>
                            <strong>Log In as Admin:</strong><br/>
                            On the kiosk app screen, go to the footer and click <strong>Admin Login</strong> (Default PIN: <code>1723</code>).
                        </li>
                        <li>
                            <strong>Enter Your Public URL and API Key:</strong><br/>
                            Navigate to <code>Settings &gt; API Integrations</code>.
                            <ul>
                                <li>In the <strong>"Custom API URL"</strong> field, paste your public URL from Part 2. <strong>VERY IMPORTANT:</strong> You must add <code>/data</code> to the end of the URL.</li>
                                <li>In the <strong>"Custom API Auth Key"</strong> field, enter the exact same secret API Key from Part 1.</li>
                                <li>Click <strong>Save Changes</strong>.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Connect to the Storage Provider:</strong><br/>
                            Navigate to the <code>Storage</code> tab in the admin panel and click the <strong>"Connect"</strong> button on the "Custom API Sync" card.
                        </li>
                        <li>
                            <strong>Do the First Sync (Critical Step!):</strong>
                             <ul>
                                <li><strong>On your main admin PC:</strong> Go to the <code>Cloud Sync</code> tab and click <strong>"Push to Cloud"</strong>.</li>
                                <li><strong>On all other devices:</strong> Go to the <code>Cloud Sync</code> tab and click <strong>"Pull from Cloud"</strong>.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Enable Auto-Sync:</strong><br/>
                            On <strong>every device</strong>, go to <code>Settings &gt; Kiosk Mode</code> and turn on the <strong>"Enable Auto-Sync"</strong> toggle.
                        </li>
                    </ol>
                    <p>Your setup is now complete! Changes will sync automatically.</p>
                </SetupInstruction>

                 <SetupInstruction title="Alternative: How to use a Local or Network Folder">
                    <ol>
                        <li>Click the <strong>"Connect to Folder"</strong> button above.</li>
                        <li>Your browser will ask you to select a folder. Choose a folder on your computer or a shared network drive accessible by other kiosks. Grant permission when prompted.</li>
                        <li>Once connected, go to the <strong>"Backup & Restore"</strong> tab.</li>
                        <li>Click <strong>"Save to Drive"</strong> to create a `database.json` file and save all your current product data and assets to the selected folder.</li>
                        <li>On other kiosks, connect to the same folder and use the <strong>"Load from Drive"</strong> button to get the latest data.</li>
                    </ol>
                </SetupInstruction>
            </div>

        </div>
    );
};

export default AdminStorage;