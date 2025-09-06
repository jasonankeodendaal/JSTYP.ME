import React, { useState } from 'react';
import type { Settings } from '../../types.ts';
import LocalMedia from '../LocalMedia.tsx';
import { SearchIcon, SunIcon, MoonIcon, UserCircleIcon, CubeIcon } from '../Icons.tsx';

interface KioskPreviewProps {
    settings: Settings;
}

// --- SUB-COMPONENTS FOR PREVIEW ---

const PreviewHeader: React.FC<KioskPreviewProps & { theme: 'light' | 'dark' }> = ({ settings, theme }) => {
    const themeColors = theme === 'light' ? settings.lightTheme : settings.darkTheme;
    const headerSettings = settings.header;

    const headerStyle: React.CSSProperties = {
        backgroundColor: headerSettings.effect === 'glassmorphism' ? 'transparent' : headerSettings.backgroundColor,
        color: theme === 'light' ? themeColors.mainText : headerSettings.textColor,
        position: 'relative',
        padding: '1.25rem 2rem', // Equivalent to p-5 px-8
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
    };

    const headerBgStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: headerSettings.backgroundImageUrl ? `url(${headerSettings.backgroundImageUrl})` : 'none',
        backgroundColor: headerSettings.backgroundColor,
        opacity: headerSettings.backgroundImageOpacity,
        zIndex: -1,
        backdropFilter: headerSettings.effect === 'glassmorphism' ? 'blur(16px)' : 'none'
    };
    
    return (
        <header style={headerStyle}>
            <div style={headerBgStyle}></div>
            <LocalMedia src={settings.logoUrl} type="image" alt="Logo" className="h-16 w-auto object-contain" />
            <div className="flex items-center gap-6">
                {settings.navigation.links.filter(l => l.enabled).map(link => (
                    <span key={link.id} style={{
                        fontFamily: `'${settings.typography.headings.fontFamily}', sans-serif`,
                        fontWeight: settings.typography.headings.fontWeight,
                        fontSize: '1.1rem'
                    }}>{link.label}</span>
                ))}
                <div className="relative">
                    <input type="text" placeholder="Search..." disabled className="w-48 pl-10 pr-4 py-2 border border-gray-400 rounded-full text-sm bg-white/80 dark:bg-black/20" />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
        </header>
    );
};

const PreviewFooter: React.FC<KioskPreviewProps & { theme: 'light' | 'dark' }> = ({ settings, theme }) => {
    const themeColors = theme === 'light' ? settings.lightTheme : settings.darkTheme;
    const footerSettings = settings.footer;
    const creator = settings.creatorProfile;

    const footerStyle: React.CSSProperties = {
        backgroundColor: footerSettings.effect === 'glassmorphism' ? 'transparent' : footerSettings.backgroundColor,
        color: theme === 'light' ? themeColors.mainText : footerSettings.textColor,
        position: 'relative',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderTop: '1px solid rgba(128,128,128,0.2)'
    };
    
    const footerBgStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: footerSettings.backgroundImageUrl ? `url(${footerSettings.backgroundImageUrl})` : 'none',
        backgroundColor: footerSettings.backgroundColor,
        opacity: footerSettings.backgroundImageOpacity,
        zIndex: -1,
        backdropFilter: footerSettings.effect === 'glassmorphism' ? 'blur(16px)' : 'none'
    };

    return (
        <footer style={footerStyle}>
            <div style={footerBgStyle}></div>
            <div className="flex items-center gap-4">
                {creator.enabled && (
                    <LocalMedia
                        src={theme === 'light' ? (creator.logoUrlLight || creator.logoUrlDark || '') : (creator.logoUrlDark || creator.logoUrlLight || '')}
                        alt="Creator Logo" type="image" className="h-10 w-auto"
                    />
                )}
                <p className="text-sm">JSTYP.me &copy; 2025</p>
            </div>
            <div style={{
                backgroundColor: themeColors.primaryButton.background,
                color: themeColors.primaryButton.text,
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
            }}>
                <UserCircleIcon className="h-5 w-5" />
                <span>Admin Login</span>
            </div>
        </footer>
    );
};

