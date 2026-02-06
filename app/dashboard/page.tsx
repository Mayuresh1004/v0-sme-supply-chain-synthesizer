"use client"

import { useEffect, useState } from "react"
import { api, type KPI, type SalesForecastPoint, type StockLevel } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"
import { SalesForecastChart, StockLevelsChart } from "@/components/dashboard-charts"
import { LoadingState } from "@/components/loading-state"
import { DollarSign, PackageMinus, Truck, TrendingUp } from "lucide-react"


const KPI_ICONS = [
  <DollarSign key="dol" className="h-4 w-4" />,
  <PackageMinus key="pkg" className="h-4 w-4" />,
  <Truck key="trk" className="h-4 w-4" />,
  <TrendingUp key="trd" className="h-4 w-4" />,
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<KPI[]>([])
  const [salesData, setSalesData] = useState<SalesForecastPoint[]>([])
  const [stockData, setStockData] = useState<StockLevel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [k, s, st] = await Promise.all([
        api.getKPIs(),
        api.getSalesForecast(),
        api.getStockLevels(),
      ])
      setKpis(k)
      setSalesData(s)
      setStockData(st)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "User"}`}
        description="Here is an overview of your supply chain operations."
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} icon={KPI_ICONS[i]} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SalesForecastChart data={salesData} />
        <StockLevelsChart data={stockData} />
      </div>
    </div>
  )
}
