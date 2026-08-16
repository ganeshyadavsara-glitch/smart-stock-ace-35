import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Sparkles,
  Truck,
  BarChart3,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useInventoryMetrics } from "@/lib/inventory-store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/stock", label: "Stock", icon: Boxes },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lowStock, outOfStock } = useInventoryMetrics();
  const alerts = lowStock.length + outOfStock.length;

  return (
    <div className="min-h-screen bg-background">
      {open && (
        <button
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Boxes className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
              StockSense AI
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">Inventory Intelligence</p>
          </div>
          <button
            className="ml-auto lg:hidden"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight className="ml-auto size-4 opacity-80" />}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl bg-sidebar-accent p-4">
          <p className="text-xs font-semibold text-sidebar-accent-foreground">Inventory alerts</p>
          <p className="mt-1 text-2xl font-bold text-sidebar-accent-foreground">{alerts}</p>
          <p className="mt-1 text-xs text-sidebar-foreground/70">
            SKUs need attention this week
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link to="/insights">Review with AI</Link>
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-6">
            <button
              className="rounded-lg border border-border p-2 lg:hidden"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
              )}
            </div>
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search warehouse…"
                className="w-56 bg-card pl-9 lg:w-72"
                aria-label="Global search"
              />
            </div>
            <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-4" />
              {alerts > 0 && (
                <span className="absolute -right-1 -top-1 grid size-4.5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {alerts}
                </span>
              )}
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3">
              <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                KM
              </span>
              <span className="hidden text-xs font-medium sm:block">Karthik M.</span>
            </div>
            {actions && <div className="flex w-full gap-2 sm:w-auto">{actions}</div>}
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
