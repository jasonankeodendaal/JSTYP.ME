import React, { useState, useEffect } from 'react';
// FIX: Correct 'framer-motion' import for Variants type and add AnimatePresence to resolve missing name errors.
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppContext } from './context/AppContext.tsx';
// FIX: Add CubeIcon to imports to fix missing component error.
import { ServerStackIcon, ChevronRightIcon, LinkIcon, ChevronLeftIcon, BookOpenIcon, CloudSlashIcon, PaintBrushIcon, ChartBarIcon, ClipboardDocumentListIcon, ArrowPathIcon, CircleStackIcon, ShieldCheckIcon, CodeBracketIcon, ArrowDownTrayIcon, UserCircleIcon, UsersIcon, FtpIcon, CubeIcon } from './Icons.tsx';
// FIX: Consolidate react-router-dom import.
import { useNavigate } from 'react-router-dom';
import SetupInstruction from './Admin/SetupInstruction.tsx';
import { LocalFolderGuideContent, CloudSyncGuideContent, VercelGuideContent, SupabaseGuideContent, FtpGuideContent } from './Admin/SetupGuides.tsx';

const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

// FIX: Cast motion components to any to resolve framer-motion prop type errors.
const MotionDiv = motion.div as any;
const MotionSection = motion.section as any;
const MotionG = motion.g as any;

const containerVariants = {
    visible: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        }
    }
};

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

const HeroDiagram: React.FC = () => {
    const screenUiVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.5,
            },
        },
    };

    const cardVariant = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
    };

    return (
        <svg viewBox="0 0 800 500" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="hero-bg-grad-new" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="kiosk-metal" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="kiosk-screen-glow-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <filter id="hero-glow-new" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                 <filter id="floating-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.3" />
                </filter>
            </defs>
            
            <rect width="800" height="500" fill="url(#hero-bg-grad-new)" />

            {/* Fading grid */}
            <g opacity="0.1" stroke="white" strokeWidth="0.5">
                <path d="M 0 450 L 800 450" />
                <path d="M 100 0 L 100 500" transform="skewX(-30) translate(250, 0)" />
                <path d="M 200 0 L 200 500" transform="skewX(-30) translate(250, 0)" />
                <path d="M 300 0 L 300 500" transform="skewX(-30) translate(250, 0)" />
                <path d="M 400 0 L 400 500" transform="skewX(-30) translate(250, 0)" />
                <path d="M 500 0 L 500 500" transform="skewX(-30) translate(250, 0)" />
            </g>

            {/* Central Kiosk - perspective */}
            <g transform="translate(400, 260)" filter="url(#floating-shadow)">
                {/* Base */}
                <path d="M -160, 180 L -140, 200 L 140, 200 L 160, 180 L 140, 160 L -140, 160 Z" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                
                {/* Body */}
                <path d="M -90, 160 L -110, -180 L 110, -180 L 90, 160 Z" fill="url(#kiosk-metal)" />
                <path d="M 90, 160 L 110, -180 L 125, -170 L 105, 170 Z" fill="#334155" />

                {/* Screen */}
                <g>
                    <path d="M -95, -170 L -80, 150 L 80, 150 L 95, -170 Z" fill="#020617" />
                    <g filter="url(#hero-glow-new)" opacity="0.3">
                        <path d="M -95, -170 L -80, 150 L 80, 150 L 95, -170 Z" fill="url(#kiosk-screen-glow-grad)" />
                    </g>
                     <MotionG variants={screenUiVariants} initial="hidden" animate="visible" className="text-white">
                        {/* Title bar */}
                        {/* FIX: Replaced motion.g with pre-cast MotionG to resolve TypeScript error with variants prop. */}
                        <MotionG variants={cardVariant}>
                             <rect x="-70" y="-155" width="140" height="30" rx="4" fill="rgba(255,255,255,0.05)" />
                             <rect x="-65" y="-145" width="60" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
                        </MotionG>
                        {/* Main product card */}
                        {/* FIX: Replaced motion.g with pre-cast MotionG to resolve TypeScript error with variants prop. */}
                        <MotionG variants={cardVariant}>
                             <rect x="-70" y="-115" width="140" height="150" rx="4" fill="rgba(255,255,255,0.05)" />
                             <rect x="-65" y="-110" width="130" height="90" rx="2" fill="rgba(255,255,255,0.1)" />
                             <rect x="-65" y="-10" width="80" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
                             <rect x="-65" y="0" width="100" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
                        </MotionG>
                        {/* Small cards */}
                        {/* FIX: Replaced motion.g with pre-cast MotionG to resolve TypeScript error with variants prop. */}
                        <MotionG variants={cardVariant}>
                            <rect x="-70" y="45" width="65" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
                            <rect x="-65" y="50" width="55" height="40" rx="2" fill="rgba(255,255,255,0.1)" />
                        </MotionG>
                         {/* FIX: Replaced motion.g with pre-cast MotionG to resolve TypeScript error with variants prop. */}
                         <MotionG variants={cardVariant}>
                            <rect x="5" y="45" width="65" height="80" rx="4" fill="rgba(255,255,255,0.05)" />
                            <rect x="10" y="50" width="55" height="40" rx="2" fill="rgba(255,255,255,0.1)" />
                        </MotionG>
                    </MotionG>
                </g>
            </g>
        </svg>
    );
};

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
            <marker id="eco-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-gray-400 dark:text-gray-500"/></marker>
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
        
        {/* Sync Provider Node */}
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

