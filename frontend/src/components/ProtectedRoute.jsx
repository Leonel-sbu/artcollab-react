// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - Authentication guard for protected routes
 * 
 * Features:
 * - Shows loading spinner during initial auth check
 * - Redirects to login if not authenticated
 * - Preserves the attempted URL for redirect after login
 * - Supports localStorage fallback for simple auth check
 * - Never leaves blank screen
 */
export default function ProtectedRoute({ children }) {
    const { isAuthed, loading, authChecked } = useAuth();
    const location = useLocation();

    // Check localStorage as fallback for simple token presence
    // This handles cases where the cookie-based auth hasn't been established yet
    const hasLocalStorageAuth = () => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        return !!user || !!token;
    };

    // Show loading while checking auth on app startup
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // If user is authenticated via AuthContext (cookie-based), allow access
    if (isAuthed) {
        if (children) {
            return children;
        }
        return <Outlet />;
    }

    // If auth has been checked and user is not authenticated via cookies,
    // also check localStorage as fallback
    if (authChecked && !isAuthed && hasLocalStorageAuth()) {
        if (children) {
            return children;
        }
        return <Outlet />;
    }

    // User is not authenticated - redirect to login
    // Preserve the attempted URL for redirect after successful login
    return (
        <Navigate
            to="/login"
            state={{ from: location }}
            replace
        />
    );
}
