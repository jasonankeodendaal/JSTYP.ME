import React, { useState, useEffect } from 'react';
// FIX: Correct 'framer-motion' import for Variants type.
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppContext } from './context/AppContext.tsx';
import { ServerStackIcon, ChevronRightIcon, LinkIcon, ChevronLeftIcon, BookOpenIcon, CloudSlashIcon, PaintBrushIcon, ChartBarIcon, ClipboardDocumentListIcon, ArrowPathIcon, CircleStackIcon, ShieldCheckIcon, CodeBracketIcon, ArrowDownTrayIcon, UserCircleIcon, UsersIcon, FtpIcon } from './Icons.tsx';
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
            <MotionG initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
                <text x="150" y="150" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-white/80 font-semibold">Offline-First</text>
            </MotionG>
            <MotionG initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
                <text x="650" y="150" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-white/80 font-semibold">Cloud Sync</text>
            </MotionG>
             <MotionG initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}>
                <text x="100" y="300" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-white/80 font-semibold">Analytics</text>
            </MotionG>
            <MotionG initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}>
                <text x="700" y="300" textAnchor="middle" dominantBaseline="middle" className="text-lg fill-white/80 font-semibold">Customizable</text>
            </MotionG>
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
            <marker id="eco-arrowhead-push" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-indigo-400"/></marker>
            <marker id="eco-arrowhead-pull" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-purple-400"/></marker>
            <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur"/><feOffset in="blur" dy="5" result="offsetBlur"/><feMerge><feMergeNode in="offsetBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* Central Kiosk Device */}
        <g transform="translate(130 140)">
            <rect x="-90" y="-110" width="180" height="220" rx="20" className="fill-gray-100 dark:fill-gray-800" filter="url(#card-shadow)"/>
            <foreignObject x="-80" y="-100" width="160" height="200">
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="relative w-20 h-20">
                        <svg viewBox="0 0 24 24" className="w-full h-full text-indigo-500 dark:text-indigo-400"><path fill="currentColor" d="M19.5 22H4.5A2.5 2.5 0 0 1 2 19.5V4.5A2.5 2.5 0 0 1 4.5 2h15A2.5 2.5 0 0 1 22 4.5v15a2.5 2.5 0 0 1-2.5 2.5ZM4.5 3.5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V4.5a1 1 0 0 0-1-1Z"/><path fill="currentColor" d="M12 18.5a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 1 0v12a.5.5 0 0 1-.5.5Z"/></svg>
                        <div className="absolute -bottom-2 -right-2 p-1.5 bg-green-100 dark:bg-green-900 rounded-full"><CircleStackIcon className="w-5 h-5 text-green-600 dark:text-green-400"/></div>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-gray-800 dark:text-white section-heading">Kiosk Device</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">On-device PWA & Database</p>
                    <div className="mt-4 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-full px-3 py-1">Instant & Always On</div>
                </div>
            </foreignObject>
        </g>
        
        {/* Sync Provider */}
        <g transform="translate(420 140)">
             <rect x="-90" y="-110" width="180" height="220" rx="20" className="fill-gray-100 dark:fill-gray-800" filter="url(#card-shadow)"/>
             <foreignObject x="-80" y="-100" width="160" height="200">
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="relative w-20 h-20">
                        <svg viewBox="0 0 24 24" className="w-full h-full text-purple-500 dark:text-purple-400"><path fill="currentColor" d="M6.5 20q-1.875 0-3.188-1.313T2 15.5q0-1.65 1.025-2.925T5.75 11.25q.3-.825 1-1.488T8.5 9q0-2.275 1.613-3.888T14 3.5q2.9 0 4.95 2.05T21 10.5q0 .375-.025.738T20.9 11.8q1.55.3 2.575 1.575T24.5 16.5q0 1.875-1.313 3.188T20 20Z"/></svg>
                        <div className="absolute -bottom-2 -right-2 p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full"><ServerStackIcon className="w-5 h-5 text-blue-600 dark:text-blue-400"/></div>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-gray-800 dark:text-white section-heading">Sync Provider</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cloud API or Local Folder</p>
                    <div className="mt-4 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 rounded-full px-3 py-1">Centralized & Scalable</div>
                </div>
            </foreignObject>
        </g>

        {/* Animated Connection Arrows */}
        <g>
            <path id="push-path" d="M 220 115 C 260 80, 310 80, 350 115" fill="none" className="stroke-indigo-400/80" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#eco-arrowhead-push)"/>
            <path id="pull-path" d="M 350 165 C 310 200, 260 200, 220 165" fill="none" className="stroke-purple-400/80" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#eco-arrowhead-pull)"/>
            <text x="285" y="70" textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">Push Changes (Sync)</text>
            <text x="285" y="215" textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">Pull Updates</text>
            
            <circle r="3" className="fill-indigo-400"><animateMotion dur="4s" repeatCount="indefinite" rotate="auto"><mpath href="#push-path"/></animateMotion></circle>
            <circle r="3" className="fill-indigo-400"><animateMotion dur="4s" repeatCount="indefinite" begin="-1s" rotate="auto"><mpath href="#push-path"/></animateMotion></circle>
            <circle r="3" className="fill-indigo-400"><animateMotion dur="4s" repeatCount="indefinite" begin="-2s" rotate="auto"><mpath href="#push-path"/></animateMotion></circle>
            
            <circle r="3" className="fill-purple-400"><animateMotion dur="4s" repeatCount="indefinite" rotate="auto"><mpath href="#pull-path"/></animateMotion></circle>
            <circle r="3" className="fill-purple-400"><animateMotion dur="4s" repeatCount="indefinite" begin="-1.3s" rotate="auto"><mpath href="#pull-path"/></animateMotion></circle>
            <circle r="3" className="fill-purple-400"><animateMotion dur="4s" repeatCount="indefinite" begin="-2.6s" rotate="auto"><mpath href="#pull-path"/></animateMotion></circle>
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
    <svg viewBox="0 0 200 120" className="w-full h-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="boutique-floor-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#475569"/><stop offset="100%" stopColor="#334155"/></linearGradient>
            <linearGradient id="boutique-wall-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1e293b"/><stop offset="100%" stopColor="#334155"/></linearGradient>
            <linearGradient id="boutique-screen-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient>
        </defs>
        <path d="M 0 120 L 200 120 L 200 60 L 0 80 Z" fill="url(#boutique-floor-grad)" />
        <path d="M 0 80 L 200 60 L 200 0 L 0 0 Z" fill="url(#boutique-wall-grad)" />
        <g transform="translate(100 75)">
            <path d="M -25 35 L -30 40 L 30 40 L 25 35 Z" fill="#475569" />
            <path d="M -18 -40 L -25 35 L 25 35 L 18 -40 Z" fill="#1e293b" />
            <rect x="-20" y="-45" width="40" height="65" rx="3" fill="#0f172a" />
            <rect x="-18" y="-43" width="36" height="61" rx="2" fill="url(#boutique-screen-grad)" />
        </g>
        <g transform="translate(30 85)">
          <path d="M -25 0 L 45 0 L 50 -15 L -20 -15 Z" fill="#334155" />
          <path d="M -25 0 V -25 L -20 -40 L -20 -15 Z" fill="#475569" />
          <path d="M -25 -25 L 45 -25 L 50 -40 L -20 -40 Z" fill="#1e293b" />
        </g>
         <g transform="translate(160 80)">
          <rect x="-25" y="0" width="50" height="3" rx="1.5" fill="#475569" />
          <rect x="-2" y="-30" width="4" height="30" fill="#475569" />
          <rect x="-20" y="-30" width="40" height="4" rx="2" fill="#334155" />
          <path d="M -15 -28 v 15 l 5 5 v -20 z" fill="#a78bfa" opacity="0.7"/>
          <path d="M -5 -28 v 18 l 5 4 v -22 z" fill="#6366f1" opacity="0.7"/>
          <path d="M 5 -28 v 16 l 5 2 v -18 z" fill="#818cf8" opacity="0.7"/>
        </g>
    </svg>
);

