

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import LocalMedia from '../LocalMedia.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircleIcon, ShieldCheckIcon, HomeIcon, QuestionMarkCircleIcon, XIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, WhatsAppIcon } from '../Icons.tsx';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

// --- Creator Popup Component (adapted from Footer) ---
const CreatorPopup: React.FC<{ onClose: () => void; theme: 'light' | 'dark' }> = ({ onClose, theme }) => {
    const { settings } = useAppContext();
    const creator = settings.creatorProfile;

    if (!creator || !creator.enabled) return null;

    const whatsappUrl = creator.whatsapp.startsWith('http')
        ? creator.whatsapp
        : `https://wa.me/${creator.whatsapp}`;
    
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24,
            },
        },
    };

    return (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative w-full max-w-sm bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[60] overflow-hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20">
            <XIcon className="h-4 w-4" />
          </button>
          
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
                <LocalMedia
                    src={theme === 'light' ? (creator.logoUrlLight || creator.logoUrlDark || '') : (creator.logoUrlDark || creator.logoUrlLight || '')}
                    alt="Creator Logo"
                    type="image"
                    className={`h-16 w-auto transition-all duration-300 ${theme === 'light' ? 'invert' : ''}`}
                />
            </div>
            
            <h3 className="text-3xl font-bold section-heading text-slate-800 dark:text-white">{creator.name}</h3>
            <p className="text-md font-medium text-indigo-500 dark:text-indigo-400">{creator.title}</p>

            <MotionDiv variants={containerVariants} initial="hidden" animate="visible" className="text-left space-y-3 text-sm text-gray-700 dark:text-gray-300 mt-8">
                <MotionDiv variants={itemVariants}>
                    <a href={`tel:${creator.phone}`} className="flex items-center gap-4 p-3 rounded-xl bg-slate-200/70 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <PhoneIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{creator.phone}</span>
                    </a>
                </MotionDiv>
                <MotionDiv variants={itemVariants}>
                    <a href={`mailto:${creator.email}`} className="flex items-center gap-4 p-3 rounded-xl bg-slate-200/70 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <EnvelopeIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{creator.email}</span>
                    </a>
                </MotionDiv>
                <MotionDiv variants={itemVariants}>
                    <a href={creator.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-xl bg-slate-200/70 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <GlobeAltIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{creator.websiteText}</span>
                    </a>
                </MotionDiv>
            </MotionDiv>
            
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                className="mt-8"
            >
                <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn w-full bg-[#25D366] hover:bg-[#1DAE53] text-white !py-3 transform hover:scale-105"
                >
                    <WhatsAppIcon className="w-6 h-6" />
                    <span className="font-bold">Message on WhatsApp</span>
                </a>
            </MotionDiv>
          </div>
        </MotionDiv>
    );
}


const AdminLoginForm: React.FC<{
    onSubmit: (e: React.FormEvent) => Promise<void>;
    selectedUserId: string;
    onUserChange: (id: string) => void;
    pin: string;
    onPinChange: (pin: string) => void;
    error: string;
}> = ({ onSubmit, selectedUserId, onUserChange, pin, onPinChange, error }) => {
    const { adminUsers, settings } = useAppContext();
    const loginSettings = settings.loginScreen;

    const boxStyle: React.CSSProperties = { background: loginSettings.boxBackgroundColor };
    const textStyle: React.CSSProperties = { color: loginSettings.textColor };

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
        >
             <form onSubmit={onSubmit} style={boxStyle} className="w-full py-12 px-10 rounded-2xl shadow-2xl">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight section-heading" style={textStyle}>
                        ADMIN LOGIN
                    </h2>
                </div>

                {error && <p className="mb-4 text-center text-red-300 bg-red-800/50 p-3 rounded-lg text-sm">{error}</p>}
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-left" style={textStyle}>User</label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={(e) => onUserChange(e.target.value)}
                            className="mt-1 appearance-none block w-full px-3 py-3 border border-transparent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-white text-gray-900"
                        >
                            <option value="">Select a user...</option>
                            {adminUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="pin" className="block text-sm font-medium text-left" style={textStyle}>PIN</label>
                        <input
                            id="pin"
                            type="password"
                            value={pin}
                            onChange={(e) => onPinChange(e.target.value)}
                            maxLength={4}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            autoComplete="off"
                            required
                            className="mt-1 appearance-none block w-full px-3 py-3 border border-transparent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-white text-gray-900"
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50" disabled={!selectedUserId || pin.length < 4}>
                            <ShieldCheckIcon className="h-5 w-5 mr-2" />
                            Login
                        </button>
                    </div>
                </div>
            </form>
        </MotionDiv>
    );
};

const AdminLogin: React.FC = () => {
    const { adminUsers, login, settings, theme } = useAppContext();
    const navigate = useNavigate();
    const [selectedUserId, setSelectedUserId] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isCreatorPopupOpen, setIsCreatorPopupOpen] = useState(false);
    
    const loginSettings = settings.loginScreen;

    useEffect(() => {
        if (adminUsers.length > 0) {
            setSelectedUserId(adminUsers[0].id);
        }
    }, [adminUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const user = login(selectedUserId, pin);

        if (user) {
            navigate('/admin');
        } else {
            setError('Invalid user or PIN. Please try again.');
            setPin('');
        }
    };

    const backgroundStyle: React.CSSProperties = {
      backgroundImage: loginSettings.backgroundImageUrl ? `url(${loginSettings.backgroundImageUrl})` : 'none',
      backgroundColor: loginSettings.backgroundColor,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };

    return (
        <>
            <div style={backgroundStyle} className="min-h-screen flex flex-col items-center justify-center p-4">
                <AnimatePresence>
                     <div className="absolute top-6 left-6 z-10">
                        <Link to="/" className="btn bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30">
                            <HomeIcon className="h-5 w-5" />
                            <span className="hidden sm:inline">Back to Home</span>
                        </Link>
                    </div>
                    <LocalMedia src={settings.logoUrl} alt={settings.appName} type="image" className="h-20 w-auto mx-auto mb-8 drop-shadow-lg" />
                    <AdminLoginForm
                        onSubmit={handleSubmit}
                        selectedUserId={selectedUserId}
                        onUserChange={setSelectedUserId}
                        pin={pin}
                        onPinChange={setPin}
                        error={error}
                    />
                     {settings.creatorProfile.enabled && (
                        <MotionButton
                            onClick={() => setIsCreatorPopupOpen(true)}
                            className="absolute bottom-6 right-6 group transition-all text-white/50 hover:text-white"
                            aria-label="Show creator details"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.5 } }}
                        >
                             <QuestionMarkCircleIcon className="h-8 w-8"/>
                        </MotionButton>
                      )}
                </AnimatePresence>
            </div>
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

export default AdminLogin;