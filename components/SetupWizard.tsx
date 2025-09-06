import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './context/AppContext.tsx';
import { ServerStackIcon, ChevronRightIcon, LinkIcon, ChevronLeftIcon, SparklesIcon, CubeIcon, BookOpenIcon, CloudSlashIcon, PaintBrushIcon, ChartBarIcon, ClipboardDocumentListIcon, ArrowPathIcon, SignalIcon, CircleStackIcon, UsersIcon, PlayIcon, PauseIcon, StopIcon } from './Icons.tsx';
import { useNavigate } from 'react-router-dom';
import SetupInstruction from './Admin/SetupInstruction.tsx';
import { LocalFolderGuideContent, CloudSyncGuideContent, VercelGuideContent, SupabaseGuideContent } from './Admin/SetupGuides.tsx';

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

const FeatureItem: React.FC<{icon: React.ReactNode, title: string, children: React.ReactNode}> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
            <p className="text-sm">{children}</p>
        </div>
    </div>
);

// --- Reusable About System Component ---
interface AboutSystemProps {
    onBack?: () => void;
    isDashboard?: boolean;
}

export const AboutSystem: React.FC<AboutSystemProps> = ({ onBack, isDashboard = false }) => {
    const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const speak = useCallback(() => {
        if (!contentRef.current) {
            console.error("Content ref not available for TTS");
            return;
        }

        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
        }

        const elementsToRead = contentRef.current.querySelectorAll('[data-speech]');
        const textToSpeak = Array.from(elementsToRead).map(el => el.textContent?.trim()).join('. ');
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utteranceRef.current = utterance;

        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = voices.find(v => v.name === 'Google US English' && v.lang.startsWith('en')) || null;
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en-US')) || null;
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en')) || null;
        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.onstart = () => setSpeechState('playing');
        utterance.onend = () => {
            setSpeechState('idle');
            utteranceRef.current = null;
        };
        utterance.onpause = () => setSpeechState('paused');
        utterance.onresume = () => setSpeechState('playing');
        utterance.onerror = (event) => {
            console.error('TTS Error:', event.error);
            setSpeechState('idle');
            utteranceRef.current = null;
        };

        window.speechSynthesis.speak(utterance);
    }, [contentRef]);

    const handlePlay = useCallback(() => {
        if (speechState === 'paused' && utteranceRef.current) {
            window.speechSynthesis.resume();
            return;
        }

        if (window.speechSynthesis.getVoices().length > 0) {
            speak();
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                speak();
                window.speechSynthesis.onvoiceschanged = null;
            };
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
            window.speechSynthesis.cancel();
        }
    }, [speak, speechState]);

    const handlePause = () => {
        window.speechSynthesis.pause();
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setSpeechState('idle');
        utteranceRef.current = null;
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);
    
    return (
        <div ref={contentRef}>
            <div className="flex justify-between items-center mb-4">
                <h2 data-speech className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100">About the System</h2>
                {onBack && (
                     <button onClick={onBack} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 !py-1.5 !px-3">
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Back
                    </button>
                )}
            </div>
            <div className={`space-y-10 ${!isDashboard ? 'max-h-[calc(100vh-220px)]' : ''} overflow-y-auto pr-2 text-left text-gray-600 dark:text-gray-300`}>
                
                <div className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Listen to this section:</p>
                    <div className="flex items-center gap-2">
                        {speechState !== 'playing' ? (
                            <button onClick={handlePlay} className="btn btn-primary !p-2" title="Play"><PlayIcon className="w-5 h-5"/></button>
                        ) : (
                            <button onClick={handlePause} className="btn btn-primary !p-2" title="Pause"><PauseIcon className="w-5 h-5"/></button>
                        )}
                        <button onClick={handleStop} className="btn btn-secondary !p-2" title="Stop" disabled={speechState === 'idle'}><StopIcon className="w-5 h-5"/></button>
                    </div>
                </div>

                <div>
                   <h3 data-speech className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 section-heading">A Strategic In-Store Platform</h3>
                   <p data-speech>This is not just a digital sign; it's a comprehensive, self-hosted digital kiosk platform meticulously engineered to bridge the gap between your online presence and your physical retail space. It empowers you to transform passive browsing into an active, immersive brand experience. Create rich product showcases that captivate and inform, leverage powerful analytics to understand customer behavior, and streamline your sales process—all through a robust system that functions perfectly with or without an internet connection.</p>
                </div>
                
                <div>
                    <h3 data-speech className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading">Core Capabilities at a Glance</h3>
                    <div className="space-y-6">
                         <FeatureItem icon={<CubeIcon className="w-5 h-5"/>} title="The 'Endless Aisle' Product Showcase">
                            <span data-speech>Overcome the limitations of physical floor space. Go beyond static displays by presenting products with stunning galleries, engaging videos, full technical specifications, and downloadable PDFs. For example, a furniture store can showcase a sofa in every available fabric, even if only one is on the floor.</span>
                        </FeatureItem>
                         <FeatureItem icon={<BookOpenIcon className="w-5 h-5"/>} title="Interactive Digital Catalogues & Pamphlets">
                            <span data-speech>Transition your print marketing into a dynamic, cost-effective digital format. Upload entire catalogues with an elegant page-turning effect, and use the built-in scheduler to automate promotional pamphlets, saving thousands in printing costs and ensuring your marketing is always current.</span>
                        </FeatureItem>
                         <FeatureItem icon={<CloudSlashIcon className="w-5 h-5"/>} title="Unbreakable Offline-First Reliability">
                            <span data-speech>Engineered for the demanding realities of retail where Wi-Fi can be unstable. The kiosk operates flawlessly offline, ensuring a smooth customer experience at all times. This makes it perfect for trade shows, pop-up shops, or stores with inconsistent internet connectivity.</span>
                        </FeatureItem>
                         <FeatureItem icon={<PaintBrushIcon className="w-5 h-5"/>} title="Deep Brand Customization Engine">
                            <span data-speech>Your brand is unique, and your kiosk should be too. Exercise granular control over the entire UI, from color palettes and Google Fonts to layout styles and button shapes. The result is a kiosk that looks and feels like a bespoke application, perfectly aligned with your brand identity.</span>
                        </FeatureItem>
                         <FeatureItem icon={<ChartBarIcon className="w-5 h-5"/>} title="Actionable Customer Analytics">
                            <span data-speech>Gain invaluable insights into what's popular in your store. The system tracks which brands and products receive the most interactions, providing you with hard data to optimize store layouts, inform inventory decisions, and refine your marketing strategies for maximum impact.</span>
                        </FeatureItem>
                         <FeatureItem icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} title="Integrated Quote Generation Workflow">
                            <span data-speech>Turn browsing interest into a sales lead instantly. An admin-protected workflow allows your staff to build a quote with a client, enter their details, and immediately print a professional, branded document. This streamlines the sales process for high-value items or B2B clients.</span>
                        </FeatureItem>
                    </div>
                </div>
                 <div>
                    <h3 data-speech className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading">System Architecture & Data Flow</h3>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-sm">
                        <p data-speech className="mb-4">The system is built on a powerful <strong>"Local-First"</strong> architecture. This means every kiosk is a self-sufficient powerhouse, ensuring maximum speed and 100% offline functionality. Syncing is an optional, powerful layer on top.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50">
                                <h4 className="font-semibold text-base">1. Admin Backend</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Where you manage everything.</p>
                                <div className="my-4 text-indigo-500"><UsersIcon className="mx-auto w-8 h-8"/></div>
                                <ul className="text-xs text-left list-disc list-inside space-y-1"><li>Manage Products & Brands</li><li>Create Catalogues</li><li>Design Screensavers</li><li>Customize Appearance</li><li>View Analytics</li></ul>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50 relative">
                                <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-2xl text-gray-400 max-md:hidden">&rarr;</div>
                                <div className="absolute top-1/2 -right-3 -translate-y-1/2 text-2xl text-gray-400 max-md:hidden">&harr;</div>
                                <h4 className="font-semibold text-base">2. Local Kiosk Engine</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">The core of each device.</p>
                                <div className="my-4 text-indigo-500"><SignalIcon className="mx-auto w-8 h-8"/></div>
                                <ul className="text-xs text-left list-disc list-inside space-y-1"><li><strong>Local Database:</strong> All data is stored locally for instant access.</li><li><strong>Asset Cache:</strong> Images & videos are saved on-device.</li><li><strong>Public Interface:</strong> The fast, touch-friendly experience customers use.</li><li><strong>100% Offline Capable.</strong></li></ul>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50">
                                 <h4 className="font-semibold text-base">3. Optional Sync Provider</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">The central "source of truth".</p>
                                <div className="my-4 text-indigo-500"><ServerStackIcon className="mx-auto w-8 h-8"/></div>
                                 <ul className="text-xs text-left list-disc list-inside space-y-1"><li>Local Folder / Network Drive</li><li>Cloud Server (Self-Hosted)</li><li>Enables multi-kiosk sync</li><li>Provides data backup</li></ul>
                            </div>
                        </div>
                    </div>
                </div>
                 <div>
                    <h3 data-speech className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading">Real-World Scenarios & Use Cases</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                            <h4 data-speech className="font-semibold text-gray-800 dark:text-gray-100">Scenario: The High-End Fashion Boutique</h4>
                            <p data-speech className="text-sm mt-1">A boutique uses the kiosk to create an <strong>"endless aisle."</strong> A single dress is on display, but the kiosk shows it in all 15 available colors and patterns, with videos of it on the runway. The screensaver acts as a dynamic, high-fashion lookbook, showcasing curated collections that can be updated daily without any printing costs.</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                            <h4 data-speech className="font-semibold text-gray-800 dark:text-gray-100">Scenario: The B2B Industrial Supplier</h4>
                            <p data-speech className="text-sm mt-1">At a trade show with unreliable Wi-Fi, a supplier uses the kiosk in <strong>offline mode</strong>. Sales staff can browse thousands of complex parts with clients, view technical PDF spec sheets, and use the <strong>Quote Generation</strong> feature to instantly create and save a quote for a client, capturing the lead on the spot.</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                            <h4 data-speech className="font-semibold text-gray-800 dark:text-gray-100">Scenario: The Premium Appliance Store Franchise</h4>
                            <p data-speech className="text-sm mt-1">A franchise with 10 locations uses a central <strong>Cloud Sync</strong> server. The head office updates pricing and adds a new product line. The changes are pushed to the server, and all 10 kiosks automatically pull the update overnight. The <strong>Analytics</strong> feature reveals that a specific fridge model is the most viewed item in every store, influencing a nationwide promotion.</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 data-speech className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-3 section-heading">Why You Need This System</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li data-speech><strong>Turn Browsers into Buyers:</strong> This system acts as your best, most knowledgeable salesperson, available 24/7. It captures customer attention with a dynamic, touch-driven experience, encouraging deep exploration of your products and creating more up-selling opportunities.</li>
                        <li data-speech><strong>Create an "Endless Aisle":</strong> Never be limited by physical floor space again. Display your entire inventory, including different colors, sizes, and online-exclusive items, giving your customers access to everything you offer, not just what's on the shelf.</li>
                        <li data-speech><strong>Achieve Perfect Brand Consistency:</strong> Ensure your brand message is professional and consistent across all locations. A centrally managed digital platform means updates are instant and universal, eliminating the risk of outdated or off-brand displays.</li>
                        <li data-speech><strong>Drastically Reduce Operational Costs:</strong> Save significant money and become more sustainable by eliminating the recurring costs and waste associated with printing, distributing, and replacing static marketing materials.</li>
                        <li data-speech><strong>Dominate the Modern Retail Landscape:</strong> Position your brand as innovative, tech-savvy, and customer-centric. In a competitive market, a premium in-store digital experience is not just a luxury—it's a critical tool for setting yourself apart and building lasting customer loyalty.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};


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
    const [step, setStep] = useState<number | 'guides' | 'info'>(1);
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
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                            <button onClick={() => setStep(2)} className="btn btn-primary w-full sm:w-auto">
                                Get Started <ChevronRightIcon className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setStep('info')} className="btn btn-secondary w-full sm:w-auto">
                                Learn More
                            </button>
                        </div>
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
                                    <div className="mt-2 p-4 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-lg text-sm text-left">
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
                             <SetupInstruction title="Cloud Sync with a PC Server (Recommended)" defaultOpen>
                                <CloudSyncGuideContent />
                            </SetupInstruction>
                            <SetupInstruction title="Local or Network Folder Setup">
                                <LocalFolderGuideContent />
                            </SetupInstruction>
                            <SetupInstruction title="Advanced: Deploying to Vercel">
                                <VercelGuideContent />
                            </SetupInstruction>
                             <SetupInstruction title="Advanced: Deploying to Supabase">
                                <SupabaseGuideContent />
                            </SetupInstruction>
                        </div>
                    </MotionDiv>
                );
             case 'info':
                return (
                    <MotionDiv key="step-info" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <AboutSystem onBack={() => setStep(1)} />
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
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${step === 'guides' || step === 'info' ? 'max-w-3xl' : 'max-w-xl'} min-h-[450px] flex flex-col p-8 overflow-hidden transition-all duration-300`}
            >
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
            </MotionDiv>
        </div>
    );
};

export default SetupWizard;