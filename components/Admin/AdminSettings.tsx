import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { SaveIcon, UploadIcon, LinkIcon, ServerStackIcon, EyeIcon, TrashIcon, ChevronUpIcon, PlusIcon, ChevronDownIcon, ComputerDesktopIcon, XIcon } from '../Icons.tsx';
import type { Settings, FontStyleSettings, ThemeColors, NavLink } from '../../types.ts';
import LocalMedia from '../LocalMedia.tsx';
import { Link } from 'react-router-dom';
import FormSection from './FormSection.tsx';
import KioskPreview from './KioskPreview.tsx';
import { AnimatePresence, motion } from 'framer-motion';

// --- FORM SUB-COMPONENTS ---
const inputStyle = "block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 sm:text-sm";
const labelStyle = "block text-sm font-medium text-gray-800 dark:text-gray-200";

const ColorInput: React.FC<{ label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className={labelStyle}>{label}</label>
        <div className="mt-1 flex items-center gap-2">
            <input type="color" value={value || '#000000'} onChange={onChange} className="p-1 h-10 w-10 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg" />
            <input type="text" value={value} onChange={onChange} className={inputStyle} />
        </div>
    </div>
);

const ImageUpload: React.FC<{
    label: string;
    value: string;
    onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}> = ({ label, value, onTextChange, onFileChange, onRemove }) => (
    <div>
        <label className={labelStyle}>{label}</label>
        <div className="mt-1 flex items-center gap-4">
            <div className="h-16 w-16 p-1 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                <LocalMedia src={value} type="image" alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex-grow">
                <div className="flex gap-2">
                    <label htmlFor={`file-upload-${label}`} className="flex-grow btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 !py-2 justify-center">
                        <UploadIcon className="h-4 w-4" />
                        <span>Upload</span>
                    </label>
                    <input id={`file-upload-${label}`} type="file" className="sr-only" onChange={onFileChange} accept="image/*" />
                    <button type="button" onClick={onRemove} className="btn bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/50 !p-2">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
                <input type="text" value={value} onChange={onTextChange} className={`${inputStyle} mt-2`} placeholder="File path, URL or gradient..." />
            </div>
        </div>
    </div>
);

const FontStyleEditor: React.FC<{ title: string, value: FontStyleSettings, onChange: (newValue: FontStyleSettings) => void }> = ({ title, value, onChange }) => {
    const handleFontChange = (field: keyof FontStyleSettings, fieldValue: any) => {
        onChange({ ...value, [field]: fieldValue });
    };

    return (
        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
            <h4 className="font-semibold">{title}</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium">Font Family</label>
                    <input type="text" value={value.fontFamily} onChange={e => handleFontChange('fontFamily', e.target.value)} className={inputStyle} />
                </div>
                 <div>
                    <label className="text-xs font-medium">Font Weight</label>
                    <select value={value.fontWeight} onChange={e => handleFontChange('fontWeight', e.target.value)} className={inputStyle}>
                        <option value="300">Light</option>
                        <option value="400">Normal</option>
                        <option value="500">Medium</option>
                        <option value="600">Semi-Bold</option>
                        <option value="700">Bold</option>
                        <option value="800">Extra-Bold</option>
                        <option value="900">Black</option>
                    </select>
                </div>
                 <div>
                    <label className="text-xs font-medium">Font Style</label>
                    <select value={value.fontStyle} onChange={e => handleFontChange('fontStyle', e.target.value)} className={inputStyle}>
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                    </select>
                </div>
                 <div>
                    <label className="text-xs font-medium">Text Decoration</label>
                    <select value={value.textDecoration} onChange={e => handleFontChange('textDecoration', e.target.value)} className={inputStyle}>
                        <option value="none">None</option>
                        <option value="underline">Underline</option>
                    </select>
                </div>
                 <div>
                    <label className="text-xs font-medium">Letter Spacing</label>
                    <input type="text" value={value.letterSpacing} onChange={e => handleFontChange('letterSpacing', e.target.value)} className={inputStyle} placeholder="e.g., normal or 0.1em" />
                </div>
                 <div>
                    <label className="text-xs font-medium">Text Transform</label>
                    <select value={value.textTransform} onChange={e => handleFontChange('textTransform', e.target.value)} className={inputStyle}>
                        <option value="none">None</option>
                        <option value="uppercase">Uppercase</option>
                        <option value="lowercase">Lowercase</option>
                        <option value="capitalize">Capitalize</option>
                    </select>
                </div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden text-center text-2xl truncate" style={{
                fontFamily: value.fontFamily,
                fontWeight: value.fontWeight,
                fontStyle: value.fontStyle,
                textDecoration: value.textDecoration,
                letterSpacing: value.letterSpacing,
                textTransform: value.textTransform,
            }}>
                The quick brown fox jumps over the lazy dog.
            </div>
        </div>
    );
};


