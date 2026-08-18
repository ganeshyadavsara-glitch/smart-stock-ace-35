import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  DollarSign,
  Download,
  Package,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusBadge } from "@/components/inventory/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useInventory, useInventoryMetrics } from "@/lib/inventory-store";
import {
  currency,
  forecast,
  forecastHistory,
  stockMovementTrend,
  stockStatus,
} from "@/lib/inventory-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StockSense AI Inventory Intelligence" },
      {
        name: "description",
        content:
          "Live inventory KPIs, stock movement analytics, AI restock recommendations and demand forecasting in one operations dashboard.",
      },
      { property: "og:title", content: "Dashboard — StockSense AI Inventory Intelligence" },
      {
        property: "og:description",
        content: "Live inventory KPIs, stock movement analytics, AI restock recommendations and demand forecasting in one operations dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const CHART = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "var(--shadow-elevated)",
};

function Dashboard() {
  const m = useInventoryMetrics();
  const { products } = useInventory();

  const healthData = [
    { name: "Healthy", value: m.healthy.length },
    { name: "Low", value: m.lowStock.length },
    { name: "Out", value: m.outOfStock.length },
    { name: "Overstock", value: m.overstock.length },
  ];

  const forecastSeries = [...forecastHistory, ...forecast];

  return (
    <AppShell
      title="Operations Dashboard"
      subtitle="Live view of inventory value, movement and AI risk signals"
      actions={
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => toast.success("Dashboard snapshot exported as PDF")}
        >
          <Download className="size-4" /> Export snapshot
        </Button>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total inventory value" value={currency(m.totalValue)} delta={6.4} hint="vs last month" icon={DollarSign} />
        <KpiCard label="Units in stock" value={m.totalUnits.toLocaleString()} delta={2.1} hint="across 5 categories" icon={Boxes} tone="success" />
        <KpiCard label="Low stock SKUs" value={String(m.lowStock.length)} delta={-14} hint="reorder soon" icon={AlertTriangle} tone="warning" />
        <KpiCard label="Out of stock" value={String(m.outOfStock.length)} hint="revenue at risk" icon={Package} tone="destructive" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Inventory value by category</h2>
              <p className="text-xs text-muted-foreground">Stock on hand valued at unit cost</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={m.byCategory} margin={{ left: -12 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} cursor={{ fill: "var(--color-muted)" }} />
              <Bar dataKey="value" name="Stock value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                {m.byCategory.map((_, i) => (
                  <Cell key={i} fill={CHART[i % CHART.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold">Category distribution</h2>
          <p className="text-xs text-muted-foreground">Share of total units on hand</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={m.byCategory} dataKey="units" nameKey="category" innerRadius={58} outerRadius={92} paddingAngle={3} stroke="var(--color-card)" strokeWidth={2}>
                {m.byCategory.map((_, i) => (
                  <Cell key={i} fill={CHART[i % CHART.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toLocaleString()} units`} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Stock movement</h2>
          <p className="text-xs text-muted-foreground">Inbound receipts vs outbound shipments (units)</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stockMovementTrend} margin={{ left: -12, top: 12 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="inbound" name="Inbound" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="outbound" name="Outbound" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold">Stock health</h2>
          <p className="text-xs text-muted-foreground">SKU count by status</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={healthData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis type="category" dataKey="name" width={78} tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
              <Bar dataKey="value" name="SKUs" radius={[0, 8, 8, 0]} maxBarSize={26}>
                {[CHART[3], CHART[2], "var(--color-chart-5)", CHART[1]].map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 rounded-xl bg-muted/60 p-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Inventory health score</span>
              <span className="text-primary">{m.healthScore}/100</span>
            </div>
            <Progress value={m.healthScore} className="mt-2" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">AI stock forecast</h2>
              <p className="text-xs text-muted-foreground">
                Projected outbound demand with confidence band (next 4 months)
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> 92% model confidence
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={forecastSeries} margin={{ left: -12 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="upper" name="Upper band" stroke="none" fill="var(--color-chart-1)" fillOpacity={0.12} />
              <Area type="monotone" dataKey="lower" name="Lower band" stroke="none" fill="var(--color-card)" fillOpacity={1} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="projected" name="Projected" stroke="var(--color-chart-1)" strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-4.5" />
              </span>
              <h2 className="text-base font-semibold">AI insights</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="rounded-lg border border-border p-3">
                <p className="font-medium">Q4 demand ramp detected</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Outbound volume is trending +11% month over month. Expect ~4,310 units in December — build buffer stock by late October.
                </p>
              </li>
              <li className="rounded-lg border border-border p-3">
                <p className="font-medium">Packaging is the bottleneck</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sealing tape hit zero while shipments grew. Packaging shortages stall every outbound order, not just one SKU.
                </p>
              </li>
              <li className="rounded-lg border border-border p-3">
                <p className="font-medium">Capital tied up in slow movers</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currency(m.slowMoving.reduce((s, p) => s + p.stock * p.unitCost, 0))} sits in SKUs with under 0.3 monthly turns.
                </p>
              </li>
            </ul>
            <Button asChild variant="ghost" className="mt-3 w-full justify-between">
              <Link to="/insights">
                Open AI Insights <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-warning/18 text-warning-foreground">
                <Zap className="size-4.5" />
              </span>
              <h2 className="text-base font-semibold">Smart restock</h2>
            </div>
            <div className="mt-4 space-y-3">
              {[...m.outOfStock, ...m.lowStock].slice(0, 3).map((p) => {
                const qty = Math.max(p.reorderLevel * 2 - p.stock, Math.round(p.monthlySales * 1.2));
                return (
                  <div key={p.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{p.name}</p>
                      <StatusBadge status={stockStatus(p)} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Order <span className="font-semibold text-foreground">{qty} units</span> — covers ~30 days at {p.monthlySales}/mo demand.
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full"
                      onClick={() => toast.success(`Purchase order drafted: ${qty} × ${p.name}`)}
                    >
                      Create purchase order
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent stock activity</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/stock">View all</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Product</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Qty</th>
                  <th className="pb-2 pr-4 font-medium">Reference</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {m.movements.slice(0, 7).map((mv) => {
                  const p = products.find((x) => x.id === mv.productId);
                  return (
                    <tr key={mv.id} className="border-b border-border/70 transition-colors last:border-0 hover:bg-muted/50">
                      <td className="py-3 pr-4 font-medium">{p?.name ?? mv.productId}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            mv.type === "IN"
                              ? "bg-success/12 text-success"
                              : mv.type === "OUT"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {mv.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 tabular-nums">{mv.quantity}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{mv.reference}</td>
                      <td className="py-3 whitespace-nowrap text-muted-foreground">{mv.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4.5 text-success" />
            <h2 className="text-base font-semibold">Top fast movers</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {m.fastMoving.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(p.monthlySales / (m.fastMoving[0]?.monthlySales || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {p.monthlySales}/mo
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="size-4.5 text-warning-foreground" />
          <h2 className="text-base font-semibold">Low stock alerts</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...m.outOfStock, ...m.lowStock].slice(0, 4).map((p) => (
            <div key={p.id} className="panel p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-tight">{p.name}</p>
                <StatusBadge status={stockStatus(p)} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.sku} · Bin {p.location}</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">{p.stock}</p>
                  <p className="text-xs text-muted-foreground">reorder at {p.reorderLevel}</p>
                </div>
                <Button size="sm" onClick={() => toast.success(`Restock request sent for ${p.name}`)}>
                  Restock
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
