

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

const Footer: React.FC = () => {
  const { settings, updateSettings } = useAppContext();
  const footerSettings = settings.footer;
  const autoSyncEnabled = settings.sync?.autoSyncEnabled ?? false;

  const handleToggleAutoSync = () => {
    updateSettings({
        sync: {
            ...settings.sync,
            autoSyncEnabled: !autoSyncEnabled,
        },
    });
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
                <button 
                    onClick={handleToggleAutoSync} 
                    className="flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity mt-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] rounded"
                    aria-live="polite"
                    aria-label={`Toggle auto-sync. Current status: ${autoSyncEnabled ? 'On' : 'Off'}`}
                >
                    <span 
                        className={`relative flex h-2.5 w-2.5 rounded-full ${autoSyncEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                        title={`Auto-Sync is ${autoSyncEnabled ? 'On' : 'Off'}`}
                    >
                        {autoSyncEnabled && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        )}
                    </span>
                    <span>Auto-Sync: {autoSyncEnabled ? 'On' : 'Off'}</span>
                </button>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;