// --- MAIN SETTINGS COMPONENT ---
const AdminSettings: React.FC = () => {
    const { settings, updateSettings, saveFileToStorage, loggedInUser, kioskId, setKioskId } = useAppContext();
    const [formData, setFormData] = useState<Settings>(settings);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSettings;

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleNestedChange = (path: string, value: any) => {
        setFormData(prev => {
            const keys = path.split('.');
            const newFormData = JSON.parse(JSON.stringify(prev)); // Deep copy
            let currentLevel: any = newFormData;
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel = currentLevel[keys[i]];
            }
            currentLevel[keys[keys.length - 1]] = value;
            return newFormData;
        });
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const fileName = await saveFileToStorage(e.target.files[0]);
                handleNestedChange(path, fileName);
            } catch(error) {
                alert(error instanceof Error ? error.message : 'File upload failed.');
            }
        }
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        updateSettings(formData);
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 300);
    };

    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage settings.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Form Controls */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSave} className="space-y-8">
                        <BrandingAndIdentitySection formData={formData} onFileChange={handleFileChange} onNestedChange={handleNestedChange} kioskId={kioskId} setKioskId={setKioskId} loggedInUser={loggedInUser} />
                        <ThemeAndAppearanceSection formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />
                        <CreatorProfileSection formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />
                        <LoginPageStyleSection formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />
                        <TypographySection formData={formData} onNestedChange={handleNestedChange} />
                        <NavigationSection navLinks={formData.navigation.links} onNavLinksChange={(links) => handleNestedChange('navigation.links', links)} />
                        <KioskBehaviorSection formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />

                        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button type="submit" className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`} disabled={saving || saved}>
                                <SaveIcon className="h-4 w-4" />
                                {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save All Settings')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Live Preview (Desktop Only) */}
                <div className="hidden lg:block lg:col-span-1 sticky top-24">
                    <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
                        <ComputerDesktopIcon className="w-5 h-5"/>
                        <h3 className="text-lg font-semibold section-heading">Live Preview</h3>
                    </div>
                    <KioskPreview settings={formData} />
                </div>
            </div>

            {/* Mobile Preview FAB */}
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="lg:hidden fixed bottom-20 right-6 z-40 btn btn-primary !rounded-full !p-3 shadow-lg flex items-center gap-2 animate-bounce"
              aria-label="Show Live Preview"
            >
              <ComputerDesktopIcon className="w-6 h-6" />
              <span>Preview</span>
            </button>
    
            {/* Mobile Preview Modal */}
            <AnimatePresence>
                {isPreviewModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col p-4"
                        onClick={() => setIsPreviewModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                            className="w-full h-full bg-transparent flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <header className="flex-shrink-0 flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-t-2xl border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 section-heading ml-2">Live Preview</h3>
                                <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close preview">
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </header>
                            <div className="flex-grow overflow-y-auto bg-gray-200 dark:bg-gray-900 rounded-b-2xl">
                               <KioskPreview settings={formData} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// --- SECTION SUB-COMPONENTS ---
const BrandingAndIdentitySection: React.FC<{formData: Settings, onFileChange: any, onNestedChange: any, kioskId: string, setKioskId: (newId: string) => void, loggedInUser: any}> = ({formData, onFileChange, onNestedChange, kioskId, setKioskId, loggedInUser}) => (
    <FormSection title="Brand & Kiosk Identity" description="Basic branding and identification for this specific device." defaultOpen>
         <ImageUpload
            label="Logo"
            value={formData.logoUrl}
            onTextChange={(e) => onNestedChange('logoUrl', e.target.value)}
            onFileChange={(e) => onFileChange(e, 'logoUrl')}
            onRemove={() => onNestedChange('logoUrl', '')}
        />
        <div>
            <label htmlFor="kioskId" className={labelStyle}>Unique Kiosk ID</label>
            <input id="kioskId" type="text" readOnly={!loggedInUser?.isMainAdmin} value={kioskId} onChange={(e) => setKioskId(e.target.value)}
                className={`${inputStyle} mt-1 ${!loggedInUser?.isMainAdmin ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
            <p className="mt-1 text-xs text-gray-500">This unique ID identifies this device for analytics. It can only be changed by the main admin.</p>
        </div>
    </FormSection>
);

