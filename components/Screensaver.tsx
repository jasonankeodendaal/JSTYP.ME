import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext.tsx';
import type { AdLink, Product } from '../types.ts';
import LocalMedia from './LocalMedia.tsx';

type PlaylistItem = {
    type: 'image' | 'video' | 'touch-prompt';
    title: string;
    url: string;
    link?: AdLink;
    brandName?: string;
    productId?: string;
};

const MotionDiv = motion.div as any;
const MotionH2 = motion.h2 as any;
const MotionP = motion.p as any;

const transitionVariants: Record<string, any> = {
    'fade': {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] } },
        exit: { opacity: 0, transition: { duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] } },
    },
    'slide': {
        initial: { x: '100%', opacity: 1 },
        animate: { x: 0, transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } },
        exit: { x: '-100%', transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } },
    },
    'slide-up': {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } },
        exit: { y: '-100%', transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } },
    },
    'scale': {
        initial: { scale: 1.15, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { duration: 1.3, ease: 'easeOut' } },
        exit: { scale: 1.15, opacity: 0, transition: { duration: 1, ease: 'easeIn' } },
    },
    'zoom-in': {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { duration: 1, ease: [0.33, 1, 0.68, 1] } },
        exit: { scale: 1.5, opacity: 0, transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } },
    },
    'slide-fade': {
        initial: { x: 80, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 1.3, ease: [0.33, 1, 0.68, 1] } },
        exit: { x: -80, opacity: 0, transition: { duration: 1, ease: [0.33, 1, 0.68, 1] } },
    },
    'gentle-drift': {
        initial: { opacity: 0, scale: 1.15, filter: 'blur(8px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] } },
        exit: { opacity: 0, scale: 0.85, filter: 'blur(8px)', transition: { duration: 2, ease: [0.43, 0.13, 0.23, 0.96] } }
    },
    'reveal-blur': {
        initial: { opacity: 0, filter: 'blur(20px)', scale: 1.2 },
        animate: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 1.8, ease: 'easeOut' } },
        exit: { opacity: 0, filter: 'blur(20px)', scale: 1.2, transition: { duration: 1.5, ease: 'easeIn' } }
    },
     'slow-pan': {
        initial: { opacity: 0, scale: 1.1 },
        animate: { opacity: 1, scale: 1, transition: { duration: 2, ease: [0.43, 0.13, 0.23, 0.96] } },
        exit: { opacity: 0, transition: { duration: 2, ease: [0.43, 0.13, 0.23, 0.96] } },
    }
};

const kenBurnsVariants = {
    'slow-pan': [
      { scale: [1, 1.1], x: ['0%', '-3%'], y: ['0%', '3%'] },
      { scale: [1, 1.1], x: ['0%', '3%'], y: ['0%', '-3%'] },
      { scale: [1, 1.08], x: ['0%', '0%'], y: ['0%', '4%'] },
      { scale: [1, 1.08], x: ['0%', '4%'], y: ['0%', '0%'] },
    ]
};

const Preloader: React.FC<{ item: PlaylistItem | undefined }> = ({ item }) => {
    if (!item) return null;
    return (
        <div style={{ display: 'none' }} aria-hidden="true">
            <LocalMedia src={item.url} type={item.type as 'image' | 'video'} preload="auto" />
        </div>
    );
};

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    return (
        <div className="text-white font-sans text-right" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
            <p className="text-5xl font-bold">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-md">{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
    );
};


const TouchPromptSlide: React.FC<{ text: string }> = ({ text }) => (
    <div className="w-full h-full flex items-center justify-center">
        <MotionH2
            className="text-7xl md:text-8xl text-white font-serif tracking-wide"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
                opacity: 1,
                scale: 1,
                transition: { duration: 1.5, ease: 'easeOut', delay: 0.5 }
            }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 1, ease: 'easeIn' } }}
        >
            {text}
        </MotionH2>
    </div>
);

