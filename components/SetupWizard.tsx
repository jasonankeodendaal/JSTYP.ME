import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './context/AppContext.tsx';
import { ServerStackIcon, ChevronRightIcon, LinkIcon, ChevronLeftIcon, SparklesIcon, CubeIcon, BookOpenIcon, CloudSlashIcon, PaintBrushIcon, ChartBarIcon, ClipboardDocumentListIcon, ArrowPathIcon, SignalIcon, CircleStackIcon, UsersIcon, PlayIcon, PauseIcon, StopIcon, ComputerDesktopIcon, ShieldCheckIcon, CodeBracketIcon } from './Icons.tsx';
import { useNavigate } from 'react-router-dom';
import SetupInstruction from './Admin/SetupInstruction.tsx';
import { LocalFolderGuideContent, CloudSyncGuideContent, VercelGuideContent, SupabaseGuideContent } from './Admin/SetupGuides.tsx';

const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const MotionDiv = motion.div as any;

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

const SystemEcosystemDiagram: React.FC = () => (
    <svg viewBox="0 0 500 250" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="kioskScreenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" className="text-indigo-400 dark:text-indigo-500" stopColor="currentColor"/>
                <stop offset="100%" className="text-purple-400 dark:text-purple-500" stopColor="currentColor"/>
            </linearGradient>
            <linearGradient id="syncArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" className="text-gray-400" stopColor="currentColor"/>
                <stop offset="100%" className="text-gray-500" stopColor="currentColor"/>
            </linearGradient>
            <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Central Kiosk Element */}
        <g transform="translate(150 125)">
            <path d="M-60 60 L 0 90 L 60 60 L 60 -60 L 0 -90 L-60 -60Z" className="fill-gray-200 dark:fill-gray-700/50" />
            <path d="M0 -90 L 60 -60 V 60 L 0 90Z" className="fill-gray-300 dark:fill-gray-700" />
            <rect x="-55" y="-55" width="110" height="110" rx="10" className="fill-white dark:fill-gray-800" />
            <rect x="-50" y="-50" width="100" height="100" rx="5" fill="url(#kioskScreenGrad)" opacity="0.1"/>
            <text textAnchor="middle" y="-25" className="font-bold text-lg fill-gray-800 dark:fill-gray-100">Kiosk Device</text>
            <text textAnchor="middle" y="-8" className="font-semibold text-sm fill-indigo-500 dark:fill-indigo-400">(Offline Core)</text>
            
            {/* Internal Components */}
            <g transform="translate(0 30)">
                 <rect x="-40" y="-15" width="80" height="30" rx="5" className="fill-gray-100 dark:fill-gray-900/50" />
                 <text textAnchor="middle" y="-3" className="text-[8px] font-bold fill-gray-500 dark:fill-gray-400">UI (React)</text>
                 <text textAnchor="middle" y="8" className="text-[8px] font-bold fill-gray-500 dark:fill-gray-400">Local Database (IndexedDB)</text>
                 <path d="M-20 0 A 10 5 0 1 1 20 0" fill="none" className="stroke-indigo-400" strokeWidth="1.5" strokeDasharray="2 2"/>
                 <polygon points="20,0 17,-2 17,2" className="fill-indigo-400"/>
                 <path d="M20 0 A 10 5 0 1 1 -20 0" fill="none" className="stroke-indigo-400" strokeWidth="1.5" strokeDasharray="2 2"/>
                 <polygon points="-20,0 -17,2 -17,-2" className="fill-indigo-400"/>
            </g>
             <text x="0" y="55" textAnchor="middle" className="text-[9px] font-bold fill-green-600 dark:fill-green-400">Instant Access (Offline)</text>
        </g>
        
        {/* Sync Provider */}
        <g transform="translate(370 125)">
            <g filter="url(#glow-soft)" opacity="0.5">
                <circle cx="0" cy="0" r="35" fill="url(#syncArrowGrad)" />
            </g>
            <circle cx="0" cy="0" r="35" className="fill-gray-100 dark:fill-gray-700/50 stroke-gray-200 dark:stroke-gray-600" />
            <ServerStackIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" x="-16" y="-30"/>
            <text textAnchor="middle" y="15" className="font-semibold text-sm fill-gray-700 dark:fill-gray-200">Sync Provider</text>
            <text textAnchor="middle" y="28" className="text-xs fill-gray-500 dark:fill-gray-400">(Cloud/Local)</text>
        </g>
        
        {/* Connection Arrow */}
        <g>
            <path d="M230 125 H 315" fill="none" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="2" strokeDasharray="5 3"/>
            <polygon points="315,125 307,121 307,129" className="fill-gray-400 dark:fill-gray-500" />
            <polygon points="230,125 238,121 238,129" className="fill-gray-400 dark:fill-gray-500" />
            <text x="272.5" y="115" textAnchor="middle" className="text-[10px] font-semibold fill-gray-600 dark:fill-gray-300">Optional Sync</text>
        </g>
    </svg>
);