const ThemeAndAppearanceSection: React.FC<{formData: Settings, onNestedChange: any, onFileChange: any}> = ({formData, onNestedChange, onFileChange}) => (
    <FormSection title="Theme & Appearance" description="Define color palettes and global styles for the public-facing kiosk.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemeEditor title="Light Theme" theme="light" themeData={formData.lightTheme} onNestedChange={onNestedChange} onFileChange={onFileChange} />
            <ThemeEditor title="Dark Theme" theme="dark" themeData={formData.darkTheme} onNestedChange={onNestedChange} onFileChange={onFileChange} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
                <label className={labelStyle}>Card Corner Radius</label>
                <select value={formData.cardStyle.cornerRadius} onChange={e => onNestedChange('cardStyle.cornerRadius', e.target.value)} className={inputStyle}>
                    <option value="rounded-none">None</option><option value="rounded-lg">Medium</option><option value="rounded-2xl">Large</option><option value="rounded-3xl">Extra Large</option>
                </select>
            </div>
            <div>
                <label className={labelStyle}>Card Shadow</label>
                <select value={formData.cardStyle.shadow} onChange={e => onNestedChange('cardStyle.shadow', e.target.value)} className={inputStyle}>
                    <option value="shadow-md">Medium</option><option value="shadow-lg">Large</option><option value="shadow-xl">Extra Large</option>
                </select>
            </div>
            <div>
                <label className={labelStyle}>Layout Width</label>
                <select value={formData.layout.width} onChange={e => onNestedChange('layout.width', e.target.value)} className={inputStyle}>
                    <option value="standard">Standard (Centered)</option><option value="wide">Wide (Full Width)</option>
                </select>
            </div>
            <div>
                <label className={labelStyle}>Page Transitions</label>
                <select value={formData.pageTransitions.effect} onChange={e => onNestedChange('pageTransitions.effect', e.target.value)} className={inputStyle}>
                    <option value="none">None</option><option value="fade">Fade</option><option value="slide">Slide</option>
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ElementStyleEditor title="Header" element="header" value={formData.header} onNestedChange={onNestedChange} onFileChange={onFileChange} />
            <ElementStyleEditor title="Footer" element="footer" value={formData.footer} onNestedChange={onNestedChange} onFileChange={onFileChange} />
        </div>
    </FormSection>
);

const ThemeEditor: React.FC<{title: string, theme: 'light' | 'dark', themeData: ThemeColors, onNestedChange: any, onFileChange: any}> = ({title, theme, themeData, onNestedChange, onFileChange}) => (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
        <h4 className="font-semibold">{title}</h4>
        <ColorInput label="Primary Color" value={themeData.primary} onChange={e => onNestedChange(`${theme}Theme.primary`, e.target.value)} />
        <ImageUpload
            label="App Background Image"
            value={themeData.appBgImage}
            onTextChange={(e) => onNestedChange(`${theme}Theme.appBgImage`, e.target.value)}
            onFileChange={(e) => onFileChange(e, `${theme}Theme.appBgImage`)}
            onRemove={() => onNestedChange(`${theme}Theme.appBgImage`, '')}
        />
        <ColorInput label="App Background Color" value={themeData.appBg} onChange={e => onNestedChange(`${theme}Theme.appBg`, e.target.value)} />
        <ColorInput label="Main Content Background" value={themeData.mainBg} onChange={e => onNestedChange(`${theme}Theme.mainBg`, e.target.value)} />
        <ColorInput label="Main Text Color" value={themeData.mainText} onChange={e => onNestedChange(`${theme}Theme.mainText`, e.target.value)} />
    </div>
);

