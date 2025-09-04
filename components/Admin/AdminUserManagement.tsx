import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { PlusIcon, PencilIcon, TrashIcon } from '../Icons.tsx';
import LocalMedia from '../LocalMedia.tsx';

const AdminUserManagement: React.FC = () => {
    const { adminUsers, deleteAdminUser, loggedInUser, showConfirmation } = useAppContext();

    const handleDelete = (userId: string, userName: string) => {
        showConfirmation(
            `Are you sure you want to delete user "${userName}"? This cannot be undone.`,
            () => deleteAdminUser(userId)
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl text-gray-800 dark:text-gray-100 section-heading">Manage Admin Users</h3>
                <Link to="/admin/user/new" className="btn btn-primary">
                    <PlusIcon className="h-4 w-4" />
                    <span>Add New User</span>
                </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Only the main admin can create, edit, or delete other admin users.</p>

            <div className="space-y-4">
                {adminUsers.map(user => (
                    <div key={user.id} className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                            <div className="flex-shrink-0 h-12 w-12">
                                {user.imageUrl ? (
                                    <LocalMedia src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} type="image" className="h-12 w-12 rounded-full object-cover" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="font-bold text-lg text-gray-600 dark:text-gray-300">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-md font-bold text-gray-900 dark:text-gray-100 truncate">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.tel}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-200 dark:border-gray-700">
                            <div className="flex-1 text-left sm:text-center">
                                {user.isMainAdmin ? 
                                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Main Admin</span> : 
                                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Admin</span>
                                }
                            </div>
                            <div className="flex items-center justify-end gap-1">
                                <Link to={`/admin/user/edit/${user.id}`} className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Edit User">
                                    <PencilIcon className="h-4 w-4" />
                                </Link>
                                {!user.isMainAdmin && user.id !== loggedInUser?.id && (
                                    <button onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)} className="p-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Delete User">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUserManagement;