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
                <text x="150" y="150" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-white/80 font-semibold">Offline-First</text>
            </motion.g>
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
                <text x="650" y="150" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-white/80 font-semibold">Cloud Sync</text>
            </motion.g>
             <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}>
                <text x="100" y="300" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-white/80 font-semibold">Analytics</text>
            </motion.g>
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}>
                <text x="700" y="300" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-white/80 font-semibold">Customizable</text>
            </motion.g>
        </g>
    </svg>
);

const SystemEcosystemDiagram: React.FC = () => (
    <div className="text-center">
        <div className="max-w-prose mx-auto text-sm space-y-3">
            <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-4 section-heading">How It Works: The Offline-First Core</h3>
            <p>The kiosk is engineered for resilience. At its heart, it's a completely self-sufficient Progressive Web App (PWA) that stores all its data locally on the device. This <strong>offline-first architecture</strong> means it's incredibly fast and reliable. It doesn't need a constant internet connection to function perfectly, ensuring a smooth customer experience even with unstable network conditions.</p>
            <p>For multi-device setups or centralized management, it uses an <strong>optional sync provider</strong> (like a local network folder or a cloud server) to keep all kiosks updated. This hybrid model gives you the best of both worlds: the rock-solid stability of an offline app with the powerful scalability of the cloud.</p>
        </div>
        <div className="mt-8"><SystemEcosystemDiagramSVG /></div>
    </div>
);

const SystemEcosystemDiagramSVG: React.FC = () => (
    <svg viewBox="0 0 550 280" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
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
            <text x="0" y="-55" textAnchor="middle" className="text-xl font-bold fill-gray-800 dark:fill-gray-100 section-heading" style={{ transform: 'translateY(25px)' }}>Kiosk Device</text>
            <foreignObject x="-90" y="-20" width="180" height="100">
                <div className="text-center text-sm text-gray-700 dark:text-gray-300 font-semibold">Offline-First Core</div>
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">React UI + Local Database for speed and reliability.</div>
                <div className="mt-4 text-center text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-full px-3 py-1 inline-block">FAST & RELIABLE</div>
            </foreignObject>
        </g>
        
        {/* Cloud Node */}
        <g transform="translate(430 140)" filter="url(#card-shadow)">
            <path d="M -110 -95 L 110 -95 L 110 95 L -110 95 Z" transform="skewX(-5)" className="fill-gray-100/80 dark:fill-gray-800/80 stroke-gray-200/50 dark:stroke-gray-700/50 rounded-2xl"/>
            <path d="M -110 -95 L 110 -95 L 110 95 L -110 95 Z" transform="skewX(-5)" fill="url(#card-grad)" className="rounded-2xl"/>
            <text x="0" y="-55" textAnchor="middle" className="text-xl font-bold fill-gray-800 dark:fill-gray-100 section-heading" style={{ transform: 'translateY(25px)' }}>Sync Provider</text>
            <foreignObject x="-90" y="-20" width="180" height="100">
                <div className="text-center text-sm text-gray-700 dark:text-gray-300 font-semibold">Optional & Flexible</div>
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">Cloud API or a Local/Network folder for data sync.</div>
                <div className="mt-4 text-center text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 rounded-full px-3 py-1 inline-block">CENTRALIZED</div>
            </foreignObject>
        </g>

        {/* Connection Arrows */}
        <g className="text-gray-400 dark:text-gray-500">
            <path d="M 210 110 C 250 75, 330 75, 370 110" fill="none" className="stroke-current" strokeWidth="1.5" markerEnd="url(#eco-arrowhead)" strokeDasharray="4 4"/>
            <path d="M 370 170 C 330 205, 250 205, 210 170" fill="none" className="stroke-current" strokeWidth="1.5" markerEnd="url(#eco-arrowhead)" strokeDasharray="4 4"/>
            <text x="290" y="70" textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">Push Changes (Sync)</text>
            <text x="290" y="215" textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">Pull Updates</text>
        </g>
    </svg>
);


const ValueLoopDiagram: React.FC = () => (
    <div className="text-center">
        <div className="max-w-prose mx-auto text-sm space-y-3">
            <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-4 section-heading">The Value Loop: Turning Browsing into Insight</h3>
            <p>By turning passive browsing into active engagement, the kiosk transforms your physical space into a source of rich customer data. Track which products are most viewed, which brands are most popular, and understand what your customers are truly interested in—all before they even speak to a sales associate.</p>
            <ul className="list-disc list-outside pl-5 mt-2 space-y-2 text-left">
                <li><strong>Empower Sales Staff:</strong> Use the "Create Quote" feature to build client orders directly from the kiosk.</li>
                <li><strong>Gain Actionable Insights:</strong> Built-in analytics provide a clear picture of in-store customer behavior.</li>
                <li><strong>Enhance Customer Experience:</strong> Offer customers a modern, self-service way to explore your entire catalogue.</li>
            </ul>
        </div>
        <div className="mt-8"><ValueLoopDiagramSVG /></div>
    </div>
);

const ValueLoopDiagramSVG: React.FC = () => (
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
        </g>
        <text x="150" y="95" textAnchor="middle" className="font-bold text-sm fill-gray-800 dark:fill-gray-100">Customer Interaction</text>

        <g transform="translate(230, 150)" className="cursor-pointer" filter="url(#val-shadow)">
            <circle r="32" className="fill-white dark:fill-gray-700"/>
            <circle r="28" fill="url(#val-grad-2)"/>
        </g>
        <text x="230" y="205" textAnchor="middle" className="font-bold text-sm fill-gray-800 dark:fill-gray-100">Actionable Analytics</text>

        <g transform="translate(70, 150)" className="cursor-pointer" filter="url(#val-shadow)">
            <circle r="32" className="fill-white dark:fill-gray-700"/>
            <circle r="28" fill="url(#val-grad-3)"/>
        </g>
        <text x="70" y="205" textAnchor="middle" className="font-bold text-sm fill-gray-800 dark:fill-gray-100">Smarter Decisions</text>
    </svg>
);

const ScenarioBoutiqueDiagram: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="boutique-glow-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="boutique-glow-filter">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <path d="M25 75 V 25 C 25 10, 75 10, 75 25 V 75" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="6" strokeLinecap="round" />
        <g filter="url(#boutique-glow-filter)">
            <rect x="42" y="50" width="16" height="25" rx="2" fill="url(#boutique-glow-grad)" />
        </g>
    </svg>
);

const ScenarioFranchiseDiagram: React.FC = () => {
    const storeIcon = <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />;
    const iconStyle = "fill-none text-slate-500 dark:text-slate-400";
    
    return (
        <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="franchise-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient>
            </defs>
            <path d="M50 25 C 30 35, 25 50, 25 60" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M50 25 C 50 35, 50 50, 50 60" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M50 25 C 70 35, 75 50, 75 60" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="3 3"/>
            <circle cx="50" cy="25" r="12" fill="url(#franchise-grad)" className="stroke-white/50 dark:stroke-black/50" strokeWidth="1"/>
            <ServerStackIcon className="w-5 h-5 text-white" x="42.5" y="17.5" />
            
            <g transform="translate(18, 58) scale(0.35)" className={iconStyle}>{storeIcon}</g>
            <g transform="translate(42.5, 58) scale(0.35)" className={iconStyle}>{storeIcon}</g>
            <g transform="translate(67.5, 58) scale(0.35)" className={iconStyle}>{storeIcon}</g>
        </svg>
    );
};

const ScenarioB2bDiagram: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <marker id="b2b-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-400 dark:fill-slate-500" />
            </marker>
        </defs>
        <UserCircleIcon x="15" y="45" className="w-10 h-10 text-slate-400 dark:text-slate-500"/>
        <rect x="42" y="30" width="16" height="25" rx="2" className="fill-indigo-500" />
        <rect x="43" y="32" width="14" height="18" rx="1" className="fill-purple-300" />
        <path d="M58 42 C 68 42, 68 32, 78 32" strokeWidth="1.5" className="stroke-slate-400 dark:stroke-slate-500" fill="none" strokeDasharray="2 2" markerEnd="url(#b2b-arrow)"/>
        <ClipboardDocumentListIcon x="75" y="15" className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
    </svg>
);

