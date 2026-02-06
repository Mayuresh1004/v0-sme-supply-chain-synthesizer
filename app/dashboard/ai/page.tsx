"use client"

import React from "react"

import { useState } from "react"
import { api, type ForecastResult, type DetectedProduct, type InventoryItem } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { LoadingState } from "@/components/loading-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BrainCircuit, Camera, Loader2, PackageCheck, TrendingUp, Upload } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"
import { useEffect } from "react"

/** Product options for forecasting dropdown */
const FORECAST_PRODUCTS = [
  { id: "1", name: "Circuit Board A7", sku: "ELC-001" },
  { id: "2", name: "Cotton Weave Roll", sku: "TXT-012" },
  { id: "3", name: "Steel Rod 12mm", sku: "RAW-045" },
  { id: "7", name: "LED Module RGB", sku: "ELC-015" },
]

export default function AIFeaturesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Features"
        description="Leverage AI for demand forecasting and automated product onboarding."
        actions={
          <Badge variant="outline" className="gap-1">
            <BrainCircuit className="h-3 w-3" />
            AI-Powered
          </Badge>
        }
      />

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="forecast" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Demand Forecast
          </TabsTrigger>
          <TabsTrigger value="onboard" className="gap-2">
            <Camera className="h-4 w-4" />
            Image Onboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="mt-6">
          <DemandForecastTab />
        </TabsContent>

        <TabsContent value="onboard" className="mt-6">
          <ImageOnboardTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/** Demand Forecasting tab content */
function DemandForecastTab() {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [forecastData, setForecastData] = useState<ForecastResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function runForecast() {
    if (!selectedProduct) return
    setLoading(true)
    const data = await api.getDemandForecast(selectedProduct)
    setForecastData(data)
    setLoading(false)
  }

  // Calculate recommended reorder quantity from forecast
  const totalPredicted = forecastData?.reduce((sum, d) => sum + d.predicted, 0) ?? 0
  const avgDaily = forecastData ? totalPredicted / forecastData.length : 0
  const reorderQty = Math.ceil(avgDaily * 14) // 14-day buffer

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Select Product for Forecasting</CardTitle>
          <CardDescription>Choose a product to generate a 30-day demand prediction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {FORECAST_PRODUCTS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runForecast} disabled={!selectedProduct || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
              Run Forecast
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && <LoadingState />}

      {forecastData && !loading && (
        <>
          {/* Forecast chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">30-Day Demand Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.5rem",
                        color: "hsl(var(--card-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stackId="bounds"
                      stroke="none"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.1}
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      name="Predicted"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stackId="bounds"
                      stroke="none"
                      fill="hsl(var(--background))"
                      fillOpacity={0.8}
                      name="Lower Bound"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Reorder recommendation */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <PackageCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-semibold">Recommended Reorder Quantity</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on the 30-day forecast, we recommend ordering{" "}
                    <span className="font-bold text-foreground">{reorderQty.toLocaleString()} units</span> to maintain a 14-day safety stock buffer.
                  </p>
                </div>
                <Button onClick={() => toast.success("Reorder request submitted", { description: `${reorderQty} units queued for purchase order.` })}>
                  Create Reorder
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

/** Image-based product onboarding tab */
function ImageOnboardTab() {
  const [detecting, setDetecting] = useState(false)
  const [detected, setDetected] = useState<DetectedProduct | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setDetecting(true)
    const result = await api.detectProduct(file)
    setDetected(result)
    setDetecting(false)
  }

  function handleConfirm() {
    toast.success("Product created from image", {
      description: `${detected?.name} has been added to inventory.`,
    })
    setDetected(null)
    setImagePreview(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Upload Product Image</CardTitle>
          <CardDescription>Our AI will detect product attributes from the image and pre-fill the product details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-10">
            <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
              {imagePreview ? (
                <img src={imagePreview || "/placeholder.svg"} alt="Product preview" className="h-40 w-40 rounded-lg object-cover" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
              <p className="text-sm font-medium">{imagePreview ? "Click to change image" : "Drop product image here or click to browse"}</p>
              <p className="text-xs text-muted-foreground">Supports JPG, PNG, WebP</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </CardContent>
      </Card>

      {detecting && <LoadingState />}

      {detected && !detecting && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Detected Attributes</CardTitle>
            <CardDescription>
              Confidence:{" "}
              <span className="font-semibold text-success">{(detected.confidence * 100).toFixed(0)}%</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Detected Name</p>
                  <p className="font-medium">{detected.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium">{detected.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Suggested Price</p>
                  <p className="font-medium">${detected.suggestedPrice.toFixed(2)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setDetected(null); setImagePreview(null) }}>
                  Discard
                </Button>
                <Button onClick={handleConfirm}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Confirm & Create Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
