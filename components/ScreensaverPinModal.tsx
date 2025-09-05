import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppContext } from './context/AppContext.tsx';
import { XIcon } from './Icons.tsx';

const MotionDiv = motion.div as any;

const ScreensaverPinModal: React.FC = () => {
    const { isScreensaverPinModalOpen, setIsScreensaverPinModalOpen, exitScreensaver, adminUsers } = useAppContext();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isScreensaverPinModalOpen) {
            setPin('');
            setError('');
        }
    }, [isScreensaverPinModalOpen]);

    const handlePinInput = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };
    
    const handleBackspace = () => {
        setPin(pin.slice(0, -1));
    };

    const handleClear = () => {
        setPin('');
    };

    const handleSubmit = () => {
        const isValidPin = adminUsers.some(user => user.pin === pin);
        if (isValidPin) {
            setError('');
            exitScreensaver();
            setIsScreensaverPinModalOpen(false);
        } else {
            setError('Invalid PIN');
            setPin('');
        }
    };

    useEffect(() => {
        if (pin.length === 4) {
            handleSubmit();
        }
    }, [pin, handleSubmit]);


    const KeypadButton: React.FC<{ value: string, onClick: () => void }> = ({ value, onClick }) => (
        <button
            onClick={onClick}
            className="text-2xl font-semibold w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
            {value}
        </button>
    );

    return (
        <AnimatePresence>
            {isScreensaverPinModalOpen && (
                 <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    onClick={() => setIsScreensaverPinModalOpen(false)}
                 >
                    <MotionDiv
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xs border border-gray-200 dark:border-gray-700"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                         <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Enter Admin PIN</h3>
                            <button onClick={() => setIsScreensaverPinModalOpen(false)} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="h-5 w-5" /></button>
                        </header>
                        <div className="p-6 flex flex-col items-center">
                            <div className="flex items-center gap-3 h-10">
                                {[0, 1, 2, 3].map(i => (
                                    <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors ${error ? 'border-red-500' : 'border-gray-400'} ${pin.length > i ? (error ? 'bg-red-500' : 'bg-gray-600') : ''}`}></div>
                                ))}
                            </div>
                            {error && <p className="text-sm text-red-500 h-5 mt-2">{error}</p>}
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <KeypadButton key={num} value={String(num)} onClick={() => handlePinInput(String(num))} />)}
                                <button onClick={handleClear} className="font-semibold text-gray-600">Clear</button>
                                <KeypadButton value="0" onClick={() => handlePinInput('0')} />
                                <button onClick={handleBackspace} className="font-semibold text-gray-600">Back</button>
                            </div>
                        </div>
                    </MotionDiv>
                 </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default ScreensaverPinModal;
