import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Download,
  Edit,
  MoreHorizontal,
  PackagePlus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/inventory/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventory, useInventoryMetrics } from "@/lib/inventory-store";
import {
  CATEGORIES,
  categoryColor,
  currency,
  stockStatus,
  suppliers,
  type Category,
  type Product,
} from "@/lib/inventory-data";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — StockSense AI" },
      { name: "description", content: "Manage products, SKUs, stock levels, suppliers and reorder points." },
      { property: "og:title", content: "Products — StockSense AI" },
      { property: "og:description", content: "Manage products, SKUs, stock levels, suppliers and reorder points." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products, deleteProduct, addProduct, updateProduct } = useInventory();
  const m = useInventoryMetrics();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [status, setStatus] = useState<string>("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return products
      .filter((p) => (category === "All" ? true : p.category === category))
      .filter((p) => (status === "All" ? true : stockStatus(p) === status))
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.location.toLowerCase().includes(query.toLowerCase()),
      );
  }, [products, category, status, query]);

  const statuses = ["All", "In Stock", "Low Stock", "Out of Stock", "Overstock"];

  return (
    <AppShell
      title="Products"
      subtitle={`${products.length} SKUs · ${currency(m.totalValue)} inventory value`}
      actions={
        <>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => toast.success("Product catalog exported as CSV")}>
            <Download className="size-4" /> Export
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PackagePlus className="size-4" /> Add product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <ProductForm
                onSubmit={(p) => {
                  addProduct(p as Parameters<typeof addProduct>[0]);
                  setIsAddOpen(false);
                  toast.success("Product added");
                }}
                onCancel={() => setIsAddOpen(false)}
              />
            </DialogContent>

          </Dialog>
        </>
      }
    >
      <div className="panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU or bin…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={category} onValueChange={(v) => setCategory(v as Category | "All")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[80px]">SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Unit cost</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Bin {p.location}</p>
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset"
                      style={{
                        background: `${categoryColor[p.category]}15`,
                        color: categoryColor[p.category],
                        borderColor: `${categoryColor[p.category]}30`,
                      }}
                    >
                      <span className="size-1.5 rounded-full" style={{ background: categoryColor[p.category] }} />
                      {p.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{p.stock}</TableCell>
                  <TableCell>
                    <StatusBadge status={stockStatus(p)} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{currency(p.unitCost)}</TableCell>
                  <TableCell className="text-right tabular-nums">{currency(p.price)}</TableCell>
                  <TableCell className="text-sm">
                    {suppliers.find((s) => s.id === p.supplierId)?.name ?? p.supplierId}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(p)}>
                          <Edit className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => {
                            deleteProduct(p.id);
                            toast.success("Product deleted");
                          }}
                        >
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    No products match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          {editing && (
            <ProductForm
              product={editing}
              onSubmit={(patch) => {
                updateProduct(editing.id, patch);
                setEditing(null);
                toast.success("Product updated");
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function ProductForm({
  product,
  onSubmit,
  onCancel,
}: {
  product?: Product;
  onSubmit: (p: Partial<Product>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Product>>(
    product ?? {
      sku: "",
      name: "",
      category: "Electronics",
      stock: 0,
      reorderLevel: 10,
      unitCost: 0,
      price: 0,
      supplierId: suppliers[0]?.id ?? "SUP-01",
      location: "",
      monthlySales: 0,
    },
  );


  const update = <K extends keyof Product>(key: K, value: Product[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
        <DialogDescription>Update SKU, stock levels, supplier and pricing.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Product name</Label>
          <Input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>SKU</Label>
          <Input value={form.sku ?? ""} onChange={(e) => update("sku", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category ?? "Electronics"} onValueChange={(v) => update("category", v as Category)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
        <div className="space-y-1.5">
          <Label>Stock</Label>
          <Input type="number" value={form.stock ?? 0} onChange={(e) => update("stock", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Reorder level</Label>
          <Input type="number" value={form.reorderLevel ?? 0} onChange={(e) => update("reorderLevel", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Unit cost</Label>
          <Input type="number" value={form.unitCost ?? 0} onChange={(e) => update("unitCost", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5">
          <Label>Selling price</Label>
          <Input type="number" value={form.price ?? 0} onChange={(e) => update("price", Number(e.target.value))} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Supplier</Label>
          <Select value={form.supplierId} onValueChange={(v) => update("supplierId", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Location / bin</Label>
          <Input value={form.location ?? ""} onChange={(e) => update("location", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Monthly sales</Label>
          <Input type="number" value={form.monthlySales ?? 0} onChange={(e) => update("monthlySales", Number(e.target.value))} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(form)}>{product ? "Save changes" : "Add product"}</Button>
      </DialogFooter>
    </>
  );
}
