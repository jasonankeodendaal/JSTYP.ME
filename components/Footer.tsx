import React, { useState } from 'react';
// FIX: Consolidate react-router-dom imports into a single line.
import { Link } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';
import { UserCircleIcon, CheckIcon, CloudSlashIcon, XIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, WhatsAppIcon, QuestionMarkCircleIcon } from './Icons.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import LocalMedia from './LocalMedia.tsx';
import { StorageProvider } from '../types';

// FIX: Cast motion.div to any to resolve framer-motion prop type errors.
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

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
    
    const providerName: Record<StorageProvider, string> = {
        local: 'Local Folder',
        customApi: 'Custom API',
        sharedUrl: 'Shared URL',
        supabase: 'Supabase',
        firebase: 'Firebase',
        vercel: 'Vercel',
        netlify: 'Netlify',
        ftp: 'FTP',
        none: 'None',
        aws: 'AWS',
        xano: 'Xano',
        backendless: 'Backendless'
    };

    const currentProviderName = providerName[storageProvider] || 'Provider';

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
        <div className="flex items-center gap-3 text-sm" title={`Provider: ${currentProviderName}\nLast synced: ${formattedDate}`}>
            <div className="flex items-center gap-2">
                {icon}
                <span className={`font-semibold ${color}`}>{text}</span>
            </div>
             <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 hidden sm:block" />
            <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                vs. {currentProviderName}
            </span>
        </div>
    );
};

const CreatorPopup: React.FC<{ onClose: () => void; theme: 'light' | 'dark' }> = ({ onClose, theme }) => {
    const { settings } = useAppContext();
    const creator = settings.creatorProfile;

    const whatsappUrl = creator.whatsapp.startsWith('http')
        ? creator.whatsapp
        : `https://wa.me/${creator.whatsapp}`;
    
    return (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[60] overflow-hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20">
            <XIcon className="h-4 w-4" />
          </button>
    
          <div className="relative">
            <div className="h-28 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900"></div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <LocalMedia
                    src={creator.imageUrl} 
                    alt={creator.name}
                    type="image"
                    className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                />
            </div>
          </div>
          
          <div className="pt-16 pb-6 px-6 text-center">
            <h3 className="text-2xl font-bold section-heading text-gray-900 dark:text-gray-100">{creator.name}</h3>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{creator.title}</p>

            <div className="my-4 flex justify-center">
                <LocalMedia
                    src={theme === 'light' ? (creator.logoUrlLight || creator.logoUrlDark || '') : (creator.logoUrlDark || creator.logoUrlLight || '')}
                    alt="Creator Logo"
                    type="image"
                    className="h-10 w-auto"
                />
            </div>
            
            <div className="mt-4 text-left space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <a href={`tel:${creator.phone}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <PhoneIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span>{creator.phone}</span>
                </a>
                <a href={`mailto:${creator.email}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <EnvelopeIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span>{creator.email}</span>
                </a>
                <a href={creator.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <GlobeAltIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span>{creator.websiteText}</span>
                </a>
            </div>
            
            <div className="mt-6">
                <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-full bg-[#25D366] hover:bg-[#1DAE53] text-white"
                >
                    <WhatsAppIcon className="w-5 h-5" />
                    <span>Get a Quote on WhatsApp</span>
                </a>
            </div>
          </div>
        </MotionDiv>
    );
}


const Footer: React.FC = () => {
  const { settings, theme } = useAppContext();
  const [isCreatorPopupOpen, setIsCreatorPopupOpen] = useState(false);
  
  const footerSettings = settings.footer;
  const creatorProfile = settings.creatorProfile;
  const footerWidthClass = settings.layout.width === 'standard' ? 'max-w-7xl mx-auto' : '';

  const footerStyle: React.CSSProperties = {
    backgroundColor: footerSettings?.effect === 'glassmorphism' ? 'transparent' : footerSettings?.backgroundColor,
    color: theme === 'light' ? 'var(--main-text)' : footerSettings?.textColor,
    fontFamily: 'inherit', // Let it inherit from the body tag
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
    'border-t border-gray-200/50 dark:border-white/10 mt-24',
    footerSettings?.effect === 'glassmorphism' ? 'effect-glassmorphism' : '',
    footerSettings?.effect === '3d-shadow' ? 'effect-3d-shadow' : '',
  ].filter(Boolean).join(' ');


  return (
    <>
      <footer className={footerClasses} style={footerStyle}>
        <div style={backgroundStyle}></div>
        <div className={`w-full px-4 sm:px-6 lg:px-8 py-3 ${footerWidthClass}`}>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  {creatorProfile.enabled && (
                    <MotionButton
                        onClick={() => setIsCreatorPopupOpen(true)}
                        className="group transition-all text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                        aria-label="Show creator details"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [1, 0.7, 1],
                        }}
                        transition={{
                            duration: 2.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "loop"
                        }}
                    >
                         <QuestionMarkCircleIcon className="h-7 w-7"/>
                    </MotionButton>
                  )}
                  <p className="text-sm">
                      {creatorProfile.name} &copy; 2025. All rights reserved.
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
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] flex items-center justify-center p-4"
            onClick={() => setIsCreatorPopupOpen(false)}
          >
            <CreatorPopup onClose={() => setIsCreatorPopupOpen(false)} theme={theme} />
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;