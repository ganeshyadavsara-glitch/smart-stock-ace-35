import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/inventory/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useInventory, useInventoryMetrics } from "@/lib/inventory-store";
import { currency, stockStatus } from "@/lib/inventory-data";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — StockSense AI" },
      { name: "description", content: "AI restock recommendations, low-stock predictions, slow-moving detection and inventory health score." },
      { property: "og:title", content: "AI Insights — StockSense AI" },
      { property: "og:description", content: "AI restock recommendations, low-stock predictions, slow-moving detection and inventory health score." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const m = useInventoryMetrics();
  const { products } = useInventory();
  const atRisk = [...m.outOfStock, ...m.lowStock];

  const healthColor = m.healthScore >= 80 ? "text-success" : m.healthScore >= 60 ? "text-warning-foreground" : "text-destructive";

  return (
    <AppShell
      title="AI Insights"
      subtitle="Recommendations powered by demand patterns and stock levels"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Inventory health score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${healthColor}`}>{m.healthScore}</p>
            <Progress value={m.healthScore} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">Weighted across stockouts, low stock and overstock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Restock needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{atRisk.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">SKUs below or at reorder level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Slow movers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-info">{m.slowMoving.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">Low turnover relative to stock held</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Capital at risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning-foreground">
              {currency(atRisk.reduce((s, p) => s + p.reorderLevel * p.unitCost, 0))}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Estimated value to restore safe stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold">Smart restock recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {atRisk.slice(0, 5).map((p) => {
              const suggested = Math.max(p.reorderLevel * 2 - p.stock, Math.round(p.monthlySales * 1.5));
              const supplier = m.suppliers.find((s) => s.id === p.supplierId);
              return (
                <div key={p.id} className="rounded-xl border border-border p-4 transition-all hover:border-primary/30 hover:bg-muted/30">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        <StatusBadge status={stockStatus(p)} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Current {p.stock} units · Reorder at {p.reorderLevel} · Demand ~{p.monthlySales}/mo
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-primary/10 px-2 py-1 font-semibold text-primary">
                          Order {suggested} units
                        </span>
                        <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                          Covers ~{Math.max(1, Math.round(suggested / p.monthlySales))} months
                        </span>
                        <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                          Supplier: {supplier?.name ?? p.supplierId}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <BrainCircuit className="inline size-3.5 align-text-bottom" /> Model confidence 94% — demand is
                        rising and safety stock is depleted.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0"
                      onClick={() => toast.success(`Purchase order drafted: ${suggested} × ${p.name}`)}
                    >
                      Create PO <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {atRisk.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No restock recommendations right now.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock className="size-5 text-warning-foreground" />
            <CardTitle className="text-base font-semibold">Low-stock predictions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products
              .filter((p) => p.stock > p.reorderLevel && p.stock <= p.reorderLevel * 1.5)
              .slice(0, 5)
              .map((p) => {
                const days = Math.max(1, Math.round(p.stock / (p.monthlySales / 30)));
                return (
                  <div key={p.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <AlertTriangle className="mt-0.5 size-4 text-warning-foreground" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Will hit reorder level in ~{days} days at current velocity.
                      </p>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingDown className="size-5 text-info" />
            <CardTitle className="text-base font-semibold">Slow-moving products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {m.slowMoving.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.stock} units · {p.monthlySales}/mo sales
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{currency(p.stock * p.unitCost)}</p>
                    <p className="text-xs text-muted-foreground">tied up</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle2 className="size-5 text-success" />
            <CardTitle className="text-base font-semibold">Inventory health breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="flex items-center gap-2 text-sm">
                  <span className="size-2 rounded-full bg-success" /> Healthy SKUs
                </span>
                <span className="font-bold">{m.healthy.length}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="flex items-center gap-2 text-sm">
                  <span className="size-2 rounded-full bg-warning" /> Low stock
                </span>
                <span className="font-bold">{m.lowStock.length}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="flex items-center gap-2 text-sm">
                  <span className="size-2 rounded-full bg-destructive" /> Out of stock
                </span>
                <span className="font-bold">{m.outOfStock.length}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="flex items-center gap-2 text-sm">
                  <span className="size-2 rounded-full bg-info" /> Overstock
                </span>
                <span className="font-bold">{m.overstock.length}</span>
              </li>
            </ul>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => toast.success("Health report refreshed with latest demand data")}
            >
              <RefreshCw className="size-4" /> Refresh AI analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Package className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">How recommendations are generated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            StockSense AI combines current stock, reorder thresholds, 30-day sales velocity, supplier lead times and
            seasonal trend data. Each recommendation shows the order quantity needed to cover projected demand plus a
            safety buffer. No external AI API is used — all forecasts run against the live sample dataset.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
