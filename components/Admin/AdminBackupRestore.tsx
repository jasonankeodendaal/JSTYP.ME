import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import type { BackupData } from '../../types.ts';
import { Link } from 'react-router-dom';
import { CheckIcon } from '../Icons.tsx';

const SyncStatusIndicator: React.FC = () => {
    const { syncStatus, storageProvider } = useAppContext();

    if (storageProvider === 'none') {
        return null;
    }

    const providerName = storageProvider === 'local' ? 'drive' : 'cloud';

    const statusMap = {
        idle: { text: 'Status: Idle', color: 'text-gray-500 dark:text-gray-400', animate: false },
        pending: { text: 'Status: Unsaved changes', color: 'text-yellow-600 dark:text-yellow-400', animate: false },
        syncing: { text: 'Status: Syncing...', color: 'text-blue-600 dark:text-blue-400', animate: true },
        synced: { text: `Status: All changes saved to ${providerName}`, color: 'text-green-600 dark:text-green-400', animate: false },
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
        brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, restoreBackup, showConfirmation, categories, viewCounts,
        saveDatabaseToLocal, loadDatabaseFromLocal,
        pushToCloud, pullFromCloud, syncStatus
    } = useAppContext();

    const [fileName, setFileName] = useState<string>('');
    const [isRestoring, setIsRestoring] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPushing, setIsPushing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);

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
    const handleCreateBackup = () => {
        const backupData: BackupData = { brands, products, catalogues, pamphlets, settings, screensaverAds, adminUsers, tvContent, categories, viewCounts };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        const date = new Date().toISOString().split('T')[0];
        link.download = `kiosk-backup-${date}.json`;
        link.click();
    };

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
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result;
                if (typeof result !== 'string') throw new Error("Failed to read file.");
                const data = JSON.parse(result);
                if (!data.brands || !data.products || !data.settings) throw new Error("Invalid backup file format.");
                
                showConfirmation("Are you sure you want to restore? This will overwrite all current data.", () => {
                    setIsRestoring(true);
                    restoreBackup(data);
                    setTimeout(() => {
                        alert("Restore successful!");
                        setFileName('');
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        setIsRestoring(false);
                    }, 100);
                });

            } catch (error) {
                alert(`Error restoring backup: ${error instanceof Error ? error.message : "Unknown error"}`);
                setIsRestoring(false);
            }
        };
        reader.readAsText(file);
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
            }
            setIsPulling(false);
        });
    };

    const renderProviderSync = () => {
        switch (storageProvider) {
            case 'customApi':
            case 'sharedUrl':
                const providerName = storageProvider === 'sharedUrl' ? 'Shared URL' : 'Custom API';
                return (
                     <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Connected Storage Sync</h3>
                            <SyncStatusIndicator />
                        </div>
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Push to {providerName}</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Send your current local data to the cloud provider. This will overwrite the data currently on the server.
                            </p>
                            <div className="mt-6">
                                <button type="button" onClick={handlePushToCloud} disabled={isPushing || isPulling || !isSuperAdmin || syncStatus === 'syncing'} className="btn btn-primary">{isPushing ? 'Pushing...' : `Push to ${providerName}`}</button>
                                {!isSuperAdmin && (
                                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                        Only the Main Admin can push data to the cloud.
                                    </p>
                                )}
                            </div>
                        </div>
                         <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Pull from {providerName}</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Retrieve the latest data from the cloud provider. This will <strong className="font-semibold text-yellow-600 dark:text-yellow-400">overwrite</strong> your current local data.
                            </p>
                            <div className="mt-6">
                                <button type="button" onClick={handlePullFromCloud} disabled={isPushing || isPulling || syncStatus === 'syncing'} className="btn btn-primary">{isPulling ? 'Pulling...' : `Pull from ${providerName}`}</button>
                            </div>
                        </div>
                    </div>
                );
            case 'local':
                 return (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Connected Storage Sync</h3>
                             <SyncStatusIndicator />
                        </div>
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Save to Drive</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Save the current local data to the `database.json` file in your connected folder. This will overwrite the existing file on the drive.
                            </p>
                            <div className="mt-6">
                                <button type="button" onClick={handleSaveToDrive} disabled={isSaving || isLoading || !isSuperAdmin || syncStatus === 'syncing'} className="btn btn-primary">{isSaving ? 'Saving...' : 'Save to Drive'}</button>
                                {!isSuperAdmin && (
                                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                        Only the Main Admin can save data to the network drive.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                            <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Load from Drive</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Load data from the `database.json` file in your connected folder. This will <strong className="font-semibold text-yellow-600 dark:text-yellow-400">overwrite</strong> your current local data.
                            </p>
                            <div className="mt-6">
                                <button type="button" onClick={handleLoadFromDrive} disabled={isSaving || isLoading || syncStatus === 'syncing'} className="btn btn-primary">{isLoading ? 'Loading...' : 'Load from Drive'}</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderLocalFileUI = () => (
         <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Create Local Backup File</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Download a complete backup file of all application data to your computer. Store this file in a safe place.
                </p>
                <div className="mt-6">
                    <button type="button" onClick={handleCreateBackup} className="btn btn-primary">Download Backup File</button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-xl border dark:border-gray-700/50">
                <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 section-heading">Restore from Local Backup File</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Restore the application state from a backup file. <strong className="font-semibold text-yellow-600 dark:text-yellow-400">Warning:</strong> This will overwrite all current data.
                </p>
                <form onSubmit={handleRestore} className="mt-4 space-y-4">
                    <div className="mt-1">
                         <label htmlFor="restore-file-upload" className="w-full cursor-pointer flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <span className="relative rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"><span>Upload a file</span></span>
                                <input ref={fileInputRef} id="restore-file-upload" type="file" className="sr-only" accept=".json" onChange={handleFileChange} />
                            </div>
                        </label>
                        {fileName && <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Selected: <span className="font-semibold">{fileName}</span></p>}
                    </div>
                    <div className="mt-4">
                        <button type="submit" className="btn btn-destructive w-full" disabled={isRestoring || !fileName}>{isRestoring ? 'Restoring...' : 'Restore from Backup'}</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {renderProviderSync()}

            {storageProvider !== 'none' && (
                 <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-100/50 dark:bg-gray-800/20 px-3 text-base font-medium text-gray-700 dark:text-gray-300">
                            Or
                        </span>
                    </div>
                </div>
            )}
            
            <div className="space-y-8">
                {storageProvider === 'none' && (
                     <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Local Backup & Restore</h3>
                )}
                {renderLocalFileUI()}
            </div>
        </div>
    );
};

export default AdminBackupRestore;