"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type Vendor } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { LoadingState } from "@/components/loading-state"
import { StatusBadge } from "@/components/status-badge"
import { ScoreGauge } from "@/components/score-gauge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Search } from "lucide-react"

export default function VendorsPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.getVendors().then((data) => {
      setVendors(data)
      setLoading(false)
    })
  }, [])

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.contact.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Vendors" description="Manage vendors, track performance, and mitigate supply-chain risks." />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Vendor cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vendor) => (
          <Card
            key={vendor.id}
            className="cursor-pointer transition-colors hover:border-primary/40"
            onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{vendor.name}</h3>
                  <p className="text-sm text-muted-foreground">{vendor.contact}</p>
                  <p className="text-xs text-muted-foreground">{vendor.email}</p>
                  <div className="pt-2">
                    <StatusBadge status={vendor.status} />
                  </div>
                </div>
                <ScoreGauge score={vendor.score} size="sm" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">On-time</p>
                  <p className="text-sm font-semibold">{vendor.onTimeDelivery}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Defects</p>
                  <p className="text-sm font-semibold">{vendor.defectRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-sm font-semibold">{vendor.priceStability}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">No vendors match your search.</div>
      )}
    </div>
  )
}
