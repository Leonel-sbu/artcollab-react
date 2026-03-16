// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute - Authentication guard for protected routes
 * 
 * Features:
 * - Shows loading spinner during initial auth check
 * - Redirects to login if not authenticated
 * - Supports both wrapper pattern (<ProtectedRoute><Page /></ProtectedRoute>) and nested route pattern
 * - Never leaves blank screen
 */
export default function ProtectedRoute({ children }) {
    const { isAuthed, loading, authChecked } = useAuth();

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

    // If auth has been checked and user is not authenticated, redirect to login
    if (authChecked && !isAuthed) {
        return <Navigate to="/login" replace />;
    }

    // Show fallback while auth is being checked
    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Verifying session...</p>
                </div>
            </div>
        );
    }

    // User is authenticated
    // If children are provided (wrapper pattern), render them
    // Otherwise, render Outlet for nested route pattern
    if (children) {
        return children;
    }

    // Fallback to Outlet for nested routes
    return <Outlet />;
}