const WhyYouNeedThisSystemDiagram: React.FC = () => (
    <svg viewBox="0 0 400 225" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="floorGradient" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" className="text-gray-200 dark:text-gray-700/50" stopColor="currentColor" />
                <stop offset="100%" className="text-gray-100 dark:text-gray-800/50" stopColor="currentColor" />
            </linearGradient>
            <linearGradient id="wallGradient" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" className="text-gray-100 dark:text-gray-800" stopColor="currentColor" />
                <stop offset="100%" className="text-gray-50 dark:text-gray-800/80" stopColor="currentColor" />
            </linearGradient>
            <linearGradient id="dataStreamGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" className="text-indigo-400" stopColor="currentColor" stopOpacity="0"/>
                <stop offset="50%" className="text-indigo-400" stopColor="currentColor" stopOpacity="1"/>
                <stop offset="100%" className="text-purple-400" stopColor="currentColor" stopOpacity="1"/>
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Environment */}
        <path d="M0 215 L200 115 L400 215 V225 H0 Z" fill="url(#floorGradient)" />
        <path d="M0 50 L200 -50 L400 50 V215 L200 115 L0 215Z" fill="url(#wallGradient)" />
        <line x1="200" y1="-50" x2="200" y2="115" className="stroke-gray-200 dark:stroke-gray-700/50" />
        <line x1="0" y1="215" x2="400" y2="215" className="stroke-gray-200 dark:stroke-gray-700/50" />
        <line x1="0" y1="50" x2="400" y2="50" className="stroke-gray-200 dark:stroke-gray-700/50" />

        {/* Kiosk */}
        <g transform="translate(140 120)">
            <path d="M -20, 50 l 10, -5 v -70 l -10, 5 z" className="fill-gray-300 dark:fill-gray-600" />
            <path d="M 20, 50 l 10, 5 v -70 l -10, -5 z" className="fill-gray-400 dark:fill-gray-500" />
            <rect x="-20" y="-20" width="40" height="70" className="fill-gray-800 dark:fill-black" />
            <rect x="-18" y="-18" width="36" height="66" rx="2" className="fill-white dark:fill-gray-700" />
            <circle cx="-15" cy="-14" r="1.5" className="fill-gray-600 dark:fill-gray-400" />
            <path d="M 0, 50 l 0, 15" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="8" strokeLinecap="round" />
            <path d="M -15, 65 h 30" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="5" strokeLinecap="round" />
            {/* Screen Content */}
            <rect x="-14" y="-12" width="28" height="18" rx="1" className="fill-blue-100 dark:fill-blue-900/50" />
            <rect x="-14" y="8" width="13" height="10" rx="1" className="fill-gray-100 dark:fill-gray-600/50" />
            <rect x="1" y="8" width="13" height="10" rx="1" className="fill-gray-100 dark:fill-gray-600/50" />
        </g>
        
        {/* Customer */}
        <g transform="translate(90 135)">
            <path d="M 0, 45 a 15 15 0 0 1 0 -30 a 12 12 0 0 1 0 30" className="fill-blue-200 dark:fill-blue-900/50 stroke-blue-300 dark:stroke-blue-700" />
            <circle cx="0" cy="-25" r="10" className="fill-blue-200 dark:fill-blue-900/50 stroke-blue-300 dark:stroke-blue-700" />
            <path d="M 12, 10 l 20, -10" strokeWidth="3" className="stroke-blue-200 dark:stroke-blue-900/50" strokeLinecap="round" />
        </g>
        
        {/* Data Streams */}
        <g filter="url(#glow)">
            <path d="M160 110 C 200 90, 220 50, 250 40" fill="none" stroke="url(#dataStreamGradient)" strokeWidth="2" />
            <path d="M165 120 C 220 120, 230 100, 280 90" fill="none" stroke="url(#dataStreamGradient)" strokeWidth="2" />
        </g>

        {/* Floating UI Elements */}
        <g transform="translate(260 35)">
            <rect x="-30" y="-20" width="60" height="40" rx="5" className="fill-white/80 dark:fill-gray-900/80 backdrop-blur-sm stroke-gray-300 dark:stroke-gray-600" />
            <rect x="-25" y="10" width="10" height="-20" className="fill-indigo-300 dark:fill-indigo-600" />
            <rect x="-10" y="10" width="10" height="-30" className="fill-indigo-400 dark:fill-indigo-500" />
            <rect x="5" y="10" width="10" height="-15" className="fill-indigo-300 dark:fill-indigo-600" />
            <rect x="20" y="10" width="10" height="-25" className="fill-indigo-400 dark:fill-indigo-500" />
        </g>
         <g transform="translate(290 95)">
            <rect x="-25" y="-25" width="50" height="50" rx="5" className="fill-white/80 dark:fill-gray-900/80 backdrop-blur-sm stroke-gray-300 dark:stroke-gray-600" />
            <circle cx="0" cy="0" r="18" className="fill-purple-200 dark:fill-purple-900/50" />
            <path d="M 0 0 L 0 -18 A 18 18 0 0 1 15.58 -9 Z" className="fill-purple-400 dark:fill-purple-600" />
            <circle cx="0" cy="0" r="8" className="fill-white dark:fill-gray-900/80" />
        </g>

        {/* Store Manager */}
        <g transform="translate(350 145)">
            <circle cx="0" cy="-25" r="10" className="fill-green-200 dark:fill-green-900/50 stroke-green-300 dark:stroke-green-700" />
            <path d="M 0, 45 a 15 15 0 0 0 0 -30 a 12 12 0 0 0 0 30" className="fill-green-200 dark:fill-green-900/50 stroke-green-300 dark:stroke-green-700" />
            <g transform="rotate(20)">
                <rect x="-35" y="-10" width="30" height="20" rx="2" className="fill-gray-800 dark:fill-black" />
                <rect x="-33" y="-8" width="26" height="16" rx="1" className="fill-white dark:fill-gray-700" />
            </g>
        </g>
        <path d="M280 50 C 320 80, 340 110, 350 120" fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="2 2" />
        <path d="M305 110 C 320 120, 335 120, 350 120" fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeDasharray="2 2" />
    </svg>
);


