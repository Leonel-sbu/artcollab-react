import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">ArtCollab</Link>

        <div className="flex gap-4 text-sm">
          <Link to="/artworks">Artworks</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
