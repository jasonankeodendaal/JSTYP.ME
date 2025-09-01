import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext.tsx';
import { useNavigate } from 'react-router-dom';
import type { Client } from '../../types';
import { XIcon } from '../Icons.tsx';

const MotionDiv = motion.div as any;

const QuoteStartModal: React.FC = () => {
    const { clients, addClient, closeQuoteStartModal, quoteStartModal } = useAppContext();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'select' | 'new'>('select');
    
    // State for selecting an existing client
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    
    // State for creating a new client
    const [newClient, setNewClient] = useState<Partial<Client>>({
        companyName: '',
        contactPerson: '',
        contactEmail: '',
        contactTel: '',
        vatNumber: '',
        address: ''
    });

    const visibleClients = useMemo(() => clients.filter(c => !c.isDeleted).sort((a,b) => a.companyName.localeCompare(b.companyName)), [clients]);

    const handleNewClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewClient(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        let clientIdToUse: string | null = null;
        
        if (mode === 'select') {
            if (!selectedClientId) {
                alert('Please select a client.');
                return;
            }
            clientIdToUse = selectedClientId;
        } else { // mode === 'new'
            if (!newClient.companyName?.trim() || !newClient.contactPerson?.trim() || !newClient.contactTel?.trim()) {
                alert('Company Name, Contact Person, and Tel are required fields.');
                return;
            }
            const clientToAdd: Client = {
                id: `client_${Date.now()}`,
                companyName: newClient.companyName.trim(),
                contactPerson: newClient.contactPerson.trim(),
                contactEmail: newClient.contactEmail?.trim(),
                contactTel: newClient.contactTel.trim(),
                vatNumber: newClient.vatNumber?.trim(),
                address: newClient.address?.trim(),
            };
            clientIdToUse = addClient(clientToAdd);
        }

        if (clientIdToUse) {
            closeQuoteStartModal();
            // Need a slight delay to allow modal to close before navigating, preventing UI glitches
            setTimeout(() => {
                navigate('/admin/stock-pick', { state: { clientId: clientIdToUse } });
            }, 100);
        }
    };

    const isSubmitDisabled = 
        (mode === 'select' && !selectedClientId) ||
        (mode === 'new' && (!newClient.companyName?.trim() || !newClient.contactPerson?.trim() || !newClient.contactTel?.trim()));
        
    return (
        <AnimatePresence>
            {quoteStartModal.isOpen && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeQuoteStartModal}
                >
                    <MotionDiv
                        initial={{ scale: 0.9, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 30, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 section-heading">Start New Quote</h2>
                            <button onClick={closeQuoteStartModal} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                        </header>

                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-gray-100 dark:bg-gray-900 relative">
                                    <MotionDiv 
                                        layout 
                                        transition={{type: "spring", stiffness: 400, damping: 30}}
                                        className={`absolute inset-0.5 bg-white dark:bg-gray-700 shadow rounded-md ${mode === 'new' ? 'translate-x-full' : 'translate-x-0'}`}
                                        style={{width: 'calc(50% - 2px)'}}
                                    />
                                    <button onClick={() => setMode('select')} className={`relative flex-1 py-2 text-sm font-semibold rounded-md transition-colors z-10 ${mode === 'select' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>Existing Client</button>
                                    <button onClick={() => setMode('new')} className={`relative flex-1 py-2 text-sm font-semibold rounded-md transition-colors z-10 ${mode === 'new' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>New Client</button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <MotionDiv
                                    key={mode}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4 min-h-[150px]"
                                >
                                    {mode === 'select' ? (
                                        <div>
                                            <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Client</label>
                                            <select id="client-select" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required>
                                                <option value="">-- Choose a client --</option>
                                                {visibleClients.map(client => <option key={client.id} value={client.id}>{client.companyName}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name*</label>
                                                    <input type="text" name="companyName" id="companyName" value={newClient.companyName} onChange={handleNewClientChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person*</label>
                                                    <input type="text" name="contactPerson" id="contactPerson" value={newClient.contactPerson} onChange={handleNewClientChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="contactTel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tel*</label>
                                                    <input type="tel" name="contactTel" id="contactTel" value={newClient.contactTel} onChange={handleNewClientChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                                                </div>
                                                <div>
                                                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                                    <input type="email" name="contactEmail" id="contactEmail" value={newClient.contactEmail} onChange={handleNewClientChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </MotionDiv>
                            </AnimatePresence>
                        </div>

                        <footer className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                            <button onClick={closeQuoteStartModal} type="button" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                            <button onClick={handleSubmit} type="button" className="btn btn-primary" disabled={isSubmitDisabled}>Start Stock Pick</button>
                        </footer>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default QuoteStartModal;