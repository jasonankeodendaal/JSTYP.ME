import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { SaveIcon, UploadIcon, LinkIcon, ServerStackIcon, EyeIcon } from '../Icons.tsx';
import type { Settings, FontStyleSettings, ThemeColors, NavLink, AdminUser } from '../../types.ts';
import LocalMedia from '../LocalMedia.tsx';
import { Link } from 'react-router-dom';

// --- ICONS ---
const Cog6ToothIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.05.26 1.431l-1.296-2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.075.124.072-.044.146-.087.22-.127.332-.183.582.495.645-.87l.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const PaintBrushIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.43 2.43a4.5 4.5 0 008.642-1.424c-.102.343-.228.66-.376.952l-.008.018a.25.25 0 01-.445.044l-.004-.007a.25.25 0 01.044-.445l.007-.004a.25.25 0 01.445.044l.004.007a.25.25 0 01-.044.445l-.007.004a.25.25 0 01-.445.044l-.004-.007a.25.25 0 01.044-.445l.007-.004a.25.25 0 01.445.044l.004.007a.25.25 0 01-.044.445l-.007.004a.25.25 0 01-.445.044l-.004-.007a.25.25 0 01.044-.445l.007-.004a.25.25 0 01.445.044l.004.007a.25.25 0 01-.044.445l-.007.004a.25.25 0 01-.445.044l-.008-.018a.25.25 0 01.445.044l-.008.018c-.148.292-.274.61-.376.952a4.5 4.5 0 008.642-1.424 2.25 2.25 0 01-2.43-2.43 3 3 0 00-5.78-1.128z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.642-10.023 8.998 8.998 0 00-1.253-5.042A2.25 2.25 0 0017.345 4.5H6.655a2.25 2.25 0 00-2.043 1.435A8.998 8.998 0 003.358 10.977a9.004 9.004 0 008.642 10.023z" /></svg>
);
const CharacterSpacingIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5M5.25 4.5l3.75-3.75m0 0L12.75 4.5M9 8.25v12.75" /></svg>
);
const ViewColumnsIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" /></svg>
);
const ComputerDesktopIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" /></svg>
);
const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
);
const ArrowUpIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.28 9.68a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" /></svg>
);
const ArrowDownIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.97-3.968a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l3.97 3.968V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>
);
const TrashIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 00-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
);
const PlusIcon = ({ className = 'w-4 h-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// --- FORM SUB-COMPONENTS ---
const inputStyle = "block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 sm:text-sm";
const labelStyle = "block text-sm font-medium text-gray-800 dark:text-gray-200";

const FormSection: React.FC<{ title: string, description?: string, children: React.ReactNode, id?: string }> = ({ title, description, children, id }) => (
    <div className="space-y-6" id={id}>
        <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50 space-y-6">
            {children}
        </div>
    </div>
);

const ColorInput: React.FC<{ label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className={labelStyle}>{label}</label>
        <div className="mt-1 flex items-center gap-2">
            <input type="color" value={value || '#000000'} onChange={onChange} className="p-1 h-10 w-10 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg" />
            <input type="text" value={value} onChange={onChange} className={inputStyle} />
        </div>
    </div>
);

const FontStyleEditor: React.FC<{ title: string, value: FontStyleSettings, onChange: (newValue: FontStyleSettings) => void }> = ({ title, value, onChange }) => {
    const handleFontChange = (field: keyof FontStyleSettings, fieldValue: any) => {
        onChange({ ...value, [field]: fieldValue });
    };

    return (
        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
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
            <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg overflow-hidden text-center text-2xl truncate" style={{
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
    const [activeTab, setActiveTab] = useState('general');

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

    const handleNavLinksChange = (newLinks: NavLink[]) => {
        handleNestedChange('navigation.links', newLinks);
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
    
    const tabs = {
        general: { label: 'General', icon: Cog6ToothIcon },
        branding: { label: 'Branding & Style', icon: PaintBrushIcon },
        typography: { label: 'Typography', icon: CharacterSpacingIcon },
        navigation: { label: 'Navigation', icon: ViewColumnsIcon },
        kiosk: { label: 'Kiosk Mode', icon: ComputerDesktopIcon },
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettingsTab formData={formData} onFileChange={handleFileChange} onNestedChange={handleNestedChange} kioskId={kioskId} setKioskId={setKioskId} loggedInUser={loggedInUser} />;
            case 'branding': return <BrandingStyleTab formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />;
            case 'typography': return <TypographyTab formData={formData} onNestedChange={handleNestedChange} />;
            case 'navigation': return <NavigationTab navLinks={formData.navigation.links} onNavLinksChange={handleNavLinksChange} />;
            case 'kiosk': return <KioskModeTab formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />;
            default: return null;
        }
    };
    
    return (
        <div>
            {/* Mobile Dropdown */}
            <div className="md:hidden mb-4">
                <label htmlFor="settings-tabs" className="sr-only">Select a tab</label>
                <div className="relative">
                    <select 
                        id="settings-tabs"
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value)}
                        className={`${inputStyle} appearance-none pr-8`}
                    >
                         {Object.entries(tabs).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <ChevronDownIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {Object.entries(tabs).map(([key, { label, icon: Icon }]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 whitespace-nowrap px-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                                    activeTab === key
                                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-500'
                                }`}
                                aria-current={activeTab === key ? 'page' : undefined}
                            >
                                <Icon className={`h-5 w-5 ${activeTab === key ? '' : 'text-gray-400 dark:text-gray-500'}`} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-12">
                {renderTabContent()}
                 <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button type="submit" className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`} disabled={saving || saved}>
                        <SaveIcon className="h-4 w-4" />
                        {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Settings')}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- TAB SUB-COMPONENTS ---
const GeneralSettingsTab: React.FC<{formData: Settings, onFileChange: any, onNestedChange: any, kioskId: string, setKioskId: (newId: string) => void, loggedInUser: AdminUser | null}> = ({formData, onFileChange, onNestedChange, kioskId, setKioskId, loggedInUser}) => {
    const isMainAdmin = loggedInUser?.isMainAdmin;
    return (
    <div className="space-y-10">
        <FormSection title="Brand & Kiosk Identity" description="Basic branding and identification for this specific device.">
            <div>
                <label htmlFor="logoUrl" className={labelStyle}>Logo</label>
                <div className="mt-1 flex items-center gap-4">
                    <div className="h-16 w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <LocalMedia src={formData.logoUrl} type="image" alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <label htmlFor="logo-upload" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <UploadIcon className="h-4 w-4" />
                        <span>Change Logo</span>
                    </label>
                    <input id="logo-upload" type="file" className="sr-only" onChange={(e) => onFileChange(e, 'logoUrl')} accept="image/*" />
                </div>
            </div>
             <div>
                <label htmlFor="kioskId" className={labelStyle}>Unique Kiosk ID</label>
                <input
                    id="kioskId"
                    type="text"
                    readOnly={!isMainAdmin}
                    value={kioskId}
                    onChange={(e) => setKioskId(e.target.value)}
                    className={`${inputStyle} mt-1 ${!isMainAdmin ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
                <p className="mt-1 text-xs text-gray-500">
                    This unique ID identifies this device for analytics.
                    {isMainAdmin ? ' As main admin, you can change this ID.' : ' It can only be changed by the main admin.'}
                </p>
            </div>
        </FormSection>
        <FormSection title="API & Sync" description="Configure connections to external data sources.">
             <div>
                <label htmlFor="sharedUrl" className={labelStyle}>Shared URL</label>
                <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><LinkIcon className="h-5 w-5 text-gray-400" /></div>
                    <input type="url" id="sharedUrl" value={formData.sharedUrl || ''} onChange={e => onNestedChange('sharedUrl', e.target.value)} placeholder="https://.../database.json" className={`${inputStyle} pl-10`} />
                </div>
                 <p className="mt-1 text-xs text-gray-500">For pull-only sync from a public JSON file.</p>
            </div>
             <div>
                <label htmlFor="customApiUrl" className={labelStyle}>Custom API URL</label>
                 <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><ServerStackIcon className="h-5 w-5 text-gray-400" /></div>
                    <input type="url" id="customApiUrl" value={formData.customApiUrl} onChange={e => onNestedChange('customApiUrl', e.target.value)} placeholder="https://api.yourdomain.com/data" className={`${inputStyle} pl-10`} />
                </div>
            </div>
             <div>
                <label htmlFor="customApiKey" className={labelStyle}>Custom API Key</label>
                 <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><EyeIcon className="h-5 w-5 text-gray-400" /></div>
                    <input type="password" id="customApiKey" value={formData.customApiKey} onChange={e => onNestedChange('customApiKey', e.target.value)} placeholder="Your secret API key" className={`${inputStyle} pl-10`} />
                </div>
            </div>
        </FormSection>
    </div>
);
};

const BrandingStyleTab: React.FC<{formData: Settings, onNestedChange: any, onFileChange: any}> = ({formData, onNestedChange, onFileChange}) => (
    <div className="space-y-10">
        <FormSection title="Color Themes" description="Define separate color palettes for light and dark modes.">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemeEditor title="Light Theme" theme="light" themeData={formData.lightTheme} onNestedChange={onNestedChange} onFileChange={onFileChange} />
                <ThemeEditor title="Dark Theme" theme="dark" themeData={formData.darkTheme} onNestedChange={onNestedChange} onFileChange={onFileChange} />
            </div>
        </FormSection>
        <FormSection title="Global Styles" description="Control the overall look of cards, layout, and transitions.">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={labelStyle}>Card Corner Radius</label>
                    <select value={formData.cardStyle.cornerRadius} onChange={e => onNestedChange('cardStyle.cornerRadius', e.target.value)} className={inputStyle}>
                        <option value="rounded-none">None</option>
                        <option value="rounded-lg">Medium</option>
                        <option value="rounded-2xl">Large</option>
                        <option value="rounded-3xl">Extra Large</option>
                    </select>
                </div>
                 <div>
                    <label className={labelStyle}>Card Shadow</label>
                    <select value={formData.cardStyle.shadow} onChange={e => onNestedChange('cardStyle.shadow', e.target.value)} className={inputStyle}>
                        <option value="shadow-md">Medium</option>
                        <option value="shadow-lg">Large</option>
                        <option value="shadow-xl">Extra Large</option>
                    </select>
                </div>
                 <div>
                    <label className={labelStyle}>Layout Width</label>
                    <select value={formData.layout.width} onChange={e => onNestedChange('layout.width', e.target.value)} className={inputStyle}>
                        <option value="standard">Standard (Centered)</option>
                        <option value="wide">Wide (Full Width)</option>
                    </select>
                </div>
                 <div>
                    <label className={labelStyle}>Page Transitions</label>
                    <select value={formData.pageTransitions.effect} onChange={e => onNestedChange('pageTransitions.effect', e.target.value)} className={inputStyle}>
                        <option value="none">None</option>
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                    </select>
                </div>
            </div>
        </FormSection>
        <FormSection title="Header & Footer Style" description="Customize the appearance of the top and bottom bars.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ElementStyleEditor title="Header" element="header" value={formData.header} onNestedChange={onNestedChange} onFileChange={onFileChange} />
                <ElementStyleEditor title="Footer" element="footer" value={formData.footer} onNestedChange={onNestedChange} onFileChange={onFileChange} />
            </div>
        </FormSection>
    </div>
);

const ThemeEditor: React.FC<{title: string, theme: 'light' | 'dark', themeData: ThemeColors, onNestedChange: any, onFileChange: any}> = ({title, theme, themeData, onNestedChange, onFileChange}) => (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h4 className="font-semibold">{title}</h4>
        <ColorInput label="Primary Color" value={themeData.primary} onChange={e => onNestedChange(`${theme}Theme.primary`, e.target.value)} />
        <ColorInput label="App Background" value={themeData.appBg} onChange={e => onNestedChange(`${theme}Theme.appBg`, e.target.value)} />
        <div>
            <label className={labelStyle}>App Background Image</label>
            <input type="text" value={themeData.appBgImage} onChange={e => onNestedChange(`${theme}Theme.appBgImage`, e.target.value)} className={inputStyle} placeholder="URL or gradient..." />
        </div>
        <ColorInput label="Main Content Background" value={themeData.mainBg} onChange={e => onNestedChange(`${theme}Theme.mainBg`, e.target.value)} />
        <ColorInput label="Main Text Color" value={themeData.mainText} onChange={e => onNestedChange(`${theme}Theme.mainText`, e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
            <ColorInput label="Primary Button BG" value={themeData.primaryButton.background} onChange={e => onNestedChange(`${theme}Theme.primaryButton.background`, e.target.value)} />
            <ColorInput label="Primary Button Text" value={themeData.primaryButton.text} onChange={e => onNestedChange(`${theme}Theme.primaryButton.text`, e.target.value)} />
            <ColorInput label="Destructive Button BG" value={themeData.destructiveButton.background} onChange={e => onNestedChange(`${theme}Theme.destructiveButton.background`, e.target.value)} />
            <ColorInput label="Destructive Button Text" value={themeData.destructiveButton.text} onChange={e => onNestedChange(`${theme}Theme.destructiveButton.text`, e.target.value)} />
        </div>
    </div>
);

const ElementStyleEditor: React.FC<{title: string, element: 'header' | 'footer', value: any, onNestedChange: any, onFileChange: any}> = ({title, element, value, onNestedChange, onFileChange}) => (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h4 className="font-semibold">{title} Style</h4>
        <div className="grid grid-cols-2 gap-4">
            <ColorInput label="Background" value={value.backgroundColor} onChange={e => onNestedChange(`${element}.backgroundColor`, e.target.value)} />
            <ColorInput label="Text Color" value={value.textColor} onChange={e => onNestedChange(`${element}.textColor`, e.target.value)} />
        </div>
         <div>
            <label className={labelStyle}>Background Image</label>
            <input type="text" value={value.backgroundImageUrl} onChange={e => onNestedChange(`${element}.backgroundImageUrl`, e.target.value)} className={inputStyle} placeholder="URL to image..." />
        </div>
         <div>
            <label className={labelStyle}>Effect</label>
            <select value={value.effect} onChange={e => onNestedChange(`${element}.effect`, e.target.value)} className={inputStyle}>
                <option value="none">None</option>
                <option value="glassmorphism">Glassmorphism</option>
                <option value="3d-shadow">3D Shadow</option>
            </select>
        </div>
    </div>
);

const TypographyTab: React.FC<{formData: Settings, onNestedChange: any}> = ({formData, onNestedChange}) => (
     <div className="space-y-10">
        <FormSection title="Google Fonts" description="Load fonts directly from Google Fonts. Paste the full <link> URL from Google Fonts here.">
            <input type="text" value={formData.typography.googleFontUrl} onChange={e => onNestedChange('typography.googleFontUrl', e.target.value)} className={inputStyle} placeholder="e.g., https://fonts.googleapis.com/css2?family=Roboto..." />
        </FormSection>
        <FormSection title="Font Styles" description="Customize the typography for different elements of the app.">
            <FontStyleEditor title="Body Text" value={formData.typography.body} onChange={v => onNestedChange('typography.body', v)} />
            <FontStyleEditor title="Headings" value={formData.typography.headings} onChange={v => onNestedChange('typography.headings', v)} />
            <FontStyleEditor title="Item Titles" value={formData.typography.itemTitles} onChange={v => onNestedChange('typography.itemTitles', v)} />
        </FormSection>
    </div>
);

const NavigationTab: React.FC<{navLinks: NavLink[], onNavLinksChange: (links: NavLink[])=>void}> = ({navLinks, onNavLinksChange}) => {
    const [newLink, setNewLink] = useState({label: '', path: ''});

    const handleUpdate = (index: number, field: keyof NavLink, value: any) => {
        const newLinks = [...navLinks];
        (newLinks[index] as any)[field] = value;
        onNavLinksChange(newLinks);
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newLinks = [...navLinks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLinks.length) return;
        [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
        onNavLinksChange(newLinks);
    };

    const handleDelete = (id: string) => {
        onNavLinksChange(navLinks.filter(link => link.id !== id));
    };

    const handleAdd = () => {
        if (!newLink.label || !newLink.path) {
            alert("Please provide both a label and a path.");
            return;
        }
        const newId = `nav_${Date.now()}`;
        onNavLinksChange([...navLinks, { ...newLink, id: newId, enabled: true }]);
        setNewLink({label: '', path: ''});
    };

    return (
        <FormSection title="Header Navigation" description="Manage the links that appear in the main header.">
            <div className="space-y-3">
                {navLinks.map((link, index) => (
                    <div key={link.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                        <div className="col-span-1 flex flex-col">
                            <button type="button" onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30"><ArrowUpIcon /></button>
                            <button type="button" onClick={() => handleMove(index, 'down')} disabled={index === navLinks.length - 1} className="p-1 disabled:opacity-30"><ArrowDownIcon /></button>
                        </div>
                        <div className="col-span-4"><input type="text" value={link.label} onChange={e => handleUpdate(index, 'label', e.target.value)} className={inputStyle} /></div>
                        <div className="col-span-5"><input type="text" value={link.path} onChange={e => handleUpdate(index, 'path', e.target.value)} className={inputStyle} /></div>
                        <div className="col-span-1 text-center"><input type="checkbox" checked={link.enabled} onChange={e => handleUpdate(index, 'enabled', e.target.checked)} className="h-5 w-5 rounded" /></div>
                        <div className="col-span-1 text-right"><button type="button" onClick={() => handleDelete(link.id)} className="p-2 text-red-500"><TrashIcon /></button></div>
                    </div>
                ))}
            </div>
             <div className="grid grid-cols-12 gap-2 items-center p-2 border-t mt-4 pt-4">
                <div className="col-span-1"></div>
                <div className="col-span-4"><input type="text" value={newLink.label} onChange={e => setNewLink({...newLink, label: e.target.value})} placeholder="New Label" className={inputStyle} /></div>
                <div className="col-span-5"><input type="text" value={newLink.path} onChange={e => setNewLink({...newLink, path: e.target.value})} placeholder="/new-path" className={inputStyle} /></div>
                <div className="col-span-2 text-right"><button type="button" onClick={handleAdd} className="btn btn-primary"><PlusIcon /> Add</button></div>
            </div>
        </FormSection>
    );
};

const KioskModeTab: React.FC<{formData: Settings, onNestedChange: any, onFileChange: any}> = ({formData, onNestedChange, onFileChange}) => (
    <div className="space-y-10">
        <FormSection title="Screensaver" description="Control the behavior of the idle-time screensaver.">
            <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className={labelStyle}>Screensaver Delay (seconds)</label>
                    <input type="number" value={formData.screensaverDelay} onChange={e => onNestedChange('screensaverDelay', parseInt(e.target.value, 10))} className={inputStyle} />
                </div>
                 <div>
                    <label className={labelStyle}>Image Duration (seconds)</label>
                    <input type="number" value={formData.screensaverImageDuration} onChange={e => onNestedChange('screensaverImageDuration', parseInt(e.target.value, 10))} className={inputStyle} />
                </div>
                <div>
                    <label className={labelStyle}>Transition Effect</label>
                     <select value={formData.screensaverTransitionEffect} onChange={e => onNestedChange('screensaverTransitionEffect', e.target.value)} className={inputStyle}>
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="scale">Scale</option>
                        <option value="slide-fade">Slide & Fade</option>
                        <option value="gentle-drift">Gentle Drift (Modern)</option>
                        <option value="reveal-blur">Reveal & Blur</option>
                    </select>
                </div>
                <div>
                    <label className={labelStyle}>Prompt Text</label>
                    <input type="text" value={formData.screensaverTouchPromptText} onChange={e => onNestedChange('screensaverTouchPromptText', e.target.value)} className={inputStyle} />
                </div>
            </div>
        </FormSection>
        <FormSection title="Kiosk Behavior" description="Settings for unattended public use.">
            <div>
                <label className={labelStyle}>Idle Redirect Timeout (seconds)</label>
                <input type="number" value={formData.kiosk.idleRedirectTimeout} onChange={e => onNestedChange('kiosk.idleRedirectTimeout', parseInt(e.target.value, 10))} className={inputStyle} />
                <p className="mt-1 text-xs text-gray-500">Redirects to home page after inactivity. Set to 0 to disable.</p>
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <label className={labelStyle}>Disable Right-Click</label>
                    <p className="text-xs text-gray-500">Prevents users from opening the context menu.</p>
                </div>
                <input type="checkbox" checked={formData.kiosk.disableContextMenu} onChange={e => onNestedChange('kiosk.disableContextMenu', e.target.checked)} className="h-6 w-6 rounded" />
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <label className={labelStyle}>PIN Protect Screensaver</label>
                    <p className="text-xs text-gray-500">Require an admin PIN to exit the screensaver.</p>
                </div>
                <input type="checkbox" checked={formData.kiosk.pinProtectScreensaver} onChange={e => onNestedChange('kiosk.pinProtectScreensaver', e.target.checked)} className="h-6 w-6 rounded" />
            </div>
        </FormSection>
         <FormSection title="Audio Settings" description="Manage background music and interaction sounds.">
             <div>
                <label className={labelStyle}>Default Video Volume</label>
                <input type="range" min="0" max="1" step="0.05" value={formData.videoVolume} onChange={e => onNestedChange('videoVolume', parseFloat(e.target.value))} className="w-full mt-2" />
            </div>
            <div>
                <label className={labelStyle}>Background Music</label>
                <input type="text" value={formData.backgroundMusicUrl} onChange={e => onNestedChange('backgroundMusicUrl', e.target.value)} className={inputStyle} placeholder="URL to MP3 file..." />
                <label htmlFor="music-upload" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 mt-2">
                    <UploadIcon className="h-4 w-4" />
                    <span>Or Upload File</span>
                </label>
                <input id="music-upload" type="file" className="sr-only" onChange={e => onFileChange(e, 'backgroundMusicUrl')} accept="audio/mpeg" />
            </div>
             <div>
                <label className={labelStyle}>Touch Sound</label>
                <input type="text" value={formData.touchSoundUrl} onChange={e => onNestedChange('touchSoundUrl', e.target.value)} className={inputStyle} placeholder="URL to sound file..." />
                <label htmlFor="sound-upload" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 mt-2">
                    <UploadIcon className="h-4 w-4" />
                    <span>Or Upload File</span>
                </label>
                <input id="sound-upload" type="file" className="sr-only" onChange={e => onFileChange(e, 'touchSoundUrl')} accept="audio/*" />
            </div>
        </FormSection>
    </div>
);

export default AdminSettings;