"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LoadingState } from "@/components/loading-state"

/** Root page -- redirects based on auth state */
export default function RootPage() {
  const { isAuthenticated, isHydrating } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isHydrating) {
      router.replace(isAuthenticated ? "/dashboard" : "/login")
    }
  }, [isAuthenticated, isHydrating, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState />
    </div>
  )
}
