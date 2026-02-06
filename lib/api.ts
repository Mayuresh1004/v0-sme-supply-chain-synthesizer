/**
 * Central API service layer for Invenza.
 *
 * All API calls go through this module so we can swap between
 * mock data and real endpoints with a single toggle.
 *
 * In production, replace the mock helpers with real axios calls.
 */

const API_BASE = "/api"

// ---------- Helpers ----------

/** Simulate network latency */
function delay(ms = 500) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Generic mock GET – returns provided data after delay */
async function mockGet<T>(data: T): Promise<T> {
  await delay(400 + Math.random() * 400)
  return data
}

// ---------- Types ----------

export interface KPI {
  label: string
  value: string
  change: string
  trend: "up" | "down" | "flat"
}

export interface SalesForecastPoint {
  month: string
  sales: number
  forecast: number
}

export interface StockLevel {
  category: string
  inStock: number
  reserved: number
}

export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  price: number
  stock: number
  threshold: number
  batches: Batch[]
}

export interface Batch {
  id: string
  quantity: number
  receivedDate: string
  expiryDate: string
}

export interface Vendor {
  id: string
  name: string
  contact: string
  email: string
  score: number
  onTimeDelivery: number
  defectRate: number
  priceStability: number
  status: "active" | "at-risk" | "inactive"
}

export interface Alert {
  id: string
  type: "low-stock" | "vendor-risk" | "reorder" | "general"
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface BlockchainEntry {
  id: string
  hash: string
  previousHash: string
  timestamp: string
  actionType: "Purchase" | "Sale" | "Adjustment"
  details: string
}

export interface ForecastResult {
  day: string
  predicted: number
  lower: number
  upper: number
}

export interface DetectedProduct {
  name: string
  category: string
  suggestedPrice: number
  confidence: number
}

// ---------- Mock Data ----------

const MOCK_KPIS: KPI[] = [
  { label: "Total Inventory Value", value: "$2,847,320", change: "+4.3%", trend: "up" },
  { label: "Low Stock Items", value: "23", change: "+5", trend: "up" },
  { label: "Active Vendors", value: "48", change: "+2", trend: "up" },
  { label: "Forecasted Demand (30d)", value: "14,230 units", change: "-2.1%", trend: "down" },
]

const MOCK_SALES_FORECAST: SalesForecastPoint[] = [
  { month: "Jan", sales: 4200, forecast: 4000 },
  { month: "Feb", sales: 3800, forecast: 4100 },
  { month: "Mar", sales: 5100, forecast: 4800 },
  { month: "Apr", sales: 4700, forecast: 4900 },
  { month: "May", sales: 5300, forecast: 5200 },
  { month: "Jun", sales: 5800, forecast: 5500 },
  { month: "Jul", sales: 6200, forecast: 5900 },
  { month: "Aug", sales: 5900, forecast: 6100 },
  { month: "Sep", sales: 5400, forecast: 5600 },
  { month: "Oct", sales: 6100, forecast: 5800 },
  { month: "Nov", sales: 6800, forecast: 6500 },
  { month: "Dec", sales: 7200, forecast: 7000 },
]

const MOCK_STOCK_LEVELS: StockLevel[] = [
  { category: "Electronics", inStock: 3420, reserved: 480 },
  { category: "Textiles", inStock: 2180, reserved: 310 },
  { category: "Raw Materials", inStock: 5640, reserved: 1200 },
  { category: "Packaging", inStock: 8900, reserved: 2100 },
  { category: "Chemicals", inStock: 1560, reserved: 340 },
  { category: "Hardware", inStock: 2870, reserved: 510 },
]

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "1", sku: "ELC-001", name: "Circuit Board A7", category: "Electronics",
    price: 24.50, stock: 1250, threshold: 200,
    batches: [
      { id: "b1", quantity: 500, receivedDate: "2025-12-01", expiryDate: "2027-12-01" },
      { id: "b2", quantity: 750, receivedDate: "2026-01-15", expiryDate: "2028-01-15" },
    ],
  },
  {
    id: "2", sku: "TXT-012", name: "Cotton Weave Roll", category: "Textiles",
    price: 18.30, stock: 85, threshold: 100,
    batches: [
      { id: "b3", quantity: 85, receivedDate: "2025-11-20", expiryDate: "2026-11-20" },
    ],
  },
  {
    id: "3", sku: "RAW-045", name: "Steel Rod 12mm", category: "Raw Materials",
    price: 7.80, stock: 4500, threshold: 500,
    batches: [
      { id: "b4", quantity: 2000, receivedDate: "2025-10-05", expiryDate: "2030-10-05" },
      { id: "b5", quantity: 2500, receivedDate: "2026-01-10", expiryDate: "2031-01-10" },
    ],
  },
  {
    id: "4", sku: "PKG-008", name: "Corrugated Box 30x20", category: "Packaging",
    price: 1.20, stock: 12000, threshold: 2000,
    batches: [
      { id: "b6", quantity: 5000, receivedDate: "2026-01-01", expiryDate: "2028-01-01" },
      { id: "b7", quantity: 7000, receivedDate: "2026-02-01", expiryDate: "2028-02-01" },
    ],
  },
  {
    id: "5", sku: "CHM-003", name: "Industrial Solvent X", category: "Chemicals",
    price: 45.00, stock: 150, threshold: 200,
    batches: [
      { id: "b8", quantity: 150, receivedDate: "2025-09-15", expiryDate: "2026-09-15" },
    ],
  },
  {
    id: "6", sku: "HDW-022", name: "Hex Bolt M10", category: "Hardware",
    price: 0.45, stock: 28000, threshold: 5000,
    batches: [
      { id: "b9", quantity: 15000, receivedDate: "2025-12-20", expiryDate: "2035-12-20" },
      { id: "b10", quantity: 13000, receivedDate: "2026-01-25", expiryDate: "2036-01-25" },
    ],
  },
  {
    id: "7", sku: "ELC-015", name: "LED Module RGB", category: "Electronics",
    price: 3.75, stock: 45, threshold: 100,
    batches: [
      { id: "b11", quantity: 45, receivedDate: "2025-11-10", expiryDate: "2027-11-10" },
    ],
  },
  {
    id: "8", sku: "TXT-028", name: "Polyester Ribbon 5cm", category: "Textiles",
    price: 2.10, stock: 6200, threshold: 1000,
    batches: [
      { id: "b12", quantity: 3000, receivedDate: "2026-01-05", expiryDate: "2028-01-05" },
      { id: "b13", quantity: 3200, receivedDate: "2026-02-01", expiryDate: "2028-02-01" },
    ],
  },
]

