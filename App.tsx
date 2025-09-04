/// <reference path="./swiper.d.ts" />

import React, { useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { register } from 'swiper/element/bundle';
import { motion, AnimatePresence } from 'framer-motion';

// New imports for screensaver and global state
import { AppProvider, useAppContext } from './components/context/AppContext.tsx';
import Screensaver from './components/Screensaver.tsx';
import ImageBookletModal from './components/ImageBookletModal.tsx'; // Import new booklet modal
import PdfModal from './components/PdfModal.tsx'; // Import new PDF modal
import ConfirmationModal from './components/ConfirmationModal.tsx';
import TvContentPlayer from './components/TvContentPlayer.tsx';
import SetupWizard from './components/SetupWizard.tsx';
import ClientDetailsModal from './components/Admin/ClientDetailsModal.tsx';

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
import AdminBrandProducts from './components/Admin/AdminBrandProducts.tsx';
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

const AppContent: React.FC = () => {
  const { isScreensaverActive, settings, bookletModalState, closeBookletModal, pdfModalState, closePdfModal, activeTvContent, stopTvContent, isSetupComplete, quoteStartModal } = useAppContext();
  const location = useLocation();
  const MotionMain = motion.main as any;
  useIdleRedirect();
  useScreensaverManager();

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
                    className="flex-grow w-full px-4 sm:px-6 lg:px-8 pt-8 pb-40"
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