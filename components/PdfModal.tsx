import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, DocumentArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, Squares2X2Icon, EnterFullScreenIcon, ExitFullScreenIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from './Icons.tsx';
// FIX: Switched to namespace import to resolve module resolution errors.
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import { usePanZoom } from './usePanZoom.tsx';

interface PdfModalProps {
    title: string;
    url: string;
    onClose: () => void;
}

// FIX: Set workerSrc on the pdfjsLib.GlobalWorkerOptions object.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.4.178/build/pdf.worker.js`;

const MIN_SCALE = 0.8;
const MAX_SCALE = 8;
const MotionDiv = motion.div as any;

const PdfModal: React.FC<PdfModalProps> = ({ title, url, onClose }) => {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const { transform, isTransitioning, eventHandlers, zoomIn, zoomOut, resetZoom } = usePanZoom({ contentRef, viewportRef });

    useEffect(() => {
        const renderPdfToImages = async () => {
            setIsLoading(true); setProgress('');
            try {
                // FIX: Use the getDocument method from the imported namespace.
                const pdf = await pdfjsLib.getDocument(url).promise;
                const urls: string[] = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    setProgress(`Rendering page ${i} of ${pdf.numPages}...`);
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { alpha: false });
                    if (!context) continue;
                    canvas.height = viewport.height; canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport, background: 'rgba(255,255,255,1)' } as any).promise;
                    urls.push(canvas.toDataURL('image/png'));
                }
                setImageUrls(urls);
            } catch (error) { setProgress('Error: Could not load document.'); } 
            finally { setIsLoading(false); }
        };
        if (url) renderPdfToImages();
    }, [url]);

    useEffect(() => {
        resetZoom();
    }, [currentPage, resetZoom]);
    
    const goToPage = useCallback((index: number) => { if (index >= 0 && index < imageUrls.length) { setCurrentPage(index); }}, [imageUrls.length]);
    const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
    const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
    
    const toggleFullScreen = () => { if (!modalRef.current) return; if (!document.fullscreenElement) modalRef.current.requestFullscreen(); else document.exitFullscreen(); };
    const handleDownloadPdf = () => { const a = document.createElement('a'); a.href = url; a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`; a.click(); };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); if (event.key === 'ArrowLeft') prevPage(); if (event.key === 'ArrowRight') nextPage(); };
        const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.body.style.overflow = 'hidden'; window.addEventListener('keydown', handleKeyDown); document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', handleKeyDown); document.removeEventListener('fullscreenchange', handleFullscreenChange); };
    }, [onClose, prevPage, nextPage]);

    const btnClass = (disabled = false) => `p-2 rounded-full transition-colors ${disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`;
    
    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ref={modalRef} className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col z-50 p-2 sm:p-4" onClick={onClose} aria-modal="true" role="dialog">
            <header className="w-full max-w-6xl mx-auto flex-shrink-0 flex justify-between items-center text-white px-2 py-2">
                <h3 className="text-lg font-semibold truncate" title={title}>{title}</h3>
                <button onClick={onClose} aria-label="Close viewer" className="p-2 rounded-full hover:bg-white/20 transition-colors"><XIcon className="w-6 h-6" /></button>
            </header>
            
            <main ref={viewportRef} className="flex-grow w-full max-w-7xl mx-auto relative flex items-center justify-center min-h-0 overflow-hidden cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()} {...eventHandlers} style={{ touchAction: 'none' }}>
                {isLoading && ( <div className="text-center text-white"><div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4">{progress || 'Loading PDF...'}</p></div> )}
                {!isLoading && imageUrls.length > 0 && (
                    <AnimatePresence initial={false}>
                        <MotionDiv key={currentPage} ref={contentRef} className="h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2, ease: 'easeOut' }} style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transition: isTransitioning ? 'transform 0.2s ease-out' : 'none' }}>
                            <img src={imageUrls[currentPage]} alt={`Page ${currentPage + 1}`} className="max-w-full max-h-full object-contain h-full shadow-lg" onDragStart={(e) => e.preventDefault()} />
                        </MotionDiv>
                    </AnimatePresence>
                )}
            </main>

            <footer className="w-full flex-shrink-0 flex flex-col items-center justify-center p-2 gap-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <button onClick={prevPage} className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30" disabled={currentPage === 0}><ChevronLeftIcon className="w-6 h-6"/></button>
                    <span className="text-white font-semibold text-sm px-2">{currentPage + 1} / {imageUrls.length > 0 ? imageUrls.length : '-'}</span>
                    <button onClick={nextPage} className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30" disabled={currentPage >= imageUrls.length - 1}><ChevronRightIcon className="w-6 h-6"/></button>
                </div>
                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg p-2 flex items-center justify-center gap-2 border border-white/20">
                    <button onClick={zoomOut} className={btnClass(transform.scale <= MIN_SCALE)} disabled={transform.scale <= MIN_SCALE} title="Zoom Out"><MagnifyingGlassMinusIcon className="w-5 h-5"/></button>
                    <button onClick={resetZoom} className={btnClass()} title="Reset Zoom"><Squares2X2Icon className="w-5 h-5"/></button>
                    <button onClick={zoomIn} className={btnClass(transform.scale >= MAX_SCALE)} disabled={transform.scale >= MAX_SCALE} title="Zoom In"><MagnifyingGlassPlusIcon className="w-5 h-5"/></button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                    <button onClick={toggleFullScreen} className={btnClass()} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>{isFullScreen ? <ExitFullScreenIcon className="w-5 h-5"/> : <EnterFullScreenIcon className="w-5 h-5"/>}</button>
                    <button onClick={handleDownloadPdf} className={btnClass()} title="Download Original PDF"><DocumentArrowDownIcon className="w-5 h-5"/></button>
                </div>
            </footer>
        </MotionDiv>
    );
};

export default PdfModal;