const ScenarioBoutiqueDiagram: React.FC = () => (
    <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
            <linearGradient id="boutique-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="text-orange-100/50 dark:text-gray-700/50"/>
                <stop offset="100%" className="text-orange-200/50 dark:text-gray-800/50"/>
            </linearGradient>
            <linearGradient id="boutique-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="text-gray-50 dark:text-gray-800"/>
                <stop offset="100%" className="text-gray-100 dark:text-gray-800/80"/>
            </linearGradient>
            <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                <feOffset in="blur" dx="1" dy="2" result="offsetBlur"/>
                <feMerge><feMergeNode in="offsetBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>

        {/* Environment */}
        <path d="M0 145 L150 75 L300 145 V150 H0Z" fill="url(#boutique-floor)"/>
        <path d="M0 45 L150 -25 L300 45 V145 L150 75 L0 145Z" fill="url(#boutique-wall)"/>
        
        {/* Wood floor pattern */}
        <g className="stroke-orange-300/50 dark:stroke-gray-600/50" strokeWidth="0.5">
            {[...Array(10)].map((_, i) => <path key={i} d={`M${i*30} 145 L${150 + i*15} 75`} />)}
            {[...Array(10)].map((_, i) => <path key={i} d={`M300 ${145-i*10} L150 ${75-i*5}`} />)}
        </g>
        
        {/* Back wall details */}
        <rect x="20" y="5" width="80" height="50" rx="5" className="fill-gray-200/50 dark:fill-gray-700/50"/>
        <circle cx="200" cy="15" r="30" className="fill-gray-200/50 dark:fill-gray-700/50"/>

        {/* Kiosk */}
        <g transform="translate(150 100)" filter="url(#soft-shadow)">
            <path d="M -15, 25 l 5, -2.5 v -40 l -5, 2.5 z" className="fill-gray-300 dark:fill-gray-600"/>
            <path d="M 15, 25 l 5, 2.5 v -40 l -5, -2.5 z" className="fill-gray-400 dark:fill-gray-500"/>
            <rect x="-15" y="-17.5" width="30" height="42.5" className="fill-gray-800 dark:fill-black"/>
            <rect x="-13.5" y="-16" width="27" height="39.5" rx="1" className="fill-white dark:fill-gray-700"/>
            <path d="M 0, 25 l 0, 10" className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="5" strokeLinecap="round"/>
            <path d="M -10, 35 h 20" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="4" strokeLinecap="round"/>
        </g>

        {/* Clothing Rack */}
        <g transform="translate(40 90)" filter="url(#soft-shadow)">
            <path d="M0 0 L50 25" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="2"/>
            <path d="M5 2.5 V30 M45 22.5 V50" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="2"/>
            <rect x="7" y="5" width="8" height="18" rx="1" className="fill-red-200 dark:fill-red-900/50"/>
            <rect x="18" y="9.5" width="8" height="18" rx="1" className="fill-blue-200 dark:fill-blue-900/50"/>
            <rect x="29" y="14" width="8" height="18" rx="1" className="fill-yellow-200 dark:fill-yellow-900/50"/>
        </g>

        {/* Shelves */}
        <g transform="translate(220 50)" filter="url(#soft-shadow)">
            <path d="M0 0 L50 -25" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1"/>
            <path d="M0 20 L50 -5" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1"/>
            <path d="M0 40 L50 15" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="1"/>
            <rect x="5" y="-2" width="10" height="5" className="fill-green-200 dark:fill-green-800"/>
            <rect x="20" y="-9.5" width="10" height="5" className="fill-purple-200 dark:fill-purple-800"/>
            <rect x="8" y="18" width="10" height="5" className="fill-blue-200 dark:fill-blue-800"/>
        </g>
    </svg>
);

