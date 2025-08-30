import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Brand, Catalogue, Pamphlet, Client, TvContent } from '../../types';
import AdminSettings from './AdminSettings.tsx';
import AdminScreensaverAds from './AdminScreensaverAds.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import AdminBackupRestore from './AdminBackupRestore.tsx';
import { PlusIcon, PencilIcon, TrashIcon, CircleStackIcon, ChevronDownIcon, BookOpenIcon, EyeIcon as ViewKioskIcon, ServerStackIcon, UsersIcon, DocumentArrowRightIcon, TvIcon, ChartPieIcon, XIcon, ChevronUpIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon, SparklesIcon } from '../Icons.tsx';
import AdminUserManagement from './AdminUserManagement.tsx';
import AdminBulkImport from './AdminBulkImport.tsx';
import AdminZipBulkImport from './AdminZipBulkImport.tsx';
import AdminStorage from './AdminStorage.tsx';
import LocalMedia from '../LocalMedia.tsx';
import AdminTrash from './AdminTrash.tsx';
import AdminPdfConverter from './AdminPdfConverter.tsx';
import AdminAnalytics from './AdminAnalytics.tsx';
import SetupInstruction from './SetupInstruction.tsx';
import DataImporter from './DataImporter.tsx';
import AdminWebsiteImporter from './AdminWebsiteImporter.tsx';


type Section = 'brands' | 'content' | 'settings' | 'system' | 'users' | 'analytics' | 'quotes' | 'trash' | 'pdf';
type SubSection = 'catalogues' | 'pamphlets' | 'screensaver' | 'tv';

const MotionDiv = motion.div as any;

// Floating Footer Component
const AdminFooter: React.FC<{ activeSection: Section; setActiveSection: (section: Section) => void; logout: () => void; loggedInUser: any; }> = ({ activeSection, setActiveSection, logout, loggedInUser }) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    
    const mainNavItems = [
        { id: 'brands', label: 'Brands', icon: <BuildingStorefrontIcon className="w-6 h-6" /> },
        { id: 'content', label: 'Content', icon: <BookOpenIcon className="w-6 h-6" /> },
        { id: 'system', label: 'System', icon: <ServerStackIcon className="w-6 h-6" /> },
        { id: 'settings', label: 'Settings', icon: <PencilIcon className="w-6 h-6" /> },
    ];
    
    const subMenuItems = [
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
                                <ViewKioskIcon className="w-5 h-5" />
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
    const [activeSection, setActiveSection] = useState<Section>('system');
    const { loggedInUser, logout } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'brands': return <AdminBrandsView />;
            case 'content': return <AdminContentAndKioskManagement />;
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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-12 xl:p-16 pt-8">
                <div className="bg-white/90 dark:bg-gray-800/70 p-6 pb-96 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
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
            <AdminFooter activeSection={activeSection} setActiveSection={setActiveSection} logout={handleLogout} loggedInUser={loggedInUser} />
        </div>
    );
};

// --- Sub-components for Content Rendering ---

