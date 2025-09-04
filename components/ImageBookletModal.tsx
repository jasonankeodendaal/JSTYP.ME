

import React, { useEffect, useRef, useState, useCallback } from 'react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ArrowDownTrayIcon, DocumentArrowDownIcon, ArchiveBoxArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, Squares2X2Icon, EnterFullScreenIcon, ExitFullScreenIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from './Icons.tsx';
import LocalMedia from './LocalMedia';
import { usePanZoom } from './usePanZoom.tsx';

const MotionDiv = motion.div as any;

// FIX: Define zoom scale constants to resolve 'Cannot find name' errors.
const MIN_SCALE = 0.8;
const MAX_SCALE = 8;

export const ImageBookletModal: React.FC<{
    title: string;
    imageUrls: string[];
    onClose: () => void;
}> = ({ title, imageUrls, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    const [currentPage, setCurrentPage] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingZip, setIsGeneratingZip] = useState(false);

    const { transform, isTransitioning, eventHandlers, zoomIn, zoomOut, resetZoom } = usePanZoom({ contentRef, viewportRef });

    useEffect(() => {
        resetZoom();
    }, [currentPage, resetZoom]);
    
    const goToPage = useCallback((index: number) => {
        if (index >= 0 && index < imageUrls.length) {
            setCurrentPage(index);
        }
    }, [imageUrls.length]);

    const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
    const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
    
    const toggleFullScreen = () => { if (!modalRef.current) return; if (!document.fullscreenElement) modalRef.current.requestFullscreen(); else document.exitFullscreen(); };
    
    const handleDownloadSingleImage = async () => {
        const url = imageUrls[currentPage];
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_')}_page_${currentPage + 1}.png`;
        link.click();
    };

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
            for (let i = 0; i < imageUrls.length; i++) {
                const img = new Image();
                img.src = imageUrls[i];
                await new Promise(resolve => img.onload = resolve);
                const { width, height } = doc.internal.pageSize;
                const imgProps = doc.getImageProperties(img);
                const ratio = Math.min(width / imgProps.width, height / imgProps.height);
                const imgWidth = imgProps.width * ratio;
                const imgHeight = imgProps.height * ratio;
                if (i > 0) doc.addPage();
                doc.addImage(img, 'PNG', (width - imgWidth) / 2, (height - imgHeight) / 2, imgWidth, imgHeight);
            }
            doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
        } catch(e) { console.error("PDF generation failed:", e); alert("Failed to generate PDF.");}
        finally { setIsGeneratingPdf(false); }
    };
    const handleDownloadZip = async () => {
        setIsGeneratingZip(true);
        try {
            const zip = new JSZip();
            for (let i = 0; i < imageUrls.length; i++) {
                const response = await fetch(imageUrls[i]);
                const blob = await response.blob();
                zip.file(`page_${i + 1}.png`, blob);
            }
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(e) { console.error("ZIP generation failed:", e); alert("Failed to generate ZIP.");}
        finally { setIsGeneratingZip(false); }
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); if (event.key === 'ArrowLeft') prevPage(); if (event.key === 'ArrowRight') nextPage(); };
        const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.body.style.overflow = 'hidden'; window.addEventListener('keydown', handleKeyDown); document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => { document.body.style.overflow = 'unset'; window.removeEventListener('keydown', handleKeyDown); document.removeEventListener('fullscreenchange', handleFullscreenChange); };
    }, [onClose, prevPage, nextPage]);

    const isWorking = isGeneratingPdf || isGeneratingZip;
    const btnClass = (disabled = false) => `p-2 rounded-full transition-colors ${disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`;
    
    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ref={modalRef} className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col z-50 p-2 sm:p-4" onClick={onClose} aria-modal="true" role="dialog">
            <header className="w-full max-w-6xl mx-auto flex-shrink-0 flex justify-between items-center text-white px-2 py-2">
                <h3 className="text-lg font-semibold truncate" title={title}>{title}</h3>
                <button onClick={onClose} aria-label="Close viewer" className="p-2 rounded-full hover:bg-white/20 transition-colors"><XIcon className="w-6 h-6" /></button>
            </header>
            
            <main ref={viewportRef} className="flex-grow w-full max-w-7xl mx-auto relative flex items-center justify-center min-h-0 overflow-hidden cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()} {...eventHandlers} style={{ touchAction: 'none' }}>
                <AnimatePresence initial={false}>
                    <MotionDiv 
                        key={currentPage} 
                        ref={contentRef} 
                        className="h-full" 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        transition={{ duration: 0.2, ease: 'easeOut' }} 
                        style={{ 
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                            transition: isTransitioning ? 'transform 0.2s ease-out' : 'none'
                        }}
                    >
                        <LocalMedia src={imageUrls[currentPage]} alt={`Page ${currentPage + 1}`} type="image" className="max-w-full max-h-full object-contain h-full" onDragStart={(e) => e.preventDefault()} />
                    </MotionDiv>
                </AnimatePresence>
            </main>

            <footer className="w-full flex-shrink-0 flex flex-col items-center justify-center p-2 gap-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <button onClick={prevPage} className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30" disabled={currentPage === 0}><ChevronLeftIcon className="w-6 h-6"/></button>
                    <span className="text-white font-semibold text-sm px-2">{currentPage + 1} / {imageUrls.length}</span>
                    <button onClick={nextPage} className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30" disabled={currentPage >= imageUrls.length - 1}><ChevronRightIcon className="w-6 h-6"/></button>
                </div>
                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg p-2 flex items-center justify-center gap-2 border border-white/20">
                    <button onClick={zoomOut} className={btnClass(transform.scale <= MIN_SCALE)} disabled={transform.scale <= MIN_SCALE} title="Zoom Out"><MagnifyingGlassMinusIcon className="w-5 h-5"/></button>
                    <button onClick={resetZoom} className={btnClass()} title="Reset Zoom"><Squares2X2Icon className="w-5 h-5"/></button>
                    <button onClick={zoomIn} className={btnClass(transform.scale >= MAX_SCALE)} disabled={transform.scale >= MAX_SCALE} title="Zoom In"><MagnifyingGlassPlusIcon className="w-5 h-5"/></button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                    <button onClick={toggleFullScreen} className={btnClass()} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>{isFullScreen ? <ExitFullScreenIcon className="w-5 h-5"/> : <EnterFullScreenIcon className="w-5 h-5"/>}</button>
                    <button onClick={handleDownloadSingleImage} className={btnClass(isWorking)} disabled={isWorking} title="Download Current Page"><ArrowDownTrayIcon className="w-5 h-5"/></button>
                    <button onClick={handleDownloadPdf} className={btnClass(isWorking)} disabled={isWorking} title={isGeneratingPdf ? "Generating..." : "Download as PDF"}>{isGeneratingPdf ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <DocumentArrowDownIcon className="w-5 h-5"/>}</button>
                    <button onClick={handleDownloadZip} className={btnClass(isWorking)} disabled={isWorking} title={isGeneratingZip ? "Generating..." : "Download as ZIP"}>{isGeneratingZip ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <ArchiveBoxArrowDownIcon className="w-5 h-5"/>}</button>
                </div>
            </footer>
        </MotionDiv>
    );
};
