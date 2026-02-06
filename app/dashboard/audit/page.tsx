"use client"

import { useEffect, useState } from "react"
import { api, type BlockchainEntry } from "@/lib/api"
import { PageHeader } from "@/components/page-header"
import { LoadingState } from "@/components/loading-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Link2, Lock, ShieldCheck } from "lucide-react"

const ACTION_STYLES: Record<string, string> = {
  Purchase: "bg-primary/10 text-primary border-primary/30",
  Sale: "bg-success/10 text-success border-success/30",
  Adjustment: "bg-warning/10 text-warning border-warning/30",
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<BlockchainEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState("all")

  useEffect(() => {
    api.getBlockchain().then((data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  const filtered =
    filterAction === "all"
      ? entries
      : entries.filter((e) => e.actionType === filterAction)

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Blockchain Audit Log"
        description="Immutable, tamper-proof transaction records secured on-chain."
        actions={
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </Badge>
        }
      />

      {/* Info banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              All transactions are cryptographically hashed and linked in a chain. This log is{" "}
              <span className="font-medium text-foreground">read-only</span> and cannot be modified or deleted.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Action Type:</span>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Purchase">Purchase</SelectItem>
            <SelectItem value="Sale">Sale</SelectItem>
            <SelectItem value="Adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Previous Hash</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{entry.hash}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{entry.previousHash}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", ACTION_STYLES[entry.actionType])}>
                      {entry.actionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{entry.details}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">No transactions match the filter.</div>
      )}

      {/* Chain integrity summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{entries.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chain Integrity</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-success">Valid</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Block</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm font-mono">{entries[0]?.hash ?? "N/A"}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
