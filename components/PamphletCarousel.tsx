import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useAppContext } from './context/AppContext.tsx';
import LocalMedia from './LocalMedia.tsx';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.tsx';

const PamphletDisplay: React.FC = () => {
    const { pamphlets, settings, openDocument } = useAppContext();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const activePamphlets = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return pamphlets.filter(pamphlet => {
            if (pamphlet.isDeleted) return false;
            const startDate = new Date(pamphlet.startDate);
            const endDate = new Date(pamphlet.endDate);
            // Add timezone offset to avoid off-by-one day errors with YYYY-MM-DD strings
            startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
            endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
            
            endDate.setHours(23, 59, 59, 999); // Make end date inclusive of the entire day
            return startDate <= today && endDate >= today;
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [pamphlets]);

    const checkScrollability = useCallback(() => {
        const el = scrollContainerRef.current;
        if (el) {
            const hasOverflow = el.scrollWidth > el.clientWidth;
            // Use a small buffer to prevent flickering
            setCanScrollLeft(el.scrollLeft > 5);
            setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            checkScrollability();
            el.addEventListener('scroll', checkScrollability, { passive: true });
            const resizeObserver = new ResizeObserver(checkScrollability);
            resizeObserver.observe(el);

            // Re-check after a short delay for initial render issues in some browsers
            const timer = setTimeout(checkScrollability, 100);

            return () => {
                el.removeEventListener('scroll', checkScrollability);
                resizeObserver.disconnect();
                clearTimeout(timer);
            };
        }
    }, [checkScrollability, activePamphlets.length]); // Re-check when pamphlets change

    const handleScroll = (direction: 'left' | 'right') => {
        const el = scrollContainerRef.current;
        if (el) {
            // Scroll by 70% of the visible width for a pleasant scroll effect
            const scrollAmount = el.clientWidth * 0.7;
            el.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    
    if (activePamphlets.length === 0) {
        const { text = "No Active Promotions", font, color1 = "#a78bfa", color2 = "#f472b6" } = settings.pamphletPlaceholder || {};
        
        const placeholderStyle: React.CSSProperties = {
            fontFamily: font?.fontFamily || 'Playfair Display',
            fontWeight: font?.fontWeight || '900',
            fontStyle: font?.fontStyle || 'italic',
            backgroundImage: `linear-gradient(to right, ${color1}, ${color2})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textDecoration: font?.textDecoration || 'none',
            letterSpacing: font?.letterSpacing || 'normal',
            textTransform: font?.textTransform || 'none',
        };

        return (
            <div className="mb-10 text-center">
                <h2 className="text-2xl tracking-tight text-gray-900 dark:text-gray-100 mb-6 section-heading">Latest Offers & Pamphlets</h2>
                <div className="py-12 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-white/5 pamphlet-container">
                    <span className="text-5xl md:text-6xl tracking-tight" style={placeholderStyle}>
                        {text}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-10 text-center">
            <h2 className="text-2xl tracking-tight text-gray-900 dark:text-gray-100 mb-6 section-heading">Latest Offers & Pamphlets</h2>
            <div className="py-12 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-white/5 pamphlet-container group">
                <div className="relative">
                    <button
                        onClick={() => handleScroll('left')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full shadow-lg transition-opacity duration-300 disabled:opacity-0 disabled:cursor-not-allowed opacity-100 sm:opacity-0 group-hover:opacity-100"
                        disabled={!canScrollLeft}
                        aria-label="Scroll left"
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-white" />
                    </button>
                    
                    <div
                        ref={scrollContainerRef}
                        className="flex items-start gap-x-4 overflow-x-auto pb-4 sm:gap-x-6 sm:gap-y-8 sm:flex-wrap sm:justify-center sm:pb-0 no-scrollbar px-4 sm:px-0"
                    >
                        {activePamphlets.map((pamphlet) => (
                            <button
                                key={pamphlet.id}
                                onClick={() => openDocument(pamphlet, pamphlet.title)}
                                className={`group block text-left w-[120px] flex-shrink-0 sm:w-[180px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] ${settings.cardStyle?.cornerRadius ?? 'rounded-2xl'}`}
                                aria-label={`View ${pamphlet.title}`}
                            >
                                <div className={`relative bg-black overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 aspect-[3/4] ${settings.cardStyle?.cornerRadius ?? 'rounded-2xl'} ${settings.cardStyle?.shadow ?? 'shadow-xl'}`}>
                                    <LocalMedia
                                        src={pamphlet.imageUrl}
                                        alt={pamphlet.title}
                                        type="image"
                                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-black/0">
                                        <h3 className="font-semibold text-white text-sm item-title drop-shadow-md">{pamphlet.title}</h3>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handleScroll('right')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full shadow-lg transition-opacity duration-300 disabled:opacity-0 disabled:cursor-not-allowed opacity-100 sm:opacity-0 group-hover:opacity-100"
                        disabled={!canScrollRight}
                        aria-label="Scroll right"
                    >
                        <ChevronRightIcon className="w-6 h-6 text-gray-800 dark:text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PamphletDisplay;