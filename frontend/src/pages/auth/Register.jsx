import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register({ name, email, password });
      if (user) navigate("/marketplace", { replace: true });
      else navigate("/login", { replace: true });
    } catch (err) {
      const msg = String(err?.message || "Registration failed");
      if (msg.toLowerCase().includes("exists") || msg.includes("409")) {
        setError("That email is already registered. Please login instead.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">
          Join ARTCOLLAB to buy, sell, and learn.
        </p>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-2.5 text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-700">
          Already have an account?{" "}
          <Link className="font-medium underline" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
