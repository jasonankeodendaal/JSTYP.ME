/// <reference path="./swiper.d.ts" />

import React, { useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { register } from 'swiper/element/bundle';
import { motion, AnimatePresence } from 'framer-motion';

// New imports for screensaver and global state
import { AppProvider, useAppContext } from './components/context/AppContext.tsx';
import Screensaver from './components/Screensaver.tsx';
// FIX: Changed import to be a named import as ImageBookletModal is not a default export.
import { ImageBookletModal } from './components/ImageBookletModal.tsx'; // Import new booklet modal
import PdfModal from './components/PdfModal.tsx'; // Import new PDF modal
import ConfirmationModal from './components/ConfirmationModal.tsx';
import TvContentPlayer from './components/TvContentPlayer.tsx';
import SetupWizard from './components/SetupWizard.tsx';
import ClientDetailsModal from './components/Admin/ClientDetailsModal.tsx';
import ScreensaverPinModal from './components/ScreensaverPinModal.tsx';

// Component imports
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Home from './components/Home.tsx';
import BrandView from './components/BrandView.tsx';
import ProductDetail from './components/ProductDetail.tsx';
import SearchResults from './components/SearchResults.tsx';
import CatalogueLibrary from './components/CatalogueLibrary.tsx';
import AdminLogin from './components/Admin/Login.tsx';
import AdminDashboard from './components/Admin/AdminDashboard.tsx';
import ProtectedRoute from './components/Admin/ProtectedRoute.tsx';
import ProductEdit from './components/Admin/ProductEdit.tsx';
import AdminBrandProducts from './components/Admin/BrandProducts.tsx';
import CatalogueEdit from './components/Admin/CatalogueEdit.tsx';
import PamphletEdit from './components/Admin/PamphletEdit.tsx';
import AdEdit from './components/Admin/AdEdit.tsx';
import BrandEdit from './components/Admin/BrandEdit.tsx';
import AdminUserEdit from './components/Admin/AdminUserEdit.tsx';
import TvBrandsView from './components/TvBrandsView.tsx';
import TvBrandModelsView from './components/TvBrandModelsView.tsx';
import TvContentEdit from './components/Admin/TvContentEdit.tsx';
import StockPick from './components/Admin/StockPick.tsx';
import PrintOrderView from './components/Admin/PrintOrderView.tsx';
import AdminRemoteControl from './components/Admin/AdminRemoteControl.tsx';
import type { FontStyleSettings } from './types';


// Register Swiper custom elements
register();

const useIdleRedirect = () => {
    const { settings, activeTvContent, bookletModalState, pdfModalState, confirmation, quoteStartModal } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const idleTimer = useRef<number | null>(null);
    const timeout = settings.kiosk?.idleRedirectTimeout ?? 0;

    useEffect(() => {
        const resetTimer = () => {
            if (idleTimer.current) {
                clearTimeout(idleTimer.current);
            }
            // Don't start timer on home page, product pages, admin pages, if disabled, or if TV player or any modal is active
            if (timeout <= 0 || location.pathname === '/' || location.pathname.startsWith('/product/') || location.pathname.startsWith('/admin') || activeTvContent || bookletModalState.isOpen || pdfModalState.isOpen || confirmation.isOpen || quoteStartModal.isOpen) {
                return;
            }
            idleTimer.current = window.setTimeout(() => {
                navigate('/');
            }, timeout * 1000);
        };

        const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'touchstart'];
        const activityHandler = () => resetTimer();
        
        events.forEach(event => window.addEventListener(event, activityHandler));
        resetTimer(); // Start the timer on route change

        return () => {
            if (idleTimer.current) clearTimeout(idleTimer.current);
            events.forEach(event => window.removeEventListener(event, activityHandler));
        };
    }, [timeout, navigate, location.pathname, activeTvContent, bookletModalState.isOpen, pdfModalState.isOpen, confirmation.isOpen, quoteStartModal.isOpen]);
};

