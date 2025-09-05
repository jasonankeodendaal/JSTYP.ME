import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { ServerStackIcon, ChevronDownIcon, LinkIcon, CodeBracketIcon, GoogleDriveIcon, DropboxIcon, OneDriveIcon, SupabaseIcon, FirebaseIcon, VercelIcon, NetlifyIcon, AwsIcon, XanoIcon, BackendlessIcon, XIcon } from '../Icons.tsx';
import { Link } from 'react-router-dom';
import InstallPrompt from '../InstallPrompt.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import type { StorageProvider } from '../../types.ts';
import SetupInstruction from './SetupInstruction.tsx';
import { LocalFolderGuideContent, CloudSyncGuideContent, VercelGuideContent, SupabaseGuideContent, DropboxGuideContent, GoogleDriveGuideContent } from './SetupGuides.tsx';


const MotionDiv = motion.div as any;

interface Provider {
    id: StorageProvider;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'storage' | 'baas' | 'serverless' | 'generic';
    config?: ('url' | 'apiKey' | 'projectId' | 'anonKey')[];
    placeholders?: { url?: string; apiKey?: string; };
    guide: React.FC;
}

const PROVIDERS: Provider[] = [
    { id: 'googleDrive', name: 'Google Drive', description: 'Sync using the Google Drive API.', icon: <GoogleDriveIcon />, category: 'storage', config: ['url', 'apiKey'], placeholders: { url: 'API Endpoint URL', apiKey: 'Access Token' }, guide: GoogleDriveGuideContent },
    { id: 'dropbox', name: 'Dropbox', description: 'Connect to a Dropbox app for file syncing.', icon: <DropboxIcon />, category: 'storage', config: ['url', 'apiKey'], placeholders: { url: 'API Endpoint URL', apiKey: 'Access Token' }, guide: DropboxGuideContent },
    { id: 'onedrive', name: 'OneDrive', description: 'Use Microsoft OneDrive via the Graph API.', icon: <OneDriveIcon />, category: 'storage', config: ['url', 'apiKey'], placeholders: { url: 'MS Graph Endpoint', apiKey: 'Access Token' }, guide: GoogleDriveGuideContent }, // Similar setup to Google Drive
    { id: 'supabase', name: 'Supabase', description: 'Connect to a Supabase project for a powerful PostgreSQL backend.', icon: <SupabaseIcon />, category: 'baas', config: ['url', 'apiKey'], placeholders: { url: 'Project URL', apiKey: 'Anon Key' }, guide: SupabaseGuideContent },
    { id: 'firebase', name: 'Firebase', description: 'Utilize Firebase Realtime Database for live data syncing.', icon: <FirebaseIcon />, category: 'baas', config: ['url', 'apiKey'], placeholders: { url: 'Database URL', apiKey: 'Web API Key' }, guide: CloudSyncGuideContent },
    { id: 'xano', name: 'Xano', description: 'Connect to a Xano no-code backend instance.', icon: <XanoIcon />, category: 'baas', config: ['url', 'apiKey'], placeholders: { url: 'API Group Base URL' }, guide: CloudSyncGuideContent },
    { id: 'backendless', name: 'Backendless', description: 'Use Backendless as your scalable backend solution.', icon: <BackendlessIcon />, category: 'baas', config: ['url', 'apiKey'], placeholders: { url: 'API Host URL', apiKey: 'REST API Key' }, guide: CloudSyncGuideContent },
    { id: 'vercel', name: 'Vercel', description: 'Sync with a serverless function deployed on Vercel.', icon: <VercelIcon />, category: 'serverless', config: ['url', 'apiKey'], placeholders: { url: 'Function Endpoint URL' }, guide: VercelGuideContent },
    { id: 'netlify', name: 'Netlify', description: 'Connect to a Netlify Function for backend logic.', icon: <NetlifyIcon />, category: 'serverless', config: ['url', 'apiKey'], placeholders: { url: 'Function Endpoint URL' }, guide: CloudSyncGuideContent },
    { id: 'aws', name: 'AWS Lambda', description: 'Use an AWS Lambda function via API Gateway.', icon: <AwsIcon />, category: 'serverless', config: ['url', 'apiKey'], placeholders: { url: 'API Gateway URL', apiKey: 'API Key (optional)' }, guide: CloudSyncGuideContent },
];

