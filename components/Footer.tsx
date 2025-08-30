import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';
import { UserCircleIcon, CloudSlashIcon } from './Icons.tsx';

const SyncStatusIndicator: React.FC<{ 
    isConnecting: boolean;
    connectionStatus: string;
    handleTestConnection: () => void;
}> = ({ isConnecting, connectionStatus, handleTestConnection }) => {
    const { syncStatus, storageProvider } = useAppContext();

    // Disconnected State
    if (storageProvider === 'none') {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-base font-semibold text-yellow-600 dark:text-yellow-400">
                    <CloudSlashIcon className="h-6 w-6" />
                    <span>Not Connected</span>
                </div>
                {!isConnecting && (
                    <button 
                        onClick={handleTestConnection}
                        className="btn bg-sky-500 hover:bg-sky-600 text-white !py-2 !px-4"
                    >
                       Test Connection & Sync
                    </button>
                )}
                {isConnecting && (
                    <span className="text-sm text-yellow-500 dark:text-yellow-400">{connectionStatus}</span>
                )}
            </div>
        );
    }

    // Connected States
    const statusMap = {
        idle: { text: 'Idle', color: 'text-gray-500 dark:text-gray-400', iconColor: 'bg-gray-400', animate: false },
        pending: { text: 'Unsaved', color: 'text-yellow-600 dark:text-yellow-400', iconColor: 'bg-yellow-500', animate: false },
        syncing: { text: 'Syncing...', color: 'text-blue-600 dark:text-blue-400', iconColor: 'bg-blue-500', animate: true },
        synced: { text: 'Synced', color: 'text-green-600 dark:text-green-400', iconColor: 'bg-green-500', animate: false },
        error: { text: 'Error', color: 'text-red-600 dark:text-red-400', iconColor: 'bg-red-500', animate: false },
    };
    const currentStatus = statusMap[syncStatus];

    return (
        <div className="flex items-center gap-2 text-sm" title={`Sync status: ${currentStatus.text}`}>
            <span className={`relative flex h-3 w-3 rounded-full ${currentStatus.iconColor}`}>
                {currentStatus.animate && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                )}
            </span>
            <span className={`font-semibold ${currentStatus.color}`}>{currentStatus.text}</span>
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
            const conciseMessage = result.message.length > 60 ? 'Connection failed. Check settings.' : result.message;
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
        <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
                 <SyncStatusIndicator 
                    isConnecting={isConnecting}
                    connectionStatus={connectionStatus}
                    handleTestConnection={handleTestConnection}
                />
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
                <Link to="/login" className="btn bg-green-600 hover:bg-green-700 text-white !py-2 !px-4">
                    <UserCircleIcon className="h-5 w-5" />
                    <span>Admin Login</span>
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;