const MOCK_VENDORS: Vendor[] = [
  { id: "1", name: "TechSource Ltd.", contact: "Lin Wei", email: "lin@techsource.com", score: 92, onTimeDelivery: 96, defectRate: 1.2, priceStability: 94, status: "active" },
  { id: "2", name: "GreenPack Co.", contact: "Maria Santos", email: "maria@greenpack.com", score: 87, onTimeDelivery: 91, defectRate: 2.1, priceStability: 89, status: "active" },
  { id: "3", name: "SteelWorks Inc.", contact: "Tom Brady", email: "tom@steelworks.com", score: 73, onTimeDelivery: 78, defectRate: 4.5, priceStability: 82, status: "at-risk" },
  { id: "4", name: "ChemSupply Global", contact: "Aiko Tanaka", email: "aiko@chemsupply.com", score: 95, onTimeDelivery: 98, defectRate: 0.8, priceStability: 96, status: "active" },
  { id: "5", name: "FabricWorld", contact: "Hassan Ali", email: "hassan@fabricworld.com", score: 68, onTimeDelivery: 72, defectRate: 5.2, priceStability: 75, status: "at-risk" },
  { id: "6", name: "BoltMaster", contact: "Jake Stone", email: "jake@boltmaster.com", score: 41, onTimeDelivery: 55, defectRate: 8.1, priceStability: 60, status: "inactive" },
]

const MOCK_ALERTS: Alert[] = [
  { id: "1", type: "low-stock", title: "Low Stock: Cotton Weave Roll", message: "Stock at 85 units, below threshold of 100.", timestamp: "2026-02-06T09:30:00Z", read: false },
  { id: "2", type: "low-stock", title: "Low Stock: Industrial Solvent X", message: "Stock at 150 units, below threshold of 200.", timestamp: "2026-02-06T08:15:00Z", read: false },
  { id: "3", type: "vendor-risk", title: "Vendor Risk: BoltMaster", message: "Performance score dropped to 41. Review recommended.", timestamp: "2026-02-05T14:20:00Z", read: false },
  { id: "4", type: "reorder", title: "Reorder: LED Module RGB", message: "Forecast suggests reorder of 500 units within 7 days.", timestamp: "2026-02-05T11:00:00Z", read: true },
  { id: "5", type: "vendor-risk", title: "Vendor Risk: FabricWorld", message: "Defect rate increased to 5.2%. Consider alternative vendors.", timestamp: "2026-02-04T16:45:00Z", read: true },
  { id: "6", type: "reorder", title: "Reorder: Cotton Weave Roll", message: "Demand forecast indicates need for 300 units in next 14 days.", timestamp: "2026-02-04T10:30:00Z", read: true },
  { id: "7", type: "low-stock", title: "Low Stock: LED Module RGB", message: "Stock at 45 units, below threshold of 100.", timestamp: "2026-02-03T09:00:00Z", read: true },
  { id: "8", type: "general", title: "System Update", message: "Invenza v2.4 deployed. New demand forecasting model active.", timestamp: "2026-02-02T08:00:00Z", read: true },
]

