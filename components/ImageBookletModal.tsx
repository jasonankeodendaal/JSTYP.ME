
import React, { useEffect, useRef, useState, useCallback } from 'react';
import JSZip from 'jszip';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ArrowDownTrayIcon, DocumentArrowDownIcon, ArchiveBoxArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, Squares2X2Icon, EnterFullScreenIcon, ExitFullScreenIcon } from './Icons.tsx';
import LocalMedia from './LocalMedia';
import ImageEnlargeModal from './ImageEnlargeModal.tsx';

const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; number: number, onClick: () => void; }>(({ children, number, onClick }, ref) => {
    return (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 cursor-zoom-in" ref={ref} data-density="hard" onClick={onClick}>
            <div className="w-full h-full flex items-center justify-center relative">
                {children}
                <div className="absolute bottom-2 text-center text-xs text-gray-400 dark:text-gray-500">{number}</div>
            </div>
        </div>
    );
});

const FlipBook = HTMLFlipBook as any;

export const ImageBookletModal: React.FC<{
    title: string;
    imageUrls: string[];
    onClose: () => void;
}> = ({ title, imageUrls, onClose }) => {
    const flipBook = useRef<any>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageInput, setPageInput] = useState('1');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingZip, setIsGeneratingZip] = useState(false);
    const [enlargeState, setEnlargeState] = useState<{ isOpen: boolean; index: number }>({ isOpen: false, index: 0 });
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const handleFlip = useCallback((e: any) => {
        setCurrentPage(e.data);
    }, []);

    useEffect(() => {
        setPageInput(String(currentPage + 1));
    }, [currentPage]);
    
    const prevPage = () => flipBook.current?.pageFlip()?.flipPrev();
    const nextPage = () => flipBook.current?.pageFlip()?.flipNext();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowLeft') prevPage();
            if (event.key === 'ArrowRight') nextPage();
        };

        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

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
            setPageInput(String(currentPage + 1)); // Reset if invalid
        }
    };
    
    const toggleFullScreen = () => {
        if (!modalRef.current) return;
        if (!document.fullscreenElement) {
            modalRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleDownloadSingleImage = async () => {
        const currentUrl = imageUrls[currentPage];
        try {
            const response = await fetch(currentUrl);
            const blob = await response.blob();
            let ext = 'jpg';
            if(blob.type.includes('png')) ext = 'png';

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_')}-page-${currentPage + 1}.${ext}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Could not download the image.');
        }
    };
    
    const handleDownloadPdf = async () => {
        if (isGeneratingPdf || isGeneratingZip) return;
        setIsGeneratingPdf(true);
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < imageUrls.length; i++) {
                const url = imageUrls[i];
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = url;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                
                const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
                const w = img.width * ratio;
                const h = img.height * ratio;
                const x = (pdfWidth - w) / 2;
                const y = (pdfHeight - h) / 2;
                if (i > 0) doc.addPage();
                doc.addImage(img, 'PNG', x, y, w, h);
            }
            doc.save(`${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
        } catch (error) {
            alert('Could not generate PDF.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDownloadZip = async () => {
        if (isGeneratingPdf || isGeneratingZip) return;
        setIsGeneratingZip(true);
        try {
            const zip = new JSZip();
            await Promise.all(imageUrls.map(async (url, i) => {
                const response = await fetch(url);
                const blob = await response.blob();
                let ext = 'jpg';
                if(blob.type.includes('png')) ext = 'png';
                zip.file(`page_${String(i + 1).padStart(3, '0')}.${ext}`, blob);
            }));
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Could not generate zip file.');
        } finally {
            setIsGeneratingZip(false);
        }
    };

    const isWorking = isGeneratingPdf || isGeneratingZip;
    const btnClass = (disabled = false) => `p-2 rounded-full transition-colors ${disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`;
    const navBtnClass = "absolute top-1/2 -translate-y-1/2 z-20 bg-black/40 text-white backdrop-blur-sm rounded-full w-11 h-11 flex items-center justify-center hover:bg-black/60 transition-colors";

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
            aria-modal="true"
            role="dialog"
        >
             <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <header className="w-full max-w-6xl mx-auto flex-shrink-0 flex justify-between items-center text-white px-2 py-2">
                <h3 className="text-lg font-semibold truncate" title={title}>{title}</h3>
                <button onClick={onClose} aria-label="Close viewer" className="p-2 rounded-full hover:bg-white/20 transition-colors"><XIcon className="w-6 h-6" /></button>
            </header>
            
            <main className="flex-grow w-full max-w-6xl mx-auto relative flex items-center justify-center min-h-0" onClick={e => e.stopPropagation()}>
                <div className="w-full h-full relative">
                     <FlipBook
                        width={500}
                        height={707}
                        size="stretch"
                        minWidth={200}
                        maxWidth={1000}
                        minHeight={282}
                        maxHeight={1414}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={handleFlip}
                        className="shadow-2xl"
                        ref={flipBook}
                    >
                        {imageUrls.map((url, index) => (
                             <Page number={index + 1} key={index} onClick={() => setEnlargeState({ isOpen: true, index })}>
                                <LocalMedia src={url} alt={`Page ${index + 1}`} type="image" className="w-full h-full object-contain" />
                            </Page>
                        ))}
                    </FlipBook>
                    <button onClick={prevPage} className={`${navBtnClass} left-0 md:left-4`} aria-label="Previous Page"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <button onClick={nextPage} className={`${navBtnClass} right-0 md:right-4`} aria-label="Next Page"><ChevronRightIcon className="w-6 h-6" /></button>
                </div>
            </main>

            <footer className="w-full flex-shrink-0 flex items-center justify-center p-2" onClick={e => e.stopPropagation()}>
                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg p-2 flex items-center justify-center gap-2 border border-white/20">
                     <form onSubmit={handlePageJump} className="flex items-center">
                        <input
                            type="text"
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onBlur={handlePageJump}
                            className="w-10 h-8 text-center bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none"
                            aria-label="Current page number"
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">/ {imageUrls.length}</span>
                     </form>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                    <button onClick={() => setShowThumbnails(p => !p)} className={btnClass()} title="Show Thumbnails"><Squares2X2Icon className="w-5 h-5"/></button>
                    <button onClick={toggleFullScreen} className={btnClass()} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>{isFullScreen ? <ExitFullScreenIcon className="w-5 h-5"/> : <EnterFullScreenIcon className="w-5 h-5"/>}</button>
                    <button onClick={handleDownloadSingleImage} className={btnClass(isWorking)} disabled={isWorking} title="Download Current Page"><ArrowDownTrayIcon className="w-5 h-5"/></button>
                    <button onClick={handleDownloadPdf} className={btnClass(isWorking)} disabled={isWorking} title={isGeneratingPdf ? "Generating..." : "Download as PDF"}>{isGeneratingPdf ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <DocumentArrowDownIcon className="w-5 h-5"/>}</button>
                    <button onClick={handleDownloadZip} className={btnClass(isWorking)} disabled={isWorking} title={isGeneratingZip ? "Generating..." : "Download as ZIP"}>{isGeneratingZip ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : <ArchiveBoxArrowDownIcon className="w-5 h-5"/>}</button>
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
                            {imageUrls.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        flipBook.current?.pageFlip()?.flip(index);
                                        setShowThumbnails(false);
                                    }}
                                    className={`w-20 h-auto aspect-[3/4] flex-shrink-0 rounded overflow-hidden border-2 ${currentPage === index ? 'border-indigo-500' : 'border-transparent'}`}
                                >
                                    <LocalMedia src={url} type="image" className="w-full h-full object-cover" />
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

export default ImageBookletModal;