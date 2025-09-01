import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';
import { UserCircleIcon, CheckIcon, CloudSlashIcon, XIcon } from './Icons.tsx';
import { AnimatePresence, motion } from 'framer-motion';

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

const CreatorPopup: React.FC<{ onClose: () => void; }> = ({ onClose }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 text-gray-800 dark:text-gray-200 z-[60]"
    >
      <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <XIcon className="h-4 w-4" />
      </button>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Creator</p>
        <h3 className="text-xl font-bold mt-1 section-heading">Jason odendaal</h3>
        <p className="text-lg font-mono mt-1 text-gray-600 dark:text-gray-300">0695989427</p>
        <div className="my-3 h-px bg-gray-200 dark:bg-gray-700"></div>
        <p className="text-sm font-semibold item-title">JSTYP.me</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Jason solution to your problems!</p>
        <a 
          href="https://wa.me/27695989427"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
        >
          Whatsapp us today for a fresh build on your business
        </a>
      </div>
    </motion.div>
);


const Footer: React.FC = () => {
  const { settings, theme } = useAppContext();
  const [isCreatorPopupOpen, setIsCreatorPopupOpen] = useState(false);
  
  const footerSettings = settings.footer;

  const footerStyle: React.CSSProperties = {
    backgroundColor: footerSettings?.effect === 'glassmorphism' ? 'transparent' : footerSettings?.backgroundColor,
    color: theme === 'light' ? 'var(--main-text)' : footerSettings?.textColor,
    fontFamily: footerSettings?.typography?.fontFamily ?? 'inherit',
    fontWeight: footerSettings?.typography?.fontWeight ?? 'inherit',
    fontStyle: footerSettings?.typography?.fontStyle ?? 'inherit',
    textDecoration: footerSettings?.typography?.textDecoration ?? 'inherit',
    position: 'relative',
  };

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: footerSettings?.backgroundImageUrl ? `url(${footerSettings.backgroundImageUrl})` : 'none',
    backgroundColor: footerSettings?.backgroundColor,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: footerSettings?.backgroundImageOpacity,
    zIndex: -1,
  };

   const footerClasses = [
    'border-t border-gray-200/50 dark:border-white/10 mt-auto',
    footerSettings?.effect === 'glassmorphism' ? 'effect-glassmorphism' : '',
    footerSettings?.effect === '3d-shadow' ? 'effect-3d-shadow' : '',
  ].filter(Boolean).join(' ');


  return (
    <>
      <footer className={footerClasses} style={footerStyle}>
        <div style={backgroundStyle}></div>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsCreatorPopupOpen(true)}
                    className="group transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-1"
                    aria-label="Show creator details"
                  >
                    <img 
                      src="https://iili.io/FGWJCtj.jpg" 
                      alt="JSTYP.me Logo" 
                      className="h-10 w-auto jstyp-logo transition-all duration-300 group-hover:drop-shadow-[0_5px_15px_rgba(255,255,255,0.2)]"
                    />
                  </button>
                  <p className="text-sm">
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
      <AnimatePresence>
        {isCreatorPopupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[50]"
              onClick={() => setIsCreatorPopupOpen(false)}
            />
            <CreatorPopup onClose={() => setIsCreatorPopupOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;