const ScenarioFranchiseDiagram: React.FC = () => (
    <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <defs>
        <linearGradient id="franchise-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="text-gray-50 dark:text-gray-800/60" stopColor="currentColor" />
            <stop offset="100%" className="text-gray-100 dark:text-gray-800" stopColor="currentColor" />
        </linearGradient>
        <linearGradient id="data-stream-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0"/>
            <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
         <filter id="shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
            <feMerge>
                <feMergeNode in="offsetBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>
      <rect width="300" height="150" rx="10" fill="url(#franchise-bg)" />
      
      {/* Faint World Map */}
      <path d="M50 125 C 80 80, 220 80, 250 125 M 70 140 C 120 160, 180 160, 230 140" fill="none" className="stroke-gray-200 dark:stroke-gray-700/50" strokeWidth="1.5" transform="translate(0 -40)" />

      {/* Central HQ */}
      <g transform="translate(150 75)" filter="url(#shadow-filter)">
        <path d="M-30 20 L0 40 L30 20 L30 -20 L0 -40 L-30 -20 Z" className="fill-gray-200 dark:fill-gray-700" />
        <path d="M0 -40 L30 -20 V20 L0 40Z" className="fill-indigo-500 dark:fill-indigo-600" />
        <path d="M0 -40 L-30 -20 V20 L0 40Z" className="fill-indigo-400 dark:fill-indigo-500" />
        <rect x="-10" y="-30" width="20" height="10" className="fill-white/30 dark:fill-white/20"/>
        <rect x="-25" y="-12" width="10" height="25" className="fill-white/30 dark:fill-white/20"/>
        <ServerStackIcon className="w-8 h-8 text-white/80" x="-16" y="-8"/>
      </g>
      
      {/* Stores */}
      {[50, 250].map(x => 
        <g transform={`translate(${x} 35)`} key={x}>
          <path d="M-15 10 L0 20 L15 10 V-10 L0 -20 L-15 -10Z" className="fill-gray-200/80 dark:fill-gray-700/80" />
          <path d="M0 -20 L15 -10 L15 10 L0 20Z" className="fill-purple-400 dark:fill-purple-500"/>
          <path d="M0 0 L15 -5 V-10 L0 -15Z" className="fill-white/20"/>
          <path d="M-12 8 H12" className="stroke-purple-300 dark:stroke-purple-600" strokeWidth="3"/>
        </g>
      )}
      <g transform="translate(80 120)">
         <path d="M-15 10 L0 20 L15 10 V-10 L0 -20 L-15 -10Z" className="fill-gray-200/80 dark:fill-gray-700/80" />
         <path d="M0 -20 L15 -10 L15 10 L0 20Z" className="fill-purple-400 dark:fill-purple-500"/>
         <path d="M-12 8 H12" className="stroke-purple-300 dark:stroke-purple-600" strokeWidth="3"/>
      </g>

      {/* Animated Data Streams */}
      <path id="path1" d="M70 40 C 100 50, 120 60, 140 70" fill="none" />
      <path id="path2" d="M230 40 C 200 50, 180 60, 160 70" fill="none" />
      <path id="path3" d="M100 115 C 115 100, 130 85, 145 78" fill="none" />
      {[1, 2, 3].map(i =>
        <g key={i}>
            <use href={`#path${i}`} className="stroke-indigo-300/50 dark:stroke-indigo-600/50" strokeWidth="3" strokeDasharray="4 4" />
            <circle r="2" fill="url(#data-stream-grad)">
                <animateMotion dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite">
                    <mpath href={`#path${i}`} />
                </animateMotion>
            </circle>
        </g>
      )}
    </svg>
);

