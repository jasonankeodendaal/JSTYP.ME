import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Brand, Catalogue, Pamphlet, Client } from '../../types';
import AdminSettings from './AdminSettings';
import AdminScreensaverAds from './AdminScreensaverAds';
import { useAppContext } from '../context/AppContext.tsx';
import AdminBackupRestore from './AdminBackupRestore';
import { PlusIcon, PencilIcon, TrashIcon, CircleStackIcon, ChevronDownIcon, BookOpenIcon, EyeIcon, ServerStackIcon, UsersIcon, DocumentArrowRightIcon, TvIcon, ChartPieIcon, XIcon, ChevronUpIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon } from '../Icons';
import AdminUserManagement from './AdminUserManagement';
import AdminBulkImport from './AdminBulkImport';
import AdminZipBulkImport from './AdminZipBulkImport';
import AdminStorage from './AdminStorage';
import LocalMedia from '../LocalMedia';
import AdminTrash from './AdminTrash';
import AdminPdfConverter from './AdminPdfConverter';
import AdminAnalytics from './AdminAnalytics';

type Section = 'brands' | 'content' | 'kiosk' | 'settings' | 'system' | 'users' | 'analytics' | 'quotes' | 'trash' | 'pdf';
type SubSection = 'catalogues' | 'pamphlets';

const MotionDiv = motion.div as any;

