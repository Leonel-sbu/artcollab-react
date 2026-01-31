import { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext(null);

function getStoredToken() {
  return localStorage.getItem("token");
}

function persistToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function hydrate() {
    const token = getStoredToken();

    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      const me = await api("/auth/me");
      setUser(me?.user || me);
    } catch (e) {
      // token invalid/expired => clear
      persistToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const res = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const token = res?.token || res?.accessToken;
    const u = res?.user;

    if (!token) throw new Error("Login did not return a token.");

    persistToken(token);

    if (u) {
      setUser(u);
      return u;
    }

    const me = await api("/auth/me");
    const meUser = me?.user || me;
    setUser(meUser);
    return meUser;
  }

  async function register(payload) {
    const res = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const token = res?.token || res?.accessToken;
    const u = res?.user;

    if (token) {
      persistToken(token);

      if (u) {
        setUser(u);
        return u;
      }

      const me = await api("/auth/me");
      const meUser = me?.user || me;
      setUser(meUser);
      return meUser;
    }

    return null;
  }

  function logout() {
    persistToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      authLoading,
      login,
      register,
      logout,
      refreshMe: hydrate,
    }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
