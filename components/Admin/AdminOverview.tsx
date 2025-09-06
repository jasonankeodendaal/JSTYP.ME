import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { CircleStackIcon, CubeIcon, UsersIcon, ClockIcon, SignalIcon, ChartBarIcon, ClipboardDocumentListIcon } from '../Icons.tsx';
import type { SubTab } from './AdminDashboard.tsx';

interface AdminOverviewProps {
    setActiveSubTab: (tab: SubTab) => void;
}

const StatCard: React.FC<{ title: string, value: number, icon: React.ReactNode, onClick: () => void }> = ({ title, value, icon, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-lg border dark:border-gray-700/50 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    </button>
);

const Widget: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, viewAllLink?: () => void, viewAllText?: string }> = ({ title, icon, children, viewAllLink, viewAllText }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 text-gray-500 dark:text-gray-400">
                    {icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h4>
            </div>
            {viewAllLink && (
                <button onClick={viewAllLink} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {viewAllText || 'View All'}
                </button>
            )}
        </div>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const AdminOverview: React.FC<AdminOverviewProps> = ({ setActiveSubTab }) => {
    const { brands, products, clients, adminUsers, activityLogs, viewCounts, kioskSessions, settings } = useAppContext();
    
    const recentActivity = useMemo(() => activityLogs.slice(0, 15), [activityLogs]);
    const userNameMap = useMemo(() => {
        const map = new Map<string, string>();
        adminUsers.forEach(u => map.set(u.id, `${u.firstName} ${u.lastName}`));
        map.set('kiosk_user', 'Kiosk User');
        return map;
    }, [adminUsers]);

    const { topBrands, topProducts } = useMemo(() => {
        const aggregatedBrands: Record<string, number> = {};
        const aggregatedProducts: Record<string, number> = {};

        Object.values(viewCounts).forEach(kioskData => {
            Object.entries(kioskData.brands).forEach(([brandId, count]) => {
                aggregatedBrands[brandId] = (aggregatedBrands[brandId] || 0) + count;
            });
            Object.entries(kioskData.products).forEach(([productId, count]) => {
                aggregatedProducts[productId] = (aggregatedProducts[productId] || 0) + count;
            });
        });

        const sortedBrands = Object.entries(aggregatedBrands)
            .map(([id, count]) => ({ id, name: brands.find(b => b.id === id)?.name || 'Unknown', count }))
            .filter(b => b.name !== 'Unknown')
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
            
        const sortedProducts = Object.entries(aggregatedProducts)
            .map(([id, count]) => ({ id, name: products.find(p => p.id === id)?.name || 'Unknown', count }))
            .filter(p => p.name !== 'Unknown')
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return { topBrands: sortedBrands, topProducts: sortedProducts };
    }, [viewCounts, brands, products]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Brands" value={brands.filter(b => !b.isDeleted).length} icon={<CircleStackIcon className="w-6 h-6"/>} onClick={() => setActiveSubTab('brands')} />
                <StatCard title="Total Products" value={products.filter(p => !p.isDeleted).length} icon={<CubeIcon className="w-6 h-6"/>} onClick={() => setActiveSubTab('brands')} />
                <StatCard title="Total Clients" value={clients.filter(c => !c.isDeleted).length} icon={<ClipboardDocumentListIcon className="w-6 h-6"/>} onClick={() => setActiveSubTab('clients')} />
                <StatCard title="Admin Users" value={adminUsers.length} icon={<UsersIcon className="w-6 h-6"/>} onClick={() => setActiveSubTab('users')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 <div className="xl:col-span-1">
                    <Widget title="Active Kiosks" icon={<SignalIcon className="w-6 h-6"/>} viewAllLink={() => setActiveSubTab('remoteControl')} viewAllText="Remote Control">
                        <div className="space-y-3">
                            {kioskSessions.length > 0 ? kioskSessions.map(session => (
                                <div key={session.id} className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{settings.kiosk.profiles?.find(p=>p.id === session.id)?.name || `Kiosk (${session.id.slice(0,8)})`}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Page: {session.currentPath}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Admin: {session.loggedInUser || 'None'}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400">No other active kiosks detected.</p>
                            )}
                        </div>
                    </Widget>
                </div>
                
                <div className="xl:col-span-2">
                     <Widget title="Top Performers" icon={<ChartBarIcon className="w-6 h-6"/>} viewAllLink={() => setActiveSubTab('analytics')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h5 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Most Viewed Brands</h5>
                                <ul className="space-y-2">
                                    {topBrands.length > 0 ? topBrands.map(b => <li key={b.id} className="text-sm">{b.name} ({b.count})</li>) : <li className="text-sm text-gray-500">No data yet.</li>}
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Most Viewed Products</h5>
                                 <ul className="space-y-2">
                                    {topProducts.length > 0 ? topProducts.map(p => <li key={p.id} className="text-sm">{p.name} ({p.count})</li>) : <li className="text-sm text-gray-500">No data yet.</li>}
                                </ul>
                            </div>
                        </div>
                    </Widget>
                </div>

                <div className="lg:col-span-2 xl:col-span-3">
                    <Widget title="Recent Activity" icon={<ClockIcon className="w-6 h-6"/>} viewAllLink={() => setActiveSubTab('activityLog')}>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {recentActivity.length > 0 ? recentActivity.map(log => (
                                <div key={log.id} className="text-sm">
                                    <p className="text-gray-800 dark:text-gray-200"><strong className="font-semibold">{userNameMap.get(log.userId) || 'Unknown User'}</strong> {log.details.toLowerCase()}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400">No activity has been logged yet.</p>
                            )}
                        </div>
                    </Widget>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;