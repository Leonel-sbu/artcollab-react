import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function AdminRoute({ children }) {
  const location = useLocation();
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
