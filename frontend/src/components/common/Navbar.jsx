import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold">
          ARTCOLLAB
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/marketplace" className="hover:underline">Marketplace</Link>
          <Link to="/courses" className="hover:underline">Courses</Link>
          <Link to="/cart" className="hover:underline">Cart</Link>
          <Link to="/orders" className="hover:underline">Orders</Link>

          {isAuthenticated ? (
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="rounded-xl bg-black px-3 py-1.5 text-white"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="rounded-xl bg-black px-3 py-1.5 text-white">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
