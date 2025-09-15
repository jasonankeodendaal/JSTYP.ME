import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon } from '../Icons.tsx';
import SetupInstruction from './SetupInstruction.tsx';
import { LocalFolderGuideContent, CloudSyncGuideContent, VercelGuideContent, SupabaseGuideContent, FtpGuideContent, DownloadSourceGuideContent } from './SetupGuides.tsx';

const MotionDiv = motion.div as any;

const TABS = [
  { id: 'cloud', title: 'Cloud Sync (PC Server)', component: CloudSyncGuideContent },
  { id: 'local', title: 'Local Folder', component: LocalFolderGuideContent },
  { id: 'ftp', title: 'FTP Server', component: FtpGuideContent },
  { id: 'vercel', title: 'Vercel', component: VercelGuideContent },
  { id: 'supabase', title: 'Supabase', component: SupabaseGuideContent },
  { id: 'download', title: 'Download Source', component: DownloadSourceGuideContent },
];

const AnimatedGradientBackground: React.FC = () => (
    <>
        <style>{`
            @keyframes gradient-animation-setup {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .animated-gradient-setup {
                background: linear-gradient(-45deg, #0f172a, #1e293b, #3b82f6, #8b5cf6);
                background-size: 400% 400%;
                animation: gradient-animation-setup 20s ease infinite;
            }
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(129, 140, 248, 0.4); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(129, 140, 248, 0.6); }
        `}</style>
        <div className="absolute inset-0 animated-gradient-setup -z-10" />
    </>
);

const SetupInstructions: React.FC = () => {
    const [activeTab, setActiveTab] = useState('cloud');
    const activeTabData = TABS.find(t => t.id === activeTab);
    const ActiveComponent = activeTabData?.component;

    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900 z-[100] flex flex-col font-sans"
        >
            <AnimatedGradientBackground />
            
            <header className="flex-shrink-0 p-4 sm:p-6 flex justify-between items-center text-white relative">
                <h1 className="text-2xl sm:text-3xl font-bold section-heading">Setup Instructions</h1>
                <Link to="/admin" className="btn bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20">
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Back to Dashboard</span>
                </Link>
            </header>

            <div className="flex-shrink-0 px-4 sm:px-6 border-b border-white/10">
                <nav className="flex items-center flex-wrap -mb-px">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="relative px-3 py-3 font-semibold text-sm transition-colors whitespace-nowrap"
                        >
                            <span className={activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'}>
                                {tab.title}
                            </span>
                            {activeTab === tab.id && (
                                <MotionDiv
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                                    layoutId="underline"
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            
            <main className="flex-grow p-4 sm:p-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="w-full h-full bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10"
                    >
                        <div className="p-1 h-full">
                             {activeTabData && ActiveComponent && (
                                <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                                    <SetupInstruction title={activeTabData.title} defaultOpen>
                                        <ActiveComponent />
                                    </SetupInstruction>
                                </div>
                            )}
                        </div>
                    </MotionDiv>
                </AnimatePresence>
            </main>
        </MotionDiv>
    );
};

export default SetupInstructions;
