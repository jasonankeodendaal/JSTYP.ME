import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext.tsx';
import type { Client } from '../../types';
import { XIcon, PlusIcon, ChevronUpIcon } from '../Icons.tsx';

const MotionDiv = motion.div as any;

interface ClientEditModalProps {
    client: Client | null;
    onClose: () => void;
}

const ClientEditModal: React.FC<ClientEditModalProps> = ({ client, onClose }) => {
    const { addClient, updateClient } = useAppContext();
    const isEditing = Boolean(client);

    const [formData, setFormData] = useState<Partial<Client>>(
        client || {
            companyName: '',
            contactPerson: '',
            contactEmail: '',
            contactTel: '',
            vatNumber: '',
            address: ''
        }
    );
    const [showMoreDetails, setShowMoreDetails] = useState(
        isEditing && (!!client?.vatNumber || !!client?.address)
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.companyName?.trim() || !formData.contactPerson?.trim() || !formData.contactTel?.trim()) {
            alert('Company Name, Contact Person, and Tel are required fields.');
            return;
        }

        const clientData: Client = {
            id: isEditing ? client!.id : `client_${Date.now()}`,
            companyName: formData.companyName.trim(),
            contactPerson: formData.contactPerson.trim(),
            contactTel: formData.contactTel.trim(),
            contactEmail: formData.contactEmail?.trim(),
            vatNumber: formData.vatNumber?.trim(),
            address: formData.address?.trim(),
        };

        if (isEditing) {
            updateClient(clientData);
        } else {
            addClient(clientData);
        }
        onClose();
    };
    
    const isSubmitDisabled = !formData.companyName?.trim() || !formData.contactPerson?.trim() || !formData.contactTel?.trim();

    return (
        <AnimatePresence>
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <MotionDiv
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 flex flex-col"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 section-heading">{isEditing ? 'Edit Client' : 'Add New Client'}</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                    </header>

                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name*</label>
                                <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                            </div>
                            <div>
                                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person*</label>
                                <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                            </div>
                            <div>
                                <label htmlFor="contactTel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tel*</label>
                                <input type="tel" id="contactTel" name="contactTel" value={formData.contactTel} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" required />
                            </div>
                            
                            <AnimatePresence>
                                {showMoreDetails && (
                                    <MotionDiv 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: 'auto' }} 
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div>
                                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</label>
                                            <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                        </div>
                                        <div>
                                            <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">VAT Number (Optional)</label>
                                            <input type="text" id="vatNumber" name="vatNumber" value={formData.vatNumber} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" />
                                        </div>
                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address (Optional)</label>
                                            <textarea id="address" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2.5 px-4" rows={3}></textarea>
                                        </div>
                                    </MotionDiv>
                                )}
                            </AnimatePresence>

                            <div className="pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowMoreDetails(prev => !prev)}
                                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                    {showMoreDetails ? (
                                        <><ChevronUpIcon className="w-4 h-4" /> Show Less Details</>
                                    ) : (
                                        <><PlusIcon className="w-4 h-4" /> Add More Details</>
                                    )}
                                </button>
                            </div>
                        </div>
                        <footer className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                            <button onClick={onClose} type="button" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSubmitDisabled}>{isEditing ? 'Save Changes' : 'Add Client'}</button>
                        </footer>
                    </form>
                </MotionDiv>
            </MotionDiv>
        </AnimatePresence>
    );
};

export default ClientEditModal;