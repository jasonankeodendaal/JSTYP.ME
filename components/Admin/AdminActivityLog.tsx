import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { EyeIcon } from '../Icons.tsx';

const AdminActivityLog: React.FC = () => {
    const { activityLogs, adminUsers, settings } = useAppContext();

    const kioskNameMap = useMemo(() => {
        const map = new Map<string, string>();
        if (settings.kiosk?.profiles) {
            for (const profile of settings.kiosk.profiles) {
                map.set(profile.id, profile.name);
            }
        }
        return map;
    }, [settings.kiosk?.profiles]);

    const userNameMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const user of adminUsers) {
            map.set(user.id, `${user.firstName} ${user.lastName}`);
        }
        map.set('kiosk_user', 'Kiosk (Unauthenticated)');
        return map;
    }, [adminUsers]);

    const sortedLogs = useMemo(() => {
        if (!activityLogs) return [];
        return [...activityLogs].sort((a, b) => b.timestamp - a.timestamp);
    }, [activityLogs]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Activity Log</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    A chronological record of all changes made across all kiosks and users.
                </p>
            </div>
            {sortedLogs.length > 0 ? (
                <div className="overflow-x-auto bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kiosk</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {userNameMap.get(log.userId) || 'Unknown User'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {kioskNameMap.get(log.kioskId) || `Unnamed Kiosk`}
                                        <span className="text-xs text-gray-400 block" title={log.kioskId}>({log.kioskId.substring(0, 8)}...)</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            log.actionType.includes('CREATE') ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                            log.actionType.includes('UPDATE') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                            log.actionType.includes('DELETE') ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                                        }`}>
                                            {log.actionType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                    <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Activity Recorded</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Changes made by users will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default AdminActivityLog;