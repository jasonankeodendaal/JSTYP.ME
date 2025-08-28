import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import type { Client } from '../../types';
import { XIcon } from '../Icons';

const MotionDiv = motion.div as any;

const ClientDetailsModal: React.FC = () => {
    const { clients, addClient, closeClientDetailsModal } = useAppContext();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'select' | 'new'>('select');
    
    // State for selecting an existing client
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    
    // State for creating a new client
    const [companyName, setCompanyName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactTel, setContactTel] = useState('');
    const [vatNumber, setVatNumber] = useState('');
    const [address, setAddress] = useState('');
    
    const visibleClients = useMemo(() => clients.filter(c => !c.isDeleted).sort((a,b) => a.companyName.localeCompare(b.companyName)), [clients]);

    const handleSubmit = () => {
        let clientIdToUse: string | null = null;
        
        if (mode === 'select') {
            if (!selectedClientId) {
                alert('Please select a client.');
                return;
            }
            clientIdToUse = selectedClientId;
        } else { // mode === 'new'
            if (!companyName.trim() || !contactPerson.trim() || !contactTel.trim()) {
                alert('Company Name, Contact Person, and Tel are required fields.');
                return;
            }
            const newClient: Client = {
                id: `client_${Date.now()}`,
                companyName: companyName.trim(),
                contactPerson: contactPerson.trim(),
                contactEmail: contactEmail.trim(),
                contactTel: contactTel.trim(),
                vatNumber: vatNumber.trim(),
                address: address.trim(),
            };
            clientIdToUse = addClient(newClient);
        }

        if (clientIdToUse) {
            closeClientDetailsModal();
            navigate('/admin/stock-pick', { state: { clientId: clientIdToUse } });
        }
    };

    return (
        <AnimatePresence>
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={closeClientDetailsModal}
            >
                <MotionDiv
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 flex flex-col"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 section-heading">Start New Quote</h2>
                        <button onClick={closeClientDetailsModal} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                    </header>

                    <div className="p-6">
                        <div className="mb-4">
                            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-gray-100 dark:bg-gray-900">
                                <button onClick={() => setMode('select')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${mode === 'select' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>Existing Client</button>
                                <button onClick={() => setMode('new')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${mode === 'new' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>New Client</button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <MotionDiv
                                key={mode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
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
                                        <div>
                                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                                            <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                                        </div>
                                        <div>
                                            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
                                            <input type="text" id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                                        </div>
                                         <div>
                                            <label htmlFor="contactTel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tel</label>
                                            <input type="tel" id="contactTel" value={contactTel} onChange={e => setContactTel(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                                        </div>
                                         <div>
                                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</label>
                                            <input type="email" id="contactEmail" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                        </div>
                                        <div>
                                            <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">VAT Number (Optional)</label>
                                            <input type="text" id="vatNumber" value={vatNumber} onChange={e => setVatNumber(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                        </div>
                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address (Optional)</label>
                                            <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" rows={3}></textarea>
                                        </div>
                                    </>
                                )}
                            </MotionDiv>
                        </AnimatePresence>
                    </div>

                    <footer className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                        <button onClick={closeClientDetailsModal} type="button" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                        <button onClick={handleSubmit} type="button" className="btn btn-primary">Start Stock Pick</button>
                    </footer>
                </MotionDiv>
            </MotionDiv>
        </AnimatePresence>
    );
};

export default ClientDetailsModal;