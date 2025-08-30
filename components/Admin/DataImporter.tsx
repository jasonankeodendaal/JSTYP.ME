import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useAppContext } from '../context/AppContext.tsx';
import type { Brand, Product } from '../../types';
import { UploadIcon, ChevronRightIcon, PlusIcon } from '../Icons';

// Worker setup for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.4.54/build/pdf.worker.min.mjs`;

// Component state types
interface ExtractedPage {
    pageNum: number;
    texts: string[];
    images: { dataUrl: string; file: File }[];
    thumbnailUrl: string;
}

const DataImporter: React.FC = () => {
    const { brands, addProduct, saveFileToStorage } = useAppContext();
    
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedPage[]>([]);
    
    const [selectedPage, setSelectedPage] = useState<ExtractedPage | null>(null);
    const [productForm, setProductForm] = useState<Partial<Product>>({});
    const [selectedImages, setSelectedImages] = useState<Record<string, boolean>>({});
    const [isImporting, setIsImporting] = useState(false);
    const [importLog, setImportLog] = useState<string[]>([]);
    
    // File handling
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            resetState();
        } else {
            setError('Please upload a valid PDF file.');
        }
    };
    
    const resetState = () => {
        setError(null);
        setExtractedData([]);
        setSelectedPage(null);
        setProductForm({});
        setSelectedImages({});
        setImportLog([]);
    };
    
    // PDF processing
    const handleProcessPdf = async () => {
        if (!file) return;
        setIsProcessing(true);
        resetState();
        let imageErrorCount = 0;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const data: ExtractedPage[] = [];
            
            const imageOps = [
                pdfjsLib.OPS.paintImageXObject,
                pdfjsLib.OPS.paintImageXObjectRepeat,
            ];

            for (let i = 1; i <= numPages; i++) {
                setProgress(`Processing page ${i} of ${numPages}...`);
                const page = await pdf.getPage(i);
                
                // Generate thumbnail
                const thumbViewport = page.getViewport({ scale: 0.5 });
                const thumbCanvas = document.createElement('canvas');
                const thumbCtx = thumbCanvas.getContext('2d');
                thumbCanvas.height = thumbViewport.height;
                thumbCanvas.width = thumbViewport.width;
                if (thumbCtx) {
                    await page.render({ canvasContext: thumbCtx, viewport: thumbViewport } as any).promise;
                }
                const thumbnailUrl = thumbCanvas.toDataURL();

                // Extract texts
                const textContent = await page.getTextContent();
                const texts = textContent.items.map(item => 'str' in item ? item.str : '').filter(Boolean);
                
                // FIX: Implement robust image extraction to handle complex PDFs and avoid "object not resolved" errors.
                // This method inspects the page's operator list and can reconstruct images from raw pixel data if needed.
                const images: ExtractedPage['images'] = [];
                const opList = await page.getOperatorList();

                for (let j = 0; j < opList.fnArray.length; j++) {
                    if (imageOps.includes(opList.fnArray[j])) {
                        try {
                            const imgKey = opList.argsArray[j][0];
                            const img = await page.objs.get(imgKey);
                            if (!img || !img.data) continue;

                            const { width, height, data } = img;
                            let fileType: string = 'image/png';
                            let finalBlob: Blob | null = null;
                            
                            // Attempt 1: Check for common embedded formats (JPEG, PNG, GIF)
                            if (data[0] === 0xFF && data[1] === 0xD8) fileType = 'image/jpeg';
                            else if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) fileType = 'image/png';
                            else if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38) fileType = 'image/gif';
                            else fileType = '';

                            if (fileType) {
                                finalBlob = new Blob([data], { type: fileType });
                            } else {
                                // Attempt 2: Manually reconstruct image from raw pixel data using a canvas
                                const canvas = document.createElement('canvas');
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                if (!ctx) continue;
                                const imgData = ctx.createImageData(width, height);
                                const pixels = imgData.data;
                                const numPixels = width * height;
                                let handled = false;
                                
                                // Handle different color spaces
                                if (img.colorSpace?.name === 'DeviceGray' && data.length === numPixels) {
                                    for (let p = 0, q = 0; p < numPixels; p++, q += 4) { const v = data[p]; pixels[q] = v; pixels[q+1] = v; pixels[q+2] = v; pixels[q+3] = 255; } handled = true;
                                } else if (img.colorSpace?.name === 'DeviceRGB' && data.length === numPixels * 3) {
                                    for (let p = 0, q = 0; p < data.length; p += 3, q += 4) { pixels[q] = data[p]; pixels[q+1] = data[p+1]; pixels[q+2] = data[p+2]; pixels[q+3] = 255; } handled = true;
                                } else if (img.colorSpace?.name === 'DeviceCMYK' && data.length === numPixels * 4) {
                                    for (let p = 0, q = 0; p < data.length; p += 4, q += 4) {
                                        const c = data[p] / 255, m = data[p + 1] / 255, y = data[p + 2] / 255, k = data[p + 3] / 255;
                                        pixels[q] = 255 * (1 - c) * (1 - k); pixels[q + 1] = 255 * (1 - m) * (1 - k); pixels[q + 2] = 255 * (1 - y) * (1 - k); pixels[q + 3] = 255;
                                    } handled = true;
                                }

                                if (handled) {
                                    ctx.putImageData(imgData, 0, 0);
                                    const canvasDataUrl = canvas.toDataURL('image/png');
                                    finalBlob = await (await fetch(canvasDataUrl)).blob();
                                    fileType = 'image/png';
                                }
                            }

                            if (finalBlob) {
                                const dataUrl = await new Promise<string>((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onload = () => resolve(reader.result as string);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(finalBlob!);
                                });
                                const extension = (fileType.split('/')[1] || 'png').replace('jpeg', 'jpg');
                                const imageFile = new File([finalBlob], `image_${i}_${j}.${extension}`, { type: fileType });
                                images.push({ dataUrl, file: imageFile });
                            } else {
                                imageErrorCount++;
                                console.warn(`Skipping image on page ${i} due to unsupported format.`);
                            }

                        } catch (e) {
                            imageErrorCount++;
                            console.warn(`Skipping an image on page ${i} due to a PDF parsing error:`, e);
                        }
                    }
                }
                
                data.push({ pageNum: i, texts, images, thumbnailUrl });
            }
            setExtractedData(data);
            if (imageErrorCount > 0) {
                setError(`Extraction complete, but failed to process ${imageErrorCount} image(s) due to complex PDF formatting. You can still use the extracted text.`);
            }
            
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to process PDF.');
        } finally {
            setIsProcessing(false);
            setProgress('');
        }
    };
    
    // Product creation form
    const handleSelectPage = (page: ExtractedPage) => {
        setSelectedPage(page);
        setProductForm({
            brandId: brands[0]?.id || '',
            description: page.texts.join('\n\n'),
        });
        const allPageImages = page.images.reduce((acc, img, index) => ({ ...acc, [`${page.pageNum}-${index}`]: true }), {});
        setSelectedImages(allPageImages);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProductForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleImageToggle = (key: string) => {
        setSelectedImages(prev => ({...prev, [key]: !prev[key]}));
    };
    
    const handleAddProduct = async () => {
        if (!productForm.name || !productForm.sku || !productForm.brandId) {
            alert('Please fill out Name, SKU, and Brand.');
            return;
        }
        
        setIsImporting(true);
        setImportLog(prev => [...prev, `Importing "${productForm.name}"...`]);

        try {
            const imageUrls: string[] = [];
            const imagesToUpload = selectedPage?.images.filter((_, index) => selectedImages[`${selectedPage.pageNum}-${index}`]) || [];
            
            for (const img of imagesToUpload) {
                const savedPath = await saveFileToStorage(img.file);
                imageUrls.push(savedPath);
            }

            const newProduct: Product = {
                id: `p_pdf_${Date.now()}`,
                name: productForm.name,
                sku: productForm.sku,
                brandId: productForm.brandId,
                description: productForm.description || '',
                images: imageUrls,
                specifications: [],
                isDeleted: false,
                isDiscontinued: false,
                documents: [],
            };
            addProduct(newProduct);
            setImportLog(prev => [...prev, `✅ Successfully added "${productForm.name}".`]);
            setSelectedPage(null); // Go back to page list
        } catch (e) {
            setImportLog(prev => [...prev, `❌ Failed to import "${productForm.name}": ${e instanceof Error ? e.message : 'Unknown error'}`]);
        } finally {
            setIsImporting(false);
        }
    };
    
    // Render logic
    const renderContent = () => {
        if (isProcessing) {
            return (
                <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto border-4 border-gray-300 dark:border-gray-500 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{progress}</p>
                </div>
            );
        }
        
        if (selectedPage) {
            const inputStyle = "w-full mt-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm";
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Create Product from Page {selectedPage.pageNum}</h4>
                        <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Product Name*</label>
                                <input name="name" onChange={handleFormChange} className={inputStyle} />
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">SKU*</label>
                                <input name="sku" onChange={handleFormChange} className={inputStyle} />
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Brand*</label>
                                <select name="brandId" value={productForm.brandId} onChange={handleFormChange} className={`${inputStyle} appearance-none`}>
                                    {brands.filter(b=>!b.isDeleted).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Description</label>
                                <textarea name="description" value={productForm.description} onChange={handleFormChange} className={inputStyle} rows={6}></textarea>
                            </div>
                             <div className="flex justify-between items-center pt-2">
                                <button onClick={() => setSelectedPage(null)} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Back to Pages</button>
                                <button onClick={handleAddProduct} disabled={isImporting} className="btn btn-primary">
                                    <PlusIcon className="h-4 w-4" /> {isImporting ? 'Adding...' : 'Add to Kiosk'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Select Images</h4>
                         <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg">
                            {selectedPage.images.length > 0 ? selectedPage.images.map((img, index) => {
                                const key = `${selectedPage.pageNum}-${index}`;
                                const isSelected = selectedImages[key];
                                return (
                                    <div key={key} onClick={() => handleImageToggle(key)} className={`relative rounded-md overflow-hidden border-4 cursor-pointer ${isSelected ? 'border-indigo-500' : 'border-transparent'}`}>
                                        <img src={img.dataUrl} className="aspect-square object-contain bg-white" alt={`Extracted from page ${selectedPage.pageNum}`} />
                                        {isSelected && <div className="absolute inset-0 bg-indigo-500/30"></div>}
                                    </div>
                                )
                            }) : <p className="col-span-3 text-center text-sm p-4 text-gray-500">No images found on this page.</p>}
                        </div>
                    </div>
                </div>
            );
        }
        
        if (extractedData.length > 0) {
            return (
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Extraction Complete</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select a page to create a product from its content.</p>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto pr-2">
                        {extractedData.map(page => (
                            <button key={page.pageNum} onClick={() => handleSelectPage(page)} className="border rounded-lg p-2 hover:border-indigo-500 hover:shadow-lg transition-all text-center aspect-[8.5/11] flex flex-col items-center justify-center bg-white dark:bg-gray-800">
                                <img src={page.thumbnailUrl} className="max-h-24 object-contain mb-2" alt={`Page ${page.pageNum} thumbnail`}/>
                                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Page {page.pageNum}</span>
                                <span className="text-xs text-gray-500">{page.images.length} images</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        
        return null;
    };
    
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
                Upload a PDF catalogue. The tool will extract images and text from each page, allowing you to quickly create new product entries.
            </p>
            <div className="flex items-center gap-2">
                <label htmlFor="pdf-upload" className="flex-grow btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                    <UploadIcon className="h-4 w-4" />
                    <span>{file ? file.name : 'Select PDF File'}</span>
                </label>
                <input id="pdf-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
                <button onClick={handleProcessPdf} className="btn btn-primary" disabled={!file || isProcessing}>
                    Process PDF <ChevronRightIcon className="h-4 w-4" />
                </button>
            </div>
            
            {error && <p className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">{error}</p>}
            
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-xl border dark:border-gray-700">
                {renderContent() || <p className="text-center text-sm text-gray-500">Upload and process a PDF to begin.</p>}
            </div>

            {importLog.length > 0 && (
                 <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <h4 className="font-bold mb-2">Import Log</h4>
                    <div className="max-h-32 overflow-y-auto pr-2">
                        {importLog.map((log, i) => <p key={i}>{log}</p>)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataImporter;