export type Category =
  | "Electronics"
  | "Components"
  | "Accessories"
  | "Packaging"
  | "Office";

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: Category;
  stock: number;
  reorderLevel: number;
  unitCost: number;
  price: number;
  supplierId: string;
  location: string;
  monthlySales: number;
  lastUpdated: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  leadTimeDays: number;
  rating: number;
  status: "Active" | "On Hold" | "Preferred";
};

export type Movement = {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  reference: string;
  user: string;
  date: string;
};

export const suppliers: Supplier[] = [
  {
    id: "SUP-01",
    name: "Nordwind Electronics",
    contact: "Lena Fischer",
    email: "lena@nordwind-el.com",
    phone: "+49 30 4412 8890",
    country: "Germany",
    leadTimeDays: 12,
    rating: 4.8,
    status: "Preferred",
  },
  {
    id: "SUP-02",
    name: "Shenzhen Cirrus Ltd.",
    contact: "Wei Chen",
    email: "wei.chen@cirrus-sz.cn",
    phone: "+86 755 8823 1190",
    country: "China",
    leadTimeDays: 21,
    rating: 4.4,
    status: "Active",
  },
  {
    id: "SUP-03",
    name: "Aravind Components",
    contact: "Priya Nair",
    email: "priya@aravindcomp.in",
    phone: "+91 44 2841 6620",
    country: "India",
    leadTimeDays: 9,
    rating: 4.6,
    status: "Active",
  },
  {
    id: "SUP-04",
    name: "PackRight Supplies",
    contact: "Marcus Hale",
    email: "m.hale@packright.co.uk",
    phone: "+44 161 402 7781",
    country: "United Kingdom",
    leadTimeDays: 6,
    rating: 4.1,
    status: "Active",
  },
  {
    id: "SUP-05",
    name: "Vertex Office Group",
    contact: "Sara Oyelaran",
    email: "sara@vertexoffice.com",
    phone: "+1 415 220 9931",
    country: "United States",
    leadTimeDays: 14,
    rating: 3.9,
    status: "On Hold",
  },
];

export const products: Product[] = [
  { id: "P-1001", sku: "ELC-NB14-SLV", name: 'Aurora NoteBook 14"', category: "Electronics", stock: 42, reorderLevel: 25, unitCost: 612, price: 949, supplierId: "SUP-01", location: "A1-04", monthlySales: 38, lastUpdated: "2026-08-14" },
  { id: "P-1002", sku: "ELC-MON27-4K", name: 'Lumen 27" 4K Monitor', category: "Electronics", stock: 18, reorderLevel: 20, unitCost: 245, price: 429, supplierId: "SUP-01", location: "A1-07", monthlySales: 31, lastUpdated: "2026-08-15" },
  { id: "P-1003", sku: "ELC-KB-MECH", name: "Kestrel Mechanical Keyboard", category: "Accessories", stock: 156, reorderLevel: 60, unitCost: 48, price: 119, supplierId: "SUP-02", location: "B2-01", monthlySales: 92, lastUpdated: "2026-08-16" },
  { id: "P-1004", sku: "ELC-MS-ERGO", name: "Kestrel Ergo Mouse", category: "Accessories", stock: 34, reorderLevel: 45, unitCost: 21, price: 59, supplierId: "SUP-02", location: "B2-03", monthlySales: 78, lastUpdated: "2026-08-16" },
  { id: "P-1005", sku: "CMP-SSD-1TB", name: "Vertex NVMe SSD 1TB", category: "Components", stock: 210, reorderLevel: 80, unitCost: 62, price: 129, supplierId: "SUP-03", location: "C1-02", monthlySales: 140, lastUpdated: "2026-08-16" },
  { id: "P-1006", sku: "CMP-RAM-16", name: "Vertex DDR5 16GB Module", category: "Components", stock: 88, reorderLevel: 70, unitCost: 41, price: 89, supplierId: "SUP-03", location: "C1-05", monthlySales: 105, lastUpdated: "2026-08-15" },
  { id: "P-1007", sku: "CMP-PSU-650", name: "Ironclad 650W PSU", category: "Components", stock: 12, reorderLevel: 30, unitCost: 55, price: 109, supplierId: "SUP-02", location: "C2-01", monthlySales: 27, lastUpdated: "2026-08-13" },
  { id: "P-1008", sku: "ACC-HUB-USBC", name: "Nimbus USB-C Hub 8-in-1", category: "Accessories", stock: 74, reorderLevel: 40, unitCost: 27, price: 74, supplierId: "SUP-02", location: "B1-09", monthlySales: 63, lastUpdated: "2026-08-16" },
  { id: "P-1009", sku: "ACC-CBL-HDMI", name: "Nimbus HDMI 2.1 Cable 2m", category: "Accessories", stock: 420, reorderLevel: 150, unitCost: 6, price: 19, supplierId: "SUP-03", location: "B1-11", monthlySales: 186, lastUpdated: "2026-08-16" },
  { id: "P-1010", sku: "PKG-BOX-M", name: "Corrugated Box (Medium)", category: "Packaging", stock: 1350, reorderLevel: 600, unitCost: 0.8, price: 2.4, supplierId: "SUP-04", location: "D1-01", monthlySales: 940, lastUpdated: "2026-08-16" },
  { id: "P-1011", sku: "PKG-WRAP-BUB", name: "Bubble Wrap Roll 50m", category: "Packaging", stock: 96, reorderLevel: 120, unitCost: 11, price: 27, supplierId: "SUP-04", location: "D1-04", monthlySales: 130, lastUpdated: "2026-08-15" },
  { id: "P-1012", sku: "PKG-TAPE-48", name: "Sealing Tape 48mm", category: "Packaging", stock: 0, reorderLevel: 200, unitCost: 1.2, price: 3.5, supplierId: "SUP-04", location: "D1-06", monthlySales: 310, lastUpdated: "2026-08-12" },
  { id: "P-1013", sku: "OFF-CHR-ERG", name: "Meridian Ergonomic Chair", category: "Office", stock: 26, reorderLevel: 15, unitCost: 168, price: 349, supplierId: "SUP-05", location: "E1-02", monthlySales: 12, lastUpdated: "2026-08-10" },
  { id: "P-1014", sku: "OFF-DSK-STD", name: "Meridian Standing Desk", category: "Office", stock: 9, reorderLevel: 12, unitCost: 296, price: 599, supplierId: "SUP-05", location: "E1-05", monthlySales: 7, lastUpdated: "2026-08-09" },
  { id: "P-1015", sku: "OFF-LMP-LED", name: "Halo LED Desk Lamp", category: "Office", stock: 143, reorderLevel: 50, unitCost: 14, price: 39, supplierId: "SUP-05", location: "E2-01", monthlySales: 22, lastUpdated: "2026-08-14" },
  { id: "P-1016", sku: "ELC-WBC-HD", name: "Lumen HD Webcam", category: "Electronics", stock: 61, reorderLevel: 35, unitCost: 33, price: 89, supplierId: "SUP-01", location: "A2-03", monthlySales: 55, lastUpdated: "2026-08-16" },
  { id: "P-1017", sku: "CMP-GPU-MID", name: "Vertex GX-660 Graphics Card", category: "Components", stock: 7, reorderLevel: 10, unitCost: 289, price: 519, supplierId: "SUP-03", location: "C3-02", monthlySales: 19, lastUpdated: "2026-08-16" },
  { id: "P-1018", sku: "ACC-DCK-TB4", name: "Nimbus Thunderbolt 4 Dock", category: "Accessories", stock: 51, reorderLevel: 25, unitCost: 118, price: 249, supplierId: "SUP-02", location: "B3-02", monthlySales: 24, lastUpdated: "2026-08-15" },
];

