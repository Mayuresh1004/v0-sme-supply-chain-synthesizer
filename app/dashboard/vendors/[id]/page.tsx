"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api, type Vendor } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { ScoreGauge } from "@/components/score-gauge"
import { LoadingState, ErrorState } from "@/components/loading-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Mail, Phone } from "lucide-react"

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = typeof params.id === "string" ? params.id : ""
    api.getVendor(id).then((data) => {
      setVendor(data)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <LoadingState />
  if (!vendor) return <ErrorState message="Vendor not found." />

  const metrics = [
    { label: "On-Time Delivery", value: vendor.onTimeDelivery, suffix: "%" },
    { label: "Defect Rate", value: vendor.defectRate, suffix: "%", inverted: true },
    { label: "Price Stability", value: vendor.priceStability, suffix: "%" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/vendors")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={vendor.name}
          description={`Contact: ${vendor.contact}`}
          actions={<StatusBadge status={vendor.status} />}
        />
      </div>

      {/* Score + Contact Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <CardTitle className="text-base font-semibold">Performance Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-6">
            <ScoreGauge score={vendor.score} size="lg" />
            <p className="text-sm text-muted-foreground">
              {vendor.score >= 80
                ? "Excellent vendor performance"
                : vendor.score >= 60
                  ? "Moderate performance, room for improvement"
                  : "Poor performance, review recommended"}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{vendor.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.map((metric) => {
              const progressValue = metric.inverted ? 100 - metric.value : metric.value
              return (
                <div key={metric.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-semibold">
                      {metric.value}{metric.suffix}
                    </span>
                  </div>
                  <Progress
                    value={progressValue}
                    className="h-2"
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Score Breakdown */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold">AI-Calculated Vendor Score</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The score of <span className="font-bold text-foreground">{vendor.score}/100</span> is computed
                by weighting on-time delivery (40%), defect rate (35%), and price stability (25%) using
                a proprietary machine learning model trained on historical performance data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
