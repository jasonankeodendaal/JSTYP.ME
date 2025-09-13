import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext.tsx';
import type { Product, Brand, Category, Quote } from '../../types';
import { SearchIcon, ChevronLeftIcon, PlusIcon, TrashIcon, XIcon, CheckIcon, ChevronDownIcon } from '../Icons.tsx';
import LocalMedia from '../LocalMedia.tsx';

const MotionDiv = motion.div as any;

const FilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    brands: Brand[];
    categories: Category[];
    initialFilters: { brands: string[]; categories: string[] };
    onApply: (filters: { brands: string[]; categories: string[] }) => void;
}> = ({ isOpen, onClose, brands, categories, initialFilters, onApply }) => {
    const [tempFilters, setTempFilters] = useState(initialFilters);

    useEffect(() => {
        if (isOpen) {
            setTempFilters(initialFilters);
        }
    }, [isOpen, initialFilters]);
    
    const handleBrandToggle = (brandId: string) => {
        setTempFilters(prev => {
            const newBrands = new Set(prev.brands);
            if (newBrands.has(brandId)) {
                newBrands.delete(brandId);
            } else {
                newBrands.add(brandId);
            }
            // When brand selection changes, clear category selection to avoid mismatches
            return { brands: Array.from(newBrands), categories: [] };
        });
    };

    const handleCategoryToggle = (catId: string) => {
        setTempFilters(prev => {
            const newCats = new Set(prev.categories);
            if (newCats.has(catId)) {
                newCats.delete(catId);
            } else {
                newCats.add(catId);
            }
            return { ...prev, categories: Array.from(newCats) };
        });
    };
    
    const availableCategories = useMemo(() => {
        if (tempFilters.brands.length === 0) return categories;
        return categories.filter(c => tempFilters.brands.includes(c.brandId));
    }, [categories, tempFilters.brands]);

    const handleApplyFilters = () => {
        onApply(tempFilters);
        onClose();
    };

    const handleClearFilters = () => {
        setTempFilters({ brands: [], categories: [] });
        onApply({ brands: [], categories: [] });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                    <MotionDiv initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] border border-gray-200 dark:border-gray-700 flex flex-col" onClick={e => e.stopPropagation()}>
                        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold section-heading">Filter Products</h2>
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                        </header>
                        <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">Brands</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    {brands.map(brand => (
                                        <label key={brand.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
                                            <input type="checkbox" checked={tempFilters.brands.includes(brand.id)} onChange={() => handleBrandToggle(brand.id)} className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"/>
                                            <span>{brand.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Categories</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                     {availableCategories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
                                            <input type="checkbox" checked={tempFilters.categories.includes(cat.id)} onChange={() => handleCategoryToggle(cat.id)} className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"/>
                                            <span>{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </main>
                        <footer className="flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-between items-center rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                            <button onClick={handleClearFilters} className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600">Clear All Filters</button>
                            <button onClick={handleApplyFilters} className="btn btn-primary">Apply Filters</button>
                        </footer>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

const QuantityStepper: React.FC<{ quantity: number, onQuantityChange: (newQuantity: number) => void }> = ({ quantity, onQuantityChange }) => (
    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={() => onQuantityChange(quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-lg">-</button>
        <input 
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value, 10) || 0)}
            className="w-16 text-center bg-transparent font-bold text-lg"
            min="0"
        />
        <button type="button" onClick={() => onQuantityChange(quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-lg">+</button>
    </div>
);


const StockPick: React.FC = () => {
    const { brands, categories, products, clients, loggedInUser, addQuote, kioskId } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientId } = location.state || {};
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
    const [filters, setFilters] = useState<{ brands: string[]; categories: string[] }>({ brands: [], categories: [] });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const client = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (p.isDeleted || p.isDiscontinued) return false;

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchLower 
                ? p.name.toLowerCase().includes(searchLower) || p.sku.toLowerCase().includes(searchLower)
                : true;

            const matchesBrand = filters.brands.length > 0 ? filters.brands.includes(p.brandId) : true;
            const matchesCategory = filters.categories.length > 0 ? filters.categories.includes(p.categoryId || '') : true;

            return matchesSearch && matchesBrand && matchesCategory;
        });
    }, [products, searchTerm, filters]);

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
                    if (!catGroup) { catGroup = { category, products: [] }; brandGroup.categories.push(catGroup); }
                    catGroup.products.push(product);
                } else {
                    uncategorized.push(product);
                }
            }

            if (uncategorized.length > 0) { brandGroup.categories.push({ category: { id: `uncat-${brand.id}`, name: 'Other Products' }, products: uncategorized }); }
            
            brandGroup.categories.sort((a,b) => a.category.name.localeCompare(b.category.name));
            group.push(brandGroup);
        }
        return group;
    }, [filteredProducts, brands, categories]);
    
    const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
        setSelectedItems(prev => {
            const newItems = { ...prev };
            if (newQuantity <= 0) {
                delete newItems[productId];
            } else {
                newItems[productId] = newQuantity;
            }
            return newItems;
        });
    }, []);
    
    const handleSaveQuote = () => {
        if (Object.keys(selectedItems).length === 0) {
            alert("Please select at least one product.");
            return;
        }

        const newQuote: Quote = {
            id: `quote_${Date.now()}`,
            clientId,
            adminId: loggedInUser ? loggedInUser.id : 'kiosk_user',
            createdAt: Date.now(),
            status: 'pending',
            items: Object.entries(selectedItems).map(([productId, quantity]) => ({ productId, quantity })),
            kioskId: kioskId,
        };
        addQuote(newQuote);

        if (loggedInUser) {
            alert("Quote saved successfully!");
            navigate("/admin", { state: { defaultSubTab: 'quotes' } });
        } else {
            alert("Thank you for your request! Your quote will be processed shortly.");
            navigate("/");
        }
    };
    
    const selectedProducts = useMemo(() => {
        return Object.keys(selectedItems).map(productId => {
            const product = products.find(p => p.id === productId);
            return { product, quantity: selectedItems[productId] };
        }).filter((item): item is { product: Product; quantity: number } => item.product !== undefined);
    }, [selectedItems, products]);

    const totalQuantity = useMemo(() => Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0), [selectedItems]);
    const backPath = loggedInUser ? "/admin" : "/";
    
    if (!client) {
        return (
            <div className="text-center p-8">
                <p>No client selected.</p>
                <button onClick={() => navigate(backPath)} className="text-indigo-500 hover:underline mt-2 inline-block">Return</button>
            </div>
        );
    }

    return (
        <>
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} brands={brands.filter(b => !b.isDeleted)} categories={categories.filter(c => !c.isDeleted)} initialFilters={filters} onApply={setFilters} />
            <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col font-sans">
                <header className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm p-3 z-20 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate(backPath)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-6 h-6" /></button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 section-heading">Create Quote</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">For: {client.companyName}</p>
                            </div>
                        </div>
                        <div className="flex-grow flex justify-end items-center gap-3">
                            <div className="relative w-full max-w-xs">
                                <input type="text" placeholder="Search by name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-gray-300 dark:border-gray-600 focus:ring-indigo-500"/>
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                            <button onClick={() => setIsFilterOpen(true)} className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 !py-2">Filter</button>
                        </div>
                    </div>
                </header>
                
                <div className="flex-grow max-w-screen-2xl mx-auto w-full flex gap-6 p-4 overflow-hidden">
                    <main className="w-full lg:w-2/3 xl:w-3/4 overflow-y-auto pr-2 space-y-4">
                        {groupedProducts.length > 0 ? groupedProducts.map(({ brand, categories }) => (
                            <details key={brand.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border dark:border-gray-700/50" open>
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-700/50"><div className="flex items-center gap-4"><LocalMedia src={brand.logoUrl} alt={brand.name} type="image" className="h-10 object-contain" /><h2 className="font-semibold text-lg">{brand.name}</h2></div><ChevronDownIcon className="w-6 h-6 text-gray-500 transform group-open:rotate-180 transition-transform" /></summary>
                                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                                    {categories.map(({ category, products: catProducts }) => (
                                        <div key={category.id}>
                                            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 ml-2">{category.name}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                {catProducts.map(product => {
                                                    const isSelected = selectedItems[product.id] > 0;
                                                    return(
                                                        <div key={product.id} className={`rounded-xl p-3 border-2 transition-all duration-200 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500' : 'bg-gray-50 dark:bg-gray-900/40 border-transparent'}`}>
                                                            <div className="flex items-start gap-3">
                                                                <LocalMedia src={product.images[0]} alt={product.name} type="image" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2">{product.name}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 flex justify-center">
                                                                {isSelected ? <QuantityStepper quantity={selectedItems[product.id]} onQuantityChange={(qty) => handleQuantityChange(product.id, qty)} /> : <button onClick={() => handleQuantityChange(product.id, 1)} className="btn btn-secondary w-full !py-1.5 text-sm"><PlusIcon className="w-4 h-4"/>Add to Quote</button>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        )) : (
                            <div className="text-center py-16 flex flex-col items-center justify-center h-full"><p>No products match your search or filters.</p></div>
                        )}
                    </main>
                    
                    <aside className="hidden lg:flex w-1/3 xl:w-1/4 flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold section-heading">Current Quote</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedProducts.length} unique items</p>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto space-y-3">
                            <AnimatePresence>
                                {selectedProducts.map(({ product, quantity }) => (
                                    <MotionDiv key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
                                        <LocalMedia src={product.images[0]} alt={product.name} type="image" className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                                        <div className="flex-grow min-w-0"><p className="text-sm font-semibold truncate">{product.name}</p><input type="number" value={quantity} onChange={e => handleQuantityChange(product.id, parseInt(e.target.value, 10) || 0)} className="w-16 text-sm bg-gray-100 dark:bg-gray-700 rounded p-1"/></div>
                                        <button onClick={() => handleQuantityChange(product.id, 0)} className="p-2 text-gray-400 hover:text-red-500 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                                    </MotionDiv>
                                ))}
                            </AnimatePresence>
                            {selectedProducts.length === 0 && <p className="text-center text-sm text-gray-500 pt-8">Add products to get started.</p>}
                        </div>
                        <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                            <div className="flex justify-between items-center font-bold">
                                <span>Total Quantity</span>
                                <span>{totalQuantity}</span>
                            </div>
                            <button onClick={handleSaveQuote} disabled={totalQuantity === 0} className="btn btn-primary w-full mt-4">Save Quote</button>
                        </footer>
                    </aside>
                </div>
            </div>
        </>
    );
};

export default StockPick;