const ScenarioFranchiseDiagram: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="franchise-cloud-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#6366f1"/></linearGradient>
        </defs>
        <g transform="translate(100 40)">
            <path d="M -30 0 C -50 -20, -20 -40, 0 -30 C 20 -50, 50 -30, 40 0 C 60 20, 20 30, 0 20 C -20 30, -50 20, -30 0 Z" fill="url(#franchise-cloud-grad)" />
            <path d="M -30 0 C -50 -20, -20 -40, 0 -30 C 20 -50, 50 -30, 40 0 C 60 20, 20 30, 0 20 C -20 30, -50 20, -30 0 Z" fill="white" opacity="0.3" transform="translate(-5, 2) scale(0.6)" />
        </g>
        <g className="store" transform="translate(35 100)"><path d="M -20 -20 L 20 -20 L 20 20 L -20 20 Z" fill="#334155"/><path d="M -25 -10 L 25 -10 L 0 -30 Z" fill="#475569"/><rect x="-8" y="-5" width="16" height="25" fill="#1e293b"/></g>
        <g className="store" transform="translate(100 100)"><path d="M -20 -20 L 20 -20 L 20 20 L -20 20 Z" fill="#334155"/><path d="M -25 -10 L 25 -10 L 0 -30 Z" fill="#475569"/><rect x="-8" y="-5" width="16" height="25" fill="#1e293b"/></g>
        <g className="store" transform="translate(165 100)"><path d="M -20 -20 L 20 -20 L 20 20 L -20 20 Z" fill="#334155"/><path d="M -25 -10 L 25 -10 L 0 -30 Z" fill="#475569"/><rect x="-8" y="-5" width="16" height="25" fill="#1e293b"/></g>
        <g fill="url(#franchise-cloud-grad)">
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 90 55 C 60 70, 45 80, 35 90" /></circle>
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 90 55 C 60 70, 45 80, 35 90" begin="-1s"/></circle>
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 90 55 C 60 70, 45 80, 35 90" begin="-2s"/></circle>
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 100 55 V 90" /></circle>
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 100 55 V 90" begin="-1s"/></circle>
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 100 55 V 90" begin="-2s"/></circle>
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 110 55 C 140 70, 155 80, 165 90" /></circle>
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 110 55 C 140 70, 155 80, 165 90" begin="-1s"/></circle>
            <circle r="3"><animateMotion dur="3s" repeatCount="indefinite" path="M 110 55 C 140 70, 155 80, 165 90" begin="-2s"/></circle>
        </g>
    </svg>
);

