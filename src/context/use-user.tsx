import { User } from "@/lib/type";
import { createContext, useContext } from "react";

interface UserContextType {
  user: User | null;
  accessableService: string[];
  setAccessableService: (services: string[]) => void;
  loadAccessableService: (username: string) => void;
  login: (username: string, role: "admin" | "normal") => void;
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
