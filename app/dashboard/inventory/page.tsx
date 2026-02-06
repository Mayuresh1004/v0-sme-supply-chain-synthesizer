"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api, type InventoryItem } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { LoadingState } from "@/components/loading-state"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function InventoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    api.getInventory().then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  // Derive unique categories from data
  const categories = Array.from(new Set(items.map((i) => i.category)))

  const filtered = categoryFilter === "all" ? items : items.filter((i) => i.category === categoryFilter)

  function handleCSVUpload() {
    toast.success("CSV imported successfully", {
      description: "12 products have been added to inventory.",
    })
  }

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory"
        description="Manage products, track stock levels, and monitor batches."
        actions={
          <div className="flex items-center gap-2">
            {/* CSV Upload Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Inventory CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with columns: SKU, Name, Category, Price, Stock, Threshold
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
                    <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drop your CSV here or click to browse</p>
                      <p className="text-xs text-muted-foreground">Supports .csv and .xlsx files</p>
                      <input
                        type="file"
                        accept=".csv,.xlsx"
                        className="hidden"
                        onChange={handleCSVUpload}
                      />
                    </label>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button size="sm" onClick={() => router.push("/dashboard/inventory/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        }
      />

      {/* Category filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Category:</span>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inventory table */}
      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        searchKey={"name" as keyof Record<string, unknown>}
        searchPlaceholder="Search by product name..."
        onRowClick={(row) => router.push(`/dashboard/inventory/${(row as unknown as InventoryItem).id}`)}
        columns={[
          { header: "SKU", accessor: (row) => {
            const item = row as unknown as InventoryItem
            return <span className="font-mono text-xs">{item.sku}</span>
          }},
          { header: "Product Name", accessor: "name" as keyof Record<string, unknown>, className: "font-medium" },
          { header: "Category", accessor: "category" as keyof Record<string, unknown> },
          { header: "Price", accessor: (row) => {
            const item = row as unknown as InventoryItem
            return `$${item.price.toFixed(2)}`
          }, className: "text-right" },
          { header: "Stock", accessor: (row) => {
            const item = row as unknown as InventoryItem
            return (
              <div className="flex items-center gap-2">
                <span>{item.stock.toLocaleString()}</span>
                {item.stock <= item.threshold && (
                  <StatusBadge status="low" label="Low" />
                )}
              </div>
            )
          }},
          { header: "Threshold", accessor: (row) => {
            const item = row as unknown as InventoryItem
            return item.threshold.toLocaleString()
          }, className: "text-right" },
          { header: "Batches", accessor: (row) => {
            const item = row as unknown as InventoryItem
            return item.batches.length
          }, className: "text-center" },
        ]}
      />
    </div>
  )
}
