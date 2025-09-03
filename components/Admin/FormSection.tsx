import React from 'react';
import { ChevronDownIcon } from '../Icons.tsx';

const FormSection: React.FC<{
    title: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}> = ({ title, description, children, defaultOpen = false }) => (
    <details className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700/50" open={defaultOpen}>
        <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h3>
                {description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{description}</p>}
            </div>
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                <ChevronDownIcon className="w-5 h-5"/>
            </div>
        </summary>
        <div className="p-4 sm:p-6 border-t border-gray-200/80 dark:border-gray-700/50 space-y-6">
            {children}
        </div>
    </details>
);

export default FormSection;
