import { useState, type ReactNode } from "react";
import { type User, UserContext } from "./use-user";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    return {
      username: "admin",
      user_role: "admin",
    };
  });

  // useEffect(() => {
  // fetch user
  // login() if fetch success
  // }, []);

  const login = (username: string, user_role: "admin" | "normal") => {
    setUser({
      username,
      user_role,
    });
    console.log(`login as ${username} (${user_role})`);
  };

  const logout = () => {
    if (user) console.log(`logout as ${user.username} (${user.user_role})`);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
  );
}