const ProductInfoOverlay: React.FC<{product: Product, style: 'overlay' | 'banner'}> = ({ product, style }) => {
    const specs = product.specifications.slice(0, 3);
    const shortDesc = product.description.split('.').slice(0,2).join('.') + '.';
    
    if (style === 'banner') {
         return (
             <MotionDiv 
                initial={{y: '100%'}} animate={{y: '0%'}} exit={{y: '100%'}} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1]}}
                className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-6 border-t border-white/10"
             >
                 <div className="flex justify-between items-start gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-white section-heading">{product.name}</h3>
                        <p className="text-md text-white/80 mt-1">{shortDesc}</p>
                    </div>
                    {specs.length > 0 && (
                        <div className="flex-shrink-0 text-right">
                             {specs.map(spec => (
                                 <div key={spec.id}>
                                    <span className="text-sm text-white/60">{spec.key}: </span>
                                    <span className="text-sm font-semibold text-white">{spec.value}</span>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </MotionDiv>
        );
    }

    return (
        <MotionDiv 
            initial="hidden" animate="visible" exit="hidden"
            variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } },
                hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
            }}
            className="absolute bottom-10 right-10 w-full max-w-sm bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-white"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
        >
            <h3 className="text-2xl font-bold section-heading">{product.name}</h3>
            <div className="mt-4 space-y-2">
                 {specs.map(spec => (
                     <motion.div key={spec.id} variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0, transition:{ duration: 0.6, ease: 'easeOut'}}}} className="flex justify-between text-sm">
                        <span className="text-white/60">{spec.key}</span>
                        <span className="font-semibold">{spec.value}</span>
                     </motion.div>
                 ))}
            </div>
        </MotionDiv>
    )
}


