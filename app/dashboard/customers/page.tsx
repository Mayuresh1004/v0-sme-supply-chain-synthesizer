"use client"

import React from "react"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Download, Users, UserCheck, UserX, DollarSign } from "lucide-react"
import { toast } from "sonner"

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: "active" | "inactive"
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  createdAt: string
}

/* ------------------------------------------------------------------ */
/*  Mock data -- replace with Supabase queries once integrated        */
/*                                                                    */
/*  Supabase swap:                                                    */
/*    import { createClient } from "@/lib/supabase/client"            */
/*    const supabase = createClient()                                 */
/*    const { data } = await supabase.from("customers").select("*")   */
/* ------------------------------------------------------------------ */

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "CUST-001",
    name: "Ananya Sharma",
    email: "ananya@techcorp.in",
    phone: "+91 98765 43210",
    company: "TechCorp India",
    status: "active",
    totalOrders: 47,
    totalSpent: 284500,
    lastOrderDate: "2026-01-28",
    createdAt: "2024-06-15",
  },
  {
    id: "CUST-002",
    name: "Rahul Mehta",
    email: "rahul@greenleaf.co",
    phone: "+91 87654 32109",
    company: "GreenLeaf Supplies",
    status: "active",
    totalOrders: 31,
    totalSpent: 192300,
    lastOrderDate: "2026-02-01",
    createdAt: "2024-08-22",
  },
  {
    id: "CUST-003",
    name: "Priya Desai",
    email: "priya@swiftlogistics.com",
    phone: "+91 76543 21098",
    company: "Swift Logistics",
    status: "active",
    totalOrders: 58,
    totalSpent: 412800,
    lastOrderDate: "2026-02-04",
    createdAt: "2024-03-10",
  },
  {
    id: "CUST-004",
    name: "Vikram Joshi",
    email: "vikram@buildright.in",
    phone: "+91 65432 10987",
    company: "BuildRight Materials",
    status: "inactive",
    totalOrders: 12,
    totalSpent: 67400,
    lastOrderDate: "2025-09-15",
    createdAt: "2024-11-01",
  },
  {
    id: "CUST-005",
    name: "Meera Patel",
    email: "meera@freshfoods.co",
    phone: "+91 54321 09876",
    company: "FreshFoods Co.",
    status: "active",
    totalOrders: 73,
    totalSpent: 531200,
    lastOrderDate: "2026-02-05",
    createdAt: "2024-01-20",
  },
  {
    id: "CUST-006",
    name: "Arjun Nair",
    email: "arjun@steelworks.in",
    phone: "+91 43210 98765",
    company: "SteelWorks Industries",
    status: "active",
    totalOrders: 22,
    totalSpent: 178900,
    lastOrderDate: "2026-01-19",
    createdAt: "2025-02-14",
  },
  {
    id: "CUST-007",
    name: "Kavita Singh",
    email: "kavita@mediplus.com",
    phone: "+91 32109 87654",
    company: "MediPlus Pharma",
    status: "inactive",
    totalOrders: 8,
    totalSpent: 43200,
    lastOrderDate: "2025-07-22",
    createdAt: "2025-04-05",
  },
  {
    id: "CUST-008",
    name: "Deepak Rao",
    email: "deepak@autoparts.in",
    phone: "+91 21098 76543",
    company: "AutoParts Express",
    status: "active",
    totalOrders: 39,
    totalSpent: 298700,
    lastOrderDate: "2026-02-03",
    createdAt: "2024-09-30",
  },
]

/* ------------------------------------------------------------------ */
/*  Helper                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
}

/* ------------------------------------------------------------------ */
/*  KPI summary cards                                                 */
/* ------------------------------------------------------------------ */

function CustomerKPIs({ customers }: { customers: Customer[] }) {
  const total = customers.length
  const active = customers.filter((c) => c.status === "active").length
  const inactive = total - active
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)

  const kpis = [
    { label: "Total Customers", value: total, icon: Users, color: "text-primary" },
    { label: "Active", value: active, icon: UserCheck, color: "text-success" },
    { label: "Inactive", value: inactive, icon: UserX, color: "text-destructive" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-primary" },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-bold">{kpi.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Add Customer Dialog                                               */
/* ------------------------------------------------------------------ */

function AddCustomerDialog({ onAdd }: { onAdd: (c: Customer) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast.error("Name and email are required.")
      return
    }
    const newCustomer: Customer = {
      id: `CUST-${String(Date.now()).slice(-4)}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      status: "active",
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: "-",
      createdAt: new Date().toISOString().split("T")[0],
    }
    onAdd(newCustomer)
    toast.success(`Customer "${form.name}" added.`)
    setForm({ name: "", email: "", phone: "", company: "" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Enter customer details below. Name and email are required.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="cust-name">Name</Label>
              <Input id="cust-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cust-email">Email</Label>
              <Input id="cust-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cust-phone">Phone</Label>
              <Input id="cust-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="cust-company">Company</Label>
              <Input id="cust-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  const filtered = statusFilter === "all" ? customers : customers.filter((c) => c.status === statusFilter)

  function handleExportCSV() {
    const headers = "ID,Name,Email,Phone,Company,Status,Orders,Spent,Last Order,Created\n"
    const rows = customers
      .map((c) => `${c.id},${c.name},${c.email},${c.phone},${c.company},${c.status},${c.totalOrders},${c.totalSpent},${c.lastOrderDate},${c.createdAt}`)
      .join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "customers.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Customers exported as CSV.")
  }

  const columns = [
    { header: "ID", accessor: "id" as const, className: "font-mono text-xs w-28" },
    {
      header: "Name",
      accessor: (row: Customer) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { header: "Company", accessor: "company" as const },
    { header: "Phone", accessor: "phone" as const, className: "hidden lg:table-cell" },
    {
      header: "Status",
      accessor: (row: Customer) => <StatusBadge status={row.status} />,
      className: "w-24",
    },
    {
      header: "Orders",
      accessor: (row: Customer) => <span className="font-medium">{row.totalOrders}</span>,
      className: "text-right w-20",
    },
    {
      header: "Revenue",
      accessor: (row: Customer) => <span className="font-medium">{formatCurrency(row.totalSpent)}</span>,
      className: "text-right w-32",
    },
    {
      header: "Last Order",
      accessor: "lastOrderDate" as const,
      className: "hidden xl:table-cell w-28",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Manage your customer directory and track purchasing activity."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
            <AddCustomerDialog onAdd={(c) => setCustomers((prev) => [c, ...prev])} />
          </div>
        }
      />

      <CustomerKPIs customers={customers} />

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          Showing {filtered.length} of {customers.length} customers
        </span>
      </div>

      <DataTable<Customer>
        data={filtered}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search customers by name..."
      />
    </div>
  )
}
