import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Star, Truck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryMetrics } from "@/lib/inventory-store";
import { suppliers as supplierList } from "@/lib/inventory-data";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers — StockSense AI" },
      { name: "description", content: "Supplier directory, contact details, products supplied and status." },
      { property: "og:title", content: "Suppliers — StockSense AI" },
      { property: "og:description", content: "Supplier directory, contact details, products supplied and status." },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const { products } = useInventoryMetrics();

  return (
    <AppShell
      title="Suppliers"
      subtitle={`${supplierList.length} active and on-hold suppliers`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {supplierList.map((s) => {
          const supplied = products.filter((p) => p.supplierId === s.id);
          const value = supplied.reduce((sum, p) => sum + p.stock * p.unitCost, 0);
          return (
            <Card key={s.id} className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Truck className="size-5" />
                    </span>
                    <div>
                      <CardTitle className="text-base font-semibold leading-tight">{s.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{s.id}</p>
                    </div>
                  </div>
                  <Badge
                    variant={s.status === "Preferred" ? "default" : s.status === "Active" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {s.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span>{s.country}</span>
                    <span className="mx-1">·</span>
                    <span>{s.leadTimeDays} day lead time</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4 shrink-0" />
                    <a href={`mailto:${s.email}`} className="hover:text-foreground hover:underline">
                      {s.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4 shrink-0" />
                    <span>{s.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Products supplied</p>
                    <p className="text-lg font-bold">{supplied.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stock value</p>
                    <p className="text-lg font-bold">${(value / 1000).toFixed(1)}k</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="size-4 fill-warning text-warning" />
                    {s.rating}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Contact: {s.contact}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
