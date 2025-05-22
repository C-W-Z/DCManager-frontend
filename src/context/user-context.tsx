"use client";

import { useState, type ReactNode } from "react";
import { UserContext } from "./use-user";
import { User } from "@/lib/type";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    return {
      username: "admin",
      role: "admin",
    };
  });

  // useEffect(() => {
  // fetch user
  // login() if fetch success
  // }, []);

  const login = (username: string, role: "admin" | "normal") => {
    setUser({
      username,
      role,
    });
    console.log(`login as ${username} (${role})`);
  };

  const logout = () => {
    if (user) console.log(`logout as ${user.username} (${user.role})`);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
  );
}
