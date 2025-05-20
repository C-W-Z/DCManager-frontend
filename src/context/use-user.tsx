import { createContext, useContext } from "react";

export interface User {
  username: string;
  user_role: "admin" | "normal";
}

interface UserContextType {
  user: User | null;
  login: (username: string, user_role: "admin" | "normal") => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
