import { useState, useEffect, type ReactNode } from "react";
import { UserContext } from "./use-user";
import { User } from "@/lib/type";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessableService, _setAccessableService] = useState<string[]>([]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedAccessableService = localStorage.getItem("accessableService");

    if (storedUsername && storedRole && storedAccessableService) {
      console.log("Found UserProvider: ", storedUsername, storedRole, storedAccessableService);

      setUser({
        username: JSON.parse(storedUsername),
        role: JSON.parse(storedRole),
      });
      _setAccessableService(JSON.parse(storedAccessableService));
    } else {
      setUser(null);
      _setAccessableService([]);
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
    localStorage.removeItem("accessableService");
  };

  const setAccessableService = (services: string[]) => {
    _setAccessableService(services);
    localStorage.setItem("accessableService", JSON.stringify(services));
  };

  return (
    <UserContext.Provider
      value={{ user, accessableService, setAccessableService, login, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}
