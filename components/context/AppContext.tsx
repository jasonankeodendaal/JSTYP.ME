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
    viewCounts as initialViewCounts,
    // FIX: Import initial activity logs data.
    activityLogs as initialActivityLogs
} from '../../data/mockData.ts';
// FIX: Import ActivityLog type.
// FIX: Add KioskSession and RemoteCommand types for remote control feature.
import type { Settings, Brand, Product, Catalogue, Pamphlet, ScreensaverAd, BackupData, AdminUser, StorageProvider, ProductDocument, TvContent, Category, Client, Quote, ViewCounts, ActivityLog, KioskSession, RemoteCommand } from '../../types.ts';
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
  // FIX: Add activityLogs to context type.
  activityLogs: ActivityLog[];
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
  // FIX: Add missing client management functions to the context type.
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  restoreClient: (clientId: string) => void;
  permanentlyDeleteClient: (clientId: string) => void;
  addQuote: (quote: Quote) => void;
  updateQuote: (quote: Quote) => void;
  toggleQuoteStatus: (quoteId: string) => void;
  deleteQuote: (quoteId: string) => void;
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
  // FIX: Add kioskSessions and sendRemoteCommand for the remote control feature.
  kioskSessions: KioskSession[];
  sendRemoteCommand: (kioskId: string, command: RemoteCommand) => void;
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
    // FIX: Add activityLogs state.
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
    // FIX: Add state for remote control sessions.
    const [kioskSessions, setKioskSessions] = useState<KioskSession[]>([]);

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(() => {
        const savedUser = localStorage.getItem('kiosk-user');
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
    const isSyncingRef = useRef(false);

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
    
    // --- ACTIVITY LOG ---
    const addActivityLog = useCallback((
        logData: Omit<ActivityLog, 'id' | 'timestamp' | 'userId' | 'kioskId'>,
        userOverride: AdminUser | null = null
    ) => {
        const userForLog = userOverride || loggedInUser;
        const newLog: ActivityLog = {
            id: `log_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            timestamp: Date.now(),
            userId: userForLog ? userForLog.id : 'kiosk_user',
            kioskId: kioskId,
            ...logData,
        };
        setActivityLogs(prev => [newLog, ...prev]);
    }, [loggedInUser, kioskId]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => deepMerge(prev, newSettings));
        addActivityLog({ actionType: 'UPDATE', entityType: 'Settings', details: 'Updated system settings.' });
    }, [addActivityLog]);

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
        // FIX: Restore activity logs from backup.
        if (data.activityLogs) setActivityLogs(data.activityLogs);
        addActivityLog({ actionType: 'RESTORE', entityType: 'System', details: 'Restored data from a backup file.' });
    }, [addActivityLog]);
    
    // --- GENERIC CRUD ---
    const createCrudOperations = <T extends { id: string, name?: string, title?: string, companyName?: string, modelName?: string }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        entityType: ActivityLog['entityType']
    ) => ({
        add: (item: T) => {
            setter(prev => [...prev, item]);
            const name = item.name || item.title || item.companyName || item.modelName || 'N/A';
            addActivityLog({ actionType: 'CREATE', entityType, entityId: item.id, details: `Created ${entityType.toLowerCase()}: "${name}"` });
        },
        update: (updatedItem: T) => {
            setter(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
            const name = updatedItem.name || updatedItem.title || updatedItem.companyName || updatedItem.modelName || 'N/A';
            addActivityLog({ actionType: 'UPDATE', entityType, entityId: updatedItem.id, details: `Updated ${entityType.toLowerCase()}: "${name}"` });
        },
        softDelete: (id: string, name?: string) => {
            setter(prev => prev.map(item => item.id === id ? { ...item, isDeleted: true } : item));
            addActivityLog({ actionType: 'DELETE', entityType, entityId: id, details: `Moved ${entityType.toLowerCase()} to trash: "${name || id}"` });
        },
        restore: (id: string, name?: string) => {
            setter(prev => prev.map(item => item.id === id ? { ...item, isDeleted: false } : item));
            addActivityLog({ actionType: 'RESTORE', entityType, entityId: id, details: `Restored ${entityType.toLowerCase()} from trash: "${name || id}"` });
        },
        hardDelete: (id: string, name?: string) => {
            setter(prev => prev.filter(item => item.id !== id));
            addActivityLog({ actionType: 'HARD_DELETE', entityType, entityId: id, details: `Permanently deleted ${entityType.toLowerCase()}: "${name || id}"` });
        },
    });

    const brandOps = createCrudOperations(setBrands, 'Brand');
    const productOps = createCrudOperations(setProducts, 'Product');
    const catalogueOps = createCrudOperations(setCatalogues, 'Catalogue');
    const pamphletOps = createCrudOperations(setPamphlets, 'Pamphlet');
    const adOps = createCrudOperations(setScreensaverAds, 'ScreensaverAd');
    const userOps = createCrudOperations(setAdminUsers, 'AdminUser');
    const tvOps = createCrudOperations(setTvContent, 'TvContent');
    const categoryOps = createCrudOperations(setCategories, 'Category');
    const clientOps = createCrudOperations(setClients, 'Client');
    const quoteOps = createCrudOperations(setQuotes, 'Quote');
    
    // --- AUTH ---
    const logout = useCallback(() => {
        const userToLogOut = loggedInUser;
        if (userToLogOut) {
            addActivityLog({ actionType: 'LOGOUT', entityType: 'AdminUser', entityId: userToLogOut.id, details: `User "${userToLogOut.firstName}" logged out.` });
        }
        setLoggedInUser(null);
        localStorage.removeItem('kiosk-user');
    }, [addActivityLog, loggedInUser]);

    const login = (userId: string, pin: string) => {
        const user = adminUsers.find(u => u.id === userId && u.pin === pin);
        if (user) {
            setLoggedInUser(user);
            localStorage.setItem('kiosk-user', JSON.stringify(user));
            addActivityLog({ actionType: 'LOGIN', entityType: 'AdminUser', entityId: user.id, details: `User "${user.firstName}" logged in.` }, user);
            return user;
        }
        return null;
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
    const startScreensaver = useCallback(() => setIsScreensaverActive(true), []);
    const exitScreensaver = useCallback(() => setIsScreensaverActive(false), []);
    const toggleScreensaver = () => setIsScreensaverEnabled(prev => !prev);
    
    // --- REMOTE CONTROL ---
    const remoteControlChannel = useRef<BroadcastChannel | null>(null);
    const kioskInstanceId = useRef(kioskId);
    useEffect(() => { kioskInstanceId.current = kioskId; }, [kioskId]);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.BroadcastChannel) {
            console.warn("BroadcastChannel API not supported. Remote control features will be disabled.");
            return;
        }

        const channel = new BroadcastChannel('kiosk_remote_control');
        remoteControlChannel.current = channel;

        const handleMessage = (event: MessageEvent) => {
            const { type, payload, from } = event.data;
            if (from === kioskInstanceId.current) return; // Ignore self messages

            if (type === 'heartbeat') {
                setKioskSessions(prev => {
                    const existingIndex = prev.findIndex(s => s.id === payload.id);
                    if (existingIndex > -1) {
                        const newSessions = [...prev];
                        newSessions[existingIndex] = payload;
                        return newSessions;
                    }
                    return [...prev, payload];
                });
            } else if (type === 'request_heartbeat') {
                channel.postMessage({ type: 'heartbeat', from: kioskInstanceId.current, payload: {
                    id: kioskInstanceId.current,
                    currentPath: window.location.hash.substring(1) || '/',
                    loggedInUser: loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}`.trim() : null,
                    isScreensaverActive,
                    lastHeartbeat: Date.now()
                }});
            } else if (type === 'command' && payload.kioskId === kioskInstanceId.current) {
                const { command } = payload;
                switch (command.type) {
                    case 'navigate': window.location.hash = command.path; break;
                    case 'refresh': window.location.reload(); break;
                    case 'logout': if (loggedInUser) logout(); break;
                    case 'startScreensaver': if (!isScreensaverActive) startScreensaver(); break;
                    case 'stopScreensaver': if (isScreensaverActive) exitScreensaver(); break;
                }
            }
        };

        channel.addEventListener('message', handleMessage);

        const heartbeatInterval = setInterval(() => {
            channel.postMessage({ type: 'heartbeat', from: kioskInstanceId.current, payload: {
                id: kioskInstanceId.current,
                currentPath: window.location.hash.substring(1) || '/',
                loggedInUser: loggedInUser ? `${loggedInUser.firstName} ${loggedInUser.lastName}`.trim() : null,
                isScreensaverActive,
                lastHeartbeat: Date.now()
            }});
            // Prune sessions older than 15 seconds
            setKioskSessions(prev => prev.filter(s => (Date.now() - s.lastHeartbeat) < 15000));
        }, 5000);

        channel.postMessage({ type: 'request_heartbeat', from: kioskInstanceId.current }); // Request initial state

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
            clearInterval(heartbeatInterval);
        };
    }, [loggedInUser, isScreensaverActive, logout, startScreensaver, exitScreensaver]);

    const sendRemoteCommand = useCallback((targetKioskId: string, command: RemoteCommand) => {
        if (remoteControlChannel.current) {
            remoteControlChannel.current.postMessage({
                type: 'command',
                from: kioskInstanceId.current,
                payload: { kioskId: targetKioskId, command }
            });
        }
    }, []);
    
    // --- SYNC & STORAGE ---

    const saveDatabaseToLocal = useCallback(async (): Promise<boolean> => {
        if (!directoryHandle) return false;
        isSyncingRef.current = true;
        try {
            setSyncStatus('syncing');
            const fileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
            const writable = await fileHandle.createWritable();
            const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs };
            await writable.write(JSON.stringify(backupData, null, 2));
            await writable.close();
            setSettings(prev => ({ ...prev, lastUpdated: Date.now() }));
            addActivityLog({ actionType: 'SYNC', entityType: 'System', details: `Synced data with Local Folder.` });
            setSyncStatus('synced');
            return true;
        } catch (error) {
            console.error("Failed to save database to local folder:", error);
            setSyncStatus('error');
            return false;
        } finally {
            setTimeout(() => { isSyncingRef.current = false; }, 100);
        }
    }, [directoryHandle, brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs, addActivityLog]);

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
             addActivityLog({ actionType: 'SYNC', entityType: 'System', details: `Loaded data from Local Folder.` });
            return true;
        } catch (error) {
            console.error("Failed to load database from local folder:", error);
            setSyncStatus('error');
            return false;
        }
    }, [directoryHandle, restoreBackup, addActivityLog]);
    
    const pushToCloud = useCallback(async (): Promise<boolean> => {
        const url = settings.customApiUrl;
        if (storageProvider !== 'customApi' || !url) return false;
        isSyncingRef.current = true;
        try {
            setSyncStatus('syncing');
            const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs };
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.customApiKey,
                },
                body: JSON.stringify(backupData),
            });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            setSettings(prev => ({ ...prev, lastUpdated: Date.now() }));
            addActivityLog({ actionType: 'SYNC', entityType: 'System', details: `Pushed data to Custom API.` });
            setSyncStatus('synced');
            return true;
        } catch (error) {
            console.error("Failed to push to cloud:", error);
            setSyncStatus('error');
            return false;
        } finally {
            setTimeout(() => { isSyncingRef.current = false; }, 100);
        }
    }, [storageProvider, settings, brands, products, catalogues, pamphlets, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs, addActivityLog]);

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
            addActivityLog({ actionType: 'SYNC', entityType: 'System', details: `Pulled data from ${isCustomApi ? 'Custom API' : 'Shared URL'}.` });
            return true;
        } catch (error) {
            console.error("Failed to pull from cloud:", error);
            setSyncStatus('error');
            return false;
        }
    }, [storageProvider, settings, restoreBackup, addActivityLog]);
    
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
                // FIX: Load activity logs from IndexedDB.
                activityLogs: { setter: setActivityLogs, initial: initialActivityLogs },
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

    const debounceTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isDataLoaded || isSyncingRef.current) return;
        setSyncStatus(prev => (prev === 'synced' || prev === 'idle') ? 'pending' : prev);
    }, [isDataLoaded, brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs]);

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
        // FIX: Add activityLogs to context value.
        settings, brands, products, catalogues, pamphlets, screensaverAds, adminUsers, loggedInUser, tvContent, categories, clients, quotes, viewCounts, activityLogs,
        login, logout,
        addBrand: brandOps.add, updateBrand: brandOps.update, 
        deleteBrand: (id) => brandOps.softDelete(id, brands.find(i=>i.id===id)?.name), 
        restoreBrand: (id) => brandOps.restore(id, brands.find(i=>i.id===id)?.name), 
        permanentlyDeleteBrand: (id) => brandOps.hardDelete(id, brands.find(i=>i.id===id)?.name),
        addProduct: productOps.add, updateProduct: productOps.update, 
        deleteProduct: (id) => productOps.softDelete(id, products.find(i=>i.id===id)?.name), 
        restoreProduct: (id) => productOps.restore(id, products.find(i=>i.id===id)?.name), 
        permanentlyDeleteProduct: (id) => productOps.hardDelete(id, products.find(i=>i.id===id)?.name),
        addCatalogue: catalogueOps.add, updateCatalogue: catalogueOps.update, 
        deleteCatalogue: (id) => catalogueOps.softDelete(id, catalogues.find(i=>i.id===id)?.title), 
        restoreCatalogue: (id) => catalogueOps.restore(id, catalogues.find(i=>i.id===id)?.title), 
        permanentlyDeleteCatalogue: (id) => catalogueOps.hardDelete(id, catalogues.find(i=>i.id===id)?.title),
        addPamphlet: pamphletOps.add, updatePamphlet: pamphletOps.update, 
        deletePamphlet: (id) => pamphletOps.softDelete(id, pamphlets.find(i=>i.id===id)?.title), 
        restorePamphlet: (id) => pamphletOps.restore(id, pamphlets.find(i=>i.id===id)?.title), 
        permanentlyDeletePamphlet: (id) => pamphletOps.hardDelete(id, pamphlets.find(i=>i.id===id)?.title),
        addAd: adOps.add, updateAd: adOps.update, 
        deleteAd: (id) => adOps.hardDelete(id, screensaverAds.find(i=>i.id===id)?.title),
        addAdminUser: userOps.add, updateAdminUser: userOps.update, 
        deleteAdminUser: (id) => userOps.hardDelete(id, adminUsers.find(i=>i.id===id)?.firstName),
        addTvContent: tvOps.add, updateTvContent: tvOps.update, 
        deleteTvContent: (id) => tvOps.softDelete(id, tvContent.find(i=>i.id===id)?.modelName), 
        restoreTvContent: (id) => tvOps.restore(id, tvContent.find(i=>i.id===id)?.modelName), 
        permanentlyDeleteTvContent: (id) => tvOps.hardDelete(id, tvContent.find(i=>i.id===id)?.modelName),
        addCategory: categoryOps.add, updateCategory: categoryOps.update, 
        deleteCategory: (id) => categoryOps.softDelete(id, categories.find(i=>i.id===id)?.name), 
        restoreCategory: (id) => categoryOps.restore(id, categories.find(i=>i.id===id)?.name), 
        permanentlyDeleteCategory: (id) => categoryOps.hardDelete(id, categories.find(i=>i.id===id)?.name),
        addClient: (client: Client) => { clientOps.add(client); return client.id; },
        updateClient: clientOps.update,
        deleteClient: (id) => clientOps.softDelete(id, clients.find(i=>i.id===id)?.companyName), 
        restoreClient: (id) => clientOps.restore(id, clients.find(i=>i.id===id)?.companyName), 
        permanentlyDeleteClient: (id) => clientOps.hardDelete(id, clients.find(i=>i.id===id)?.companyName),
        addQuote: quoteOps.add, 
        updateQuote: quoteOps.update,
        toggleQuoteStatus: (quoteId: string) => {
            const quote = quotes.find(q=>q.id === quoteId);
            if (quote) {
                const newStatus = quote.status === 'pending' ? 'quoted' : 'pending';
                const clientName = clients.find(c => c.id === quote.clientId)?.companyName || 'Unknown';
                setQuotes(prev => prev.map(q => q.id === quoteId ? {...q, status: newStatus} : q));
                addActivityLog({ actionType: 'UPDATE', entityType: 'Quote', entityId: quoteId, details: `Set quote for ${clientName} to "${newStatus}"` });
            }
        },
        deleteQuote: (quoteId: string) => {
            const quote = quotes.find(q=>q.id === quoteId);
            if(quote) {
                 const clientName = clients.find(c => c.id === quote.clientId)?.companyName || 'Unknown';
                 setQuotes(prev => prev.filter(q => q.id !== quoteId));
                 addActivityLog({ actionType: 'HARD_DELETE', entityType: 'Quote', entityId: quoteId, details: `Deleted quote for "${clientName}"` });
            }
        },
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
        // FIX: Add remote control state and functions to context value.
        kioskSessions,
        sendRemoteCommand,
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};