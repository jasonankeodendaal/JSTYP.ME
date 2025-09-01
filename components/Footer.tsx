import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';
import { UserCircleIcon, CheckIcon, CloudSlashIcon } from './Icons.tsx';

const SyncStatusIndicator: React.FC = () => {
    const { syncStatus, storageProvider, lastUpdated } = useAppContext();

    if (storageProvider === 'none') {
        return (
            <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600 dark:text-yellow-400" title="Not connected to any storage provider.">
                <CloudSlashIcon className="h-5 w-5" />
                <span>Not Connected</span>
            </div>
        );
    }
    
    const providerName = {
        local: 'Local Folder',
        customApi: 'Custom API',
        sharedUrl: 'Shared URL',
        googleDrive: 'Google Drive',
        none: 'None'
    }[storageProvider];

    const getStatusDetails = () => {
        switch (syncStatus) {
            case 'idle':
                return { text: 'Idle', color: 'text-gray-500 dark:text-gray-400', icon: <div className="w-3 h-3 rounded-full bg-gray-400" /> };
            case 'pending':
                return { text: 'Unsaved Changes', color: 'text-yellow-600 dark:text-yellow-400', icon: <div className="w-3 h-3 rounded-full bg-yellow-500" /> };
            case 'syncing':
                return { text: 'Syncing...', color: 'text-blue-600 dark:text-blue-400', icon: <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div> };
            case 'synced':
                return { text: 'Synced', color: 'text-green-600 dark:text-green-400', icon: <CheckIcon className="h-4 w-4 text-green-500" /> };
            case 'error':
                return { text: 'Sync Error', color: 'text-red-600 dark:text-red-400', icon: <div className="w-3 h-3 rounded-full bg-red-500" /> };
            default:
                return { text: 'Unknown', color: 'text-gray-500', icon: null };
        }
    };

    const { text, color, icon } = getStatusDetails();
    const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : null;
    const formattedDate = lastUpdatedDate ? `${lastUpdatedDate.toLocaleDateString()} ${lastUpdatedDate.toLocaleTimeString()}` : 'N/A';

    return (
        <div className="flex items-center gap-3 text-sm" title={`Provider: ${providerName}\nLast synced: ${formattedDate}`}>
            <div className="flex items-center gap-2">
                {icon}
                <span className={`font-semibold ${color}`}>{text}</span>
            </div>
             <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
            <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                vs. {providerName}
            </span>
        </div>
    );
};


const Footer: React.FC = () => {
  const { settings } = useAppContext();
  const footerSettings = settings.footer;

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
            <div className="flex items-center gap-2">
                <a href="https://freeimage.host/" target="_blank" rel="noopener noreferrer">
                    <img src="https://iili.io/FGWJCtj.jpg" alt="FGWJCtj.jpg" className="h-6 w-auto" />
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    JSTYP.me &copy; 2025. All rights reserved.
                </p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
                <SyncStatusIndicator />
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