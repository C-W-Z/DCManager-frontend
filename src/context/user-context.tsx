import { useState, useEffect, type ReactNode } from "react";
import { UserContext } from "./use-user";
import { User } from "@/lib/type";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    return {
      username: "admin",
      role: "admin",
    };
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    if (storedUsername && storedRole) {
      setUser({
        username: JSON.parse(storedUsername),
        role: JSON.parse(storedRole),
      });
    } else {
      setUser(null);
    }
  }, []);

  const login = (username: string, role: "admin" | "normal") => {
    setUser({
      username,
      role,
    });
    localStorage.setItem("username", JSON.stringify(username));
    localStorage.setItem("role", JSON.stringify(role));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("username");
    localStorage.removeItem("role");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
  );
}