export const AboutSystem: React.FC<AboutSystemProps> = ({ onBack, isDashboard = false }) => {
    const { getFileUrl, projectZipBlob } = useAppContext();
    const [isAvailable, setIsAvailable] = useState(false);
    const [zipUrl, setZipUrl] = useState('');
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let isMounted = true;
        let objectUrlToRevoke: string | null = null;
    
        const checkAvailability = async () => {
            setIsChecking(true);
            if (projectZipBlob) {
                objectUrlToRevoke = URL.createObjectURL(projectZipBlob);
                if (isMounted) {
                    setZipUrl(objectUrlToRevoke); setIsAvailable(true); setIsChecking(false);
                }
                return;
            }
            try {
                const url = await getFileUrl('project.zip');
                if (!url) { if (isMounted) setIsAvailable(false); return; }
                const response = await fetch(url, { method: 'HEAD' });
                if (isMounted) {
                    if (response.ok) { setIsAvailable(true); setZipUrl(url); } else { setIsAvailable(false); }
                }
            } catch (error) { if (isMounted) setIsAvailable(false); } 
            finally { if (isMounted) setIsChecking(false); }
        };
        checkAvailability();
        return () => { isMounted = false; if (objectUrlToRevoke) { URL.revokeObjectURL(objectUrlToRevoke); } };
    }, [getFileUrl, projectZipBlob]);
    
    return (
        <div className={`w-full h-full ${isDashboard ? 'bg-transparent' : 'bg-slate-900 text-gray-300'} relative`}>
            {(onBack && !isDashboard) && (
                <div className="sticky top-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-sm z-10 flex justify-between items-center">
                    <h2 className="text-xl font-bold section-heading text-gray-100">About The System</h2>
                    <button onClick={onBack} className="btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 !py-1.5 !px-3">
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Back
                    </button>
                </div>
            )}
            <div className={`w-full ${onBack && !isDashboard ? 'h-[calc(100%-68px)]' : 'h-full'} overflow-y-auto`}>
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
                    <motion.section variants={itemVariants} className="text-center flex flex-col items-center justify-center min-h-[50vh] md:min-h-[80vh] px-6 py-16">
                        <div className="w-full max-w-4xl"><HeroDiagram /></div>
                        <h1 className="text-3xl md:text-5xl font-bold section-heading text-gray-800 dark:text-white mt-8">The Retail OS</h1>
                        <p className="max-w-3xl mx-auto mt-4 text-lg text-gray-600 dark:text-gray-400">Bridging Your Physical Space with Digital Intelligence</p>
                        <div className="mt-6 max-w-prose mx-auto text-sm space-y-3 text-gray-500 dark:text-gray-400">
                           <p>In today's retail landscape, the digital and physical worlds are often disconnected. Customers browse online but purchase in-store; they discover in-store but research on their phones. This system was born from a simple yet powerful idea: **your physical retail space should be as dynamic, informative, and measurable as your website.**</p>
                           <p>It's engineered to be more than just a digital sign—it's a strategic platform designed to digitize your in-store customer journey. By providing an interactive, engaging experience, it empowers you with the tools to create a seamless brand story, capture actionable data that was previously invisible, and ultimately, convert passive browsing into active sales engagement.</p>
                       </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="py-16 sm:py-24 px-6 bg-gray-50 dark:bg-gray-700/20">
                        <SystemEcosystemDiagram />
                    </motion.section>
                    
                     <motion.section variants={itemVariants} className="py-16 sm:py-24 px-6">
                        <ValueLoopDiagram />
                    </motion.section>

                    <motion.section variants={itemVariants} className="py-16 sm:py-24 px-6 bg-gray-50 dark:bg-gray-700/20">
                        <div className="max-w-5xl mx-auto">
                            <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-8 section-heading text-center">Key Features at a Glance</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 text-sm">
                                <FeatureItem icon={<CloudSlashIcon className="w-5 h-5"/>} title="Offline-First Reliability">Runs flawlessly with or without an internet connection, ensuring 100% uptime.</FeatureItem>
                                <FeatureItem icon={<ArrowPathIcon className="w-5 h-5"/>} title="Flexible Syncing">Use a local network folder or a cloud API for multi-location franchises.</FeatureItem>
                                <FeatureItem icon={<CircleStackIcon className="w-5 h-5"/>} title="Centralized Management">Update product data from a single admin panel and sync changes everywhere.</FeatureItem>
                                <FeatureItem icon={<BookOpenIcon className="w-5 h-5"/>} title="Rich Content">Display beautiful catalogues, pamphlets, and full-screen video ads.</FeatureItem>
                                <FeatureItem icon={<ChartBarIcon className="w-5 h-5"/>} title="Customer Analytics">Track product and brand views to understand what's popular.</FeatureItem>
                                <FeatureItem icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} title="Integrated Sales Tool">Generate client quotes directly from the kiosk interface.</FeatureItem>
                                <FeatureItem icon={<PaintBrushIcon className="w-5 h-5"/>} title="Deep Customization">Control every aspect of the look and feel, from colors and fonts to layout.</FeatureItem>
                                <FeatureItem icon={<ShieldCheckIcon className="w-5 h-5"/>} title="Secure & Multi-User">Role-based admin access with specific permissions.</FeatureItem>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="py-16 sm:py-24 px-6">
                        <div className="max-w-5xl mx-auto">
                            <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-8 section-heading text-center">Perfect For Any Environment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><ScenarioBoutiqueDiagram /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">High-End Boutiques</h4><p className="text-xs text-gray-500 dark:text-gray-400">Provide a sophisticated, interactive catalogue.</p></div>
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><ScenarioFranchiseDiagram /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">Multi-Location Franchises</h4><p className="text-xs text-gray-500 dark:text-gray-400">Ensure brand consistency and manage data centrally.</p></div>
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><ScenarioB2bDiagram /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">B2B & Trade Shows</h4><p className="text-xs text-gray-500 dark:text-gray-400">Capture leads and generate quotes instantly.</p></div>
                            </div>
                        </div>
                    </motion.section>

                    <motion.section variants={itemVariants} className="py-16 sm:py-24 px-6 bg-gray-50 dark:bg-gray-700/20">
                        <div className="max-w-3xl mx-auto text-center">
                            <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-4 section-heading flex items-center justify-center gap-3"><ArrowDownTrayIcon className="w-6 h-6"/><span>Project Source Code</span></h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This application is designed to be fully self-hostable. For developers, the complete project source code can be made available for download here. An administrator must first upload the <code>project.zip</code> file in the <strong>System &rarr; Backup &amp; Restore</strong> section.</p>
                            {isChecking ? (<button className="btn btn-primary w-full sm:w-auto" disabled>Checking for file...</button>) : isAvailable ? (<a href={zipUrl} download="kiosk-project.zip" className="btn btn-primary w-full sm:w-auto">Download Full Project (.zip)</a>) : (<button className="btn btn-primary w-full sm:w-auto" disabled>Download Unavailable</button>)}
                            {!isAvailable && !isChecking && (<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">No project.zip file has been uploaded by the administrator yet.</p>)}
                        </div>
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
                    <MotionDiv key="step-info" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="h-full">
                        <AboutSystem onBack={() => setStep(1)} />
                    </MotionDiv>
                );
            default:
                return null;
        }
    };
    
    const isInfoStep = step === 'info';

    return (
        <div className={`fixed inset-0 bg-gray-100 dark:bg-gray-900/90 dark:backdrop-blur-sm z-[100] flex items-center justify-center ${isInfoStep ? '' : 'p-4'}`}>
            <MotionDiv 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className={`bg-white dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isInfoStep ? 'w-full h-full rounded-none p-0' : 'rounded-2xl w-full max-w-xl min-h-[450px] p-8'} ${step === 'guides' ? '!max-w-3xl' : ''}`}
            >
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
            </MotionDiv>
        </div>
    );
};

export default SetupWizard;