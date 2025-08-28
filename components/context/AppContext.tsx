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
} from '../../data/mockData.ts';
import type { Settings, Brand, Product, Catalogue, Pamphlet, ScreensaverAd, BackupData, AdminUser, ThemeColors, StorageProvider, ProductDocument, TvContent, Category, Client, Quote } from '../../types.ts';
import { idbGet, idbSet } from './idb.ts';

// --- PWA MANIFEST UTILITIES (placed outside component) ---
const resizeImage = (blob: Blob, size: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };
    img.src = url;
  });
};

const updatePwaManifest = async (logoUrl: string, getFileUrl: (src: string) => Promise<string>) => {
  try {
    const manifestLink = document.getElementById('manifest-link') as HTMLLinkElement;
    if (!manifestLink) return;

    // 1. Fetch original manifest
    const manifestResponse = await fetch('./manifest.json');
    const manifest = await manifestResponse.json();

    // 2. Fetch and process logo
    if (logoUrl) {
      const displayUrl = await getFileUrl(logoUrl);
      const imageResponse = await fetch(displayUrl);
      if (!imageResponse.ok) throw new Error(`Failed to fetch logo image at ${displayUrl}`);
      const imageBlob = await imageResponse.blob();

      const [icon192, icon512] = await Promise.all([
        resizeImage(imageBlob, 192),
        resizeImage(imageBlob, 512),
      ]);
      
      manifest.icons = [
        { src: icon192, type: 'image/png', sizes: '192x192', purpose: 'any maskable' },
        { src: icon512, type: 'image/png', sizes: '512x512', purpose: 'any maskable' },
      ];
    }

    // 3. Update manifest link
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const newManifestUrl = URL.createObjectURL(manifestBlob);
    
    // Clean up old blob URL if it exists to prevent memory leaks
    if (manifestLink.href.startsWith('blob:')) {
      URL.revokeObjectURL(manifestLink.href);
    }
    
    manifestLink.href = newManifestUrl;
    console.log('PWA Manifest updated with new logo.');

  } catch (error) {
    console.error('Failed to update PWA manifest:', error);
  }
};


// --- GENERAL UTILITY FUNCTIONS ---
function deepMerge<T>(target: T, source: Partial<T>): T {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceKey = key as keyof T;
            if (isObject(source[sourceKey])) {
                if (!(sourceKey in target)) {
                    (output as any)[sourceKey] = source[sourceKey];
                } else {
                    (output[sourceKey] as any) = deepMerge(target[sourceKey], source[sourceKey] as any);
                }
            } else {
                (output as any)[sourceKey] = source[sourceKey];
            }
        });
    }
    return output;
}

function isObject(item: any): item is object {
    return (item && typeof item === 'object' && !Array.isArray(item));
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
    if (readWrite) {
      options.mode = 'readwrite';
    } else {
      options.mode = 'read';
    }
    try {
        if ((await fileHandle.queryPermission(options)) === 'granted') return true;
        if ((await fileHandle.requestPermission(options)) === 'granted') return true;
    } catch (error) {
        console.error("Error verifying file system permissions:", error);
    }
    return false;
};

interface ConfirmationState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

interface BookletModalState {
  isOpen: boolean;
  title: string;
  imageUrls: string[];
}

interface PdfModalState {
  isOpen:boolean;
  url: string;
  title: string;
}

type DocumentType = ProductDocument | Catalogue | Pamphlet;

type ViewCounts = {
    brands: Record<string, number>;
    products: Record<string, number>;
};

type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced' | 'error';

interface AppContextType {
  // Setup
  isSetupComplete: boolean;
  completeSetup: () => void;

  // Data
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
  
  // Auth
  login: (userId: string, pin: string) => AdminUser | null;
  logout: () => void;

  // Updaters (CRUD)
  addBrand: (brand: Brand) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (brandId: string) => void; // Soft delete
  
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void; // Soft delete

  addCatalogue: (catalogue: Catalogue) => void;
  updateCatalogue: (catalogue: Catalogue) => void;
  deleteCatalogue: (catalogueId: string) => void;

  addPamphlet: (pamphlet: Pamphlet) => void;
  updatePamphlet: (pamphlet: Pamphlet) => void;
  deletePamphlet: (pamphletId: string) => void;

  addAd: (ad: ScreensaverAd) => void;
  updateAd: (ad: ScreensaverAd) => void;
  deleteAd: (adId: string) => void;

  addAdminUser: (user: AdminUser) => void;
  updateAdminUser: (user: AdminUser) => void;
  deleteAdminUser: (userId: string) => void;
  
  addTvContent: (content: TvContent) => void;
  updateTvContent: (content: TvContent) => void;
  deleteTvContent: (contentId: string) => void;

  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  addClient: (client: Client) => string;
  addQuote: (quote: Quote) => void;
  updateQuote: (quote: Quote) => void;
  toggleQuoteStatus: (quoteId: string) => void;

  updateSettings: (newSettings: Partial<Settings>) => void;
  restoreBackup: (data: Partial<BackupData>) => void;
  
  // Trash functions
  restoreBrand: (brandId: string) => void;
  permanentlyDeleteBrand: (brandId: string) => void;
  restoreProduct: (productId: string) => void;
  permanentlyDeleteProduct: (productId: string) => void;
  restoreCatalogue: (catalogueId: string) => void;
  permanentlyDeleteCatalogue: (catalogueId: string) => void;
  restorePamphlet: (pamphletId: string) => void;
  permanentlyDeletePamphlet: (pamphletId: string) => void;
  restoreTvContent: (contentId: string) => void;
  permanentlyDeleteTvContent: (contentId: string) => void;

