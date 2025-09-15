import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import type { ScreensaverAd, AdLink, ScreensaverMedia } from '../../types.ts';
import { ChevronLeftIcon, SaveIcon, UploadIcon, TrashIcon, Bars3Icon } from '../Icons.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import LocalMedia from '../LocalMedia.tsx';
import { Reorder, motion } from 'framer-motion';

const inputStyle = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm";
const selectStyle = inputStyle;

const getInitialFormData = (): ScreensaverAd => ({
    id: `ad_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: '',
    media: [],
    startDate: '',
    endDate: '',
});

const MediaItemEditor: React.FC<{
    item: ScreensaverMedia;
    onDelete: (id: string) => void;
    onUpdate: (id: string, field: string, value: any) => void;
}> = ({ item, onDelete, onUpdate }) => {
    
    const handleOverlayChange = (field: 'headline' | 'subheadline' | 'textColor' | 'backgroundColor', value: string) => {
        onUpdate(item.id, `overlay.${field}`, value);
    };

    return (
         <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0 flex items-center gap-3">
                 <button type="button" className="cursor-grab p-2 text-gray-400"><Bars3Icon className="h-5 w-5"/></button>
                 <LocalMedia src={item.url} alt="Media preview" type={item.type} className="w-24 h-24 object-cover rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex-grow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {item.type === 'image' && (
                        <div>
                            <label htmlFor={`duration-${item.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300">Duration (seconds)</label>
                            <input
                                id={`duration-${item.id}`}
                                type="number"
                                value={item.duration || ''}
                                onChange={e => onUpdate(item.id, 'duration', parseInt(e.target.value, 10) || undefined)}
                                className={inputStyle}
                                placeholder={`Default (${useAppContext().settings.screensaverImageDuration}s)`}
                            />
                        </div>
                    )}
                     <div className="md:col-span-2">
                         <label htmlFor={`headline-${item.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300">Overlay Headline</label>
                        <input id={`headline-${item.id}`} type="text" value={item.overlay?.headline || ''} onChange={e => handleOverlayChange('headline', e.target.value)} className={inputStyle} />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor={`subheadline-${item.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300">Overlay Subheadline</label>
                        <input id={`subheadline-${item.id}`} type="text" value={item.overlay?.subheadline || ''} onChange={e => handleOverlayChange('subheadline', e.target.value)} className={inputStyle} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Text Color</label>
                        <input type="color" value={item.overlay?.textColor || '#FFFFFF'} onChange={e => handleOverlayChange('textColor', e.target.value)} className="mt-1 p-1 h-10 w-full block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg"/>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Background Color</label>
                        <input type="text" value={item.overlay?.backgroundColor || 'rgba(0,0,0,0.4)'} onChange={e => handleOverlayChange('backgroundColor', e.target.value)} className={inputStyle} placeholder="e.g., rgba(0,0,0,0.5)" />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                <button type="button" onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
            </div>
        </div>
    );
};


const AdEdit: React.FC = () => {
    const { adId } = useParams<{ adId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { screensaverAds, addAd, updateAd, brands, products, catalogues, pamphlets, saveFileToStorage, loggedInUser } = useAppContext();
    const isEditing = Boolean(adId);

    const [formData, setFormData] = useState<ScreensaverAd>(getInitialFormData());
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [linkType, setLinkType] = useState('none');
    const [linkTarget, setLinkTarget] = useState('');
    
    const canGoBack = location.key !== 'default';
    const backLabel = canGoBack ? 'Back' : 'Back to Dashboard';

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageScreensaver;

    const handleBack = () => {
        if (canGoBack) {
            navigate(-1);
        } else {
            navigate('/admin', { replace: true }); // Fallback to admin dashboard
        }
    };

    useEffect(() => {
        if (!isEditing) {
            setFormData(getInitialFormData());
            setLinkType('none');
            setLinkTarget('');
        }
    }, [isEditing]);

    useEffect(() => {
        if (isEditing && adId) {
            const ad = screensaverAds.find(p => p.id === adId);
            if (ad) {
                setFormData(ad);

                if (ad.link) {
                    setLinkType(ad.link.type);
                    setLinkTarget('url' in ad.link ? ad.link.url : ad.link.id);
                } else {
                    setLinkType('none');
                    setLinkTarget('');
                }
            } else {
                navigate('/admin', { replace: true });
            }
        }
    }, [adId, isEditing, screensaverAds, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            for (const file of files) {
                const fileType = file.type.startsWith('image/') ? 'image' : 'video';
                try {
                    const fileName = await saveFileToStorage(file, ['ads', formData.id]);
                    const newMediaItem: ScreensaverMedia = {
                        id: `media_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                        url: fileName,
                        type: fileType,
                        overlay: { headline: '', subheadline: '', textColor: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.4)' }
                    };
                    setFormData(prev => ({
                        ...prev,
                        media: [...prev.media, newMediaItem]
                    }));
                } catch (error) {
                    alert(error instanceof Error ? error.message : "Failed to save media file.");
                }
            }
            e.target.value = ''; // Allow re-uploading the same file
        }
    };

    const handleMediaDelete = (idToDelete: string) => {
        setFormData(prev => ({
            ...prev,
            media: prev.media.filter((item) => item.id !== idToDelete)
        }));
    };

    const handleMediaItemUpdate = (itemId: string, field: string, value: any) => {
        setFormData(prev => {
            const newMedia = prev.media.map(item => {
                if (item.id === itemId) {
                    if (field.startsWith('overlay.')) {
                        const overlayField = field.split('.')[1];
                        const newOverlay = { ...(item.overlay || { headline: '', subheadline: '', textColor: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.4)' }), [overlayField]: value };
                        return { ...item, overlay: newOverlay };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            });
            return { ...prev, media: newMedia };
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.media.length === 0) {
            alert("Please upload at least one media file for the ad.");
            return;
        }

        let linkObject: AdLink | undefined = undefined;
        if (linkType !== 'none' && linkTarget) {
             if (linkType === 'external') {
                linkObject = { type: 'external', url: linkTarget };
            } else {
                linkObject = { type: linkType as 'brand' | 'product' | 'catalogue' | 'pamphlet', id: linkTarget };
            }
        }

        const finalData = { ...formData, link: linkObject };
        setSaving(true);
        if (isEditing) {
            updateAd(finalData);
            setTimeout(() => {
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }, 300);
        } else {
            addAd(finalData);
            setTimeout(() => {
                setSaving(false);
                navigate(`/admin/ad/${finalData.id}`, { replace: true });
            }, 300);
        }
    };

     const pageContent = (
        !canManage ? (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage the screensaver.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        ) : (
            <form onSubmit={handleSave} className="space-y-8">
                {/* Header */}
                <div>
                    <button type="button" onClick={handleBack} className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
                        <ChevronLeftIcon className="h-5 w-5 mr-1" />
                        {backLabel}
                    </button>
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-3xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate">
                                {isEditing ? 'Edit Ad' : 'Create New Ad'}
                            </h2>
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <button
                                type="submit"
                                disabled={saving || saved}
                                className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
                            >
                                <SaveIcon className="h-4 w-4" />
                                {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Ad')}
                            </button>
                        </div>
                    </div>
                </div>
                {/* Form Content */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 section-heading">Ad Details</h3>
                             <div className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ad Title</label>
                                    <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className={inputStyle} required />
                                </div>
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                    <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleInputChange} className={inputStyle} required />
                                </div>
                                 <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                    <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleInputChange} className={inputStyle} required />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 section-heading">Link (Optional)</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">When the screensaver is touched while this ad is showing, it will navigate to this link.</p>
                             <div className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="linkType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link Type</label>
                                    <select id="linkType" value={linkType} onChange={e => { setLinkType(e.target.value); setLinkTarget(''); }} className={selectStyle}>
                                        <option value="none">None</option>
                                        <option value="product">Product</option>
                                        <option value="brand">Brand</option>
                                        <option value="catalogue">Catalogue</option>
                                        <option value="pamphlet">Pamphlet</option>
                                        <option value="external">External URL</option>
                                    </select>
                                </div>
                                {linkType !== 'none' && (
                                    <div>
                                        <label htmlFor="linkTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target</label>
                                        {linkType === 'external' ? (
                                            <input type="url" id="linkTarget" value={linkTarget} onChange={e => setLinkTarget(e.target.value)} className={inputStyle} placeholder="https://example.com" />
                                        ) : (
                                            <select id="linkTarget" value={linkTarget} onChange={e => setLinkTarget(e.target.value)} className={selectStyle}>
                                                <option value="">Select...</option>
                                                {linkType === 'product' && products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                {linkType === 'brand' && brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                {linkType === 'catalogue' && catalogues.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                                {linkType === 'pamphlet' && pamphlets.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                            </select>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                         <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 section-heading">Media Files & Overlays</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Upload one or more images or videos. Drag to reorder.</p>
                            <Reorder.Group axis="y" values={formData.media} onReorder={(newOrder) => setFormData(p => ({...p, media: newOrder}))} className="mt-4 space-y-3">
                                {formData.media.map(item => (
                                    <Reorder.Item key={item.id} value={item} as="div" className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                                        <MediaItemEditor item={item} onDelete={handleMediaDelete} onUpdate={handleMediaItemUpdate} />
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                            <label htmlFor="media-upload" className="mt-4 cursor-pointer w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                                <UploadIcon className="w-8 h-8"/>
                                <span className="mt-2 text-sm font-medium">Add Media</span>
                                <input id="media-upload" type="file" multiple onChange={handleMediaChange} className="sr-only" accept="image/*,video/mp4,video/webm" />
                            </label>
                        </div>
                    </div>
                 </div>
            </form>
        )
    );
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto">
                 <div className="bg-white/90 dark:bg-gray-800/70 p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
                    {pageContent}
                 </div>
            </div>
        </div>
    );
};

export default AdEdit;