// Floating Footer Component
const AdminFooter: React.FC<{ activeSection: Section; setActiveSection: (section: Section) => void; logout: () => void; loggedInUser: any; }> = ({ activeSection, setActiveSection, logout, loggedInUser }) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    
    const mainNavItems = [
        { id: 'brands', label: 'Brands', icon: <BuildingStorefrontIcon className="w-6 h-6" /> },
        { id: 'content', label: 'Content', icon: <BookOpenIcon className="w-6 h-6" /> },
        { id: 'kiosk', label: 'Kiosk', icon: <TvIcon className="w-6 h-6" /> },
        { id: 'settings', label: 'Settings', icon: <PencilIcon className="w-6 h-6" /> },
    ];
    
    const subMenuItems = [
        { id: 'system', label: 'System', icon: <ServerStackIcon className="w-5 h-5" /> },
        { id: 'users', label: 'Users', icon: <UsersIcon className="w-5 h-5" /> },
        { id: 'analytics', label: 'Analytics', icon: <ChartPieIcon className="w-5 h-5" /> },
        { id: 'quotes', label: 'Quotes', icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
        { id: 'trash', label: 'Trash', icon: <TrashIcon className="w-5 h-5" /> },
        { id: 'pdf', label: 'PDF Tool', icon: <DocumentArrowRightIcon className="w-5 h-5" /> },
    ];

    return (
        <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-30">
            <AnimatePresence>
                {isSubMenuOpen && (
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute bottom-full mb-3 w-full p-2 bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50"
                    >
                        <div className="p-2 border-b border-gray-300 dark:border-gray-600 mb-2 text-center">
                            <h1 className="text-md font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Signed in as {loggedInUser?.firstName}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {subMenuItems.map(item => (
                                <button key={item.id} onClick={() => { setActiveSection(item.id as Section); setIsSubMenuOpen(false); }} className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    {item.icon}
                                    <span className="text-xs mt-1">{item.label}</span>
                                </button>
                            ))}
                            <Link to="/" className="flex flex-col items-center p-2 rounded-lg transition-colors text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50">
                                <EyeIcon className="w-5 h-5" />
                                <span className="text-xs mt-1 font-semibold">View Kiosk</span>
                            </Link>
                            <button onClick={logout} className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-red-500">
                                <XIcon className="w-5 h-5" />
                                <span className="text-xs mt-1">Logout</span>
                            </button>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
             <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-2 flex items-center justify-around">
                {mainNavItems.map(item => (
                    <button key={item.id} onClick={() => setActiveSection(item.id as Section)} className="relative flex-1 flex flex-col items-center p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                        {item.icon}
                        <span className={`text-xs mt-1 font-semibold ${activeSection === item.id ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{item.label}</span>
                        {activeSection === item.id && (
                            <MotionDiv layoutId="active-indicator" className="absolute bottom-0 h-1 w-8 bg-indigo-500 rounded-full" />
                        )}
                    </button>
                ))}
                <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 mx-2" />
                <button onClick={() => setIsSubMenuOpen(p => !p)} className="relative w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center">
                    <AnimatePresence initial={false} mode="wait">
                         <MotionDiv
                            key={isSubMenuOpen ? 'close' : 'open'}
                            initial={{ rotate: -45, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 45, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isSubMenuOpen ? <XIcon className="w-7 h-7" /> : <ChevronUpIcon className="w-7 h-7" />}
                        </MotionDiv>
                    </AnimatePresence>
                </button>
            </div>
        </footer>
    );
};


// Main Dashboard Component
const AdminDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('brands');
    const { loggedInUser, logout } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'brands': return <AdminBrandsView />;
            case 'content': return <AdminContentManagement />;
            case 'kiosk': return <AdminKioskManagement />;
            case 'settings': return <AdminSettings />;
            case 'system': return <AdminSystemManagement />;
            case 'users': return <AdminUserManagement />;
            case 'analytics': return <AdminAnalytics />;
            case 'quotes': return <AdminQuotesView />;
            case 'trash': return <AdminTrash />;
            case 'pdf': return <AdminPdfConverter />;
            default: return <AdminBrandsView />;
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 overflow-hidden flex flex-col">
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-8 pb-32">
                <div className="w-full max-w-6xl mx-auto">
                    <div className="bg-white/90 dark:bg-gray-800/70 p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
                        <AnimatePresence mode="wait">
                            <MotionDiv
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </MotionDiv>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
            <AdminFooter activeSection={activeSection} setActiveSection={setActiveSection} logout={handleLogout} loggedInUser={loggedInUser} />
        </div>
    );
};

// --- Sub-components for Content Rendering ---

const AdminSystemManagement = () => (
    <div className="space-y-6">
        <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">System, Sync & Storage</h3>
        <AdminStorage />
        <AdminBackupRestore />
    </div>
);

const AdminBrandsView: React.FC = () => {
    const { brands, products, deleteBrand, loggedInUser, showConfirmation } = useAppContext();
    const navigate = useNavigate();
    const [activeBulkImportTab, setActiveBulkImportTab] = useState<'csv' | 'zip'>('csv');
    const perms = loggedInUser?.permissions;
    const canManageBrands = loggedInUser?.isMainAdmin || perms?.canManageBrandsAndProducts;

    const handleDeleteBrand = (brandId: string, brandName: string) => {
        showConfirmation(
            `Are you sure you want to move the brand "${brandName}" to the trash? Associated products will be hidden but not deleted.`,
            () => deleteBrand(brandId)
        );
    };

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
                                    <div className="h-16 w-16 flex items-center justify-center"><LocalMedia src={brand.logoUrl} alt={brand.name} type="image" className="max-h-full max-w-full object-contain"/></div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate item-title">{brand.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{products.filter(p => p.brandId === brand.id && !p.isDiscontinued && !p.isDeleted).length} products</p>
                                    </div>
                                </div>
                                {canManageBrands && (
                                    <div className="flex items-center shrink-0">
                                        <button type="button" onClick={() => navigate(`/admin/brand/edit/${brand.id}`)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit Brand"><PencilIcon className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => handleDeleteBrand(brand.id, brand.name)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete Brand"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                        <CircleStackIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Brands Found</h3>
                        {canManageBrands && <Link to="/admin/brand/new" className="btn btn-primary mt-4"><PlusIcon className="h-4 w-4" /><span>Add New Brand</span></Link>}
                    </div>
                )}
            </div>
            {canManageBrands && (
                 <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/50">
                    <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3"><CircleStackIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" /><h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Bulk Import Products</h3></div>
                        <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180"><ChevronDownIcon className="w-5 h-5"/></div>
                    </summary>
                    <div className="px-4 sm:px-5 py-6 border-t border-gray-200/80 dark:border-gray-700">
                        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button type="button" onClick={() => setActiveBulkImportTab('csv')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeBulkImportTab === 'csv' ? 'border-gray-800 dark:border-gray-100 text-gray-800 dark:text-gray-100' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'}`}>CSV Upload</button>
                                <button type="button" onClick={() => setActiveBulkImportTab('zip')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeBulkImportTab === 'zip' ? 'border-gray-800 dark:border-gray-100 text-gray-800 dark:text-gray-100' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'}`}>Zip Upload</button>
                            </nav>
                        </div>
                        {activeBulkImportTab === 'csv' && <AdminBulkImport />}
                        {activeBulkImportTab === 'zip' && <AdminZipBulkImport />}
                    </div>
                </details>
            )}
        </div>
    );
};

const AdminContentManagement: React.FC = () => {
    const [subSection, setSubSection] = useState<SubSection>('catalogues');
    const { catalogues, pamphlets, deleteCatalogue, deletePamphlet, brands, loggedInUser, showConfirmation } = useAppContext();
    const navigate = useNavigate();
    const perms = loggedInUser?.permissions;
    const canManageCatalogues = loggedInUser?.isMainAdmin || perms?.canManageCatalogues;
    const canManagePamphlets = loggedInUser?.isMainAdmin || perms?.canManagePamphlets;

    const getStatus = (item: Catalogue | Pamphlet) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if ('startDate' in item) { // Pamphlet
            const endDate = new Date(item.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (endDate < today) return { text: 'Expired', color: 'bg-gray-500' };
            const startDate = new Date(item.startDate);
            if (startDate > today) return { text: 'Upcoming', color: 'bg-blue-500' };
            return { text: 'Active', color: 'bg-green-500' };
        } else { // Catalogue
            if (item.year < today.getFullYear()) return { text: 'Archived', color: 'bg-gray-500' };
            return { text: 'Current', color: 'bg-green-500' };
        }
    };

    const handleDelete = (type: 'catalogue' | 'pamphlet', id: string, title: string) => {
        showConfirmation(`Are you sure you want to move the ${type} "${title}" to the trash?`, () => {
            if (type === 'catalogue') deleteCatalogue(id);
            else deletePamphlet(id);
        });
    };

    const visibleCatalogues = catalogues.filter(c => !c.isDeleted).sort((a,b) => b.year - a.year || a.title.localeCompare(b.title));
    const visiblePamphlets = pamphlets.filter(p => !p.isDeleted).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setSubSection('catalogues')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${subSection === 'catalogues' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Catalogues</button>
                        <button onClick={() => setSubSection('pamphlets')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${subSection === 'pamphlets' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Pamphlets</button>
                    </nav>
                </div>
                {subSection === 'catalogues' && canManageCatalogues && <Link to="/admin/catalogue/new" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Add New</Link>}
                {subSection === 'pamphlets' && canManagePamphlets && <Link to="/admin/pamphlet/new" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Add New</Link>}
            </div>

            <AnimatePresence mode="wait">
                <MotionDiv key={subSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    {subSection === 'catalogues' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {visibleCatalogues.map(item => <ContentCard key={item.id} item={item} type="catalogue" onDelete={handleDelete} allBrands={brands} canEdit={!!canManageCatalogues} getStatus={getStatus} navigate={navigate} />)}
                        </div>
                    )}
                    {subSection === 'pamphlets' && (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {visiblePamphlets.map(item => <ContentCard key={item.id} item={item} type="pamphlet" onDelete={handleDelete} canEdit={!!canManagePamphlets} getStatus={getStatus} navigate={navigate} />)}
                        </div>
                    )}
                </MotionDiv>
            </AnimatePresence>
        </div>
    );
};

const ContentCard: React.FC<{ item: Catalogue | Pamphlet; type: 'catalogue' | 'pamphlet'; onDelete: any; allBrands?: Brand[]; canEdit: boolean; getStatus: any; navigate: any; }> = ({ item, type, onDelete, allBrands, canEdit, getStatus, navigate }) => {
    const { text: statusText, color: statusColor } = getStatus(item);
    const imageUrl = 'thumbnailUrl' in item ? item.thumbnailUrl : item.imageUrl;
    const brandName = allBrands && 'brandId' in item && item.brandId ? allBrands.find(b => b.id === item.brandId)?.name : null;
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border border-gray-200/80 dark:border-gray-700/50">
            <div className="relative cursor-pointer" onClick={() => canEdit && navigate(`/admin/${type}/edit/${item.id}`)}>
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700"><LocalMedia src={imageUrl} alt={item.title} type="image" className="w-full h-full object-cover" /></div>
                <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full text-white ${statusColor} shadow-md`}>{statusText}</span>
            </div>
            <div className="p-4 flex-grow">
                <h4 className="font-bold item-title truncate text-gray-800 dark:text-gray-100" title={item.title}>{item.title}</h4>
                {'year' in item ? <p className="text-sm text-gray-500 dark:text-gray-400">{brandName ? `${brandName} - ${item.year}` : item.year}</p> : <p className="text-sm text-gray-500 dark:text-gray-400">{item.startDate} to {item.endDate}</p>}
            </div>
            {canEdit && (
                <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-1">
                    <button onClick={() => navigate(`/admin/${type}/edit/${item.id}`)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={`Edit`}><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(type, item.id, item.title)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={`Delete`}><TrashIcon className="h-4 w-4" /></button>
                </div>
            )}
        </div>
    );
};

const AdminKioskManagement: React.FC = () => {
    // This component can be expanded to include TV content management as well
    return <AdminScreensaverAds />;
};

const AdminQuotesView: React.FC = () => {
    const { quotes, clients, adminUsers, toggleQuoteStatus } = useAppContext();
    const navigate = useNavigate();

    const enrichedQuotes = useMemo(() => quotes.map(quote => {
        const client = clients.find(c => c.id === quote.clientId);
        const admin = adminUsers.find(a => a.id === quote.adminId);
        return { ...quote, client, admin };
    }).sort((a, b) => b.createdAt - a.createdAt), [quotes, clients, adminUsers]);
    
    const quotesByClient = useMemo(() => {
        const grouped: { [clientId: string]: { client: Client | undefined, quotes: typeof enrichedQuotes } } = {};
        for (const quote of enrichedQuotes) {
            if (!grouped[quote.clientId]) {
                grouped[quote.clientId] = { client: quote.client, quotes: [] };
            }
            grouped[quote.clientId].quotes.push(quote);
        }
        return Object.values(grouped).sort((a, b) => a.client?.companyName.localeCompare(b.client?.companyName || '') || 0);
    }, [enrichedQuotes]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Client Quote Inquiries</h3>
            {quotesByClient.length === 0 ? (
                 <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Inquiries Found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create one from the kiosk homepage while logged in.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {quotesByClient.map(({ client, quotes }) => (
                         <details key={client?.id || 'unknown'} className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden border dark:border-gray-700/50" open>
                             <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100">{client?.companyName || 'Unknown Client'}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">{quotes.length} {quotes.length === 1 ? 'inquiry' : 'inquiries'}</span>
                                    <ChevronDownIcon className="w-5 h-5 text-gray-500 transform group-open:rotate-180 transition-transform" />
                                </div>
                            </summary>
                            <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-3">
                                {quotes.map(quote => (
                                    <div key={quote.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${quote.status === 'quoted' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                                    {quote.status}
                                                </span>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{quote.items.length} items</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">By {quote.admin?.firstName || 'N/A'} on {new Date(quote.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={() => toggleQuoteStatus(quote.id)} className="btn bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 !py-1.5 !px-3 text-xs">
                                                 {quote.status === 'pending' ? 'Mark as Quoted' : 'Mark as Pending'}
                                            </button>
                                            <button onClick={() => navigate(`/admin/quote/${quote.id}/print`)} className="btn btn-primary !py-1.5 !px-3 text-xs">View/Print</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;