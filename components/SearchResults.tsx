import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ProductCard from './ProductCard.tsx';
import { ChevronLeftIcon } from './Icons.tsx';
import { useAppContext } from './context/AppContext.tsx';

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { products } = useAppContext();
    const query = useMemo(() => searchParams.get('q') || '', [searchParams]);
    const navigate = useNavigate();
    const location = useLocation();
    const [backLabel, setBackLabel] = useState('Back');
    const canGoBack = location.key !== 'default';

    useEffect(() => {
        if (canGoBack) {
            setBackLabel('Back');
        } else {
            setBackLabel('Back to Home');
        }
    }, [canGoBack]);

    const handleBack = () => {
        if (canGoBack) {
            navigate(-1);
        } else {
            navigate('/', { replace: true }); // Fallback to home page
        }
    };

    const filteredProducts = useMemo(() => {
        if (!query) return [];
        const lowerCaseQuery = query.toLowerCase();
        return products.filter(product => 
            !product.isDiscontinued &&
            !product.isDeleted &&
            (product.name.toLowerCase().includes(lowerCaseQuery) ||
            product.description.toLowerCase().includes(lowerCaseQuery) ||
            product.sku.toLowerCase().includes(lowerCaseQuery))
        );
    }, [query, products]);

    return (
        <div className="space-y-8">
            <div>
                <button type="button" onClick={handleBack} className="inline-flex items-center text-gray-400 hover:text-gray-100 mb-4">
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    {backLabel}
                </button>
                <h1 className="text-4xl font-bold tracking-tight text-gray-100">
                    Search Results
                </h1>
                {query && (
                     <p className="mt-2 text-lg text-gray-300">
                        Showing results for: <span className="font-semibold text-gray-100">"{query}"</span>
                    </p>
                )}
            </div>
            
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-200">No products found</h3>
                    <p className="text-gray-500 mt-2">We couldn't find any products matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default SearchResults;