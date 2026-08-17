import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Save, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StockSense AI" },
      {
        name: "description",
        content:
          "Manage your profile, warehouse team roles, user access and notification preferences in StockSense AI.",
      },
      { property: "og:title", content: "Settings — StockSense AI" },
      {
        property: "og:description",
        content: "Profile settings, user management with roles and notification preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

type Role = "Admin" | "Manager" | "Staff";
type UserStatus = "Active" | "Invited" | "Suspended";

type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastActive: string;
};

const ROLES: Role[] = ["Admin", "Manager", "Staff"];
const STATUSES: UserStatus[] = ["Active", "Invited", "Suspended"];

const SEED_USERS: TeamUser[] = [
  { id: "U-101", name: "Karthik Magham", email: "karthik@stocksense.ai", role: "Admin", status: "Active", lastActive: "2 min ago" },
  { id: "U-102", name: "Priya Nair", email: "priya.nair@stocksense.ai", role: "Manager", status: "Active", lastActive: "1 hr ago" },
  { id: "U-103", name: "Daniel Okafor", email: "daniel.o@stocksense.ai", role: "Manager", status: "Active", lastActive: "Yesterday" },
  { id: "U-104", name: "Meera Iyer", email: "meera.iyer@stocksense.ai", role: "Staff", status: "Invited", lastActive: "—" },
  { id: "U-105", name: "Tom Bergström", email: "tom.b@stocksense.ai", role: "Staff", status: "Active", lastActive: "3 hrs ago" },
  { id: "U-106", name: "Aisha Rahman", email: "aisha.r@stocksense.ai", role: "Staff", status: "Suspended", lastActive: "12 days ago" },
];

const roleStyles: Record<Role, string> = {
  Admin: "bg-primary/12 text-primary ring-primary/25",
  Manager: "bg-info/10 text-info ring-info/20",
  Staff: "bg-muted text-muted-foreground ring-border",
};

const statusStyles: Record<UserStatus, string> = {
  Active: "bg-success/12 text-success ring-success/20",
  Invited: "bg-warning/18 text-warning-foreground ring-warning/30",
  Suspended: "bg-destructive/10 text-destructive ring-destructive/20",
};

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

const emptyDraft = { name: "", email: "", role: "Staff" as Role, status: "Invited" as UserStatus };

function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Karthik Magham",
    email: "karthik@stocksense.ai",
    jobTitle: "Head of Inventory Operations",
    warehouse: "Central Warehouse — Bengaluru",
    phone: "+91 98450 12345",
  });

  const [prefs, setPrefs] = useState({
    lowStockAlerts: true,
    weeklyDigest: true,
    restockSuggestions: true,
    supplierUpdates: false,
    productActivity: false,
  });

  const [users, setUsers] = useState<TeamUser[]>(SEED_USERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  function openAdd() {
    setEditingId(null);
    setDraft(emptyDraft);
    setDialogOpen(true);
  }

  function openEdit(u: TeamUser) {
    setEditingId(u.id);
    setDraft({ name: u.name, email: u.email, role: u.role, status: u.status });
    setDialogOpen(true);
  }

  function submitUser() {
    if (!draft.name.trim() || !draft.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (editingId) {
      setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...draft } : u)));
      toast.success(`${draft.name} updated`);
    } else {
      setUsers((prev) => [
        {
          id: `U-${107 + prev.length}`,
          lastActive: "—",
          ...draft,
        },
        ...prev,
      ]);
      toast.success(`${draft.name} added to the team`);
    }
    setDialogOpen(false);
  }

  function deleteUser(u: TeamUser) {
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    toast.success(`${u.name} removed`);
  }

  const activeCount = users.filter((u) => u.status === "Active").length;

  return (
    <AppShell
      title="Settings"
      subtitle={`${users.length} team members · ${activeCount} active`}
      actions={
        <Button
          onClick={() => toast.success("Settings saved")}
          className="w-full sm:w-auto"
        >
          <Save className="size-4" />
          Save changes
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Profile settings</CardTitle>
            <CardDescription>Your details shown across activity logs and reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.jobTitle}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Full name</Label>
                <Input
                  id="p-name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-email">Email</Label>
                <Input
                  id="p-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-title">Job title</Label>
                <Input
                  id="p-title"
                  value={profile.jobTitle}
                  onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-phone">Phone</Label>
                <Input
                  id="p-phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-wh">Default warehouse</Label>
                <Input
                  id="p-wh"
                  value={profile.warehouse}
                  onChange={(e) => setProfile({ ...profile, warehouse: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification preferences</CardTitle>
            <CardDescription>Choose what StockSense AI alerts you about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { key: "lowStockAlerts", label: "Low stock alerts", hint: "When a SKU drops below reorder level" },
              { key: "restockSuggestions", label: "AI restock suggestions", hint: "Daily smart purchase recommendations" },
              { key: "weeklyDigest", label: "Weekly inventory digest", hint: "Monday summary of stock health" },
              { key: "supplierUpdates", label: "Supplier updates", hint: "Lead time and status changes" },
              { key: "productActivity", label: "Product activity", hint: "Every add, edit or delete" },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-start justify-between gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.hint}</p>
                </div>
                <Switch
                  checked={prefs[row.key as keyof typeof prefs]}
                  onCheckedChange={(v) => setPrefs((p) => ({ ...p, [row.key]: v }))}
                  aria-label={row.label}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCog className="size-4 text-primary" />
              User management
            </CardTitle>
            <CardDescription>Control who can view and change inventory data.</CardDescription>
          </div>
          <Button onClick={openAdd} size="sm">
            <Plus className="size-4" />
            Add user
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{u.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Pill label={u.role} className={roleStyles[u.role]} />
                    </TableCell>
                    <TableCell>
                      <Pill label={u.status} className={statusStyles[u.status]} />
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {u.lastActive}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Edit ${u.name}`}
                          onClick={() => openEdit(u)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Delete ${u.name}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => deleteUser(u)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No users yet. Add your first team member.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <Badge variant="secondary">Admin</Badge> full access ·
            <Badge variant="secondary">Manager</Badge> stock & purchase orders ·
            <Badge variant="secondary">Staff</Badge> record movements only
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Settings saved")}>
          <Save className="size-4" />
          Save changes
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit user" : "Add user"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the team member's details, role and account status."
                : "Invite a team member and set their access level."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Full name</Label>
              <Input
                id="u-name"
                value={draft.name}
                placeholder="e.g. Riya Sharma"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email</Label>
              <Input
                id="u-email"
                type="email"
                value={draft.email}
                placeholder="name@stocksense.ai"
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={draft.role}
                  onValueChange={(v) => setDraft({ ...draft, role: v as Role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Account status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => setDraft({ ...draft, status: v as UserStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitUser}>{editingId ? "Save user" : "Add user"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
