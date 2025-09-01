import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './context/AppContext.tsx';
import { ServerStackIcon, ChevronRightIcon, LinkIcon, ChevronDownIcon, ChevronLeftIcon } from './Icons.tsx';
import { useNavigate } from 'react-router-dom';

const CodeBracketIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
);

const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const MotionDiv = motion.div as any;

const SetupInstruction: React.FC<{ title: string, children: React.ReactNode, id?: string, defaultOpen?: boolean }> = ({ title, children, id, defaultOpen = false }) => (
    <details id={id} className="group bg-gray-100 dark:bg-gray-700/50 rounded-2xl shadow-lg overflow-hidden border dark:border-gray-600/50" open={defaultOpen}>
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h4>
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                <ChevronDownIcon className="w-5 h-5"/>
            </div>
        </summary>
        <div className="px-5 py-4 border-t border-gray-200/80 dark:border-gray-600/50 prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-gray-200 prose-code:dark:bg-gray-900/50 prose-code:p-1 prose-code:rounded-md prose-code:font-mono prose-strong:text-gray-800 dark:prose-strong:text-gray-100">
            {children}
        </div>
    </details>
);

const SetupWizard: React.FC = () => {
    const { 
        connectToLocalProvider, 
        testAndConnectProvider,
        updateSettings, 
        directoryHandle,
        storageProvider,
        completeSetup,
        settings
    } = useAppContext();
    
    const navigate = useNavigate();
    const [step, setStep] = useState<number | 'guides'>(1);
    const [provider, setProvider] = useState<'local' | 'sharedUrl' | 'customApi' | null>(null);
    const [apiConfig, setApiConfig] = useState({ url: settings.customApiUrl || '', key: settings.customApiKey || '' });
    const [sharedUrl, setSharedUrl] = useState(settings.sharedUrl || '');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');
    const [connectionResult, setConnectionResult] = useState<{success: boolean, message: string} | null>(null);
    const [isPotentiallyRestricted, setIsPotentiallyRestricted] = useState(false);

    useEffect(() => {
        if (window.self !== window.top) {
            setIsPotentiallyRestricted(true);
        }
    }, []);

    const handleSelectProvider = (selectedProvider: 'local' | 'sharedUrl' | 'customApi') => {
        setProvider(selectedProvider);
        if (selectedProvider === 'local') {
            handleLocalConnect();
        } else {
            setStep(3);
        }
    };
    
    const handleLocalConnect = async () => {
        setIsConnecting(true);
        setError('');
        await connectToLocalProvider();
        setIsConnecting(false);
    };

    const handleCloudConnect = async () => {
        setError('');
        setConnectionResult(null);
        setIsConnecting(true);
        
        if (provider === 'customApi') {
            await updateSettings({ customApiUrl: apiConfig.url, customApiKey: apiConfig.key });
        } else if (provider === 'sharedUrl') {
            await updateSettings({ sharedUrl: sharedUrl });
        }
        
        // Use a short delay to ensure settings are updated before testing
        setTimeout(async () => {
            const result = await testAndConnectProvider();
            setConnectionResult(result);
            setIsConnecting(false);
        }, 200);
    };

    const handleFinish = () => {
        completeSetup();
    };

    const handleSkipToLogin = () => {
        completeSetup();
        navigate('/login');
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <MotionDiv key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                        <h2 className="text-2xl font-bold section-heading text-gray-800 dark:text-gray-100">Welcome to Your Kiosk!</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">This quick setup will help you configure how your kiosk data is stored and synced. You can change these settings later in the admin panel.</p>
                        <button onClick={() => setStep(2)} className="btn btn-primary mt-8">
                            Get Started <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </MotionDiv>
                );
            case 2:
                return (
                    <MotionDiv key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100 mb-4 text-center">Choose a Storage Method</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => handleSelectProvider('local')} disabled={isPotentiallyRestricted} className="p-6 border-2 border-transparent rounded-xl text-left bg-gray-100 dark:bg-gray-700/50 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent">
                                <ServerStackIcon className="w-8 h-8 text-indigo-500 mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Local or Network Folder</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Best for offline use or single-store setups.</p>
                                {isPotentiallyRestricted && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Unavailable in this embedded environment.</p>}
                            </button>
                             <button onClick={() => handleSelectProvider('sharedUrl')} className="p-6 border-2 border-transparent rounded-xl text-left bg-gray-100 dark:bg-gray-700/50 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <LinkIcon className="w-8 h-8 text-indigo-500 mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Shared URL / Simple API</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Connect to a web URL. Can be read-only or read/write depending on your server.</p>
                            </button>
                             <button onClick={() => handleSelectProvider('customApi')} className="p-6 border-2 border-transparent rounded-xl text-left bg-gray-100 dark:bg-gray-700/50 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <CodeBracketIcon className="w-8 h-8 text-indigo-500 mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Custom API Sync</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">For advanced users with their own cloud server.</p>
                            </button>
                        </div>
                         <div className="text-center mt-6">
                            <button type="button" onClick={() => setStep('guides')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                Need help? View setup instructions
                            </button>
                        </div>
                        <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button type="button" onClick={handleSkipToLogin} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:underline">
                                Skip for now &amp; go to Admin Login &rarr;
                            </button>
                        </div>
                    </MotionDiv>
                );
            case 3:
                const isConnected = storageProvider !== 'none';
                if (provider === 'local') {
                    return (
                        <MotionDiv key="step3-local" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                            <ServerStackIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100">Local Folder Setup</h2>
                            {isConnecting && <p className="mt-2 text-gray-600 dark:text-gray-400">Awaiting folder selection...</p>}
                            {directoryHandle && (
                                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg text-sm">
                                    Successfully connected to folder: <strong>{directoryHandle.name}</strong>
                                </div>
                            )}
                            <div className="mt-8 flex justify-center gap-4">
                                <button onClick={() => setStep(2)} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Back</button>
                                <button onClick={handleFinish} className="btn btn-primary" disabled={!directoryHandle}>Finish Setup</button>
                            </div>
                        </MotionDiv>
                    );
                }
                const commonCloudContent = (
                    <>
                        <div className="mt-8 flex justify-between items-center">
                            <button onClick={() => {setStep(2); setConnectionResult(null);}} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Back</button>
                            <button onClick={handleFinish} className="btn btn-primary" disabled={!isConnected || isConnecting}>Finish Setup</button>
                        </div>
                         {connectionResult && (
                            <div className={`mt-4 p-3 rounded-lg text-sm ${connectionResult.success ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                                {connectionResult.message}
                            </div>
                         )}
                    </>
                );
                if (provider === 'sharedUrl') {
                    return (
                        <MotionDiv key="step3-sharedurl" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                            <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100 mb-4 text-center">Shared URL / Simple API Setup</h2>
                                <div className="space-y-4">
                                    <div className="mt-2 p-4 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-lg text-sm text-left">
                                        <h4 className="font-semibold">Read/Write vs Read-Only</h4>
                                        <p className="mt-1">
                                            To <strong>push and pull</strong> data, your URL must be a server endpoint that accepts POST requests. For <strong>pull-only</strong> access, you can use a direct link to a <code>database.json</code> file.
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="sharedUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shared URL</label>
                                        <input type="url" id="sharedUrl" value={sharedUrl} onChange={e => setSharedUrl(e.target.value)} placeholder="https://.../database.json" className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4"/>
                                    </div>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                    <button onClick={handleCloudConnect} disabled={isConnecting || !sharedUrl} className="btn btn-primary w-full">
                                        {isConnecting ? 'Testing Connection...' : 'Test & Connect'}
                                    </button>
                                </div>
                            {commonCloudContent}
                        </MotionDiv>
                    );
                }
                if (provider === 'customApi') {
                     return (
                        <MotionDiv key="step3-api" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                             <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100 mb-4 text-center">API Configuration</h2>
                                <div className="space-y-4">
                                     <div>
                                         <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom API URL</label>
                                         <input type="url" id="apiUrl" value={apiConfig.url} onChange={e => setApiConfig(p => ({...p, url: e.target.value}))} placeholder="https://api.yourdomain.com/data" className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                     </div>
                                      <div>
                                         <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom API Key (Optional)</label>
                                         <input type="password" id="apiKey" value={apiConfig.key} onChange={e => setApiConfig(p => ({...p, key: e.target.value}))} placeholder="Enter your secret API key" className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                     </div>
                                     {error && <p className="text-sm text-red-500">{error}</p>}
                                     <button onClick={handleCloudConnect} disabled={isConnecting || !apiConfig.url} className="btn btn-primary w-full">
                                        {isConnecting ? 'Testing Connection...' : 'Test & Connect'}
                                    </button>
                                </div>
                            {commonCloudContent}
                        </MotionDiv>
                    );
                }
                return null;
            case 'guides':
                return (
                     <MotionDiv key="step-guides" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100">Setup Instructions</h2>
                            <button onClick={() => setStep(2)} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 !py-1.5 !px-3">
                                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                Back
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
                             <SetupInstruction title="The Definitive Guide: Cloud Sync with PM2 (Recommended)" defaultOpen>
                                <p><strong>Use this for:</strong> The most powerful and reliable setup. Manage a main admin PC and multiple display kiosks across different locations, all synced together over the internet.</p>
                                <p>This setup uses <strong>PM2</strong>, a professional process manager, to ensure your server and the secure connection run 24/7 and restart automatically.</p>
                                
                                <hr/>
                                <h4>Part 1: Configure Your Central Server (On Your Main PC)</h4>
                                
                                <h5>Step 1.1: One-Time System Installations</h5>
                                <ol>
                                    <li><strong>Install Node.js:</strong> If you don't have it, go to <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">nodejs.org</a>, download and install the <strong>LTS version</strong>. Verify the installation by opening a terminal and running <code>node -v</code> and <code>npm -v</code>.</li>
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
                                    <li>In this setup wizard, choose the <strong>"Custom API Sync"</strong> option.</li>
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
                            </SetupInstruction>
                            <SetupInstruction title="Alternative: How to use a Local or Network Folder">
                                <ol>
                                    <li>Click the <strong>"Connect to Folder"</strong> button on the previous step.</li>
                                    <li>Your browser will ask you to select a folder. Choose a folder on your computer or a shared network drive accessible by other kiosks. Grant permission when prompted.</li>
                                    <li>Once setup is complete and you are in the admin panel, go to the <strong>"System"</strong> tab.</li>
                                    <li>Click <strong>"Save to Drive"</strong> to create a `database.json` file and save all your current product data and assets to the selected folder.</li>
                                    <li>On other kiosks, connect to the same folder and use the <strong>"Load from Drive"</strong> button to get the latest data.</li>
                                </ol>
                            </SetupInstruction>
                        </div>
                    </MotionDiv>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900/90 dark:backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <MotionDiv 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${step === 'guides' ? 'max-w-3xl' : 'max-w-xl'} min-h-[450px] flex flex-col p-8 overflow-hidden transition-all duration-300`}
            >
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
            </MotionDiv>
        </div>
    );
};

export default SetupWizard;
