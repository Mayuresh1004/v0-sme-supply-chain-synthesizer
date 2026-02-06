"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api, type InventoryItem } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { LoadingState } from "@/components/loading-state"
import { ErrorState } from "@/components/loading-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function InventoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjustQty, setAdjustQty] = useState(0)

  useEffect(() => {
    const id = typeof params.id === "string" ? params.id : ""
    if (id === "new") return
    api.getInventoryItem(id).then((data) => {
      setItem(data)
      setLoading(false)
    })
  }, [params.id])

  if (typeof params.id === "string" && params.id === "new") {
    return <ProductForm />
  }

  if (loading) return <LoadingState />
  if (!item) return <ErrorState message="Product not found." />

  const isLow = item.stock <= item.threshold

  function handleAddStock() {
    if (adjustQty <= 0) return
    toast.success(`Added ${adjustQty} units to ${item?.name}`)
    setItem((prev) => prev ? { ...prev, stock: prev.stock + adjustQty } : prev)
    setAdjustQty(0)
  }

  function handleDeductStock() {
    if (adjustQty <= 0) return
    toast.success(`Deducted ${adjustQty} units from ${item?.name}`)
    setItem((prev) => prev ? { ...prev, stock: Math.max(0, prev.stock - adjustQty) } : prev)
    setAdjustQty(0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/inventory")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={item.name}
          description={`SKU: ${item.sku} | Category: ${item.category}`}
          actions={isLow ? <StatusBadge status="low" label="Low Stock" /> : <StatusBadge status="ok" label="In Stock" />}
        />
      </div>

      {/* Product details grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unit Price</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">${item.price.toFixed(2)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{item.stock.toLocaleString()}</span>
            <span className="ml-2 text-sm text-muted-foreground">/ {item.threshold.toLocaleString()} threshold</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">${(item.stock * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </CardContent>
        </Card>
      </div>

      {/* Stock adjustment actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Stock Adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={adjustQty || ""}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                placeholder="Enter quantity"
                className="w-40"
              />
            </div>
            <Button onClick={handleAddStock} disabled={adjustQty <= 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={adjustQty <= 0}>
                  <Minus className="mr-2 h-4 w-4" />
                  Deduct (Sale)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Stock Deduction</DialogTitle>
                  <DialogDescription>
                    This will deduct {adjustQty} units from {item.name}. This action represents a sale or consumption.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeductStock}>Confirm Deduction</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* FIFO Batch Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">FIFO Batch Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.batches.map((batch) => {
                const isExpiringSoon = new Date(batch.expiryDate).getTime() - Date.now() < 180 * 24 * 60 * 60 * 1000
                return (
                  <TableRow key={batch.id}>
                    <TableCell className="font-mono text-xs">{batch.id}</TableCell>
                    <TableCell className="text-right">{batch.quantity.toLocaleString()}</TableCell>
                    <TableCell>{new Date(batch.receivedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {isExpiringSoon ? (
                        <StatusBadge status="at-risk" label="Expiring Soon" />
                      ) : (
                        <StatusBadge status="ok" label="Good" />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

/** Add / Edit product form (rendered when id === "new") */
function ProductForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    price: "",
    stock: "",
    threshold: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Product created successfully", {
      description: `${form.name} (${form.sku}) has been added to inventory.`,
    })
    router.push("/dashboard/inventory")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/inventory")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Add New Product" description="Fill in the details below to add a new product to inventory." />
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="ELC-001"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-name">Product Name</Label>
                <Input
                  id="prod-name"
                  placeholder="Circuit Board A7"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Electronics"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Unit Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="24.50"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Low Stock Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  placeholder="200"
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  required
                />
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/inventory")}>
                Cancel
              </Button>
              <Button type="submit">Create Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