const useScreensaverManager = () => {
    const { settings, isScreensaverEnabled, startScreensaver, isScreensaverActive } = useAppContext();
    const location = useLocation();
    const screensaverTimer = useRef<number | null>(null);

    const resetScreensaverTimer = useCallback(() => {
        if (screensaverTimer.current) {
            clearTimeout(screensaverTimer.current);
        }
        const isOnAdminPage = location.pathname.startsWith('/admin');
        if (settings.screensaverDelay > 0 && isScreensaverEnabled && !isOnAdminPage) {
            screensaverTimer.current = window.setTimeout(() => {
                startScreensaver();
            }, settings.screensaverDelay * 1000);
        }
    }, [settings.screensaverDelay, isScreensaverEnabled, location.pathname, startScreensaver]);

    useEffect(() => {
        if (isScreensaverActive) {
            if (screensaverTimer.current) {
                clearTimeout(screensaverTimer.current);
            }
            return;
        }

        const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'touchstart'];
        const activityHandler = () => {
            resetScreensaverTimer();
        };

        events.forEach(event => window.addEventListener(event, activityHandler, { passive: true }));
        resetScreensaverTimer(); // Initial call

        return () => {
            if (screensaverTimer.current) {
                clearTimeout(screensaverTimer.current);
            }
            events.forEach(event => window.removeEventListener(event, activityHandler));
        };
    }, [isScreensaverActive, resetScreensaverTimer]);
};

