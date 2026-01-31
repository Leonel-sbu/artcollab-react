export default function UserTable({ users = [] }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">Users</div>
      <div className="mt-3 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-gray-600">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length ? users.map((u) => (
              <tr key={u._id || u.id} className="border-t">
                <td className="py-2">{u.name || "-"}</td>
                <td className="py-2">{u.email || "-"}</td>
                <td className="py-2">{u.role || "-"}</td>
              </tr>
            )) : (
              <tr className="border-t">
                <td className="py-3 text-gray-600" colSpan="3">No users loaded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
