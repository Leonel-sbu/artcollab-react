// src/components/AdminProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminProtectedRoute({ children }) {
    const { user, isAuthed, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Must be authenticated AND have admin role
    if (!isAuthed || !user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}