const ElementStyleEditor: React.FC<{title: string, element: 'header' | 'footer', value: any, onNestedChange: any, onFileChange: any}> = ({title, element, value, onNestedChange, onFileChange}) => (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
        <h4 className="font-semibold">{title} Style</h4>
        <div className="grid grid-cols-2 gap-4">
            <ColorInput label="Background" value={value.backgroundColor} onChange={e => onNestedChange(`${element}.backgroundColor`, e.target.value)} />
            <ColorInput label="Text Color" value={value.textColor} onChange={e => onNestedChange(`${element}.textColor`, e.target.value)} />
        </div>
        <ImageUpload
            label="Background Image"
            value={value.backgroundImageUrl}
            onTextChange={(e) => onNestedChange(`${element}.backgroundImageUrl`, e.target.value)}
            onFileChange={(e) => onFileChange(e, `${element}.backgroundImageUrl`)}
            onRemove={() => onNestedChange(`${element}.backgroundImageUrl`, '')}
        />
        <div>
            <label className={labelStyle}>Effect</label>
            <select value={value.effect} onChange={e => onNestedChange(`${element}.effect`, e.target.value)} className={inputStyle}>
                <option value="none">None</option><option value="glassmorphism">Glassmorphism</option><option value="3d-shadow">3D Shadow</option>
            </select>
        </div>
    </div>
);

const CreatorProfileSection: React.FC<{formData: Settings, onNestedChange: any, onFileChange: any}> = ({formData, onNestedChange, onFileChange}) => {
    const creator = formData.creatorProfile;
    return (
        <FormSection title="Creator Profile" description="Edit the details shown in the 'JSTYP.me' contact popup in the footer.">
            <div className="py-5 grid grid-cols-3 gap-4 items-center border-b border-gray-200 dark:border-gray-700">
                <div className="col-span-2">
                    <label htmlFor="creatorProfile-enabled" className={`${labelStyle} cursor-pointer`}>Enable Creator Popup</label>
                    <p className="mt-1 text-xs text-gray-500">Show the JSTYP.me logo and contact card in the public footer.</p>
                </div>
                <div className="col-span-1 flex justify-end">
                    <label htmlFor="creatorProfile-enabled" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="creatorProfile-enabled"
                                className="sr-only peer"
                                checked={creator.enabled}
                                onChange={(e) => onNestedChange('creatorProfile.enabled', e.target.checked)}
                            />
                            <div className="block w-14 h-8 rounded-full transition-colors bg-gray-300 dark:bg-gray-600 peer-checked:bg-indigo-500"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
                        </div>
                    </label>
                </div>
            </div>
             <ImageUpload 
                label="Avatar Image (for popup)"
                value={creator.imageUrl}
                onTextChange={(e) => onNestedChange('creatorProfile.imageUrl', e.target.value)}
                onFileChange={(e) => onFileChange(e, 'creatorProfile.imageUrl')}
                onRemove={() => onNestedChange('creatorProfile.imageUrl', '')}
            />
            <ImageUpload 
                label="Footer Logo (Dark Theme)"
                value={creator.logoUrlDark || ''}
                onTextChange={(e) => onNestedChange('creatorProfile.logoUrlDark', e.target.value)}
                onFileChange={(e) => onFileChange(e, 'creatorProfile.logoUrlDark')}
                onRemove={() => onNestedChange('creatorProfile.logoUrlDark', '')}
            />
            <ImageUpload 
                label="Footer Logo (Light Theme)"
                value={creator.logoUrlLight || ''}
                onTextChange={(e) => onNestedChange('creatorProfile.logoUrlLight', e.target.value)}
                onFileChange={(e) => onFileChange(e, 'creatorProfile.logoUrlLight')}
                onRemove={() => onNestedChange('creatorProfile.logoUrlLight', '')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelStyle}>Name</label><input type="text" value={creator.name} onChange={e => onNestedChange('creatorProfile.name', e.target.value)} className={inputStyle} /></div>
                <div><label className={labelStyle}>Title</label><input type="text" value={creator.title} onChange={e => onNestedChange('creatorProfile.title', e.target.value)} className={inputStyle} /></div>
                <div><label className={labelStyle}>Phone</label><input type="tel" value={creator.phone} onChange={e => onNestedChange('creatorProfile.phone', e.target.value)} className={inputStyle} /></div>
                <div><label className={labelStyle}>Email</label><input type="email" value={creator.email} onChange={e => onNestedChange('creatorProfile.email', e.target.value)} className={inputStyle} /></div>
                <div><label className={labelStyle}>Website URL</label><input type="url" value={creator.website} onChange={e => onNestedChange('creatorProfile.website', e.target.value)} className={inputStyle} /></div>
                <div><label className={labelStyle}>Website Display Text</label><input type="text" value={creator.websiteText} onChange={e => onNestedChange('creatorProfile.websiteText', e.target.value)} className={inputStyle} /></div>
                <div className="md:col-span-2"><label className={labelStyle}>WhatsApp Number</label><input type="text" value={creator.whatsapp} onChange={e => onNestedChange('creatorProfile.whatsapp', e.target.value)} className={inputStyle} placeholder="e.g., 27821234567" /></div>
            </div>
        </FormSection>
    );
}