const ScenarioB2bDiagram: React.FC = () => (
    <svg viewBox="0 0 200 120" className="w-full h-40" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="b2b-wall-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#334155"/><stop offset="100%" stopColor="#475569"/></linearGradient></defs>
        <path d="M 10 110 L 10 10 L 190 10 L 190 110 L 170 110 L 170 30 L 30 30 L 30 110 Z" fill="url(#b2b-wall-grad)" />
        <path d="M 10 10 L 30 30" stroke="#1e293b" strokeWidth="2" /><path d="M 190 10 L 170 30" stroke="#1e293b" strokeWidth="2" />
        <g transform="translate(60 75)"><circle cx="0" cy="-15" r="8" fill="#a78bfa" /><path d="M -12 0 C -12 15, 12 15, 12 0 Z" fill="#818cf8"/></g>
        <g transform="translate(110 70)"><path d="M -15 35 L -18 40 L 18 40 L 15 35 Z" fill="#475569" /><path d="M -10 -30 L -15 35 L 15 35 L 10 -30 Z" fill="#1e293b" /><rect x="-12" y="-35" width="24" height="55" rx="2" fill="#0f172a" /><rect x="-11" y="-34" width="22" height="53" rx="1.5" fill="#6366f1" /></g>
        <g transform="translate(160 55)"><path d="M -15 -20 L 15 -20 L 15 20 L -15 20 Z" fill="#cbd5e1" rx="2" /><rect x="-10" y="-12" width="20" height="2" fill="#94a3b8" /><rect x="-10" y="-6" width="15" height="2" fill="#94a3b8" /><rect x="-10" y="0" width="20" height="2" fill="#94a3b8" /><rect x="-10" y="6" width="10" height="2" fill="#94a3b8" /></g>
        <g fill="#a78bfa"><circle r="2.5"><animateMotion dur="2s" repeatCount="indefinite" path="M 125 50 C 135 40, 145 40, 155 50" /></g>
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
                                <FeatureItem icon={<CloudSlashIcon className="w-5 h-5"/>} title="Offline-First Reliability">Engineered to run flawlessly with or without an internet connection, guaranteeing a premium user experience free from network lag or outages.</FeatureItem>
                                <FeatureItem icon={<ArrowPathIcon className="w-5 h-5"/>} title="Flexible Syncing">Choose a backend that fits your scale: a simple local network folder for a single store, or a scalable cloud API to manage an entire network of franchises.</FeatureItem>
                                <FeatureItem icon={<CircleStackIcon className="w-5 h-5"/>} title="Centralized Management">Command your entire fleet of kiosks from one place. Update product data, launch promotions, and sync changes to all devices instantly.</FeatureItem>
                                <FeatureItem icon={<BookOpenIcon className="w-5 h-5"/>} title="Rich Content & Media">Captivate your audience with beautiful digital catalogues, interactive pamphlets, and full-screen video ads that bring your products and brand story to life.</FeatureItem>
                                <FeatureItem icon={<ChartBarIcon className="w-5 h-5"/>} title="Actionable Analytics">Turn passive browsing into business intelligence. Track product and brand views on each kiosk to understand in-store trends and inform inventory decisions.</FeatureItem>
                                <FeatureItem icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} title="Integrated Sales Tool">Empower your sales staff to generate detailed client quotes, check specifications, and assist customers directly from the kiosk interface.</FeatureItem>
                                <FeatureItem icon={<PaintBrushIcon className="w-5 h-5"/>} title="Deep Customization">Tailor every pixel to your brand with deep control over colors, typography, layout, transition effects, and custom branding for a unique experience.</FeatureItem>
                                <FeatureItem icon={<ShieldCheckIcon className="w-5 h-5"/>} title="Secure & Multi-User">Maintain security with a robust multi-user admin system. Create multiple administrator accounts with granular, role-based permissions.</FeatureItem>
                            </div>
                        </div>
                    </MotionSection>

                    <MotionSection variants={itemVariants} className="py-16 sm:py-24 px-6">
                        <div className="max-w-5xl mx-auto">
                            <h3 className="font-bold text-2xl md:text-3xl text-gray-800 dark:text-white mb-12 section-heading text-center">Perfect For Any Environment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center p-6 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col">
                                    <ScenarioBoutiqueDiagram />
                                    <h4 className="font-bold text-lg mt-6 text-white underline decoration-indigo-400 decoration-2 underline-offset-4">High-End Boutiques & Showrooms</h4>
                                    <p className="text-sm text-slate-400 mt-3 flex-grow">Transform your showroom into a modern, tactile gallery. The kiosk acts as a silent, expert salesperson, presenting your entire collection with stunning visuals and detailed information. It creates an 'endless aisle,' allowing customers to discover products beyond your physical inventory. This not only elevates the perception of your brand but also frees up staff to focus on personalized service and closing sales.</p>
                                </div>
                                <div className="text-center p-6 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col">
                                    <ScenarioFranchiseDiagram />
                                    <h4 className="font-bold text-lg mt-6 text-white underline decoration-indigo-400 decoration-2 underline-offset-4">Multi-Location Franchises</h4>
                                    <p className="text-sm text-slate-400 mt-3 flex-grow">Achieve unparalleled brand consistency and operational efficiency across all your locations. From a single central dashboard, deploy new products, pricing, and promotional campaigns to every kiosk instantly. Eliminate the recurring costs and logistical headaches of printing and shipping physical marketing materials, while gathering uniform, real-time analytics from every store to make data-driven decisions.</p>
                                </div>
                                <div className="text-center p-6 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col">
                                    <ScenarioB2bDiagram />
                                    <h4 className="font-bold text-lg mt-6 text-white underline decoration-indigo-400 decoration-2 underline-offset-4">B2B & Trade Shows</h4>
                                    <p className="text-sm text-slate-400 mt-3 flex-grow">Dominate your next trade show and streamline your B2B sales process. The kiosk becomes your interactive sales toolkit, allowing potential clients to self-serve, explore technical specs, and build custom quotes in real-time. This dynamic approach captures high-quality leads directly into your system, showcases a vast product line without costly physical samples, and leaves a lasting impression of technological sophistication.</p>
                                </div>
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