const Screensaver: React.FC = () => {
    const { settings, products, screensaverAds, exitScreensaver, openDocument, catalogues, pamphlets, brands, localVolume, setIsScreensaverPinModalOpen } = useAppContext();
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [kbVariant, setKbVariant] = useState(kenBurnsVariants['slow-pan'][0]);
    const navigate = useNavigate();
    const videoNodeRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const handleActivity = () => {
            if (settings.kiosk.pinProtectScreensaver) {
                setIsScreensaverPinModalOpen(true);
            } else {
                exitScreensaver();
            }
        };
        const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'touchstart'];
        events.forEach(event => window.addEventListener(event, handleActivity, { once: true }));
        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [exitScreensaver, settings.kiosk.pinProtectScreensaver, setIsScreensaverPinModalOpen]);

    const playlist: PlaylistItem[] = useMemo(() => {
        type MediaSource = Omit<PlaylistItem, 'type' | 'url'> & {
            mediaType: 'image' | 'video';
            mediaUrl: string;
            sourceId: string;
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeAdItems: MediaSource[] = screensaverAds
            .filter(ad => {
                const startDate = new Date(ad.startDate);
                const endDate = new Date(ad.endDate);
                endDate.setHours(23, 59, 59, 999);
                return startDate <= today && endDate >= today;
            })
            .flatMap(ad => 
                ad.media.map((mediaItem): MediaSource => ({
                    mediaType: mediaItem.type,
                    mediaUrl: mediaItem.url,
                    title: ad.title,
                    link: ad.link,
                    sourceId: ad.id,
                }))
            );

        let sourceMedia: MediaSource[] = [];

        if (settings.screensaverContentSource === 'ads_only') {
            sourceMedia = activeAdItems;
        } else { // 'products_and_ads' is the default
             const productItems: MediaSource[] = products
                .filter(p => !p.isDiscontinued && !p.isDeleted && (p.images.length > 0 || p.video))
                .flatMap(product => {
                    const brand = brands.find(b => b.id === product.brandId);
                    const itemBase = {
                        title: product.name,
                        brandName: brand?.name,
                        productId: product.id,
                        link: { type: 'product' as const, id: product.id },
                        sourceId: product.id
                    };
                    const items: MediaSource[] = product.images.map(imageUrl => ({ ...itemBase, mediaType: 'image' as const, mediaUrl: imageUrl }));
                    if (product.video) {
                        items.push({ ...itemBase, mediaType: 'video' as const, mediaUrl: product.video });
                    }
                    return items;
                });
            sourceMedia = [...productItems, ...activeAdItems];
        }
        
        // Fisher-Yates shuffle
        for (let i = sourceMedia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sourceMedia[i], sourceMedia[j]] = [sourceMedia[j], sourceMedia[i]];
        }
        
        // Smarter shuffle: attempt to de-cluster items from the same source (e.g., same product)
        const finalMedia: MediaSource[] = [];
        if(sourceMedia.length > 0) {
            finalMedia.push(sourceMedia.shift()!);
            while(sourceMedia.length > 0) {
                let foundIndex = -1;
                for(let i=0; i < sourceMedia.length; i++) {
                    if(sourceMedia[i].sourceId !== finalMedia[finalMedia.length-1].sourceId) {
                        foundIndex = i;
                        break;
                    }
                }
                if (foundIndex !== -1) {
                    finalMedia.push(sourceMedia.splice(foundIndex, 1)[0]);
                } else {
                    // If all remaining items are from the same source, just add the next one
                    finalMedia.push(sourceMedia.shift()!);
                }
            }
        }
        
        const mediaItems: PlaylistItem[] = finalMedia.map(item => {
            const { mediaType, mediaUrl, sourceId, ...rest } = item;
            return {
                ...rest,
                type: mediaType,
                url: mediaUrl,
            };
        });

        const promptSlide: PlaylistItem = { type: 'touch-prompt', url: 'prompt', title: settings.screensaverTouchPromptText };
        if (mediaItems.length === 0) return [promptSlide];

        const finalPlaylist: PlaylistItem[] = [];
        const itemsPerPrompt = settings.screensaverItemsPerPrompt > 0 ? settings.screensaverItemsPerPrompt : 1000;

        mediaItems.forEach((item, index) => {
            finalPlaylist.push(item);
            if ((index + 1) % itemsPerPrompt === 0) {
                finalPlaylist.push({ ...promptSlide, url: `prompt-${index}` });
            }
        });
        
        if (mediaItems.length % itemsPerPrompt !== 0) {
            finalPlaylist.push(promptSlide);
        }

        return finalPlaylist;

    }, [products, screensaverAds, brands, settings.screensaverTouchPromptText, settings.screensaverContentSource, settings.screensaverItemsPerPrompt]);

    const goToNextItem = useCallback(() => {
        if (playlist.length > 0) {
            setCurrentItemIndex(prevIndex => (prevIndex + 1) % playlist.length);
            if (settings.screensaverTransitionEffect === 'slow-pan') {
                 setKbVariant(kenBurnsVariants['slow-pan'][Math.floor(Math.random() * kenBurnsVariants['slow-pan'].length)]);
            }
        }
    }, [playlist.length, settings.screensaverTransitionEffect]);

    const currentItem = useMemo(() => playlist[currentItemIndex], [playlist, currentItemIndex]);
    const nextItem = useMemo(() => playlist.length > 1 ? playlist[(currentItemIndex + 1) % playlist.length] : undefined, [playlist, currentItemIndex]);
    const currentProduct = useMemo(() => {
        if (currentItem?.productId && settings.screensaverShowProductInfo) {
            return products.find(p => p.id === currentItem.productId);
        }
        return null;
    }, [currentItem, products, settings.screensaverShowProductInfo]);

    useEffect(() => {
        if (currentItem?.type === 'image' || currentItem?.type === 'touch-prompt') {
            const duration = currentItem.type === 'touch-prompt'
                ? 6000
                : settings.screensaverImageDuration * 1000;
            const timer = window.setTimeout(goToNextItem, duration);
            return () => clearTimeout(timer);
        }
    }, [currentItem, goToNextItem, settings.screensaverImageDuration]);
    
    const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
        if (videoNodeRef.current) {
            videoNodeRef.current.removeEventListener('ended', goToNextItem);
            videoNodeRef.current.removeEventListener('error', goToNextItem);
            if (!videoNodeRef.current.paused) {
                videoNodeRef.current.pause();
            }
        }
        
        videoNodeRef.current = node;

        if (videoNodeRef.current) {
            const videoElement = videoNodeRef.current;
            videoElement.addEventListener('ended', goToNextItem);
            videoElement.addEventListener('error', goToNextItem);

            const tryPlay = async () => {
                try {
                    const volume = typeof localVolume === 'number' && isFinite(localVolume) ? Math.max(0, Math.min(1, localVolume)) : 0.75;
                    videoElement.volume = volume;
                    videoElement.muted = volume === 0;
                    await videoElement.play();
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'AbortError') return;
                    console.warn("Could not play video with sound, retrying muted.", error);
                    videoElement.muted = true;
                    try {
                        await videoElement.play();
                    } catch (finalError) {
                        if (!(finalError instanceof DOMException && finalError.name === 'AbortError')) {
                            console.error("Video could not be played. Skipping.", finalError);
                            goToNextItem();
                        }
                    }
                }
            };
            tryPlay();
        }
    }, [goToNextItem, localVolume]);
    
    const handleClick = () => {
        const { link } = currentItem || {};
        const isProtected = settings.kiosk.pinProtectScreensaver;

        if (isProtected) {
            setIsScreensaverPinModalOpen(true);
            return;
        }
        
        exitScreensaver();

        if (!link) return;
        
        setTimeout(() => {
            switch (link.type) {
                case 'brand': navigate(`/brand/${link.id}`); break;
                case 'product': navigate(`/product/${link.id}`); break;
                case 'catalogue': {
                    const catalogue = catalogues.find(c => c.id === link.id);
                    if (catalogue) openDocument(catalogue, catalogue.title);
                    break;
                }
                case 'pamphlet': {
                    const pamphlet = pamphlets.find(p => p.id === link.id);
                    if (pamphlet) openDocument(pamphlet, pamphlet.title);
                    break;
                }
                case 'external': window.open(link.url, '_blank', 'noopener,noreferrer'); break;
            }
        }, 50);
    };

    if (!currentItem) return null;
    
    const selectedTransition = transitionVariants[settings.screensaverTransitionEffect] || transitionVariants['gentle-drift'];
    
    const textContainerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
        exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
    };

    const textLineVariants = {
        hidden: { opacity: 0, y: '110%' },
        visible: { opacity: 1, y: '0%', transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, y: '-110%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleClick}
            role="button"
            aria-label="Exit screensaver"
        >
            <Preloader item={nextItem} />
            <AnimatePresence>
                <MotionDiv
                    key={`bg-${currentItem.url}`}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 2, ease: 'easeOut' } }}
                    exit={{ opacity: 0, transition: { duration: 2, ease: 'easeIn' } }}
                >
                    {currentItem.type === 'image' ? (
                        <LocalMedia
                            src={currentItem.url}
                            alt=""
                            type="image"
                            className="w-full h-full object-cover transform scale-110 filter blur-2xl brightness-50"
                            aria-hidden="true"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800" aria-hidden="true" />
                    )}
                </MotionDiv>
            </AnimatePresence>
            
            <AnimatePresence initial={false} mode="wait">
                <MotionDiv
                    key={currentItem.url + currentItemIndex}
                    variants={selectedTransition}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0 w-full h-full bg-black/30 flex items-center justify-center"
                >
                     {currentItem.type === 'image' ? (
                        <MotionDiv
                            className="w-full h-full overflow-hidden"
                            key={`kb-${currentItem.url}`}
                            animate={settings.screensaverTransitionEffect === 'slow-pan' ? kbVariant : {}}
                            transition={{ duration: settings.screensaverImageDuration + 2, ease: 'linear' }}
                        >
                            <LocalMedia
                                src={currentItem.url}
                                alt={currentItem.title}
                                type="image"
                                className="w-full h-full object-contain"
                                onError={goToNextItem}
                            />
                        </MotionDiv>
                    ) : currentItem.type === 'video' ? (
                        <LocalMedia
                            ref={videoRefCallback}
                            src={currentItem.url}
                            type="video"
                            className="w-full h-full object-contain"
                            playsInline
                            preload="auto"
                        />
                    ) : (
                        <TouchPromptSlide text={settings.screensaverTouchPromptText} />
                    )}
                </MotionDiv>
            </AnimatePresence>
            
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                <LocalMedia src={settings.logoUrl} alt="Company Logo" type="image" className="h-12 opacity-70" />
                {settings.screensaverShowClock && <Clock />}
            </div>

            <AnimatePresence>
                {currentItem.type !== 'touch-prompt' && !currentProduct && (
                     <MotionDiv 
                        key={`${currentItem.url}-text`}
                        className="absolute bottom-10 left-10 right-10 pointer-events-none"
                        variants={textContainerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="overflow-hidden">
                             <MotionH2 variants={textLineVariants} className="section-heading text-4xl md:text-5xl font-bold text-white" style={{ textShadow: '0 3px 8px rgba(0,0,0,0.7)' }}>
                                {currentItem.title}
                            </MotionH2>
                        </div>
                        {currentItem.brandName && (
                            <div className="overflow-hidden">
                                <MotionP variants={textLineVariants} className="item-title text-xl text-white/80" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.7)' }}>
                                    {currentItem.brandName}
                                </MotionP>
                            </div>
                        )}
                    </MotionDiv>
                )}
                {currentProduct && (
                     <ProductInfoOverlay key={currentProduct.id} product={currentProduct} style={settings.screensaverProductInfoStyle} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Screensaver;