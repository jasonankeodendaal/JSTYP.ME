import React from 'react';
import { ChevronDownIcon } from '../Icons.tsx';

const SetupInstruction: React.FC<{ title: string, children: React.ReactNode, id?: string, defaultOpen?: boolean }> = ({ title, children, id, defaultOpen = false }) => (
    <details id={id} className="group bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg overflow-hidden border dark:border-gray-700/50" open={defaultOpen}>
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 section-heading">{title}</h4>
            <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-transform duration-300 transform group-open:rotate-180">
                <ChevronDownIcon className="w-5 h-5"/>
            </div>
        </summary>
        <div className="px-5 py-4 border-t border-gray-200/80 dark:border-gray-700/50 prose prose-sm dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-gray-200 prose-code:dark:bg-gray-700 prose-code:p-1 prose-code:rounded-md prose-code:font-mono prose-strong:text-gray-800 dark:prose-strong:text-gray-100">
            {children}
        </div>
    </details>
);

export default SetupInstruction;