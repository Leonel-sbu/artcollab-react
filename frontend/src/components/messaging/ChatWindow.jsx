import { useState } from "react";

export default function ChatWindow({ chat, messages = [], onSend }) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">{chat?.title || "Chat"}</div>

      <div className="mt-3 h-64 overflow-auto rounded-xl border bg-gray-50 p-3 text-sm">
        {messages.length ? messages.map((m, idx) => (
          <div key={m._id || idx} className="mb-2">
            <span className="font-medium">{m.senderName || "User"}:</span>{" "}
            <span>{m.text || m.message}</span>
          </div>
        )) : (
          <div className="text-gray-600">No messages yet.</div>
        )}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSend?.(text.trim());
          setText("");
        }}
      >
        <input
          className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="rounded-xl bg-black px-4 py-2 text-sm text-white">Send</button>
      </form>
    </div>
  );
}