const MOCK_BLOCKCHAIN: BlockchainEntry[] = [
  { id: "1", hash: "0x7f3a...c8e1", previousHash: "0x0000...0000", timestamp: "2026-02-06T10:15:00Z", actionType: "Purchase", details: "PO-2048: 500x Circuit Board A7 from TechSource Ltd." },
  { id: "2", hash: "0x2b91...d4f7", previousHash: "0x7f3a...c8e1", timestamp: "2026-02-06T09:45:00Z", actionType: "Sale", details: "SO-4521: 200x Corrugated Box 30x20 to RetailCo" },
  { id: "3", hash: "0x8c12...a3b5", previousHash: "0x2b91...d4f7", timestamp: "2026-02-05T16:30:00Z", actionType: "Purchase", details: "PO-2047: 1000x Hex Bolt M10 from BoltMaster" },
  { id: "4", hash: "0xd5e7...9f02", previousHash: "0x8c12...a3b5", timestamp: "2026-02-05T14:00:00Z", actionType: "Sale", details: "SO-4520: 50x LED Module RGB to LightPro" },
  { id: "5", hash: "0x1a4f...b6c8", previousHash: "0xd5e7...9f02", timestamp: "2026-02-05T11:20:00Z", actionType: "Adjustment", details: "Inventory audit adjustment: +25 Industrial Solvent X" },
  { id: "6", hash: "0xe3d9...72a1", previousHash: "0x1a4f...b6c8", timestamp: "2026-02-04T15:45:00Z", actionType: "Purchase", details: "PO-2046: 3000x Polyester Ribbon 5cm from FabricWorld" },
  { id: "7", hash: "0x6b8c...e5d3", previousHash: "0xe3d9...72a1", timestamp: "2026-02-04T10:10:00Z", actionType: "Sale", details: "SO-4519: 100x Steel Rod 12mm to BuildCorp" },
  { id: "8", hash: "0xf247...1c9e", previousHash: "0x6b8c...e5d3", timestamp: "2026-02-03T09:30:00Z", actionType: "Purchase", details: "PO-2045: 2000x Cotton Weave Roll from FabricWorld" },
]

// ---------- API Functions ----------

export const api = {
  /** Endpoint reference (for real API integration) */
  endpoints: {
    kpis: `${API_BASE}/kpis`,
    salesForecast: `${API_BASE}/analytics/sales-forecast`,
    stockLevels: `${API_BASE}/analytics/stock-levels`,
    inventory: `${API_BASE}/inventory`,
    vendors: `${API_BASE}/vendors`,
    alerts: `${API_BASE}/alerts`,
    blockchain: `${API_BASE}/blockchain`,
    forecast: `${API_BASE}/forecast`,
    imageDetect: `${API_BASE}/ai/detect-product`,
  },

  // -- Dashboard --
  getKPIs: () => mockGet(MOCK_KPIS),
  getSalesForecast: () => mockGet(MOCK_SALES_FORECAST),
  getStockLevels: () => mockGet(MOCK_STOCK_LEVELS),

  // -- Inventory --
  getInventory: () => mockGet(MOCK_INVENTORY),
  getInventoryItem: (id: string) =>
    mockGet(MOCK_INVENTORY.find((i) => i.id === id) ?? null),
  createProduct: (product: Omit<InventoryItem, "id" | "batches">) =>
    mockGet({ ...product, id: Date.now().toString(), batches: [] }),
  updateProduct: (id: string, product: Partial<InventoryItem>) =>
    mockGet({ ...MOCK_INVENTORY.find((i) => i.id === id), ...product }),

  // -- Vendors --
  getVendors: () => mockGet(MOCK_VENDORS),
  getVendor: (id: string) =>
    mockGet(MOCK_VENDORS.find((v) => v.id === id) ?? null),

  // -- Alerts --
  getAlerts: () => mockGet(MOCK_ALERTS),
  markAlertRead: (id: string) =>
    mockGet({ id, read: true }),

  // -- Blockchain --
  getBlockchain: () => mockGet(MOCK_BLOCKCHAIN),

  // -- AI Features --
  getDemandForecast: (_productId: string): Promise<ForecastResult[]> => {
    const results: ForecastResult[] = Array.from({ length: 30 }, (_, i) => {
      const base = 80 + Math.sin(i / 5) * 30
      return {
        day: `Day ${i + 1}`,
        predicted: Math.round(base + Math.random() * 10),
        lower: Math.round(base - 15 + Math.random() * 5),
        upper: Math.round(base + 25 + Math.random() * 5),
      }
    })
    return mockGet(results)
  },

  detectProduct: (_file: File): Promise<DetectedProduct> =>
    mockGet({
      name: "Wireless Bluetooth Speaker",
      category: "Electronics",
      suggestedPrice: 34.99,
      confidence: 0.92,
    }),
}
