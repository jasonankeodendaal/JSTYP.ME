import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { ServerStackIcon, ChevronDownIcon, LinkIcon } from '../Icons.tsx';
import { Link } from 'react-router-dom';
import InstallPrompt from '../InstallPrompt.tsx';

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
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <div className="mt-auto pt-6 w-full">
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

const AdminStorage: React.FC = () => {
    const { 
        connectToLocalProvider,
        testAndConnectProvider,
        disconnectFromStorage,
        storageProvider,
        directoryHandle,
        loggedInUser,
        settings,
        updateSettings
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(false);
    const [isPotentiallyRestricted, setIsPotentiallyRestricted] = useState(false);
    const [sharedUrl, setSharedUrl] = useState(settings.sharedUrl || '');
    const [connectionResult, setConnectionResult] = useState<{success: boolean, message: string} | null>(null);
    
    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSystem;

    useEffect(() => {
        if (window.self !== window.top) {
            setIsPotentiallyRestricted(true);
        }
    }, []);
    
    useEffect(() => {
        setSharedUrl(settings.sharedUrl || '');
    }, [settings.sharedUrl]);

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

    const handleCloudConnect = async (provider: 'customApi' | 'sharedUrl') => {
        setConnectionResult(null);
        setIsLoading(true);
        
        if (provider === 'sharedUrl') {
            await updateSettings({ sharedUrl: sharedUrl });
        }
        
        // Use a short delay to ensure settings are updated before testing
        setTimeout(async () => {
            const result = await testAndConnectProvider();
            setConnectionResult(result);
            setIsLoading(false);
        }, 200);
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
                    name: settings.customApiUrl,
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
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
                        <button onClick={() => handleCloudConnect('sharedUrl')} className="btn btn-primary w-full max-w-xs mx-auto" disabled={isLoading || !sharedUrl}>
                            {isLoading ? 'Testing...' : 'Test & Connect'}
                        </button>
                    </div>
                </ProviderCard>
                 <ProviderCard
                    icon={<CodeBracketIcon className="h-8 w-8" />}
                    title="Custom API Sync"
                    description="For advanced users. Sync data with your own backend API (e.g., the provided Node.js server)."
                    disabled={isLoading}
                >
                    <button onClick={() => handleCloudConnect('customApi')} className="btn btn-primary w-full max-w-xs mx-auto" disabled={isLoading}>
                        {isLoading ? 'Testing...' : 'Test & Connect'}
                    </button>
                </ProviderCard>
            </div>
            {connectionResult && (
                 <div className={`mt-4 p-3 rounded-lg text-sm ${connectionResult.success ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                    {connectionResult.message}
                </div>
            )}
        </>
    );

    return (
        <div className="space-y-6">
            
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
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Endpoint for the 'Custom API Sync' provider.</p>
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

export default AdminStorage;
