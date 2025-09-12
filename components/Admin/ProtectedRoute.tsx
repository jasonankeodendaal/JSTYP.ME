import React from 'react';
// @FIX: Split react-router-dom imports to resolve potential module resolution issues.
import { Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';

interface ProtectedRouteProps {
  children: React.ReactElement;
  mainAdminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, mainAdminOnly = false }) => {
  const { loggedInUser } = useAppContext();
  const isAuthenticated = !!loggedInUser;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (mainAdminOnly && !loggedInUser.isMainAdmin) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
             <div className="text-center">
                <h2 className="text-2xl font-bold section-heading text-gray-800 dark:text-gray-100">Access Denied</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You must be a Main Administrator to access this page.</p>
                <Link to="/admin" className="text-blue-500 dark:text-blue-400 hover:underline mt-4 inline-block">Go back to dashboard</Link>
            </div>
        </div>
    );
  }

  return children;
};

export default ProtectedRoute;
