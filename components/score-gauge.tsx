"use client"

import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

/** Circular score gauge (0–100) for vendor performance */
export function ScoreGauge({ score, size = "md", showLabel = true }: ScoreGaugeProps) {
  const dimensions = { sm: 48, md: 72, lg: 96 }
  const strokes = { sm: 4, md: 6, lg: 8 }
  const dim = dimensions[size]
  const stroke = strokes[size]
  const radius = (dim - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  function getColor(s: number) {
    if (s >= 80) return "text-success"
    if (s >= 60) return "text-warning"
    return "text-destructive"
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-500", getColor(score))}
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold",
            size === "sm" && "text-xs",
            size === "md" && "text-base",
            size === "lg" && "text-xl",
          )}
        >
          {score}
        </span>
      </div>
      {showLabel && <span className="text-xs text-muted-foreground">Score</span>}
    </div>
  )
}
