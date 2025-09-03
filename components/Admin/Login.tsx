import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import LocalMedia from '../LocalMedia.tsx';

const AdminLogin: React.FC = () => {
    const { adminUsers, login, loggedInUser, settings } = useAppContext();
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (loggedInUser) {
            navigate('/admin', { replace: true });
        }
    }, [loggedInUser, navigate]);

    useEffect(() => {
        // Pre-select the first user if available
        if (adminUsers.length > 0 && !selectedUserId) {
            setSelectedUserId(adminUsers[0].id);
        }
    }, [adminUsers, selectedUserId]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedUserId || !pin) {
            setError('Please select a user and enter your PIN.');
            return;
        }

        const user = login(selectedUserId, pin);

        if (!user) {
            setError('Invalid user or PIN. Please try again.');
            setPin(''); // Clear PIN field on error
        }
    };

    const loginSettings = settings.loginScreen;

    const pageStyle: React.CSSProperties = {
        backgroundImage: loginSettings.backgroundImageUrl ? `url(${loginSettings.backgroundImageUrl})` : 'none',
        backgroundColor: loginSettings.backgroundColor || '#111827',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const boxStyle: React.CSSProperties = {
        background: loginSettings.boxBackgroundColor || 'linear-gradient(to bottom right, #38bdf8, #3b82f6)',
    };
    
    const textStyle: React.CSSProperties = {
        color: loginSettings.textColor || '#ffffff',
    };

    return (
        <div style={pageStyle} className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                 <LocalMedia src={settings.logoUrl} alt="Logo" type="image" className="h-20 w-auto mx-auto mb-8" />
                 <div style={boxStyle} className="py-12 px-4 shadow-2xl rounded-2xl sm:px-10">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight" style={textStyle}>
                            ADMIN LOGIN
                        </h2>
                    </div>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="user-select" className="block text-sm font-medium text-left" style={textStyle}>
                                User
                            </label>
                            <div className="mt-1">
                                <select
                                    id="user-select"
                                    name="user"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-transparent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-700 focus:ring-white sm:text-sm bg-white text-gray-900"
                                    required
                                >
                                    {adminUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} {user.isMainAdmin ? '(Main)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="pin-input" className="block text-sm font-medium text-left" style={textStyle}>
                                PIN
                            </label>
                            <div className="mt-1">
                                <input
                                    id="pin-input"
                                    name="pin"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="Enter your 4-digit PIN"
                                    maxLength={4}
                                    pattern="\d{4}"
                                    className="appearance-none block w-full px-3 py-3 border border-transparent rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-700 focus:ring-white sm:text-sm bg-white text-gray-900"
                                />
                            </div>
                        </div>
                        
                        {error && (
                            <p className="text-sm text-center text-yellow-200">{error}</p>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-blue-600 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-700 focus:ring-black transition-colors"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
             <p className="mt-8 text-center text-sm" style={{color: loginSettings.textColor, textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>
                &copy; {new Date().getFullYear()} All rights reserved.
            </p>
        </div>
    );
};

export default AdminLogin;