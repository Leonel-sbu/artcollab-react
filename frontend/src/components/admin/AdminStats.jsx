export default function AdminStats({ stats }) {
  const s = stats || {};
  const cards = [
    { label: "Users", value: s.users ?? "-" },
    { label: "Artworks", value: s.artworks ?? "-" },
    { label: "Orders", value: s.orders ?? "-" },
    { label: "Revenue", value: s.revenue ?? "-" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border bg-white p-4">
          <div className="text-xs text-gray-600">{c.label}</div>
          <div className="mt-2 text-xl font-semibold">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
