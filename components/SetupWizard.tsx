import React, { useState, useEffect } from 'react';
// FIX: Correct 'framer-motion' import for Variants type and add AnimatePresence to resolve missing name errors.
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppContext } from './context/AppContext.tsx';
// FIX: Add CubeIcon to imports to fix missing component error.
import { ServerStackIcon, ChevronRightIcon, LinkIcon, ChevronLeftIcon, BookOpenIcon, CloudSlashIcon, PaintBrushIcon, ChartBarIcon, ClipboardDocumentListIcon, ArrowPathIcon, CircleStackIcon, ShieldCheckIcon, CodeBracketIcon, ArrowDownTrayIcon, UserCircleIcon, UsersIcon, FtpIcon, CubeIcon } from './Icons.tsx';
// FIX: Consolidate react-router-dom import.
import { useNavigate } from 'react-router-dom';
import SetupInstruction from './Admin/SetupInstruction.tsx';
import { LocalFolderGuideContent, CloudSyncGuideContent, VercelGuideContent, SupabaseGuideContent, FtpGuideContent, DownloadSourceGuideContent } from './Admin/SetupGuides.tsx';
import { SupabaseIcon, VercelIcon } from './Icons.tsx';


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
            <p className="text-base">{children}</p>
        </div>
    </div>
);

// --- Reusable About System Component ---
interface AboutSystemProps {
    onBack?: () => void;
    isDashboard?: boolean;
}

