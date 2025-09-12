import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { SaveIcon, UploadIcon, TrashIcon, ChevronDownIcon, PlusIcon, XIcon, ArrowPathIcon } from '../Icons.tsx';
import type { Settings, FontStyleSettings, ThemeColors, NavLink } from '../../types.ts';
import LocalMedia from '../LocalMedia.tsx';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import KioskPreview from './KioskPreview.tsx';

// --- HELPER COMPONENTS (Inlined) ---

const FormSection: React.FC<{
    title: string;
    description?: string;
    children: React.ReactNode;
    name: string;
    isOpen: boolean;
    onToggle: (name: string) => void;
}> = ({ title, description, children, name, isOpen, onToggle }) => (
    <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700/50" open={isOpen}>
        <summary
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={(e) => { e.preventDefault(); onToggle(name); }}
        >
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h3>
                {description && <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{description}</p>}
            </div>
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                <ChevronDownIcon className="w-5 h-5"/>
            </div>
        </summary>
        <div className="p-4 sm:p-6 border-t border-gray-200/80 dark:border-gray-700/50 space-y-6">
            {children}
        </div>
    </details>
);


const inputStyle = "block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 sm:text-sm";
const labelStyle = "block text-sm font-medium text-gray-800 dark:text-gray-200";

const ColorInput: React.FC<{ label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => {
    const colorPickerValue = (value && value.startsWith('#')) ? value : '#000000';
    return (
        <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="mt-1 flex items-center gap-2">
                <input type="color" value={colorPickerValue} onChange={onChange} className="p-1 h-10 w-10 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-lg" />
                <input type="text" value={value} onChange={onChange} className={`${inputStyle} !py-2`} />
            </div>
        </div>
    );
};

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

const BrandingAndIdentitySection: React.FC<{name: string, isOpen: boolean, onToggle: (name: string) => void, formData: Settings, onFileChange: any, onNestedChange: any, kioskId: string, setKioskId: (newId: string) => void, loggedInUser: any}> = ({name, isOpen, onToggle, formData, onFileChange, onNestedChange, kioskId, setKioskId, loggedInUser}) => (
    <FormSection name={name} isOpen={isOpen} onToggle={onToggle} title="Brand & Kiosk Identity" description="Basic branding and identification for this specific device.">
         <ImageUpload
            label="App Logo & PWA Icon"
            value={formData.logoUrl}
            onTextChange={(e) => onNestedChange('logoUrl', e.target.value)}
            onFileChange={(e) => onFileChange(e, 'logoUrl')}
            onRemove={() => onNestedChange('logoUrl', '')}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4">This logo is used in the header and for the homescreen icon when the app is installed. Should be a square image, at least 512x512px for best results.</p>
        <div>
            <label htmlFor="kioskId" className={labelStyle}>Unique Kiosk ID</label>
            <input id="kioskId" type="text" readOnly={!loggedInUser?.isMainAdmin} value={kioskId} onChange={(e) => setKioskId(e.target.value)}
                className={`${inputStyle} mt-1 ${!loggedInUser?.isMainAdmin ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            />
            <p className="mt-1 text-xs text-gray-500">This unique ID identifies this device for analytics. It can only be changed by the main admin.</p>
        </div>
    </FormSection>
);

const ThemeEditor: React.FC<{title: string, theme: 'light' | 'dark', themeData: ThemeColors, onNestedChange: any, onFileChange: any}> = ({title, theme, themeData, onNestedChange, onFileChange}) => (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
        <h4 className="font-semibold">{title}</h4>
        <div className="space-y-4">
            <div>
                <ColorInput label="Primary Accent Color" value={themeData.primary} onChange={e => onNestedChange(`${theme}Theme.primary`, e.target.value)} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your brand's signature hue for active navigation tabs, focus rings, and other highlights.</p>
            </div>
            <div>
                <ImageUpload
                    label="App Background Image"
                    value={themeData.appBgImage}
                    onTextChange={(e) => onNestedChange(`${theme}Theme.appBgImage`, e.target.value)}
                    onFileChange={(e) => onFileChange(e, `${theme}Theme.appBgImage`)}
                    onRemove={() => onNestedChange(`${theme}Theme.appBgImage`, '')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The "digital wall" your kiosk is mounted on. For Dark Mode, subtle gradients can create depth and a sophisticated mood.</p>
            </div>
            <div>
                <ColorInput label="App Background Color" value={themeData.appBg} onChange={e => onNestedChange(`${theme}Theme.appBg`, e.target.value)} />
            </div>
            <div>
                <ColorInput label="Main Content Background" value={themeData.mainBg} onChange={e => onNestedChange(`${theme}Theme.mainBg`, e.target.value)} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The surface on which your products and text sit. Create contrast for a "floating sheet" effect.</p>
            </div>
            <div>
                <ColorInput label="Main Text Color" value={themeData.mainText} onChange={e => onNestedChange(`${theme}Theme.mainText`, e.target.value)} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The primary color for all body copy. Ensure high contrast for readability.</p>
            </div>

            <div>
                <h5 className="text-sm font-semibold mt-4">Primary Buttons</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">For actions like 'Save' or 'Add'.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <ColorInput label="Background" value={themeData.primaryButton.background} onChange={e => onNestedChange(`${theme}Theme.primaryButton.background`, e.target.value)} />
                    <ColorInput label="Text" value={themeData.primaryButton.text} onChange={e => onNestedChange(`${theme}Theme.primaryButton.text`, e.target.value)} />
                    <ColorInput label="Hover BG" value={themeData.primaryButton.hoverBackground} onChange={e => onNestedChange(`${theme}Theme.primaryButton.hoverBackground`, e.target.value)} />
                </div>
            </div>
            <div>
                <h5 className="text-sm font-semibold mt-4">Destructive Buttons</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">For actions like 'Delete' or 'Remove'.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <ColorInput label="Background" value={themeData.destructiveButton.background} onChange={e => onNestedChange(`${theme}Theme.destructiveButton.background`, e.target.value)} />
                    <ColorInput label="Text" value={themeData.destructiveButton.text} onChange={e => onNestedChange(`${theme}Theme.destructiveButton.text`, e.target.value)} />
                    <ColorInput label="Hover BG" value={themeData.destructiveButton.hoverBackground} onChange={e => onNestedChange(`${theme}Theme.destructiveButton.hoverBackground`, e.target.value)} />
                </div>
            </div>

            <div>
                <h5 className="text-sm font-semibold mt-4">Shadows & Borders</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Define raw CSS values for shadow and border properties. These are applied intelligently for light/dark modes.</p>
                <div className="space-y-2">
                    <div>
                        <label className={labelStyle}>Main Container Shadow</label>
                        <input type="text" value={themeData.mainShadow} onChange={e => onNestedChange(`${theme}Theme.mainShadow`, e.target.value)} className={inputStyle} />
                    </div>
                    <div>
                        <label className={labelStyle}>Main Container Border</label>
                        <input type="text" value={themeData.mainBorder} onChange={e => onNestedChange(`${theme}Theme.mainBorder`, e.target.value)} className={inputStyle} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ElementStyleEditor: React.FC<{title: string, element: 'header' | 'footer', value: any, onNestedChange: any, onFileChange: any}> = ({title, element, value, onNestedChange, onFileChange}) => (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/30">
        <h4 className="font-semibold">{title} Style</h4>
         <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            Customize the architectural elements that frame your content.
         </p>
        <div className="space-y-4">
            <div>
                <label className={labelStyle}>Effect</label>
                <select value={value.effect} onChange={e => onNestedChange(`${element}.effect`, e.target.value)} className={inputStyle}>
                    <option value="none">None</option>
                    <option value="glassmorphism">Glassmorphism</option>
                    <option value="3d-shadow">3D Shadow</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Glassmorphism adds a translucent, blurred effect. 3D Shadow adds depth.</p>
            </div>
            <div>
                <ImageUpload
                    label="Background Image"
                    value={value.backgroundImageUrl}
                    onTextChange={(e) => onNestedChange(`${element}.backgroundImageUrl`, e.target.value)}
                    onFileChange={(e) => onFileChange(e, `${element}.backgroundImageUrl`)}
                    onRemove={() => onNestedChange(`${element}.backgroundImageUrl`, '')}
                />
            </div>
            <div>
                <label className={labelStyle}>Background Opacity</label>
                <input type="range" min="0" max="1" step="0.05" value={value.backgroundImageOpacity} onChange={e => onNestedChange(`${element}.backgroundImageOpacity`, parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-500"/>
            </div>
             <div>
                <ColorInput label="Background Color" value={value.backgroundColor} onChange={e => onNestedChange(`${element}.backgroundColor`, e.target.value)} />
            </div>
            <div>
                <ColorInput label="Text Color" value={value.textColor} onChange={e => onNestedChange(`${element}.textColor`, e.target.value)} />
            </div>
        </div>
    </div>
);

const ThemeAndAppearanceSection: React.FC<{name: string, isOpen: boolean, onToggle: (name: string) => void, formData: Settings, onNestedChange: any, onFileChange: any}> = ({name, isOpen, onToggle, formData, onNestedChange, onFileChange}) => (
    <FormSection name={name} isOpen={isOpen} onToggle={onToggle} title="Theme & Appearance" description="Define color palettes and global styles for the public-facing kiosk.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemeEditor title="Light Theme" theme="light" themeData={formData.lightTheme} onNestedChange={onNestedChange} onFileChange={onFileChange} />
            <ThemeEditor title="Dark Theme" theme="dark" themeData={formData.darkTheme} onNestedChange={onNestedChange} onFileChange={onFileChange} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
                <label className={labelStyle}>Card Corner Radius</label>
                <select value={formData.cardStyle.cornerRadius} onChange={e => onNestedChange('cardStyle.cornerRadius', e.target.value)} className={inputStyle}>
                    <option value="rounded-none">None (Sharp)</option>
                    <option value="rounded-lg">Medium</option>
                    <option value="rounded-2xl">Large</option>
                    <option value="rounded-3xl">Extra Large (Soft)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Controls the roundness of cards. A larger radius feels more modern and friendly.</p>
            </div>
            <div>
                <label className={labelStyle}>Card Shadow</label>
                <select value={formData.cardStyle.shadow} onChange={e => onNestedChange('cardStyle.shadow', e.target.value)} className={inputStyle}>
                     <option value="shadow-md">Medium</option>
                     <option value="shadow-lg">Large</option>
                     <option value="shadow-xl">Extra Large</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Controls the perceived depth of cards, making them feel like they are floating.</p>
            </div>
            <div>
                <label className={labelStyle}>Layout Width</label>
                <select value={formData.layout.width} onChange={e => onNestedChange('layout.width', e.target.value)} className={inputStyle}>
                    <option value="standard">Standard (Centered)</option><option value="wide">Wide (Full Width)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Standard is content-focused. Wide is an immersive, edge-to-edge layout.</p>
            </div>
            <div>
                <label className={labelStyle}>Page Transitions</label>
                <select value={formData.pageTransitions.effect} onChange={e => onNestedChange('pageTransitions.effect', e.target.value)} className={inputStyle}>
                    <option value="none">None</option><option value="fade">Fade</option><option value="slide">Slide</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The animation style when navigating between pages.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ElementStyleEditor title="Header" element="header" value={formData.header} onNestedChange={onNestedChange} onFileChange={onFileChange} />
            <ElementStyleEditor title="Footer" element="footer" value={formData.footer} onNestedChange={onNestedChange} onFileChange={onFileChange} />
        </div>
    </FormSection>
);

const CreatorProfileSection: React.FC<{name: string, isOpen: boolean, onToggle: (name: string) => void, formData: Settings, onNestedChange: any, onFileChange: any}> = ({name, isOpen, onToggle, formData, onNestedChange, onFileChange}) => {
    const creator = formData.creatorProfile;
    return (
        <FormSection name={name} isOpen={isOpen} onToggle={onToggle} title="Creator Profile" description="Display a contact card for the app creator in the footer.">
            <div className="flex items-center justify-between">
                <label htmlFor="creator-enabled" className={labelStyle}>Enable Creator Profile</label>
                <input id="creator-enabled" type="checkbox" checked={creator.enabled} onChange={e => onNestedChange('creatorProfile.enabled', e.target.checked)} className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500" />
            </div>
            {creator.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <ImageUpload label="Avatar" value={creator.imageUrl} onTextChange={e => onNestedChange('creatorProfile.imageUrl', e.target.value)} onFileChange={e => onFileChange(e, 'creatorProfile.imageUrl')} onRemove={() => onNestedChange('creatorProfile.imageUrl', '')} />
                    <ImageUpload label="Logo (Light Mode)" value={creator.logoUrlLight || ''} onTextChange={e => onNestedChange('creatorProfile.logoUrlLight', e.target.value)} onFileChange={e => onFileChange(e, 'creatorProfile.logoUrlLight')} onRemove={() => onNestedChange('creatorProfile.logoUrlLight', '')} />
                    <ImageUpload label="Logo (Dark Mode)" value={creator.logoUrlDark || ''} onTextChange={e => onNestedChange('creatorProfile.logoUrlDark', e.target.value)} onFileChange={e => onFileChange(e, 'creatorProfile.logoUrlDark')} onRemove={() => onNestedChange('creatorProfile.logoUrlDark', '')} />
                    <div><label className={labelStyle}>Name</label><input type="text" value={creator.name} onChange={e => onNestedChange('creatorProfile.name', e.target.value)} className={inputStyle} /></div>
                    <div><label className={labelStyle}>Title</label><input type="text" value={creator.title} onChange={e => onNestedChange('creatorProfile.title', e.target.value)} className={inputStyle} /></div>
                    <div><label className={labelStyle}>Phone</label><input type="tel" value={creator.phone} onChange={e => onNestedChange('creatorProfile.phone', e.target.value)} className={inputStyle} /></div>
                    <div><label className={labelStyle}>Email</label><input type="email" value={creator.email} onChange={e => onNestedChange('creatorProfile.email', e.target.value)} className={inputStyle} /></div>
                    <div><label className={labelStyle}>Website URL</label><input type="url" value={creator.website} onChange={e => onNestedChange('creatorProfile.website', e.target.value)} className={inputStyle} /></div>
                    <div><label className={labelStyle}>Website Text</label><input type="text" value={creator.websiteText} onChange={e => onNestedChange('creatorProfile.websiteText', e.target.value)} className={inputStyle} /></div>
                    <div><label className={labelStyle}>WhatsApp URL</label><input type="url" value={creator.whatsapp} onChange={e => onNestedChange('creatorProfile.whatsapp', e.target.value)} className={inputStyle} /></div>
                </div>
            )}
        </FormSection>
    );
};

const LoginPageStyleSection: React.FC<{name: string, isOpen: boolean, onToggle: (name: string) => void, formData: Settings, onNestedChange: any, onFileChange: any}> = ({name, isOpen, onToggle, formData, onNestedChange, onFileChange}) => (
    <FormSection name={name} isOpen={isOpen} onToggle={onToggle} title="Login Page Style" description="Customize the appearance of the admin login screen.">
        <ImageUpload label="Background Image" value={formData.loginScreen.backgroundImageUrl} onTextChange={e => onNestedChange('loginScreen.backgroundImageUrl', e.target.value)} onFileChange={e => onFileChange(e, 'loginScreen.backgroundImageUrl')} onRemove={() => onNestedChange('loginScreen.backgroundImageUrl', '')} />
        <ColorInput label="Background Color" value={formData.loginScreen.backgroundColor} onChange={e => onNestedChange('loginScreen.backgroundColor', e.target.value)} />
        <ColorInput label="Login Box Background" value={formData.loginScreen.boxBackgroundColor} onChange={e => onNestedChange('loginScreen.boxBackgroundColor', e.target.value)} />
        <ColorInput label="Text Color" value={formData.loginScreen.textColor} onChange={e => onNestedChange('loginScreen.textColor', e.target.value)} />
    </FormSection>
);

const PamphletPlaceholderSection: React.FC<{name: string, isOpen: boolean, onToggle: (name: string) => void, formData: Settings, onNestedChange: any}> = ({name, isOpen, onToggle, formData, onNestedChange}) => (
    <FormSection name={name} isOpen={isOpen} onToggle={onToggle} title="Pamphlet Placeholder" description="Customize the message shown when no promotional pamphlets are active.">
        <div><label className={labelStyle}>Placeholder Text</label><input type="text" value={formData.pamphletPlaceholder.text} onChange={e => onNestedChange('pamphletPlaceholder.text', e.target.value)} className={inputStyle} /></div>
        <div className="grid grid-cols-2 gap-4">
            <ColorInput label="Gradient Color 1" value={formData.pamphletPlaceholder.color1} onChange={e => onNestedChange('pamphletPlaceholder.color1', e.target.value)} />
            <ColorInput label="Gradient Color 2" value={formData.pamphletPlaceholder.color2} onChange={e => onNestedChange('pamphletPlaceholder.color2', e.target.value)} />
        </div>
        <FontStyleEditor title="Font Style" value={formData.pamphletPlaceholder.font} onChange={v => onNestedChange('pamphletPlaceholder.font', v)} />
    </FormSection>
);

const TypographySection: React.FC<{name: string, isOpen: boolean, onToggle: (name: string) => void, formData: Settings, onNestedChange: any}> = ({name, isOpen, onToggle, formData, onNestedChange}) => (
    <FormSection name={name} isOpen={isOpen} onToggle={onToggle} title="Typography" description="Define the fonts and styles for different text elements across the app.">
        <div><label className={labelStyle}>Google Fonts URL</label><input type="url" value={formData.typography.googleFontUrl} onChange={e => onNestedChange('typography.googleFontUrl', e.target.value)} className={inputStyle} placeholder="e.g., https://fonts.googleapis.com/css2?family=Roboto..." /></div>
        <FontStyleEditor title="Body Text" value={formData.typography.body} onChange={v => onNestedChange('typography.body', v)} />
        <FontStyleEditor title="Section Headings" value={formData.typography.headings} onChange={v => onNestedChange('typography.headings', v)} />
        <FontStyleEditor title="Item Titles" value={formData.typography.itemTitles} onChange={v => onNestedChange('typography.itemTitles', v)} />
    </FormSection>
);

const NavigationSection: React.FC<{name: string, isOpen: boolean, onToggle: (name: string) => void, navLinks: NavLink[], onNavLinksChange: (links: NavLink[]) => void}> = ({name, isOpen, onToggle, navLinks, onNavLinksChange}) => {
    const handleLinkChange = (id: string, field: keyof NavLink, value: any) => {
        const newLinks = navLinks.map(link => link.id === id ? { ...link, [field]: value } : link);
        onNavLinksChange(newLinks);
    };
    const addLink = () => { onNavLinksChange([...navLinks, { id: `nav_${Date.now()}`, label: 'New Link', path: '/', enabled: true }]); };
    const removeLink = (id: string) => { onNavLinksChange(navLinks.filter(link => link.id !== id)); };
    
    return (
        <FormSection name={name} isOpen={isOpen} onToggle={onToggle} title="Header Navigation" description="Customize the links shown in the main header.">
            <div className="space-y-4">
                {navLinks.map(link => (
                    <div key={link.id} className="grid grid-cols-10 gap-2 items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                        <div className="col-span-4"><input type="text" value={link.label} onChange={e => handleLinkChange(link.id, 'label', e.target.value)} className={inputStyle} placeholder="Label" /></div>
                        <div className="col-span-4"><input type="text" value={link.path} onChange={e => handleLinkChange(link.id, 'path', e.target.value)} className={inputStyle} placeholder="Path (e.g., /tvs)" /></div>
                        <div className="col-span-1 flex justify-center"><input type="checkbox" checked={link.enabled} onChange={e => handleLinkChange(link.id, 'enabled', e.target.checked)} className="h-5 w-5 rounded" /></div>
                        <div className="col-span-1 flex justify-center"><button type="button" onClick={() => removeLink(link.id)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button></div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addLink} className="btn btn-secondary"><PlusIcon className="w-4 h-4" /> Add Link</button>
        </FormSection>
    );
};

const KioskBehaviorSection: React.FC<{name: string, isOpen: boolean, onToggle: (name: string) => void, formData: Settings, onNestedChange: any}> = ({name, isOpen, onToggle, formData, onNestedChange}) => (
    <FormSection name={name} isOpen={isOpen} onToggle={onToggle} title="Kiosk Behavior & Screensaver" description="Configure idle timeouts, screensaver settings, and other kiosk-specific options.">
        <div><label className={labelStyle}>Idle Redirect Timeout (seconds)</label><input type="number" value={formData.kiosk.idleRedirectTimeout} onChange={e => onNestedChange('kiosk.idleRedirectTimeout', parseInt(e.target.value, 10) || 0)} className={inputStyle} /><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time until the app redirects to the homepage after inactivity. Set to 0 to disable.</p></div>
        <div><label className={labelStyle}>Screensaver Delay (seconds)</label><input type="number" value={formData.screensaverDelay} onChange={e => onNestedChange('screensaverDelay', parseInt(e.target.value, 10) || 0)} className={inputStyle} /></div>
        <div><label className={labelStyle}>Screensaver Content Source</label><select value={formData.screensaverContentSource} onChange={e => onNestedChange('screensaverContentSource', e.target.value)} className={inputStyle}><option value="products_and_ads">Products & Ads</option><option value="ads_only">Ads Only</option></select></div>
        <div className="flex items-center justify-between"><label htmlFor="kiosk-pin" className={labelStyle}>Require PIN to Exit Screensaver</label><input id="kiosk-pin" type="checkbox" checked={formData.kiosk.pinProtectScreensaver} onChange={e => onNestedChange('kiosk.pinProtectScreensaver', e.target.checked)} className="h-5 w-5 rounded" /></div>
        <div className="flex items-center justify-between"><label htmlFor="kiosk-context" className={labelStyle}>Disable Right-Click Menu</label><input id="kiosk-context" type="checkbox" checked={formData.kiosk.disableContextMenu} onChange={e => onNestedChange('kiosk.disableContextMenu', e.target.checked)} className="h-5 w-5 rounded" /></div>
    </FormSection>
);

// --- MAIN SETTINGS COMPONENT ---
const AdminSettings: React.FC = () => {
    const { settings, updateSettings, saveFileToStorage, loggedInUser, kioskId, setKioskId } = useAppContext();
    const [formData, setFormData] = useState<Settings>(settings);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    
    // State for controlled accordion and context-aware preview
    const [openSection, setOpenSection] = useState('branding');
    const [previewPage, setPreviewPage] = useState<'home' | 'login'>('home');

    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSettings;

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleSectionToggle = (sectionName: string) => {
        const newOpenSection = openSection === sectionName ? '' : sectionName;
        setOpenSection(newOpenSection);
    
        // Update preview based on which section is being opened
        switch (newOpenSection) {
            case 'loginPage':
                setPreviewPage('login');
                break;
            case 'branding':
            case 'theme':
            case 'typography':
            case 'navigation':
            case 'kioskBehavior':
            case 'pamphletPlaceholder':
            case 'creatorProfile':
                setPreviewPage('home');
                break;
            default:
                setPreviewPage('home');
        }
    };

    const handleNestedChange = (path: string, value: any) => {
        setFormData(prev => {
            const keys = path.split('.');
            const newFormData = JSON.parse(JSON.stringify(prev)); // Deep copy
            let currentLevel: any = newFormData;
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel = currentLevel[keys[i]];
            }
            currentLevel[keys[keys.length - 1]] = value;
            
            // If logoUrl is being changed, also change pwaIconUrl
            if (path === 'logoUrl') {
                newFormData.pwaIconUrl = value;
            }
            
            return newFormData;
        });
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const fileName = await saveFileToStorage(e.target.files[0], ['system']);
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
            setShowReloadNotice(true);
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
                        <BrandingAndIdentitySection name="branding" isOpen={openSection === 'branding'} onToggle={handleSectionToggle} formData={formData} onFileChange={handleFileChange} onNestedChange={handleNestedChange} kioskId={kioskId} setKioskId={setKioskId} loggedInUser={loggedInUser} />
                        <ThemeAndAppearanceSection name="theme" isOpen={openSection === 'theme'} onToggle={handleSectionToggle} formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />
                        <CreatorProfileSection name="creatorProfile" isOpen={openSection === 'creatorProfile'} onToggle={handleSectionToggle} formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />
                        <LoginPageStyleSection name="loginPage" isOpen={openSection === 'loginPage'} onToggle={handleSectionToggle} formData={formData} onNestedChange={handleNestedChange} onFileChange={handleFileChange} />
                        <PamphletPlaceholderSection name="pamphletPlaceholder" isOpen={openSection === 'pamphletPlaceholder'} onToggle={handleSectionToggle} formData={formData} onNestedChange={handleNestedChange} />
                        <TypographySection name="typography" isOpen={openSection === 'typography'} onToggle={handleSectionToggle} formData={formData} onNestedChange={handleNestedChange} />
                        <NavigationSection name="navigation" isOpen={openSection === 'navigation'} onToggle={handleSectionToggle} navLinks={formData.navigation.links} onNavLinksChange={(links) => handleNestedChange('navigation.links', links)} />
                        <KioskBehaviorSection name="kioskBehavior" isOpen={openSection === 'kioskBehavior'} onToggle={handleSectionToggle} formData={formData} onNestedChange={handleNestedChange} />

                        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 space-y-4">
                             <AnimatePresence>
                                {showReloadNotice && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 p-4 rounded-r-lg flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ArrowPathIcon className="h-5 w-5 flex-shrink-0" />
                                            <p className="text-sm font-medium">
                                                Please reload the application for PWA icon and name changes to apply.
                                            </p>
                                        </div>
                                        <button type="button" onClick={() => setShowReloadNotice(false)} className="p-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/60">
                                            <XIcon className="h-4 w-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="flex justify-end">
                                <button type="submit" className={`btn btn-primary ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`} disabled={saving || saved}>
                                    <SaveIcon className="h-4 w-4" />
                                    {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save All Settings')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column: Live Preview (Desktop Only) */}
                <div className="hidden lg:block lg:col-span-1 sticky top-24">
                    <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
                        <h3 className="text-lg font-semibold section-heading">Live Preview</h3>
                    </div>
                    <KioskPreview settings={formData} previewPage={previewPage} />
                </div>
            </div>

            {/* Mobile Preview FAB */}
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="lg:hidden fixed bottom-20 right-6 z-40 btn btn-primary !rounded-full !p-3 shadow-lg flex items-center gap-2 animate-bounce"
              aria-label="Show Live Preview"
            >
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
                               <KioskPreview settings={formData} previewPage={previewPage} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};


export default AdminSettings;
