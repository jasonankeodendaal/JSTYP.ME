

import React, { useMemo, useState, useCallback, useEffect } from 'react';
// @FIX: Split react-router-dom imports to resolve potential module resolution issues.
import { useParams, useNavigate, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import type { Brand, Product } from '../../types';
import { ChevronLeftIcon, PlusIcon, TrashIcon, PencilIcon, CubeIcon, EyeIcon, EyeOffIcon, ChevronDownIcon } from '../Icons';
import { useAppContext } from '../context/AppContext.tsx';
import LocalMedia from '../LocalMedia';

const CategoryManager: React.FC<{ brandId: string; }> = ({ brandId }) => {
    const { categories, addCategory, updateCategory, deleteCategory, showConfirmation } = useAppContext();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);

    const brandCategories = useMemo(() => {
        return categories.filter(c => c.brandId === brandId && !c.isDeleted).sort((a,b) => a.name.localeCompare(b.name));
    }, [categories, brandId]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory({
                id: `cat_${Date.now()}`,
                name: newCategoryName.trim(),
                brandId,
            });
            setNewCategoryName('');
        }
    };

    const handleUpdateCategory = () => {
        if (editingCategory && editingCategory.name.trim()) {
            updateCategory({ id: editingCategory.id, name: editingCategory.name.trim(), brandId });
            setEditingCategory(null);
        }
    };

    const handleDeleteCategory = (id: string, name: string) => {
        showConfirmation(
            `Are you sure you want to move the category "${name}" to the trash? Products in this category will become uncategorized.`,
            () => deleteCategory(id)
        );
    };

    return (
        <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-gray-200/80 dark:border-gray-700/50">
            <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">Manage Categories</h3>
                 <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                    <ChevronDownIcon className="w-5 h-5"/>
                </div>
            </summary>
            <div className="p-4 sm:p-5 border-t border-gray-200/80 dark:border-gray-700 space-y-4">
                <form onSubmit={handleAddCategory} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name..."
                        className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm py-2 px-3 text-sm"
                    />
                    <button type="submit" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Add</button>
                </form>
                <div className="space-y-2">
                    {brandCategories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                            {editingCategory?.id === cat.id ? (
                                <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    className="flex-grow bg-white dark:bg-gray-7