import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAppContext } from '../context/AppContext.tsx';
// FIX: Add missing UsersIcon import to fix 'Cannot find name' error.
import { ServerStackIcon, ChevronRightIcon, LinkIcon, ChevronLeftIcon, SparklesIcon, CubeIcon, BookOpenIcon, CloudSlashIcon, PaintBrushIcon, ChartBarIcon, ClipboardDocumentListIcon, ArrowPathIcon, SignalIcon, CircleStackIcon, ShieldCheckIcon, CodeBracketIcon, ArrowDownTrayIcon, UserCircleIcon, TvIcon, BuildingStorefrontIcon, IdentificationIcon, ComputerDesktopIcon, UsersIcon } from '../Icons.tsx';
import { useNavigate } from 'react-router-dom';
import SetupInstruction from './SetupInstruction.tsx';
import { LocalFolderGuideContent, CloudSyncGuideContent, VercelGuideContent, SupabaseGuideContent } from './SetupGuides.tsx';

const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const MotionDiv = motion.div as any;

const containerVariants = {
    visible: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        }
    }
};

// FIX: Explicitly type itemVariants as Variants to fix type error with the 'ease' property.
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};


const FeatureItem: React.FC<{icon: React.ReactNode, title: string, children: React.ReactNode}> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
            <p className="text-sm">{children}</p>
        </div>
    </div>
);

// --- Reusable About System Component ---
interface AboutSystemProps {
    onBack?: () => void;
    isDashboard?: boolean;
}

const HeroDiagram: React.FC = () => (
    <svg viewBox="0 0 800 400" className="w-full h-auto rounded-lg shadow-lg dark:shadow-2xl dark:shadow-black/20" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="hero-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="hero-kiosk-screen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="hero-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(30, 41, 59, 0)" />
                <stop offset="100%" stopColor="rgba(30, 41, 59, 1)" />
            </linearGradient>
            <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>

        <rect width="800" height="400" fill="url(#hero-bg-grad)" />

        {/* Floor and reflection */}
        <path d="M 0 300 C 200 280, 600 280, 800 300 L 800 400 L 0 400 Z" fill="url(#hero-floor)" />
        <g opacity="0.2" transform="translate(0, 560) scale(1, -1)">
             <path d="M 270 235 L 250 255 L 550 255 L 530 235 Z" fill="#475569" />
             <path d="M 325 50 L 270 235 L 530 235 L 475 50 Z" fill="#334155" />
             <rect x="330" y="55" width="140" height="170" fill="url(#hero-kiosk-screen)" />
        </g>
        
        {/* Central Kiosk */}
        <g transform="translate(400, 200)">
            <path d="M -130 135 L -150 155 L 150 155 L 130 135 Z" fill="#475569" />
            <path d="M -75 -150 L -130 135 L 130 135 L 75 -150 Z" fill="#334155" />
            <rect x="-70" y="-145" width="140" height="270" fill="#0f172a" />
            <g filter="url(#hero-glow)" opacity="0.4"><rect x="-70" y="-145" width="140" height="270" fill="url(#hero-kiosk-screen)" /></g>
            <rect x="-70" y="-145" width="140" height="270" fill="url(#hero-kiosk-screen)" />
            <g className="fill-white opacity-80">
                <rect x="-60" y="-135" width="120" height="40" rx="4" fill="rgba(255,255,255,0.1)" />
                <rect x="-50" y="-125" width="50" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
                <rect x="-60" y="-85" width="120" height="190" rx="4" fill="rgba(255,255,255,0.1)" />
                <rect x="-50" y="-75" width="100" height="120" rx="2" fill="rgba(255,255,255,0.1)" />
                <rect x="-50" y="55" width="45" height="40" rx="2" fill="rgba(255,255,255,0.1)" />
                <rect x="5" y="55" width="45" height="40" rx="2" fill="rgba(255,255,255,0.1)" />
            </g>
        </g>

        {/* Surrounding UI elements */}
        <g className="text-white">
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
                <circle cx="150" cy="150" r="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <CloudSlashIcon className="w-10 h-10 text-white/70" x="130" y="130" />
                <text x="150" y="210" textAnchor="middle" className="text-sm fill-white/80 font-semibold">Offline-First</text>
            </motion.g>
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
                <circle cx="650" cy="150" r="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <ArrowPathIcon className="w-10 h-10 text-white/70" x="630" y="130" />
                <text x="650" y="210" textAnchor="middle" className="text-sm fill-white/80 font-semibold">Cloud Sync</text>
            </motion.g>
             <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}>
                <circle cx="100" cy="300" r="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <ChartBarIcon className="w-10 h-10 text-white/70" x="80" y="280" />
                <text x="100" y="360" textAnchor="middle" className="text-sm fill-white/80 font-semibold">Analytics</text>
            </motion.g>
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}>
                <circle cx="700" cy="300" r="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <PaintBrushIcon className="w-10 h-10 text-white/70" x="680" y="280" />
                <text x="700" y="360" textAnchor="middle" className="text-sm fill-white/80 font-semibold">Customizable</text>
            </motion.g>
        </g>
    </svg>
);

