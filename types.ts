export type ProductDocument =
  | { id: string; title: string; type: 'image'; imageUrls: string[]; }
  | { id:string; title: string; type: 'pdf'; url: string; };


export type Pamphlet = {
  id: string;
  title: string;
  imageUrl: string; // The cover image
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isDeleted?: boolean;
} & { type: 'image'; imageUrls: string[]; };

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  isTvBrand?: boolean;
  isDeleted?: boolean;
}


export type Catalogue = {
  id:string;
  title: string;
  thumbnailUrl: string;
  brandId?: string;
  year: number;
  isDeleted?: boolean;
} & { type: 'image'; imageUrls: string[]; };

export interface Category {
  id: string;
  name: string;
  brandId: string;
  isDeleted?: boolean;
}

export interface Product {
  id:string;
  name: string;
  sku: string;
  description: string;
  images: string[];
  specifications: { id: string; key: string; value: string; }[];
  documents?: ProductDocument[];
  video?: string;
  websiteUrl?: string;
  brandId: string;
  categoryId?: string;
  isDiscontinued?: boolean;
  isDeleted?: boolean;
  whatsInTheBox?: string[];
  termsAndConditions?: string;
}

export interface FontStyleSettings {
  fontFamily: string;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  letterSpacing: string; // e.g., 'normal', '0.1em'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface CustomElementSettings {
  backgroundColor: string;
  textColor: string;
  backgroundImageUrl: string;
  backgroundImageOpacity: number; // 0 to 1
  effect: 'none' | 'glassmorphism' | '3d-shadow';
}

export interface ThemeColors {
  appBg: string;
  appBgImage: string;
  mainBg: string;
  mainText: string;
  mainShadow: string;
  mainBorder: string;
  primary: string;
  primaryButton: {
    background: string;
    text: string;
    hoverBackground: string;
  };
  destructiveButton: {
    background: string;
    text: string;
    hoverBackground: string;
  };
}

export interface NavLink {
  id: string;
  label: string;
  path: string;
  enabled: boolean;
}

export interface KioskProfile {
  id: string; // The unique kiosk identifier
  name: string; // The user-friendly, editable name
}

export interface CreatorProfile {
  enabled: boolean;
  name: string;
  title: string;
  imageUrl: string; // Avatar in popup
  logoUrlLight?: string;
  logoUrlDark?: string;
  phone: string;
  email: string;
  website: string;
  websiteText: string;
  whatsapp: string;
}

export type ScreensaverTransitionEffect = 'fade' | 'slide' | 'scale' | 'slide-fade' | 'gentle-drift' | 'reveal-blur' | 'slide-up' | 'zoom-in' | 'slow-pan';


export interface Settings {
  appName: string;
  appDescription: string;
  logoUrl: string;
  pwaIconUrl?: string;
  sharedUrl?: string;
  customApiUrl: string;
  customApiKey: string;
  lightTheme: ThemeColors;
  darkTheme: ThemeColors;
  screensaverDelay: number; // in seconds
  videoVolume: number; // 0 to 1
  backgroundMusicUrl: string;
  backgroundMusicVolume: number; // 0 to 1
  touchSoundUrl: string;
  screensaverImageDuration: number; // in seconds
  screensaverTransitionEffect: ScreensaverTransitionEffect;
  screensaverTouchPromptText: string;
  screensaverContentSource: 'products_and_ads' | 'ads_only';
  screensaverItemsPerPrompt: number;
  screensaverShowClock: boolean;
  screensaverShowProductInfo: boolean;
  screensaverProductInfoStyle: 'overlay' | 'banner';
  typography: {
    googleFontUrl: string;
    body: FontStyleSettings;
    headings: FontStyleSettings;
    itemTitles: FontStyleSettings;
  };
  header: CustomElementSettings;
  footer: CustomElementSettings;
  pamphletPlaceholder: {
    text: string;
    font: FontStyleSettings;
    color1: string;
    color2: string;
  };
  cardStyle: {
    cornerRadius: string; // e.g., 'rounded-lg', 'rounded-2xl'
    shadow: string; // e.g., 'shadow-xl'
  };
  layout: {
    width: 'standard' | 'wide';
  };
  pageTransitions: {
    effect: 'none' | 'fade' | 'slide';
  };
  kiosk: {
    idleRedirectTimeout: number; // in seconds, 0 to disable
    profiles?: KioskProfile[];
    disableContextMenu: boolean;
    pinProtectScreensaver: boolean;
  };
  navigation: {
    links: NavLink[];
  };
  sync: {
    autoSyncEnabled: boolean;
  };
  loginScreen: {
    backgroundImageUrl: string;
    backgroundColor: string;
    boxBackgroundColor: string;
    textColor: string;
  };
  creatorProfile: CreatorProfile;
  lastUpdated?: number; // Timestamp for sync checking
}

