import React, { useEffect, useState, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, DocumentArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, Squares2X2Icon, EnterFullScreenIcon, ExitFullScreenIcon } from './Icons.tsx';
import * as pdfjsLib from 'https://aistudiocdn.com/pdfjs-dist@^4.4.178/build/pdf.js';
import ImageEnlargeModal from './ImageEnlargeModal.tsx'; // Import for zoom
import LocalMedia from './LocalMedia';

interface PdfModalProps {
    title: string;
    url: string;
    onClose: () => void;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.4.178/build/pdf.worker.js`;

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number: number; onClick: () => void }>(({ children, number, onClick }, ref) => (
    <div className="flex items-center justify-center bg-white cursor-zoom-in" ref={ref} data-density="hard" onClick={onClick}>
        <div className="w-full h-full flex items-center justify-center relative">
            {children}
            <div className="absolute bottom-2 text-center text-xs text-gray-400">{number}</div>
        </div>
    </div>
));

const FlipBook = HTMLFlipBook as any;

const PdfModal: React.FC<PdfModalProps> = ({ title, url, onClose }) => {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState('');
    const flipBook = useRef<any>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageInput, setPageInput] = useState('1');
    const [enlargeState, setEnlargeState] = useState<{ isOpen: boolean; index: number }>({ isOpen: false, index: 0 });
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);


    useEffect(() => {
        const renderPdfToImages = async () => {
            setIsLoading(true);
            setProgress('');
            try {
                const loadingTask = pdfjsLib.getDocument(url);
                const pdf = await loadingTask.promise;
                const numPages = pdf.numPages;
                const urls: string[] = [];

                for (let i = 1; i <= numPages; i++) {
                    setProgress(`Rendering page ${i} of ${numPages}...`);
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { alpha: false });
                    if (!context) continue;

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport, background: 'rgba(255,255,255,1)' } as any).promise;
                    urls.push(canvas.toDataURL('image/png'));
                }
                setImageUrls(urls);
            } catch (error) {
                console.error("Failed to render PDF:", error);
                setProgress('Error: Could not load document.');
            } finally {
                setIsLoading(false);
            }
        };

        if (url) {
            renderPdfToImages();
        }
    }, [url]);

    const handleFlip = useCallback((e: any) => setCurrentPage(e.data), []);
    useEffect(() => { setPageInput(String(currentPage + 1)); }, [currentPage]);

    const prevPage = () => flipBook.current?.pageFlip()?.flipPrev();
    const nextPage = () => flipBook.current?.pageFlip()?.flipNext();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowLeft') prevPage();
            if (event.key === 'ArrowRight') nextPage();
        };
        const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [onClose]);

    const handlePageJump = (e: React.FormEvent) => {
        e.preventDefault();
        const pageNum = parseInt(pageInput, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= imageUrls.length) {
            flipBook.current?.pageFlip()?.flip(pageNum - 1);
        } else {
            setPageInput(String(currentPage + 1));
        }
    };
    
    const toggleFullScreen = () => {
        if (!modalRef.current) return;
        if (!document.fullscreenElement) {
            modalRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleDownloadPdf = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        a.click();
    };
    
    const btnClass = () => `p-2 rounded-full transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white`;

    return (
        <>
        {enlargeState.isOpen && (
            <ImageEnlargeModal
                imageUrls={imageUrls}
                initialIndex={enlargeState.index}
                onClose={() => setEnlargeState({ isOpen: false, index: 0 })}
            />
        )}
        <div
          ref={modalRef}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col z-50 p-2 sm:p-4 animate-fade-in"
          onClick={onClose}
          aria-modal="true" role="dialog"
        >
          <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
          
            <header className="w-full max-w-6xl mx-auto flex-shrink-0 flex justify-between items-center text-white px-2 py-2">
                <h3 className="text-lg font-semibold truncate" title={title}>{title}</h3>
                <button onClick={onClose} aria-label="Close viewer" className="p-2 rounded-full hover:bg-white/20 transition-colors"><XIcon className="w-6 h-6" /></button>
            </header>
            
            <main className="flex-grow w-full max-w-6xl mx-auto relative flex items-center justify-center min-h-0" onClick={e => e.stopPropagation()}>
                <div className="w-full h-full relative bg-gray-800 rounded-lg shadow-2xl flex items-center justify-center">
                    {isLoading && (
                        <div className="text-center text-white">
                            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4">{progress || 'Loading PDF...'}</p>
                        </div>
                    )}
                    {!isLoading && imageUrls.length > 0 && (
                        <>
                            <FlipBook
                                width={500} height={707} size="stretch"
                                minWidth={200} maxWidth={1000} minHeight={282} maxHeight={1414}
                                maxShadowOpacity={0.5} showCover={true} mobileScrollSupport={true}
                                onFlip={handleFlip} className="shadow-2xl" ref={flipBook}
                            >
                                {imageUrls.map((imgUrl, index) => (
                                    <Page number={index + 1} key={index} onClick={() => setEnlargeState({ isOpen: true, index })}>
                                        <img src={imgUrl} alt={`Page ${index + 1}`} className="w-full h-full object-contain" />
                                    </Page>
                                ))}
                            </FlipBook>
                            <button onClick={prevPage} className="absolute top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white backdrop-blur-sm rounded-full w-11 h-11 flex items-center justify-center hover:bg-black/60 transition-colors left-0 md:left-4" aria-label="Previous Page"><ChevronLeftIcon className="w-6 h-6" /></button>
                            <button onClick={nextPage} className="absolute top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white backdrop-blur-sm rounded-full w-11 h-11 flex items-center justify-center hover:bg-black/60 transition-colors right-0 md:right-4" aria-label="Next Page"><ChevronRightIcon className="w-6 h-6" /></button>
                        </>
                    )}
                </div>
            </main>

            <footer className="w-full flex-shrink-0 flex items-center justify-center p-2" onClick={e => e.stopPropagation()}>
                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg p-2 flex items-center justify-center gap-2 border border-white/20">
                     <form onSubmit={handlePageJump} className="flex items-center">
                        <input type="text" value={pageInput} onChange={(e) => setPageInput(e.target.value)} onBlur={handlePageJump} className="w-10 h-8 text-center bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none" aria-label="Current page number"/>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">/ {!isLoading && imageUrls.length > 0 ? imageUrls.length : '...'}</span>
                     </form>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                    <button onClick={() => setShowThumbnails(p => !p)} className={btnClass()} title="Show Thumbnails"><Squares2X2Icon className="w-5 h-5"/></button>
                    <button onClick={toggleFullScreen} className={btnClass()} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>{isFullScreen ? <ExitFullScreenIcon className="w-5 h-5"/> : <EnterFullScreenIcon className="w-5 h-5"/>}</button>
                    <button onClick={handleDownloadPdf} className={btnClass()} title="Download Original PDF"><DocumentArrowDownIcon className="w-5 h-5"/></button>
                </div>
            </footer>
            
            <AnimatePresence>
                {showThumbnails && (
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 z-30"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {imageUrls.map((imgUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        flipBook.current?.pageFlip()?.flip(index);
                                        setShowThumbnails(false);
                                    }}
                                    className={`w-20 h-auto aspect-[3/4] flex-shrink-0 rounded overflow-hidden border-2 ${currentPage === index ? 'border-indigo-500' : 'border-transparent'}`}
                                >
                                    <img src={imgUrl} alt={`Thumbnail for page ${index+1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        </>
    );
};

export default PdfModal;