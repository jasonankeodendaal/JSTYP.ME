import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { ChartBarIcon, CubeIcon } from '../Icons';
import type { ViewCounts } from '../../types.ts';

const AdminAnalytics: React.FC = () => {
    const { brands, products, viewCounts, settings, updateSettings } = useAppContext();
    const [selectedKioskId, setSelectedKioskId] = useState('all');

    const kioskProfiles = useMemo(() => {
        const profiles = settings.kiosk?.profiles || [];
        const allKioskIds = Object.keys(viewCounts);
        
        const profileMap = new Map(profiles.map(p => [p.id, p.name]));
        
        return allKioskIds.map(id => ({
            id,
            name: profileMap.get(id) || `Unnamed Kiosk (${id.substring(0, 8)}...)`
        })).sort((a,b) => a.name.localeCompare(b.name));

    }, [viewCounts, settings.kiosk?.profiles]);

    const aggregatedData = useMemo(() => {
        if (selectedKioskId === 'all') {
            const aggregatedBrands: Record<string, number> = {};
            const aggregatedProducts: Record<string, number> = {};

            Object.values(viewCounts).forEach((kioskData: ViewCounts[string]) => {
                Object.entries(kioskData.brands).forEach(([brandId, count]) => {
                    aggregatedBrands[brandId] = (aggregatedBrands[brandId] || 0) + count;
                });
                Object.entries(kioskData.products).forEach(([productId, count]) => {
                    aggregatedProducts[productId] = (aggregatedProducts[productId] || 0) + count;
                });
            });
            return { brands: aggregatedBrands, products: aggregatedProducts };
        } else {
            return viewCounts[selectedKioskId] || { brands: {}, products: {} };
        }
    }, [selectedKioskId, viewCounts]);


    const brandData = useMemo(() => {
        if (!aggregatedData.brands) return [];
        return Object.entries(aggregatedData.brands)
            .map(([brandId, count]) => {
                const brand = brands.find(b => b.id === brandId && !b.isDeleted);
                return {
                    id: brandId,
                    name: brand?.name || `Deleted Brand`,
                    count: count,
                };
            })
            .filter(b => b.count > 0 && b.name !== 'Deleted Brand')
            .sort((a, b) => b.count - a.count);
    }, [aggregatedData.brands, brands]);

    const productData = useMemo(() => {
        if (!aggregatedData.products) return [];
        return Object.entries(aggregatedData.products)
            .map(([productId, count]) => {
                const product = products.find(p => p.id === productId && !p.isDeleted);
                const brand = brands.find(b => b.id === product?.brandId);
                return {
                    id: productId,
                    name: product?.name || `Deleted Product`,
                    brandName: brand?.name || 'N/A',
                    count: count,
                };
            })
            .filter(p => p.count > 0 && p.name !== 'Deleted Product')
            .sort((a, b) => b.count - a.count);
    }, [aggregatedData.products, products, brands]);
    
    const maxBrandViews = brandData.length > 0 ? Math.max(...brandData.map(b => b.count)) : 0;
    const maxProductViews = productData.length > 0 ? Math.max(...productData.map(p => p.count)) : 0;
    
    const handleKioskProfileNameChange = (kioskId: string, name: string) => {
        const profiles = settings.kiosk?.profiles || [];
        const existingProfileIndex = profiles.findIndex(p => p.id === kioskId);
        let newProfiles;

        if (existingProfileIndex > -1) {
            newProfiles = profiles.map((p, index) =>
                index === existingProfileIndex ? { ...p, name } : p
            );
        } else {
            newProfiles = [...profiles, { id: kioskId, name }];
        }
        
        const newKioskSettings = {
            ...settings.kiosk,
            profiles: newProfiles,
        };

        updateSettings({ kiosk: newKioskSettings });
    };

    const EmptyState: React.FC<{ title: string, message: string, icon: React.ReactNode }> = ({ title, message, icon }) => (
        <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
             <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
             <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <div>
                    <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Kiosk Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        View interactions per kiosk or see an aggregated total.
                    </p>
                </div>
                 <div className="w-full sm:w-64">
                     <label htmlFor="kiosk-select" className="sr-only">Select Kiosk</label>
                     <select
                        id="kiosk-select"
                        value={selectedKioskId}
                        onChange={e => setSelectedKioskId(e.target.value)}
                        className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                    >
                        <option value="all">All Kiosks (Aggregated)</option>
                        {kioskProfiles.map(profile => (
                            <option key={profile.id} value={profile.id}>{profile.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                           <ChartBarIcon className="h-6 w-6" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Most Viewed Brands</h4>
                    </div>
                    {brandData.length > 0 ? (
                        <ul className="space-y-4">
                            {brandData.slice(0, 10).map((brand, index) => (
                                <li key={brand.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{index + 1}. {brand.name}</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{brand.count} views</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${maxBrandViews > 0 ? (brand.count / maxBrandViews) * 100 : 0}%` }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                       <EmptyState title="No Brand Data" message="No brands have been viewed yet." icon={<ChartBarIcon className="w-full h-full" />} />
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400">
                           <CubeIcon className="h-6 w-6" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Most Viewed Products</h4>
                    </div>
                    {productData.length > 0 ? (
                        <ul className="space-y-4">
                            {productData.slice(0, 10).map((product, index) => (
                                <li key={product.id}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{index + 1}. {product.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.brandName}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0 ml-2">{product.count} views</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${maxProductViews > 0 ? (product.count / maxProductViews) * 100 : 0}%` }}></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                       <EmptyState title="No Product Data" message="No products have been viewed yet." icon={<CubeIcon className="w-full h-full" />} />
                    )}
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Kiosk Profiles</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Assign friendly names to your kiosks for easier analytics. New kiosks will appear here after they've been used at least once. Changes are saved automatically.
                </p>
                <div className="mt-4 space-y-3 max-w-lg">
                    {Object.keys(viewCounts).length > 0 ? Object.keys(viewCounts).map(kioskId => {
                        const profile = settings.kiosk?.profiles?.find(p => p.id === kioskId);
                        const currentName = profile?.name || '';
                        return (
                            <div key={kioskId} className="grid grid-cols-3 gap-4 items-center">
                                <div className="col-span-1">
                                    <label className="text-sm text-gray-500 dark:text-gray-400 truncate" title={kioskId}>{kioskId.substring(0, 15)}...</label>
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="text"
                                        value={currentName}
                                        onChange={(e) => handleKioskProfileNameChange(kioskId, e.target.value)}
                                        placeholder="Enter kiosk name (e.g., 'Front Desk')"
                                        className="w-full bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg shadow-sm py-2 px-3 text-sm"
                                    />
                                </div>
                            </div>
                        );
                    }) : (
                         <p className="text-sm text-gray-500 text-center py-4">No kiosk activity has been recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;