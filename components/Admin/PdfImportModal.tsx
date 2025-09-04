import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'https://aistudiocdn.com/pdfjs-dist@^4.4.178/build/pdf.js';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, UploadIcon, CheckIcon } from '../Icons.tsx';
import { useAppContext } from '../context/AppContext.tsx';

// FIX: Use the legacy worker script to avoid module loading issues in sandboxed environments.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.4.178/build/pdf.worker.js`;

interface ConvertedPage {
    pageNumber: number;
    dataUrl: string;
}

interface PdfImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (imagePaths: string[]) => void;
}

const MotionDiv = motion.div as any;

const PdfImportModal: React.FC<PdfImportModalProps> = ({ isOpen, onClose, onComplete }) => {
    const { saveFileToStorage } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const [pages, setPages] = useState<ConvertedPage[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setFile(null);
        setIsProcessing(false);
        setIsUploading(false);
        setProgress('');
        setPages([]);
        setSelectedPages(new Set());
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [resetState, onClose]);

    const handleFileChange = async (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Please select a valid .pdf file.');
            return;
        }
        
        resetState();
        setFile(selectedFile);
        setIsProcessing(true);
        setProgress('Reading PDF...');

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const newPages: ConvertedPage[] = [];

            for (let i = 1; i <= numPages; i++) {
                setProgress(`Rendering page ${i} of ${numPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 }); // Low-res preview
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport: viewport } as any).promise;
                
                newPages.push({ pageNumber: i, dataUrl: canvas.toDataURL('image/jpeg', 0.8) });
                setPages([...newPages]); // Update previews as they're generated
            }
            setProgress(`Found ${numPages} pages. Please select which pages to import.`);
            
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Could not process PDF.');
            setProgress('');
        } finally {
            setIsProcessing(false);
        }
    };

    const togglePageSelection = (pageNumber: number) => {
        setSelectedPages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pageNumber)) {
                newSet.delete(pageNumber);
            } else {
                newSet.add(pageNumber);
            }
            return newSet;
        });
    };
    
    const selectAllPages = () => {
        if (selectedPages.size === pages.length) {
            setSelectedPages(new Set());
        } else {
            setSelectedPages(new Set(pages.map(p => p.pageNumber)));
        }
    };
    
    const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], fileName, { type: 'image/png' });
    };

    const handleConfirmImport = async () => {
        if (selectedPages.size === 0) {
            alert('Please select at least one page to import.');
            return;
        }

        setIsUploading(true);
        setError(null);
        
        try {
            const savedPaths: string[] = [];
            const arrayBuffer = await file!.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const pagesToProcess = Array.from(selectedPages).sort((a,b) => a-b);
            let processedCount = 0;

            for (const pageNum of pagesToProcess) {
                processedCount++;
                setProgress(`Uploading page ${pageNum} (${processedCount}/${pagesToProcess.length})...`);
                
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 4.0 }); // High-res for saving
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { alpha: false });
                if (!context) continue;

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport: viewport, background: 'rgba(255,255,255,1)' } as any).promise;
                
                const dataUrl = canvas.toDataURL('image/png');
                const fileName = `${file!.name.replace('.pdf', '')}_page_${pageNum}.png`;
                const imageFile = await dataUrlToFile(dataUrl, fileName);

                const savedPath = await saveFileToStorage(imageFile);
                savedPaths.push(savedPath);
            }
            
            onComplete(savedPaths);
            handleClose();

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Could not upload images.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                 <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={handleClose}
                 >
                    <MotionDiv
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 30 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] border border-gray-200 dark:border-gray-700 flex flex-col"
                        onClick={(e: any) => e.stopPropagation()}
                    >
                         <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 section-heading">Import Pages from PDF</h3>
                            <button onClick={handleClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                        </header>
                        <main className="flex-grow p-6 overflow-y-auto">
                            {!file ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <label htmlFor="pdf-import-upload" className="cursor-pointer text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Click to upload a PDF file</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">or drag and drop</p>
                                    </label>
                                    <input ref={fileInputRef} id="pdf-import-upload" type="file" className="sr-only" accept="application/pdf" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                                     {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate" title={file.name}>{file.name}</p>
                                        <button onClick={() => fileInputRef.current?.click()} className="btn text-sm !py-1 !px-3">Change file</button>
                                    </div>

                                    {(isProcessing || isUploading || progress) && (
                                        <div className="text-center my-4">
                                            {(isProcessing || isUploading) && <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>}
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{progress}</p>
                                        </div>
                                    )}
                                    {error && <p className="my-4 text-sm text-center text-red-500">{error}</p>}
                                    
                                    {pages.length > 0 && (
                                        <>
                                            <div className="flex justify-end mb-2">
                                                <button onClick={selectAllPages} className="text-sm font-semibold text-indigo-600 hover:underline">
                                                    {selectedPages.size === pages.length ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                                                {pages.map(page => (
                                                    <div key={page.pageNumber} className="relative cursor-pointer group" onClick={() => togglePageSelection(page.pageNumber)}>
                                                        <img src={page.dataUrl} alt={`Page ${page.pageNumber}`} className={`w-full h-auto object-contain rounded-md border-2 ${selectedPages.has(page.pageNumber) ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}/>
                                                        <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 bg-white/80 transition-all ${selectedPages.has(page.pageNumber) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400 group-hover:border-indigo-400'}`}>
                                                            {selectedPages.has(page.pageNumber) && <CheckIcon className="w-full h-full text-white p-0.5" />}
                                                        </div>
                                                        <div className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-1.5 rounded">{page.pageNumber}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </main>
                        <footer className="flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                             <button onClick={handleClose} type="button" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                             <button onClick={handleConfirmImport} type="button" className="btn btn-primary" disabled={isProcessing || isUploading || selectedPages.size === 0}>
                                 {isUploading ? 'Importing...' : `Import ${selectedPages.size} Page(s)`}
                            </button>
                        </footer>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default PdfImportModal;