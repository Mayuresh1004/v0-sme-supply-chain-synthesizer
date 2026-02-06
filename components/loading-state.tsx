"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** Full-width centered loading spinner */
export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )
}

/** Error state with retry action */
export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}
