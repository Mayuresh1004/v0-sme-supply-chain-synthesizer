"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

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
  /** True while initial hydration check is running */
  isHydrating: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Mock JWT token + user persistence helpers.
 * In production these would interact with httpOnly cookies / secure storage.
 */
const TOKEN_KEY = "aio5_token"
const USER_KEY = "aio5_user"

function setToken(token: string) {
  if (typeof window !== "undefined") {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict; max-age=86400`
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`))
  return match ? match[1] : null
}

function clearToken() {
  if (typeof window !== "undefined") {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
  }
}

function persistUser(user: User) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

function loadPersistedUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function clearPersistedUser() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(USER_KEY)
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
  const [isHydrating, setIsHydrating] = useState(true)

  /** On mount, rehydrate user from session if a token cookie exists */
  useEffect(() => {
    const token = getToken()
    if (token) {
      const persisted = loadPersistedUser()
      if (persisted) {
        setUser(persisted)
      }
    }
    setIsHydrating(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 800))

    const entry = DEMO_USERS[email]
    if (entry && entry.password !== password) {
      setIsLoading(false)
      throw new Error("Invalid credentials")
    }

    let loggedInUser: User
    if (entry) {
      loggedInUser = entry.user
    } else {
      // Allow any email/password combo for demo -- defaults to manager role
      loggedInUser = {
        id: "99",
        name: email.split("@")[0],
        email,
        role: "manager",
      }
    }

    setToken("mock-jwt-token")
    persistUser(loggedInUser)
    setUser(loggedInUser)
    setIsLoading(false)
  }, [])

  const register = useCallback(
    async (name: string, email: string, _password: string, role: UserRole) => {
      setIsLoading(true)
      await new Promise((r) => setTimeout(r, 800))
      const newUser: User = { id: Date.now().toString(), name, email, role }
      setToken("mock-jwt-token")
      persistUser(newUser)
      setUser(newUser)
      setIsLoading(false)
    },
    [],
  )

  const logout = useCallback(() => {
    clearToken()
    clearPersistedUser()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, isHydrating, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