  // Screensaver & Kiosk
  isScreensaverActive: boolean;
  isScreensaverEnabled: boolean;
  toggleScreensaver: () => void;
  exitScreensaver: () => void;
  localVolume: number;
  setLocalVolume: (volume: number) => void;
  activeTvContent: TvContent | null;
  playTvContent: (content: TvContent) => void;
  stopTvContent: () => void;

  // Global Modals
  pdfModalState: PdfModalState;
  bookletModalState: BookletModalState;
  clientDetailsModal: { isOpen: boolean };
  openDocument: (document: DocumentType, title: string) => void;
  closePdfModal: () => void;
  closeBookletModal: () => void;
  openClientDetailsModal: () => void;
  closeClientDetailsModal: () => void;
  confirmation: ConfirmationState;
  showConfirmation: (message: string, onConfirm: () => void) => void;
  hideConfirmation: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // PWA Install Prompt
  deferredPrompt: BeforeInstallPromptEvent | null;
  triggerInstallPrompt: () => Promise<void>;

  // Storage and Sync
  storageProvider: StorageProvider;
  connectToLocalProvider: () => Promise<void>;
  connectToCloudProvider: (provider: 'customApi') => void;
  connectToSharedUrl: (url: string) => void;
  disconnectFromStorage: (silent?: boolean) => void;
  isStorageConnected: boolean;
  directoryHandle: FileSystemDirectoryHandle | null;
  saveFileToStorage: (file: File) => Promise<string>;
  getFileUrl: (fileName: string) => Promise<string>;
  saveDatabaseToLocal: (isAutoSave?: boolean) => Promise<boolean>;
  loadDatabaseFromLocal: (isAutoSync?: boolean) => Promise<boolean>;
  pushToCloud: (isAutoSave?: boolean) => Promise<boolean>;
  pullFromCloud: (isAutoSync?: boolean) => Promise<boolean>;
  syncStatus: SyncStatus;