const AdminSystemManagement = () => (
    <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 space-y-6">
                <AdminStorage />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <AdminBackupRestore />
            </div>
        </div>
        
        <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700/50">
            <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="h-6 w-6 text-indigo-500" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">AI Website Importer (Beta)</h3>
                </div>
                <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                    <ChevronDownIcon className="w-5 h-5"/>
                </div>
            </summary>
            <div className="px-4 sm:px-5 py-6 border-t border-gray-200/80 dark:border-gray-700">
                <AdminWebsiteImporter />
            </div>
        </details>

        <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700/50">
            <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                    <DocumentArrowRightIcon className="h-6 w-6 text-indigo-500" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Catalogue Data Importer</h3>
                </div>
                <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                    <ChevronDownIcon className="w-5 h-5"/>
                </div>
            </summary>
            <div className="px-4 sm:px-5 py-6 border-t border-gray-200/80 dark:border-gray-700">
                <DataImporter />
            </div>
        </details>

        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading mb-4">Setup Guides</h3>
            <div className="space-y-4">
                 <SetupInstruction title="The Definitive Guide: Cloud Sync with PM2 (Recommended)" defaultOpen>
                    <p><strong>Use this for:</strong> The most powerful and reliable setup. Manage a main admin PC and multiple display kiosks across different locations, all synced together over the internet.</p>
                    <p>This setup uses <strong>PM2</strong>, a professional process manager, to ensure your server and the secure connection run 24/7 and restart automatically.</p>
                    
                    <hr/>
                    <h4>Part 1: Configure Your Central Server (On Your Main PC)</h4>
                    
                    <h5>Step 1.1: One-Time System Installations</h5>
                    <ol>
                        <li><strong>Install Node.js:</strong> If you don't have it, go to <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">nodejs.org</a>, download and install the <strong>LTS version</strong>. Verify the installation by opening a terminal and running <code>node -v</code> and <code>npm -v</code>.</li>
                        <li><strong>Install PM2:</strong> In your terminal, run this command to install PM2 globally: <pre><code>npm install -g pm2</code></pre></li>
                        <li><strong>Install Cloudflare Tunnel:</strong> Follow the official guide to install the <code>cloudflared</code> tool from <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" target="_blank" rel="noopener noreferrer">this link</a>.</li>
                    </ol>

                    <h5>Step 1.2: Configure the Server Project</h5>
                    <ol>
                        <li><strong>Open a Terminal in the `server` Folder:</strong> In your project, navigate into the <code>server</code> directory.</li>
                        <li><strong>Install Server Dependencies:</strong> Run this command once: <pre><code>npm install</code></pre></li>
                        <li><strong>CRITICAL - Set Your Secret API Key:</strong> In the <code>server</code> folder, rename the file <code>.env.example</code> to exactly <code>.env</code>. Open this new file and replace the placeholder key with your own private password.</li>
                    </ol>

                    <h5>Step 1.3: Run and Persist the Server with PM2</h5>
                    <ol>
                        <li>
                            <strong>Start Both Services:</strong> In your terminal (still inside the <code>server</code> folder), run this command. It uses the project's configuration file to start both your API server and the Cloudflare tunnel in the background.
                            <pre><code>pm2 start</code></pre>
                            <p className="text-xs"><strong>Tip:</strong> You can run <code>pm2 delete all</code> first for a clean start. Check that both <code>kiosk-api</code> and <code>kiosk-tunnel</code> are online with <code>pm2 list</code>.</p>
                        </li>
                        <li>
                            <strong>Get Your Public URL:</strong> The "Cloudflare terminal" is now running in the background. To see its output and get your permanent public URL, run:
                            <pre><code>pm2 logs kiosk-tunnel</code></pre>
                            Look for a URL like <code>https://...trycloudflare.com</code>. <strong>Copy this URL</strong>. You can press <code>Ctrl + C</code> to exit the logs view.
                        </li>
                        <li>
                            <strong>Make it Permanent (Crucial for Reliability):</strong> To make PM2 restart everything automatically after a computer reboot, run this command:
                            <pre><code>pm2 startup</code></pre>
                            <strong>The command will output another command.</strong> You must copy that entire new command, paste it back into the same terminal, and press Enter. Finally, save your current process list so it knows what to restart:
                            <pre><code>pm2 save</code></pre>
                            Your server is now fully configured and running 24/7. You can close the terminal.
                        </li>
                    </ol>
                    <hr/>
                    <h4>Part 2: Deploy the Kiosk App to a Public URL</h4>
                    <p>Your frontend application needs to be hosted online. A service like Vercel is perfect for this.</p>
                    <ol>
                        <li>Push your project to a GitHub repository.</li>
                        <li>Create a free account at <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel.com</a> and import your GitHub repository.</li>
                        <li>Deploy. Vercel will give you a public URL (e.g., <code>your-app.vercel.app</code>). This is the URL you will use on your kiosk devices.</li>
                    </ol>
                    <hr/>
                    <h4>Part 3: Connect Your Kiosks to Your Server</h4>
                    <p>You must do this on <strong>every single device</strong> you want to sync, including your main PC's browser.</p>
                    <ol>
                        <li>Open your live app using the Vercel URL.</li>
                        <li>Log in as an admin (default PIN: <code>1723</code>).</li>
                        <li>In the admin panel, navigate to <strong>System &gt; Storage</strong>.</li>
                        <li>Find and expand the <strong>"Sync &amp; API Settings"</strong> section at the bottom.</li>
                        <li>In <strong>"Custom API URL"</strong>, paste your public Cloudflare URL from Part 1 and <strong>add <code>/data</code></strong> to the end (e.g., <code>https://...com/data</code>).</li>
                        <li>In <strong>"Custom API Auth Key"</strong>, enter the secret <code>API_KEY</code> from your server's <code>.env</code> file.</li>
                        <li>Go back to the top of the Storage page and click the <strong>"Connect"</strong> button on the "Custom API Sync" card.</li>
                        <li>Navigate to the new <strong>"Cloud Sync"</strong> tab that appears.
                            <ul>
                                <li><strong>On your main admin PC:</strong> Click <strong>"Push to Cloud"</strong>. This uploads your local data to the server for the first time.</li>
                                <li><strong>On all other devices:</strong> Click <strong>"Pull from Cloud"</strong>. This downloads the master data from your server.</li>
                            </ul>
                        </li>
                        <li><strong>Enable Auto-Sync:</strong> On <strong>every device</strong>, go to <strong>Settings &gt; Kiosk Mode</strong> and turn on the <strong>"Enable Auto-Sync"</strong> toggle.</li>
                    </ol>
                    <p>Your multi-device kiosk system is now fully configured and running!</p>
                </SetupInstruction>
                 <SetupInstruction title="Alternative: How to use a Local or Network Folder">
                    <ol>
                        <li>Click the <strong>"Connect to Folder"</strong> button in the Storage section.</li>
                        <li>Your browser will ask you to select a folder. Choose a folder on your computer or a shared network drive accessible by other kiosks. Grant permission when prompted.</li>
                        <li>Once setup is complete and you are in the admin panel, go to the <strong>"Backup & Restore"</strong> tab.</li>
                        <li>Click <strong>"Save to Drive"</strong> to create a `database.json` file and save all your current product data and assets to the selected folder.</li>
                        <li>On other kiosks, connect to the same folder and use the <strong>"Load from Drive"</strong> button to get the latest data.</li>
                    </ol>
                </SetupInstruction>
            </div>
        </div>
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
                                        <button type="button" onClick={() => navigate(`/admin/brand/edit/${brand.id}`)} className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit Brand"><PencilIcon className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => handleDeleteBrand(brand.id, brand.name)} className="p-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete Brand"><TrashIcon className="h-4 w-4" /></button>
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

const AdminContentAndKioskManagement: React.FC = () => {
    const [subSection, setSubSection] = useState<SubSection>('catalogues');
    const { catalogues, pamphlets, tvContent, brands, deleteCatalogue, deletePamphlet, deleteTvContent, loggedInUser, showConfirmation } = useAppContext();
    const navigate = useNavigate();
    const perms = loggedInUser?.permissions;
    const canManageCatalogues = loggedInUser?.isMainAdmin || perms?.canManageCatalogues;
    const canManagePamphlets = loggedInUser?.isMainAdmin || perms?.canManagePamphlets;
    const canManageTvContent = loggedInUser?.isMainAdmin || perms?.canManageTvContent;

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

    const handleDelete = (type: 'catalogue' | 'pamphlet' | 'tv', id: string, title: string) => {
        showConfirmation(`Are you sure you want to move the ${type} "${title}" to the trash?`, () => {
            if (type === 'catalogue') deleteCatalogue(id);
            else if (type === 'pamphlet') deletePamphlet(id);
            else if (type === 'tv') deleteTvContent(id);
        });
    };

    const visibleCatalogues = catalogues.filter(c => !c.isDeleted).sort((a,b) => b.year - a.year || a.title.localeCompare(b.title));
    const visiblePamphlets = pamphlets.filter(p => !p.isDeleted).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    const visibleTvContent = tvContent.filter(tc => !tc.isDeleted);
    const groupedTvContent = visibleTvContent.reduce((acc, content) => {
        const brandName = brands.find(b => b.id === content.brandId)?.name || 'Unknown Brand';
        if (!acc[brandName]) acc[brandName] = [];
        acc[brandName].push(content);
        return acc;
    }, {} as Record<string, TvContent[]>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setSubSection('catalogues')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${subSection === 'catalogues' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Catalogues</button>
                        <button onClick={() => setSubSection('pamphlets')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${subSection === 'pamphlets' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Pamphlets</button>
                        <button onClick={() => setSubSection('screensaver')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${subSection === 'screensaver' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Screensaver Ads</button>
                        <button onClick={() => setSubSection('tv')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${subSection === 'tv' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>TV Content</button>
                    </nav>
                </div>
                {subSection === 'catalogues' && canManageCatalogues && <Link to="/admin/catalogue/new" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Add New</Link>}
                {subSection === 'pamphlets' && canManagePamphlets && <Link to="/admin/pamphlet/new" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Add New</Link>}
                {subSection === 'screensaver' && canManageCatalogues && <Link to="/admin/ad/new" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Add New</Link>}
                {subSection === 'tv' && canManageTvContent && <Link to="/admin/tv-content/new" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Add New</Link>}
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
                    {subSection === 'screensaver' && <AdminScreensaverAds />}
                    {subSection === 'tv' && (
                        <div className="space-y-8">
                            {Object.keys(groupedTvContent).length > 0 ? Object.entries(groupedTvContent).map(([brandName, contents]) => (
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
                                                        <button type="button" onClick={() => navigate(`/admin/tv-content/edit/${content.id}`)} className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Edit TV Content"><PencilIcon className="h-4 w-4" /></button>
                                                        <button type="button" onClick={() => handleDelete('tv', content.id, content.modelName)} className="p-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Delete TV Content"><TrashIcon className="h-4 w-4" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                                    <TvIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No TV Content Found</h3>
                                    {canManageTvContent && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first TV model content.</p>}
                                </div>
                            )}
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
                    <button onClick={() => navigate(`/admin/${type}/edit/${item.id}`)} className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={`Edit`}><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(type, item.id, item.title)} className="p-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={`Delete`}><TrashIcon className="h-4 w-4" /></button>
                </div>
            )}
        </div>
    );
};

const AdminQuotesView: React.FC = () => {
    const { quotes, clients, adminUsers, toggleQuoteStatus } = useAppContext();
    const navigate = useNavigate();

    const enrichedQuotes = React.useMemo(() => quotes.map(quote => {
        const client = clients.find(c => c.id === quote.clientId);
        const admin = adminUsers.find(a => a.id === quote.adminId);
        return { ...quote, client, admin };
    }).sort((a, b) => b.createdAt - a.createdAt), [quotes, clients, adminUsers]);
    
    const quotesByClient = React.useMemo(() => {
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
