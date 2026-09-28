import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { api, getToken } from "../lib/api";

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  logout: () => void;
};

const Auth = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (getToken())
      api
        .me()
        .then(setUser)
        .catch(() => localStorage.removeItem("fieldops_token"))
        .finally(() => setLoading(false));
    else setLoading(false);
  }, []);
  const login = async (e: string, p: string) => {
    const r = await api.login(e, p);
    localStorage.setItem("fieldops_token", r.token);
    setUser(r.user);
  };
  const logout = () => {
    localStorage.removeItem("fieldops_token");
    setUser(null);
  };
  return (
    <Auth.Provider value={{ user, loading, login, logout }}>
      {children}
    </Auth.Provider>
  );
}

export function useAuth() {
  const c = useContext(Auth);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