const LoginPageStyleSection: React.FC<{formData: Settings, onNestedChange: any, onFileChange: any}> = ({formData, onNestedChange, onFileChange}) => (
    <FormSection title="Login Page Style" description="Customize the appearance of the admin login screen.">
        <ImageUpload
            label="Background Image"
            value={formData.loginScreen.backgroundImageUrl}
            onTextChange={(e) => onNestedChange('loginScreen.backgroundImageUrl', e.target.value)}
            onFileChange={(e) => onFileChange(e, 'loginScreen.backgroundImageUrl')}
            onRemove={() => onNestedChange('loginScreen.backgroundImageUrl', '')}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorInput label="Background Color" value={formData.loginScreen.backgroundColor} onChange={e => onNestedChange('loginScreen.backgroundColor', e.target.value)} />
            <ColorInput label="Login Box Background" value={formData.loginScreen.boxBackgroundColor} onChange={e => onNestedChange('loginScreen.boxBackgroundColor', e.target.value)} />
            <ColorInput label="Text Color" value={formData.loginScreen.textColor} onChange={e => onNestedChange('loginScreen.textColor', e.target.value)} />
        </div>
    </FormSection>
);

const TypographySection: React.FC<{formData: Settings, onNestedChange: any}> = ({formData, onNestedChange}) => (
    <FormSection title="Typography" description="Customize fonts for different elements of the app.">
        <input type="text" value={formData.typography.googleFontUrl} onChange={e => onNestedChange('typography.googleFontUrl', e.target.value)} className={inputStyle} placeholder="Paste Google Fonts <link> URL here..." />
        <FontStyleEditor title="Body Text" value={formData.typography.body} onChange={v => onNestedChange('typography.body', v)} />
        <FontStyleEditor title="Headings" value={formData.typography.headings} onChange={v => onNestedChange('typography.headings', v)} />
        <FontStyleEditor title="Item Titles" value={formData.typography.itemTitles} onChange={v => onNestedChange('typography.itemTitles', v)} />
    </FormSection>
);

