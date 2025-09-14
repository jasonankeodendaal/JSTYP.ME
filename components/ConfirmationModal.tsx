
import React from 'react';
// FIX: Correct import path for AppContext
import { useAppContext } from './context/AppContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon } from './Icons.tsx';

const MotionDiv = motion.div as any;

const ConfirmationModal: React.FC = () => {
  const { confirmation, hideConfirmation } = useAppContext();

  const handleConfirm = () => {
    hideConfirmation();
    confirmation.onConfirm();
  };

  const handleCancel = () => {
    hideConfirmation();
  };


  return (
    <AnimatePresence>
      {confirmation.isOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
        >
          <MotionDiv
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"
            onClick={(e: any) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8 flex">
              <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${confirmation.isDestructive ? 'bg-red-100 dark:bg-red-900/50' : 'bg-indigo-100 dark:bg-indigo-900/50'} sm:mx-0 sm:h-10 sm:w-10`}>
                {confirmation.icon || <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100 section-heading" id="confirmation-title">
                  {confirmation.title || 'Confirm Action'}
                </h3>
                <div className="mt-2">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {confirmation.message}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
              <button
                type="button"
                className={`btn ${confirmation.isDestructive ? 'btn-destructive' : 'btn-primary'} w-full sm:ml-3 sm:w-auto`}
                onClick={handleConfirm}
              >
                {confirmation.confirmText || 'Confirm'}
              </button>
              {confirmation.cancelText && (
                <button
                  type="button"
                  className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 mt-3 w-full sm:mt-0 sm:w-auto"
                  onClick={handleCancel}
                >
                  {confirmation.cancelText}
                </button>
              )}
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