const SystemEcosystemDiagram: React.FC = () => (
    <svg viewBox="0 0 500 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="eco-kiosk-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient>
            <linearGradient id="eco-cloud-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/></linearGradient>
            <linearGradient id="card-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.05)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></linearGradient>
            <marker id="eco-arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-gray-400 dark:text-gray-500"/></marker>
            <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/><feOffset in="blur" dy="4" result="offsetBlur"/><feMerge><feMergeNode in="offsetBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        
        {/* Kiosk Node */}
        <g transform="translate(120 140)" filter="url(#card-shadow)">
            <path d="M -110 -95 L 110 -95 L 110 95 L -110 95 Z" transform="skewX(-5)" className="fill-gray-100/80 dark:fill-gray-800/80 stroke-gray-200/50 dark:stroke-gray-700/50 rounded-2xl"/>
            <path d="M -110 -95 L 110 -95 L 110 95 L -110 95 Z" transform="skewX(-5)" fill="url(#card-grad)" className="rounded-2xl"/>
            <circle cx="-50" cy="-50" r="25" fill="url(#eco-kiosk-grad)"/>
            <ComputerDesktopIcon className="w-8 h-8 text-white" x="-62" y="-62" />
            <text x="0" y="-55" textAnchor="middle" className="text-xl font-bold fill-gray-800 dark:fill-gray-100 section-heading">Kiosk Device</text>
            <foreignObject x="-90" y="-20" width="180" height="100">
                <div className="text-center text-sm text-gray-700 dark:text-gray-300 font-semibold">Offline-First Core</div>
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">React UI + Local Database for speed and reliability.</div>
                <div className="mt-4 text-center text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-full px-3 py-1 inline-block">FAST & RELIABLE</div>
            </foreignObject>
        </g>
        
        {/* Cloud Node */}
        <g transform="translate(380 140)" filter="url(#card-shadow)">
            <path d="M -110 -95 L 110 -95 L 110 95 L -110 95 Z" transform="skewX(-5)" className="fill-gray-100/80 dark:fill-gray-800/80 stroke-gray-200/50 dark:stroke-gray-700/50 rounded-2xl"/>
            <path d="M -110 -95 L 110 -95 L 110 95 L -110 95 Z" transform="skewX(-5)" fill="url(#card-grad)" className="rounded-2xl"/>
            <circle cx="-50" cy="-50" r="25" fill="url(#eco-cloud-grad)"/>
            <ServerStackIcon className="w-8 h-8 text-white" x="-62" y="-62" />
            <text x="0" y="-55" textAnchor="middle" className="text-xl font-bold fill-gray-800 dark:fill-gray-100 section-heading">Sync Provider</text>
            <foreignObject x="-90" y="-20" width="180" height="100">
                <div className="text-center text-sm text-gray-700 dark:text-gray-300 font-semibold">Optional & Flexible</div>
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">Cloud API or a Local/Network folder for data sync.</div>
                <div className="mt-4 text-center text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 rounded-full px-3 py-1 inline-block">CENTRALIZED</div>
            </foreignObject>
        </g>

        {/* Connection Arrows */}
        <g className="text-gray-400 dark:text-gray-500">
            <path d="M 215 110 C 245 80, 295 80, 325 110" fill="none" className="stroke-current" strokeWidth="1.5" markerEnd="url(#eco-arrowhead)" strokeDasharray="4 4"/>
            <path d="M 325 170 C 295 200, 245 200, 215 170" fill="none" className="stroke-current" strokeWidth="1.5" markerEnd="url(#eco-arrowhead)" strokeDasharray="4 4"/>
            <text x="270" y="75" textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">Push Changes (Sync)</text>
            <text x="270" y="210" textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">Pull Updates</text>
        </g>
    </svg>
);


const ValueLoopDiagram: React.FC = () => (
    <svg viewBox="0 0 300 300" className="w-full h-auto max-w-sm mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="val-grad-1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a5b4fc"/><stop offset="100%" stopColor="#818cf8"/></linearGradient>
            <linearGradient id="val-grad-2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c4b5fd"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient>
            <linearGradient id="val-grad-3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f9a8d4"/><stop offset="100%" stopColor="#f472b6"/></linearGradient>
            <marker id="val-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="fill-gray-400 dark:fill-gray-500"/></marker>
            <filter id="val-shadow"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/><feOffset dy="3" in="blur"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <circle cx="150" cy="150" r="120" strokeDasharray="8 8" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5" fill="none" marker-end="url(#val-arrowhead)" marker-start="url(#val-arrowhead)"/>
        
        <g transform="translate(150, 40)" className="cursor-pointer" filter="url(#val-shadow)">
            <circle r="32" className="fill-white dark:fill-gray-700"/>
            <circle r="28" fill="url(#val-grad-1)"/>
            <UserCircleIcon className="w-10 h-10 text-white" x="-20" y="-20" />
        </g>
        <text x="150" y="95" textAnchor="middle" className="font-bold text-sm fill-gray-800 dark:fill-gray-100">Customer Interaction</text>

        <g transform="translate(260, 150)" className="cursor-pointer" filter="url(#val-shadow)">
            <circle r="32" className="fill-white dark:fill-gray-700"/>
            <circle r="28" fill="url(#val-grad-2)"/>
            <ChartBarIcon className="w-10 h-10 text-white" x="-20" y="-20" />
        </g>
        <text x="260" y="205" textAnchor="middle" className="font-bold text-sm fill-gray-800 dark:fill-gray-100">Actionable Analytics</text>

        <g transform="translate(40, 150)" className="cursor-pointer" filter="url(#val-shadow)">
            <circle r="32" className="fill-white dark:fill-gray-700"/>
            <circle r="28" fill="url(#val-grad-3)"/>
            <BuildingStorefrontIcon className="w-10 h-10 text-white" x="-20" y="-20" />
        </g>
        <text x="40" y="205" textAnchor="middle" className="font-bold text-sm fill-gray-800 dark:fill-gray-100">Smarter Decisions</text>
    </svg>
);


const ScenarioBoutiqueDiagram: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 75 L 20 15 H 80 L 95 75 Z" className="fill-gray-200/50 dark:fill-gray-700/50" />
        <path d="M 15 15 H 85" className="fill-gray-300 dark:fill-gray-600" />
        <path d="M 20 15 L 80 15 L 85 5 H 15 Z" className="fill-gray-300 dark:fill-gray-600" />
        <rect x="25" y="20" width="50" height="55" rx="2" className="fill-gray-50/50 dark:fill-gray-900/40" />
        <rect x="40" y="45" width="20" height="30" rx="1" className="fill-indigo-500" />
        <rect x="42" y="47" width="16" height="20" rx="0.5" className="fill-purple-300" />
    </svg>
);

const ScenarioFranchiseDiagram: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="fr-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient>
            <g id="fr-store-icon"><circle cx="10" cy="10" r="10" className="fill-gray-200 dark:fill-gray-700"/><BuildingStorefrontIcon className="w-4 h-4 text-gray-500" x="4" y="4"/></g>
            <filter id="fr-glow"><feGaussianBlur stdDeviation="1.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path d="M50 30 L 20 50" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5"/>
        <path d="M50 30 L 80 50" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5"/>
        <path d="M50 30 L 50 65" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5"/>
        <g filter="url(#fr-glow)"> <circle cx="50" cy="30" r="15" fill="url(#fr-grad)"/></g>
        <ServerStackIcon className="w-6 h-6 text-white" x="42" y="22"/>
        <use href="#fr-store-icon" x="10" y="50"/>
        <use href="#fr-store-icon" x="70" y="50"/>
        <use href="#fr-store-icon" x="40" y="65"/>
    </svg>
);

const ScenarioB2bDiagram: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="b2b-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#c084fc"/></linearGradient></defs>
        <path d="M10 75 L 30 10 H 70 L 90 75 Z" fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="2" />
        <rect x="40" y="20" width="20" height="40" rx="2" fill="url(#b2b-grad)" />
        <rect x="42" y="22" width="16" height="28" rx="1" className="fill-white/50 dark:fill-black/20" />
        <g transform="translate(75 25)" className="text-indigo-400">
            <ClipboardDocumentListIcon className="w-8 h-8 opacity-80" fill="currentColor"/>
        </g>
        <g transform="translate(15 45)" className="text-indigo-400">
            <UsersIcon className="w-8 h-8 opacity-80" fill="currentColor"/>
        </g>
    </svg>
);

