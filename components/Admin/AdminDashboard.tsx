import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Brand, Catalogue, Pamphlet, TvContent, Quote } from '../../types';
import AdminSettings from './AdminSettings.tsx';
import AdminScreensaverAds from './AdminScreensaverAds.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import AdminBackupRestore from './AdminBackupRestore.tsx';
import { PlusIcon, PencilIcon, TrashIcon, CircleStackIcon, ChevronDownIcon, BookOpenIcon, EyeIcon, ServerStackIcon, RestoreIcon, UsersIcon, DocumentTextIcon, TvIcon, ChartPieIcon, ClipboardDocumentListIcon, BuildingStorefrontIcon } from '../Icons.tsx';
import AdminUserManagement from './AdminUserManagement.tsx';
import AdminBulkImport from './AdminBulkImport.tsx';
import AdminZipBulkImport from './AdminZipBulkImport.tsx';
import AdminStorage from './AdminStorage.tsx';
import LocalMedia from '../LocalMedia.tsx';
import AdminTrash from './AdminTrash.tsx';
import AdminAnalytics from './AdminAnalytics.tsx';
import AdminClientManagement from './AdminClientManagement.tsx';
import AdminActivityLog from './AdminActivityLog.tsx';

type FooterTab = 'content' | 'system' | 'admin';
type SubTab = 'brands' | 'catalogues' | 'pamphlets' | 'screensaverAds' | 'tv-content' | 'trash' | 'settings' | 'storage' | 'backup' | 'users' | 'analytics' | 'quotes' | 'clients' | 'activityLog';

// Keep old type name `Tab` for minimal changes inside the render function
type Tab = SubTab;

const getStatus = (item: Catalogue | Pamphlet) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if ('startDate' in item) { // It's a Pamphlet
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
        endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
        endDate.setHours(23, 59, 59, 999);

        if (endDate < today) return { text: 'Expired', color: 'bg-gray-500' };
        if (startDate > today) return { text: 'Upcoming', color: 'bg-blue-500' };
        return { text: 'Active', color: 'bg-green-500' };
    } else { // It's a Catalogue
        const currentYear = today.getFullYear();
        if (item.year < currentYear) return { text: 'Archived', color: 'bg-gray-500' };
        return { text: 'Current', color: 'bg-green-500' };
    }
};

