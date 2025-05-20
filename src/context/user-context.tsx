"use client"

import { useState, type ReactNode } from "react"
import { type User, UserContext } from "./use-user";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    return {
      user_role: "admin"
    }
  })

  // useEffect(() => {
    // fetch user
    // login() if fetch success
  // }, []);

  const login = (user_role: string) => {
    setUser({
      user_role
    })
  }

  const logout = () => {
    setUser(null)
  }

  return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
}