export const AboutSystem: React.FC<AboutSystemProps> = ({ onBack, isDashboard = false }) => {
    const { getFileUrl } = useAppContext();
    const [isAvailable, setIsAvailable] = useState(false);
    const [zipUrl, setZipUrl] = useState('');
    const [isChecking, setIsChecking] = useState(true);

    const checkZip = useCallback(async () => {
        let isMounted = true;
        setIsChecking(true);
        try {
            const url = await getFileUrl('project.zip');
            if (url && isMounted) {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                    setIsAvailable(true);
                    setZipUrl(url);
                } else {
                    setIsAvailable(false);
                }
            } else if (isMounted) {
                setIsAvailable(false);
            }
        } catch (error) {
            console.log('Project.zip not found:', error);
            if (isMounted) setIsAvailable(false);
        } finally {
            if (isMounted) setIsChecking(false);
        }
        return () => { isMounted = false; };
    }, [getFileUrl]);

    useEffect(() => {
        checkZip();
    }, [checkZip]);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold section-heading text-gray-800 dark:text-gray-100">About the System</h2>
                {onBack && !isDashboard && (
                     <button onClick={onBack} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 !py-1.5 !px-3">
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Back
                    </button>
                )}
            </div>
            <div className={`${!isDashboard ? 'max-h-[calc(100vh-220px)]' : ''} overflow-y-auto pr-2 -mr-2`}>
                <motion.div
                    className="max-w-5xl mx-auto space-y-12 text-gray-600 dark:text-gray-300 pr-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                
                    <motion.section variants={itemVariants} className="text-center">
                        <HeroDiagram />
                        <h1 className="text-3xl md:text-4xl font-bold section-heading text-gray-800 dark:text-gray-100 mt-4">The Retail OS</h1>
                        <p className="max-w-3xl mx-auto mt-2 text-lg">Bridging Your Physical Space with Digital Intelligence</p>
                        <div className="mt-6 max-w-prose mx-auto text-sm space-y-2">
                           <p>In today's retail landscape, the digital and physical worlds are often disconnected. Customers browse online but purchase in-store; they discover in-store but research on their phones. This system was born from a simple yet powerful idea: **your physical retail space should be as dynamic, informative, and measurable as your website.**</p>
                           <p>It's engineered to be more than just a digital sign—it's a strategic platform designed to digitize your in-store customer journey. By providing an interactive, engaging experience, it empowers you with the tools to create a seamless brand story, capture actionable data that was previously invisible, and ultimately, convert passive browsing into active sales engagement.</p>
                       </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-4 section-heading text-center">How It Works: The Offline-First Core</h3>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="md:flex-1 w-full">
                                <SystemEcosystemDiagram />
                            </div>
                             <div className="md:flex-1 w-full min-w-0 max-w-prose text-sm space-y-2">
                                <p>The kiosk is engineered for resilience. At its heart, it's a completely self-sufficient Progressive Web App (PWA) that stores all its data—products, settings, and media paths—locally on the device in an IndexedDB database. This <strong>offline-first architecture</strong> means it's incredibly fast and reliable. It doesn't need a constant internet connection to function perfectly, ensuring a smooth customer experience even with unstable network conditions.</p>
                                <p>For multi-device setups or centralized management, it uses an <strong>optional sync provider</strong> (like a local network folder or a cloud server) to keep all kiosks updated. This hybrid model gives you the best of both worlds: the rock-solid stability and speed of an offline app with the powerful scalability and convenience of the cloud.</p>
                            </div>
                        </div>
                    </motion.section>
                     <motion.section variants={itemVariants} className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-4 section-heading text-center">The Value Loop: Turning Browsing into Insight</h3>
                        <div className="flex flex-col md:flex-row-reverse gap-6 items-center">
                            <div className="md:flex-1 w-full">
                                <ValueLoopDiagram />
                            </div>
                            <div className="md:flex-1 w-full min-w-0 max-w-prose text-sm space-y-2">
                                <p>By turning passive browsing into active engagement, the kiosk transforms your physical space into a source of rich customer data. Track which products are most viewed, which brands are most popular, and understand what your customers are truly interested in—all before they even speak to a sales associate.</p>
                                <ul className="list-disc list-outside pl-5 mt-2 space-y-2">
                                    <li><strong>Empower Sales Staff:</strong> Use the "Create Quote" feature to build client orders directly from the kiosk, turning it into a powerful, interactive sales tool that bridges the gap between browsing and buying.</li>
                                    <li><strong>Gain Actionable Insights:</strong> The built-in analytics provide a clear, visual picture of in-store customer behavior, helping you make smarter decisions about product placement, promotions, and inventory.</li>
                                    <li><strong>Enhance Customer Experience:</strong> Offer your customers a modern, self-service way to explore your entire product catalogue in rich detail, with videos, documents, and high-resolution images.</li>
                                    <li><strong>Reduce Perceived Wait Times:</strong> An engaging interactive display keeps customers occupied and informed, improving their overall in-store experience.</li>
                                </ul>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-6 section-heading text-center">Key Features at a Glance</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 text-sm">
                            <FeatureItem icon={<CloudSlashIcon className="w-5 h-5"/>} title="Offline-First Reliability">The kiosk runs flawlessly with or without an internet connection, ensuring 100% uptime in your store.</FeatureItem>
                            <FeatureItem icon={<ArrowPathIcon className="w-5 h-5"/>} title="Flexible Syncing">Choose between a local network folder for simple setups or a cloud API for multi-location franchises.</FeatureItem>
                            <FeatureItem icon={<CircleStackIcon className="w-5 h-5"/>} title="Centralized Management">Update product data, promotions, and settings from a single admin panel and sync changes everywhere.</FeatureItem>
                            <FeatureItem icon={<BookOpenIcon className="w-5 h-5"/>} title="Rich Content">Display beautiful product catalogues, promotional pamphlets, and full-screen video ads.</FeatureItem>
                            <FeatureItem icon={<ChartBarIcon className="w-5 h-5"/>} title="Customer Analytics">Track product and brand views per-kiosk to understand what's popular in different locations.</FeatureItem>
                            <FeatureItem icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} title="Integrated Sales Tool">Generate client quotes directly from the kiosk interface, complete with product details and quantities.</FeatureItem>
                            <FeatureItem icon={<PaintBrushIcon className="w-5 h-5"/>} title="Deep Customization">Control every aspect of the look and feel, from colors and fonts to layout and transition effects.</FeatureItem>
                            <FeatureItem icon={<ShieldCheckIcon className="w-5 h-5"/>} title="Secure & Multi-User">Role-based admin access allows you to delegate management tasks with specific permissions.</FeatureItem>
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-6 section-heading text-center">Perfect For Any Environment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <ScenarioBoutiqueDiagram />
                                <h4 className="font-semibold mt-2 text-gray-800 dark:text-gray-100">High-End Boutiques</h4>
                                <p className="text-xs">Provide a sophisticated, interactive catalogue that complements your premium products.</p>
                            </div>
                            <div className="text-center">
                                <ScenarioFranchiseDiagram />
                                <h4 className="font-semibold mt-2 text-gray-800 dark:text-gray-100">Multi-Location Franchises</h4>
                                <p className="text-xs">Ensure brand consistency and manage product data centrally across all stores.</p>
                            </div>
                            <div className="text-center">
                                <ScenarioB2bDiagram />
                                <h4 className="font-semibold mt-2 text-gray-800 dark:text-gray-100">B2B & Trade Shows</h4>
                                <p className="text-xs">Capture leads, generate quotes instantly, and showcase your full range without physical stock.</p>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading flex items-center gap-3">
                            <ArrowDownTrayIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                            <span>Project Source Code</span>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                           This application is designed to be fully self-hostable. For developers wanting to customize functionality or host the entire system on their own infrastructure, the complete project source code can be made available for download here. An administrator must first upload the <code>project.zip</code> file in the <strong>System &rarr; Backup &amp; Restore</strong> section of the admin dashboard.
                        </p>
                        {isChecking ? (
                            <button className="btn btn-primary w-full sm:w-auto" disabled>Checking for file...</button>
                        ) : isAvailable ? (
                            <a href={zipUrl} download="kiosk-project.zip" className="btn btn-primary w-full sm:w-auto">
                                Download Full Project (.zip)
                            </a>
                        ) : (
                            <button className="btn btn-primary w-full sm:w-auto" disabled>
                                Download Unavailable
                            </button>
                        )}
                        {!isAvailable && !isChecking && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">No project.zip file has been uploaded by the administrator yet.</p>
                        )}
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};