const HeroDiagram: React.FC = () => (
    <svg viewBox="0 0 800 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="hero-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" /></linearGradient>
            <linearGradient id="hero-kiosk-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
            <linearGradient id="hero-kiosk-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#334155"/><stop offset="100%" stopColor="#475569"/></linearGradient>
            <radialGradient id="hero-glow-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stopColor="rgba(129, 140, 248, 0.4)"/><stop offset="100%" stopColor="rgba(129, 140, 248, 0)"/></radialGradient>
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                @keyframes screen-content-scroll { 0% { transform: translateY(0); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0); } }
                .hero-float-1 { animation: float 6s ease-in-out infinite; }
                .hero-float-2 { animation: float 6s ease-in-out infinite 1.5s; }
                .hero-float-3 { animation: float 6s ease-in-out infinite 3s; }
                .hero-float-4 { animation: float 6s ease-in-out infinite 4.5s; }
                .screen-scroll { animation: screen-content-scroll 8s ease-in-out infinite; }
            `}</style>
        </defs>

        <rect width="800" height="400" fill="url(#hero-bg-grad)" />
        <circle cx="400" cy="200" r="250" fill="url(#hero-glow-grad)" opacity="0.5"/>

        {/* Kiosk 3D structure */}
        <g transform="translate(400, 210) scale(1.2)">
            {/* Base */}
            <path d="M -150 120 L -170 140 L 170 140 L 150 120 Z" fill="#1e293b" />
            <path d="M -90 -160 L -150 120 L 150 120 L 90 -160 Z" fill="#475569" />
            {/* Side Panel */}
            <path d="M 90 -160 L 150 120 L 155 115 L 95 -165 Z" fill="url(#hero-kiosk-side)" />
             {/* Main Body */}
            <rect x="-90" y="-160" width="180" height="280" fill="#334155" />
            {/* Screen */}
            <rect x="-80" y="-150" width="160" height="260" fill="#0f172a" />
            <rect x="-80" y="-150" width="160" height="260" fill="url(#hero-kiosk-screen)" opacity="0.8" />
            
            {/* Animated Screen Content */}
            <g className="screen-scroll" clipPath="url(#screen-clip)">
                <rect x="-70" y="-140" width="140" height="50" rx="4" fill="rgba(255,255,255,0.1)" />
                <rect x="-60" y="-130" width="60" height="5" rx="2" fill="rgba(255,255,255,0.4)" />
                <rect x="-70" y="-80" width="140" height="200" rx="4" fill="rgba(255,255,255,0.1)" />
                <rect x="-60" y="-70" width="120" height="130" rx="2" fill="rgba(255,255,255,0.1)" />
                <rect x="-60" y="70" width="55" height="40" rx="2" fill="rgba(255,255,255,0.1)" />
                <rect x="5" y="70" width="55" height="40" rx="2" fill="rgba(255,255,255,0.1)" />
                <rect x="-70" y="140" width="140" height="50" rx="4" fill="rgba(255,255,255,0.1)" />
            </g>
        </g>
        <clipPath id="screen-clip"><rect x="320" y="60" width="160" height="260" /></clipPath>

        {/* Floating text elements */}
        <g className="font-semibold text-lg text-white/80" textAnchor="middle">
            <g className="hero-float-1" transform="translate(150 150)"><text>Offline-First</text></g>
            <g className="hero-float-2" transform="translate(650 150)"><text>Cloud Sync</text></g>
            <g className="hero-float-3" transform="translate(180 320)"><text>Analytics</text></g>
            <g className="hero-float-4" transform="translate(620 320)"><text>Customizable</text></g>
        </g>
    </svg>
);

const SystemEcosystemDiagramSVG: React.FC = () => (
    <svg viewBox="0 0 600 350" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="card-shadow-eco" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur"/>
                <feOffset in="blur" dy="5" result="offsetBlur"/>
                <feMerge><feMergeNode in="offsetBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <marker id="eco-arrowhead-new" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-gray-400 dark:text-gray-500"/>
            </marker>
        </defs>

        {/* Kiosk Device Representation */}
        <g transform="translate(140, 175)" filter="url(#card-shadow-eco)">
            <rect x="-120" y="-125" width="240" height="250" rx="16" className="fill-white dark:fill-gray-800 stroke-gray-200 dark:stroke-gray-700"/>
            <foreignObject x="-110" y="-115" width="220" height="230">
                <div className="flex flex-col h-full items-center p-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-indigo-500 dark:text-indigo-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                    <h3 className="mt-2 font-bold text-lg text-gray-800 dark:text-gray-100 section-heading">Kiosk Device</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Runs independently using its on-device storage.</p>
                    <div className="my-4 w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500 dark:text-gray-400">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                        <div>
                            <p className="font-semibold text-sm text-left text-gray-700 dark:text-gray-300">On-Device Database</p>
                            <p className="text-xs text-left text-gray-500 dark:text-gray-400">(IndexedDB)</p>
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-full px-3 py-1">FAST & RELIABLE</div>
                </div>
            </foreignObject>
        </g>
        
        {/* Sync Provider Representation */}
        <g transform="translate(460, 175)">
            <rect x="-120" y="-125" width="240" height="250" rx="16" strokeDasharray="6 4" className="stroke-gray-400 dark:stroke-gray-600 fill-transparent"/>
            <foreignObject x="-110" y="-115" width="220" height="230">
                <div className="flex flex-col h-full items-center p-4 text-center">
                     <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 section-heading">Optional Sync Provider</h3>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Single source of truth for all devices.</p>
                     
                     <div className="mt-2 w-full flex-grow grid grid-cols-2 gap-2 content-center">
                        <div className="flex items-center justify-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <ServerStackIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                            <p className="text-xs font-semibold">Local Folder</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <CodeBracketIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                            <p className="text-xs font-semibold">Custom API</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <SupabaseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                            <p className="text-xs font-semibold">Supabase</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <VercelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                            <p className="text-xs font-semibold">Vercel</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <FtpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                            <p className="text-xs font-semibold">FTP</p>
                        </div>
                         <div className="flex items-center justify-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                            <LinkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
                            <p className="text-xs font-semibold">Shared URL</p>
                        </div>
                     </div>
                     
                     <div className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 rounded-full px-3 py-1">CENTRALIZED</div>
                </div>
            </foreignObject>
        </g>
        
        {/* Connection Arrows */}
        <g className="text-gray-400 dark:text-gray-500">
            <motion.path
                d="M 265 150 C 315 120, 375 120, 340 175"
                transform="translate(80, 0) scale(0.8, 1)"
                fill="none" className="stroke-current" strokeWidth="1.5"
                markerEnd="url(#eco-arrowhead-new)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            />
            <motion.path
                d="M 425 200 C 375 230, 315 230, 265 200"
                transform="scale(0.8, 1) translate(90, 0)"
                fill="none" className="stroke-current" strokeWidth="1.5"
                markerEnd="url(#eco-arrowhead-new)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
            />
             <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <text x="345" y="125" textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">Push Changes (Sync)</text>
                <text x="345" y="230" textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">Pull Updates</text>
            </motion.g>
        </g>
    </svg>
);


const SystemEcosystemDiagram: React.FC = () => (
    <div className="text-center">
        <div className="max-w-prose mx-auto text-base space-y-4">
            <h3 className="font-bold text-3xl text-gray-800 dark:text-white mb-4 section-heading">How It Works: The Offline-First Core</h3>
            <p>The kiosk is engineered for resilience. At its heart, it's a completely self-sufficient application that stores all its data and media assets locally on the device in an <strong>On-Device Database</strong>. This <strong>offline-first architecture</strong> means it's incredibly fast and reliable, as it always reads data from the local storage first.</p>
            <p>For multi-device setups or centralized management, it can connect to an <strong>Optional Sync Provider</strong> (like a cloud API or a shared network folder). When connected, the kiosk intelligently syncs data in the background—pushing local changes and pulling remote updates to ensure all devices stay aligned with a single source of truth.</p>
        </div>
        <div className="mt-8"><SystemEcosystemDiagramSVG /></div>
    </div>
);


const ValueLoopDiagram: React.FC = () => (
    <div className="text-center">
        <div className="max-w-prose mx-auto text-base space-y-4">
            <h3 className="font-bold text-3xl text-gray-800 dark:text-white mb-4 section-heading">The Value Loop: Turning Browsing into Insight</h3>
            <p>By transforming passive browsing into active engagement, the kiosk turns your physical space into a source of rich customer data. It creates a powerful feedback loop: customers explore products, the system captures valuable interaction data, and you gain actionable insights to empower your sales team and refine your strategy.</p>
        </div>
        <div className="mt-8"><ValueLoopDiagramSVG /></div>
    </div>
);

const ValueLoopDiagramSVG: React.FC = () => {
    const iconBaseClass = "w-10 h-10";
    return (
        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-lg mx-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="val-arrowhead-new" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="fill-current text-gray-400 dark:text-gray-500"/></marker>
                <filter id="val-shadow-new"><feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur"/><feOffset dy="4" in="blur"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <style>{`
                    .arrow-path-1 { stroke-dasharray: 126; stroke-dashoffset: 126; animation: draw-arrow-1 1s ease-out 0.5s forwards; }
                    .arrow-path-2 { stroke-dasharray: 126; stroke-dashoffset: 126; animation: draw-arrow-1 1s ease-out 0.8s forwards; }
                    .arrow-path-3 { stroke-dasharray: 126; stroke-dashoffset: 126; animation: draw-arrow-1 1s ease-out 1.1s forwards; }
                    @keyframes draw-arrow-1 { to { stroke-dashoffset: 0; } }
                `}</style>
            </defs>

            {/* Central Element */}
            <g transform="translate(200 200)">
                 <MotionG initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                    <circle r="60" className="fill-white dark:fill-gray-800" filter="url(#val-shadow-new)"/>
                    <circle r="55" className="fill-indigo-50 dark:fill-gray-700/50" />
                     <foreignObject x="-30" y="-45" width="60" height="90">
                        <div className="flex flex-col items-center justify-center h-full w-full text-center">
                            <CubeIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                            <div className="font-bold text-sm mt-1 text-gray-800 dark:text-gray-100 section-heading">The Value Loop</div>
                        </div>
                    </foreignObject>
                </MotionG>
            </g>

            {/* Arrows */}
            <g className="text-gray-400 dark:text-gray-500 fill-none stroke-current" strokeWidth="2" markerEnd="url(#val-arrowhead-new)">
                <path d="M 200, 100 A 100,100 0 0 1 300,200" className="arrow-path-1" />
                <path d="M 300, 200 A 100,100 0 0 1 200,300" className="arrow-path-2" />
                <path d="M 200, 300 A 100,100 0 0 1 100,200" className="arrow-path-3" />
            </g>

            {/* Nodes */}
            <MotionG initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <g transform="translate(160, 20)">
                    <foreignObject x="0" y="0" width="80" height="80">
                        <div className="flex flex-col items-center justify-center h-full w-full text-center text-indigo-500 dark:text-indigo-400">
                            <UserCircleIcon className={iconBaseClass} />
                            <div className="font-bold text-xs mt-1 text-gray-800 dark:text-gray-100 section-heading">Engage & Explore</div>
                        </div>
                    </foreignObject>
                </g>
            </MotionG>
            
            <MotionG initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
                <g transform="translate(300, 160)">
                     <foreignObject x="0" y="0" width="80" height="80">
                        <div className="flex flex-col items-center justify-center h-full w-full text-center text-purple-500 dark:text-purple-400">
                           <ChartBarIcon className={iconBaseClass}/>
                            <div className="font-bold text-xs mt-1 text-gray-800 dark:text-gray-100 section-heading">Capture Insights</div>
                        </div>
                    </foreignObject>
                </g>
            </MotionG>

            <MotionG initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
                 <g transform="translate(160, 300)">
                     <foreignObject x="0" y="0" width="80" height="80">
                        <div className="flex flex-col items-center justify-center h-full w-full text-center text-pink-500 dark:text-pink-400">
                           <ClipboardDocumentListIcon className={iconBaseClass}/>
                            <div className="font-bold text-xs mt-1 text-gray-800 dark:text-gray-100 section-heading">Inform & Convert</div>
                        </div>
                    </foreignObject>
                </g>
            </MotionG>
        </svg>
    );
};


const ScenarioBoutiqueDiagram: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="boutique-kiosk-screen-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
            <linearGradient id="boutique-shelf-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4b5563" /><stop offset="100%" stopColor="#374151" /></linearGradient>
            <style>{`
                @keyframes boutique-shimmer { 0% { transform: translateX(-100%) skewX(-20deg); } 100% { transform: translateX(200%) skewX(-20deg); } }
                .boutique-shimmer-rect { animation: boutique-shimmer 4s ease-in-out infinite; }
            `}</style>
        </defs>
        <rect x="5" y="5" width="90" height="70" rx="4" className="fill-slate-200 dark:fill-slate-700" />
        <rect x="15" y="60" width="70" height="4" rx="1" fill="url(#boutique-shelf-grad)" />
        <g transform="translate(42 48)">
            <path d="M-5 12 L -7 14 L 17 14 L 15 12 Z" className="fill-slate-500 dark:fill-slate-400" />
            <path d="M-1 -8 L -5 12 L 15 12 L 11 -8 Z" className="fill-slate-400 dark:fill-slate-300" />
            <rect x="0" y="-7" width="10" height="18" rx="1" className="fill-slate-900"/>
            <rect x="1" y="-5" width="8" height="14" rx="0.5" fill="url(#boutique-kiosk-screen-grad)" />
            <rect x="1" y="-5" width="8" height="14" rx="0.5" fill="rgba(255,255,255,0.7)" className="boutique-shimmer-rect" opacity="0.4"/>
        </g>
    </svg>
);

const ScenarioFranchiseDiagram: React.FC = () => {
    const storeIcon = <path d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />;
    const iconStyle = "fill-none text-slate-500 dark:text-slate-400";
    return (
        <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="franchise-server-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient>
            </defs>
            <path id="franchise-path-1" d="M50 25 C 30 35, 25 50, 25 60" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path id="franchise-path-2" d="M50 25 C 50 35, 50 50, 50 60" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path id="franchise-path-3" d="M50 25 C 70 35, 75 50, 75 60" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="3 3"/>
            <circle r="2" fill="url(#franchise-server-grad)"><animateMotion dur="2.5s" repeatCount="indefinite" rotate="auto"><mpath href="#franchise-path-1"/></animateMotion></circle>
            <circle r="2" fill="url(#franchise-server-grad)"><animateMotion dur="2.5s" begin="0.2s" repeatCount="indefinite" rotate="auto"><mpath href="#franchise-path-2"/></animateMotion></circle>
            <circle r="2" fill="url(#franchise-server-grad)"><animateMotion dur="2.5s" begin="0.4s" repeatCount="indefinite" rotate="auto"><mpath href="#franchise-path-3"/></animateMotion></circle>
            <circle cx="50" cy="25" r="12" fill="url(#franchise-server-grad)" className="stroke-white/50 dark:stroke-black/50" strokeWidth="1"/>
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
            <style>{`
                @keyframes b2b-scan { 0% { transform: translateY(0); } 50% { transform: translateY(18px); } 100% { transform: translateY(0); } }
                .b2b-scan-line { animation: b2b-scan 2.5s ease-in-out infinite; }
            `}</style>
        </defs>
        <path d="M 5 75 L 5 15 C 5 10, 15 5, 25 5 H 75 C 85 5, 95 10, 95 15 V 75" className="fill-slate-200 dark:fill-slate-700" />
        <g transform="translate(42 35)">
            <rect x="-8" y="28" width="36" height="4" rx="1" className="fill-slate-400 dark:fill-slate-500" />
            <rect x="4" y="-5" width="2" height="35" rx="1" className="fill-slate-400 dark:fill-slate-500" />
            <rect x="-2" y="-4" width="14" height="25" rx="1.5" className="fill-slate-800" />
            <rect x="0" y="-2" width="10" height="21" rx="0.5" className="fill-indigo-500" />
            <rect x="0" y="-2" width="10" height="2" fill="rgba(255,255,255,0.8)" className="b2b-scan-line" />
        </g>
        <UserCircleIcon x="15" y="45" className="w-10 h-10 text-slate-400 dark:text-slate-500"/>
        <g transform="translate(70 15)">
            <ClipboardDocumentListIcon className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            <circle r="1.5" className="fill-indigo-400">
                <animateMotion dur="2s" repeatCount="indefinite" path="M -22 25 C -10 20, -10 30, 2 25" />
            </circle>
        </g>
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
                        <h1 className="text-4xl md:text-5xl font-bold section-heading text-gray-800 dark:text-white mt-8">The Retail OS</h1>
                        <p className="max-w-3xl mx-auto mt-4 text-lg text-gray-600 dark:text-gray-400">Bridging Your Physical Space with Digital Intelligence</p>
                        <div className="mt-6 max-w-prose mx-auto text-base space-y-4 text-gray-500 dark:text-gray-400">
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
                            <h3 className="font-bold text-3xl text-gray-800 dark:text-white mb-8 section-heading text-center">Key Features at a Glance</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 text-base">
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
                            <h3 className="font-bold text-3xl text-gray-800 dark:text-white mb-8 section-heading text-center">Perfect For Any Environment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><ScenarioBoutiqueDiagram /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">High-End Boutiques</h4><p className="text-sm text-gray-500 dark:text-gray-400">Provide a sophisticated, interactive catalogue.</p></div>
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><ScenarioFranchiseDiagram /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">Multi-Location Franchises</h4><p className="text-sm text-gray-500 dark:text-gray-400">Ensure brand consistency and manage data centrally.</p></div>
                                <div className="text-center p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50"><ScenarioB2bDiagram /><h4 className="font-semibold mt-2 text-gray-800 dark:text-white">B2B & Trade Shows</h4><p className="text-sm text-gray-500 dark:text-gray-400">Capture leads and generate quotes instantly.</p></div>
                            </div>
                        </div>
                    </MotionSection>

                    <MotionSection variants={itemVariants} className="py-16 sm:py-24 px-6 bg-gray-50 dark:bg-gray-700/20">
                        <div className="max-w-3xl mx-auto text-center">
                            <h3 className="font-bold text-3xl text-gray-800 dark:text-white mb-4 section-heading flex items-center justify-center gap-3"><ArrowDownTrayIcon className="w-6 h-6"/><span>Project Source Code</span></h3>
                            <p className="text-base text-gray-500 dark:text-gray-400 mb-6">This application is open-source and designed to be fully self-hostable. For developers, the complete project source code can be downloaded from GitHub.</p>
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
    type GuideID = 'cloud' | 'local' | 'ftp' | 'vercel' | 'supabase' | 'download';
    const [activeGuide, setActiveGuide] = useState<GuideID>('cloud');

    const guides: { id: GuideID; title: string; component: React.ComponentType }[] = [
        { id: 'cloud', title: 'Cloud Sync (PC Server)', component: CloudSyncGuideContent },
        { id: 'local', title: 'Local Folder', component: LocalFolderGuideContent },
        { id: 'ftp', title: 'FTP Server', component: FtpGuideContent },
        { id: 'vercel', title: 'Vercel', component: VercelGuideContent },
        { id: 'supabase', title: 'Supabase', component: SupabaseGuideContent },
        { id: 'download', title: 'Download Source', component: DownloadSourceGuideContent },
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