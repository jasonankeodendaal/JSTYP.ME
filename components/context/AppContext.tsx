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
import type { Settings, Brand, Product, Catalogue, Pamphlet, ScreensaverAd, BackupData, AdminUser, StorageProvider, ProductDocument, TvContent, Category, Client, Quote, ViewCounts } from '../../types.ts';
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
interface QuoteStartModalState { isOpen: boolean; }
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
  startScreensaver: () => void;
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
  quoteStartModal: QuoteStartModalState;
  openQuoteStartModal: () => void;
  closeQuoteStartModal: () => void;
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
  testAndConnectProvider: () => Promise<{ success: boolean; message: string; }>;
  trackBrandView: (brandId: string) => void;
  trackProductView: (productId: string) => void;
  lastUpdated?: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  localVolume: number;
  setLocalVolume: (volume: number) => void;
  kioskId: string;
  // FIX: Add setKioskId to the context type to allow main admin to change it.
  setKioskId: (newId: string) => void;
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

    // Modals state
    const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, message: '', onConfirm: () => {} });
    const [bookletModalState, setBookletModalState] = useState<BookletModalState>({ isOpen: false, title: '', imageUrls: [] });
    const [pdfModalState, setPdfModalState] = useState<PdfModalState>({ isOpen: false, url: '', title: '' });
    const [quoteStartModal, setQuoteStartModal] = useState<QuoteStartModalState>({ isOpen: false });

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

    // FIX: Add state setter for kioskId.
    const [kioskId, setKioskIdState] = useState<string>(() => {
        let id = localStorage.getItem('kioskId');
        if (!id) {
            id = `kiosk_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            localStorage.setItem('kioskId', id);
        }
        return id;
    });

    // FIX: Create a function to safely update kioskId state and localStorage.
    const setKioskId = (newId: string) => {
        const trimmedId = newId.trim();
        if (trimmedId) {
            setKioskIdState(trimmedId);
            localStorage.setItem('kioskId', trimmedId);
        }
    };

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => deepMerge(prev, newSettings));
    }, []);

    const restoreBackup = useCallback((data: Partial<BackupData>) => {
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
    }, []);
    
    // --- GENERIC CRUD ---
    const createCrudOperations = <T extends { id: string }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => ({
        add: (item: T) => setter(prev => [...prev, item]),
        update: (updatedItem: T) => setter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item)),
        softDelete: (id: string) => setter(prev => prev.map(item => item.id === id ? { ...item, isDeleted: true } : item)),
        restore: (id: string) => setter(prev => prev.map(item => item.id === id ? { ...item, isDeleted: false } : item)),
        hardDelete: (id: string) => setter(prev => prev.filter(item => item.id !== id)),
    });

    const brandOps = createCrudOperations(setBrands);
    const productOps = createCrudOperations(setProducts);
    const catalogueOps = createCrudOperations(setCatalogues);
    const pamphletOps = createCrudOperations(setPamphlets);
    const adOps = createCrudOperations(setScreensaverAds);
    const userOps = createCrudOperations(setAdminUsers);
    const tvOps = createCrudOperations(setTvContent);
    const categoryOps = createCrudOperations(setCategories);
    const clientOps = createCrudOperations(setClients);
    const quoteOps = createCrudOperations(setQuotes);
    
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
    const openQuoteStartModal = () => setQuoteStartModal({ isOpen: true });
    const closeQuoteStartModal = () => setQuoteStartModal({ isOpen: false });

    // --- TV PLAYER ---
    const playTvContent = (content: TvContent) => setActiveTvContent(content);
    const stopTvContent = () => setActiveTvContent(null);

    // --- SCREENSAVER ---
    const startScreensaver = () => setIsScreensaverActive(true);
    const exitScreensaver = useCallback(() => setIsScreensaverActive(false), []);
    const toggleScreensaver = () => setIsScreensaverEnabled(prev => !prev);
    
    // --- SYNC & STORAGE ---

    const saveDatabaseToLocal = useCallback(async (): Promise<boolean> => {
        if (!directoryHandle) return false;
        try {
            setSyncStatus('syncing');
            const fileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
            const writable = await fileHandle.createWritable();
            const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts };
            await writable.write(JSON.stringify(backupData, null, 2));
            await writable.close();
            updateSettings({ lastUpdated: Date.now() });
            setSyncStatus('synced');
            return true;
        } catch (error) {
            console.error("Failed to save database to local folder:", error);
            setSyncStatus('error');
            return false;
        }
    }, [directoryHandle, brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, updateSettings]);

    const loadDatabaseFromLocal = useCallback(async (): Promise<boolean> => {
        if (!directoryHandle) return false;
        try {
            setSyncStatus('syncing');
            const fileHandle = await directoryHandle.getFileHandle('database.json');
            const file = await fileHandle.getFile();
            const text = await file.text();
            const data: BackupData = JSON.parse(text);
            restoreBackup(data);
            setSyncStatus('synced');
            return true;
        } catch (error) {
            console.error("Failed to load database from local folder:", error);
            setSyncStatus('error');
            return false;
        }
    }, [directoryHandle, restoreBackup]);
    
    const pushToCloud = useCallback(async (): Promise<boolean> => {
        const url = settings.customApiUrl;
        if (storageProvider !== 'customApi' || !url) return false;
        try {
            setSyncStatus('syncing');
            const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts };
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.customApiKey,
                },
                body: JSON.stringify(backupData),
            });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            updateSettings({ lastUpdated: Date.now() });
            setSyncStatus('synced');
            return true;
        } catch (error) {
            console.error("Failed to push to cloud:", error);
            setSyncStatus('error');
            return false;
        }
    }, [storageProvider, settings, brands, products, catalogues, pamphlets, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, updateSettings]);

    const pullFromCloud = useCallback(async (): Promise<boolean> => {
        const isCustomApi = storageProvider === 'customApi' && settings.customApiUrl;
        const isSharedUrl = storageProvider === 'sharedUrl' && settings.sharedUrl;
        if (!isCustomApi && !isSharedUrl) return false;
        
        const url = isCustomApi ? settings.customApiUrl : settings.sharedUrl!;

        try {
            setSyncStatus('syncing');
            const response = await fetch(url, {
                headers: isCustomApi ? { 'x-api-key': settings.customApiKey } : {},
            });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const data: BackupData = await response.json();
            restoreBackup(data);
            setSyncStatus('synced');
            return true;
        } catch (error) {
            console.error("Failed to pull from cloud:", error);
            setSyncStatus('error');
            return false;
        }
    }, [storageProvider, settings, restoreBackup]);
    
    const connectToLocalProvider = useCallback(async () => {
        try {
            if (!('showDirectoryPicker' in window)) {
                alert("Your browser does not support the File System Access API. Please try a different browser like Chrome or Edge.");
                return;
            }
            const handle = await window.showDirectoryPicker();
            if (await verifyPermission(handle, true)) {
                setDirectoryHandle(handle);
                await idbSet('directoryHandle', handle);
                setStorageProvider('local');
                await idbSet('storageProvider', 'local');
            } else {
                alert("Permission to read/write to the folder was not granted.");
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                 console.log("User cancelled the directory picker.");
            } else {
                console.error("Error connecting to local provider:", error);
            }
        }
    }, []);

    const connectToCloudProvider = useCallback((provider: 'customApi' | 'googleDrive') => {
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
    }, [settings.customApiUrl]);

    const connectToSharedUrl = useCallback((url: string) => {
        if (!url) {
            alert("Please enter a URL to connect.");
            return;
        }
        updateSettings({ sharedUrl: url });
        setStorageProvider('sharedUrl');
        idbSet('storageProvider', 'sharedUrl');
    }, [updateSettings]);

    const testAndConnectProvider = async (): Promise<{ success: boolean; message: string; }> => {
        if (settings.customApiUrl) {
            try {
                const baseUrl = new URL(settings.customApiUrl);
                const statusUrl = new URL('/status', baseUrl.origin);
    
                const response = await fetch(statusUrl.toString());
                if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
                
                const data = await response.json();
                if (data.status !== 'ok') throw new Error('Invalid server status response.');
                
                connectToCloudProvider('customApi');
                return { success: true, message: 'Successfully connected to Custom API.' };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return { success: false, message: `Failed to connect to Custom API: ${errorMessage}. Please check settings.` };
            }
        }
        
        if (settings.sharedUrl) {
            try {
                let testUrl = settings.sharedUrl;
                if (isApiEndpoint(settings.sharedUrl)) {
                    const baseUrl = new URL(settings.sharedUrl);
                    testUrl = new URL('/status', baseUrl.origin).toString();
                }
                
                const response = await fetch(testUrl);
                if (!response.ok) throw new Error(`URL responded with status ${response.status}`);
                 
                connectToSharedUrl(settings.sharedUrl);
                return { success: true, message: 'Successfully connected to Shared URL.' };
    
            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return { success: false, message: `Failed to connect to Shared URL: ${errorMessage}. Please check settings.` };
            }
        }
    
        return { success: false, message: 'No sync provider is configured in Settings.' };
    };

    const saveFileToStorage = useCallback(async (file: File): Promise<string> => {
        if (storageProvider === 'local' && directoryHandle) {
            try {
                const assetsDir = await directoryHandle.getDirectoryHandle('assets', { create: true });
                const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const fileName = `${Date.now()}-${safeName}`;
                const fileHandle = await assetsDir.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(file);
                await writable.close();
                return fileName;
            } catch (error) {
                console.error('Error saving file to local directory:', error);
                throw new Error('Failed to save file to local directory.');
            }
        }
        
        const isCustomApi = storageProvider === 'customApi';
        const isSharedUrlApi = storageProvider === 'sharedUrl' && isApiEndpoint(settings.sharedUrl);

        if (isCustomApi || isSharedUrlApi) {
            const url = isCustomApi ? settings.customApiUrl : settings.sharedUrl;
            if (!url) throw new Error("API URL is not configured for upload.");
            
            const uploadUrl = new URL(url);
            uploadUrl.pathname = uploadUrl.pathname.replace(/\/data$/, '/upload');
            
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
        
        return fileToBase64(file);
    }, [storageProvider, directoryHandle, settings]);

    const getFileUrl = useCallback(async (fileName: string): Promise<string> => {
        if (!fileName || fileName.startsWith('http') || fileName.startsWith('data:')) {
            return fileName || '';
        }
        
        if (storageProvider === 'local' && directoryHandle) {
            try {
                const assetsDir = await directoryHandle.getDirectoryHandle('assets');
                const fileHandle = await assetsDir.getFileHandle(fileName);
                const file = await fileHandle.getFile();
                return URL.createObjectURL(file);
            } catch (error) {
                console.error(`Could not get file "${fileName}" from local storage:`, error);
                return '';
            }
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
    }, [storageProvider, directoryHandle, settings]);
    
    // --- APP LIFECYCLE & AUTO-SYNC ---

    // FIX: Implement analytics tracking functions
    const trackBrandView = useCallback((brandId: string) => {
        setViewCounts(prev => {
            const newCounts = JSON.parse(JSON.stringify(prev));
            if (!newCounts[kioskId]) {
                newCounts[kioskId] = { brands: {}, products: {} };
            }
            if (!newCounts[kioskId].brands) {
                newCounts[kioskId].brands = {};
            }
            newCounts[kioskId].brands[brandId] = (newCounts[kioskId].brands[brandId] || 0) + 1;
            return newCounts;
        });
    }, [kioskId]);

    const trackProductView = useCallback((productId: string) => {
        setViewCounts(prev => {
            const newCounts = JSON.parse(JSON.stringify(prev));
            if (!newCounts[kioskId]) {
                newCounts[kioskId] = { brands: {}, products: {} };
            }
            if (!newCounts[kioskId].products) {
                newCounts[kioskId].products = {};
            }
            newCounts[kioskId].products[productId] = (newCounts[kioskId].products[productId] || 0) + 1;
            return newCounts;
        });
    }, [kioskId]);

    useEffect(() => {
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    useEffect(() => {
        const loadAndConnect = async () => {
             interface DataMapValue { setter: (value: any) => void; initial: any; merge?: boolean; }
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

            const provider = await idbGet<StorageProvider>('storageProvider');
            if (provider === 'local') {
                const handle = await idbGet<FileSystemDirectoryHandle>('directoryHandle');
                if (handle) {
                    if (await verifyPermission(handle, true)) {
                        setDirectoryHandle(handle);
                        setStorageProvider('local');
                    } else {
                        console.warn("Permission for local directory was lost. Please reconnect.");
                        await idbSet('storageProvider', 'none');
                        await idbSet('directoryHandle', null);
                    }
                }
            } else if (provider === 'customApi' || provider === 'sharedUrl') {
                const loadedSettings = await idbGet<Settings>('settings');
                const isAutoSyncEnabled = loadedSettings?.sync?.autoSyncEnabled ?? settings.sync.autoSyncEnabled;
                setStorageProvider(provider);
                if (isAutoSyncEnabled) {
                    console.log("Auto-pull triggered on load.");
                    pullFromCloud();
                }
            }
            setIsDataLoaded(true);
        };
        loadAndConnect();
    }, [pullFromCloud, settings.sync.autoSyncEnabled]);

    const dataToWatch = [brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts];
    const stringifiedData = JSON.stringify(dataToWatch);
    const debounceTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isDataLoaded) return;
        setSyncStatus(prev => (prev === 'synced' || prev === 'idle') ? 'pending' : prev);
    }, [stringifiedData, isDataLoaded]);

    useEffect(() => {
        if (!isDataLoaded || syncStatus !== 'pending' || !settings.sync.autoSyncEnabled || storageProvider === 'none') return;

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = window.setTimeout(() => {
            console.log("Auto-sync triggered.");
            if (storageProvider === 'local') saveDatabaseToLocal();
            else if (storageProvider === 'customApi') pushToCloud();
        }, 2000);

        return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
    }, [syncStatus, settings.sync.autoSyncEnabled, storageProvider, isDataLoaded, saveDatabaseToLocal, pushToCloud]);

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
        settings, brands, products, catalogues, pamphlets, screensaverAds, adminUsers, loggedInUser, tvContent, categories, clients, quotes, viewCounts,
        login, logout,
        addBrand: brandOps.add, updateBrand: brandOps.update, deleteBrand: brandOps.softDelete, restoreBrand: brandOps.restore, permanentlyDeleteBrand: brandOps.hardDelete,
        addProduct: productOps.add, updateProduct: productOps.update, deleteProduct: productOps.softDelete, restoreProduct: productOps.restore, permanentlyDeleteProduct: productOps.hardDelete,
        addCatalogue: catalogueOps.add, updateCatalogue: catalogueOps.update, deleteCatalogue: catalogueOps.softDelete, restoreCatalogue: catalogueOps.restore, permanentlyDeleteCatalogue: catalogueOps.hardDelete,
        addPamphlet: pamphletOps.add, updatePamphlet: pamphletOps.update, deletePamphlet: pamphletOps.softDelete, restorePamphlet: pamphletOps.restore, permanentlyDeletePamphlet: pamphletOps.hardDelete,
        addAd: adOps.add, updateAd: adOps.update, deleteAd: adOps.hardDelete,
        addAdminUser: userOps.add, updateAdminUser: userOps.update, deleteAdminUser: userOps.hardDelete,
        addTvContent: tvOps.add, updateTvContent: tvOps.update, deleteTvContent: tvOps.softDelete, restoreTvContent: tvOps.restore, permanentlyDeleteTvContent: tvOps.hardDelete,
        addCategory: categoryOps.add, updateCategory: categoryOps.update, deleteCategory: categoryOps.softDelete, restoreCategory: categoryOps.restore, permanentlyDeleteCategory: categoryOps.hardDelete,
        addClient: (client: Client) => { clientOps.add(client); return client.id; },
        addQuote: quoteOps.add, updateQuote: quoteOps.update,
        toggleQuoteStatus: (quoteId: string) => setQuotes(prev => prev.map(q => q.id === quoteId ? {...q, status: q.status === 'pending' ? 'quoted' : 'pending'} : q)),
        updateSettings, restoreBackup,
        isScreensaverActive, isScreensaverEnabled, startScreensaver, exitScreensaver, toggleScreensaver,
        deferredPrompt, triggerInstallPrompt: () => deferredPrompt?.prompt(),
        confirmation, showConfirmation, hideConfirmation,
        bookletModalState, closeBookletModal,
        pdfModalState, closePdfModal,
        quoteStartModal, openQuoteStartModal, closeQuoteStartModal,
        openDocument,
        activeTvContent, playTvContent, stopTvContent,
        storageProvider, isStorageConnected: storageProvider !== 'none', directoryHandle,
        connectToLocalProvider, connectToCloudProvider, connectToSharedUrl,
        disconnectFromStorage: () => {
            showConfirmation(
                "Are you sure you want to disconnect? Auto-sync will be disabled.",
                () => {
                    setStorageProvider('none'); idbSet('storageProvider', 'none');
                    if (directoryHandle) { setDirectoryHandle(null); idbSet('directoryHandle', null); }
                }
            );
        },
        saveFileToStorage, getFileUrl, syncStatus,
        saveDatabaseToLocal, loadDatabaseFromLocal, pushToCloud, pullFromCloud,
        testAndConnectProvider,
        trackBrandView, trackProductView,
        lastUpdated: settings.lastUpdated,
        theme, toggleTheme: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
        localVolume, setLocalVolume: (vol: number) => { setLocalVolume(vol); idbSet('localVolume', vol); },
        kioskId,
        setKioskId,
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};