// Helper to infer MIME type from a URL or data URI for the PWA manifest
const getMimeTypeFromUrl = (url: string): string => {
    if (url.startsWith('data:')) {
        const match = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);/);
        if (match && match[1]) {
            return match[1];
        }
    }
    const extensionMatch = url.match(/\.([^.?#]+)(?:[?#]|$)/);
    const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
    switch (extension) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'svg': return 'image/svg+xml';
        case 'webp': return 'image/webp';
        case 'gif': return 'image/gif';
        case 'ico': return 'image/x-icon';
        default: return 'image/png'; // Fallback for unknown types
    }
};

const AppContent: React.FC = () => {
  const { isScreensaverActive, settings, bookletModalState, closeBookletModal, pdfModalState, closePdfModal, activeTvContent, stopTvContent, isSetupComplete, quoteStartModal, playTouchSound, theme } = useAppContext();
  const location = useLocation();
  const MotionMain = motion.main as any;
  useIdleRedirect();
  useScreensaverManager();

  // Dynamic theming and typography
    useEffect(() => {
        const root = document.documentElement;

        // 1. Apply Theme Colors
        const themeColors = settings[theme === 'light' ? 'lightTheme' : 'darkTheme'];
        if (themeColors) {
            root.style.setProperty('--app-bg', themeColors.appBg);
            root.style.setProperty('--app-bg-image', themeColors.appBgImage);
            root.style.setProperty('--main-bg', themeColors.mainBg);
            root.style.setProperty('--main-text', themeColors.mainText);
            root.style.setProperty('--main-shadow', themeColors.mainShadow);
            root.style.setProperty('--main-border', themeColors.mainBorder);
            root.style.setProperty('--primary-color', themeColors.primary);
            root.style.setProperty('--btn-primary-bg', themeColors.primaryButton.background);
            root.style.setProperty('--btn-primary-text', themeColors.primaryButton.text);
            root.style.setProperty('--btn-primary-hover-bg', themeColors.primaryButton.hoverBackground);
            root.style.setProperty('--btn-destructive-bg', themeColors.destructiveButton.background);
            root.style.setProperty('--btn-destructive-text', themeColors.destructiveButton.text);
            root.style.setProperty('--btn-destructive-hover-bg', themeColors.destructiveButton.hoverBackground);
        }
        
        // 2. Apply Typography
        const { typography } = settings;
        if(typography) {
            const googleFontsLink = document.getElementById('google-fonts-link') as HTMLLinkElement;
            if (googleFontsLink && typography.googleFontUrl && googleFontsLink.href !== typography.googleFontUrl) {
                googleFontsLink.href = typography.googleFontUrl;
            }

            const applyFontStyles = (prefix: string, styles: FontStyleSettings) => {
                if(!styles) return;
                root.style.setProperty(`--${prefix}-font-family`, `'${styles.fontFamily}', sans-serif`);
                root.style.setProperty(`--${prefix}-font-weight`, styles.fontWeight);
                root.style.setProperty(`--${prefix}-font-style`, styles.fontStyle);
                root.style.setProperty(`--${prefix}-font-decoration`, styles.textDecoration);
                root.style.setProperty(`--${prefix}-letter-spacing`, styles.letterSpacing);
                root.style.setProperty(`--${prefix}-text-transform`, styles.textTransform);
            };

            applyFontStyles('body', typography.body);
            applyFontStyles('headings', typography.headings);
            applyFontStyles('item-titles', typography.itemTitles);
        }

        // 3. Update PWA Manifest & Icons
        const { appName, appDescription, logoUrl, lightTheme, darkTheme } = settings;

        // Update document title and Apple-specific meta tags
        if (appName) {
            document.title = appName;
            const appleTitleEl = document.getElementById('apple-mobile-web-app-title-link');
            if (appleTitleEl) {
                appleTitleEl.setAttribute('content', appName);
            }
        }
        if (logoUrl) {
            const appleIconLink = document.getElementById('apple-touch-icon-link');
            if (appleIconLink) {
                appleIconLink.setAttribute('href', logoUrl);
            }
        }

        // Dynamically generate and apply the manifest
        const manifestLink = document.getElementById('manifest-link') as HTMLLinkElement;
        if (manifestLink && logoUrl && appName) {
            const updateManifest = async () => {
                try {
                    const response = await fetch('./manifest.json');
                    if (!response.ok) return;
                    
                    const manifest = await response.json();

                    manifest.name = appName;
                    manifest.short_name = appName.length > 12 ? appName.substring(0, 9) + '...' : appName;
                    manifest.description = appDescription;
                    manifest.theme_color = darkTheme.mainBg;
                    manifest.background_color = lightTheme.mainBg;

                    const logoMimeType = getMimeTypeFromUrl(logoUrl);
                    manifest.icons = [
                        { src: logoUrl, type: logoMimeType, sizes: "192x192", purpose: "any" },
                        { src: logoUrl, type: logoMimeType, sizes: "512x512", purpose: "maskable" }
                    ];
                    
                    if(manifest.shortcuts && Array.isArray(manifest.shortcuts)){
                        manifest.shortcuts.forEach((shortcut: any) => {
                            if(shortcut.icons && Array.isArray(shortcut.icons)){
                                shortcut.icons[0].src = logoUrl;
                            }
                        });
                    }

                    const manifestString = JSON.stringify(manifest);
                    const manifestBlob = new Blob([manifestString], { type: 'application/json' });
                    const manifestUrl = URL.createObjectURL(manifestBlob);
                    
                    const oldManifestUrl = manifestLink.dataset.blobUrl;
                    if (oldManifestUrl) {
                        URL.revokeObjectURL(oldManifestUrl);
                    }

                    manifestLink.href = manifestUrl;
                    manifestLink.dataset.blobUrl = manifestUrl;

                } catch (error) {
                    console.error("Error updating manifest:", error);
                }
            };
            
            updateManifest();
        }

    }, [settings, theme]);

  useEffect(() => {
    const handler = () => playTouchSound();
    window.addEventListener('click', handler, { passive: true });
    return () => window.removeEventListener('click', handler);
  }, [playTouchSound]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
        if (settings.kiosk.disableContextMenu) {
            e.preventDefault();
        }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [settings.kiosk.disableContextMenu]);
  
  const pageTransitionVariants = {
    none: {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 }
    },
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: 'easeInOut' }
    },
    slide: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };
  const transitionConfig = pageTransitionVariants[settings.pageTransitions?.effect] || pageTransitionVariants.none;
  const motionProps = {
    variants: transitionConfig,
    initial: "initial",
    animate: "animate",
    exit: "exit",
  };
  
  if (!isSetupComplete) {
      return <SetupWizard />;
  }

  const isPrinting = location.pathname.includes('/print');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {isScreensaverActive && <Screensaver />}
      {activeTvContent && <TvContentPlayer content={activeTvContent} onClose={stopTvContent} />}
      {bookletModalState.isOpen && (
        <ImageBookletModal
            title={bookletModalState.title}
            imageUrls={bookletModalState.imageUrls}
            onClose={closeBookletModal}
        />
      )}
      {pdfModalState.isOpen && (
          <PdfModal 
              url={pdfModalState.url}
              title={pdfModalState.title}
              onClose={closePdfModal}
          />
      )}
      {quoteStartModal.isOpen && <ClientDetailsModal />}
      <ConfirmationModal />
      <ScreensaverPinModal />
      
      {isPrinting ? (
           <Routes>
                <Route path="/admin/quote/:quoteId/print" element={<ProtectedRoute><PrintOrderView /></ProtectedRoute>} />
           </Routes>
      ) : isAdminRoute ? (
           <Routes>
               <Route path="/login" element={<AdminLogin />} />
               <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
               <Route path="/admin/remote-control" element={<ProtectedRoute mainAdminOnly><AdminRemoteControl /></ProtectedRoute>} />
               <Route path="/admin/stock-pick" element={<ProtectedRoute><StockPick /></ProtectedRoute>} />
               <Route path="/admin/brand/new" element={<ProtectedRoute><BrandEdit /></ProtectedRoute>} />
               <Route path="/admin/brand/edit/:brandId" element={<ProtectedRoute><BrandEdit /></ProtectedRoute>} />
               <Route path="/admin/brand/:brandId" element={<ProtectedRoute><AdminBrandProducts /></ProtectedRoute>} />
               <Route path="/admin/product/new/:brandId" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
               <Route path="/admin/product/:productId" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
               <Route path="/admin/catalogue/new" element={<ProtectedRoute><CatalogueEdit /></ProtectedRoute>} />
               <Route path="/admin/catalogue/edit/:catalogueId" element={<ProtectedRoute><CatalogueEdit /></ProtectedRoute>} />
               <Route path="/admin/pamphlet/new" element={<ProtectedRoute><PamphletEdit /></ProtectedRoute>} />
               <Route path="/admin/pamphlet/edit/:pamphletId" element={<ProtectedRoute><PamphletEdit /></ProtectedRoute>} />
               <Route path="/admin/ad/:adId" element={<ProtectedRoute><AdEdit /></ProtectedRoute>} />
               <Route path="/admin/ad/new" element={<ProtectedRoute><AdEdit /></ProtectedRoute>} />
               <Route path="/admin/tv-content/new" element={<ProtectedRoute><TvContentEdit /></ProtectedRoute>} />
               <Route path="/admin/tv-content/edit/:contentId" element={<ProtectedRoute><TvContentEdit /></ProtectedRoute>} />
               <Route path="/admin/user/new" element={<ProtectedRoute><AdminUserEdit /></ProtectedRoute>} />
               <Route path="/admin/user/edit/:userId" element={<ProtectedRoute><AdminUserEdit /></ProtectedRoute>} />
           </Routes>
      ) : (
        <div className="text-gray-900 dark:text-gray-200 font-sans flex flex-col antialiased main-content-container">
            <Header />
            <AnimatePresence mode="wait">
                <MotionMain
                    key={location.pathname}
                    {...motionProps}
                    className={`flex-grow w-full px-4 sm:px-6 lg:px-8 pt-8 pb-48 ${settings.layout.width === 'standard' ? 'max-w-7xl mx-auto' : ''}`}
                >
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/brand/:brandId" element={<BrandView />} />
                    <Route path="/product/:productId" element={<ProductDetail />} />
                    <Route path="/catalogues" element={<CatalogueLibrary />} />
                    <Route path="/tvs" element={<TvBrandsView />} />
                    <Route path="/tvs/:brandId" element={<TvBrandModelsView />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/login" element={<AdminLogin />} />
                </Routes>
                </MotionMain>
            </AnimatePresence>
            <Footer />
        </div>
      )}
    </>
  )
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;