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
    activityLogs as initialActivityLogs
} from '../../data/mockData.ts';
import type { Settings, Brand, Product, Catalogue, Pamphlet, ScreensaverAd, BackupData, AdminUser, StorageProvider, ProductDocument, TvContent, Category, Client, Quote, ViewCounts, ActivityLog, KioskSession, RemoteCommand, BackupProgress } from '../../types.ts';
import { idbGet, idbSet } from './idb.ts';
import JSZip from 'jszip';
import { TrashIcon, ClipboardDocumentListIcon } from '../Icons.tsx';


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
interface ConfirmationState {
  isOpen: boolean;
  message: string | React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  title?: string;
  isDestructive?: boolean;
  icon?: React.ReactNode;
}
interface BookletModalState { isOpen: boolean; title: string; imageUrls: string[]; }
interface PdfModalState { isOpen: boolean; url: string; title: string; }
interface QuoteStartModalState { isOpen: boolean; }
type DocumentType = ProductDocument | Catalogue | Pamphlet;
type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced' | 'error';

interface AppContextType {
  isSetupComplete: boolean;
  completeSetup: () => void;
  resetSetup: () => void;
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
  deleteAllMockData: () => void;
  isScreensaverActive: boolean;
  isScreensaverEnabled: boolean;
  startScreensaver: () => void;
  exitScreensaver: () => void;
  toggleScreensaver: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  triggerInstallPrompt: () => void;
  confirmation: ConfirmationState;
  showConfirmation: (message: string, onConfirm: () => void) => void;
  showInfoModal: (title: string, message: string | React.ReactNode, onConfirm?: () => void) => void;
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
  lastConnectedProvider: StorageProvider | null;
  isStorageConnected: boolean;
  directoryHandle: FileSystemDirectoryHandle | null;
  connectToLocalProvider: () => Promise<void>;
  connectToCloudProvider: (provider: StorageProvider) => void;
  connectToSharedUrl: (url: string) => void;
  disconnectFromStorage: () => void;
  reconnectLastProvider: () => Promise<{ success: boolean; message: string; }>;
  clearLastConnectedProvider: () => void;
  saveFileToStorage: (file: File, pathSegments: string[]) => Promise<string>;
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
  setKioskId: (newId: string) => void;
  kioskSessions: KioskSession[];
  sendRemoteCommand: (kioskId: string, command: RemoteCommand) => void;
  playTouchSound: () => void;
  isScreensaverPinModalOpen: boolean;
  setIsScreensaverPinModalOpen: (isOpen: boolean) => void;
  apkDownloadUrl: string;
  backupProgress: BackupProgress;
  setBackupProgress: (progress: Partial<BackupProgress>) => void;
  createZipBackup: () => Promise<void>;
  restoreZipBackup: (file: File) => Promise<void>;
  uploadApk: (file: File) => Promise<void>;
  // FIX: Add fulfillingQuote and setFulfillingQuote to the context type to manage the fulfillment modal globally.
  fulfillingQuote: Quote | null;
  setFulfillingQuote: (quote: Quote | null) => void;
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
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
    const [kioskSessions, setKioskSessions] = useState<KioskSession[]>([]);
    const [apkDownloadUrl, setApkDownloadUrl] = useState<string>('');
    const [backupProgress, setBackupProgressState] = useState<BackupProgress>({ active: false, message: '', percent: 0 });
    // FIX: Add state for the quote being fulfilled to manage the modal globally.
    const [fulfillingQuote, setFulfillingQuote] = useState<Quote | null>(null);

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);

    const [isSetupComplete, setIsSetupComplete] = useState<boolean>(() => {
        return localStorage.getItem('kioskSetupComplete') === 'true';
    });
    
    const resetSetup = () => {
        logout(); // Log out the user as well for security
        setIsSetupComplete(false);
        localStorage.removeItem('kioskSetupComplete');
    };

    // Screensaver state
    const [isScreensaverActive, setIsScreensaverActive] = useState(false);
    const [isScreensaverEnabled, setIsScreensaverEnabled] = useState(true);

    // Modals state
    const [confirmation, setConfirmation] = useState<ConfirmationState>({ isOpen: false, message: '', onConfirm: () => {} });
    const [bookletModalState, setBookletModalState] = useState<BookletModalState>({ isOpen: false, title: '', imageUrls: [] });
    const [pdfModalState, setPdfModalState] = useState<PdfModalState>({ isOpen: false, url: '', title: '' });
    const [quoteStartModal, setQuoteStartModal] = useState<QuoteStartModalState>({ isOpen: false });
    const [isScreensaverPinModalOpen, setIsScreensaverPinModalOpen] = useState(false);

    // TV Player state
    const [activeTvContent, setActiveTvContent] = useState<TvContent | null>(null);

    // Storage and Sync state
    const [storageProvider, setStorageProvider] = useState<StorageProvider>('none');
    const [lastConnectedProvider, setLastConnectedProvider] = useState<StorageProvider | null>(null);
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [syncStatus, setSyncStatusState] = useState<SyncStatus>('idle');
    const [initialSyncStatus, setInitialSyncStatus] = useState<SyncStatus | null>(null);
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

    const [kioskId, setKioskIdState] = useState<string>(() => {
        let id = localStorage.getItem('kioskId');
        if (!id) {
            id = `kiosk_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            localStorage.setItem('kioskId', id);
        }
        return id;
    });

    const setKioskId = (newId: string) => {
        const trimmedId = newId.trim();
        if (trimmedId) {
            setKioskIdState(trimmedId);
            localStorage.setItem('kioskId', trimmedId);
        }
    };
    
    const setSyncStatus = (status: SyncStatus) => {
        setSyncStatusState(status);
        idbSet('syncStatus', status).catch(err => console.error("Failed to save sync status to IDB", err));
    };

    // --- MODERN SYNC LOGIC ---
    const markAsDirty = useCallback(() => {
        if (isSyncingRef.current) return;
        if (isDataLoaded) {
            setSyncStatus('pending');
        }
    }, [isDataLoaded]);
    
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
        setActivityLogs(prev => {
            const newState = [newLog, ...prev];
            idbSet('activityLogs', newState);
            return newState;
        });
        markAsDirty();
    }, [loggedInUser, kioskId, markAsDirty]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        const mergedSettings = deepMerge(settings, newSettings);
        setSettings(mergedSettings);
        idbSet('settings', mergedSettings);
        addActivityLog({ actionType: 'UPDATE', entityType: 'Settings', details: 'Updated system settings.' });
        markAsDirty();
    }, [settings, addActivityLog, markAsDirty]);

    const restoreBackup = useCallback((data: Partial<BackupData>) => {
        const dataMap = {
            settings: (val: Settings) => {
                const merged = deepMerge(initialSettings, val);
                setSettings(merged); idbSet('settings', merged);
            },
            brands: (val: Brand[]) => { setBrands(val); idbSet('brands', val); },
            products: (val: Product[]) => { setProducts(val); idbSet('products', val); },
            catalogues: (val: Catalogue[]) => { setCatalogues(val); idbSet('catalogues', val); },
            pamphlets: (val: Pamphlet[]) => { setPamphlets(val); idbSet('pamphlets', val); },
            screensaverAds: (val: ScreensaverAd[]) => { setScreensaverAds(val); idbSet('screensaverAds', val); },
            adminUsers: (val: AdminUser[]) => { setAdminUsers(val); idbSet('adminUsers', val); },
            tvContent: (val: TvContent[]) => { setTvContent(val); idbSet('tvContent', val); },
            categories: (val: Category[]) => { setCategories(val); idbSet('categories', val); },
            clients: (val: Client[]) => { setClients(val); idbSet('clients', val); },
            quotes: (val: Quote[]) => { setQuotes(val); idbSet('quotes', val); },
            viewCounts: (val: ViewCounts) => { setViewCounts(val); idbSet('viewCounts', val); },
            activityLogs: (val: ActivityLog[]) => { setActivityLogs(val); idbSet('activityLogs', val); },
        };

        Object.entries(data).forEach(([key, value]) => {
            if (key in dataMap && value !== undefined) {
                (dataMap[key as keyof BackupData] as any)(value);
            }
        });

        addActivityLog({ actionType: 'RESTORE', entityType: 'System', details: 'Restored data from a backup file.' });
        markAsDirty();
    }, [addActivityLog, markAsDirty]);
    
    // --- GENERIC CRUD ---
    const createCrudOperations = <T extends { id: string, name?: string, title?: string, companyName?: string, modelName?: string, isDeleted?: boolean }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        entityType: ActivityLog['entityType'],
        idbKey: string
    ) => ({
        add: (item: T) => {
            setter(prev => {
                const newState = [...prev, item];
                idbSet(idbKey, newState);
                return newState;
            });
            const name = item.name || item.title || item.companyName || item.modelName || 'N/A';
            addActivityLog({ actionType: 'CREATE', entityType, entityId: item.id, details: `Created ${entityType.toLowerCase()}: "${name}"` });
            markAsDirty();
        },
        update: (updatedItem: T) => {
            setter(prev => {
                const newState = prev.map(item => item.id === updatedItem.id ? updatedItem : item);
                idbSet(idbKey, newState);
                return newState;
            });
            const name = updatedItem.name || updatedItem.title || updatedItem.companyName || updatedItem.modelName || 'N/A';
            addActivityLog({ actionType: 'UPDATE', entityType, entityId: updatedItem.id, details: `Updated ${entityType.toLowerCase()}: "${name}"` });
            markAsDirty();
        },
        softDelete: (id: string, name?: string) => {
            setter(prev => {
                const newState = prev.map(item => item.id === id ? { ...item, isDeleted: true } : item);
                idbSet(idbKey, newState);
                return newState;
            });
            addActivityLog({ actionType: 'DELETE', entityType, entityId: id, details: `Moved ${entityType.toLowerCase()} to trash: "${name || id}"` });
            markAsDirty();
        },
        restore: (id: string, name?: string) => {
            setter(prev => {
                const newState = prev.map(item => item.id === id ? { ...item, isDeleted: false } : item);
                idbSet(idbKey, newState);
                return newState;
            });
            addActivityLog({ actionType: 'RESTORE', entityType, entityId: id, details: `Restored ${entityType.toLowerCase()} from trash: "${name || id}"` });
            markAsDirty();
        },
        hardDelete: (id: string, name?: string) => {
            setter(prev => {
                const newState = prev.filter(item => item.id !== id);
                idbSet(idbKey, newState);
                return newState;
            });
            addActivityLog({ actionType: 'HARD_DELETE', entityType, entityId: id, details: `Permanently deleted ${entityType.toLowerCase()}: "${name || id}"` });
            markAsDirty();
        },
    });

    const brandOps = createCrudOperations(setBrands, 'Brand', 'brands');
    const productOps = createCrudOperations(setProducts, 'Product', 'products');
    const catalogueOps = createCrudOperations(setCatalogues, 'Catalogue', 'catalogues');
    const pamphletOps = createCrudOperations(setPamphlets, 'Pamphlet', 'pamphlets');
    const adOps = createCrudOperations(setScreensaverAds, 'ScreensaverAd', 'screensaverAds');
    const userOps = createCrudOperations(setAdminUsers, 'AdminUser', 'adminUsers');
    const tvOps = createCrudOperations(setTvContent, 'TvContent', 'tvContent');
    const categoryOps = createCrudOperations(setCategories, 'Category', 'categories');
    const clientOps = createCrudOperations(setClients, 'Client', 'clients');
    const quoteOps = createCrudOperations(setQuotes, 'Quote', 'quotes');
    
    // --- AUTH ---
    const logout = useCallback(() => {
        const userToLogOut = loggedInUser;
        if (userToLogOut) {
            addActivityLog({ actionType: 'LOGOUT', entityType: 'AdminUser', entityId: userToLogOut.id, details: `User "${userToLogOut.firstName}" logged out.` });
        }
        setLoggedInUser(null);
    }, [addActivityLog, loggedInUser]);

    const login = (userId: string, pin: string) => {
        const user = adminUsers.find(u => u.id === userId && u.pin === pin);
        if (user) {
            setLoggedInUser(user);
            addActivityLog({ actionType: 'LOGIN', entityType: 'AdminUser', entityId: user.id, details: `User "${user.firstName}" logged in.` }, user);
            return user;
        }
        return null;
    };

    // --- MODALS ---
    const hideConfirmation = () => {
        const cancelCallback = confirmation.onCancel;
        setConfirmation({ isOpen: false, message: '', onConfirm: () => {} });
        if (cancelCallback) {
          cancelCallback();
        }
    };
    const showConfirmation = (message: string, onConfirm: () => void) => {
        setConfirmation({
            isOpen: true,
            message,
            onConfirm,
            title: 'Confirm Action',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            isDestructive: true,
            icon: <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />,
        });
    };
    const showInfoModal = (title: string, message: string | React.ReactNode, onConfirm?: () => void) => {
        setConfirmation({
            isOpen: true,
            title,
            message,
            onConfirm: onConfirm || (() => {}),
            confirmText: 'OK',
            isDestructive: false,
            icon: <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
        });
    };
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
    
    // --- AUDIO ---
    const touchSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Preload touch sound if URL is provided in settings
        if (settings.touchSoundUrl) {
            const audio = new Audio(settings.touchSoundUrl);
            audio.preload = 'auto';
            audio.volume = 0.3; 
            touchSoundRef.current = audio;
        } else {
            touchSoundRef.current = null;
        }
    }, [settings.touchSoundUrl]);

    const playTouchSound = useCallback(() => {
        if (touchSoundRef.current) {
            touchSoundRef.current.currentTime = 0;
            touchSoundRef.current.play().catch(e => {
                if (e.name !== 'AbortError') {
                    console.error("Error playing touch sound:", e);
                }
            });
        }
    }, []);

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
    const debounceTimerRef = useRef<number | null>(null);

    const saveDatabaseToLocal = useCallback(async (): Promise<boolean> => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (!directoryHandle) return false;
        isSyncingRef.current = true;
        setSyncStatus('syncing');
        try {
            const fileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
            const writable = await fileHandle.createWritable();
            const updatedSettings = { ...settings, lastUpdated: Date.now() };
            const backupData: BackupData = { brands, products, catalogues, pamphlets, settings: updatedSettings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs };
            await writable.write(JSON.stringify(backupData, null, 2));
            await writable.close();
            
            setSettings(updatedSettings);
            await idbSet('settings', updatedSettings);

            addActivityLog({ actionType: 'SYNC', entityType: 'System', details: `Synced data with Local Folder.` });
            setSyncStatus('synced');
            return true;
        } catch (error) {
            console.error("Failed to save database to local folder:", error);
            setSyncStatus('error');
            return false;
        } finally {
            isSyncingRef.current = false;
        }
    }, [directoryHandle, brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs, addActivityLog]);

    const loadDatabaseFromLocal = useCallback(async (): Promise<boolean> => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        if (!directoryHandle) return false;
        setSyncStatus('syncing');
        try {
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
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        const url = settings.customApiUrl;
        if (storageProvider !== 'customApi' || !url) return false;
        isSyncingRef.current = true;
        setSyncStatus('syncing');
        try {
            const updatedSettings = { ...settings, lastUpdated: Date.now() };
            const backupData: BackupData = { brands, products, catalogues, pamphlets, settings: updatedSettings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs };
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.customApiKey,
                },
                body: JSON.stringify(backupData),
            });
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            
            setSettings(updatedSettings);
            await idbSet('settings', updatedSettings);

            addActivityLog({ actionType: 'SYNC', entityType: 'System', details: `Pushed data to Custom API.` });
            setSyncStatus('synced');
            return true;
        } catch (error) {
            console.error("Failed to push to cloud:", error);
            setSyncStatus('error');
            return false;
        } finally {
            isSyncingRef.current = false;
        }
    }, [storageProvider, settings, brands, products, catalogues, pamphlets, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs, addActivityLog]);

    const pullFromCloud = useCallback(async (): Promise<boolean> => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        const isCustomApi = storageProvider !== 'local' && storageProvider !== 'none' && storageProvider !== 'sharedUrl';
        const isSharedUrl = storageProvider === 'sharedUrl' && settings.sharedUrl;
        if (!isCustomApi && !isSharedUrl) return false;
        
        const url = (isCustomApi ? settings.customApiUrl : settings.sharedUrl)!;
        setSyncStatus('syncing');
        try {
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
                setLastConnectedProvider('local');
                await idbSet('lastConnectedProvider', 'local');
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

    const connectToCloudProvider = useCallback((provider: StorageProvider) => {
        const apiLikeProviders: StorageProvider[] = ['customApi', 'supabase', 'vercel', 'netlify', 'aws', 'xano', 'backendless', 'ftp'];
        if (apiLikeProviders.includes(provider)) {
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
        setLastConnectedProvider(provider);
        idbSet('lastConnectedProvider', provider);
    }, [settings.customApiUrl]);

    const connectToSharedUrl = useCallback((url: string) => {
        if (!url) {
            alert("Please enter a URL to connect.");
            return;
        }
        updateSettings({ sharedUrl: url });
        setStorageProvider('sharedUrl');
        idbSet('storageProvider', 'sharedUrl');
        setLastConnectedProvider('sharedUrl');
        idbSet('lastConnectedProvider', 'sharedUrl');
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
                
                // The provider is set by the UI before calling this, so just confirm.
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

    const saveFileToStorage = useCallback(async (file: File, pathSegments: string[]): Promise<string> => {
        const relativePath = pathSegments.join('/');
        
        if (storageProvider === 'local' && directoryHandle) {
            try {
                let currentHandle = await directoryHandle.getDirectoryHandle('assets', { create: true });
                for (const segment of pathSegments) {
                    currentHandle = await currentHandle.getDirectoryHandle(segment, { create: true });
                }
                const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const fileName = `${Date.now()}-${safeName}`;
                const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(file);
                await writable.close();
                return `${relativePath}/${fileName}`;
            } catch (error) {
                console.error('Error saving file to local directory:', error);
                throw new Error('Failed to save file to local directory.');
            }
        }
        
        const isCustomApi = storageProvider !== 'local' && storageProvider !== 'none' && storageProvider !== 'sharedUrl';
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
                headers: { 'x-api-key': settings.customApiKey, 'x-upload-path': relativePath },
                body: formData,
            });
            if (!response.ok) throw new Error(`Upload failed: ${await response.text()}`);
            const result = await response.json();
            return result.filename; // Server returns the full relative path
        }
        
        return fileToBase64(file);
    }, [storageProvider, directoryHandle, settings]);
    
    const getFileUrl = useCallback(async (filePath: string): Promise<string> => {
        if (!filePath || filePath.startsWith('http') || filePath.startsWith('data:')) {
            return filePath || '';
        }
        
        if (storageProvider === 'local' && directoryHandle) {
            try {
                const pathSegments = filePath.split('/').filter(p => p);
                const fileName = pathSegments.pop();
                if (!fileName) return '';

                let currentHandle = await directoryHandle.getDirectoryHandle('assets');
                for (const segment of pathSegments) {
                    currentHandle = await currentHandle.getDirectoryHandle(segment);
                }
                const fileHandle = await currentHandle.getFileHandle(fileName);
                const file = await fileHandle.getFile();
                return URL.createObjectURL(file);
            } catch (error) {
                console.error(`Could not get file "${filePath}" from local storage:`, error);
                return '';
            }
        }

        const isCustomApi = storageProvider !== 'local' && storageProvider !== 'none' && storageProvider !== 'sharedUrl';
        const isSharedUrlApi = storageProvider === 'sharedUrl' && isApiEndpoint(settings.sharedUrl);
    
        if (isCustomApi || isSharedUrlApi) {
            try {
                const baseUrlString = isCustomApi ? settings.customApiUrl : settings.sharedUrl;
                if (!baseUrlString) return filePath;
    
                const baseUrl = new URL(baseUrlString);
                const finalUrl = new URL(`/files/${filePath}`, baseUrl.origin);
                
                return finalUrl.toString();
            } catch (error) {
                console.error("Error constructing file URL:", error);
                return filePath;
            }
        }
        
        return filePath;
    }, [storageProvider, directoryHandle, settings]);
    
    useEffect(() => {
        const checkApk = async () => {
            if (storageProvider === 'none') {
                setApkDownloadUrl('');
                return;
            }
            try {
                const url = await getFileUrl('kiosk-app.apk');
                if (!url || url === 'kiosk-app.apk') { // getFileUrl might return the filename if it fails
                    setApkDownloadUrl('');
                    return;
                }
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                    setApkDownloadUrl(url);
                } else {
                    setApkDownloadUrl('');
                }
            } catch (e) {
                console.warn("Could not check for kiosk-app.apk, download link will be hidden.", e);
                setApkDownloadUrl('');
            }
        };

        checkApk();
    }, [storageProvider, settings.customApiUrl, settings.sharedUrl, getFileUrl]);

    // --- APP LIFECYCLE & AUTO-SYNC ---
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
            idbSet('viewCounts', newCounts);
            return newCounts;
        });
        markAsDirty();
    }, [kioskId, markAsDirty]);

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
            idbSet('viewCounts', newCounts);
            return newCounts;
        });
        markAsDirty();
    }, [kioskId, markAsDirty]);

    useEffect(() => {
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const performSync = useCallback(() => {
        if (storageProvider === 'local') {
            saveDatabaseToLocal();
        } else if (storageProvider !== 'none' && storageProvider !== 'sharedUrl') {
            pushToCloud();
        }
    }, [storageProvider, saveDatabaseToLocal, pushToCloud]);
    
    const disconnectFromStorage = () => {
        showConfirmation(
            "Are you sure you want to disconnect? Auto-sync will be disabled.",
            () => {
                setLastConnectedProvider(storageProvider);
                idbSet('lastConnectedProvider', storageProvider);
                
                setStorageProvider('none'); idbSet('storageProvider', 'none');
                if (directoryHandle) { setDirectoryHandle(null); idbSet('directoryHandle', null); }
            }
        );
    };

    const reconnectLastProvider = async (): Promise<{ success: boolean; message: string; }> => {
        const lastProvider = await idbGet<StorageProvider | null>('lastConnectedProvider');
        if (!lastProvider || lastProvider === 'none') return { success: false, message: "No previous provider to reconnect to." };

        if (lastProvider === 'local') {
            await connectToLocalProvider(); // This re-prompts and handles state setting
            const finalProvider = await idbGet<StorageProvider>('storageProvider');
            if (finalProvider === 'local') {
                return { success: true, message: "Successfully reconnected to Local Folder." };
            }
            return { success: false, message: "Connection to Local Folder was cancelled or failed." };
        }

        setStorageProvider(lastProvider);
        idbSet('storageProvider', lastProvider);
        const result = await testAndConnectProvider();

        if (!result.success) {
            setStorageProvider('none');
            idbSet('storageProvider', 'none');
        }
        
        return result;
    };

    const clearLastConnectedProvider = () => {
        setLastConnectedProvider(null);
        idbSet('lastConnectedProvider', null);
    };

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
            
            const storedSyncStatus = await idbGet<SyncStatus>('syncStatus');
            if (storedSyncStatus) {
                setSyncStatusState(storedSyncStatus);
                setInitialSyncStatus(storedSyncStatus);
            } else {
                setInitialSyncStatus('idle');
            }
            
            const lastProvider = await idbGet<StorageProvider | null>('lastConnectedProvider');
            if(lastProvider) { setLastConnectedProvider(lastProvider); }

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
            } else if (provider && provider !== 'none') {
                setStorageProvider(provider);
            }
            setIsDataLoaded(true);
        };
        loadAndConnect();
    }, []);
    
    useEffect(() => {
        if (isDataLoaded && initialSyncStatus === 'pending' && storageProvider !== 'none' && settings.sync.autoSyncEnabled) {
            console.log("Pending sync detected on app load. Triggering sync now.");
            performSync();
        }
    }, [isDataLoaded, initialSyncStatus, storageProvider, settings.sync.autoSyncEnabled, performSync]);

    useEffect(() => {
        // This effect runs after initial data has been loaded from IDB
        // and the storage provider has been identified.
        const syncOnLoad = async () => {
            if (isDataLoaded && storageProvider !== 'none' && storageProvider !== 'local') {
                console.log("Attempting to pull latest data from cloud on app load...");
                await pullFromCloud();
            }
        };
        syncOnLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDataLoaded, storageProvider]);
    
    useEffect(() => {
        if (!isDataLoaded || syncStatus !== 'pending' || !settings.sync.autoSyncEnabled || storageProvider === 'none') {
            return;
        }

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = window.setTimeout(() => {
            console.log("Auto-sync triggered by debounce.");
            performSync();
        }, 2000);

        return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
    }, [syncStatus, settings.sync.autoSyncEnabled, storageProvider, isDataLoaded, performSync]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && syncStatus === 'pending' && settings.sync.autoSyncEnabled && storageProvider !== 'none') {
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }
                console.log("Auto-sync triggered by page becoming hidden.");
                performSync();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [syncStatus, settings.sync.autoSyncEnabled, storageProvider, performSync]);

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
    
    const setBackupProgress = (progressUpdate: Partial<BackupProgress>) => {
        setBackupProgressState(prev => ({...prev, ...progressUpdate}));
    };
    
    const createZipBackup = useCallback(async () => {
        setBackupProgress({ active: true, message: 'Starting backup...', percent: 0 });
        try {
            const zip = new JSZip();
            const updatedSettings = { ...settings, lastUpdated: Date.now() };
            const backupData: BackupData = { brands, products, catalogues, pamphlets, settings: updatedSettings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs };
            zip.file('database.json', JSON.stringify(backupData, null, 2));
            setBackupProgress({ message: 'Database backed up.', percent: 10 });
            
            const allAssetPaths = new Set<string>();
            const addAsset = (url?: string) => url && !url.startsWith('http') && !url.startsWith('data:') && allAssetPaths.add(url);
            
            brands.forEach(b => addAsset(b.logoUrl));
            products.forEach(p => { p.images.forEach(addAsset); addAsset(p.video); p.documents?.forEach(d => { if (d.type === 'image') d.imageUrls.forEach(addAsset); else addAsset(d.url); }); });
            catalogues.forEach(c => { addAsset(c.thumbnailUrl); c.imageUrls.forEach(addAsset); });
            pamphlets.forEach(p => { addAsset(p.imageUrl); p.imageUrls.forEach(addAsset); });
            screensaverAds.forEach(a => a.media.forEach(m => addAsset(m.url)));
            adminUsers.forEach(u => addAsset(u.imageUrl));
            tvContent.forEach(t => t.media.forEach(m => addAsset(m.url)));
            addAsset(settings.logoUrl); addAsset(settings.pwaIconUrl); addAsset(settings.header.backgroundImageUrl); addAsset(settings.footer.backgroundImageUrl); addAsset(settings.loginScreen.backgroundImageUrl); addAsset(settings.lightTheme.appBgImage); addAsset(settings.darkTheme.appBgImage); addAsset(settings.creatorProfile.imageUrl); addAsset(settings.creatorProfile.logoUrlLight); addAsset(settings.creatorProfile.logoUrlDark); addAsset(settings.backgroundMusicUrl); addAsset(settings.touchSoundUrl);

            const assetPathsArray = Array.from(allAssetPaths);
            for (let i = 0; i < assetPathsArray.length; i++) {
                const path = assetPathsArray[i];
                try {
                    const url = await getFileUrl(path);
                    const response = await fetch(url);
                    const blob = await response.blob();
                    // Create nested structure in zip
                    zip.file(`assets/${path}`, blob);
                    const percent = 10 + Math.round(((i + 1) / assetPathsArray.length) * 85);
                    setBackupProgress({ message: `Backing up asset: ${path}`, percent });
                } catch (e) { console.warn(`Could not back up asset ${path}:`, e); }
            }
            
            setBackupProgress({ message: 'Generating zip file...', percent: 95 });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `kiosk_backup_${new Date().toISOString().split('T')[0]}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
            setBackupProgress({ message: 'Backup complete!', percent: 100 });
        } catch (error) {
            console.error("Error creating zip backup:", error);
            alert(`Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setBackupProgress({ active: false, message: 'Backup failed', percent: 0 });
        } finally {
            setTimeout(() => setBackupProgress({ active: false, message: '', percent: 0 }), 3000);
        }
    }, [brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts, activityLogs, getFileUrl]);

    const restoreZipBackup = useCallback(async (file: File) => {
        setBackupProgress({ active: true, message: 'Starting restore...', percent: 0 });
        try {
            const zip = await JSZip.loadAsync(file);
            const dbFile = zip.file('database.json');
            if (!dbFile) throw new Error('database.json not found in zip file.');
            setBackupProgress({ message: 'Reading database...', percent: 5 });
            const dbContent = await dbFile.async('string');
            const backupData: BackupData = JSON.parse(dbContent);
            const assetsFolder = zip.folder('assets');
            if (assetsFolder) {
                // FIX: Explicitly type parameter 'f' as 'any' to resolve type inference issue with Object.values.
                const assetFiles: any[] = Object.values(assetsFolder.files).filter((f: any) => !f.dir);
                let uploadedCount = 0;
                for (const assetFile of assetFiles) {
                    try {
                        const blob = await assetFile.async('blob');
                        const file = new File([blob], assetFile.name);
                        const pathSegments = assetFile.name.split('/').slice(0, -1);
                        await saveFileToStorage(file, pathSegments);
                        uploadedCount++;
                        const percent = 5 + Math.round((uploadedCount / assetFiles.length) * 90);
                        setBackupProgress({ message: `Restoring asset: ${assetFile.name}`, percent });
                    } catch (e) { console.warn(`Could not restore asset ${assetFile.name}:`, e); }
                }
            }
            setBackupProgress({ message: 'Applying data...', percent: 95 });
            restoreBackup(backupData);
            setBackupProgress({ message: 'Restore complete!', percent: 100 });
            alert("Restore successful! The application will now reload.");
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Error restoring from zip backup:", error);
            alert(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setBackupProgress({ active: false, message: 'Restore failed', percent: 0 });
        }
    }, [saveFileToStorage, restoreBackup]);
    
    const uploadApk = useCallback(async (file: File): Promise<void> => {
        if (storageProvider === 'local' && directoryHandle) {
            try {
                const fileHandle = await directoryHandle.getFileHandle('kiosk-app.apk', { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(file);
                await writable.close();
                addActivityLog({ actionType: 'UPDATE', entityType: 'System', details: 'Uploaded kiosk-app.apk to Local Folder.' });
                return;
            } catch (error) {
                console.error('Error saving kiosk-app.apk to local directory:', error);
                throw new Error('Failed to save kiosk-app.apk to local directory.');
            }
        }
        if (storageProvider === 'customApi') {
            const url = settings.customApiUrl;
            if (!url) throw new Error("API URL is not configured for upload.");
            const uploadUrl = new URL(url);
            uploadUrl.pathname = uploadUrl.pathname.replace(/\/data$/, '/upload-apk');
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(uploadUrl.toString(), {
                method: 'POST',
                headers: { 'x-api-key': settings.customApiKey },
                body: formData,
            });
            if (!response.ok) throw new Error(`Upload failed: ${await response.text()}`);
            addActivityLog({ actionType: 'UPDATE', entityType: 'System', details: 'Uploaded kiosk-app.apk to Custom API.' });
            return;
        }
        throw new Error('No compatible storage provider (Local Folder or Custom API) is connected for this operation.');
    }, [storageProvider, directoryHandle, settings, addActivityLog]);

    const deleteAllMockData = useCallback(() => {
        showConfirmation(
            "Are you sure you want to delete ALL data? This will reset the kiosk to a blank state, leaving only admin users and system settings. This action cannot be undone.",
            () => {
                const emptyBackup: Partial<BackupData> = {
                    brands: [],
                    products: [],
                    catalogues: [],
                    pamphlets: [],
                    screensaverAds: [],
                    tvContent: [],
                    categories: [],
                    clients: [],
                    quotes: [],
                    viewCounts: {},
                    activityLogs: [],
                };
                restoreBackup(emptyBackup);
                
                addActivityLog({
                    actionType: 'HARD_DELETE',
                    entityType: 'System',
                    details: 'All mock/user data was permanently deleted.'
                });

                alert('All data has been deleted. The application is now in a fresh state.');
            }
        );
    }, [showConfirmation, restoreBackup, addActivityLog]);

    const contextValue: AppContextType = {
        isSetupComplete,
        completeSetup: () => {
            setIsSetupComplete(true);
            localStorage.setItem('kioskSetupComplete', 'true');
        },
        resetSetup,
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
                const newStatus: 'pending' | 'quoted' = quote.status === 'pending' ? 'quoted' : 'pending';
                const clientName = clients.find(c => c.id === quote.clientId)?.companyName || 'Unknown';
                setQuotes(prev => {
                    const newState = prev.map(q => q.id === quoteId ? {...q, status: newStatus} : q);
                    idbSet('quotes', newState);
                    return newState;
                });
                addActivityLog({ actionType: 'UPDATE', entityType: 'Quote', entityId: quoteId, details: `Set quote for ${clientName} to "${newStatus}"` });
                markAsDirty();
            }
        },
        deleteQuote: (quoteId: string) => {
            const quote = quotes.find(q=>q.id === quoteId);
            if(quote) {
                 const clientName = clients.find(c => c.id === quote.clientId)?.companyName || 'Unknown';
                 setQuotes(prev => {
                     const newState = prev.filter(q => q.id !== quoteId);
                     idbSet('quotes', newState);
                     return newState;
                 });
                 addActivityLog({ actionType: 'HARD_DELETE', entityType: 'Quote', entityId: quoteId, details: `Deleted quote for "${clientName}"` });
                 markAsDirty();
            }
        },
        updateSettings, restoreBackup, deleteAllMockData,
        isScreensaverActive, isScreensaverEnabled, startScreensaver, exitScreensaver, toggleScreensaver,
        deferredPrompt, triggerInstallPrompt: () => deferredPrompt?.prompt(),
        confirmation, showConfirmation, showInfoModal, hideConfirmation,
        bookletModalState, closeBookletModal,
        pdfModalState, closePdfModal,
        quoteStartModal, openQuoteStartModal, closeQuoteStartModal,
        openDocument,
        activeTvContent, playTvContent, stopTvContent,
        storageProvider, lastConnectedProvider, isStorageConnected: storageProvider !== 'none', directoryHandle,
        connectToLocalProvider, connectToCloudProvider, connectToSharedUrl,
        disconnectFromStorage,
        reconnectLastProvider,
        clearLastConnectedProvider,
        saveFileToStorage, getFileUrl, syncStatus,
        saveDatabaseToLocal, loadDatabaseFromLocal, pushToCloud, pullFromCloud,
        testAndConnectProvider,
        trackBrandView, trackProductView,
        lastUpdated: settings.lastUpdated,
        theme, toggleTheme: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
        localVolume, setLocalVolume: (vol: number) => { setLocalVolume(vol); idbSet('localVolume', vol); },
        kioskId,
        setKioskId,
        kioskSessions,
        sendRemoteCommand,
        playTouchSound,
        isScreensaverPinModalOpen,
        setIsScreensaverPinModalOpen,
        apkDownloadUrl,
        backupProgress,
        setBackupProgress,
        createZipBackup,
        restoreZipBackup,
        uploadApk,
        fulfillingQuote,
        setFulfillingQuote,
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
