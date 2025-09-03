import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import type { Client } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../Icons.tsx';
import ClientEditModal from './ClientEditModal.tsx';

const AdminClientManagement: React.FC = () => {
    const { clients, showConfirmation, deleteClient } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const visibleClients = clients.filter(c => !c.isDeleted).sort((a,b) => a.companyName.localeCompare(b.companyName));

    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleDelete = (client: Client) => {
        showConfirmation(
            `Are you sure you want to move the client "${client.companyName}" to the trash?`,
            () => deleteClient(client.id)
        );
    };

    return (
        <>
            {isModalOpen && <ClientEditModal client={editingClient} onClose={handleCloseModal} />}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Manage Clients</h3>
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        <PlusIcon className="h-4 w-4" />
                        <span>Add New Client</span>
                    </button>
                </div>
                {visibleClients.length > 0 ? (
                    <div className="overflow-x-auto bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Person</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Details</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {visibleClients.map(client => (
                                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{client.companyName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{client.contactPerson}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <div>{client.contactTel}</div>
                                            <div>{client.contactEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleOpenModal(client)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit Client"><PencilIcon className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(client)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete Client"><TrashIcon className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700/50">
                        <p className="text-gray-500 dark:text-gray-400">No clients found. Add one to get started.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminClientManagement;