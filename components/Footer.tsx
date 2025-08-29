import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';

const SyncStatusIndicator: React.FC = () => {
    const { syncStatus, storageProvider } = useAppContext();

    if (storageProvider === 'none') {
        return (
            <div className="flex items-center gap-2 text-xs opacity-60">
                 <span className="relative flex h-2.5 w-2.5 rounded-full bg-gray-400" title="Storage not connected"></span>
                <span>Not Connected</span>
            </div>
        )
    }

    const statusMap = {
        idle: { text: 'Idle', color: 'bg-gray-400', animate: false },
        pending: { text: 'Unsaved', color: 'bg-yellow-500', animate: false },
        syncing: { text: 'Syncing...', color: 'bg-blue-500', animate: true },
        synced: { text: 'Synced', color: 'bg-green-500', animate: false },
        error: { text: 'Error', color: 'bg-red-500', animate: false },
    };
    const currentStatus = statusMap[syncStatus];

    return (
        <div className="flex items-center gap-2 text-xs opacity-80" title={`Sync status: ${currentStatus.text}`}>
            <span className={`relative flex h-2.5 w-2.5 rounded-full ${currentStatus.color}`}>
                {currentStatus.animate && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                )}
            </span>
            <span>Sync: {currentStatus.text}</span>
        </div>
    );
};

const Footer: React.FC = () => {
  const { settings, storageProvider, testAndConnectProvider } = useAppContext();
  const footerSettings = settings.footer;

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  const handleTestConnection = async () => {
        setIsConnecting(true);
        setConnectionStatus('Testing...');
        const result = await testAndConnectProvider();
        
        if (result.success) {
            setConnectionStatus('Connected!');
            // Button disappears automatically, no need to reset state here
        } else {
            // Show a concise error message for a few seconds
            const conciseMessage = result.message.length > 60 ? 'Connection failed. Check settings in admin panel.' : result.message;
            setConnectionStatus(conciseMessage);
            setTimeout(() => {
                setConnectionStatus('');
                setIsConnecting(false);
            }, 6000);
        }
    };

  const footerStyle: React.CSSProperties = {
    backgroundColor: footerSettings?.backgroundColor,
    color: footerSettings?.textColor,
    fontFamily: footerSettings?.typography?.fontFamily ?? 'inherit',
    fontWeight: footerSettings?.typography?.fontWeight ?? 'inherit',
    fontStyle: footerSettings?.typography?.fontStyle ?? 'inherit',
    textDecoration: footerSettings?.typography?.textDecoration ?? 'inherit',
    position: 'relative',
    overflow: 'hidden',
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: footerSettings?.backgroundImageUrl ? `url(${footerSettings.backgroundImageUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: footerSettings?.backgroundImageOpacity,
    zIndex: -1,
  };

  return (
    <footer className="border-t border-gray-200/50 mt-auto" style={footerStyle}>
      <div style={backgroundStyle}></div>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="sm:flex sm:items-center sm:justify-between">
            <p className="text-center sm:text-left text-sm">
                &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
            <div className="mt-2 text-center sm:mt-0 sm:text-right flex flex-col items-center sm:items-end">
                <Link to="/login" className="text-sm opacity-80 hover:opacity-100 hover:underline transition-opacity">
                    Admin Login
                </Link>
                <div className="flex items-center gap-3 mt-1">
                    <SyncStatusIndicator />
                     {storageProvider === 'none' && !isConnecting && (
                        <button 
                            onClick={handleTestConnection}
                            className="text-xs font-semibold text-blue-500 dark:text-blue-400 hover:underline transition-all"
                        >
                           Test Connection & Sync
                        </button>
                    )}
                    {isConnecting && (
                        <span className="text-xs text-yellow-500 dark:text-yellow-400">{connectionStatus}</span>
                    )}
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;