export const initialMovements: Movement[] = [
  { id: "M-5001", productId: "P-1005", type: "IN", quantity: 120, reference: "PO-8841", user: "K. Magham", date: "2026-08-16 09:12" },
  { id: "M-5002", productId: "P-1009", type: "OUT", quantity: 64, reference: "SO-2291", user: "A. Rossi", date: "2026-08-16 10:04" },
  { id: "M-5003", productId: "P-1012", type: "OUT", quantity: 200, reference: "SO-2293", user: "A. Rossi", date: "2026-08-15 16:41" },
  { id: "M-5004", productId: "P-1003", type: "IN", quantity: 80, reference: "PO-8837", user: "K. Magham", date: "2026-08-15 14:20" },
  { id: "M-5005", productId: "P-1007", type: "OUT", quantity: 18, reference: "SO-2288", user: "M. Osei", date: "2026-08-15 11:55" },
  { id: "M-5006", productId: "P-1002", type: "ADJUST", quantity: -3, reference: "CYCLE-COUNT", user: "S. Iqbal", date: "2026-08-14 18:02" },
  { id: "M-5007", productId: "P-1010", type: "IN", quantity: 500, reference: "PO-8830", user: "K. Magham", date: "2026-08-14 08:35" },
  { id: "M-5008", productId: "P-1017", type: "OUT", quantity: 6, reference: "SO-2284", user: "M. Osei", date: "2026-08-13 15:19" },
];

export const stockMovementTrend = [
  { month: "Feb", inbound: 1820, outbound: 1490 },
  { month: "Mar", inbound: 2130, outbound: 1880 },
  { month: "Apr", inbound: 1750, outbound: 2010 },
  { month: "May", inbound: 2440, outbound: 2180 },
  { month: "Jun", inbound: 2260, outbound: 2390 },
  { month: "Jul", inbound: 2680, outbound: 2470 },
  { month: "Aug", inbound: 2910, outbound: 2740 },
];

export const forecast = [
  { month: "Sep", actual: null as number | null, projected: 3020, lower: 2740, upper: 3300 },
  { month: "Oct", actual: null as number | null, projected: 3260, lower: 2890, upper: 3610 },
  { month: "Nov", actual: null as number | null, projected: 3840, lower: 3320, upper: 4350 },
  { month: "Dec", actual: null as number | null, projected: 4310, lower: 3700, upper: 4920 },
];

export const forecastHistory = [
  { month: "May", actual: 2180, projected: null as number | null },
  { month: "Jun", actual: 2390, projected: null as number | null },
  { month: "Jul", actual: 2470, projected: null as number | null },
  { month: "Aug", actual: 2740, projected: 2740 },
];

export const currency = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const CATEGORIES: Category[] = [
  "Electronics",
  "Components",
  "Accessories",
  "Packaging",
  "Office",
];

export const categoryColor: Record<Category, string> = {
  Electronics: "var(--color-chart-1)",
  Components: "var(--color-chart-2)",
  Accessories: "var(--color-chart-3)",
  Packaging: "var(--color-chart-4)",
  Office: "var(--color-chart-5)",
};

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Overstock";

export function stockStatus(p: Product): StockStatus {
  if (p.stock <= 0) return "Out of Stock";
  if (p.stock <= p.reorderLevel) return "Low Stock";
  if (p.stock > p.reorderLevel * 4) return "Overstock";
  return "In Stock";
}
