import { createContext, useContext } from "react";

export interface User {
  user_role: string;
}

interface UserContextType {
  user: User | null;
  login: (user_role: string) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