  // Analytics
  trackBrandView: (brandId: string) => void;
  trackProductView: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(initialValue);
  const isInitialized = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      try {
        const storedValue = await idbGet<T>(key);
        if (isMounted) {
          if (storedValue !== undefined) {
            // Deep merge for settings object to handle new properties added in updates
            if (key === 'settings' && isObject(initialValue) && isObject(storedValue)) {
               setState(deepMerge(initialValue as any, storedValue as any));
            } else {
               setState(storedValue);
            }
          }
          isInitialized.current = true;
        }
      } catch (error) {
        console.error(`Failed to load state for key "${key}" from IndexedDB.`, error);
        if(isMounted) isInitialized.current = true;
      }
    };
    loadState();
    return () => { isMounted = false };
  }, [key, initialValue]);

  useEffect(() => {
    if (isInitialized.current) {
      idbSet(key, state).catch(error => {
        console.error(`Failed to save state for key "${key}" to IndexedDB.`, error);
      });
    }
  }, [key, state]);

  return [state, setState];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSetupComplete, setIsSetupComplete] = usePersistentState<boolean>('isSetupComplete', false);
    const [brands, setBrands] = usePersistentState<Brand[]>('brands', initialBrands);
    const [products, setProducts] = usePersistentState<Product[]>('products', initialProducts);
    const [catalogues, setCatalogues] = usePersistentState<Catalogue[]>('catalogues', initialCatalogues);
    const [pamphlets, setPamphlets] = usePersistentState<Pamphlet[]>('pamphlets', initialPamphlets);
    const [settings, setSettings] = usePersistentState<Settings>('settings', initialSettings);
    const [screensaverAds, setScreensaverAds] = usePersistentState<ScreensaverAd[]>('screensaverAds', initialScreensaverAds);
    const [adminUsers, setAdminUsers] = usePersistentState<AdminUser[]>('adminUsers', initialAdminUsers);
    const [tvContent, setTvContent] = usePersistentState<TvContent[]>('tvContent', initialTvContent);
    const [categories, setCategories] = usePersistentState<Category[]>('categories', initialCategories);
    const [clients, setClients] = usePersistentState<Client[]>('clients', initialClients);
    const [quotes, setQuotes] = usePersistentState<Quote[]>('quotes', initialQuotes);
    const [viewCounts, setViewCounts] = usePersistentState<ViewCounts>('viewCounts', { brands: {}, products: {} });

    const [localVolume, setLocalVolume] = usePersistentState<number>('localVolume', 0.75);
    const [storageProvider, setStorageProvider] = usePersistentState<StorageProvider>('storageProvider', 'none');
    const [theme, setTheme] = usePersistentState<'light' | 'dark'>(
        'theme', 
        window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    );
    
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [isScreensaverEnabled, setIsScreensaverEnabled] = useState(true);
  const inactivityTimer = useRef<number | null>(null);

  const [pdfModalState, setPdfModalState] = useState<PdfModalState>({ isOpen: false, url: '', title: '' });
  const [bookletModalState, setBookletModalState] = useState<BookletModalState>({ isOpen: false, title: '', imageUrls: [] });
  const [clientDetailsModal, setClientDetailsModal] = useState({ isOpen: false });
  const [activeTvContent, setActiveTvContent] = useState<TvContent | null>(null);

  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  const blobUrlCache = useRef(new Map<string, string>());
  const fileHandleCache = useRef(new Map<string, FileSystemFileHandle>());
  const autoSaveTimer = useRef<number | null>(null);
  
  const completeSetup = useCallback(() => {
    setIsSetupComplete(true);
  }, [setIsSetupComplete]);

   const saveDatabaseToLocal = useCallback(async (isAutoSave = false): Promise<boolean> => {
        if (!directoryHandle) {
            if(!isAutoSave) alert("Not connected to a local folder.");
            return false;
        }
        try {
            await directoryHandle.getFileHandle('database.lock');
            if(!isAutoSave) alert("Error: A sync operation is already in progress. A 'database.lock' file was found. If this is an error, please remove the file manually from the shared folder and try again.");
            return false;
        } catch (e) {
            if (!(e instanceof DOMException && e.name === 'NotFoundError')) throw e;
        }

        let lockFileHandle;
        try {
            lockFileHandle = await directoryHandle.getFileHandle('database.lock', { create: true });
            const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts };
            const dataFileHandle = await directoryHandle.getFileHandle('database.json', { create: true });
            const writable = await dataFileHandle.createWritable();
            await writable.write(JSON.stringify(backupData, null, 2));
            await writable.close();
            return true;
        } catch (error) {
            console.error("Failed to save database to local folder:", error);
            if(!isAutoSave) alert(`Error saving data: ${error instanceof Error ? error.message : "Unknown error"}`);
            return false;
        } finally {
            if (lockFileHandle) {
                await directoryHandle.removeEntry('database.lock');
            }
        }
    }, [directoryHandle, brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts]);
    
    const getCloudUrl = useCallback(() => {
        if (storageProvider === 'customApi') return settings.customApiUrl;
        if (storageProvider === 'sharedUrl') return settings.sharedUrl;
        return null;
    }, [storageProvider, settings]);

    const pushToCloud = useCallback(async (isAutoSave = false): Promise<boolean> => {
        const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts };
        const url = getCloudUrl();
        if (!url) {
            if(!isAutoSave) alert('Not connected to a cloud provider.');
            return false;
        }
        
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (settings.customApiKey) headers['x-api-key'] = settings.customApiKey;
            const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(backupData) });
            if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
            return true;
        } catch (error) {
            if(!isAutoSave) alert(`Error pushing data to cloud: ${error instanceof Error ? error.message : "Unknown error"}`);
            return false;
        }
    }, [getCloudUrl, brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, clients, quotes, viewCounts]);


    const performAutoSave = useCallback(async () => {
        setSyncStatus('syncing');
        let success = false;
        if (storageProvider === 'local') {
            success = await saveDatabaseToLocal(true);
        } else if (storageProvider === 'customApi' || storageProvider === 'sharedUrl') {
            success = await pushToCloud(true);
        }
        
        if (success) {
            setSyncStatus('synced');
        } else {
            setSyncStatus('error');
        }
    }, [storageProvider, saveDatabaseToLocal, pushToCloud]);
    
    const debouncedAutoSave = useCallback(() => {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = window.setTimeout(() => {
            performAutoSave();
        }, 2500);
    }, [performAutoSave]);

  const updateDataTimestamp = useCallback(() => {
    setSettings(prev => {
        const newState = { ...prev, lastUpdated: Date.now() };
        if (newState.sync?.autoSyncEnabled && storageProvider !== 'none') {
            setSyncStatus('pending');
            debouncedAutoSave();
        }
        return newState;
    });
  }, [storageProvider, debouncedAutoSave, setSettings, setSyncStatus]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const mergedState = deepMerge(prev, newSettings);
      // This is basically an inline, combined version of the old updateSettings + updateDataTimestamp
      const newState = { ...mergedState, lastUpdated: Date.now() };
      
      if (newState.sync?.autoSyncEnabled && storageProvider !== 'none') {
          setSyncStatus('pending');
          debouncedAutoSave();
      }
      
      return newState;
    });
  }, [storageProvider, debouncedAutoSave, setSyncStatus, setSettings]);

  const restoreBackup = useCallback((data: Partial<BackupData>) => {
    // Note: The `|| initial...` is a fallback for corrupted/incomplete backup files.
    setBrands(Array.isArray(data.brands) ? data.brands : initialBrands);
    setProducts(Array.isArray(data.products) ? data.products : initialProducts);
    setCatalogues(Array.isArray(data.catalogues) ? data.catalogues : initialCatalogues);
    setPamphlets(Array.isArray(data.pamphlets) ? data.pamphlets : initialPamphlets);
    setScreensaverAds(Array.isArray(data.screensaverAds) ? data.screensaverAds : initialScreensaverAds);
    setAdminUsers(Array.isArray(data.adminUsers) ? data.adminUsers : initialAdminUsers);
    setTvContent(Array.isArray(data.tvContent) ? data.tvContent : initialTvContent);
    setCategories(Array.isArray(data.categories) ? data.categories : initialCategories);
    setClients(Array.isArray(data.clients) ? data.clients : initialClients);
    setQuotes(Array.isArray(data.quotes) ? data.quotes : initialQuotes);
    setViewCounts(data.viewCounts || { brands: {}, products: {} });
    
    // Cloud DBs might return settings as an array with one item, file backups as an object.
    // This handles both, preferring a direct object.
    const settingsSource = Array.isArray(data.settings) ? data.settings[0] : data.settings;
    if (settingsSource && isObject(settingsSource)) {
        setSettings(prev => deepMerge(prev, settingsSource as Partial<Settings>));
    } else {
        setSettings(initialSettings);
    }
  }, [setBrands, setProducts, setCatalogues, setPamphlets, setScreensaverAds, setAdminUsers, setSettings, setTvContent, setCategories, setClients, setQuotes, setViewCounts]);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, [setTheme]);
  
    useEffect(() => {
        const rootStyle = document.documentElement.style;
        const activeTheme: ThemeColors | undefined = theme === 'light' ? settings.lightTheme : settings.darkTheme;
        if (!activeTheme) return; 

        rootStyle.setProperty('--app-bg', activeTheme.appBg);
        rootStyle.setProperty('--app-bg-image', activeTheme.appBgImage);
        rootStyle.setProperty('--main-bg', activeTheme.mainBg);
        rootStyle.setProperty('--main-text', activeTheme.mainText);
        rootStyle.setProperty('--main-shadow', activeTheme.mainShadow);
        rootStyle.setProperty('--primary-color', activeTheme.primary);
        rootStyle.setProperty('--btn-primary-bg', activeTheme.primaryButton.background);
        rootStyle.setProperty('--btn-primary-text', activeTheme.primaryButton.text);
        rootStyle.setProperty('--btn-primary-hover-bg', activeTheme.primaryButton.hoverBackground);
        rootStyle.setProperty('--btn-destructive-bg', activeTheme.destructiveButton.background);
        rootStyle.setProperty('--btn-destructive-text', activeTheme.destructiveButton.text);
        rootStyle.setProperty('--btn-destructive-hover-bg', activeTheme.destructiveButton.hoverBackground);
        
        const { typography, header, footer, pamphletPlaceholder } = settings;
        if (!typography || !header || !footer || !pamphletPlaceholder) return; 
        
        const { body, headings, itemTitles } = typography;
        rootStyle.setProperty('--body-font-family', body.fontFamily);
        rootStyle.setProperty('--body-font-weight', body.fontWeight);
        rootStyle.setProperty('--body-font-style', body.fontStyle);
        rootStyle.setProperty('--body-font-decoration', body.textDecoration);
        rootStyle.setProperty('--headings-font-family', headings.fontFamily);
        rootStyle.setProperty('--headings-font-weight', headings.fontWeight);
        rootStyle.setProperty('--headings-font-style', headings.fontStyle);
        rootStyle.setProperty('--headings-font-decoration', headings.textDecoration);
        rootStyle.setProperty('--item-titles-font-family', itemTitles.fontFamily);
        rootStyle.setProperty('--item-titles-font-weight', itemTitles.fontWeight);
        rootStyle.setProperty('--item-titles-font-style', itemTitles.fontStyle);
        rootStyle.setProperty('--item-titles-font-decoration', itemTitles.textDecoration);
        
        const fontsToLoad = new Set([
            body.fontFamily, headings.fontFamily, itemTitles.fontFamily,
            header.typography.fontFamily, footer.typography.fontFamily,
            pamphletPlaceholder.font.fontFamily,
        ]);
        fontsToLoad.forEach(font => font && loadFont(font));
    }, [settings, theme]);

  const toggleScreensaver = () => setIsScreensaverEnabled(prev => !prev);
  const exitScreensaver = useCallback(() => setIsScreensaverActive(false), []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (isScreensaverEnabled && settings.screensaverDelay > 0 && !activeTvContent) {
      inactivityTimer.current = window.setTimeout(() => {
        if(document.visibilityState === 'visible') setIsScreensaverActive(true);
      }, settings.screensaverDelay * 1000);
    }
  }, [settings.screensaverDelay, isScreensaverEnabled, activeTvContent]);

  const handleUserActivity = useCallback(() => {
    if (isScreensaverActive) exitScreensaver();
    resetInactivityTimer();
  }, [isScreensaverActive, resetInactivityTimer, exitScreensaver]);
  
  useEffect(() => {
    resetInactivityTimer();
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleUserActivity));
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [handleUserActivity, resetInactivityTimer, isScreensaverEnabled]);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('kiosk-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (adminUsers.find(u => u.id === user.id)) {
            setLoggedInUser(user);
        } else {
            sessionStorage.removeItem('kiosk-user');
        }
      }
    } catch (e) {
      console.error("Failed to parse user from session storage", e);
      sessionStorage.removeItem('kiosk-user');
    }
  }, [adminUsers]);

  const login = useCallback((userId: string, pin: string): AdminUser | null => {
    const user = adminUsers.find(u => u.id === userId && u.pin === pin);
    if (user) {
        setLoggedInUser(user);
        sessionStorage.setItem('kiosk-user', JSON.stringify(user));
        return user;
    }
    return null;
  }, [adminUsers]);

  const logout = useCallback(() => {
      setLoggedInUser(null);
      sessionStorage.removeItem('kiosk-user');
  }, []);
  
  const addBrand = useCallback((b: Brand) => { setBrands(p => [...p, b]); updateDataTimestamp(); }, [setBrands, updateDataTimestamp]);
  const updateBrand = useCallback((b: Brand) => { setBrands(p => p.map(i => i.id === b.id ? b : i)); updateDataTimestamp(); }, [setBrands, updateDataTimestamp]);
  const deleteBrand = useCallback((brandId: string) => { setBrands(prev => prev.map(b => b.id === brandId ? { ...b, isDeleted: true } : b)); updateDataTimestamp(); }, [setBrands, updateDataTimestamp]);
  
  const addProduct = useCallback((p: Product) => { setProducts(prev => [...prev, p]); updateDataTimestamp(); }, [setProducts, updateDataTimestamp]);
  const updateProduct = useCallback((p: Product) => { setProducts(prev => prev.map(i => i.id === p.id ? p : i)); updateDataTimestamp(); }, [setProducts, updateDataTimestamp]);
  const deleteProduct = useCallback((productId: string) => { setProducts(prev => prev.map(p => p.id === productId ? { ...p, isDeleted: true } : p)); updateDataTimestamp(); }, [setProducts, updateDataTimestamp]);

  const restoreBrand = useCallback((brandId: string) => {
    setBrands(prev => prev.map(b => b.id === brandId ? { ...b, isDeleted: false } : b));
    setProducts(prev => prev.map(p => p.brandId === brandId ? { ...p, isDeleted: false } : p));
    updateDataTimestamp();
  }, [setBrands, setProducts, updateDataTimestamp]);

  const permanentlyDeleteBrand = useCallback((brandId: string) => {
    setBrands(p => p.filter(i => i.id !== brandId));
    setProducts(p => p.filter(prod => prod.brandId !== brandId));
    setCatalogues(p => p.filter(c => c.brandId !== brandId));
    setCategories(p => p.filter(c => c.brandId !== brandId));
    updateDataTimestamp();
  }, [setBrands, setProducts, setCatalogues, setCategories, updateDataTimestamp]);
  
  const restoreProduct = useCallback((productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, isDeleted: false } : p));
    updateDataTimestamp();
  }, [setProducts, updateDataTimestamp]);

  const permanentlyDeleteProduct = useCallback((productId: string) => {
    setProducts(p => p.filter(i => i.id !== productId));
    updateDataTimestamp();
  }, [setProducts, updateDataTimestamp]);

  const addCatalogue = useCallback((c: Catalogue) => { setCatalogues(p => [...p, c]); updateDataTimestamp(); }, [setCatalogues, updateDataTimestamp]);
  const updateCatalogue = useCallback((c: Catalogue) => { setCatalogues(p => p.map(i => i.id === c.id ? c : i)); updateDataTimestamp(); }, [setCatalogues, updateDataTimestamp]);
  const deleteCatalogue = useCallback((id: string) => { setCatalogues(p => p.map(i => i.id === id ? { ...i, isDeleted: true } : i)); updateDataTimestamp(); }, [setCatalogues, updateDataTimestamp]);
  
  const addPamphlet = useCallback((p: Pamphlet) => { setPamphlets(prev => [...prev, p]); updateDataTimestamp(); }, [setPamphlets, updateDataTimestamp]);
  const updatePamphlet = useCallback((p: Pamphlet) => { setPamphlets(prev => prev.map(i => i.id === p.id ? p : i)); updateDataTimestamp(); }, [setPamphlets, updateDataTimestamp]);
  const deletePamphlet = useCallback((id: string) => { setPamphlets(p => p.map(i => i.id === id ? { ...i, isDeleted: true } : i)); updateDataTimestamp(); }, [setPamphlets, updateDataTimestamp]);
  
  const addAd = useCallback((a: ScreensaverAd) => { setScreensaverAds(p => [...p, a]); updateDataTimestamp(); }, [setScreensaverAds, updateDataTimestamp]);
  const updateAd = useCallback((a: ScreensaverAd) => { setScreensaverAds(p => p.map(i => i.id === a.id ? a : i)); updateDataTimestamp(); }, [setScreensaverAds, updateDataTimestamp]);
  const deleteAd = useCallback((id: string) => { setScreensaverAds(p => p.filter(i => i.id !== id)); updateDataTimestamp(); }, [setScreensaverAds, updateDataTimestamp]);
  
  const addAdminUser = useCallback((u: AdminUser) => {
      setAdminUsers(p => [...p, u]);
      updateDataTimestamp();
  }, [setAdminUsers, updateDataTimestamp]);

  const updateAdminUser = useCallback((u: AdminUser) => {
      setAdminUsers(p => p.map(i => i.id === u.id ? u : i));
      if (loggedInUser?.id === u.id) {
          setLoggedInUser(u);
          sessionStorage.setItem('kiosk-user', JSON.stringify(u));
      }
      updateDataTimestamp();
  }, [setAdminUsers, updateDataTimestamp, loggedInUser]);
  
  const deleteAdminUser = useCallback((id: string) => { if (loggedInUser?.id === id) { alert("Cannot delete self."); return; } setAdminUsers(p => p.filter(i => i.id !== id)); updateDataTimestamp(); }, [loggedInUser, setAdminUsers, updateDataTimestamp]);
  
  const addTvContent = useCallback((c: TvContent) => { setTvContent(p => [...p, c]); updateDataTimestamp(); }, [setTvContent, updateDataTimestamp]);
  const updateTvContent = useCallback((c: TvContent) => { setTvContent(p => p.map(i => i.id === c.id ? c : i)); updateDataTimestamp(); }, [setTvContent, updateDataTimestamp]);
  const deleteTvContent = useCallback((id: string) => { setTvContent(p => p.map(i => i.id === id ? { ...i, isDeleted: true } : i)); updateDataTimestamp(); }, [setTvContent, updateDataTimestamp]);

  const addCategory = useCallback((c: Category) => { setCategories(p => [...p, c]); updateDataTimestamp(); }, [setCategories, updateDataTimestamp]);
  const updateCategory = useCallback((c: Category) => { setCategories(p => p.map(i => i.id === c.id ? c : i)); updateDataTimestamp(); }, [setCategories, updateDataTimestamp]);
  const deleteCategory = useCallback((id: string) => { setCategories(p => p.map(i => i.id === id ? { ...i, isDeleted: true } : i)); updateDataTimestamp(); }, [setCategories, updateDataTimestamp]);

  const addClient = useCallback((c: Client): string => { setClients(p => [...p, c]); updateDataTimestamp(); return c.id; }, [setClients, updateDataTimestamp]);
  const addQuote = useCallback((q: Quote) => { setQuotes(p => [...p, { ...q, status: 'pending' }]); updateDataTimestamp(); }, [setQuotes, updateDataTimestamp]);
  const updateQuote = useCallback((q: Quote) => { setQuotes(p => p.map(i => i.id === q.id ? q : i)); updateDataTimestamp(); }, [setQuotes, updateDataTimestamp]);
  const toggleQuoteStatus = useCallback((quoteId: string) => {
    setQuotes(prev => prev.map(q => {
        if (q.id === quoteId) {
            return { ...q, status: q.status === 'pending' ? 'quoted' : 'pending' };
        }
        return q;
    }));
    updateDataTimestamp();
  }, [setQuotes, updateDataTimestamp]);


  const restoreCatalogue = useCallback((id: string) => {
    setCatalogues(prev => prev.map(c => c.id === id ? { ...c, isDeleted: false } : c));
    updateDataTimestamp();
  }, [setCatalogues, updateDataTimestamp]);

  const permanentlyDeleteCatalogue = useCallback((id: string) => {
    setCatalogues(p => p.filter(i => i.id !== id));
    updateDataTimestamp();
  }, [setCatalogues, updateDataTimestamp]);

  const restorePamphlet = useCallback((id: string) => {
    setPamphlets(prev => prev.map(p => p.id === id ? { ...p, isDeleted: false } : p));
    updateDataTimestamp();
  }, [setPamphlets, updateDataTimestamp]);

  const permanentlyDeletePamphlet = useCallback((id: string) => {
    setPamphlets(p => p.filter(i => i.id !== id));
    updateDataTimestamp();
  }, [setPamphlets, updateDataTimestamp]);

  const restoreTvContent = useCallback((id: string) => {
    setTvContent(prev => prev.map(tc => tc.id === id ? { ...tc, isDeleted: false } : tc));
    updateDataTimestamp();
  }, [setTvContent, updateDataTimestamp]);

  const permanentlyDeleteTvContent = useCallback((id: string) => {
    setTvContent(p => p.filter(i => i.id !== id));
    updateDataTimestamp();
  }, [setTvContent, updateDataTimestamp]);

  const playTvContent = useCallback((content: TvContent) => {
    setIsScreensaverActive(false);
    setActiveTvContent(content);
  }, []);

  const stopTvContent = useCallback(() => {
    setActiveTvContent(null);
    resetInactivityTimer();
  }, [resetInactivityTimer]);
  
  const disconnectFromStorage = useCallback((silent = false) => {
    idbSet('directoryHandle', undefined);
    setStorageProvider('none');
    setDirectoryHandle(null);
    blobUrlCache.current.forEach(url => URL.revokeObjectURL(url));
    blobUrlCache.current.clear();
    fileHandleCache.current.clear();
    if (!silent) {
        alert("Disconnected from storage provider.");
    }
  }, [setStorageProvider]);

  // Effect to load persisted directory handle on mount
  useEffect(() => {
    const loadHandle = async () => {
        if (storageProvider === 'local' && !directoryHandle) {
            const handle = await idbGet<FileSystemDirectoryHandle>('directoryHandle');
            if (handle) {
                const hasPermission = await verifyPermission(handle, false);
                if (hasPermission) {
                    console.log("Restored directory handle from IndexedDB.");
                    setDirectoryHandle(handle);
                } else {
                    console.warn("Permission for stored directory handle was lost. User will be re-prompted on next file access.");
                    setDirectoryHandle(handle); // Still set the handle, let operations re-verify
                }
            }
        }
    };
    loadHandle();
  }, [storageProvider, directoryHandle]);

  const getFileUrl = useCallback(async (src: string): Promise<string> => {
    if (!src) return '';
    if (src.startsWith('http') || src.startsWith('data:')) return src;

    if (blobUrlCache.current.has(src)) {
        const cachedUrl = blobUrlCache.current.get(src)!;
        try {
            const response = await fetch(cachedUrl, { method: 'HEAD' });
            if (response.ok) return cachedUrl;
        } catch (e) {}
        URL.revokeObjectURL(cachedUrl);
        blobUrlCache.current.delete(src);
    }
    
    if (storageProvider === 'local' && directoryHandle) {
        try {
            let handle = fileHandleCache.current.get(src);
            if (!handle) {
                if (!(await verifyPermission(directoryHandle, false))) {
                    alert("Permission to access local files was denied. Some media may not load. Please try the action again to grant access.");
                    return '';
                }
                handle = await directoryHandle.getFileHandle(src);
                fileHandleCache.current.set(src, handle);
            }
            const file = await handle.getFile();
            const newBlobUrl = URL.createObjectURL(file);
            blobUrlCache.current.set(src, newBlobUrl);
            return newBlobUrl;
        } catch (error) {
            console.error(`Error getting local file handle for "${src}":`, error);
            return '';
        }
    }
    
    return '';
  }, [storageProvider, directoryHandle]);

  const openDocument = useCallback(async (document: DocumentType, title: string) => {
    setIsScreensaverActive(false);
    
    switch(document.type) {
        case 'pdf': {
            let displayUrl = '';
            if (document.url.startsWith('data:application/pdf')) {
                displayUrl = document.url;
            } else {
                displayUrl = await getFileUrl(document.url);
            }
            
            if (displayUrl) {
                setPdfModalState({ isOpen: true, url: displayUrl, title });
            } else {
                alert("Could not load the PDF document.");
            }
            break;
        }
        case 'image':
            if (document.imageUrls && document.imageUrls.length > 0) {
                setBookletModalState({ isOpen: true, title, imageUrls: document.imageUrls });
            } else {
                alert("This document has no images to display.");
            }
            break;
    }
  }, [getFileUrl]);

  const closePdfModal = useCallback(() => {
    if (pdfModalState.url.startsWith('blob:')) {
        URL.revokeObjectURL(pdfModalState.url);
    }
    setPdfModalState({ isOpen: false, url: '', title: '' });
  }, [pdfModalState.url]);

  const closeBookletModal = useCallback(() => setBookletModalState({ isOpen: false, title: '', imageUrls: [] }), []);

  const openClientDetailsModal = useCallback(() => setClientDetailsModal({ isOpen: true }), []);
  const closeClientDetailsModal = useCallback(() => setClientDetailsModal({ isOpen: false }), []);


  const showConfirmation = useCallback((message: string, onConfirm: () => void) => {
    setConfirmation({ isOpen: true, message, onConfirm });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  }, []);

  const connectToLocalProvider = useCallback(async () => {
    if (!window.showDirectoryPicker) {
        alert("Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge on a desktop computer.");
        return;
    }
    const isSuperAdmin = loggedInUser?.isMainAdmin ?? false;
    const mode: 'read' | 'readwrite' = isSuperAdmin ? 'readwrite' : 'read';
    const writePermissionRequired = mode === 'readwrite';
    
    try {
        const handle = await window.showDirectoryPicker({ mode });
        if (await verifyPermission(handle, writePermissionRequired)) {
            disconnectFromStorage(true);
            await idbSet('directoryHandle', handle);
            setDirectoryHandle(handle);
            setStorageProvider('local');
            
            setSettings(prev => deepMerge(prev, { sync: { autoSyncEnabled: true } }));

            setTimeout(() => {
                saveDatabaseToLocal(true).then(success => {
                    if (success) {
                        alert(`Connected to local folder "${handle.name}" in ${mode} mode. Auto-save is enabled. Initial data saved.`);
                        setSyncStatus('synced');
                    } else {
                        alert(`Connected to local folder "${handle.name}", but the initial data save failed. Please check permissions and try a manual save.`);
                        setSyncStatus('error');
                    }
                });
            }, 100);

        } else {
            alert("Permission to the folder was denied.");
        }
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error("Error connecting to local folder:", error);
        alert(`Failed to connect to local folder. ${error instanceof Error ? error.message : ''}`);
    }
  }, [setStorageProvider, disconnectFromStorage, loggedInUser, setSettings, saveDatabaseToLocal]);
  
  const connectToCloudProvider = useCallback((provider: 'customApi') => {
    const url = settings.customApiUrl;
    if (!url) {
        alert(`Please set the Custom API URL in the Settings > API Integrations tab first.`);
        return;
    }
    disconnectFromStorage(true);
    setStorageProvider(provider);
    
    setSettings(prev => deepMerge(prev, { sync: { autoSyncEnabled: true } }));
    
    setTimeout(() => {
        pushToCloud(true).then(success => {
            if (success) {
                alert(`Connected to Custom API. Auto-sync is enabled. Initial data saved to cloud.`);
                setSyncStatus('synced');
            } else {
                 alert(`Connected to Custom API, but the initial data save failed. Please check your connection and try a manual push.`);
                 setSyncStatus('error');
            }
        });
    }, 100);
  }, [settings.customApiUrl, setStorageProvider, disconnectFromStorage, setSettings, pushToCloud]);
  
  const connectToSharedUrl = useCallback((url: string) => {
    if (!url) {
        alert(`Please provide a valid URL.`);
        return;
    }
    
    disconnectFromStorage(true);
    
    setSettings(prev => deepMerge(prev, { sharedUrl: url, sync: { autoSyncEnabled: true } }));
    setStorageProvider('sharedUrl');
    
    setTimeout(() => {
        pushToCloud(true).then(success => {
            if (success) {
                alert(`Connected to Shared URL. Auto-sync is enabled. Initial data saved to cloud.`);
                setSyncStatus('synced');
            } else {
                 alert(`Connected to Shared URL, but the initial data save failed. Please check your connection and try a manual push.`);
                 setSyncStatus('error');
            }
        });
    }, 100);
  }, [setStorageProvider, disconnectFromStorage, setSettings, pushToCloud]);
  
  const saveFileToStorage = useCallback(async (file: File): Promise<string> => {
    // Always convert to a base64 data URI. This makes the database fully
    // self-contained and portable, ensuring that all media assets are included
    // during any sync operation (local file save or cloud push). This resolves
    // issues where file references would break when switching between storage providers.
    return fileToBase64(file);
  }, []);
  
  const isStorageConnected = storageProvider !== 'none';
  
  const loadDatabaseFromLocal = useCallback(async (isAutoSync = false): Promise<boolean> => {
    if (!directoryHandle) {
        if (!isAutoSync) alert("Not connected to a local folder.");
        return false;
    }
    try {
        const fileHandle = await directoryHandle.getFileHandle('database.json');
        const file = await fileHandle.getFile();
        const text = await file.text();
        const data = JSON.parse(text);

        const remoteSettings = Array.isArray(data.settings) ? data.settings[0] : data.settings;
        if (isAutoSync && remoteSettings?.lastUpdated && settings.lastUpdated && remoteSettings.lastUpdated <= settings.lastUpdated) {
             console.log('Background sync (Local): No new data found.');
             return true; // Still a success, just no change
        }

        restoreBackup(data);
        if (!isAutoSync) {
            alert("Data successfully loaded from the connected folder.");
        }
        return true;
    } catch (error) {
        if (isAutoSync) {
            console.error('Background sync (Local) failed:', error);
        } else {
            console.error("Failed to load database from local folder:", error);
            alert(`Error loading data: ${error instanceof Error ? error.message : "database.json not found or is invalid."}`);
        }
        return false;
    }
  }, [directoryHandle, restoreBackup, settings]);
  
  const pullFromCloud = useCallback(async (isAutoSync = false): Promise<boolean> => {
    const url = getCloudUrl();
    if (!url) {
        if (!isAutoSync) alert("Not connected to a cloud provider.");
        return false;
    }
      try {
          const headers: HeadersInit = {};
          if (settings.customApiKey) headers['x-api-key'] = settings.customApiKey;
          const response = await fetch(url, { headers, cache: 'no-store' });
          if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
          
          const data = await response.json();
          const remoteSettings = Array.isArray(data.settings) ? data.settings[0] : data.settings;
          if (isAutoSync && remoteSettings?.lastUpdated && settings.lastUpdated && remoteSettings.lastUpdated <= settings.lastUpdated) {
               console.log('Background sync (Cloud): No new data found.');
               return true;
          }
          
          restoreBackup(data);
          if (!isAutoSync) {
            alert("Data successfully pulled from the cloud.");
          }
          return true;
      } catch (error) {
          if (isAutoSync) {
            console.error('Background sync (Cloud) failed:', error);
          } else {
            alert(`Error pulling data from cloud: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
          return false;
      }
  }, [getCloudUrl, restoreBackup, settings]);

  // Live Sync Polling for Local/Network Drive
  useEffect(() => {
    if (storageProvider !== 'local' || !directoryHandle) return;

    const LIVE_SYNC_INTERVAL_MS = 5000; // 5 seconds
    
    console.log('Starting live sync polling for local/network drive.');
    const intervalId = setInterval(() => {
        loadDatabaseFromLocal(true);
    }, LIVE_SYNC_INTERVAL_MS);

    loadDatabaseFromLocal(true); // Initial check

    return () => {
        console.log('Clearing live sync interval for local/network drive.');
        clearInterval(intervalId);
    };
  }, [storageProvider, directoryHandle, loadDatabaseFromLocal]);

  // Live Sync Polling for Cloud Providers
  useEffect(() => {
    if (storageProvider !== 'customApi' && storageProvider !== 'sharedUrl') return;
    
    const LIVE_SYNC_INTERVAL_MS = 5000; // 5 seconds

    console.log('Starting live sync polling for cloud provider.');
    const intervalId = setInterval(() => {
        pullFromCloud(true);
    }, LIVE_SYNC_INTERVAL_MS);

    pullFromCloud(true); // Initial check

    return () => {
        console.log('Clearing live sync interval for cloud provider.');
        clearInterval(intervalId);
    };
  }, [storageProvider, pullFromCloud]);

  // PWA Install prompt
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);
  
  // Dynamic PWA Manifest updater
  const lastUpdatedLogoUrl = useRef<string | null>(null);
  useEffect(() => {
    if (settings.logoUrl && settings.logoUrl !== lastUpdatedLogoUrl.current) {
        updatePwaManifest(settings.logoUrl, getFileUrl);
        lastUpdatedLogoUrl.current = settings.logoUrl;
    }
  }, [settings.logoUrl, getFileUrl]);

  const triggerInstallPrompt = useCallback(async () => {
    if (!deferredPrompt) {
      alert('The app cannot be installed right now. Please try again later.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const trackBrandView = useCallback((brandId: string) => {
    setViewCounts(prev => ({
        ...prev,
        brands: {
            ...prev.brands,
            [brandId]: (prev.brands[brandId] || 0) + 1,
        }
    }));
  }, [setViewCounts]);

  const trackProductView = useCallback((productId: string) => {
    setViewCounts(prev => ({
        ...prev,
        products: {
            ...prev.products,
            [productId]: (prev.products[productId] || 0) + 1,
        }
    }));
  }, [setViewCounts]);

  return (
    <AppContext.Provider value={{
        isSetupComplete, completeSetup,
        brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, loggedInUser, tvContent, categories, clients, quotes, viewCounts,
        login, logout,
        addBrand, updateBrand, deleteBrand,
        addProduct, updateProduct, deleteProduct,
        addCatalogue, updateCatalogue, deleteCatalogue,
        addPamphlet, updatePamphlet, deletePamphlet,
        addAd, updateAd, deleteAd,
        addAdminUser, updateAdminUser, deleteAdminUser,
        addTvContent, updateTvContent, deleteTvContent,
        addCategory, updateCategory, deleteCategory,
        addClient, addQuote, updateQuote, toggleQuoteStatus,
        updateSettings, restoreBackup,
        restoreBrand, permanentlyDeleteBrand, restoreProduct, permanentlyDeleteProduct,
        restoreCatalogue, permanentlyDeleteCatalogue, restorePamphlet, permanentlyDeletePamphlet,
        restoreTvContent, permanentlyDeleteTvContent,
        isScreensaverActive, isScreensaverEnabled, toggleScreensaver, exitScreensaver,
        localVolume, setLocalVolume: setLocalVolume,
        activeTvContent, playTvContent, stopTvContent,
        pdfModalState, bookletModalState, clientDetailsModal, openDocument, closePdfModal, closeBookletModal, openClientDetailsModal, closeClientDetailsModal,
        confirmation, showConfirmation, hideConfirmation,
        theme, toggleTheme,
        deferredPrompt, triggerInstallPrompt,
        storageProvider, connectToLocalProvider, connectToCloudProvider, connectToSharedUrl,
        disconnectFromStorage, isStorageConnected, directoryHandle,
        saveFileToStorage, getFileUrl,
        saveDatabaseToLocal, loadDatabaseFromLocal,
        pushToCloud, pullFromCloud,
        syncStatus,
        trackBrandView, trackProductView,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};