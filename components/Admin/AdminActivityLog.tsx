import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import type { ActivityLog } from '../../types';
import { EyeIcon, PlusIcon, PencilIcon, TrashIcon, RestoreIcon, ArrowPathIcon, CheckIcon, ArrowLeftOnRectangleIcon, SearchIcon } from '../Icons.tsx';

const getActionDetails = (actionType: ActivityLog['actionType']) => {
    switch (actionType) {
        case 'CREATE': return { icon: <PlusIcon className="h-4 w-4" />, color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-800/50' };
        case 'UPDATE': return { icon: <PencilIcon className="h-4 w-4" />, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-800/50' };
        case 'DELETE': return { icon: <TrashIcon className="h-4 w-4" />, color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-800/50' };
        case 'HARD_DELETE': return { icon: <TrashIcon className="h-4 w-4" />, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-800/50' };
        case 'RESTORE': return { icon: <RestoreIcon className="h-4 w-4" />, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-800/50' };
        case 'SYNC': return { icon: <ArrowPathIcon className="h-4 w-4" />, color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-100 dark:bg-cyan-800/50' };
        case 'LOGIN': return { icon: <CheckIcon className="h-4 w-4" />, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-200 dark:bg-gray-700/80' };
        case 'LOGOUT': return { icon: <ArrowLeftOnRectangleIcon className="h-4 w-4" />, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-200 dark:bg-gray-700/80' };
        case 'VIEW': return { icon: <EyeIcon className="h-4 w-4" />, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-200 dark:bg-gray-700/80' };
        default: return { icon: <EyeIcon className="h-4 w-4" />, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-200 dark:bg-gray-700/80' };
    }
};


const AdminActivityLog: React.FC = () => {
    const { activityLogs, adminUsers, settings } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        user: 'all',
        kiosk: 'all',
        action: 'all',
        entity: 'all',
        startDate: '',
        endDate: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const { kioskNameMap, userNameMap, uniqueActions, uniqueEntities } = useMemo(() => {
        const kioskMap = new Map<string, string>();
        if (settings.kiosk?.profiles) {
            for (const profile of settings.kiosk.profiles) {
                kioskMap.set(profile.id, profile.name);
            }
        }
        
        const userMap = new Map<string, string>();
        for (const user of adminUsers) {
            userMap.set(user.id, `${user.firstName} ${user.lastName}`);
        }
        userMap.set('kiosk_user', 'Kiosk (Unauthenticated)');
        
        const actions = new Set<string>();
        const entities = new Set<string>();
        for(const log of activityLogs) {
            actions.add(log.actionType);
            entities.add(log.entityType);
            if (!kioskMap.has(log.kioskId)) {
                kioskMap.set(log.kioskId, `Unnamed Kiosk (${log.kioskId.substring(0,8)}...)`);
            }
        }

        return {
            kioskNameMap: kioskMap,
            userNameMap: userMap,
            uniqueActions: Array.from(actions).sort(),
            uniqueEntities: Array.from(entities).sort(),
        };
    }, [settings.kiosk?.profiles, adminUsers, activityLogs]);

    const filteredLogs = useMemo(() => {
        if (!activityLogs) return [];
        
        const searchLower = searchTerm.toLowerCase();
        const startDate = filters.startDate ? new Date(filters.startDate).setHours(0,0,0,0) : 0;
        const endDate = filters.endDate ? new Date(filters.endDate).setHours(23,59,59,999) : Infinity;

        return activityLogs
            .filter(log => {
                const matchSearch = searchLower ? log.details.toLowerCase().includes(searchLower) : true;
                const matchUser = filters.user === 'all' || log.userId === filters.user;
                const matchKiosk = filters.kiosk === 'all' || log.kioskId === filters.kiosk;
                const matchAction = filters.action === 'all' || log.actionType === filters.action;
                const matchEntity = filters.entity === 'all' || log.entityType === filters.entity;
                const matchDate = log.timestamp >= startDate && log.timestamp <= endDate;
                
                return matchSearch && matchUser && matchKiosk && matchAction && matchEntity && matchDate;
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [activityLogs, searchTerm, filters]);
    
    const inputStyle = "w-full bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500";
    
    return (
        <div className="space-y-6">
            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Activity Log</h3>
            
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-lg border dark:border-gray-700/50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select name="user" value={filters.user} onChange={handleFilterChange} className={inputStyle}><option value="all">All Users</option>{Array.from(userNameMap.entries()).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
                    <select name="kiosk" value={filters.kiosk} onChange={handleFilterChange} className={inputStyle}><option value="all">All Kiosks</option>{Array.from(kioskNameMap.entries()).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
                    <select name="action" value={filters.action} onChange={handleFilterChange} className={inputStyle}><option value="all">All Actions</option>{uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}</select>
                    <select name="entity" value={filters.entity} onChange={handleFilterChange} className={inputStyle}><option value="all">All Entities</option>{uniqueEntities.map(entity => <option key={entity} value={entity}>{entity}</option>)}</select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search details..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`${inputStyle} pl-9`} />
                    </div>
                    <div className="md:col-span-1"><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputStyle} /></div>
                    <div className="md:col-span-1"><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputStyle} /></div>
                </div>
            </div>

            {filteredLogs.length > 0 ? (
                <div className="space-y-3">
                    {filteredLogs.map(log => {
                        const { icon, color, bg } = getActionDetails(log.actionType);
                        return (
                            <div key={log.id} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-md border dark:border-gray-700/50 flex items-start gap-4">
                                <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${bg} ${color}`}>
                                    {icon}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{userNameMap.get(log.userId) || 'Unknown'}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{log.details}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span title={new Date(log.timestamp).toString()}>{new Date(log.timestamp).toLocaleString()}</span>
                                        <span className="mx-1.5">&bull;</span>
                                        <span>Kiosk: {kioskNameMap.get(log.kioskId) || 'Unknown'}</span>
                                        <span className="mx-1.5">&bull;</span>
                                        <span className={`font-semibold ${color}`}>{log.actionType}</span> on <span className="font-semibold">{log.entityType}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                 <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                    <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Activity Found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No logs match your current filters. Try broadening your search.</p>
                </div>
            )}
        </div>
    );
};

export default AdminActivityLog;