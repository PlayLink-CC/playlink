import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Component
 * 
 * Wraps routes to enforce authentication and role-based access control.
 * Handles strict redirects preventing unauthorized access to role-specific pages.
 * 
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Array of allowed roles (e.g. ['PLAYER'], ['VENUE_OWNER'])
 * @param {React.ReactNode} props.children - Child components to render if authorized
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, initialising } = useAuth();
    const location = useLocation();

    if (initialising) {
        // Show a minimal loader while checking auth state to prevent flicker
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
            </div>
        );
    }

    if (!user) {
        // Not logged in -> Redirect to Login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user role is allowed
    const isAllowed = allowedRoles.length === 0 || allowedRoles.includes(user.accountType);

    if (!isAllowed) {
        // strict redirect logic
        if (user.accountType === 'PLAYER') {
            // Player trying to access restricted page -> Redirect to Home (Player Dashboard)
            return <Navigate to="/" replace />;
        } else if (user.accountType === 'VENUE_OWNER') {
            // Venue Owner trying to access restricted page -> Redirect to Venue Dashboard
            return <Navigate to="/venue-dashboard" replace />;
        } else {
            // Fallback
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
