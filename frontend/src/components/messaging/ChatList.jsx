export default function ChatList({ chats = [], selectedId, onSelect }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">Chats</div>
      <div className="mt-3 space-y-2">
        {chats.length ? chats.map((c) => (
          <button
            key={c._id || c.id}
            onClick={() => onSelect?.(c)}
            className={`w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-gray-50 ${
              (c._id || c.id) === selectedId ? "border-black" : ""
            }`}
          >
            {c.title || c.name || "Conversation"}
          </button>
        )) : (
          <div className="text-sm text-gray-600">No chats yet.</div>
        )}
      </div>
    </div>
  );
}
