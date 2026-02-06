"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

/** User roles supported by the platform */
export type UserRole = "admin" | "manager"

/** Authenticated user shape */
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Mock JWT token helpers.
 * In production these would interact with httpOnly cookies / secure storage.
 */
const TOKEN_KEY = "aio5_token"

function setToken(token: string) {
  if (typeof window !== "undefined") {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict; max-age=86400`
  }
}

function clearToken() {
  if (typeof window !== "undefined") {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
  }
}

/** Demo users for the mock login */
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "admin@aio5.com": {
    password: "admin123",
    user: { id: "1", name: "Sarah Chen", email: "admin@aio5.com", role: "admin" },
  },
  "manager@aio5.com": {
    password: "manager123",
    user: { id: "2", name: "James Rivera", email: "manager@aio5.com", role: "manager" },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true)
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 800))

    const entry = DEMO_USERS[email]
    if (!entry) {
      // Allow any email/password combo for demo – defaults to manager role
      const mockUser: User = {
        id: "99",
        name: email.split("@")[0],
        email,
        role: "manager",
      }
      setToken("mock-jwt-token")
      setUser(mockUser)
    } else {
      setToken("mock-jwt-token")
      setUser(entry.user)
    }
    setIsLoading(false)
  }, [])

  const register = useCallback(
    async (name: string, email: string, _password: string, role: UserRole) => {
      setIsLoading(true)
      await new Promise((r) => setTimeout(r, 800))
      const newUser: User = { id: Date.now().toString(), name, email, role }
      setToken("mock-jwt-token")
      setUser(newUser)
      setIsLoading(false)
    },
    [],
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
