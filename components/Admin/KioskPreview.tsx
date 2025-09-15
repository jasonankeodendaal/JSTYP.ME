import React, { useState, useEffect } from 'react';
import type { Settings } from '../../types.ts';
import LocalMedia from '../LocalMedia.tsx';
import { SearchIcon, SunIcon, MoonIcon, UserCircleIcon, CubeIcon } from '../Icons.tsx';

// --- HELPER FUNCTIONS & TYPES ---

// This function generates a React style object containing all the CSS variables
// needed to accurately render the kiosk's theme and typography.
const generateThemeStyles = (settings: Settings, theme: 'light' | 'dark'): React.CSSProperties => {
    const themeColors = theme === 'light' ? settings.lightTheme : settings.darkTheme;
    const { typography } = settings;

    // Define light/dark specific variables that are hardcoded in index.html
    const glassBg = theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.5)';
    const glassBorder = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)';

    // FIX: Changed type from React.CSSProperties to any to allow CSS custom properties (variables).
    const styles: any = {
        // Colors from Theme settings
        '--app-bg': themeColors.appBg,
        '--app-bg-image': themeColors.appBgImage,
        '--main-bg': themeColors.mainBg,
        '--main-text': themeColors.mainText,
        '--main-shadow': themeColors.mainShadow,
        '--main-border': themeColors.mainBorder,
        '--primary-color': themeColors.primary,
        '--btn-primary-bg': themeColors.primaryButton.background,
        '--btn-primary-text': themeColors.primaryButton.text,
        '--btn-primary-hover-bg': themeColors.primaryButton.hoverBackground,
        '--btn-destructive-bg': themeColors.destructiveButton.background,
        '--btn-destructive-text': themeColors.destructiveButton.text,
        '--btn-destructive-hover-bg': themeColors.destructiveButton.hoverBackground,
        '--glass-bg': glassBg,
        '--glass-border': glassBorder,
        
        // Typography from settings
        '--body-font-family': `'${typography.body.fontFamily}', sans-serif`,
        '--body-font-weight': typography.body.fontWeight,
        '--body-font-style': typography.body.fontStyle,
        '--body-text-decoration': typography.body.textDecoration,
        '--body-letter-spacing': typography.body.letterSpacing,
        '--body-text-transform': typography.body.textTransform,

        '--headings-font-family': `'${typography.headings.fontFamily}', sans-serif`,
        '--headings-font-weight': typography.headings.fontWeight,
        '--headings-font-style': typography.headings.fontStyle,
        '--headings-font-decoration': typography.headings.textDecoration,
        '--headings-letter-spacing': typography.headings.letterSpacing,
        '--headings-text-transform': typography.headings.textTransform,

        '--item-titles-font-family': `'${typography.itemTitles.fontFamily}', sans-serif`,
        '--item-titles-font-weight': typography.itemTitles.fontWeight,
        '--item-titles-font-style': typography.itemTitles.fontStyle,
        '--item-titles-font-decoration': typography.itemTitles.textDecoration,
        '--item-titles-letter-spacing': typography.itemTitles.letterSpacing,
        '--item-titles-text-transform': typography.itemTitles.textTransform,
        
        // Root styles for the preview container itself
        color: themeColors.mainText,
        fontFamily: `'${typography.body.fontFamily}', sans-serif`,
        fontWeight: typography.body.fontWeight,
        fontStyle: typography.body.fontStyle,
    };

    return styles as React.CSSProperties;
};


// --- PREVIEW SUB-COMPONENTS ---

