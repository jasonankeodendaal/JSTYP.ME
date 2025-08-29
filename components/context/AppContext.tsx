/// <reference path="../../swiper.d.ts" />

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { 
    settings as initialSettings,
    brands as initialBrands,
    products as initialProducts,
    catalogues as initialCatalogues,
    pamphlets as initialPamphlets,
    screensaverAds as initialScreensaverAds,
    adminUsers as initialAdminUsers,
    tvContent as initialTvContent,
    categories as initialCategories,
    clients as initialClients,
    quotes as initialQuotes,
    viewCounts as initialViewCounts
} from '../../data/mockData.ts';
import type { Settings, Brand, Product, Catalogue, Pamphlet, ScreensaverAd, BackupData, AdminUser, ThemeColors, StorageProvider, ProductDocument, TvContent, Category, Client, Quote, ViewCounts } from '../../types.ts';
import { idbGet, idbSet } from './idb.ts';


// --- UTILITY FUNCTIONS ---
function isObject(item: any): item is object {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const output = { ...target };
    Object.keys(source).forEach((key) => {
        const sourceKey = key as keyof T;
        const targetValue = target[sourceKey];
        const sourceValue = source[sourceKey];

        if (isObject(targetValue) && isObject(sourceValue)) {
            (output[sourceKey] as any) = deepMerge(targetValue, sourceValue as any);
        } else if (sourceValue !== undefined) {
            (output[sourceKey] as any) = sourceValue;
        }
    });
    return output;
}