const NavigationSection: React.FC<{navLinks: NavLink[], onNavLinksChange: (links: NavLink[])=>void}> = ({navLinks, onNavLinksChange}) => {
    const [newLink, setNewLink] = useState({label: '', path: ''});
    const handleUpdate = (index: number, field: keyof NavLink, value: any) => { const newLinks = [...navLinks]; (newLinks[index] as any)[field] = value; onNavLinksChange(newLinks); };
    const handleMove = (index: number, direction: 'up' | 'down') => { const newLinks = [...navLinks]; const targetIndex = direction === 'up' ? index - 1 : index + 1; if (targetIndex < 0 || targetIndex >= newLinks.length) return; [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]]; onNavLinksChange(newLinks); };
    const handleDelete = (id: string) => onNavLinksChange(navLinks.filter(link => link.id !== id));
    const handleAdd = () => { if (!newLink.label || !newLink.path) return alert("Label and path are required."); onNavLinksChange([...navLinks, { ...newLink, id: `nav_${Date.now()}`, enabled: true }]); setNewLink({label: '', path: ''}); };

    return (
        <FormSection title="Header Navigation" description="Manage the links that appear in the main header.">
            <div className="space-y-3">{navLinks.map((link, index) => (<div key={link.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <div className="col-span-1 flex flex-col"><button type="button" onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30"><ChevronUpIcon className="w-4 h-4" /></button><button type="button" onClick={() => handleMove(index, 'down')} disabled={index === navLinks.length - 1} className="p-1 disabled:opacity-30"><ChevronDownIcon className="w-4 h-4"/></button></div>
                <div className="col-span-4"><input type="text" value={link.label} onChange={e => handleUpdate(index, 'label', e.target.value)} className={inputStyle} /></div><div className="col-span-5"><input type="text" value={link.path} onChange={e => handleUpdate(index, 'path', e.target.value)} className={inputStyle} /></div><div className="col-span-1 text-center"><input type="checkbox" checked={link.enabled} onChange={e => handleUpdate(index, 'enabled', e.target.checked)} className="h-5 w-5 rounded" /></div><div className="col-span-1 text-right"><button type="button" onClick={() => handleDelete(link.id)} className="p-2 text-red-500"><TrashIcon className="w-4 h-4" /></button></div></div>))}</div>
            <div className="grid grid-cols-12 gap-2 items-center p-2 border-t mt-4 pt-4">
                <div className="col-span-1"></div><div className="col-span-4"><input type="text" value={newLink.label} onChange={e => setNewLink({...newLink, label: e.target.value})} placeholder="New Label" className={inputStyle} /></div><div className="col-span-5"><input type="text" value={newLink.path} onChange={e => setNewLink({...newLink, path: e.target.value})} placeholder="/new-path" className={inputStyle} /></div><div className="col-span-2 text-right"><button type="button" onClick={handleAdd} className="btn btn-primary"><PlusIcon className="w-4 h-4" /> Add</button></div>
            </div>
        </FormSection>
    );
};

const KioskBehaviorSection: React.FC<{formData: Settings, onNestedChange: any, onFileChange: any}> = ({formData, onNestedChange, onFileChange}) => (
    <FormSection title="Kiosk Behavior" description="Settings for unattended public use, including screensaver and audio.">
        <div className="grid grid-cols-2 gap-6"><div className="col-span-2"><label className={labelStyle}>Idle Redirect Timeout (seconds)</label><input type="number" value={formData.kiosk.idleRedirectTimeout} onChange={e => onNestedChange('kiosk.idleRedirectTimeout', parseInt(e.target.value, 10))} className={inputStyle} /><p className="mt-1 text-xs text-gray-500">Redirects to home page after inactivity. Set to 0 to disable.</p></div><div><label className={labelStyle}>Screensaver Delay (seconds)</label><input type="number" value={formData.screensaverDelay} onChange={e => onNestedChange('screensaverDelay', parseInt(e.target.value, 10))} className={inputStyle} /></div><div><label className={labelStyle}>Screensaver Image Duration (seconds)</label><input type="number" value={formData.screensaverImageDuration} onChange={e => onNestedChange('screensaverImageDuration', parseInt(e.target.value, 10))} className={inputStyle} /></div></div>
    </FormSection>
);

export default AdminSettings;