const PreviewHeader: React.FC<{ settings: Settings; theme: 'light' | 'dark' }> = ({ settings, theme }) => {
    const headerSettings = settings.header;

    const headerClasses = [
        headerSettings?.effect === 'glassmorphism' ? 'effect-glassmorphism' : '',
        headerSettings?.effect === '3d-shadow' ? 'effect-3d-shadow' : '',
    ].filter(Boolean).join(' ');

    const headerStyle: React.CSSProperties = {
        backgroundColor: headerSettings.effect === 'glassmorphism' ? 'transparent' : headerSettings.backgroundColor,
        color: theme === 'light' ? 'var(--main-text)' : headerSettings.textColor,
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'relative'
    };

    const headerBgStyle: React.CSSProperties = {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
        backgroundImage: headerSettings.backgroundImageUrl ? `url(${headerSettings.backgroundImageUrl})` : 'none',
        backgroundColor: headerSettings.backgroundColor,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: headerSettings.backgroundImageOpacity,
    };
    
    return (
        <header style={headerStyle} className={headerClasses}>
            <div style={headerBgStyle}></div>
            <LocalMedia src={settings.logoUrl} type="image" alt="Logo" className="h-16 w-auto object-contain" />
            <div className="flex items-center gap-6">
                {settings.navigation.links.filter(l => l.enabled).map(link => (
                    <span key={link.id} className="section-heading" style={{fontSize: '1.1rem'}}>{link.label}</span>
                ))}
                <div className="relative">
                    <input type="text" placeholder="Search..." disabled className="w-48 pl-10 pr-4 py-2 border border-gray-400 rounded-full text-sm bg-white/80 dark:bg-black/20" />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
        </header>
    );
};

const PreviewFooter: React.FC<{ settings: Settings; theme: 'light' | 'dark' }> = ({ settings, theme }) => {
    const footerSettings = settings.footer;
    const creator = settings.creatorProfile;

    const footerClasses = [
        'border-t',
        footerSettings?.effect === 'glassmorphism' ? 'effect-glassmorphism' : '',
        footerSettings?.effect === '3d-shadow' ? 'effect-3d-shadow' : '',
    ].filter(Boolean).join(' ');

    const footerStyle: React.CSSProperties = {
        backgroundColor: footerSettings.effect === 'glassmorphism' ? 'transparent' : footerSettings.backgroundColor,
        color: theme === 'light' ? 'var(--main-text)' : footerSettings.textColor,
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'relative',
        borderColor: 'var(--main-border)'
    };
    
    const footerBgStyle: React.CSSProperties = {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1,
        backgroundImage: footerSettings.backgroundImageUrl ? `url(${footerSettings.backgroundImageUrl})` : 'none',
        backgroundColor: footerSettings.backgroundColor,
        opacity: footerSettings.backgroundImageOpacity,
    };

    return (
        <footer style={footerStyle} className={footerClasses}>
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
            <div className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCircleIcon className="h-5 w-5" />
                <span>Admin Login</span>
            </div>
        </footer>
    );
};

const PreviewProductCard: React.FC<{ settings: Settings }> = ({ settings }) => (
    <div style={{boxShadow: settings.cardStyle.shadow}} className={`relative bg-gray-500 aspect-square overflow-hidden ${settings.cardStyle.cornerRadius}`}>
        <div className="w-full h-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <h3 className="item-title" style={{ position: 'absolute', bottom: '1rem', left: '1rem', color: 'white', fontSize: '1rem' }}>
            Product Name
        </h3>
    </div>
);

const PreviewHomePage: React.FC<{ settings: Settings; theme: 'light' | 'dark' }> = ({ settings, theme }) => {
    const mainStyle: React.CSSProperties = {
        backgroundColor: 'var(--main-bg)',
        color: 'var(--main-text)',
        padding: '2rem',
        width: settings.layout.width === 'wide' ? '100%' : 'clamp(320px, 100%, 1280px)',
        margin: '0 auto',
    };
    
    const headingStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: 'var(--main-text)'
    };
    
    const placeholder = settings.pamphletPlaceholder;
    const placeholderStyle: React.CSSProperties = {
        fontFamily: `'${placeholder.font.fontFamily}', sans-serif`,
        fontWeight: placeholder.font.fontWeight,
        fontStyle: placeholder.font.fontStyle,
        backgroundImage: `linear-gradient(to right, ${placeholder.color1}, ${placeholder.color2})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
    };

    return (
        <div style={{ backgroundColor: 'var(--app-bg)', backgroundImage: 'var(--app-bg-image)'}} className="w-full h-full flex flex-col">
            <PreviewHeader settings={settings} theme={theme} />
            <div className="flex-grow overflow-y-auto">
                <div style={mainStyle} className="space-y-12">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl flex items-center gap-6 text-white">
                        <CubeIcon className="w-16 h-16 flex-shrink-0" />
                        <div>
                            <h3 className="section-heading" style={{color: 'white', fontSize: '1.5rem', marginBottom: '0.25rem'}}>Create Client Quote</h3>
                            <p className="text-indigo-200 text-sm">Start a new quote by selecting products for a client.</p>
                        </div>
                    </div>
                    <div>
                        <h2 style={headingStyle} className="section-heading">Latest Offers</h2>
                        <div className="py-8 px-4 bg-gray-100 dark:bg-gray-900/40 rounded-xl flex items-center justify-center gap-4">
                            <span className="text-4xl" style={placeholderStyle}>{placeholder.text}</span>
                        </div>
                    </div>
                    <div>
                        <h2 style={headingStyle} className="section-heading">Shop by Brand</h2>
                        <div className="grid grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-700 aspect-video rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">Brand</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 style={headingStyle} className="section-heading">Featured Products</h2>
                        <div className="grid grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <PreviewProductCard key={i} settings={settings} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <PreviewFooter settings={settings} theme={theme} />
        </div>
    );
};

const PreviewLoginPage: React.FC<{ settings: Settings }> = ({ settings }) => {
    const loginSettings = settings.loginScreen;

    const pageStyle: React.CSSProperties = {
        backgroundImage: `url(${loginSettings.backgroundImageUrl})`,
        backgroundColor: loginSettings.backgroundColor,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const boxStyle: React.CSSProperties = { background: loginSettings.boxBackgroundColor };
    const textStyle: React.CSSProperties = { color: loginSettings.textColor };

    return (
        <div style={pageStyle} className="w-full h-full flex flex-col justify-center items-center p-12">
            <LocalMedia src={settings.logoUrl} alt="Logo" type="image" className="h-20 w-auto mx-auto mb-8" />
            <div style={boxStyle} className="w-full max-w-md py-12 px-10 rounded-2xl shadow-2xl">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight section-heading" style={textStyle}>
                        ADMIN LOGIN
                    </h2>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-left" style={textStyle}>User</label>
                        <select className="mt-1 appearance-none block w-full px-3 py-3 border border-transparent rounded-md shadow-sm bg-white text-gray-900" disabled>
                            <option>Main Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-left" style={textStyle}>PIN</label>
                        <input type="password" value="••••" className="mt-1 appearance-none block w-full px-3 py-3 border border-transparent rounded-md shadow-sm bg-white text-gray-900" disabled />
                    </div>
                    <div>
                        <button type="button" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-blue-600 bg-white" disabled>
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN PREVIEW COMPONENT ---
interface KioskPreviewProps {
    settings: Settings;
    previewPage: 'home' | 'login';
}

const KioskPreview: React.FC<KioskPreviewProps> = ({ settings, previewPage }) => {
    const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('dark');
    const oppositeTheme = previewTheme === 'light' ? 'dark' : 'light';

    const themeStyles = generateThemeStyles(settings, previewTheme);

    useEffect(() => {
        const fontUrl = settings.typography.googleFontUrl;
        if (!fontUrl) return;
        const linkId = 'kiosk-preview-font-link';

        const existingLink = document.getElementById(linkId);
        if (existingLink) existingLink.remove();

        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);

        return () => {
            const linkToRemove = document.getElementById(linkId);
            if (linkToRemove) linkToRemove.remove();
        };
    }, [settings.typography.googleFontUrl]);

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
                     <div
                        id="preview-root"
                        style={themeStyles}
                        className={`w-full h-full overflow-hidden ${previewTheme === 'dark' ? 'dark' : ''}`}
                    >
                        {previewPage === 'login' ? (
                            <PreviewLoginPage settings={settings} />
                        ) : (
                            <PreviewHomePage settings={settings} theme={previewTheme} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KioskPreview;