const AdminStorage: React.FC = () => {
    const { 
        connectToLocalProvider,
        testAndConnectProvider,
        disconnectFromStorage,
        storageProvider,
        directoryHandle,
        loggedInUser,
        settings,
        updateSettings,
        connectToCloudProvider,
        connectToSharedUrl
    } = useAppContext();

    const [isConnecting, setIsConnecting] = useState(false);
    const [isPotentiallyRestricted, setIsPotentiallyRestricted] = useState(false);
    const [modalState, setModalState] = useState<{ isOpen: boolean; provider: Provider | null }>({ isOpen: false, provider: null });
    const [guideProvider, setGuideProvider] = useState<Provider | null>(null);
    
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
        setIsConnecting(true);
        await connectToLocalProvider();
        setIsConnecting(false);
    };
    
    const getProviderDetails = () => {
        const providerData = PROVIDERS.find(p => p.id === storageProvider);
        const genericName = { local: 'Local Folder', customApi: 'Custom API', sharedUrl: 'Shared URL' }[storageProvider] || 'Provider';
        const genericIcon = { local: <ServerStackIcon className="h-8 w-8" />, customApi: <CodeBracketIcon className="h-8 w-8" />, sharedUrl: <LinkIcon className="h-8 w-8" /> }[storageProvider];
        
        return {
            icon: providerData?.icon || genericIcon || <ServerStackIcon className="h-8 w-8" />,
            title: providerData?.name || genericName,
            name: {
                local: directoryHandle?.name,
                customApi: settings.customApiUrl,
                sharedUrl: settings.sharedUrl,
            }[storageProvider] || settings.customApiUrl,
        };
    }

    const renderProviderSelection = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Connect a Storage Provider</h3>
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
            
            <ProviderSection title="Local Storage">
                 <ProviderCard 
                    provider={{ id: 'local', name: 'Local or Network Folder', description: 'Store all data in a folder on your computer. Ideal for offline use.', icon: <ServerStackIcon className="h-8 w-8" />, category: 'generic', guide: LocalFolderGuideContent }}
                    onConnectClick={handleLocalConnect} 
                    onGuideClick={() => setGuideProvider({id: 'local', name: 'Local Folder', guide: LocalFolderGuideContent} as Provider)}
                    disabled={isPotentiallyRestricted || isConnecting}
                    ctaText={isConnecting ? 'Connecting...' : 'Connect to Folder'}
                />
            </ProviderSection>

            <ProviderSection title="Cloud Storage">
                {PROVIDERS.filter(p => p.category === 'storage').map(p => <ProviderCard key={p.id} provider={p} onConnectClick={() => setModalState({ isOpen: true, provider: p})} onGuideClick={() => setGuideProvider(p)} disabled={isConnecting} />)}
            </ProviderSection>

            <ProviderSection title="Backend Platforms (BaaS & Low-Code)">
                {PROVIDERS.filter(p => p.category === 'baas').map(p => <ProviderCard key={p.id} provider={p} onConnectClick={() => setModalState({ isOpen: true, provider: p})} onGuideClick={() => setGuideProvider(p)} disabled={isConnecting} />)}
            </ProviderSection>
            
            <ProviderSection title="Serverless Functions">
                 {PROVIDERS.filter(p => p.category === 'serverless').map(p => <ProviderCard key={p.id} provider={p} onConnectClick={() => setModalState({ isOpen: true, provider: p})} onGuideClick={() => setGuideProvider(p)} disabled={isConnecting} />)}
            </ProviderSection>
            
             <ProviderSection title="Generic Connectors">
                <ProviderCard provider={{ id: 'sharedUrl', name: 'Shared URL / Simple API', description: 'Connect to a simple cloud endpoint, like a static JSON file.', icon: <LinkIcon className="h-8 w-8" />, category: 'generic', config: ['url'], placeholders: { url: 'https://.../database.json' }, guide: CloudSyncGuideContent }} onConnectClick={() => setModalState({ isOpen: true, provider: PROVIDERS.find(p=>p.id === 'sharedUrl') || { id: 'sharedUrl', name: 'Shared URL', description: '', icon: <LinkIcon />, category: 'generic', config: ['url'], placeholders: { url: 'https://.../database.json' }, guide: CloudSyncGuideContent } })} onGuideClick={() => setGuideProvider({id: 'sharedUrl', name: 'Shared URL', guide: CloudSyncGuideContent} as Provider)} disabled={isConnecting} />
                <ProviderCard provider={{ id: 'customApi', name: 'Custom API Endpoint', description: 'For advanced users. Sync with your own backend API.', icon: <CodeBracketIcon className="h-8 w-8" />, category: 'generic', config: ['url', 'apiKey'], placeholders: { url: 'https://api.yourdomain.com/data' }, guide: CloudSyncGuideContent }} onConnectClick={() => setModalState({ isOpen: true, provider: PROVIDERS.find(p=>p.id === 'customApi') || { id: 'customApi', name: 'Custom API Endpoint', description: '', icon: <CodeBracketIcon />, category: 'generic', config: ['url', 'apiKey'], guide: CloudSyncGuideContent } })} onGuideClick={() => setGuideProvider({id: 'customApi', name: 'Custom API', guide: CloudSyncGuideContent} as Provider)} disabled={isConnecting} />
            </ProviderSection>
        </div>
    );

    return (
        <div className="space-y-6">
            <ConnectionModal
                isOpen={modalState.isOpen}
                provider={modalState.provider}
                onClose={() => setModalState({ isOpen: false, provider: null })}
                onShowGuide={() => {
                    setGuideProvider(modalState.provider);
                    setModalState({ isOpen: false, provider: null });
                }}
            />
            <GuideModal
                provider={guideProvider}
                onClose={() => setGuideProvider(null)}
            />
            
            {storageProvider !== 'none' ? <ConnectedCard {...getProviderDetails()!} onDisconnect={() => disconnectFromStorage()} /> : renderProviderSelection()}
            
            <details id="api-settings-section" className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700/50">
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Sync & API Settings</h3>
                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                        <ChevronDownIcon className="w-5 h-5"/>
                    </div>
                </summary>
                <div className="divide-y divide-gray-200 dark:divide-gray-700 px-4 sm:px-5">
                    <div className="py-5 grid grid-cols-3 gap-4 items-center">
                        <div className="col-span-1">
                            <label htmlFor="autoSyncEnabled-toggle" className="block text-sm font-medium text-gray-800 dark:text-gray-200">Enable Auto-Sync</label>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Automatically push changes and check for updates when connected to a provider.</p>
                        </div>
                        <div className="mt-0 col-span-2 flex justify-end">
                             <label htmlFor="autoSyncEnabled-toggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="autoSyncEnabled-toggle"
                                        className="sr-only peer"
                                        checked={settings.sync.autoSyncEnabled}
                                        onChange={(e) => updateSettings({ sync: { ...settings.sync, autoSyncEnabled: e.target.checked }})}
                                    />
                                    <div className="block w-14 h-8 rounded-full transition-colors bg-gray-300 dark:bg-gray-600 peer-checked:bg-indigo-500"></div>
                                    <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                     <div className="py-5 grid grid-cols-3 gap-4 items-center">
                        <div className="col-span-1">
                            <label htmlFor="customApiUrl" className="block text-sm font-medium text-gray-800 dark:text-gray-200">Custom API URL</label>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Endpoint for all API-based connectors.</p>
                        </div>
                        <div className="mt-0 col-span-2">
                             <input
                                type="url"
                                id="customApiUrl"
                                value={settings.customApiUrl}
                                onChange={(e) => updateSettings({ customApiUrl: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm py-2 px-3"
                                placeholder="https://api.yourdomain.com/data"
                            />
                        </div>
                    </div>
                     <div className="py-5 grid grid-cols-3 gap-4 items-center">
                        <div className="col-span-1">
                            <label htmlFor="customApiKey" className="block text-sm font-medium text-gray-800 dark:text-gray-200">Custom API Auth Key</label>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Secret key for your custom API.</p>
                        </div>
                        <div className="mt-0 col-span-2">
                            <input
                                type="password"
                                id="customApiKey"
                                value={settings.customApiKey}
                                onChange={(e) => updateSettings({ customApiKey: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm py-2 px-3"
                                placeholder="Enter your secret API key"
                            />
                        </div>
                    </div>
                </div>
            </details>

            <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700/50">
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">PWA Installation</h3>
                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                        <ChevronDownIcon className="w-5 h-5"/>
                    </div>
                </summary>
                <div className="px-4 sm:px-5 py-5 border-t border-gray-200/80 dark:border-gray-700/50">
                    <InstallPrompt />
                </div>
            </details>
        </div>
    );
};

// --- Sub-components ---

const ProviderSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children}
        </div>
    </div>
);

const ProviderCard: React.FC<{ provider: Provider; onConnectClick: () => void; onGuideClick: () => void; disabled?: boolean, ctaText?: string; }> = ({ provider, onConnectClick, onGuideClick, disabled = false, ctaText = 'Connect' }) => (
    <div className={`relative bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-lg border dark:border-gray-700/50 flex flex-col items-center text-center transition-all duration-300 ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1'}`}>
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 mb-3">{provider.icon}</div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 item-title">{provider.name}</h4>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex-grow">{provider.description}</p>
        <div className="mt-auto pt-4 w-full flex flex-col sm:flex-row gap-2">
            <button onClick={onGuideClick} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 !py-1.5 !text-sm flex-1">View Guide</button>
            <button onClick={onConnectClick} className="btn btn-primary !py-1.5 !text-sm flex-1" disabled={disabled}>{ctaText}</button>
        </div>
    </div>
);

const ConnectedCard: React.FC<{ icon: React.ReactNode; title: string; onDisconnect: () => void; name?: string; }> = ({ icon, title, onDisconnect, name }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border-l-4 border-green-500 dark:border-green-500">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">{icon}</div>
            <div className="flex-grow min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">Connected to</p>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h4>
                <p className="mt-1 text-sm text-green-700 dark:text-green-400 font-medium truncate" title={name}>{name ? `Active: ${name}` : `Your assets are managed by ${title}.`}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0"><button onClick={onDisconnect} className="btn btn-destructive">Disconnect</button></div>
        </div>
    </div>
);

const ConnectionModal: React.FC<{ isOpen: boolean; provider: Provider | null; onClose: () => void; onShowGuide: () => void; }> = ({ isOpen, provider, onClose, onShowGuide }) => {
    const { settings, updateSettings, connectToCloudProvider, connectToSharedUrl, testAndConnectProvider } = useAppContext();
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionResult, setConnectionResult] = useState<{success: boolean, message: string} | null>(null);
    const [config, setConfig] = useState({ url: settings.customApiUrl, apiKey: settings.customApiKey });

    useEffect(() => {
        if (isOpen) {
            setConfig({ url: settings.customApiUrl, apiKey: settings.customApiKey });
            if (provider?.id === 'sharedUrl') setConfig(c => ({...c, url: settings.sharedUrl || ''}));
            setConnectionResult(null);
        }
    }, [isOpen, provider, settings]);

    const handleConnect = async () => {
        if (!provider) return;
        setConnectionResult(null);
        setIsConnecting(true);

        await updateSettings({ customApiUrl: config.url, customApiKey: config.apiKey });
        if (provider.id === 'sharedUrl') {
            await updateSettings({ sharedUrl: config.url });
            connectToSharedUrl(config.url);
        } else {
            connectToCloudProvider(provider.id);
        }

        setTimeout(async () => {
            const result = await testAndConnectProvider();
            setConnectionResult(result);
            setIsConnecting(false);
            if (result.success) setTimeout(onClose, 1500);
        }, 200);
    };

    if (!provider) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                    <MotionDiv initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 flex items-center justify-center">{provider.icon}</div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 section-heading">Connect to {provider.name}</h2>
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                        </header>
                        <div className="p-6 space-y-4">
                            <p className="text-sm p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-lg">
                                Follow the <button onClick={onShowGuide} className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-100">setup guide</button> to get the required credentials for {provider.name}.
                            </p>
                            {provider.config?.includes('url') && <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{provider.placeholders?.url || 'API/Endpoint URL'}</label><input type="url" value={config.url} onChange={e => setConfig(c => ({...c, url: e.target.value}))} placeholder={provider.placeholders?.url} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3"/></div>}
                            {provider.config?.includes('apiKey') && <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{provider.placeholders?.apiKey || 'API Key / Token'}</label><input type="password" value={config.apiKey} onChange={e => setConfig(c => ({...c, apiKey: e.target.value}))} placeholder={provider.placeholders?.apiKey} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3"/></div>}
                            
                            {connectionResult && <div className={`p-3 rounded-lg text-sm ${connectionResult.success ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>{connectionResult.message}</div>}
                        </div>
                        <footer className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                            <button onClick={onClose} type="button" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                            <button onClick={handleConnect} type="button" className="btn btn-primary" disabled={isConnecting || !config.url}>{isConnecting ? 'Testing...' : 'Test & Connect'}</button>
                        </footer>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

const GuideModal: React.FC<{ provider: Provider | null, onClose: () => void }> = ({ provider, onClose }) => {
    if (!provider) return null;
    const GuideContent = provider.guide;
    return (
        <AnimatePresence>
            {provider && (
                 <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
                    <MotionDiv initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] border border-gray-200 dark:border-gray-700 flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                         <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 section-heading">Setup Guide: {provider.name}</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                        </header>
                        <main className="flex-grow p-6 overflow-y-auto">
                            <SetupInstruction title="Step-by-Step Instructions" defaultOpen>
                                <GuideContent />
                            </SetupInstruction>
                        </main>
                         <footer className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                            <button onClick={onClose} type="button" className="btn btn-primary">Close</button>
                        </footer>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default AdminStorage;