const ScenarioB2bDiagram: React.FC = () => (
    <svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <defs>
            <linearGradient id="b2b-floor-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" className="text-gray-100 dark:text-gray-700/80" stopColor="currentColor"/>
                <stop offset="100%" className="text-gray-200 dark:text-gray-800/80" stopColor="currentColor"/>
            </linearGradient>
             <linearGradient id="b2b-wall-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="text-gray-50 dark:text-gray-800/50" stopColor="currentColor"/>
                <stop offset="100%" className="text-gray-100 dark:text-gray-900/50" stopColor="currentColor"/>
            </linearGradient>
        </defs>
        
        {/* Environment */}
        <path d="M0 145 L150 75 L300 145 V150 H0Z" fill="url(#b2b-floor-grad)" />
        <path d="M0 45 L150 -25 L300 45 V145 L150 75 L0 145Z" fill="url(#b2b-wall-grad)" />
        
        {/* Backdrop */}
        <g transform="translate(0 -5)">
            <path d="M70 115 L70 35 L230 35 L230 115" className="fill-white dark:fill-gray-700" />
            <path d="M110 45 h80 v15 h-80z" className="fill-indigo-500" />
            <text x="150" y="56" textAnchor="middle" className="text-[9px] font-bold fill-white">YOUR BRAND</text>
        </g>
        
        {/* Counter */}
        <g transform="translate(80 105)">
            <path d="M0 0 L30 -15 L100 -15 L70 0 Z" className="fill-gray-300 dark:fill-gray-600" />
            <path d="M0 0 L0 25 L70 25 L70 0 Z" className="fill-gray-200 dark:fill-gray-700" />
            <path d="M70 0 L70 25 L100 10 L100 -15 Z" className="fill-gray-100 dark:fill-gray-700/50"/>
        </g>
        
        {/* Plant */}
        <g transform="translate(45 105)">
            <path d="M-10 10 L0 25 L10 10 Z" className="fill-orange-200 dark:fill-orange-800"/>
            <path d="M0 10 C-10 -5, 10 -5, 0 10 M-5 5 C -15 -10, -5 -10, -5 5 M5 5 C 5 -10, 15 -10, 5 5" className="stroke-green-500 dark:stroke-green-600" strokeWidth="2" fill="none"/>
        </g>

        {/* Characters */}
        <g transform="translate(180 90)">
            <circle cx="0" cy="-15" r="8" className="fill-green-200 dark:fill-green-900"/>
            <path d="M0 -7 C-10 5, 10 5, 0 30" className="fill-green-100 dark:fill-green-800/80"/>
        </g>
        <g transform="translate(230 100)">
            <circle cx="0" cy="-15" r="8" className="fill-blue-200 dark:fill-blue-900"/>
            <path d="M0 -7 C-10 5, 10 5, 0 30" className="fill-blue-100 dark:fill-blue-800/80"/>
        </g>
        
        {/* Tablet */}
        <g transform="translate(200 75) rotate(-15)">
            <rect x="-15" y="-10" width="30" height="20" rx="2" className="fill-gray-800 dark:fill-black"/>
            <rect x="-14" y="-9" width="28" height="18" rx="1" className="fill-indigo-300 dark:fill-indigo-500" />
        </g>
    </svg>
);


