import React from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { SignalIcon, SignalSlashIcon, EyeIcon, EyeOffIcon, ArrowPathIcon, ArrowLeftOnRectangleIcon, ChevronRightIcon } from '../Icons.tsx';

const AdminRemoteControl: React.FC = () => {
    const { kioskSessions, settings, sendRemoteCommand } = useAppContext();

    const handleNavigate = (kioskId: string, path: string) => {
        const fullPath = path || window.prompt("Enter the path to navigate to (e.g., / or /brand/b-alpha):", "/");
        if (fullPath) {
            sendRemoteCommand(kioskId, { type: 'navigate', path: fullPath });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Remote Kiosk Control</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor and control all active kiosk instances on this device in real-time.
                </p>
            </div>

            {kioskSessions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {kioskSessions.map(session => {
                        const profile = settings.kiosk.profiles?.find(p => p.id === session.id);
                        const sessionName = profile?.name || `Kiosk (${session.id.substring(0, 8)}...)`;
                        const isOnline = (Date.now() - session.lastHeartbeat) < 10000;

                        return (
                            <div key={session.id} className={`bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-lg border-l-4 ${isOnline ? 'border-green-500' : 'border-gray-500 opacity-70'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{sessionName}</p>
                                        <div className={`flex items-center gap-1.5 text-xs font-semibold ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {isOnline ? <SignalIcon className="w-3.5 h-3.5" /> : <SignalSlashIcon className="w-3.5 h-3.5" />}
                                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                                        </div>
                                    </div>
                                     <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                        <p className="truncate" title={session.currentPath}>Page: <strong>{session.currentPath}</strong></p>
                                        <p>Admin: <strong>{session.loggedInUser || 'None'}</strong></p>
                                    </div>
                                </div>
                                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-wrap items-center gap-2">
                                     <button onClick={() => handleNavigate(session.id, '/')} className="btn !text-xs !py-1.5 !px-3" disabled={!isOnline}>
                                        <ChevronRightIcon className="w-4 h-4" /> Home
                                    </button>
                                    <button onClick={() => handleNavigate(session.id, '')} className="btn !text-xs !py-1.5 !px-3" disabled={!isOnline}>
                                        <ChevronRightIcon className="w-4 h-4" /> Navigate...
                                    </button>
                                     <button onClick={() => sendRemoteCommand(session.id, { type: 'refresh' })} className="btn !text-xs !py-1.5 !px-3" disabled={!isOnline}>
                                        <ArrowPathIcon className="w-4 h-4" /> Refresh
                                    </button>
                                    <button onClick={() => sendRemoteCommand(session.id, { type: 'logout' })} className="btn !text-xs !py-1.5 !px-3" disabled={!isOnline || !session.loggedInUser}>
                                        <ArrowLeftOnRectangleIcon className="w-4 h-4" /> Logout
                                    </button>
                                    <button onClick={() => sendRemoteCommand(session.id, session.isScreensaverActive ? { type: 'stopScreensaver' } : { type: 'startScreensaver' })} className="btn !text-xs !py-1.5 !px-3" disabled={!isOnline}>
                                        {session.isScreensaverActive ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                        {session.isScreensaverActive ? 'Stop Screensaver' : 'Start Screensaver'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                    <SignalSlashIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Active Kiosks</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Open another tab or browser window with this app to see it here.</p>
                </div>
            )}
        </div>
    );
};

export default AdminRemoteControl;
