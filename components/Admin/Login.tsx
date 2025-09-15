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


const AdminLoginForm: React.FC<{
    onSubmit: (e: React.FormEvent) => Promise<void>;
    selectedUserId: string;
    onUserChange: (id: string) => void;
    pin: string;
    onPinChange: (pin: string) => void;
    error: string;
}> = ({ onSubmit, selectedUserId, onUserChange, pin, onPinChange, error }) => {
    const { adminUsers } = useAppContext();

    return (
        <form className="space-y-6" onSubmit={onSubmit}>
            <div>
                <label htmlFor="user-select" className="block text-sm font-medium text-left opacity-90">
                    Select User
                </label>
                <div className="mt-1 relative">
                    <UserCircleIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    <select
                        id="user-select"
                        name="user"
                        value={selectedUserId}
                        onChange={(e) => onUserChange(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-3 border-2 border-transparent rounded-full shadow-inner placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white sm:text-sm bg-black/20 text-white"
                        required
                    >
                        {adminUsers.map(user => (
                            <option key={user.id} value={user.id} className="bg-gray-700 text-white">
                                {user.firstName} {user.lastName} {user.isMainAdmin ? '(Main)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="pin-input" className="block text-sm font-medium text-left opacity-90">
                    Enter PIN
                </label>
                <div className="mt-1 relative">
                    <ShieldCheckIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    <input
                        id="pin-input"
                        name="pin"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={pin}
                        onChange={(e) => onPinChange(e.target.value)}
                        placeholder="••••"
                        maxLength={4}
                        pattern="\d{4}"
                        className="tracking-[1em] appearance-none block w-full pl-10 pr-3 py-3 border-2 border-transparent rounded-full shadow-inner placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white sm:text-sm bg-black/20 text-white text-center"
                    />
                </div>
            </div>
            
            {error && (
                <p className="text-sm text-center font-semibold text-yellow-400">{error}</p>
            )}

            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-md font-bold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white bg-white text-indigo-600"
                >
                    Sign In
                </button>
            </div>
        </form>
    );
};


const AdminLogin: React.FC = () => {
    const { adminUsers, login, loggedInUser, settings, theme } = useAppContext();
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isCreatorPopupOpen, setIsCreatorPopupOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedInUser) {
            navigate('/admin', { replace: true });
        }
    }, [loggedInUser, navigate]);

    useEffect(() => {
        if (adminUsers.length > 0 && !selectedUserId) {
            setSelectedUserId(adminUsers[0].id);
        }
    }, [adminUsers, selectedUserId]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedUserId || !pin) {
            setError('Please select a user and enter your PIN.');
            return;
        }

        const user = login(selectedUserId, pin);

        if (!user) {
            setError('Invalid user or PIN. Please try again.');
            setPin('');
        }
    };

    const loginSettings = settings.loginScreen;
    const creatorProfile = settings.creatorProfile;

    const pageStyle: React.CSSProperties = {
        backgroundImage: loginSettings.backgroundImageUrl ? `url(${loginSettings.backgroundImageUrl})` : 'none',
        backgroundColor: loginSettings.backgroundColor || '#111827',
    };
    
    const formPanelStyle: React.CSSProperties = {
        background: loginSettings.boxBackgroundColor || 'rgba(255,255,255,0.1)',
    };

    return (
        <div style={pageStyle} className="min-h-screen w-full bg-cover bg-center text-white relative">
            
            {/* Action Buttons */}
            <div className="fixed top-4 left-4 z-10">
                <Link to="/" className="btn bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 !py-2 !px-4">
                    <HomeIcon className="h-5 w-5" />
                    <span>Home</span>
                </Link>
            </div>
            
            {creatorProfile.enabled && (
                <div className="fixed top-4 right-4 z-10">
                     <MotionButton
                        onClick={() => setIsCreatorPopupOpen(true)}
                        className="group transition-all text-white/70 hover:text-white"
                        aria-label="Show creator details"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                            duration: 2.5,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatType: "loop"
                        }}
                    >
                         <QuestionMarkCircleIcon className="h-9 w-9 drop-shadow-lg"/>
                    </MotionButton>
                </div>
            )}
            
            {/* Unified Layout for all screen sizes */}
            <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-8">
                <MotionDiv
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 sm:p-8 backdrop-blur-xl border border-white/10"
                    style={formPanelStyle}
                >
                    <div className="flex flex-col items-center text-center mb-6 sm:mb-8" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                        <LocalMedia src={settings.logoUrl} alt="Logo" type="image" className="h-16 sm:h-20 w-auto drop-shadow-lg" />
                        <h1 className="text-3xl sm:text-4xl font-bold mt-4 section-heading">{settings.appName}</h1>
                        <p className="mt-1 text-sm sm:text-base max-w-md opacity-90">{settings.appDescription}</p>
                    </div>
                    <AdminLoginForm 
                        onSubmit={handleSubmit}
                        selectedUserId={selectedUserId}
                        onUserChange={setSelectedUserId}
                        pin={pin}
                        onPinChange={setPin}
                        error={error}
                    />
                </MotionDiv>
            </div>

            <p className="fixed bottom-4 left-1/2 -translate-x-1/2 text-center text-xs opacity-50" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                &copy; {new Date().getFullYear()} All rights reserved.
            </p>
            
            {/* Creator Popup */}
             <AnimatePresence>
                {isCreatorPopupOpen && (
                  <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] flex items-center justify-center p-4"
                    onClick={() => setIsCreatorPopupOpen(false)}
                  >
                    <CreatorPopup onClose={() => setIsCreatorPopupOpen(false)} theme={'dark'} />
                  </MotionDiv>
                )}
              </AnimatePresence>
        </div>
    );
};

export default AdminLogin;