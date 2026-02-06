"use client"

import React from "react"

import { useEffect, useState } from "react"
import { api, type Alert } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { LoadingState } from "@/components/loading-state"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AlertTriangle, Bell, CheckCircle, Package, RotateCcw, Truck } from "lucide-react"
import { toast } from "sonner"

const ALERT_ICONS: Record<Alert["type"], React.ReactNode> = {
  "low-stock": <Package className="h-4 w-4" />,
  "vendor-risk": <Truck className="h-4 w-4" />,
  reorder: <RotateCcw className="h-4 w-4" />,
  general: <Bell className="h-4 w-4" />,
}

const ALERT_COLORS: Record<Alert["type"], string> = {
  "low-stock": "text-destructive bg-destructive/10 border-destructive/30",
  "vendor-risk": "text-warning bg-warning/10 border-warning/30",
  reorder: "text-primary bg-primary/10 border-primary/30",
  general: "text-muted-foreground bg-muted border-muted",
}

const ALERT_LABELS: Record<Alert["type"], string> = {
  "low-stock": "Low Stock",
  "vendor-risk": "Vendor Risk",
  reorder: "Reorder",
  general: "General",
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    api.getAlerts().then((data) => {
      setAlerts(data)
      setLoading(false)
    })
  }, [])

  const unreadCount = alerts.filter((a) => !a.read).length

  function markAsRead(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
    toast.success("Alert marked as read")
  }

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
    toast.success("All alerts marked as read")
  }

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter)

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alerts & Notifications"
        description="Stay on top of supply-chain events, low-stock warnings, and vendor risks."
        actions={
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {unreadCount} unread
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          </div>
        }
      />

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="vendor-risk">Vendor Risk</TabsTrigger>
          <TabsTrigger value="reorder">Reorder</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alert list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No alerts in this category.</div>
        )}

        {filtered.map((alert) => (
          <Card
            key={alert.id}
            className={cn(
              "transition-colors",
              !alert.read && "border-l-4",
              !alert.read && alert.type === "low-stock" && "border-l-destructive",
              !alert.read && alert.type === "vendor-risk" && "border-l-warning",
              !alert.read && alert.type === "reorder" && "border-l-primary",
              !alert.read && alert.type === "general" && "border-l-muted-foreground",
            )}
          >
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", ALERT_COLORS[alert.type])}>
                  {ALERT_ICONS[alert.type]}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("text-sm font-semibold", alert.read && "text-muted-foreground")}>{alert.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {ALERT_LABELS[alert.type]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                {!alert.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                    Mark Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