const SetupWizard: React.FC = () => {
    const { 
        connectToLocalProvider, 
        testAndConnectProvider,
        updateSettings, 
        directoryHandle,
        storageProvider,
        completeSetup,
        settings
    } = useAppContext();
    
    const navigate = useNavigate();
    const [step, setStep] = useState<number | 'guides' | 'info'>(1);
    const [provider, setProvider] = useState<'local' | 'sharedUrl' | 'customApi' | null>(null);
    const [apiConfig, setApiConfig] = useState({ url: settings.customApiUrl || '', key: settings.customApiKey || '' });
    const [sharedUrl, setSharedUrl] = useState(settings.sharedUrl || '');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');
    const [connectionResult, setConnectionResult] = useState<{success: boolean, message: string} | null>(null);
    const [isPotentiallyRestricted, setIsPotentiallyRestricted] = useState(false);

    useEffect(() => {
        if (window.self !== window.top) {
            setIsPotentiallyRestricted(true);
        }
    }, []);

    const handleSelectProvider = (selectedProvider: 'local' | 'sharedUrl' | 'customApi') => {
        setProvider(selectedProvider);
        if (selectedProvider === 'local') {
            handleLocalConnect();
        } else {
            setStep(3);
        }
    };
    
    const handleLocalConnect = async () => {
        setIsConnecting(true);
        setError('');
        await connectToLocalProvider();
        setIsConnecting(false);
    };

    const handleCloudConnect = async () => {
        setError('');
        setConnectionResult(null);
        setIsConnecting(true);
        
        if (provider === 'customApi') {
            await updateSettings({ customApiUrl: apiConfig.url, customApiKey: apiConfig.key });
        } else if (provider === 'sharedUrl') {
            await updateSettings({ sharedUrl: sharedUrl });
        }
        
        // Use a short delay to ensure settings are updated before testing
        setTimeout(async () => {
            const result = await testAndConnectProvider();
            setConnectionResult(result);
            setIsConnecting(false);
        }, 200);
    };

    const handleFinish = () => {
        completeSetup();
    };

    const handleSkipToLogin = () => {
        completeSetup();
        navigate('/login');
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <MotionDiv key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                        <h2 className="text-2xl font-bold section-heading text-gray-800 dark:text-gray-100">Welcome to Your Kiosk!</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">This quick setup will help you configure how your kiosk data is stored and synced. You can change these settings later in the admin panel.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                            <button onClick={() => setStep(2)} className="btn btn-primary w-full sm:w-auto">
                                Get Started <ChevronRightIcon className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setStep('info')} className="btn btn-secondary w-full sm:w-auto">
                                Learn More
                            </button>
                        </div>
                    </MotionDiv>
                );
            case 2:
                return (
                    <MotionDiv key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100 mb-4 text-center">Choose a Storage Method</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => handleSelectProvider('local')} disabled={isPotentiallyRestricted} className="p-6 border-2 border-transparent rounded-xl text-left bg-gray-100 dark:bg-gray-700/50 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent">
                                <ServerStackIcon className="w-8 h-8 text-indigo-500 mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Local or Network Folder</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Best for offline use or single-store setups.</p>
                                {isPotentiallyRestricted && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Unavailable in this embedded environment.</p>}
                            </button>
                             <button onClick={() => handleSelectProvider('sharedUrl')} className="p-6 border-2 border-transparent rounded-xl text-left bg-gray-100 dark:bg-gray-700/50 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <LinkIcon className="w-8 h-8 text-indigo-500 mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Shared URL / Simple API</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Connect to a web URL. Can be read-only or read/write depending on your server.</p>
                            </button>
                             <button onClick={() => handleSelectProvider('customApi')} className="p-6 border-2 border-transparent rounded-xl text-left bg-gray-100 dark:bg-gray-700/50 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <CodeBracketIcon className="w-8 h-8 text-indigo-500 mb-3" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Custom API Sync</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">For advanced users with their own cloud server.</p>
                            </button>
                        </div>
                         <div className="text-center mt-6">
                            <button type="button" onClick={() => setStep('guides')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                                Need help? View setup instructions
                            </button>
                        </div>
                        <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button type="button" onClick={handleSkipToLogin} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:underline">
                                Skip for now &amp; go to Admin Login &rarr;
                            </button>
                        </div>
                    </MotionDiv>
                );
            case 3:
                const isConnected = storageProvider !== 'none';
                if (provider === 'local') {
                    return (
                        <MotionDiv key="step3-local" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                            <ServerStackIcon className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100">Local Folder Setup</h2>
                            {isConnecting && <p className="mt-2 text-gray-600 dark:text-gray-400">Awaiting folder selection...</p>}
                            {directoryHandle && (
                                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg text-sm">
                                    Successfully connected to folder: <strong>{directoryHandle.name}</strong>
                                </div>
                            )}
                            <div className="mt-8 flex justify-center gap-4">
                                <button onClick={() => setStep(2)} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Back</button>
                                <button onClick={handleFinish} className="btn btn-primary" disabled={!directoryHandle}>Finish Setup</button>
                            </div>
                        </MotionDiv>
                    );
                }
                const commonCloudContent = (
                    <>
                        <div className="mt-8 flex justify-between items-center">
                            <button onClick={() => {setStep(2); setConnectionResult(null);}} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Back</button>
                            <button onClick={handleFinish} className="btn btn-primary" disabled={!isConnected || isConnecting}>Finish Setup</button>
                        </div>
                         {connectionResult && (
                            <div className={`mt-4 p-3 rounded-lg text-sm ${connectionResult.success ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                                {connectionResult.message}
                            </div>
                         )}
                    </>
                );
                if (provider === 'sharedUrl') {
                    return (
                        <MotionDiv key="step3-sharedurl" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                            <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100 mb-4 text-center">Shared URL / Simple API Setup</h2>
                                <div className="space-y-4">
                                    <div className="mt-2 p-4 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-lg text-sm text-left">
                                        <h4 className="font-semibold">Read/Write vs Read-Only</h4>
                                        <p className="mt-1">
                                            To <strong>push and pull</strong> data, your URL must be a server endpoint that accepts POST requests. For <strong>pull-only</strong> access, you can use a direct link to a <code>database.json</code> file.
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="sharedUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shared URL</label>
                                        <input type="url" id="sharedUrl" value={sharedUrl} onChange={e => setSharedUrl(e.target.value)} placeholder="https://.../database.json" className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4"/>
                                    </div>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                    <button onClick={handleCloudConnect} disabled={isConnecting || !sharedUrl} className="btn btn-primary w-full">
                                        {isConnecting ? 'Testing Connection...' : 'Test & Connect'}
                                    </button>
                                </div>
                            {commonCloudContent}
                        </MotionDiv>
                    );
                }
                if (provider === 'customApi') {
                     return (
                        <MotionDiv key="step3-api" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                             <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100 mb-4 text-center">API Configuration</h2>
                                <div className="space-y-4">
                                     <div>
                                         <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom API URL</label>
                                         <input type="url" id="apiUrl" value={apiConfig.url} onChange={e => setApiConfig(p => ({...p, url: e.target.value}))} placeholder="https://api.yourdomain.com/data" className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                     </div>
                                      <div>
                                         <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom API Key (Optional)</label>
                                         <input type="password" id="apiKey" value={apiConfig.key} onChange={e => setApiConfig(p => ({...p, key: e.target.value}))} placeholder="Enter your secret API key" className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                     </div>
                                     {error && <p className="text-sm text-red-500">{error}</p>}
                                     <button onClick={handleCloudConnect} disabled={isConnecting || !apiConfig.url} className="btn btn-primary w-full">
                                        {isConnecting ? 'Testing Connection...' : 'Test & Connect'}
                                    </button>
                                </div>
                            {commonCloudContent}
                        </MotionDiv>
                    );
                }
                return null;
            case 'guides':
                return (
                     <MotionDiv key="step-guides" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100">Setup Instructions</h2>
                            <button onClick={() => setStep(2)} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 !py-1.5 !px-3">
                                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                Back
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
                             <SetupInstruction title="Cloud Sync with a PC Server (Recommended)" defaultOpen>
                                <CloudSyncGuideContent />
                            </SetupInstruction>
                            <SetupInstruction title="Local or Network Folder Setup">
                                <LocalFolderGuideContent />
                            </SetupInstruction>
                            <SetupInstruction title="Advanced: Deploying to Vercel">
                                <VercelGuideContent />
                            </SetupInstruction>
                             <SetupInstruction title="Advanced: Deploying to Supabase">
                                <SupabaseGuideContent />
                            </SetupInstruction>
                        </div>
                    </MotionDiv>
                );
             case 'info':
                return (
                    <MotionDiv key="step-info" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                        <AboutSystem onBack={() => setStep(1)} />
                    </MotionDiv>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900/90 dark:backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <MotionDiv 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${step === 'guides' || step === 'info' ? 'max-w-3xl' : 'max-w-xl'} min-h-[450px] flex flex-col p-8 overflow-hidden transition-all duration-300`}
            >
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
            </MotionDiv>
        </div>
    );
};

export default SetupWizard;