import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/admin", label: "Overview" },
  { to: "/admin?tab=users", label: "Users" },
  { to: "/admin?tab=artworks", label: "Artworks" },
  { to: "/admin?tab=reports", label: "Reports" },
];

export default function AdminSidebar() {
  const loc = useLocation();
  return (
    <aside className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">Admin</div>
      <div className="mt-3 space-y-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`block rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 ${
              loc.pathname === "/admin" && l.to.startsWith("/admin") ? "" : ""
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
