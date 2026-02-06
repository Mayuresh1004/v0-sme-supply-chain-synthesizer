"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface KPICardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "flat"
  icon?: ReactNode
}

/** Dashboard KPI metric card with trend indicator */
export function KPICard({ title, value, change, trend, icon }: KPICardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-sm">
          {trend === "up" && <TrendingUp className="h-4 w-4 text-success" />}
          {trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
          {trend === "flat" && <Minus className="h-4 w-4 text-muted-foreground" />}
          <span
            className={cn(
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              trend === "flat" && "text-muted-foreground",
            )}
          >
            {change}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
