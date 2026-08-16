import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  initialMovements,
  products as seedProducts,
  stockStatus,
  suppliers,
  type Movement,
  type Product,
} from "./inventory-data";

type NewProduct = Omit<Product, "id" | "lastUpdated" | "monthlySales"> & {
  monthlySales?: number;
};

type Ctx = {
  products: Product[];
  movements: Movement[];
  addProduct: (p: NewProduct) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  recordMovement: (input: {
    productId: string;
    type: Movement["type"];
    quantity: number;
    reference: string;
  }) => void;
};

const InventoryContext = createContext<Ctx | null>(null);

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function stamp() {
  const d = new Date();
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`;
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);

  const addProduct = useCallback((p: NewProduct) => {
    setProducts((prev) => [
      {
        ...p,
        monthlySales: p.monthlySales ?? 0,
        id: `P-${1000 + prev.length + 1}`,
        lastUpdated: today(),
      },
      ...prev,
    ]);
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, lastUpdated: today() } : p)),
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const recordMovement = useCallback(
    ({
      productId,
      type,
      quantity,
      reference,
    }: {
      productId: string;
      type: Movement["type"];
      quantity: number;
      reference: string;
    }) => {
      const delta = type === "IN" ? quantity : type === "OUT" ? -quantity : quantity;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: Math.max(0, p.stock + delta), lastUpdated: today() }
            : p,
        ),
      );
      setMovements((prev) => [
        {
          id: `M-${5100 + prev.length}`,
          productId,
          type,
          quantity: Math.abs(quantity) * (type === "ADJUST" && delta < 0 ? -1 : 1),
          reference: reference || (type === "IN" ? "PO-MANUAL" : "SO-MANUAL"),
          user: "K. Magham",
          date: stamp(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const value = useMemo(
    () => ({ products, movements, addProduct, updateProduct, deleteProduct, recordMovement }),
    [products, movements, addProduct, updateProduct, deleteProduct, recordMovement],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used inside InventoryProvider");
  return ctx;
}

export function useInventoryMetrics() {
  const { products, movements } = useInventory();
  return useMemo(() => {
    const totalValue = products.reduce((s, p) => s + p.stock * p.unitCost, 0);
    const totalUnits = products.reduce((s, p) => s + p.stock, 0);
    const lowStock = products.filter((p) => stockStatus(p) === "Low Stock");
    const outOfStock = products.filter((p) => stockStatus(p) === "Out of Stock");
    const overstock = products.filter((p) => stockStatus(p) === "Overstock");
    const healthy = products.filter((p) => stockStatus(p) === "In Stock");

    const byCategory = Array.from(
      products.reduce((map, p) => {
        const cur = map.get(p.category) ?? { category: p.category, value: 0, units: 0, skus: 0 };
        cur.value += p.stock * p.unitCost;
        cur.units += p.stock;
        cur.skus += 1;
        map.set(p.category, cur);
        return map;
      }, new Map<string, { category: string; value: number; units: number; skus: number }>()),
    ).map(([, v]) => v);

    const fastMoving = [...products].sort((a, b) => b.monthlySales - a.monthlySales).slice(0, 5);
    const slowMoving = [...products]
      .filter((p) => p.stock > 0)
      .sort((a, b) => a.monthlySales / a.stock - b.monthlySales / b.stock)
      .slice(0, 4);

    const riskPenalty = (outOfStock.length * 12 + lowStock.length * 6 + overstock.length * 3) / 1;
    const healthScore = Math.max(35, Math.min(98, Math.round(100 - riskPenalty)));

    return {
      totalValue,
      totalUnits,
      lowStock,
      outOfStock,
      overstock,
      healthy,
      byCategory,
      fastMoving,
      slowMoving,
      healthScore,
      movements,
      suppliers,
    };
  }, [products, movements]);
}
