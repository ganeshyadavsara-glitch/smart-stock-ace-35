import { createFileRoute } from "@tanstack/react-router";
import {
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
import { AlertTriangle, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/inventory/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryMetrics } from "@/lib/inventory-store";
import { categoryColor, currency, stockMovementTrend, stockStatus } from "@/lib/inventory-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — StockSense AI" },
      { name: "description", content: "Inventory value, category distribution, stock movement and low-stock reports." },
      { property: "og:title", content: "Reports — StockSense AI" },
      { property: "og:description", content: "Inventory value, category distribution, stock movement and low-stock reports." },
    ],
  }),
  component: ReportsPage,
});

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "var(--shadow-elevated)",
};

function ReportsPage() {
  const m = useInventoryMetrics();
  const lowAndOut = [...m.outOfStock, ...m.lowStock];

  return (
    <AppShell
      title="Inventory reports"
      subtitle="Snapshot of value, distribution, movement and risk"
      actions={
        <Button variant="outline" onClick={() => toast.success("Report downloaded as PDF")}>
          <Download className="size-4" /> Download report
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Inventory value by category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={m.byCategory} margin={{ left: -12 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="value" name="Stock value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                  {m.byCategory.map((c, i) => (
                    <Cell key={i} fill={categoryColor[c.category as keyof typeof categoryColor]} />
                  ))}
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Category distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={m.byCategory} dataKey="value" nameKey="category" innerRadius={56} outerRadius={88} paddingAngle={3} stroke="var(--color-card)" strokeWidth={2}>
                  {m.byCategory.map((c, i) => (
                    <Cell key={i} fill={categoryColor[c.category as keyof typeof categoryColor]} />
                  ))}
                </Pie>

                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Stock movement trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockMovementTrend} margin={{ left: -12, top: 12 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="inbound" name="Inbound" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="outbound" name="Outbound" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="size-4.5 text-warning-foreground" />
          <CardTitle className="text-base font-semibold">Low-stock report</CardTitle>
        </CardHeader>
        <CardContent>
          {lowAndOut.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">All SKUs are healthy.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Product</th>
                    <th className="pb-2 pr-4 font-medium">Category</th>
                    <th className="pb-2 pr-4 font-medium text-right">Current</th>
                    <th className="pb-2 pr-4 font-medium text-right">Reorder</th>
                    <th className="pb-2 pr-4 font-medium text-right">Gap</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowAndOut.map((p) => (
                    <tr key={p.id} className="border-b border-border/70 last:border-0">
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{p.category}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{p.stock}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{p.reorderLevel}</td>
                      <td className="py-3 pr-4 text-right tabular-nums font-medium text-destructive">
                        {Math.max(0, p.reorderLevel - p.stock)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={stockStatus(p)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Button variant="outline" className="mt-4" onClick={() => toast.success("Low-stock report exported as CSV")}>
            <FileText className="size-4" /> Export low-stock CSV
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
