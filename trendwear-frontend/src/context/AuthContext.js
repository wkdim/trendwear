import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { apiErrorMessage } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Restore the session from a stored JWT on first load (e.g. page refresh).
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) {
          setToken(null);
          localStorage.removeItem("token");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySession = (data) => {
    const { token: newToken, ...profile } = data;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(profile);
    return profile;
  };

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      return applySession(data);
    } catch (err) {
      throw new Error(apiErrorMessage(err, "Login failed"));
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      return applySession(data);
    } catch (err) {
      throw new Error(apiErrorMessage(err, "Registration failed"));
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
