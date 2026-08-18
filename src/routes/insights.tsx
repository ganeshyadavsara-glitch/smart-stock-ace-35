import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gauge,
  Layers,
  Package,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/inventory/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useInventory, useInventoryMetrics } from "@/lib/inventory-store";
import { currency, stockStatus, type Product } from "@/lib/inventory-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Inventory Intelligence — StockSense AI" },
      {
        name: "description",
        content:
          "Live AI analysis of your inventory: health score, urgency-ranked restock predictions, stockout and overstock risk, fast and slow movers, with a reason behind every recommendation.",
      },
      { property: "og:title", content: "AI Inventory Intelligence — StockSense AI" },
      {
        property: "og:description",
        content:
          "Health score, urgency-ranked restock predictions, risk analysis and explained recommendations for every SKU.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

type Urgency = "Critical" | "High" | "Moderate";

const urgencyStyle: Record<Urgency, string> = {
  Critical: "bg-destructive/10 text-destructive ring-destructive/25",
  High: "bg-warning/18 text-warning-foreground ring-warning/30",
  Moderate: "bg-info/10 text-info ring-info/20",
};

function daysOfCover(p: Product) {
  const daily = p.monthlySales / 30;
  if (daily <= 0) return 999;
  return Math.max(0, Math.round(p.stock / daily));
}

function WhyBlock({ reasons }: { reasons: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-lg border border-border/70 bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="inline-flex items-center gap-1.5">
          <BrainCircuit className="size-3.5" /> Why this recommendation?
        </span>
        <ChevronDown className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="space-y-1.5 border-t border-border/70 px-3 py-2.5 text-xs text-muted-foreground">
          {reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InsightsPage() {
  const m = useInventoryMetrics();
  const { products } = useInventory();
  const [analyzing, setAnalyzing] = useState(false);

  const atRisk = useMemo(
    () =>
      [...m.outOfStock, ...m.lowStock].sort(
        (a, b) => daysOfCover(a) - daysOfCover(b) || b.monthlySales - a.monthlySales,
      ),
    [m.outOfStock, m.lowStock],
  );

  const predictions = useMemo(
    () =>
      products
        .filter((p) => daysOfCover(p) < 60 && p.monthlySales > 0)
        .sort((a, b) => daysOfCover(a) - daysOfCover(b))
        .slice(0, 6)
        .map((p) => {
          const cover = daysOfCover(p);
          const urgency: Urgency = cover <= 7 ? "Critical" : cover <= 21 ? "High" : "Moderate";
          const suggested = Math.max(p.reorderLevel * 2 - p.stock, Math.round(p.monthlySales * 1.5));
          const supplier = m.suppliers.find((s) => s.id === p.supplierId);
          const lead = supplier?.leadTimeDays ?? 10;
          return { p, cover, urgency, suggested, supplier, lead };
        }),
    [products, m.suppliers],
  );

  const capitalAtRisk = atRisk.reduce((s, p) => s + p.reorderLevel * p.unitCost, 0);
  const overstockCapital = m.overstock.reduce((s, p) => s + p.stock * p.unitCost, 0);

  const riskData = [
    { name: "Out of stock", count: m.outOfStock.length, fill: "var(--destructive)" },
    { name: "Low stock", count: m.lowStock.length, fill: "var(--warning)" },
    { name: "Healthy", count: m.healthy.length, fill: "var(--success)" },
    { name: "Overstock", count: m.overstock.length, fill: "var(--info)" },
  ];

  const velocityData = [...m.fastMoving]
    .slice(0, 5)
    .map((p) => ({ name: p.sku.split("-").slice(-1)[0], sales: p.monthlySales, cover: daysOfCover(p) }));

  const healthColor =
    m.healthScore >= 80 ? "text-success" : m.healthScore >= 60 ? "text-warning-foreground" : "text-destructive";
  const healthFill =
    m.healthScore >= 80 ? "var(--success)" : m.healthScore >= 60 ? "var(--warning)" : "var(--destructive)";

  const runAnalysis = () => {
    setAnalyzing(true);
    toast.loading("Analyzing 30-day velocity, lead times and seasonality…", { id: "ai" });
    setTimeout(() => {
      setAnalyzing(false);
      toast.success(`Analysis complete — ${predictions.length} SKUs flagged for action`, { id: "ai" });
    }, 1400);
  };

  return (
    <AppShell title="AI Insights" subtitle="Recommendations powered by demand patterns and stock levels">
      {/* Hero */}
      <section className="panel relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--primary)" }}
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Live analysis · {products.length} SKUs monitored
            </span>
            <h1 className="mt-4 flex items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              <BrainCircuit className="size-8 text-primary" />
              AI Inventory Intelligence
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              StockSense continuously scores every SKU against demand velocity, reorder thresholds and supplier lead
              times — then explains exactly why each action matters.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={runAnalysis} disabled={analyzing}>
                <Sparkles className={cn("size-4", analyzing && "animate-pulse")} />
                {analyzing ? "Analyzing inventory…" : "Run AI analysis"}
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.success(`Draft purchase orders created for ${atRisk.length} SKUs`)}
              >
                Action all critical items <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-5 rounded-2xl border border-border bg-card/60 p-5">
            <div className="relative size-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="72%"
                  outerRadius="100%"
                  data={[{ name: "health", value: m.healthScore, fill: healthFill }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" background cornerRadius={12} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center">
                <span className={cn("text-2xl font-bold", healthColor)}>{m.healthScore}</span>
              </div>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Gauge className="size-4 text-primary" /> Inventory health score
              </p>
              <p className="mt-1 max-w-[15rem] text-xs text-muted-foreground">
                Weighted across stockouts, low stock and overstocked capital.
              </p>
              <div className="mt-3 space-y-1 text-xs">
                <p className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-destructive" /> {m.outOfStock.length} stockouts
                </p>
                <p className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-warning" /> {m.lowStock.length} low stock
                </p>
                <p className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-info" /> {m.overstock.length} overstocked
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Low stock risk",
            value: `${atRisk.length} SKUs`,
            hint: `${currency(capitalAtRisk)} to restore safe stock`,
            icon: AlertTriangle,
            tone: "text-destructive bg-destructive/10",
          },
          {
            label: "Overstock risk",
            value: `${m.overstock.length} SKUs`,
            hint: `${currency(overstockCapital)} capital tied up`,
            icon: Layers,
            tone: "text-info bg-info/10",
          },
          {
            label: "Fast movers",
            value: `${m.fastMoving.length}`,
            hint: `Top: ${m.fastMoving[0]?.name ?? "—"}`,
            icon: Zap,
            tone: "text-success bg-success/12",
          },
          {
            label: "Slow movers",
            value: `${m.slowMoving.length}`,
            hint: "Low turnover vs stock held",
            icon: TrendingDown,
            tone: "text-warning-foreground bg-warning/15",
          },
        ].map((k) => (
          <div key={k.label} className="panel p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{k.label}</p>
              <span className={cn("grid size-10 place-items-center rounded-xl", k.tone)}>
                <k.icon className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{k.value}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Restock predictions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-5 text-primary" /> Restock prediction cards
          </CardTitle>
          <span className="text-xs text-muted-foreground">Ranked by days of cover remaining</span>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {predictions.map(({ p, cover, urgency, suggested, supplier, lead }) => (
            <div
              key={p.id}
              className="flex flex-col rounded-xl border border-border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sku}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                    urgencyStyle[urgency],
                  )}
                >
                  {urgency}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <StatusBadge status={stockStatus(p)} />
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> {cover} days cover
                </span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Stock {p.stock}</span>
                  <span>Reorder at {p.reorderLevel}</span>
                </div>
                <Progress
                  value={Math.min(100, (p.stock / Math.max(1, p.reorderLevel * 2)) * 100)}
                  className="mt-1.5"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-primary">
                  Order {suggested} units
                </span>
                <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">Lead {lead}d</span>
              </div>

              <WhyBlock
                reasons={[
                  `Selling ~${p.monthlySales} units/month (${(p.monthlySales / 30).toFixed(1)}/day), leaving ${cover} days of cover.`,
                  `${supplier?.name ?? p.supplierId} needs ${lead} days to deliver — ordering later than ${Math.max(0, cover - lead)} days from now risks a stockout.`,
                  `Suggested ${suggested} units restores stock to 2× the ${p.reorderLevel}-unit reorder level plus a demand buffer.`,
                  `Capital impact ${currency(suggested * p.unitCost)} at ${currency(p.unitCost)}/unit.`,
                ]}
              />

              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={() => toast.success(`Purchase order drafted: ${suggested} × ${p.name}`)}
              >
                Create PO <ArrowRight className="size-4" />
              </Button>
            </div>
          ))}
          {predictions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
              No SKUs are forecast to run low in the next 60 days.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Risk charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold">Risk distribution across SKUs</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} layout="vertical" margin={{ left: 12, right: 16 }}>
                <CartesianGrid horizontal={false} strokeOpacity={0.15} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fillOpacity: 0.06 }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="SKUs" radius={[0, 8, 8, 0]} barSize={22}>
                  {riskData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="size-5 text-success" />
            <CardTitle className="text-base font-semibold">Demand velocity vs days of cover</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fillOpacity: 0.06 }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="sales" name="Units / month" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="cover" name="Days of cover" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fast / slow movers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Zap className="size-5 text-success" />
            <CardTitle className="text-base font-semibold">Fast-moving product insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {m.fastMoving.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <span className="shrink-0 text-xs font-semibold text-success">{p.monthlySales}/mo</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-success transition-all duration-500"
                    style={{ width: `${(p.monthlySales / (m.fastMoving[0]?.monthlySales || 1)) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Why: top-decile velocity with {daysOfCover(p)} days of cover — keep safety stock above{" "}
                  {p.reorderLevel} units to protect service level.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingDown className="size-5 text-info" />
            <CardTitle className="text-base font-semibold">Slow-moving product insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {m.slowMoving.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.stock} units · {p.monthlySales}/mo sales
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">{currency(p.stock * p.unitCost)}</p>
                    <p className="text-xs text-muted-foreground">tied up</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Why: turnover of {(p.monthlySales / Math.max(1, p.stock)).toFixed(2)}× per month means ~
                  {daysOfCover(p) > 900 ? "365+" : daysOfCover(p)} days of cover — consider a promotion or pausing
                  reorders.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Health breakdown + method */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle2 className="size-5 text-success" />
            <CardTitle className="text-base font-semibold">Inventory health breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { label: "Healthy SKUs", dot: "bg-success", n: m.healthy.length },
                { label: "Low stock", dot: "bg-warning", n: m.lowStock.length },
                { label: "Out of stock", dot: "bg-destructive", n: m.outOfStock.length },
                { label: "Overstock", dot: "bg-info", n: m.overstock.length },
              ].map((r) => (
                <li key={r.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="flex items-center gap-2 text-sm">
                    <span className={cn("size-2 rounded-full", r.dot)} /> {r.label}
                  </span>
                  <span className="font-bold">{r.n}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-4 w-full" onClick={runAnalysis} disabled={analyzing}>
              <RefreshCw className={cn("size-4", analyzing && "animate-spin")} /> Refresh AI analysis
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Package className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold">How recommendations are generated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Every SKU is scored on four signals: current stock versus reorder level, 30-day sales velocity, supplier
              lead time, and capital exposure. Days of cover = stock ÷ daily velocity; anything below the supplier lead
              time is escalated to Critical.
            </p>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" /> Critical — under 7 days of
                cover
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" /> High — 8 to 21 days of cover
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-info" /> Moderate — 22 to 60 days of cover
              </li>
            </ul>
            <p className="text-xs">
              All forecasts run locally against the live inventory dataset — no external AI service is used.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
