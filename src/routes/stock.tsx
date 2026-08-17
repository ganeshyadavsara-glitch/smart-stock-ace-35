import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Minus,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/inventory/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory, useInventoryMetrics } from "@/lib/inventory-store";
import { stockStatus, type Product } from "@/lib/inventory-data";

export const Route = createFileRoute("/stock")({
  head: () => ({
    meta: [
      { title: "Stock — StockSense AI" },
      { name: "description", content: "Stock in, stock out, adjustments and movement history." },
      { property: "og:title", content: "Stock — StockSense AI" },
      { property: "og:description", content: "Stock in, stock out, adjustments and movement history." },
    ],
  }),
  component: StockPage,
});

function StockPage() {
  const { products, movements, recordMovement } = useInventory();
  const m = useInventoryMetrics();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [mode, setMode] = useState<"IN" | "OUT" | "ADJUST" | null>(null);
  const [qty, setQty] = useState<string>("");
  const [ref, setRef] = useState<string>("");

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()),
    );
  }, [products, query]);

  const submit = () => {
    if (!selected || !mode) return;
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    recordMovement({ productId: selected.id, type: mode, quantity, reference: ref || "MANUAL" });
    toast.success(`Stock ${mode.toLowerCase()} recorded for ${selected.name}`);
    setSelected(null);
    setMode(null);
    setQty("");
    setRef("");
  };

  const open = (p: Product, m: "IN" | "OUT" | "ADJUST") => {
    setSelected(p);
    setMode(m);
    setQty("");
    setRef("");
  };

  return (
    <AppShell
      title="Stock control"
      subtitle={`${m.totalUnits.toLocaleString()} units tracked · ${movements.length} movements recorded`}
    >
      <div className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Find a product to adjust…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Reorder</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <Package className="size-4" />
                      </span>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-lg font-semibold tabular-nums">{p.stock}</TableCell>
                  <TableCell>
                    <StatusBadge status={stockStatus(p)} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.reorderLevel}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => open(p, "IN")}>
                        <ArrowDownCircle className="size-4" /> In
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => open(p, "OUT")}>
                        <ArrowUpCircle className="size-4" /> Out
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => open(p, "ADJUST")}>
                        <Minus className="size-4" /> Adjust
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <History className="size-4.5 text-muted-foreground" />
          <h2 className="text-base font-semibold">Movement history</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.slice(0, 12).map((mv) => {
                const p = products.find((x) => x.id === mv.productId);
                return (
                  <TableRow key={mv.id}>
                    <TableCell className="font-medium">{p?.name ?? mv.productId}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          mv.type === "IN"
                            ? "bg-success/12 text-success"
                            : mv.type === "OUT"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {mv.type === "IN" ? <Plus className="size-3" /> : mv.type === "OUT" ? <Minus className="size-3" /> : <Minus className="size-3" />}
                        {mv.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{mv.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{mv.reference}</TableCell>
                    <TableCell className="text-muted-foreground">{mv.user}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{mv.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selected && !!mode} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "IN" ? "Stock in" : mode === "OUT" ? "Stock out" : "Adjust stock"} — {selected?.name}
            </DialogTitle>
            <DialogDescription>Current stock: {selected?.stock ?? 0}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Reference (PO / SO / reason)</Label>
              <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. PO-9021" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button onClick={submit}>Record {mode}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
