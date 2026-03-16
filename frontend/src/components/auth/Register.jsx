import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "artist",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = useMemo(() => {
    if (!formData.password || !formData.confirmPassword) return null;
    return formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const name = formData.name.trim();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;

      if (!name) throw new Error("Please enter your full name.");
      if (!email) throw new Error("Please enter your email address.");
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (password !== formData.confirmPassword) throw new Error("Passwords do not match!");
      if (!formData.terms) throw new Error("You must accept the Terms of Service and Privacy Policy.");

      const payload = {
        name,
        email,
        password,
        // role: formData.userType, // enable ONLY if your backend accepts `role`
      };

      const result = await register(payload);

      if (!result?.success) {
        // support different backend error shapes
        throw new Error(result?.message || result?.error || "Registration failed. Please try again.");
      }

      // With cookie-based auth, register() already validates cookie via refreshAuth()
      // No need to check localStorage - the cookie is set automatically

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "An unexpected error occurred.");
      console.error("Registration error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const userTypes = [
    { id: "artist", label: "Artist" },
    { id: "collector", label: "Collector" },
    { id: "learner", label: "Learner" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="card">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Join ArtCollab</h2>
            <p className="text-gray-400 mt-2">Create your free account in seconds</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-xl">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">I am joining as a...</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, userType: type.id }))}
                    className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${formData.userType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                  >
                    <span className={`font-semibold ${formData.userType === type.id ? "text-white" : "text-gray-300"}`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Leon sbu"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="artist@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Use at least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-xl placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-12 ${passwordsMatch === false ? "border-red-500" : passwordsMatch === true ? "border-green-500" : "border-gray-700"
                      }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {passwordsMatch === true && <p className="mt-2 text-xs text-green-500">Passwords match</p>}
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-700 rounded bg-gray-800 mt-1"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-400">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button type="submit" disabled={submitting} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? "Creating Account..." : `Create ${formData.userType} Account`}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
