import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext.tsx';
import type { Product, Brand, Category, Quote } from '../../types';
import { SearchIcon, ChevronDownIcon, PlusIcon, ChevronLeftIcon } from '../Icons.tsx';
import LocalMedia from '../LocalMedia.tsx';

const MotionDiv = motion.div as any;

const StockPick: React.FC = () => {
    const { brands, categories, products, clients, loggedInUser, addQuote } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientId } = location.state || {};
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

    const client = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) {
            return products.filter(p => !p.isDeleted && !p.isDiscontinued);
        }
        const lower = searchTerm.toLowerCase();
        return products.filter(p => 
            !p.isDeleted && !p.isDiscontinued &&
            (p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower))
        );
    }, [products, searchTerm]);

    const groupedProducts = useMemo(() => {
        const group: { brand: Brand; categories: { category: Category | {id: string, name: string}; products: Product[] }[] }[] = [];
        
        const visibleBrands = brands.filter(b => !b.isDeleted);

        for (const brand of visibleBrands) {
            const brandProducts = filteredProducts.filter(p => p.brandId === brand.id);
            if (brandProducts.length === 0) continue;

            const brandGroup: { brand: Brand; categories: { category: Category | {id: string, name: string}; products: Product[] }[] } = { brand, categories: [] };
            const brandCategories = categories.filter(c => c.brandId === brand.id && !c.isDeleted);
            const uncategorized: Product[] = [];

            for (const product of brandProducts) {
                const category = brandCategories.find(c => c.id === product.categoryId);
                if (category) {
                    let catGroup = brandGroup.categories.find(cg => cg.category.id === category.id);
                    if (!catGroup) {
                        catGroup = { category, products: [] };
                        brandGroup.categories.push(catGroup);
                    }
                    catGroup.products.push(product);
                } else {
                    uncategorized.push(product);
                }
            }

            if (uncategorized.length > 0) {
                brandGroup.categories.push({ category: { id: 'uncategorized', name: 'Other Products' }, products: uncategorized });
            }
            
            brandGroup.categories.sort((a,b) => a.category.name.localeCompare(b.category.name));
            group.push(brandGroup);
        }

        return group;
    }, [filteredProducts, brands, categories]);
    
    if (!clientId || !client) {
        return (
            <div className="text-center p-8">
                <p>No client selected.</p>
                <Link to="/admin" className="text-indigo-500 hover:underline mt-2 inline-block">Return to Dashboard</Link>
            </div>
        );
    }
    
    const handleQuantityChange = (productId: string, quantityStr: string) => {
        const quantity = parseInt(quantityStr, 10);
        if (isNaN(quantity) || quantity < 0) {
            // When user clears the input, quantityStr is "" and parseInt is NaN.
            // This correctly removes the item from selection.
            const newItems = { ...selectedItems };
            delete newItems[productId];
            setSelectedItems(newItems);
        } else {
            // This handles 0 and any positive integer.
            setSelectedItems(prev => ({ ...prev, [productId]: quantity }));
        }
    };
    
    const toggleItemSelection = (productId: string) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            if (newItems[productId]) {
                delete newItems[productId];
            } else {
                newItems[productId] = 1;
            }
            return newItems;
        });
    };
    
    const handleSaveQuote = () => {
        if (Object.keys(selectedItems).length === 0) {
            alert("Please select at least one product.");
            return;
        }

        const newQuote: Quote = {
            id: `quote_${Date.now()}`,
            clientId,
            adminId: loggedInUser!.id,
            createdAt: Date.now(),
            status: 'pending',
            items: Object.entries(selectedItems).map(([productId, quantity]) => ({ productId, quantity })),
        };
        addQuote(newQuote);
        alert("Quote saved successfully!");
        navigate("/admin");
    };

    const selectedItemCount = Object.keys(selectedItems).length;

    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm p-4 z-20 sticky top-0">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/admin')} 
                            className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Go back"
                        >
                            <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 section-heading">Create Stock Pick</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">For: {client.companyName}</p>
                        </div>
                    </div>
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            placeholder="Search all products by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="max-w-7xl mx-auto space-y-4">
                    {groupedProducts.length > 0 ? groupedProducts.map(({ brand, categories }) => (
                         <details key={brand.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border dark:border-gray-700/50" open>
                             <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <LocalMedia src={brand.logoUrl} alt={brand.name} type="image" className="h-10 object-contain" />
                                    <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200 section-heading">{brand.name}</h2>
                                </div>
                                <ChevronDownIcon className="w-6 h-6 text-gray-500 transform group-open:rotate-180 transition-transform" />
                            </summary>
                             <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                                {categories.map(({ category, products }) => (
                                    <div key={category.id}>
                                        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 ml-2">{category.name}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {products.map(product => (
                                                <div 
                                                    key={product.id} 
                                                    className={`rounded-xl p-3 border-2 transition-all duration-200 cursor-pointer ${selectedItems[product.id] !== undefined ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500' : 'bg-gray-100 dark:bg-gray-900/40 border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                    onClick={() => toggleItemSelection(product.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <LocalMedia src={product.images[0]} alt={product.name} type="image" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{product.name}</p>
                                                            <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {selectedItems[product.id] !== undefined && (
                                                            <MotionDiv initial={{height: 0, opacity: 0, marginTop: 0}} animate={{height: 'auto', opacity: 1, marginTop: '0.75rem'}} exit={{height: 0, opacity: 0, marginTop: 0}}>
                                                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                                    <label htmlFor={`qty-${product.id}`} className="text-sm font-medium text-gray-600 dark:text-gray-400">Qty:</label>
                                                                    <input 
                                                                        type="number"
                                                                        id={`qty-${product.id}`}
                                                                        value={selectedItems[product.id] ?? ''}
                                                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                                        className="w-full text-center bg-white dark:bg-gray-700 rounded-md py-1.5 px-2 text-sm border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        min="0"
                                                                    />
                                                                </div>
                                                            </MotionDiv>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )) : (
                        <div className="text-center py-16">
                            <p className="text-gray-600 dark:text-gray-400">No products match your search.</p>
                        </div>
                    )}
                </div>
            </main>

            <AnimatePresence>
                {selectedItemCount > 0 && (
                    <MotionDiv
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-30"
                    >
                        <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-3 flex items-center justify-between">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{selectedItemCount} {selectedItemCount === 1 ? 'item' : 'items'} selected</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setSelectedItems({})} className="btn bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 !py-2">Clear</button>
                                <button onClick={handleSaveQuote} className="btn btn-primary !py-2">Save Quote</button>
                            </div>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StockPick;