const loadFont = (fontName: string) => {
    if (!fontName) return;
    const fontId = `google-font-${fontName.replace(/\s+/g, '-')}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
      document.head.appendChild(link);
    }
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const verifyPermission = async (fileHandle: FileSystemDirectoryHandle, readWrite: boolean): Promise<boolean> => {
    const options: FileSystemHandlePermissionDescriptor = {};
    options.mode = readWrite ? 'readwrite' : 'read';
    try {
        if ((await fileHandle.queryPermission(options)) === 'granted') return true;
        if ((await fileHandle.requestPermission(options)) === 'granted') return true;
    } catch (error) { console.error("Error verifying permissions:", error); }
    return false;
};

// Helper to determine if a URL points to a file server or just a JSON file.
const isApiEndpoint = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
        const path = new URL(url).pathname;
        // Simple heuristic: if it doesn't end with .json, it's likely a base API endpoint.
        return !path.endsWith('.json');
    } catch {
        return false;
    }
};


// --- TYPE DEFINITIONS ---
interface ConfirmationState { isOpen: boolean; message: string; onConfirm: () => void; }
interface BookletModalState { isOpen: boolean; title: string; imageUrls: string[]; }
interface PdfModalState { isOpen: boolean; url: string; title: string; }
interface ClientDetailsModalState { isOpen: boolean; }
type DocumentType = ProductDocument | Catalogue | Pamphlet;
type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced' | 'error';

interface AppContextType {
  isSetupComplete: boolean;
  completeSetup: () => void;
  brands: Brand[];
  products: Product[];
  catalogues: Catalogue[];
  pamphlets: Pamphlet[];
  settings: Settings;
  screensaverAds: ScreensaverAd[];
  adminUsers: AdminUser[];
  loggedInUser: AdminUser | null;
  tvContent: TvContent[];
  categories: Category[];
  clients: Client[];
  quotes: Quote[];
  viewCounts: ViewCounts;
  login: (userId: string, pin: string) => AdminUser | null;
  logout: () => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (brandId: string) => void;
  restoreBrand: (brandId: string) => void;
  permanentlyDeleteBrand: (brandId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  restoreProduct: (productId: string) => void;
  permanentlyDeleteProduct: (productId: string) => void;
  addCatalogue: (catalogue: Catalogue) => void;
  updateCatalogue: (catalogue: Catalogue) => void;
  deleteCatalogue: (catalogueId: string) => void;
  restoreCatalogue: (catalogueId: string) => void;
  permanentlyDeleteCatalogue: (catalogueId: string) => void;
  addPamphlet: (pamphlet: Pamphlet) => void;
  updatePamphlet: (pamphlet: Pamphlet) => void;
  deletePamphlet: (pamphletId: string) => void;
  restorePamphlet: (pamphletId: string) => void;
  permanentlyDeletePamphlet: (pamphletId: string) => void;
  addAd: (ad: ScreensaverAd) => void;
  updateAd: (ad: ScreensaverAd) => void;
  deleteAd: (adId: string) => void;
  addAdminUser: (user: AdminUser) => void;
  updateAdminUser: (user: AdminUser) => void;
  deleteAdminUser: (userId: string) => void;
  addTvContent: (content: TvContent) => void;
  updateTvContent: (content: TvContent) => void;
  deleteTvContent: (contentId: string) => void;
  restoreTvContent: (contentId: string) => void;
  permanentlyDeleteTvContent: (contentId: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  restoreCategory: (categoryId: string) => void;
  permanentlyDeleteCategory: (categoryId: string) => void;
  addClient: (client: Client) => string;
  addQuote: (quote: Quote) => void;
  updateQuote: (quote: Quote) => void;
  toggleQuoteStatus: (quoteId: string) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  restoreBackup: (data: Partial<BackupData>) => void;
  isScreensaverActive: boolean;
  isScreensaverEnabled: boolean;
  exitScreensaver: () => void;
  toggleScreensaver: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  triggerInstallPrompt: () => void;
  confirmation: ConfirmationState;
  showConfirmation: (message: string, onConfirm: () => void) => void;
  hideConfirmation: () => void;
  bookletModalState: BookletModalState;
  closeBookletModal: () => void;
  pdfModalState: PdfModalState;
  closePdfModal: () => void;
  clientDetailsModal: ClientDetailsModalState;
  openClientDetailsModal: () => void;
  closeClientDetailsModal: () => void;
  openDocument: (doc: DocumentType, title: string) => void;
  activeTvContent: TvContent | null;
  playTvContent: (content: TvContent) => void;
  stopTvContent: () => void;
  storageProvider: StorageProvider;
  isStorageConnected: boolean;
  directoryHandle: FileSystemDirectoryHandle | null;
  connectToLocalProvider: () => Promise<void>;
  connectToCloudProvider: (provider: 'customApi' | 'googleDrive') => void;
  connectToSharedUrl: (url: string) => void;
  disconnectFromStorage: () => void;
  saveFileToStorage: (file: File) => Promise<string>;
  getFileUrl: (fileName: string) => Promise<string>;
  syncStatus: SyncStatus;
  saveDatabaseToLocal: () => Promise<boolean>;
  loadDatabaseFromLocal: () => Promise<boolean>;
  pushToCloud: () => Promise<boolean>;
  pullFromCloud: () => Promise<boolean>;
  trackBrandView: (brandId: string) => void;
  trackProductView: (productId: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  localVolume: number;
  setLocalVolume: (volume: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- STATE MANAGEMENT ---
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [brands, setBrands] = useState<Brand[]>(initialBrands);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [catalogues, setCatalogues] = useState<Catalogue[]>(initialCatalogues);
    const [pamphlets, setPamphlets] = useState<Pamphlet[]>(initialPamphlets);
    const [screensaverAds, setScreensaverAds] = useState<ScreensaverAd[]>(initialScreensaverAds);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
    const [tvContent, setTvContent] = useState<TvContent[]>(initialTvContent);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
    const [viewCounts, setViewCounts] = useState<ViewCounts>(initialViewCounts);

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(() => {
        const savedUser = sessionStorage.getItem('kiosk-user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isSetupComplete, setIsSetupComplete] = useState<boolean>(() => {
        return localStorage.getItem('kioskSetupComplete') === 'true';
    });
    
    // Screensaver state
    const [isScreensaverActive, setIsScreensaverActive] = useState(false);
    const [isScreensaverEnabled, setIsScreensaverEnabled] = useState(true);
    const screensaverTimer = useRef<number | null>(null);

    // Modals state
    const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, message: '', onConfirm: () => {} });
    const [bookletModalState, setBookletModalState] = useState<BookletModalState>({ isOpen: false, title: '', imageUrls: [] });
    const [pdfModalState, setPdfModalState] = useState<PdfModalState>({ isOpen: false, url: '', title: '' });
    const [clientDetailsModal, setClientDetailsModal] = useState<ClientDetailsModalState>({ isOpen: false });

    // TV Player state
    const [activeTvContent, setActiveTvContent] = useState<TvContent | null>(null);

    // Storage and Sync state
    const [storageProvider, setStorageProvider] = useState<StorageProvider>('none');
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

    // PWA Install Prompt state
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    // Theme & Volume state
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const storedTheme = localStorage.getItem('kioskTheme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
        return 'dark'; // Default theme
    });
    const [localVolume, setLocalVolume] = useState(settings.videoVolume);
    const [kioskId, setKioskId] = useState('');

    // FIX: Hoist updateSettings to be a useCallback function within the component's scope.
    // This makes it accessible to other functions being defined in the context value object.
    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => deepMerge(prev, newSettings));
    }, []);

    // --- GENERIC CRUD ---
    const createCrudOperations = <T extends { id: string }>(
        state: T[],
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        itemName: string
    ) => ({
        add: (item: T) => setter(prev => [...prev, item]),
        update: (updatedItem: T) => setter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item)),
        softDelete: (id: string) => setter(prev => prev.map(item => item.id === id ? { ...item, isDeleted: true } : item)),
        restore: (id: string) => setter(prev => prev.map(item => item.id === id ? { ...item, isDeleted: false } : item)),
        hardDelete: (id: string) => setter(prev => prev.filter(item => item.id !== id)),
    });

    const brandOps = createCrudOperations(brands, setBrands, 'brand');
    const productOps = createCrudOperations(products, setProducts, 'product');
    const catalogueOps = createCrudOperations(catalogues, setCatalogues, 'catalogue');
    const pamphletOps = createCrudOperations(pamphlets, setPamphlets, 'pamphlet');
    const adOps = createCrudOperations(screensaverAds, setScreensaverAds, 'ad');
    const userOps = createCrudOperations(adminUsers, setAdminUsers, 'user');
    const tvOps = createCrudOperations(tvContent, setTvContent, 'tvContent');
    const categoryOps = createCrudOperations(categories, setCategories, 'category');
    const clientOps = createCrudOperations(clients, setClients, 'client');
    const quoteOps = createCrudOperations(quotes, setQuotes, 'quote');
    
    // --- AUTH ---
    const login = (userId: string, pin: string) => {
        const user = adminUsers.find(u => u.id === userId && u.pin === pin);
        if (user) {
            setLoggedInUser(user);
            sessionStorage.setItem('kiosk-user', JSON.stringify(user));
            return user;
        }
        return null;
    };
    const logout = () => {
        setLoggedInUser(null);
        sessionStorage.removeItem('kiosk-user');
    };

    // --- MODALS ---
    const showConfirmation = (message: string, onConfirm: () => void) => setConfirmation({ isOpen: true, message, onConfirm });
    const hideConfirmation = () => setConfirmation({ isOpen: false, message: '', onConfirm: () => {} });
    const openDocument = (doc: DocumentType, title: string) => {
        if (doc.type === 'image') setBookletModalState({ isOpen: true, title, imageUrls: doc.imageUrls });
        if (doc.type === 'pdf') setPdfModalState({ isOpen: true, url: doc.url, title });
    };
    const closeBookletModal = () => setBookletModalState({ isOpen: false, title: '', imageUrls: [] });
    const closePdfModal = () => setPdfModalState({ isOpen: false, url: '', title: '' });
    const openClientDetailsModal = () => setClientDetailsModal({ isOpen: true });
    const closeClientDetailsModal = () => setClientDetailsModal({ isOpen: false });

    // --- TV PLAYER ---
    const playTvContent = (content: TvContent) => setActiveTvContent(content);
    const stopTvContent = () => setActiveTvContent(null);

    // --- SCREENSAVER ---
    const exitScreensaver = useCallback(() => setIsScreensaverActive(false), []);
    const toggleScreensaver = () => setIsScreensaverEnabled(prev => !prev);
    
    // Reset timer on activity
    const resetScreensaverTimer = useCallback(() => {
        if (screensaverTimer.current) clearTimeout(screensaverTimer.current);
        if (settings.screensaverDelay > 0 && isScreensaverEnabled) {
            screensaverTimer.current = window.setTimeout(() => {
                setIsScreensaverActive(true);
            }, settings.screensaverDelay * 1000);
        }
    }, [settings.screensaverDelay, isScreensaverEnabled]);

    // Apply settings and load data on mount
    useEffect(() => {
        const loadData = async () => {
            interface DataMapValue {
                setter: (value: any) => void;
                initial: any;
                merge?: boolean;
            }
            const dataMap: Record<string, DataMapValue> = {
                settings: { setter: setSettings, initial: initialSettings, merge: true },
                brands: { setter: setBrands, initial: initialBrands },
                products: { setter: setProducts, initial: initialProducts },
                catalogues: { setter: setCatalogues, initial: initialCatalogues },
                pamphlets: { setter: setPamphlets, initial: initialPamphlets },
                screensaverAds: { setter: setScreensaverAds, initial: initialScreensaverAds },
                adminUsers: { setter: setAdminUsers, initial: initialAdminUsers },
                tvContent: { setter: setTvContent, initial: initialTvContent },
                categories: { setter: setCategories, initial: initialCategories },
                clients: { setter: setClients, initial: initialClients },
                quotes: { setter: setQuotes, initial: initialQuotes },
                viewCounts: { setter: setViewCounts, initial: initialViewCounts },
                storageProvider: { setter: setStorageProvider, initial: 'none' },
                directoryHandle: { setter: setDirectoryHandle, initial: null },
            };

            for (const [key, config] of Object.entries(dataMap)) {
                const storedValue = await idbGet(key);
                if (storedValue) {
                    if (config.merge && isObject(config.initial) && isObject(storedValue)) {
                        config.setter(deepMerge(config.initial, storedValue));
                    } else {
                        config.setter(storedValue);
                    }
                }
            }
            
            const storedTheme = await idbGet<'light' | 'dark'>('kioskTheme');
            if (storedTheme) {
                setTheme(storedTheme);
            }

            let kid = await idbGet<string>('kioskId');
            if (!kid) {
                kid = `kiosk_${Math.random().toString(16).slice(2)}`;
                await idbSet('kioskId', kid);
            }
            setKioskId(kid);

            setIsDataLoaded(true);
        };
        loadData();
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('kioskTheme', theme);
        idbSet('kioskTheme', theme);
    }, [theme]);


    const contextValue: AppContextType = {
        isSetupComplete,
        completeSetup: () => {
            setIsSetupComplete(true);
            localStorage.setItem('kioskSetupComplete', 'true');
        },
        settings,
        brands,
        products,
        catalogues,
        pamphlets,
        screensaverAds,
        adminUsers,
        loggedInUser,
        tvContent,
        categories,
        clients,
        quotes,
        viewCounts,
        login,
        logout,

        // CRUD functions
        addBrand: brandOps.add,
        updateBrand: brandOps.update,
        deleteBrand: brandOps.softDelete,
        restoreBrand: brandOps.restore,
        permanentlyDeleteBrand: brandOps.hardDelete,

        addProduct: productOps.add,
        updateProduct: productOps.update,
        deleteProduct: productOps.softDelete,
        restoreProduct: productOps.restore,
        permanentlyDeleteProduct: productOps.hardDelete,

        addCatalogue: catalogueOps.add,
        updateCatalogue: catalogueOps.update,
        deleteCatalogue: catalogueOps.softDelete,
        restoreCatalogue: catalogueOps.restore,
        permanentlyDeleteCatalogue: catalogueOps.hardDelete,
        
        addPamphlet: pamphletOps.add,
        updatePamphlet: pamphletOps.update,
        deletePamphlet: pamphletOps.softDelete,
        restorePamphlet: pamphletOps.restore,
        permanentlyDeletePamphlet: pamphletOps.hardDelete,

        addAd: adOps.add,
        updateAd: adOps.update,
        deleteAd: adOps.hardDelete,

        addAdminUser: userOps.add,
        updateAdminUser: userOps.update,
        deleteAdminUser: userOps.hardDelete,
        
        addTvContent: tvOps.add,
        updateTvContent: tvOps.update,
        deleteTvContent: tvOps.softDelete,
        restoreTvContent: tvOps.restore,
        permanentlyDeleteTvContent: tvOps.hardDelete,

        addCategory: categoryOps.add,
        updateCategory: categoryOps.update,
        deleteCategory: categoryOps.softDelete,
        restoreCategory: categoryOps.restore,
        permanentlyDeleteCategory: categoryOps.hardDelete,
        
        addClient: (client: Client) => { clientOps.add(client); return client.id; },
        addQuote: quoteOps.add,
        updateQuote: quoteOps.update,
        toggleQuoteStatus: (quoteId: string) => {
            setQuotes(prev => prev.map(q => q.id === quoteId ? {...q, status: q.status === 'pending' ? 'quoted' : 'pending'} : q));
        },

        updateSettings,
        restoreBackup: (data: Partial<BackupData>) => {
            if (data.settings) setSettings(deepMerge(initialSettings, data.settings));
            if (data.brands) setBrands(data.brands);
            if (data.products) setProducts(data.products);
            if (data.catalogues) setCatalogues(data.catalogues);
            if (data.pamphlets) setPamphlets(data.pamphlets);
            if (data.screensaverAds) setScreensaverAds(data.screensaverAds);
            if (data.adminUsers) setAdminUsers(data.adminUsers);
            if (data.tvContent) setTvContent(data.tvContent);
            if (data.categories) setCategories(data.categories);
            if (data.clients) setClients(data.clients);
            if (data.quotes) setQuotes(data.quotes);
            if (data.viewCounts) setViewCounts(data.viewCounts);
        },

        isScreensaverActive,
        isScreensaverEnabled,
        exitScreensaver,
        toggleScreensaver,

        deferredPrompt,
        triggerInstallPrompt: () => deferredPrompt?.prompt(),
        
        confirmation,
        showConfirmation,
        hideConfirmation,

        bookletModalState,
        closeBookletModal,

        pdfModalState,
        closePdfModal,

        clientDetailsModal,
        openClientDetailsModal,
        closeClientDetailsModal,

        openDocument,

        activeTvContent,
        playTvContent,
        stopTvContent,

        storageProvider,
        isStorageConnected: storageProvider !== 'none',
        directoryHandle,
        connectToLocalProvider: async () => {},
        connectToCloudProvider: (provider: 'customApi' | 'googleDrive') => {
            if (provider === 'customApi') {
                if (!settings.customApiUrl) {
                    alert("Please set the Custom API URL in 'Sync & API Settings' before connecting.");
                    const settingsSection = document.getElementById('api-settings-section');
                    if (settingsSection) {
                        settingsSection.setAttribute('open', '');
                        settingsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }
            }
            setStorageProvider(provider);
            idbSet('storageProvider', provider);
        },
        connectToSharedUrl: (url: string) => {
            if (!url) {
                alert("Please enter a URL to connect.");
                return;
            }
            updateSettings({ sharedUrl: url });
            setStorageProvider('sharedUrl');
            idbSet('storageProvider', 'sharedUrl');
        },
        disconnectFromStorage: () => {
            showConfirmation(
                "Are you sure you want to disconnect? Auto-sync will be disabled.",
                () => {
                    setStorageProvider('none');
                    idbSet('storageProvider', 'none');
                    if (directoryHandle) {
                        setDirectoryHandle(null);
                        idbSet('directoryHandle', null);
                    }
                }
            );
        },
        saveFileToStorage: async (file: File) => {
            try {
                const isCustomApi = storageProvider === 'customApi';
                const isSharedUrlApi = storageProvider === 'sharedUrl' && isApiEndpoint(settings.sharedUrl);
    
                if (isCustomApi || isSharedUrlApi) {
                    const url = isCustomApi ? settings.customApiUrl : settings.sharedUrl;
                    if (!url) throw new Error("API URL is not configured for upload.");
                    
                    const uploadUrl = new URL(url);
                    uploadUrl.pathname = '/upload';
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await fetch(uploadUrl.toString(), {
                        method: 'POST',
                        headers: { 'x-api-key': settings.customApiKey },
                        body: formData,
                    });
                    if (!response.ok) throw new Error(`Upload failed: ${await response.text()}`);
                    const result = await response.json();
                    return result.filename;
                }
                return await fileToBase64(file);
            } catch (error) {
                console.error("Error saving file to storage:", error);
                throw error;
            }
        },
        getFileUrl: async (fileName: string) => {
            if (!fileName || fileName.startsWith('http') || fileName.startsWith('data:')) {
                return fileName || '';
            }
        
            const isCustomApi = storageProvider === 'customApi';
            const isSharedUrlApi = storageProvider === 'sharedUrl' && isApiEndpoint(settings.sharedUrl);
        
            if (isCustomApi || isSharedUrlApi) {
                try {
                    const baseUrlString = isCustomApi ? settings.customApiUrl : settings.sharedUrl;
                    if (!baseUrlString) return fileName;
        
                    const baseUrl = new URL(baseUrlString);
                    const fileUrl = new URL(`/files/${fileName}`, baseUrl.origin);
                    
                    return fileUrl.toString();
                } catch (error) {
                    console.error("Error constructing file URL:", error);
                    return fileName;
                }
            }
            
            return fileName;
        },

        syncStatus,
        saveDatabaseToLocal: async () => false,
        loadDatabaseFromLocal: async () => false,
        pushToCloud: async () => false,
        pullFromCloud: async () => false,

        trackBrandView: () => {},
        trackProductView: () => {},

        theme,
        toggleTheme: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
        localVolume,
        setLocalVolume: (vol: number) => {
            setLocalVolume(vol);
            idbSet('localVolume', vol);
        },
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
