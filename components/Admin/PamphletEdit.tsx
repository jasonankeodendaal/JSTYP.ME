
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import type { Pamphlet } from '../../types';
import { ChevronLeftIcon, SaveIcon, UploadIcon, TrashIcon, DocumentArrowRightIcon } from '../Icons.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import LocalMedia from '../LocalMedia';
import PdfImportModal from './PdfImportModal.tsx';

const inputStyle = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm";

const getInitialFormData = (): Pamphlet => ({
    id: `pam_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: '',
    imageUrl: '',
    type: 'image',
    imageUrls: [],
    startDate: '',
    endDate: '',
});

const PamphletEdit: React.FC = () => {
    const { pamphletId } = useParams<{ pamphletId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { pamphlets, addPamphlet, updatePamphlet, saveFileToStorage, loggedInUser } = useAppContext();

    const isEditing = Boolean(pamphletId);
    const [formData, setFormData] = useState<Pamphlet>(getInitialFormData());
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    
    const canGoBack = location.key !== 'default';
    const backLabel = canGoBack ? 'Back' : 'Back to Dashboard';
    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManagePamphlets;

    const handleBack = () => {
        if (canGoBack) {
            navigate(-1);
        } else {
            navigate('/admin', { replace: true }); // Fallback to admin dashboard
        }
    };

    useEffect(() => {
        if (isEditing && pamphletId) {
            const pamphlet = pamphlets.find(p => p.id === pamphletId);
            if (pamphlet) {
                setFormData(pamphlet);
            }
        } else {
            setFormData(getInitialFormData());
        }
    }, [pamphletId, pamphlets, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const fileName = await saveFileToStorage(e.target.files[0], ['pamphlets', formData.id]);
                setFormData(prev => ({ ...prev, imageUrl: fileName }));
            } catch (error) {
                 alert(error instanceof Error ? error.message : "Failed to save image.");
            }
        }
    };

    const handleDocumentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && formData.type === 'image') {
             for (const file of Array.from(e.target.files)) {
                try {
                    const savedPath = await saveFileToStorage(file, ['pamphlets', formData.id, 'pages']);
                    setFormData(prev => {
                        if (prev.type !== 'image') return prev;
                        return { ...prev, imageUrls: [...prev.imageUrls, savedPath] };
                    });
                } catch (error) { alert(error instanceof Error ? error.message : "Failed to save image."); }
            }
        }
    };
    
    const handlePdfImportComplete = (imagePaths: string[]) => {
        setFormData(prev => {
            if (prev.type !== 'image') return prev;
            return { ...prev, imageUrls: [...prev.imageUrls, ...imagePaths] };
        });
    };

    const removeDocumentImage = (index: number) => {
        if (formData.type === 'image') {
            const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, type: 'image', imageUrls: newImageUrls }));
        }
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const imagesAreSet = formData.type === 'image' && formData.imageUrls.length > 0;
        if (!formData.title || !formData.imageUrl || !formData.startDate || !formData.endDate || !imagesAreSet) {
            alert('Please fill out Title, Start/End Dates, upload a cover image, and provide at least one page image.');
            return;
        }

        setSaving(true);
        if (isEditing) {
            updatePamphlet(formData);
        } else {
            addPamphlet(formData);
        }
        
        setTimeout(() => {
            setSaving(false);
            if (isEditing) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                navigate(`/admin/pamphlet/edit/${formData.id}`, { replace: true });
            }
        }, 300);
    };

    const pageContent = (
        !canManage ? (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage pamphlets.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        ) : (
            <>
            <PdfImportModal 
                isOpen={isPdfModalOpen} 
                onClose={() => setIsPdfModalOpen(false)} 
                onComplete={handlePdfImportComplete}
                pathPrefixSegments={['pamphlets', formData.id, 'pages']}
            />
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
                                {isEditing ? 'Edit Pamphlet' : 'Create New Pamphlet'}
                            </h2>
                            {isEditing && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Editing "{formData.title}"</p>}
                        </div>
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <button
                                type="submit"
                                disabled={saving || saved}
                                className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}
                            >
                                <SaveIcon className="h-4 w-4" />
                                {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column - Main Details */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Pamphlet Information</h3>
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-6 gap-y-6 gap-x-4">
                                <div className="col-span-1 sm:col-span-6">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                    <input type="text" name="title" id="title" value={formData.title} onChange={handleInputChange} className={inputStyle} required />
                                </div>
                                <div className="col-span-1 sm:col-span-3">
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                    <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleInputChange} className={inputStyle} required />
                                </div>
                                <div className="col-span-1 sm:col-span-3">
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                    <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleInputChange} className={inputStyle} required />
                                </div>
                            </div>
                        </div>
                    </div>
                     {/* Right Column - Assets */}
                     <div className="col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Pamphlet Assets</h3>
                            <div className="mt-4 space-y-6">
                                <div>
                                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image</span>
                                    <div className="h-48 w-auto aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-xl border dark:border-gray-600 flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                                        <LocalMedia src={formData.imageUrl} alt="Cover preview" type="image" className="rounded-xl object-cover h-full w-full"/>
                                    </div>
                                    <label htmlFor="image-upload" className="mt-2 w-full cursor-pointer inline-flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <UploadIcon className="h-4 w-4"/>
                                        <span>{formData.imageUrl ? 'Change Cover' : 'Upload Cover'}</span>
                                    </label>
                                    <input id="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pamphlet Pages</span>
                                    <div className="mt-2 space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            {formData.type === 'image' && formData.imageUrls.map((img, index) => (
                                                <div key={index} className="relative group aspect-[3/4]">
                                                    <LocalMedia src={img} alt={`Page ${index+1}`} type="image" className="rounded-md object-cover w-full h-full" />
                                                    <button type="button" onClick={() => removeDocumentImage(index)} className="absolute top-1 right-1 p-1 bg-white/80 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete image">
                                                        <TrashIcon className="w-3 h-3"/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border dark:border-gray-600 space-y-2">
                                            <label htmlFor="doc-image-upload" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 w-full justify-center">
                                                <UploadIcon className="h-4 w-4"/>
                                                <span>Add Image(s)</span>
                                            </label>
                                            <input id="doc-image-upload" type="file" multiple onChange={handleDocumentImageUpload} className="sr-only" accept="image/*" />
                                            <button type="button" onClick={() => setIsPdfModalOpen(true)} className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 w-full justify-center">
                                                <DocumentArrowRightIcon className="h-4 w-4" />
                                                Import from PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            </>
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

export default PamphletEdit;