const ValueLoopDiagramSVG: React.FC = () => {
    const iconBase = "w-8 h-8 text-white";
    return (
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
};

const AnimatedBoutiqueIcon: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="spotlight-grad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(251, 237, 188, 0.4)" />
                <stop offset="100%" stopColor="rgba(251, 237, 188, 0)" />
            </radialGradient>
            <linearGradient id="gem-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="gem-glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        <motion.path
            d="M 35 0 L 65 0 L 75 50 L 25 50 Z"
            fill="url(#spotlight-grad)"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <path d="M 30 75 L 70 75 L 75 65 L 25 65 Z" fill="#334155" />
        <rect x="35" y="55" width="30" height="10" rx="2" fill="#475569" />
        <g transform="translate(50, 45)" filter="url(#gem-glow)">
            <motion.path
                d="M 0 -10 L 10 0 L 0 10 L -10 0 Z"
                fill="url(#gem-grad)"
                stroke="#d1c4e9"
                strokeWidth="1"
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
                d="M -3 -3 L 3 3 M 3 -3 L -3 3"
                stroke="white"
                strokeWidth="1"
                strokeLinecap="round"
                animate={{ scale: [0, 1, 0], rotate: [0, 45, 90], opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            />
        </g>
    </svg>
);

const AnimatedFranchiseIcon: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="cloud-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(34, 211, 238, 0.6)" />
                <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
            </radialGradient>
        </defs>
        <g transform="translate(50, 25)">
            <motion.path
                d="M -20 0 a 10 10 0 0 1 0 -20 a 12 12 0 0 1 20 -2 a 8 8 0 0 1 15 5 a 10 10 0 0 1 0 17 z"
                fill="#0e7490"
                stroke="#67e8f9"
                strokeWidth="1.5"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx="0" cy="-5" r="20" fill="url(#cloud-glow)" />
        </g>
        <g className="fill-slate-300 dark:fill-slate-600" stroke="#475569" strokeWidth="1">
            <path d="M 15 75 l 0 -10 l 10 0 l 0 10 l -10 0 M 10 65 l 10 -5 l 10 5" />
            <path d="M 45 75 l 0 -10 l 10 0 l 0 10 l -10 0 M 40 65 l 10 -5 l 10 5" />
            <path d="M 75 75 l 0 -10 l 10 0 l 0 10 l -10 0 M 70 65 l 10 -5 l 10 5" />
        </g>
        <g fill="#22d3ee">
            {[0, 1, 2].map(i => (
                <motion.circle key={`packet-1-${i}`} r="2">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 35 C 40 45, 30 50, 25 60" begin={`${i * 0.8}s`} />
                </motion.circle>
            ))}
            {[0, 1, 2].map(i => (
                <motion.circle key={`packet-2-${i}`} r="2">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 35 C 50 45, 50 50, 50 60" begin={`${0.3 + i * 0.8}s`} />
                </motion.circle>
            ))}
            {[0, 1, 2].map(i => (
                <motion.circle key={`packet-3-${i}`} r="2">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 35 C 60 45, 70 50, 75 60" begin={`${0.6 + i * 0.8}s`} />
                </motion.circle>
            ))}
        </g>
    </svg>
);

const AnimatedB2bIcon: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="screen-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
        </defs>
        <path d="M 10 75 L 90 75 L 85 20 L 15 20 Z" fill="#334155" />
        <rect x="5" y="75" width="90" height="5" rx="2" fill="#475569" />
        <rect x="20" y="25" width="60" height="45" rx="3" fill="url(#screen-grad)" stroke="#3b82f6" strokeWidth="1.5" />
        <motion.path
            d="M 25 60 q 10 -20 20 0 t 20 5"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeDasharray="100"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <g fill="#fb923c">
            <motion.rect x="70" y="65" width="5" height="5" rx="1"
                initial={{ y: 65, height: 5 }}
                animate={{ y: [65, 55, 65], height: [5, 15, 5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.rect x="70" y="65" width="5" height="5" rx="1" transform="translate(-8, 0)"
                initial={{ y: 65, height: 5 }}
                animate={{ y: [65, 50, 65], height: [5, 20, 5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
        </g>
        <motion.g
            initial={{ x: 50, y: 50, opacity: 0, scale: 0.5 }}
            animate={{ x: [50, 75, 75], y: [50, 15, 15], opacity: [0, 1, 0], scale: [0.5, 1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "circOut", delay: 1 }}
        >
            <rect x="0" y="0" width="18" height="22" rx="2" fill="#f0f9ff" stroke="#60a5fa" strokeWidth="1" />
            <path d="M 3 5 h 12 M 3 9 h 12 M 3 13 h 8" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
        </motion.g>
    </svg>
);

export const AboutSystem: React.FC<AboutSystemProps> = ({ onBack, isDashboard = false }) => {
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
                <MotionDiv variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
                    <MotionSection variants={itemVariants} className="text-center flex flex-col items-center justify-center min-h-[50vh] md:min-h-[80vh] px-6 py-16">
                        <div className="w-full max-w-4xl"><HeroDiagram /></div>
                        <h1 className="text-3xl md:text-5xl font-bold section-heading text-gray-800 dark:text-white mt-8">The Retail OS</h1>
                        <p className="max-w-3xl mx-auto mt-4 text-lg text-gray-600 dark:text-gray-400">Bridging Your Physical Space with Digital Intelligence</p>
                        <div className="mt-6 max-w-prose mx-auto text-sm space-y-3 text-gray-500 dark:text-gray-400">
                           <p>In today's retail landscape, the digital and physical worlds are often disconnected. Customers browse online but purchase in-store; they discover in-store but research on their phones. This system was born from a simple yet powerful idea: **your physical retail space should be as dynamic, informative, and measurable as your website.**</p>
                           <p>It's engineered to be more than just a digital sign—it's a strategic platform designed to digitize your in-store customer journey. By providing an interactive, engaging experience, it empowers you with the tools to create a seamless brand story, capture actionable data that was previously invisible, and ultimately, convert passive browsing into active sales engagement.</p>
                       </div>
                    </MotionSection>

                    <MotionSection variants={itemVariants} className="py-16 sm:py-24 px-6 bg-gray-50 dark:bg-gray-700/20">
                        <SystemEcosystemDiagram />
                    </MotionSection>
                    
                     <MotionSection variants={itemVariants} className="py-16 sm:py-24 px-6">
                        <ValueLoopDiagram />
                    </MotionSection>

                    <MotionSection variants={itemVariants} className="py-16 sm:py-24 px-6 bg-gray-50 dark:bg-gray-700/20">
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
                    </MotionSection>

                    <MotionSection variants={itemVariants} className="py-16 sm:py-24 px-6">
                        <div className="max-w-5xl mx-auto">
                            <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-8 section-heading text-center">Perfect For Any Environment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* FIX: Replaced incorrect component names with correct ones. */}
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><AnimatedBoutiqueIcon /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">High-End Boutiques</h4><p className="text-xs text-gray-500 dark:text-gray-400">Provide a sophisticated, interactive catalogue.</p></div>
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><AnimatedFranchiseIcon /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">Multi-Location Franchises</h4><p className="text-xs text-gray-500 dark:text-gray-400">Ensure brand consistency and manage data centrally.</p></div>
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><AnimatedB2bIcon /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">B2B & Trade Shows</h4><p className="text-xs text-gray-500 dark:text-gray-400">Capture leads and generate quotes instantly.</p></div>
                            </div>
                        </div>
                    </MotionSection>

                    <MotionSection variants={itemVariants} className="py-16 sm:py-24 px-6 bg-gray-50 dark:bg-gray-700/20">
                        <div className="max-w-3xl mx-auto text-center">
                            <h3 className="font-bold text-2xl text-gray-800 dark:text-white mb-4 section-heading flex items-center justify-center gap-3"><ArrowDownTrayIcon className="w-6 h-6"/><span>Project Source Code</span></h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This application is open-source and designed to be fully self-hostable. For developers, the complete project source code can be downloaded from GitHub.</p>
                            <a href="https://github.com/jasonankeodendaal/JSTYP.ME.git" target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full sm:w-auto">
                                Click Me
                            </a>
                        </div>
                    </MotionSection>
                </MotionDiv>
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
    
    // State for the redesigned guides section
    type GuideID = 'cloud' | 'local' | 'ftp' | 'vercel' | 'supabase';
    const [activeGuide, setActiveGuide] = useState<GuideID>('cloud');

    const guides: { id: GuideID; title: string; component: React.ComponentType }[] = [
        { id: 'cloud', title: 'Cloud Sync (PC Server)', component: CloudSyncGuideContent },
        { id: 'local', title: 'Local Folder', component: LocalFolderGuideContent },
        { id: 'ftp', title: 'FTP Server', component: FtpGuideContent },
        { id: 'vercel', title: 'Vercel', component: VercelGuideContent },
        { id: 'supabase', title: 'Supabase', component: SupabaseGuideContent },
    ];
    // FIX: Resolve type error by using a more general component type and ensuring the result is not undefined before rendering.
    const activeGuideData = guides.find(g => g.id === activeGuide);
    const ActiveGuideContent = activeGuideData?.component;

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
                     <MotionDiv key="step-guides" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full">
                        <div className="flex-shrink-0">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100">Setup Instructions</h2>
                                <button onClick={() => setStep(2)} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 !py-1.5 !px-3">
                                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                    Back
                                </button>
                            </div>
                             <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav className="flex items-center flex-wrap gap-x-4 -mb-px">
                                    {guides.map(guide => (
                                        <button
                                            key={guide.id}
                                            onClick={() => setActiveGuide(guide.id)}
                                            className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                activeGuide === guide.id
                                                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                        >
                                            {guide.title}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                        
                        <div className="flex-grow min-h-0 pt-4">
                            <div className="h-full bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                <AnimatePresence mode="wait">
                                    <MotionDiv
                                        key={activeGuide}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full overflow-y-auto p-1"
                                    >
                                        {ActiveGuideContent && activeGuideData && (
                                            <SetupInstruction title={activeGuideData.title} defaultOpen>
                                                <ActiveGuideContent />
                                            </SetupInstruction>
                                        )}
                                    </MotionDiv>
                                </AnimatePresence>
                            </div>
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
                className={`bg-white dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isInfoStep ? 'w-full h-full rounded-none p-0' : 'rounded-2xl w-full max-w-xl min-h-[450px] p-8'} ${step === 'guides' ? '!max-w-4xl !min-h-[600px] h-[80vh]' : ''}`}
            >
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
            </MotionDiv>
        </div>
    );
};

export default SetupWizard;