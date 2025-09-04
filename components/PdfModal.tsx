
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, DocumentArrowDownIcon, ChevronLeftIcon, ChevronRightIcon, Squares2X2Icon, EnterFullScreenIcon, ExitFullScreenIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from './Icons.tsx';
import * as pdfjsLib from 'https://aistudiocdn.com/pdfjs-dist@^4.4.178/build/pdf.js';
import LocalMedia from './LocalMedia';

interface PdfModalProps {
    title: string;
    url: string;
    onClose: () => void;
}

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
    const interaction = useRef({ isPanning: false, startPan: { x: 0, y: 0 }, pointers: new Map<number, React.PointerEvent>(), startDist: 0 }).current;
    
    const [currentPage, setCurrentPage] = useState(0);
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const renderPdfToImages = async () => {
            setIsLoading(true); setProgress('');
            try {
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

    const applyConstraints = useCallback((scale: number, x: number, y: number) => {
        const viewport = viewportRef.current;
        const content = contentRef.current;
        if (!viewport || !content) return { scale, x, y };
        const newScale = Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE));
        if (newScale <= 1) return { scale: 1, x: 0, y: 0 };
        const maxOffsetX = Math.max(0, ((content.clientWidth * newScale) - viewport.clientWidth) / 2);
        const maxOffsetY = Math.max(0, ((content.clientHeight * newScale) - viewport.clientHeight) / 2);
        return { scale: newScale, x: Math.max(-maxOffsetX, Math.min(x, maxOffsetX)), y: Math.max(-maxOffsetY, Math.min(y, maxOffsetY)) };
    }, []);

    const updateTransform = useCallback((newVals: Partial<typeof transform>) => {
        setTransform(prev => {
            const temp = { ...prev, ...newVals };
            return applyConstraints(temp.scale, temp.x, temp.y);
        });
    }, [applyConstraints]);

    const resetTransform = useCallback(() => setTransform({ scale: 1, x: 0, y: 0 }), []);
    const goToPage = useCallback((index: number) => { if (index >= 0 && index < imageUrls.length) { setCurrentPage(index); resetTransform(); }}, [imageUrls.length, resetTransform]);
    const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
    const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
    
    const handleWheel = useCallback((e: React.WheelEvent) => { e.preventDefault(); const viewport = viewportRef.current; if (!viewport) return; const zoomFactor = 1 - e.deltaY * 0.002; const newScale = transform.scale * zoomFactor; const rect = viewport.getBoundingClientRect(); const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top; const newX = mouseX - (mouseX - transform.x) * zoomFactor; const newY = mouseY - (mouseY - transform.y) * zoomFactor; updateTransform({ scale: newScale, x: newX, y: newY }); }, [transform, updateTransform]);
    const handleDoubleClick = useCallback((e: React.MouseEvent) => { if (transform.scale > 1.1) { resetTransform(); } else { const viewport = viewportRef.current; if (!viewport) return; const rect = viewport.getBoundingClientRect(); const mouseX = e.clientX - rect.left; const mouseY = e.clientY - rect.top; updateTransform({ scale: 3, x: (viewport.clientWidth / 2) - mouseX * 3, y: (viewport.clientHeight / 2) - mouseY * 3 }); } }, [transform.scale, resetTransform, updateTransform]);
    const handlePointerDown = (e: React.PointerEvent) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); interaction.pointers.set(e.pointerId, e); if (interaction.pointers.size === 1) { interaction.isPanning = true; interaction.startPan = { x: e.clientX, y: e.clientY }; } else if (interaction.pointers.size === 2) { interaction.isPanning = false; const p = Array.from(interaction.pointers.values()); interaction.startDist = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY); }};
    const handlePointerMove = (e: React.PointerEvent) => { if (!interaction.pointers.has(e.pointerId)) return; interaction.pointers.set(e.pointerId, e); if (interaction.isPanning && interaction.pointers.size === 1) { const dx = e.clientX - interaction.startPan.x; const dy = e.clientY - interaction.startPan.y; interaction.startPan = { x: e.clientX, y: e.clientY }; updateTransform({ x: transform.x + dx, y: transform.y + dy }); } else if (interaction.pointers.size === 2) { const viewport = viewportRef.current; if (!viewport) return; const p = Array.from(interaction.pointers.values()); const dist = Math.hypot(p[0].clientX - p[1].clientX, p[0].clientY - p[1].clientY); const zoom = dist / interaction.startDist; interaction.startDist = dist; const newScale = transform.scale * zoom; const rect = viewport.getBoundingClientRect(); const cx = (p[0].clientX + p[1].clientX) / 2 - rect.left; const cy = (p[0].clientY + p[1].clientY) / 2 - rect.top; const newX = cx - (cx - transform.x) * zoom; const newY = cy - (cy - transform.y) * zoom; updateTransform({ scale: newScale, x: newX, y: newY }); }};
    const handlePointerUp = (e: React.PointerEvent) => { (e.target as HTMLElement).releasePointerCapture(e.pointerId); interaction.pointers.delete(e.pointerId); if (interaction.pointers.size < 2) { if (interaction.pointers.size === 1) { const p = Array.from(interaction.pointers.values())[0]; interaction.isPanning = true; interaction.startPan = { x: p.clientX, y: p.clientY }; } else { interaction.isPanning = false; } }};
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
            
            <main ref={viewportRef} className="flex-grow w-full max-w-7xl mx-auto relative flex items-center justify-center min-h-0 overflow-hidden cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()} onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onDoubleClick={handleDoubleClick} style={{ touchAction: 'none' }}>
                {isLoading && ( <div className="text-center text-white"><div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4">{progress || 'Loading PDF...'}</p></div> )}
                {!isLoading && imageUrls.length > 0 && (
                    <AnimatePresence initial={false}>
                        <MotionDiv key={currentPage} ref={contentRef} className="h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2, ease: 'easeOut' }} style={{ scale: transform.scale, x: transform.x, y: transform.y }}>
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
                    <button onClick={() => updateTransform({ scale: transform.scale / 1.5 })} className={btnClass(transform.scale <= MIN_SCALE)} disabled={transform.scale <= MIN_SCALE} title="Zoom Out"><MagnifyingGlassMinusIcon className="w-5 h-5"/></button>
                    <button onClick={resetTransform} className={btnClass()} title="Reset Zoom"><Squares2X2Icon className="w-5 h-5"/></button>
                    <button onClick={() => updateTransform({ scale: transform.scale * 1.5 })} className={btnClass(transform.scale >= MAX_SCALE)} disabled={transform.scale >= MAX_SCALE} title="Zoom In"><MagnifyingGlassPlusIcon className="w-5 h-5"/></button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                    <button onClick={toggleFullScreen} className={btnClass()} title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>{isFullScreen ? <ExitFullScreenIcon className="w-5 h-5"/> : <EnterFullScreenIcon className="w-5 h-5"/>}</button>
                    <button onClick={handleDownloadPdf} className={btnClass()} title="Download Original PDF"><DocumentArrowDownIcon className="w-5 h-5"/></button>
                </div>
            </footer>
        </MotionDiv>
    );
};

export default PdfModal;
