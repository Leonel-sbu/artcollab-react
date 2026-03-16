import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import api, { fetchCsrfToken } from "../services/api";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}

/**
 * Production-safe cookie-based authentication
 * 
 * Key principles:
 * - JWT stored in httpOnly cookie (not accessible to JavaScript)
 * - /api/auth/me is the ONLY source of truth for auth state
 * - No localStorage for auth state - only cookies handle authentication
 * - refreshAuth() validates cookie session on any suspicious activity
 */
export default function AuthProvider({ children }) {
  // User state - ONLY restored from /api/auth/me endpoint (source of truth)
  // No localStorage initialization - always start with null until server validates
  const [user, setUser] = useState(null);

  // Loading state - true while checking auth on app load and during auth operations
  const [loading, setLoading] = useState(true);

  // Track if initial auth check has completed
  const [authChecked, setAuthChecked] = useState(false);

  /**
   * refreshAuth - Reusable helper to validate cookie-based session
   * Call this:
   * - On app load to restore session
   * - After login/register to confirm cookie is active
   * - On route changes for sensitive operations
   * - After token expiry warnings
   */
  const refreshAuth = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/me");
      if (res?.data?.success && res?.data?.user) {
        setUser(res.data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      // Cookie invalid/expired - clear auth state
      setUser(null);
      return false;
    }
  }, []);

  /**
   * Initial auth restore on app load
   * This is the ONLY time we read from the server to restore session
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuthenticated = await refreshAuth();
        // Fetch CSRF token if user is authenticated
        if (isAuthenticated) {
          await fetchCsrfToken();
        }
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, [refreshAuth]);

  /**
   * Login - Sets httpOnly cookie via backend
   * Then validates by calling refreshAuth() to confirm session is active
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Backend sets httpOnly cookie on successful login
      const res = await api.post("/api/auth/login", { email, password });

      if (res?.data?.success === false) {
        throw new Error(res?.data?.message || "Login failed");
      }

      // CRITICAL: Validate cookie was set by calling /api/auth/me
      // This confirms the cookie-based session is actually active
      await refreshAuth();

      // Fetch CSRF token after successful login for state-changing requests
      await fetchCsrfToken();

      return res.data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register - Sets httpOnly cookie via backend
   * Then validates by calling refreshAuth() to confirm session is active
   */
  const register = async (payload) => {
    setLoading(true);
    try {
      // Backend sets httpOnly cookie on successful registration
      const res = await api.post("/api/auth/register", payload);

      if (res?.data?.success === false) {
        throw new Error(res?.data?.message || "Registration failed");
      }

      // CRITICAL: Validate cookie was set by calling /api/auth/me
      // This confirms the cookie-based session is actually active
      await refreshAuth();

      // Fetch CSRF token after successful registration for state-changing requests
      await fetchCsrfToken();

      return res.data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout - Clear cookie via backend, then clear local state
   */
  const logout = async () => {
    try {
      // Call backend to clear httpOnly cookie
      await api.post("/api/auth/logout");
    } catch (error) {
      // Log but continue with client-side logout
      console.error("Logout API error:", error);
    } finally {
      // Always clear local state
      setUser(null);
    }
  };

  // Derived auth state - no separate isAuthed state needed
  const isAuthed = !!user;

  const value = useMemo(
    () => ({
      user,
      isAuthed,
      loading,
      authChecked,
      login,
      register,
      logout,
      refreshAuth,
    }),
    [user, loading, authChecked, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
