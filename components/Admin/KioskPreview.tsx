import React, { useState } from 'react';
import type { Settings } from '../../types';
import LocalMedia from '../LocalMedia';
import { SearchIcon, SunIcon, MoonIcon } from '../Icons';

interface KioskPreviewProps {
    settings: Settings;
}

const KioskPreview: React.FC<KioskPreviewProps> = ({ settings }) => {
    const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('dark');

    const theme = previewTheme === 'light' ? settings.lightTheme : settings.darkTheme;
    const oppositeTheme = previewTheme === 'light' ? 'dark' : 'light';

    const appStyle: React.CSSProperties = {
        backgroundColor: theme.appBg,
        backgroundImage: theme.appBgImage,
        fontFamily: settings.typography.body.fontFamily,
        fontWeight: settings.typography.body.fontWeight,
        fontStyle: settings.typography.body.fontStyle,
    };

    const mainStyle: React.CSSProperties = {
        backgroundColor: theme.mainBg,
        color: theme.mainText,
    };

    const headerStyle: React.CSSProperties = {
        backgroundColor: settings.header.effect === 'glassmorphism' ? 'transparent' : settings.header.backgroundColor,
        color: previewTheme === 'light' ? theme.mainText : settings.header.textColor,
        position: 'relative',
    };

    const headerBgStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${settings.header.backgroundImageUrl})`,
        backgroundColor: settings.header.backgroundColor,
        opacity: settings.header.backgroundImageOpacity,
        zIndex: -1,
    };
    
    const footerStyle: React.CSSProperties = {
        backgroundColor: settings.footer.effect === 'glassmorphism' ? 'transparent' : settings.footer.backgroundColor,
        color: previewTheme === 'light' ? theme.mainText : settings.footer.textColor,
        position: 'relative',
    };

    const footerBgStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${settings.footer.backgroundImageUrl})`,
        backgroundColor: settings.footer.backgroundColor,
        opacity: settings.footer.backgroundImageOpacity,
        zIndex: -1,
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
            <div className="w-full aspect-[10/16] max-h-[70vh] lg:max-h-[600px] overflow-hidden rounded-lg shadow-2xl border-4 border-gray-300 dark:border-gray-700">
                <div className="w-full h-full scale-[0.35] origin-top-left bg-gray-100" style={{ transform: 'scale(0.35)', width: '285.71%', height: '285.71%' }}>
                    <div style={appStyle} className="w-full h-full flex flex-col">
                        
                        {/* Preview Header */}
                        <header style={headerStyle} className={`p-8 flex items-center justify-between shrink-0 ${settings.header.effect === 'glassmorphism' ? 'backdrop-blur-md' : ''}`}>
                            <div style={headerBgStyle}></div>
                            <LocalMedia src={settings.logoUrl} type="image" alt="Logo" className="h-16 w-auto object-contain" />
                            <div className="flex items-center gap-6">
                                {settings.navigation.links.filter(l => l.enabled).map(link => (
                                    <span key={link.id} style={{fontFamily: settings.typography.headings.fontFamily, fontWeight: settings.typography.headings.fontWeight, fontSize: '1.25rem'}}>{link.label}</span>
                                ))}
                                <div className="relative">
                                    <input type="text" placeholder="Search..." className="w-64 pl-10 pr-4 py-2.5 border border-gray-400 rounded-full text-sm" />
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </header>

                        {/* Preview Content */}
                        <main style={mainStyle} className="flex-grow p-8">
                            <h2 style={{
                                fontFamily: settings.typography.headings.fontFamily,
                                fontWeight: settings.typography.headings.fontWeight,
                                fontSize: '2.5rem',
                                marginBottom: '1.5rem',
                            }}>
                                Shop by Brand
                            </h2>
                            <div className="grid grid-cols-5 gap-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`relative bg-gray-500 aspect-square overflow-hidden ${settings.cardStyle.cornerRadius} ${settings.cardStyle.shadow}`}>
                                        <div className="w-full h-full bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                        <h3 style={{
                                            position: 'absolute',
                                            bottom: '1rem',
                                            left: '1rem',
                                            color: 'white',
                                            fontFamily: settings.typography.itemTitles.fontFamily,
                                            fontWeight: settings.typography.itemTitles.fontWeight,
                                            fontSize: '1.2rem'
                                        }}>
                                            Product Name
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </main>
                        
                        {/* Preview Footer */}
                        <footer style={footerStyle} className={`p-6 flex items-center justify-between shrink-0 ${settings.footer.effect === 'glassmorphism' ? 'backdrop-blur-md' : ''}`}>
                           <div style={footerBgStyle}></div>
                           <div className="flex items-center gap-4">
                                {settings.creatorProfile.enabled && (
                                     <LocalMedia 
                                        src={previewTheme === 'light' ? (settings.creatorProfile.logoUrlLight || settings.creatorProfile.logoUrlDark || '') : (settings.creatorProfile.logoUrlDark || settings.creatorProfile.logoUrlLight || '')}
                                        alt="Creator Logo" 
                                        type="image"
                                        className="h-10 w-auto"
                                    />
                                )}
                                <p className="text-sm">JSTYP.me &copy; 2025</p>
                           </div>
                           <div className="flex items-center gap-2">
                            <span className="text-sm">Admin Login</span>
                           </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KioskPreview;