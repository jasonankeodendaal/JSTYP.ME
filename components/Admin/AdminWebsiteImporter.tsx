import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useAppContext } from '../context/AppContext.tsx';
import type { Brand, Product } from '../../types';
import { SparklesIcon, LinkIcon } from '../Icons.tsx';

interface ScrapedData {
    brand: {
        name: string;
        logoUrl: string;
    };
    products: {
        name: string;
        description: string;
        sku: string;
        imageUrl: string;
        specifications?: { key: string; value: string }[];
    }[];
}

const AdminWebsiteImporter: React.FC = () => {
    const { addBrand, addProduct, brands, products, saveFileToStorage } = useAppContext();
    const [mode, setMode] = useState<'url' | 'api'>('url');
    const [url, setUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
    const [importLog, setImportLog] = useState<string[]>([]);

    const fetchAndSaveImage = async (imageUrl: string, fileNamePrefix: string): Promise<string> => {
        try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Failed to fetch image with status: ${response.status}`);
            
            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) throw new Error('Response was not a valid image file.');

            let extension = 'jpg';
            const type = blob.type.split('/')[1];
            if (type && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(type)) extension = type;
            
            const fileName = `${fileNamePrefix}_${Date.now()}.${extension}`;
            const file = new File([blob], fileName, { type: blob.type });
            return await saveFileToStorage(file);
        } catch (error) {
            console.error(`Could not process image from URL ${imageUrl}:`, error);
            throw error;
        }
    };

    const handleFetchData = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            setError('Please enter a website URL or API endpoint.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setScrapedData(null);
        setImportLog([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    brand: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, logoUrl: { type: Type.STRING } }, required: ["name", "logoUrl"] },
                    products: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, sku: { type: Type.STRING }, imageUrl: { type: Type.STRING } }, required: ["name", "description", "sku", "imageUrl"] } }
                },
                required: ["brand", "products"]
            };
            
            let prompt = '';
            let apiDataSample = null;

            if (mode === 'api') {
                const headers: HeadersInit = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
                const response = await fetch(url, { headers });
                if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
                const data = await response.json();
                apiDataSample = Array.isArray(data) ? data[0] : data;
                prompt = `Analyze the JSON object from an API, representing a product. Extract brand name, logo, and up to 5 key products with name, description, SKU, and image URL. Infer brand from URL if needed. Respond ONLY with a JSON object matching the schema. API URL for context: ${url}. Sample JSON: ${JSON.stringify(apiDataSample)}`;
            } else {
                 prompt = `Analyze the website at ${url}. Extract the main brand name, a URL to its logo, and 3-5 key products. For each product, find its name, a short description, its SKU (or generate one), and a direct image URL. Respond ONLY with a JSON object matching the schema.`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    ...(mode === 'url' && { tools: [{ googleSearch: {} }] }),
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            // FIX: Correctly access the 'text' property on the response object.
            if (!response.text) {
                throw new Error("The AI model returned an empty response.");
            }
            const parsedData = JSON.parse(response.text.trim());
            if (!parsedData.brand || !parsedData.products) throw new Error("AI did not return the expected data structure.");
            
            setScrapedData(parsedData);

        } catch (err) {
            console.error('Gemini API error:', err);
            const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(`Failed to fetch data. ${message}. Please check the URL and try again.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmImport = async () => {
        if (!scrapedData) return;

        setIsImporting(true);
        setError(null);
        setImportLog(['Starting import... This may take a moment as images are downloaded.']);

        const updateLog = (newLine: string) => setImportLog(prev => [...prev, newLine]);

        try {
            let brandToUse = brands.find(b => b.name.toLowerCase() === scrapedData.brand.name.toLowerCase());
            
            if (!brandToUse) {
                updateLog(`⏳ Downloading logo for "${scrapedData.brand.name}"...`);
                let savedLogoUrl = '';
                try {
                    savedLogoUrl = await fetchAndSaveImage(scrapedData.brand.logoUrl, 'logo');
                } catch (e) {
                    updateLog(`⚠️ Could not download logo. Using a placeholder.`);
                    savedLogoUrl = `https://placehold.co/300x150/E2E8F0/4A5568?text=${encodeURIComponent(scrapedData.brand.name)}`;
                }
                const newBrand: Brand = { id: `b_ai_${Date.now()}`, name: scrapedData.brand.name, logoUrl: savedLogoUrl };
                addBrand(newBrand);
                brandToUse = newBrand;
                updateLog(`✅ Brand "${newBrand.name}" created.`);
            } else {
                updateLog(`ℹ️ Brand "${brandToUse.name}" already exists.`);
            }

            let productsAdded = 0;
            for (const [i, p] of scrapedData.products.entries()) {
                if (products.some(existing => existing.sku.toLowerCase() === p.sku.toLowerCase())) {
                    updateLog(`⚠️ Product "${p.name}" skipped (SKU exists).`);
                    continue;
                }
                updateLog(`⏳ Downloading image for "${p.name}" (${i + 1}/${scrapedData.products.length})...`);
                let savedImageUrl = `https://placehold.co/800x600/E2E8F0/4A5568?text=${encodeURIComponent(p.name)}`;
                try { savedImageUrl = await fetchAndSaveImage(p.imageUrl, 'product'); } 
                catch (e) { updateLog(`⚠️ Image download failed for "${p.name}". Using placeholder.`); }
                
                const newProduct: Product = { id: `p_ai_${Date.now()}_${i}`, name: p.name, sku: p.sku, brandId: brandToUse.id, description: p.description, images: [savedImageUrl], specifications: p.specifications?.map(s => ({...s, id: `spec_${Date.now()}_${i}`})) || [] };
                addProduct(newProduct);
                productsAdded++;
            }
            updateLog(`✅ ${productsAdded} new products added.`);
            setScrapedData(null);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Unknown error.';
            setError(`Import failed: ${message}`);
            setImportLog([]);
        } finally {
            setIsImporting(false);
        }
    };
    
    const resetState = () => {
        setUrl('');
        setApiKey('');
        setIsLoading(false);
        setIsImporting(false);
        setError(null);
        setScrapedData(null);
        setImportLog([]);
    };

    return (
        <div className="space-y-4">
             <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-gray-100 dark:bg-gray-900 w-full sm:w-auto sm:inline-flex">
                <button onClick={() => setMode('url')} className={`flex-1 py-1.5 px-4 text-sm font-semibold rounded-md transition-colors ${mode === 'url' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>From Website URL</button>
                <button onClick={() => setMode('api')} className={`flex-1 py-1.5 px-4 text-sm font-semibold rounded-md transition-colors ${mode === 'api' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>From Product API</button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
                {mode === 'url' 
                    ? "Enter a brand's homepage or an e-commerce website. The AI will scrape the page for brand and product info."
                    : "Enter a URL to a product API endpoint that returns a JSON array of products. The AI will analyze the structure to import data."}
            </p>
            <form onSubmit={handleFetchData} className="space-y-2">
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={mode === 'url' ? "e.g., https://www.samsung.com/za/" : "e.g., https://api.yourstore.com/v1/products"} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm" disabled={isLoading || isImporting} />
                </div>
                 {mode === 'api' && (
                    <div className="relative">
                        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key / Bearer Token (Optional)" className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm" disabled={isLoading || isImporting} />
                    </div>
                )}
                <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isLoading || isImporting || !url}>
                    <SparklesIcon className="h-4 w-4" />
                    <span>{isLoading ? 'Analyzing...' : 'Fetch Data'}</span>
                </button>
            </form>
            
            {isLoading && <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-300">AI is analyzing... This can take up to a minute.</div>}
            {error && <p className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">{error}</p>}
            
            {scrapedData && (
                <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-xl space-y-4 border dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Preview of Found Content:</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {scrapedData.products.map(p => (
                            <div key={p.sku} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-gray-200"/>
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{p.name} ({p.sku})</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{p.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => setScrapedData(null)} className="btn bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200" disabled={isImporting}>Cancel</button>
                        <button onClick={handleConfirmImport} className="btn btn-primary" disabled={isImporting}>{isImporting ? 'Importing...' : `Add ${scrapedData.products.length} Products`}</button>
                    </div>
                </div>
            )}
            
            {(isImporting || (importLog.length > 1 && !scrapedData)) && (
                 <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <h4 className="font-bold mb-2">{isImporting ? 'Import in Progress...' : 'Import Complete!'}</h4>
                    <div className="max-h-48 overflow-y-auto pr-2 font-mono text-xs">{importLog.map((log, i) => <p key={i}>{log}</p>)}</div>
                    {!isImporting && <button onClick={resetState} className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 mt-2 !py-1 !px-2 text-xs">Start New Import</button>}
                </div>
            )}
        </div>
    );
};

export default AdminWebsiteImporter;