const PreviewProductCard: React.FC<KioskPreviewProps> = ({ settings }) => (
    <div style={{boxShadow: settings.cardStyle.shadow}} className={`relative bg-gray-500 aspect-square overflow-hidden ${settings.cardStyle.cornerRadius}`}>
        <div className="w-full h-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <h3 style={{
            position: 'absolute', bottom: '1rem', left: '1rem', color: 'white',
            fontFamily: `'${settings.typography.itemTitles.fontFamily}', sans-serif`,
            fontWeight: settings.typography.itemTitles.fontWeight,
            fontStyle: settings.typography.itemTitles.fontStyle,
            textDecoration: settings.typography.itemTitles.textDecoration,
            letterSpacing: settings.typography.itemTitles.letterSpacing,
            textTransform: settings.typography.itemTitles.textTransform,
            fontSize: '1rem'
        }}>Product Name</h3>
    </div>
);


const KioskPreview: React.FC<KioskPreviewProps> = ({ settings }) => {
    const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('dark');

    const theme = previewTheme === 'light' ? settings.lightTheme : settings.darkTheme;
    const oppositeTheme = previewTheme === 'light' ? 'dark' : 'light';

    const appStyle: React.CSSProperties = {
        backgroundColor: theme.appBg,
        backgroundImage: theme.appBgImage,
        fontFamily: `'${settings.typography.body.fontFamily}', sans-serif`,
        fontWeight: settings.typography.body.fontWeight,
        fontStyle: settings.typography.body.fontStyle,
    };

    const mainStyle: React.CSSProperties = {
        backgroundColor: theme.mainBg,
        color: theme.mainText,
        padding: '2rem',
    };
    
    const headingStyle: React.CSSProperties = {
        fontFamily: `'${settings.typography.headings.fontFamily}', sans-serif`,
        fontWeight: settings.typography.headings.fontWeight,
        fontStyle: settings.typography.headings.fontStyle,
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: theme.mainText
    };

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-900 p-2 md:p-4 rounded-2xl h-full">
            <div className="flex justify-between items-center mb-2 px-2">
                <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 block rounded-full bg-red-500"></span>
                    <span className="h-3 w-3 block rounded-full bg-yellow-500"></span>
                    <span className="h-3 w-3 block rounded-full bg-green-500"></span>
                </div>
                 <button 
                    onClick={() => setPreviewTheme(t => t === 'light' ? 'dark' : 'light')}
                    className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                    aria-label={`Switch preview to ${oppositeTheme} mode`}
                    title={`Switch preview to ${oppositeTheme} mode`}
                >
                    {previewTheme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                </button>
            </div>
            <div className="w-full aspect-[9/16] max-h-[70vh] lg:max-h-[600px] overflow-hidden rounded-lg shadow-2xl border-4 border-gray-300 dark:border-gray-700">
                 <div className="w-full h-full scale-[0.5] origin-top-left" style={{ transform: 'scale(0.5)', width: '200%', height: '200%' }}>
                    <div style={appStyle} className="w-full h-full flex flex-col">
                        <PreviewHeader settings={settings} theme={previewTheme} />

                        <div className="flex-grow overflow-y-auto">
                            <div style={mainStyle} className="space-y-12">
                                {/* CTA */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl flex items-center gap-6 text-white">
                                    <CubeIcon className="w-16 h-16 flex-shrink-0" />
                                    <div>
                                        <h3 style={{...headingStyle, color: 'white', fontSize: '1.5rem', marginBottom: '0.25rem'}}>Create Client Quote</h3>
                                        <p className="text-indigo-200 text-sm">Start a new quote by selecting products for a client.</p>
                                    </div>
                                </div>
                                
                                {/* Pamphlets */}
                                <div>
                                    <h2 style={headingStyle}>Latest Offers</h2>
                                    <div className="py-8 px-4 bg-gray-100 dark:bg-gray-900/40 rounded-xl flex items-center justify-center gap-4">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className={`relative bg-black aspect-[3/4] w-40 ${settings.cardStyle.cornerRadius} ${settings.cardStyle.shadow} overflow-hidden`}>
                                                <div className="w-full h-full bg-gray-500"></div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                                <h3 style={{fontFamily: `'${settings.typography.itemTitles.fontFamily}', sans-serif`, position: 'absolute', bottom: '0.75rem', left: '0.75rem', color: 'white'}}>Promotion</h3>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Brands */}
                                <div>
                                    <h2 style={headingStyle}>Shop by Brand</h2>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg flex items-center justify-center">
                                                <span className="text-xs text-gray-500">Brand</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Products */}
                                <div>
                                    <h2 style={headingStyle}>Featured Products</h2>
                                    <div className="grid grid-cols-3 gap-6">
                                        {[...Array(6)].map((_, i) => (
                                            <PreviewProductCard key={i} settings={settings} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <PreviewFooter settings={settings} theme={previewTheme} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KioskPreview;