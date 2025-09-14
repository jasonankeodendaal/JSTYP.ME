import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext.tsx';
import type { Quote, Product } from '../../types';
import { XIcon, UploadIcon, CheckIcon } from '../Icons.tsx';
import LocalMedia from '../LocalMedia.tsx';

const MotionDiv = motion.div as any;

interface QuoteFulfillmentModalProps {
    quote: Quote;
    onClose: () => void;
}

const QuoteFulfillmentModal: React.FC<QuoteFulfillmentModalProps> = ({ quote, onClose }) => {
    const { products, clients, updateQuote, saveFileToStorage } = useAppContext();
    const [tickedItems, setTickedItems] = useState<Set<string>>(new Set(quote.tickedItems || []));
    const [isUploading, setIsUploading] = useState(false);

    const client = clients.find(c => c.id === quote.clientId);

    const handleToggleItem = (productId: string) => {
        setTickedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const file = e.target.files[0];
                const fileName = await saveFileToStorage(file, ['quotes', quote.id]);
                // We need to update the quote in the context to get the new image URL reflected
                const updatedQuote = { ...quote, quoteImageUrl: fileName, tickedItems: Array.from(tickedItems) };
                updateQuote(updatedQuote);
            } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to save quote image.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSaveChanges = (markAsQuoted = false) => {
        const updatedQuote: Quote = {
            ...quote,
            tickedItems: Array.from(tickedItems),
            status: markAsQuoted ? 'quoted' : quote.status,
        };
        updateQuote(updatedQuote);
        onClose();
    };

    return (
        <AnimatePresence>
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <MotionDiv
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] border border-gray-200 dark:border-gray-700 flex flex-col"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 section-heading">Fulfill Quote</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">For: {client?.companyName}</p>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                    </header>

                    <main className="flex-grow p-6 overflow-y-auto space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Product Checklist</h3>
                            <div className="space-y-3">
                                {quote.items.map(item => {
                                    const product = products.find(p => p.id === item.productId);
                                    if (!product) return null;
                                    const isTicked = tickedItems.has(item.productId);
                                    return (
                                        <div key={item.productId} className={`p-3 rounded-lg flex items-center gap-4 transition-colors ${isTicked ? 'bg-green-50 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-900/40'}`}>
                                            <div
                                                onClick={() => handleToggleItem(item.productId)}
                                                className={`flex-shrink-0 w-6 h-6 rounded-md border-2 cursor-pointer flex items-center justify-center ${isTicked ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500'}`}
                                            >
                                                {isTicked && <CheckIcon className="w-4 h-4 text-white" />}
                                            </div>
                                            <LocalMedia src={product.images[0]} alt={product.name} type="image" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                                            </div>
                                            <div className="font-bold text-lg text-gray-900 dark:text-gray-100">{item.quantity}x</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Final Quote Document</h3>
                             <div className="flex items-center gap-4">
                                {quote.quoteImageUrl && (
                                     <a href={quote.quoteImageUrl} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 border rounded-lg overflow-hidden">
                                        <LocalMedia src={quote.quoteImageUrl} type="image" className="w-full h-full object-cover" />
                                     </a>
                                )}
                                <div className="flex-grow">
                                     <label htmlFor="quote-upload" className="w-full btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 justify-center">
                                        <UploadIcon className="h-4 w-4" />
                                        <span>{isUploading ? 'Uploading...' : (quote.quoteImageUrl ? 'Replace Image' : 'Upload Image')}</span>
                                    </label>
                                    <input id="quote-upload" type="file" className="sr-only" onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload a scanned copy or photo of the signed quote document.</p>
                                </div>
                             </div>
                        </div>
                    </main>

                    <footer className="flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => handleSaveChanges()} type="button" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Save Progress</button>
                        <button onClick={() => handleSaveChanges(true)} type="button" className="btn btn-primary">Mark as Quoted & Close</button>
                    </footer>
                </MotionDiv>
            </MotionDiv>
        </AnimatePresence>
    );
};

export default QuoteFulfillmentModal;