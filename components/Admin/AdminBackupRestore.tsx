import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import type { StorageProvider } from '../../types.ts';
import { Link } from 'react-router-dom';
import { CheckIcon, UploadIcon, AndroidIcon } from '../Icons.tsx';

const SyncStatusIndicator: React.FC = () => {
    const { syncStatus, storageProvider } = useAppContext();

    if (storageProvider === 'none') {
        return null;
    }

    const providerName: Record<StorageProvider, string> = {
        local: 'Local Folder',
        customApi: 'Custom API',
        sharedUrl: 'Shared URL',
        supabase: 'Supabase',
        firebase: 'Firebase',
        vercel: 'Vercel',
        netlify: 'Netlify',
        aws: 'AWS Lambda',
        xano: 'Xano',
        backendless: 'Backendless',
        ftp: 'FTP',
        none: 'None'
    };

    const currentProviderName = providerName[storageProvider] || 'Provider';

    const statusMap = {
        idle: { text: 'Status: Idle', color: 'text-gray-500 dark:text-gray-400', animate: false },
        pending: { text: 'Status: Unsaved changes', color: 'text-yellow-600 dark:text-yellow-400', animate: false },
        syncing: { text: 'Status: Syncing...', color: 'text-blue-600 dark:text-blue-400', animate: true },
        synced: { text: `Status: All changes saved to ${currentProviderName}`, color: 'text-green-600 dark:text-green-400', animate: false },
        error: { text: 'Status: Sync Error. Please try a manual save.', color: 'text-red-600 dark:text-red-400', animate: false },
    };

    const currentStatus = statusMap[syncStatus];

    return (
        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-xl shadow-md border dark:border-gray-700/50 flex items-center gap-3 text-sm">
            {currentStatus.animate ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            ) : syncStatus === 'synced' ? (
                 <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
                <div className={`w-3 h-3 rounded-full ${syncStatus === 'pending' ? 'bg-yellow-500' : syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
            )}
            <span className={currentStatus.color}>{currentStatus.text}</span>
        </div>
    );
};


const AdminBackupRestore: React.FC = () => {
    const { 
        storageProvider, 
        loggedInUser,
        showConfirmation,
        saveDatabaseToLocal, loadDatabaseFromLocal,
        pushToCloud, pullFromCloud, syncStatus,
        uploadProjectZip,
        createZipBackup,
        restoreZipBackup,
        uploadApk,
        uploadProjectZipToLocalDB
    } = useAppContext();

    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPushing, setIsPushing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    
    // APK State
    const [apkFile, setApkFile] = useState<File | null>(null);
    const [isUploadingApk, setIsUploadingApk] = useState(false);
    const [uploadApkMessage, setUploadApkMessage] = useState('');
    
    // Project ZIP (Offline) State
    const [localUploadFile, setLocalUploadFile] = useState<File | null>(null);
    const [isLocalUploading, setIsLocalUploading] = useState(false);
    const [localUploadMessage, setLocalUploadMessage] = useState('');

    const isSuperAdmin = loggedInUser?.isMainAdmin ?? false;
    const canManage = loggedInUser?.isMainAdmin || loggedInUser?.permissions.canManageSystem;
    
    if (!canManage) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold section-heading">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You do not have permission to manage system settings.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        );
    }
    
    // --- Local File Handlers ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName('');
        }
    };
    
    const handleRestore = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fileInput = fileInputRef.current;
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert('Please select a backup file to restore.');
            return;
        }
        const file = fileInput.files[0];
        
        showConfirmation("Are you sure you want to restore? This will overwrite all current data and assets.", () => {
            restoreZipBackup(file);
        });
    };

    // --- Provider-Specific Handlers ---
    const handleSaveToDrive = async () => {
         showConfirmation("Are you sure you want to manually save to the drive? This will overwrite the current file.", async () => {
            setIsSaving(true);
            const success = await saveDatabaseToLocal();
            if (success) {
                alert("Data successfully saved to the connected folder.");
            } else {
                 alert("Error saving data. Check console for details.");
            }
            setIsSaving(false);
        });
    };

    const handleLoadFromDrive = async () => {
        showConfirmation(
            "Are you sure you want to load data from the drive? This will overwrite all current local data.",
            async () => {
                setIsLoading(true);
                const success = await loadDatabaseFromLocal();
                if(success) {
                    alert("Data successfully loaded from the connected folder.");
                } else {
                    alert("Error loading data. Check console for details.");
                }
                setIsLoading(false);
            }
        );
    };

    const handlePushToCloud = async () => {
         showConfirmation("Are you sure you want to push to the cloud? This will overwrite the current cloud data.", async () => {
            setIsPushing(true);
            const success = await pushToCloud();
            if(success) {
                alert("Data successfully pushed to the cloud.");
            } else {
                 alert("Error pushing data. Check console for details.");
            }
            setIsPushing(false);
        });
    };

    const handlePullFromCloud = async () => {
        showConfirmation("Are you sure you want to pull from the cloud? This will overwrite all current local data.", async () => {
            setIsPulling(true);
            const success = await pullFromCloud();
            if (success) {
                 alert("Data successfully pulled from the cloud.");
            } else {
                 alert("Error pulling data. Check console for details.");
            }
            setIsPulling(false);
        });
    };
    
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');

    const handleProjectFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.name.endsWith('.zip')) {
                setUploadFile(file);
                setUploadMessage('');
            } else {
                alert('Please select a .zip file.');
                e.target.value = '';
            }
        }
    };

    const handleProjectUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        setUploadMessage('Uploading, please wait...');
        try {
            await uploadProjectZip(uploadFile);
            setUploadMessage('Upload successful!');
            setUploadFile(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            setUploadMessage(`Upload failed: ${message}`);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleLocalProjectFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.name.endsWith('.zip')) {
                setLocalUploadFile(file);
                setLocalUploadMessage('');
            } else {
                alert('Please select a .zip file.');
                e.target.value = '';
            }
        }
    };

    const handleLocalProjectUpload = async () => {
        if (!localUploadFile) return;
        setIsLocalUploading(true);
        setLocalUploadMessage('Uploading to local database...');
        try {
            await uploadProjectZipToLocalDB(localUploadFile);
            setLocalUploadMessage('Upload successful! The download link is now active in the "About System" section.');
            setLocalUploadFile(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            setLocalUploadMessage(`Upload failed: ${message}`);
        } finally {
            setIsLocalUploading(false);
        }
    };
    
    const handleApkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.name.endsWith('.apk')) {
                setApkFile(file);
                setUploadApkMessage('');
            } else {
                alert('Please select an .apk file.');
                e.target.value = '';
            }
        }
    };

    const handleApkUpload = async () => {
        if (!apkFile) return;
        setIsUploadingApk(true);
        setUploadApkMessage('Uploading APK...');
        try {
            await uploadApk(apkFile);
            setUploadApkMessage('Upload successful! The download link on the home page is now active.');
            setApkFile(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            setUploadApkMessage(`Upload failed: ${message}`);
        } finally {
            setIsUploadingApk(false);
        }
    };

    const canUploadSystemFiles = storageProvider === 'local' || storageProvider === 'customApi';

    const renderProviderSync = () => {
        switch (storageProvider) {
            case 'customApi':
            case 'sharedUrl':
            case 'supabase':
            case 'firebase':
            case 'vercel':
            case 'netlify':
            case 'aws':
            case 'xano':
            case 'backendless':
            case 'ftp':
                const providerName = {
                    sharedUrl: 'Shared URL',
                    customApi: 'Custom API',
                    supabase: 'Supabase',
                    firebase: 'Firebase',
                    vercel: 'Vercel',
                    netlify: 'Netlify',
                    aws: 'AWS',
                    xano: 'Xano',
                    backendless: 'Backendless',
                    ftp: 'FTP'
                }[storageProvider] || 'Cloud';

                return (
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Cloud Sync</h3>
                            <SyncStatusIndicator />
                        </div>
                        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Push to {providerName}</h4>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                Overwrite cloud data with your current local data.
                            </p>
                            <div className="mt-3">
                                <button type="button" onClick={handlePushToCloud} disabled={isPushing || isPulling || !isSuperAdmin || syncStatus === 'syncing'} className="btn btn-primary !text-sm !py-2 w-full">{isPushing ? 'Pushing...' : `Push to ${providerName}`}</button>
                                {!isSuperAdmin && (
                                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                        Only the Main Admin can push data.
                                    </p>
                                )}
                            </div>
                        </div>
                         <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Pull from {providerName}</h4>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                Overwrite your local data with the latest cloud data.
                            </p>
                            <div className="mt-3">
                                <button type="button" onClick={handlePullFromCloud} disabled={isPushing || isPulling || syncStatus === 'syncing'} className="btn btn-primary !text-sm !py-2 w-full">{isPulling ? 'Pulling...' : `Pull from ${providerName}`}</button>
                            </div>
                        </div>
                    </div>
                );
            case 'local':
                 return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Local Folder Sync</h3>
                             <SyncStatusIndicator />
                        </div>
                        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Save to Folder</h4>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                Overwrite the `database.json` and assets in your connected folder.
                            </p>
                            <div className="mt-3">
                                <button type="button" onClick={handleSaveToDrive} disabled={isSaving || isLoading || !isSuperAdmin || syncStatus === 'syncing'} className="btn btn-primary !text-sm !py-2 w-full">{isSaving ? 'Saving...' : 'Save to Folder'}</button>
                                {!isSuperAdmin && (
                                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                        Only the Main Admin can save data.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Load from Folder</h4>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                Overwrite your current local data with data from the folder.
                            </p>
                            <div className="mt-3">
                                <button type="button" onClick={handleLoadFromDrive} disabled={isSaving || isLoading || syncStatus === 'syncing'} className="btn btn-primary !text-sm !py-2 w-full">{isLoading ? 'Loading...' : 'Load from Folder'}</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderLocalFileUI = () => (
         <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Create Full Backup (.zip)</h4>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    Download a complete <code>.zip</code> file containing your <code>database.json</code> and all media assets.
                </p>
                <div className="mt-3">
                    <button type="button" onClick={createZipBackup} className="btn btn-primary !text-sm !py-2 w-full">Download Full Backup</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Restore from Backup File</h4>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    <strong className="text-yellow-600 dark:text-yellow-400">Warning:</strong> Restoring from a <code>.zip</code> will re-upload all its assets to your currently connected storage provider.
                </p>
                <form onSubmit={handleRestore} className="mt-3 space-y-3">
                     <label htmlFor="restore-file-upload" className="w-full cursor-pointer flex items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{fileName || 'Click to select .zip file'}</span>
                        <input ref={fileInputRef} id="restore-file-upload" type="file" className="sr-only" accept=".zip,application/zip" onChange={handleFileChange} />
                    </label>
                    <button type="submit" className="btn btn-destructive !text-sm !py-2 w-full" disabled={!fileName}>Restore from Backup</button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {storageProvider !== 'none' ? renderProviderSync() : (
                 <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Local Backup & Restore</h3>
            )}
            
            {storageProvider !== 'none' && (
                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
                    <div className="relative flex justify-center"><span className="bg-gray-100/50 dark:bg-gray-800/20 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Or use Local Files</span></div>
                </div>
            )}
            
            {renderLocalFileUI()}

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
                <div className="relative flex justify-center"><span className="bg-gray-100/50 dark:bg-gray-800/20 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Distribution</span></div>
            </div>

            <div className="space-y-4">
                 <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Android APK Distribution</h4>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        Upload a <code>kiosk-app.apk</code> file to make it available for download on the public home screen.
                    </p>
                    {!canUploadSystemFiles && (
                        <p className="mt-2 text-sm p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg">
                            This feature requires a "Local Folder" or "Custom API" storage provider to be connected in the Storage tab.
                        </p>
                    )}
                    {canUploadSystemFiles && (
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <label htmlFor="apk-upload" className="flex-grow btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 justify-center">
                                <AndroidIcon className="h-4 w-4" />
                                <span className="ml-2 truncate">{apkFile ? apkFile.name : 'Select kiosk-app.apk'}</span>
                            </label>
                            <input id="apk-upload" type="file" className="sr-only" accept=".apk" onChange={handleApkFileSelect} />
                            <button onClick={handleApkUpload} className="w-full sm:w-auto btn btn-primary" disabled={!apkFile || isUploadingApk}>
                                {isUploadingApk ? 'Uploading...' : 'Upload APK'}
                            </button>
                        </div>
                    )}
                    {uploadApkMessage && <p className="text-sm mt-2">{uploadApkMessage}</p>}
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Project Source Code (for Offline Download)</h4>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        Upload a <code>project.zip</code> file to be stored within the app's local database. This makes it available for download on the "About System" page, even when offline.
                    </p>
                     <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <label htmlFor="local-project-zip-upload" className="flex-grow btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 justify-center">
                            <UploadIcon className="h-4 w-4" />
                            <span className="ml-2 truncate">{localUploadFile ? localUploadFile.name : 'Select project.zip file'}</span>
                        </label>
                        <input id="local-project-zip-upload" type="file" className="sr-only" accept=".zip,application/zip" onChange={handleLocalProjectFileSelect} />
                        <button onClick={handleLocalProjectUpload} className="w-full sm:w-auto btn btn-primary" disabled={!localUploadFile || isLocalUploading}>
                            {isLocalUploading ? 'Uploading...' : 'Upload for Download'}
                        </button>
                    </div>
                    {localUploadMessage && <p className="text-sm mt-2">{localUploadMessage}</p>}
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-xl border dark:border-gray-700/50">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Project Source Code (via Storage Provider)</h4>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        Upload the <code>project.zip</code> file to your connected storage provider. This will overwrite any existing version.
                    </p>
                    {!canUploadSystemFiles && (
                        <p className="mt-2 text-sm p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg">
                            This feature requires a "Local Folder" or "Custom API" storage provider to be connected in the Storage tab.
                        </p>
                    )}
                    {canUploadSystemFiles && (
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <label htmlFor="project-zip-upload" className="flex-grow btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 justify-center">
                                <UploadIcon className="h-4 w-4" />
                                <span className="ml-2 truncate">{uploadFile ? uploadFile.name : 'Select project.zip file'}</span>
                            </label>
                            <input id="project-zip-upload" type="file" className="sr-only" accept=".zip,application/zip" onChange={handleProjectFileSelect} />
                            <button onClick={handleProjectUpload} className="w-full sm:w-auto btn btn-primary" disabled={!uploadFile || isUploading}>
                                {isUploading ? 'Uploading...' : 'Upload to Provider'}
                            </button>
                        </div>
                    )}
                    {uploadMessage && <p className="text-sm mt-2">{uploadMessage}</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminBackupRestore;
