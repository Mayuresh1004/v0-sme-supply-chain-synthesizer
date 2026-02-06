"use client"

import React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { LoadingState } from "@/components/loading-state"

/**
 * Protected dashboard layout.
 * Redirects unauthenticated users to the login page.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isHydrating } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait until hydration is complete before making redirect decisions
    if (!isHydrating && !isLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, isHydrating, router])

  // Show loading while hydrating or if not yet authenticated (may still resolve)
  if (isHydrating || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
