import React, { useState, useEffect, useRef } from 'react';
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
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-[17px]">{title}</h4>
            <p className="text-[14px]">{children}</p>
        </div>
    </div>
);

// --- Reusable About System Component ---
interface AboutSystemProps {
    onBack?: () => void;
    isDashboard?: boolean;
}

const HeroDiagram: React.FC = () => {
    const [glarePosition, setGlarePosition] = useState({ x: -200, y: -200 });
    const [isHovering, setIsHovering] = useState(false);
    const screenRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (screenRef.current) {
            const rect = screenRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setGlarePosition({ x, y });
        }
    };

    const handleMouseLeave = () => {
        setGlarePosition({ x: -200, y: -200 });
        setIsHovering(false);
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const cardVariants = {
        hover: { y: -8, scale: 1.05 },
        initial: { y: 0, scale: 1 }
    };

    return (
        <svg viewBox="0 0 800 600" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="kiosk-metal" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="kiosk-stand" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <filter id="kiosk-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="15" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
                </filter>
            </defs>

            {/* Kiosk Stand and Body */}
            <g filter="url(#kiosk-shadow)">
                <path d="M 280 580 L 260 595 L 540 595 L 520 580 Z" fill="#0f172a" />
                <rect x="380" y="520" width="40" height="60" fill="url(#kiosk-stand)" />
                <rect x="140" y="40" width="520" height="480" rx="20" fill="url(#kiosk-metal)" />
                <rect x="150" y="50" width="500" height="460" rx="10" fill="#020617" />
            </g>

            {/* Screen Content with embedded HTML */}
            <foreignObject x="150" y="50" width="500" height="460" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                <div 
                    // FIX: Add xmlns attribute via spread to satisfy TypeScript while ensuring correct rendering of HTML inside SVG foreignObject.
                    {...{xmlns: "http://www.w3.org/1999/xhtml"}}
                    ref={screenRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    className="w-full h-full bg-slate-900 relative overflow-hidden cursor-pointer"
                    style={{ perspective: '1200px' }}
                >
                    <motion.div 
                        className="p-8 space-y-6 absolute inset-0 transition-transform duration-300 ease-out"
                        animate={{ transform: isHovering ? 'rotateX(5deg) scale(1.03)' : 'rotateX(0deg) scale(1)' }}
                    >
                        <div className="text-white text-3xl font-bold section-heading">Shop by Brand</div>
                        <div className="grid grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <motion.div key={i} className="bg-white/5 aspect-square rounded-lg border border-white/10" whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}></motion.div>
                            ))}
                        </div>
                        <div className="text-white text-3xl font-bold section-heading">Featured</div>
                        <div className="grid grid-cols-2 gap-6">
                            {[...Array(2)].map((_, i) => (
                                <motion.div key={i} className="bg-white/5 aspect-[4/3] rounded-lg border border-white/10 p-4" initial="initial" whileHover="hover">
                                    <motion.div className="w-full h-2/3 bg-white/10 rounded" variants={cardVariants}></motion.div>
                                    <motion.div className="w-3/4 h-4 bg-white/20 rounded mt-3" variants={cardVariants}></motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    
                    {/* Dynamic Glare Effect */}
                    <div 
                        className="absolute top-0 left-0 pointer-events-none transition-opacity duration-300"
                        style={{
                            width: '100%',
                            height: '100%',
                            background: `radial-gradient(circle at ${glarePosition.x}px ${glarePosition.y}px, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 40%)`,
                            opacity: isHovering ? 1 : 0,
                        }}
                    />
                </div>
            </foreignObject>
        </svg>
    );
};

const SystemEcosystemDiagramSVG: React.FC = () => {
    const providers = [
        { icon: <ServerStackIcon className="w-8 h-8"/>, name: "Local Folder" },
        { icon: <CodeBracketIcon className="w-8 h-8"/>, name: "Custom API" },
        { icon: <SupabaseIcon className="w-8 h-8"/>, name: "Supabase" },
        { icon: <VercelIcon className="w-8 h-8"/>, name: "Vercel" },
        { icon: <FtpIcon className="w-8 h-8"/>, name: "FTP" },
        { icon: <LinkIcon className="w-8 h-8"/>, name: "Shared URL" },
    ];
    
    return (
        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-lg mx-auto">
            <defs>
                <radialGradient id="eco-bg-grad-new" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
                <filter id="eco-glow-filter-new"><feGaussianBlur stdDeviation="5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <style>{`
                    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.05); opacity: 1; } }
                    @keyframes data-flow { to { stroke-dashoffset: 1000; } }
                    .kiosk-pulse { animation: pulse 4s ease-in-out infinite; transform-origin: center; }
                    .data-line { stroke-dasharray: 4 6; stroke-dashoffset: 0; animation: data-flow 40s linear infinite; }
                `}</style>
            </defs>

            <rect x="0" y="0" width="400" height="400" fill="url(#eco-bg-grad-new)" rx="20"/>

            {/* Central Kiosk */}
            <g transform="translate(200, 200)">
                <circle r="60" className="fill-indigo-500/10" />
                <circle r="50" className="fill-indigo-500/20 kiosk-pulse" />
                <circle r="40" className="fill-indigo-500/80 stroke-indigo-300" strokeWidth="1" filter="url(#eco-glow-filter-new)" />
                <foreignObject x="-20" y="-20" width="40" height="40">
                    <div className="flex items-center justify-center h-full">
                        <CubeIcon className="w-8 h-8 text-white"/>
                    </div>
                </foreignObject>
            </g>

            {/* Orbital path and providers */}
            <path id="orbit-new" d="M 200, 200 m -140, 0 a 140,140 0 1,0 280,0 a 140,140 0 1,0 -280,0" fill="none" />

            {providers.map((p, i) => (
                <g key={p.name}>
                    <animateMotion dur="20s" repeatCount="indefinite" begin={`${i * (20 / providers.length)}s`}>
                        <mpath href="#orbit-new" />
                    </animateMotion>
                    <line x1="200" y1="200" x2="0" y2="0" className="stroke-indigo-500/20 data-line" strokeWidth="1"/>
                    <foreignObject x="-22" y="-32" width="44" height="64">
                         <div className="flex flex-col items-center justify-center h-full text-center text-indigo-200">
                            {p.icon}
                            <div className="text-[8px] font-semibold mt-1">{p.name}</div>
                        </div>
                    </foreignObject>
                </g>
            ))}
        </svg>
    );
};

const SystemEcosystemDiagram: React.FC = () => (
    <div className="text-center">
        <div className="max-w-prose mx-auto text-[14px] space-y-3">
            <h3 className="font-bold text-[17px] text-gray-800 dark:text-white mb-4 section-heading">How It Works: The Offline-First Core</h3>
            <p>The kiosk is engineered for resilience. At its heart, it's a completely self-sufficient Progressive Web App (PWA) that stores all its data locally on the device. This <strong>offline-first architecture</strong> means it's incredibly fast and reliable. It doesn't need a constant internet connection to function perfectly, ensuring a smooth customer experience even with unstable network conditions.</p>
            <p>For multi-device setups or centralized management, it uses an <strong>optional sync provider</strong> (like a local network folder or a cloud server) to keep all kiosks updated. This hybrid model gives you the best of both worlds: the rock-solid stability of an offline app with the powerful scalability of the cloud.</p>
        </div>
        <div className="mt-8"><SystemEcosystemDiagramSVG /></div>
    </div>
);


const ValueLoopDiagram: React.FC = () => (
    <div className="text-center">
        <div className="max-w-prose mx-auto text-[14px] space-y-4">
            <h3 className="font-bold text-[17px] text-gray-800 dark:text-white mb-4 section-heading">The Value Loop: Turning Browsing into Insight</h3>
            <p>By transforming passive browsing into active engagement, the kiosk turns your physical space into a source of rich customer data. It creates a powerful feedback loop: customers explore products, the system captures valuable interaction data, and you gain actionable insights to empower your sales team and refine your strategy.</p>
        </div>
        <div className="mt-8"><ValueLoopDiagramSVG /></div>
    </div>
);

const ValueLoopDiagramSVG: React.FC = () => {
    const iconBaseClass = "w-8 h-8";
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
            <linearGradient id="boutique-screen-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <style>{`
                @keyframes boutique-shimmer { 0% { transform: translateX(-100%) skewX(-20deg); } 100% { transform: translateX(200%) skewX(-20deg); } }
                .boutique-shimmer-rect { animation: boutique-shimmer 4.5s ease-in-out infinite; animation-delay: 1.5s; }
            `}</style>
        </defs>
        {/* Pedestal */}
        <path d="M 35 75 L 38 60 H 62 L 65 75 Z" className="fill-slate-300 dark:fill-slate-600" />
        <rect x="38" y="40" width="24" height="20" className="fill-slate-400 dark:fill-slate-500" />
        
        {/* Kiosk */}
        <g transform="translate(50, 25)">
            <rect x="-20" y="-15" width="40" height="28" rx="3" className="fill-slate-700 dark:fill-slate-800" />
            <rect x="-18" y="-13" width="36" height="24" rx="1.5" fill="url(#boutique-screen-grad)" />
            {/* Shimmer effect */}
            <rect x="-18" y="-13" width="15" height="24" rx="1.5" fill="rgba(255,255,255,0.4)" className="boutique-shimmer-rect" opacity="0.5"/>
        </g>
    </svg>
);

const ScenarioFranchiseDiagram: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="franchise-cloud-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
        </defs>
        {/* Paths for dots */}
        <path id="franchise-path-1" d="M50 25 Q 30 45, 20 65" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="2 2" />
        <path id="franchise-path-2" d="M50 25 V 65" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="2 2" />
        <path id="franchise-path-3" d="M50 25 Q 70 45, 80 65" fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeDasharray="2 2" />
        
        {/* Animated dots */}
        <circle r="2.5" className="fill-purple-500">
            <animateMotion dur="2s" repeatCount="indefinite" rotate="auto"><mpath href="#franchise-path-1" /></animateMotion>
        </circle>
        <circle r="2.5" className="fill-purple-500">
            <animateMotion dur="2s" begin="0.3s" repeatCount="indefinite" rotate="auto"><mpath href="#franchise-path-2" /></animateMotion>
        </circle>
        <circle r="2.5" className="fill-purple-500">
            <animateMotion dur="2s" begin="0.6s" repeatCount="indefinite" rotate="auto"><mpath href="#franchise-path-3" /></animateMotion>
        </circle>

        {/* Cloud Icon */}
        <g transform="translate(50, 25)">
            <path d="M -18 2 C -25 2, -25 -10, -15 -10 C -10 -20, 5 -20, 10 -10 C 20 -10, 20 2, 12 2 Z" fill="url(#franchise-cloud-grad)" />
        </g>

        {/* Storefront Icons */}
        <g className="text-slate-500 dark:text-slate-400 fill-current">
            <path transform="translate(13, 65)" d="M0 10 L15 10 L15 0 L7.5 -5 L0 0 Z M2 4 H13 V8 H2Z"/>
            <path transform="translate(43, 65)" d="M0 10 L15 10 L15 0 L7.5 -5 L0 0 Z M2 4 H13 V8 H2Z"/>
            <path transform="translate(73, 65)" d="M0 10 L15 10 L15 0 L7.5 -5 L0 0 Z M2 4 H13 V8 H2Z"/>
        </g>
    </svg>
);

const ScenarioB2bDiagram: React.FC = () => (
    <svg viewBox="0 0 100 80" className="w-24 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="b2b-scan-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(239, 68, 68, 0)" />
                <stop offset="50%" stopColor="rgba(239, 68, 68, 0.8)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </linearGradient>
            <style>{`
                @keyframes b2b-scan { 0% { transform: translateY(-5px); } 100% { transform: translateY(40px); } }
                .b2b-scan-line { animation: b2b-scan 2.5s ease-in-out infinite; }
            `}</style>
        </defs>
        {/* Kiosk Base */}
        <path d="M 30 75 L 40 45 H 60 L 70 75 Z" className="fill-slate-300 dark:fill-slate-600" />
        <rect x="40" y="20" width="20" height="25" className="fill-slate-400 dark:fill-slate-500" />
        
        {/* Kiosk Screen */}
        <g transform="translate(50, 20)">
            <rect x="-25" y="-15" width="50" height="35" rx="3" className="fill-slate-700 dark:fill-slate-800" />
            <rect x="-23" y="-13" width="46" height="31" rx="1.5" className="fill-slate-900" />
            {/* Scanning line */}
            <rect x="-23" y="-13" width="46" height="1.5" fill="url(#b2b-scan-grad)" className="b2b-scan-line" />

            {/* Placeholder UI on screen */}
            <rect x="-18" y="-8" width="15" height="15" rx="1" className="fill-slate-600/50" />
            <rect x="2" y="-8" width="16" height="3" rx="1" className="fill-slate-600/50" />
            <rect x="2" y="-2" width="12" height="3" rx="1" className="fill-slate-600/50" />
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
                        <p className="max-w-3xl mx-auto mt-4 text-[14px] text-gray-600 dark:text-gray-400">Bridging Your Physical Space with Digital Intelligence</p>
                        <div className="mt-6 max-w-prose mx-auto text-[14px] space-y-4 text-gray-500 dark:text-gray-400">
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
                            <h3 className="font-bold text-[17px] text-gray-800 dark:text-white mb-8 section-heading text-center">Key Features at a Glance</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 text-[14px]">
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
                            <h3 className="font-bold text-[17px] text-gray-800 dark:text-white mb-12 section-heading text-center">Perfect For Any Environment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <ScenarioBoutiqueDiagram />
                                    <h4 className="font-bold text-[17px] mt-6 text-gray-900 dark:text-white">High-End Boutiques</h4>
                                    <p className="text-[14px] text-gray-600 dark:text-gray-400 mt-2">Provide a sophisticated, interactive catalogue.</p>
                                </div>
                                <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <ScenarioFranchiseDiagram />
                                    <h4 className="font-bold text-[17px] mt-6 text-gray-900 dark:text-white">Multi-Location Franchises</h4>
                                    <p className="text-[14px] text-gray-600 dark:text-gray-400 mt-2">Ensure brand consistency and manage data centrally.</p>
                                </div>
                                <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <ScenarioB2bDiagram />
                                    <h4 className="font-bold text-[17px] mt-6 text-gray-900 dark:text-white">B2B & Trade Shows</h4>
                                    <p className="text-[14px] text-gray-600 dark:text-gray-400 mt-2">Capture leads and generate quotes instantly.</p>
                                </div>
                            </div>
                        </div>
                    </MotionSection>

                    <MotionSection variants={itemVariants} className="py-16 sm:py-24 px-6 bg-gray-50 dark:bg-gray-700/20">
                        <div className="max-w-3xl mx-auto text-center">
                            <h3 className="font-bold text-[17px] text-gray-800 dark:text-white mb-4 section-heading flex items-center justify-center gap-3"><ArrowDownTrayIcon className="w-6 h-6"/><span>Project Source Code</span></h3>
                            <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-6">This application is open-source and designed to be fully self-hostable. For developers, the complete project source code can be downloaded from GitHub.</p>
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