export const AboutSystem: React.FC<AboutSystemProps> = ({ onBack, isDashboard = false }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold section-heading text-gray-800 dark:text-gray-100">About the System</h2>
                {onBack && (
                     <button onClick={onBack} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 !py-1.5 !px-3">
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Back
                    </button>
                )}
            </div>
            <div className={`${!isDashboard ? 'max-h-[calc(100vh-220px)]' : ''} overflow-y-auto pr-2 -mr-2`}>
                <div className="max-w-5xl mx-auto space-y-10 text-left text-gray-600 dark:text-gray-300 pr-2">
                
                    <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                       <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading flex items-center gap-3">
                            <SparklesIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                            <span>The Philosophy: Bridging Digital and Physical Retail</span>
                       </h3>
                       <div className="max-w-prose text-sm">
                           <p>In today's retail landscape, the digital and physical worlds are often disconnected. Customers browse online but purchase in-store; they discover in-store but research on their phones. This system was born from a simple yet powerful idea: **your physical retail space should be as dynamic, informative, and measurable as your website.**</p>
                           <p className="mt-2">It's more than a digital sign—it's a strategic platform designed to digitize your in-store customer journey, empowering you with the tools to create a seamless brand experience and capture actionable data that was previously invisible.</p>
                       </div>
                    </div>

                     <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                       <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading flex items-center gap-3">
                            <ChartBarIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                            <span>Why This System is a Game-Changer</span>
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4 max-w-prose">
                                <p>This platform fundamentally transforms the in-store customer experience from a passive walkthrough into an active, engaging exploration. By empowering customers with information and sales staff with powerful tools, it directly addresses core retail challenges and unlocks new opportunities for growth.</p>
                                <ul className="list-disc list-inside text-sm space-y-2">
                                    <li><strong>Solve the "Endless Aisle" Problem:</strong> Showcase your entire catalog, even items not physically in stock. Never lose a sale because a specific color or size isn't on the floor.</li>
                                    <li><strong>Capture Actionable In-Store Insights:</strong> For the first time, understand what your customers are *really* interested in. The analytics engine reveals which products and brands get the most attention, providing invaluable data for merchandising and inventory decisions.</li>
                                    <li><strong>Elevate Your Brand Perception:</strong> Deliver a modern, high-tech, and premium experience that impresses customers, builds brand value, and sets you apart from the competition.</li>
                                    <li><strong>Empower Your Sales Team:</strong> Equip your staff with a powerful, mobile tool for instant quoting, product lookup, and information access, turning them into expert consultants on the sales floor.</li>
                                </ul>
                            </div>
                            <div>
                                <WhyYouNeedThisSystemDiagram />
                            </div>
                       </div>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading flex items-center gap-3">
                            <CodeBracketIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                            <span>The Core Architecture: Speed, Reliability, & Offline Power</span>
                        </h3>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="mb-4 text-sm max-w-prose">The system is built on a powerful <strong>"Local-First"</strong> architecture. This means every kiosk is a self-sufficient powerhouse, ensuring maximum speed and 100% offline functionality. All data and assets are stored directly on the device, eliminating reliance on a constant internet connection. Syncing is an optional, powerful layer used to keep multiple devices consistent, not a requirement for operation.</p>
                            <SystemEcosystemDiagram />
                        </div>
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Technology Deep Dive: The 'Why' Behind the Stack</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50">
                                   <h4 className="font-semibold">React + Vite</h4>
                                   <p className="text-xs">
                                       <strong>Why:</strong> To deliver a blazing-fast, modern, and fluid user interface. React's component-based architecture ensures the UI is maintainable and scalable, while Vite provides an incredibly fast development and build process. The result is an application that feels as responsive and polished as a native app.
                                   </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50">
                                   <h4 className="font-semibold">IndexedDB Database</h4>
                                   <p className="text-xs">
                                       <strong>Why:</strong> For true offline capability. Unlike simple caching, IndexedDB is an industrial-strength database that lives inside the browser. It allows the entire product catalog, settings, and media assets to be stored locally, ensuring instantaneous data access and full functionality, even if the internet goes down.
                                   </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50">
                                   <h4 className="font-semibold">Progressive Web App (PWA)</h4>
                                   <p className="text-xs">
                                       <strong>Why:</strong> To provide a reliable, native app-like experience without the complexity of app stores. The kiosk can be "installed" on any device (Windows, Android, macOS), enabling fullscreen, offline-capable operation from a simple desktop shortcut, giving it a professional, locked-down feel.
                                   </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading flex items-center gap-3">
                            <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                            <span>A Comprehensive Feature Tour</span>
                        </h3>
                        <div className="space-y-6 max-w-prose">
                             <FeatureItem icon={<CubeIcon className="w-5 h-5"/>} title="The 'Endless Aisle' Product Showcase">
                                <span>Overcome the limitations of physical floor space. Go beyond static displays by presenting products with stunning image galleries, engaging product videos, full technical specifications, and downloadable PDF documents. For example, a furniture store can showcase a sofa in every available fabric option, even if only one is physically on the floor, preventing lost sales due to lack of variety.</span>
                            </FeatureItem>
                             <FeatureItem icon={<BookOpenIcon className="w-5 h-5"/>} title="Dynamic Marketing Engine">
                                <span>Transition your costly print marketing into a dynamic, engaging digital format. Upload entire product catalogues with an elegant page-turning effect. Use the built-in scheduler to automate promotional pamphlets for specific date ranges, saving thousands in printing costs and ensuring your marketing is always timely and relevant without manual intervention.</span>
                            </FeatureItem>
                             <FeatureItem icon={<CloudSlashIcon className="w-5 h-5"/>} title="Unbreakable Offline-First Reliability">
                                <span>Engineered for the demanding realities of retail environments where Wi-Fi can be unstable or non-existent. The kiosk operates flawlessly offline, ensuring a consistently smooth and professional customer experience at all times. This makes it perfect for high-stakes environments like trade shows, pop-up shops, or large stores with inconsistent internet connectivity.</span>
                            </FeatureItem>
                             <FeatureItem icon={<PaintBrushIcon className="w-5 h-5"/>} title="Total Brand Customization">
                                <span>Your brand is unique, and your digital touchpoints should be too. Exercise granular control over the entire user interface, from color palettes and Google Fonts to layout styles, card roundness, and shadow depth. The result is a kiosk that looks and feels like a bespoke, high-end application, perfectly aligned with your brand's visual identity.</span>
                            </FeatureItem>
                             <FeatureItem icon={<ChartBarIcon className="w-5 h-5"/>} title="In-Store Analytics Engine">
                                <span>Unlock invaluable, previously invisible insights into what's popular in your physical store. The system tracks which brands and products receive the most interactions, providing you with hard data to optimize store layouts, inform inventory decisions, justify product placement, and refine your marketing strategies for maximum real-world impact.</span>
                            </FeatureItem>
                             <FeatureItem icon={<ClipboardDocumentListIcon className="w-5 h-5"/>} title="Integrated Sales & Quoting Workflow">
                                <span>Seamlessly turn browsing interest into a concrete sales lead. An admin-protected workflow allows your staff to build a quote with a client, enter their details, and immediately print a professional, branded document on the spot. This streamlines the sales process for high-value items or B2B clients, enhancing professionalism and closing deals faster.</span>
                            </FeatureItem>
                             <FeatureItem icon={<ArrowPathIcon className="w-5 h-5"/>} title="Multi-Kiosk Sync & Remote Control">
                                <span>Manage a fleet of devices from a single, central admin panel. Whether using a simple shared folder on your local network or a powerful cloud server, you can push updates to all kiosks simultaneously. The Remote Control feature lets you monitor the real-time status of each kiosk and issue commands like navigation or refresh.</span>
                            </FeatureItem>
                        </div>
                    </div>

                     <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 section-heading flex items-center gap-3">
                            <ComputerDesktopIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                            <span>Deployment Scenarios & Kiosk Setups</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Scenario 1: The Standalone Boutique (Offline-First)</h4>
                                <p className="text-sm mt-1 max-w-prose">Perfect for a single store, pop-up shop, or trade show booth where simplicity and reliability are paramount. All data and media assets are stored directly on the device (e.g., a touchscreen PC or tablet). No internet or external server is required for day-to-day operation after the initial setup, guaranteeing a fast, responsive, and completely self-contained experience.</p>
                                 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
                                    <ScenarioBoutiqueDiagram />
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Scenario 2: The Multi-Location Franchise (Central Sync)</h4>
                                <p className="text-sm mt-1 max-w-prose">Ideal for retail chains or businesses with multiple kiosks that require brand consistency. A main PC (in an office or back room) acts as the central server, holding the master copy of the data. All other kiosks across different locations sync their data with this main PC over the internet, ensuring that any update to products or promotions is instantly reflected everywhere.</p>
                                 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
                                    <ScenarioFranchiseDiagram />
                                </div>
                            </div>
                             <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600/50">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Scenario 3: The B2B Supplier (Mobile & On-the-Go)</h4>
                                <p className="text-sm mt-1 max-w-prose">Equip your sales team with a powerful, portable tool for trade shows and client visits. The kiosk runs on a tablet or laptop, works fully offline for generating quotes and browsing products on the spot, and then syncs all new quotes and analytics data back to a central folder or cloud server when reconnected to the internet.</p>
                                 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700/50">
                                    <ScenarioB2bDiagram />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600/50">
                       <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 section-heading flex items-center gap-3">
                            <ShieldCheckIcon className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                            <span>Security & Data Privacy</span>
                       </h3>
                       <div className="max-w-prose">
                            <FeatureItem icon={<ShieldCheckIcon className="w-5 h-5"/>} title="You Control Your Data">
                                <span>Your data is your most valuable asset. The "Local-First" architecture means all your product information, analytics, and media are stored on **your** devices by default. You are never forced to upload sensitive business data to a third-party cloud. When you choose to use a sync provider, you control the server and the data remains within your infrastructure, protected by a secret API key that only you and your server know, ensuring complete data sovereignty.</span>
                            </FeatureItem>
                       </div>
                    </div>

                </div>
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