const AdminContentCard: React.FC<{
    item: Catalogue | Pamphlet;
    type: 'catalogue' | 'pamphlet';
    onDelete: (id: string, title: string) => void;
    allBrands?: Brand[];
    canEdit: boolean;
}> = ({ item, type, onDelete, allBrands, canEdit }) => {
    const navigate = useNavigate();
    const { text: statusText, color: statusColor } = getStatus(item);
    const imageUrl = 'thumbnailUrl' in item ? item.thumbnailUrl : item.imageUrl;
    const brandName = allBrands && 'brandId' in item && item.brandId ? allBrands.find(b => b.id === item.brandId)?.name : null;
    const itemTitle = item.title;

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-gray-200/80 dark:border-gray-700/50">
            <div className="relative cursor-pointer" onClick={() => canEdit && navigate(`/admin/${type}/edit/${item.id}`)}>
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700">
                    <LocalMedia src={imageUrl} alt={itemTitle} type="image" className="w-full h-full object-cover" />
                </div>
                <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full text-white ${statusColor} shadow-md`}>
                    {statusText}
                </span>
            </div>
            <div className="p-4 flex-grow">
                <h4 className="font-bold item-title truncate text-gray-800 dark:text-gray-100" title={itemTitle}>{itemTitle}</h4>
                {'year' in item ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{brandName ? `${brandName} - ${item.year}` : item.year}</p>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.startDate} to {item.endDate}</p>
                )}
            </div>
             {canEdit && (
                <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-1">
                    <button
                        onClick={() => navigate(`/admin/${type}/edit/${item.id}`)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={`Edit ${itemTitle}`}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item.id, itemTitle)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={`Delete ${itemTitle}`}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeFooterTab, setActiveFooterTab] = useState<FooterTab>('content');
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('brands');
    const [activeBulkImportTab, setActiveBulkImportTab] = useState<'csv' | 'zip'>('csv');
    const { brands, products, catalogues, pamphlets, deleteBrand, deleteCatalogue, deletePamphlet, loggedInUser, logout, storageProvider, showConfirmation, tvContent, deleteTvContent, quotes, clients, adminUsers, toggleQuoteStatus, deleteQuote, openQuoteStartModal } = useAppContext();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const handleDeleteBrand = (brandId: string, brandName: string) => {
        showConfirmation(
            `Are you sure you want to move the brand "${brandName}" to the trash? Associated products will be hidden but not deleted.`,
            () => deleteBrand(brandId)
        );
    };
    
    const handleDeleteCatalogue = (id: string, title: string) => {
        showConfirmation(
            `Are you sure you want to move the catalogue "${title}" to the trash?`,
            () => deleteCatalogue(id)
        );
    };

    const handleDeletePamphlet = (id: string, title: string) => {
        showConfirmation(
            `Are you sure you want to move the pamphlet "${title}" to the trash?`,
            () => deletePamphlet(id)
        );
    };

    const handleDeleteTvContent = (id: string, modelName: string) => {
        showConfirmation(
            `Are you sure you want to move the TV content for "${modelName}" to the trash?`,
            () => deleteTvContent(id)
        );
    };

    const handleDeleteQuote = (quote: Quote) => {
        const clientName = clients.find(c => c.id === quote.clientId)?.companyName || 'Unknown Client';
        showConfirmation(
            `Are you sure you want to delete the quote for "${clientName}"? This action cannot be undone.`,
            () => deleteQuote(quote.id)
        );
    };

    const handleFooterTabClick = (tab: FooterTab) => {
        setActiveFooterTab(tab);
        if (tab === 'content') setActiveSubTab('brands');
        if (tab === 'system') setActiveSubTab('storage');
        if (tab === 'admin') setActiveSubTab('analytics');
    };
    
    const ContentGrid: React.FC<{ title: string; items: (Catalogue[] | Pamphlet[]); type: 'catalogue' | 'pamphlet'; onDelete: (id: string, title: string) => void; allBrands?: Brand[], canEdit: boolean }> = ({ title, items, type, onDelete, allBrands, canEdit }) => {
        if (items.length === 0) return null;
        return (
            <div>
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 section-heading">{title}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {items.map(item => (
                        <AdminContentCard key={item.id} item={item} type={type} onDelete={onDelete} allBrands={allBrands} canEdit={canEdit} />
                    ))}
                </div>
            </div>
        )
    }

    const EmptyState: React.FC<{ icon: React.ReactNode; title: string; message: string; ctaText: string; onCtaClick: () => void; canAdd: boolean; }> = ({ icon, title, message, ctaText, onCtaClick, canAdd }) => (
        <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
             <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
             <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
            {canAdd && (
                <div className="mt-6">
                    <button onClick={onCtaClick} className="btn btn-primary">
                        <PlusIcon className="h-4 w-4" />
                        <span>{ctaText}</span>
                    </button>
                </div>
            )}
        </div>
    );

    const perms = loggedInUser?.permissions;
    const canManageBrands = loggedInUser?.isMainAdmin || perms?.canManageBrandsAndProducts;
    const canManageCatalogues = loggedInUser?.isMainAdmin || perms?.canManageCatalogues;
    const canManagePamphlets = loggedInUser?.isMainAdmin || perms?.canManagePamphlets;
    const canManageScreensaver = loggedInUser?.isMainAdmin || perms?.canManageScreensaver;
    const canManageSettings = loggedInUser?.isMainAdmin || perms?.canManageSettings;
    const canManageSystem = loggedInUser?.isMainAdmin || perms?.canManageSystem;
    const canManageTvContent = loggedInUser?.isMainAdmin || perms?.canManageTvContent;
    const canViewAnalytics = loggedInUser?.isMainAdmin || perms?.canViewAnalytics;
    const canManageQuotesAndClients = loggedInUser?.isMainAdmin || perms?.canManageQuotesAndClients;

    const renderSubTabContent = () => {
        const titleAndButton = (title: string, onAdd: () => void, canAdd: boolean) => (
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">{title}</h3>
                {canAdd && (
                    <button onClick={onAdd} className="btn btn-primary">
                        <PlusIcon className="h-4 w-4" />
                        <span>Add New</span>
                    </button>
                )}
            </div>
        );

        switch (activeSubTab) {
            case 'brands':
                const visibleBrands = brands.filter(b => !b.isDeleted);
                 return (
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Manage Brands</h3>
                                {canManageBrands && (
                                     <Link to="/admin/brand/new" className="btn btn-primary">
                                        <PlusIcon className="h-4 w-4" />
                                        <span>Add New Brand</span>
                                    </Link>
                                )}
                            </div>
                            {visibleBrands.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {visibleBrands.map(brand => (
                                        <div key={brand.id} className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 p-4 flex items-center justify-between gap-4 transition-all hover:shadow-xl hover:-translate-y-1">
                                            <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" onClick={() => navigate(`/admin/brand/${brand.id}`)}>
                                                <div className="h-16 w-16 flex items-center justify-center">
                                                    <LocalMedia
                                                      src={brand.logoUrl}
                                                      alt={brand.name}
                                                      type="image"
                                                      className="max-h-full max-w-full object-contain"
                                                      onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src=`https://placehold.co/100x100/E2E8F0/4A5568?text=${brand.name.charAt(0)}`; }}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate item-title">{brand.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{products.filter(p => p.brandId === brand.id && !p.isDiscontinued && !p.isDeleted).length} products</p>
                                                </div>
                                            </div>
                                            {canManageBrands && (
                                                <div className="flex items-center shrink-0">
                                                     <button type="button" onClick={() => navigate(`/admin/brand/edit/${brand.id}`)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit Brand">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDeleteBrand(brand.id, brand.name)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete Brand">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<CircleStackIcon className="w-full h-full" />} title="No Brands Found" message="Get started by adding your first brand." ctaText="Add New Brand" onCtaClick={() => navigate('/admin/brand/new')} canAdd={!!canManageBrands}/>
                            )}
                        </div>
                        {canManageBrands && (
                             <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/50">
                                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CircleStackIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Bulk Import Products</h3>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                                        <ChevronDownIcon className="w-5 h-5"/>
                                    </div>
                                </summary>
                                <div className="px-4 sm:px-5 py-6 border-t border-gray-200/80 dark:border-gray-700">
                                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                            <button
                                                type="button"
                                                onClick={() => setActiveBulkImportTab('csv')}
                                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeBulkImportTab === 'csv' ? 'border-gray-800 dark:border-gray-100 text-gray-800 dark:text-gray-100' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'}`}
                                            >
                                                CSV Upload
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveBulkImportTab('zip')}
                                                className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeBulkImportTab === 'zip' ? 'border-gray-800 dark:border-gray-100 text-gray-800 dark:text-gray-100' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'}`}
                                            >
                                                Zip Upload
                                            </button>
                                        </nav>
                                    </div>
                                    {activeBulkImportTab === 'csv' && <AdminBulkImport />}
                                    {activeBulkImportTab === 'zip' && <AdminZipBulkImport />}
                                </div>
                            </details>
                        )}
                       
                    </div>
                );
            case 'catalogues':
                const visibleCatalogues = catalogues.filter(c => !c.isDeleted);
                if (visibleCatalogues.length === 0) {
                     return <EmptyState icon={<BookOpenIcon className="w-full h-full" />} title="No Catalogues Found" message="Upload your first digital catalogue." ctaText="Add New Catalogue" onCtaClick={() => navigate('/admin/catalogue/new')} canAdd={!!canManageCatalogues} />;
                }
                const currentYear = new Date().getFullYear();
                const currentCatalogues = visibleCatalogues.filter(c => c.year === currentYear).sort((a,b) => a.title.localeCompare(b.title));
                const expiredCatalogues = visibleCatalogues.filter(c => c.year < currentYear).sort((a,b) => b.year - a.year || a.title.localeCompare(b.title));
                
                return (
                    <div className="space-y-8">
                        {titleAndButton("Manage Catalogues", () => navigate('/admin/catalogue/new'), !!canManageCatalogues)}
                        <ContentGrid title={`Current Catalogues (${currentYear})`} items={currentCatalogues} type="catalogue" onDelete={handleDeleteCatalogue} allBrands={brands} canEdit={!!canManageCatalogues} />
                        <ContentGrid title="Archived Catalogues" items={expiredCatalogues} type="catalogue" onDelete={handleDeleteCatalogue} allBrands={brands} canEdit={!!canManageCatalogues} />
                    </div>
                );
            case 'pamphlets':
                 const visiblePamphlets = pamphlets.filter(p => !p.isDeleted);
                 if (visiblePamphlets.length === 0) {
                     return <EmptyState icon={<DocumentTextIcon className="w-full h-full" />} title="No Pamphlets Found" message="Create your first promotional pamphlet." ctaText="Add New Pamphlet" onCtaClick={() => navigate('/admin/pamphlet/new')} canAdd={!!canManagePamphlets} />;
                 }
                 const todayPamphlet = new Date();
                 todayPamphlet.setHours(0, 0, 0, 0);

                 const activePamphlets = visiblePamphlets.filter(p => new Date(p.endDate) >= todayPamphlet && new Date(p.startDate) <= todayPamphlet).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                 const upcomingPamphlets = visiblePamphlets.filter(p => new Date(p.startDate) > todayPamphlet).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                 const expiredPamphlets = visiblePamphlets.filter(p => new Date(p.endDate) < todayPamphlet).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

                 return (
                    <div className="space-y-8">
                        {titleAndButton("Manage Pamphlets", () => navigate('/admin/pamphlet/new'), !!canManagePamphlets)}
                        <ContentGrid title="Active Pamphlets" items={activePamphlets} type="pamphlet" onDelete={handleDeletePamphlet} canEdit={!!canManagePamphlets} />
                        <ContentGrid title="Upcoming Pamphlets" items={upcomingPamphlets} type="pamphlet" onDelete={handleDeletePamphlet} canEdit={!!canManagePamphlets} />
                        <ContentGrid title="Expired Pamphlets" items={expiredPamphlets} type="pamphlet" onDelete={handleDeletePamphlet} canEdit={!!canManagePamphlets} />
                    </div>
                 );
            case 'quotes':
                const sortedQuotes = [...quotes].sort((a, b) => b.createdAt - a.createdAt);
                return (
                     <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Manage Quotes</h3>
                            <button onClick={openQuoteStartModal} className="btn btn-primary">
                                <PlusIcon className="h-4 w-4" />
                                <span>Create New Quote</span>
                            </button>
                        </div>
                        {sortedQuotes.length > 0 ? (
                            <div className="overflow-x-auto bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {sortedQuotes.map(quote => {
                                            const client = clients.find(c => c.id === quote.clientId);
                                            const admin = adminUsers.find(a => a.id === quote.adminId);
                                            const adminName = admin ? `${admin.firstName} ${admin.lastName}` : (quote.adminId === 'kiosk_user' ? 'Kiosk' : 'Unknown User');
                                            return (
                                                <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{client?.companyName || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(quote.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{adminName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{quote.items.length}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${quote.status === 'quoted' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                                            {quote.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link to={`/admin/quote/${quote.id}/print`} target="_blank" className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Print Quote"><EyeIcon className="h-4 w-4" /></Link>
                                                            <button onClick={() => toggleQuoteStatus(quote.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Toggle Status"><PencilIcon className="h-4 w-4" /></button>
                                                            <button onClick={() => handleDeleteQuote(quote)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Delete Quote"><TrashIcon className="h-4 w-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                           <EmptyState icon={<ClipboardDocumentListIcon className="w-full h-full" />} title="No Quotes Found" message="Create your first client quote to see it here." ctaText="Create New Quote" onCtaClick={openQuoteStartModal} canAdd={true} />
                        )}
                    </div>
                );
            case 'clients':
                return <AdminClientManagement />;
            case 'screensaverAds':
                return <AdminScreensaverAds />;
            case 'tv-content':
                const visibleTvContent = tvContent.filter(tc => !tc.isDeleted);
                const groupedByBrand = visibleTvContent.reduce((acc, content) => {
                    const brandName = brands.find(b => b.id === content.brandId)?.name || 'Unknown Brand';
                    if (!acc[brandName]) acc[brandName] = [];
                    acc[brandName].push(content);
                    return acc;
                }, {} as Record<string, TvContent[]>);

                return (
                    <div className="space-y-8">
                        {titleAndButton("Manage TV Content", () => navigate('/admin/tv-content/new'), !!canManageTvContent)}
                         {Object.keys(groupedByBrand).length > 0 ? Object.entries(groupedByBrand).map(([brandName, contents]) => (
                             <div key={brandName}>
                                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 section-heading">{brandName}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {contents.map(content => (
                                        <div key={content.id} className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 p-4 flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate item-title">{content.modelName}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{content.media.length} media items</p>
                                            </div>
                                            {canManageTvContent && (
                                                <div className="flex items-center shrink-0">
                                                     <button type="button" onClick={() => navigate(`/admin/tv-content/edit/${content.id}`)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit TV Content">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDeleteTvContent(content.id, content.modelName)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete TV Content">
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                             </div>
                         )) : (
                            <EmptyState icon={<TvIcon className="w-full h-full" />} title="No TV Content Found" message="Get started by adding your first TV model content." ctaText="Add TV Content" onCtaClick={() => navigate('/admin/tv-content/new')} canAdd={!!canManageTvContent}/>
                         )}
                    </div>
                )
            case 'settings':
                return <AdminSettings />;
            case 'storage':
                return <AdminStorage />;
            case 'backup':
                return <AdminBackupRestore />;
            case 'users':
                return <AdminUserManagement />;
            case 'trash':
                return <AdminTrash />;
            case 'analytics':
                return <AdminAnalytics />;
            case 'activityLog':
                return <AdminActivityLog />;
            default: return null;
        }
    }

    const renderSecondaryNav = () => {
        const backupTabLabel = storageProvider === 'customApi' ? 'Cloud Sync' : 'Backup & Restore';

        const contentTabs = [
            { id: 'brands' as SubTab, label: 'Brands & Products', icon: <CircleStackIcon className="h-4 w-4"/>, perm: canManageBrands },
            { id: 'quotes' as SubTab, label: 'Quotes', icon: <ClipboardDocumentListIcon className="h-4 w-4" />, perm: canManageQuotesAndClients },
            { id: 'clients' as SubTab, label: 'Clients', icon: <BuildingStorefrontIcon className="h-4 w-4" />, perm: canManageQuotesAndClients },
            { id: 'catalogues' as SubTab, label: 'Catalogues', icon: <BookOpenIcon className="h-4 w-4"/>, perm: canManageCatalogues },
            { id: 'pamphlets' as SubTab, label: 'Pamphlets', icon: <DocumentTextIcon className="h-4 w-4"/>, perm: canManagePamphlets },
            { id: 'screensaverAds' as SubTab, label: 'Screensaver', icon: <EyeIcon className="h-4 w-4"/>, perm: canManageScreensaver },
            { id: 'tv-content' as SubTab, label: 'TV Content', icon: <TvIcon className="h-4 w-4"/>, perm: canManageTvContent },
            { id: 'trash' as SubTab, label: 'Trash', icon: <TrashIcon className="h-4 w-4"/>, perm: canManageSystem }
        ];

        const systemTabs = [
            { id: 'storage' as SubTab, label: 'Storage', icon: <ServerStackIcon className="h-4 w-4"/>, perm: canManageSystem },
            { id: 'backup' as SubTab, label: backupTabLabel, icon: <RestoreIcon className="h-4 w-4"/>, perm: canManageSystem },
            { id: 'settings' as SubTab, label: 'Appearance & Settings', icon: <PencilIcon className="h-4 w-4"/>, perm: canManageSettings },
        ];

        const adminTabs = [
            { id: 'analytics' as SubTab, label: 'Analytics', icon: <ChartPieIcon className="h-4 w-4"/>, perm: canViewAnalytics },
            { id: 'users' as SubTab, label: 'Users', icon: <UsersIcon className="h-4 w-4"/>, perm: loggedInUser?.isMainAdmin },
            { id: 'activityLog' as SubTab, label: 'Activity Log', icon: <EyeIcon className="h-4 w-4"/>, perm: loggedInUser?.isMainAdmin },
        ];

        let tabsToShow: { id: SubTab, label: string, icon: React.ReactNode, perm?: boolean }[] = [];
        if (activeFooterTab === 'content') tabsToShow = contentTabs;
        if (activeFooterTab === 'system') tabsToShow = systemTabs;
        if (activeFooterTab === 'admin') tabsToShow = adminTabs;

        return (
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex items-center flex-wrap gap-x-6 gap-y-1 -mb-px" aria-label="Tabs">
                    {tabsToShow.filter(t => t.perm).map(tab => (
                         <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-3 font-semibold text-sm rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                                activeSubTab === tab.id
                                    ? 'text-gray-800 dark:text-gray-100 border-gray-800 dark:border-gray-100'
                                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        );
    };

    const FooterButton: React.FC<{ tab: FooterTab; label: string; icon: React.ReactNode; }> = ({ tab, label, icon }) => {
        const isActive = activeFooterTab === tab;
        return (
            <button
                type="button"
                onClick={() => handleFooterTabClick(tab)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
                <div className={`h-6 w-6 ${isActive ? '' : 'opacity-70'}`}>{icon}</div>
                <span className="text-xs font-bold">{label}</span>
            </button>
        );
    };


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex flex-col">
            <header className="p-4 sm:p-6 lg:p-8 shrink-0">
                 <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl tracking-tight text-gray-900 dark:text-gray-100 section-heading">Admin Dashboard</h1>
                        {loggedInUser && <p className="text-gray-600 dark:text-gray-400 mt-1">Signed in as {loggedInUser.firstName} {loggedInUser.lastName}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <BuildingStorefrontIcon className="h-4 w-4" />
                            <span>View Kiosk</span>
                        </Link>
                        <button type="button" onClick={handleLogout} className="btn btn-destructive">
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 overflow-y-auto pb-48">
                <div className="w-full max-w-6xl mx-auto">
                    {renderSecondaryNav()}
                    <div className="bg-gray-100/50 dark:bg-gray-800/20 p-6 rounded-2xl shadow-xl">
                        {renderSubTabContent()}
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-2">
                <nav className="max-w-md mx-auto flex items-center justify-around">
                    <FooterButton tab="content" label="Content" icon={<CircleStackIcon />} />
                    <FooterButton tab="system" label="System" icon={<ServerStackIcon />} />
                    <FooterButton tab="admin" label="Admin" icon={<UsersIcon />} />
                </nav>
            </footer>
        </div>
    );
};

export default AdminDashboard;