// FIX: Added 'aws', 'xano', and 'backendless' to the StorageProvider type to support new provider options.
export type StorageProvider = 'local' | 'customApi' | 'sharedUrl' | 'supabase' | 'firebase' | 'vercel' | 'netlify' | 'ftp' | 'none' | 'aws' | 'xano' | 'backendless';

export type AdLink =
  | { type: 'brand'; id: string; }
  | { type: 'product'; id: string; }
  | { type: 'catalogue'; id: string; }
  | { type: 'pamphlet'; id: string; }
  | { type: 'external'; url: string; };

export interface ScreensaverAd {
  id: string;
  title: string;
  media: Array<{ url: string; type: 'image' | 'video' }>;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  link?: AdLink;
}

export interface AdminUserPermissions {
  canManageBrandsAndProducts: boolean;
  canManageCatalogues: boolean;
  canManagePamphlets: boolean;
  canManageScreensaver: boolean;
  canManageSettings: boolean;
  canManageSystem: boolean; // Covers Storage, Backup/Restore, Trash
  canManageTvContent: boolean;
  canViewAnalytics: boolean;
  canManageQuotesAndClients: boolean;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  tel: string;
  pin: string;
  isMainAdmin: boolean;
  permissions: AdminUserPermissions;
  imageUrl?: string;
}

export interface TvContent {
  id: string;
  brandId: string;
  modelName: string;
  media: Array<{ url: string; type: 'image' | 'video' }>;
  isDeleted?: boolean;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail?: string;
  contactTel: string;
  vatNumber?: string;
  address?: string;
  isDeleted?: boolean;
}

export interface Quote {
  id: string;
  clientId: string;
  adminId: string;
  createdAt: number; // timestamp
  status: 'pending' | 'quoted';
  items: {
    productId: string;
    quantity: number;
  }[];
  kioskId: string;
  tickedItems?: string[];
  quoteImageUrl?: string;
}

export type ViewCounts = Record<string, {
  brands: Record<string, number>;
  products: Record<string, number>;
}>;

export interface ActivityLog {
  id: string;
  timestamp: number;
  userId: string; // 'kiosk_user' or AdminUser.id
  kioskId: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'HARD_DELETE' | 'SYNC' | 'LOGIN' | 'LOGOUT' | 'VIEW';
  entityType: 'Brand' | 'Product' | 'Catalogue' | 'Pamphlet' | 'ScreensaverAd' | 'AdminUser' | 'TvContent' | 'Category' | 'Client' | 'Quote' | 'Settings' | 'System';
  entityId?: string;
  details: string;
}

export interface BackupData {
  brands: Brand[];
  products: Product[];
  catalogues: Catalogue[];
  pamphlets: Pamphlet[];
  settings: Settings;
  screensaverAds: ScreensaverAd[];
  adminUsers: AdminUser[];
  tvContent: TvContent[];
  categories?: Category[];
  clients?: Client[];
  quotes?: Quote[];
  viewCounts?: ViewCounts;
  activityLogs?: ActivityLog[];
}

// Types for Remote Control feature
export interface KioskSession {
  id: string;
  name?: string;
  currentPath: string;
  loggedInUser: string | null;
  isScreensaverActive: boolean;
  lastHeartbeat: number;
}

export type RemoteCommand = 
  | { type: 'navigate'; path: string }
  | { type: 'refresh' }
  | { type: 'logout' }
  | { type: 'startScreensaver' }
  | { type: 'stopScreensaver' };
  
export interface BackupProgress {
  active: boolean;
  message: string;
  percent: number;
}