import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';
import { EyeIcon, EyeOffIcon, PlusIcon, ClipboardDocumentListIcon } from './Icons.tsx';
import PamphletDisplay from './PamphletCarousel.tsx';
import LocalMedia from './LocalMedia.tsx';
import InstallPrompt from './InstallPrompt.tsx';

const BrandGrid: React.FC = () => {
    const { brands } = useAppContext();

    return (
        <div>
            <h2 className="text-2xl tracking-tight text-gray-900 dark:text-gray-100 mb-6 section-heading">Shop by Brand</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
                {brands.filter(brand => !brand.isDeleted).map((brand) => (
                    <Link
                        key={brand.id}
                        to={`/brand/${brand.id}`}
                        className="group flex items-center justify-center p-4 aspect-square bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 transition-all hover:shadow-2xl hover:-translate-y-1"
                        title={brand.name}
                    >
                        <LocalMedia
                            src={brand.logoUrl}
                            alt={`${brand.name} Logo`}
                            type="image"
                            className="max-h-full max-w-full object-contain"
                        />
                    </Link>
                ))}
            </div>
        </div>
    );
}

const ClientStockPickCTA: React.FC = () => {
    const { loggedInUser, openClientDetailsModal } = useAppContext();
    const navigate = useNavigate();

    const handleCreateStockPick = () => {
        if (loggedInUser) {
            openClientDetailsModal();
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left text-white">
             <div className="flex items-center gap-6">
                <div className="hidden sm:block flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20">
                    <ClipboardDocumentListIcon className="h-10 w-10" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold section-heading">Create Client Quote</h3>
                    <p className="text-indigo-200 mt-1 max-w-lg">
                        Start a new quote by selecting products for a client. The order can be printed or saved.
                    </p>
                </div>
            </div>
            <button onClick={handleCreateStockPick} className="btn bg-white text-indigo-600 hover:bg-gray-100 mt-4 sm:mt-0 flex-shrink-0 transform hover:scale-105">
                <PlusIcon className="h-5 w-5" />
                <span>Create Quote</span>
            </button>
        </div>
    );
};

const ScreensaverToggle: React.FC = () => {
    const { isScreensaverEnabled, toggleScreensaver } = useAppContext();
    
    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:ring-offset-gray-800 transition-all";

    const onClasses = "bg-green-100 dark:bg-green-800/60 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-700/80 focus:ring-green-500";
    
    const offClasses = "bg-red-100 dark:bg-red-800/60 text-red-800 dark:text-red-100 border border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-700/80 focus:ring-red-500";


    return (
        <div className="text-center mt-12 py-6 border-t border-black/10 dark:border-white/10">
             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Kiosk Control</h3>
            <button
                onClick={toggleScreensaver}
                className={`${baseClasses} ${isScreensaverEnabled ? onClasses : offClasses}`}
                aria-live="polite"
            >
                {isScreensaverEnabled ? (
                    <>
                        <EyeIcon className="h-5 w-5" />
                        <span>Auto Screensaver On</span>
                    </>
                ) : (
                    <>
                        <EyeOffIcon className="h-5 w-5" />
                        <span>Auto Screensaver Off</span>
                    </>
                )}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 max-w-md mx-auto">
                {isScreensaverEnabled 
                    ? "Screensaver will start after inactivity."
                    : "Screensaver is disabled."
                }
            </p>
        </div>
    );
};


const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      <ClientStockPickCTA />
      <PamphletDisplay />
      <BrandGrid />
      <InstallPrompt />
      <ScreensaverToggle />
    </div>
  );
};

export default Home;