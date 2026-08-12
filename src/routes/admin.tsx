import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Ban, CheckCircle2, Flag, ShieldCheck, Trash2, Users, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { RequireAuth } from "@/components/RequireAuth";
import { useStore } from "@/lib/store";
import { bdt, dateLabel } from "@/lib/format";
import { CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — TaskAnt" },
      { name: "description", content: "Platform overview: users, tasks, reports, verifications and demo transactions." },
      { property: "og:title", content: "Admin Dashboard — TaskAnt" },
      { property: "og:description", content: "Operate and moderate the TaskAnt marketplace." },
    ],
  }),
  component: () => (
    <RequireAuth roles={["admin"]}>
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  const { db, toggleSuspend, setVerification, removeTask, resolveReport } = useStore();

  const stats = [
    { label: "Total Users", value: db.users.length, icon: Users },
    { label: "Total Workers", value: db.users.filter((u) => u.role === "worker").length, icon: Users },
    { label: "Active Tasks", value: db.tasks.filter((t) => !["PAID", "CANCELLED"].includes(t.status)).length, icon: CheckCircle2 },
    { label: "Completed Tasks", value: db.tasks.filter((t) => t.status === "PAID").length, icon: CheckCircle2 },
    { label: "Reported Users", value: db.reports.filter((r) => r.status === "OPEN").length, icon: Flag },
    { label: "Pending Verifications", value: db.users.filter((u) => u.verification === "PENDING").length, icon: ShieldCheck },
    { label: "Total Transactions", value: bdt(db.payments.reduce((s, p) => s + p.total, 0)), icon: Wallet },
  ];

  const chartData = CATEGORIES.map((c) => ({
    name: c.split(" ")[0],
    tasks: db.tasks.filter((t) => t.category === c).length,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Platform health, moderation and demo transactions.</p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface flex items-center gap-4 p-5">
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <s.icon size={20} />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-extrabold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface mt-6 p-6">
        <h2 className="font-semibold">Tasks by category</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <Tooltip />
              <Bar dataKey="tasks" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Tabs defaultValue="users" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="card-surface mt-4 overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>City</TableHead><TableHead>Rating</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {db.users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link to="/profile/$userId" params={{ userId: u.id }} className="flex items-center gap-2 font-medium hover:text-primary">
                      <Avatar className="size-7"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name.slice(0, 2)}</AvatarFallback></Avatar>
                      {u.name}
                    </Link>
                  </TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>{u.city}</TableCell>
                  <TableCell>{u.rating.toFixed(1)}★</TableCell>
                  <TableCell>
                    <Badge variant={u.suspended ? "destructive" : "secondary"}>{u.suspended ? "Suspended" : "Active"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toggleSuspend(u.id);
                        toast.success(u.suspended ? "User reinstated." : "User suspended.");
                      }}
                    >
                      <Ban size={14} /> {u.suspended ? "Unsuspend" : "Suspend"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="tasks" className="card-surface mt-4 overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Task</TableHead><TableHead>City</TableHead><TableHead>Budget</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
            </TableHeader>
            <TableBody>
              {db.tasks.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link to="/tasks/$taskId" params={{ taskId: t.id }} className="font-medium hover:text-primary">{t.title}</Link>
                  </TableCell>
                  <TableCell>{t.city}</TableCell>
                  <TableCell>{bdt(t.budget)}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        removeTask(t.id);
                        toast.success("Task removed.");
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="reports" className="mt-4 space-y-3">
          {db.reports.length === 0 && <p className="text-sm text-muted-foreground">No reports submitted.</p>}
          {db.reports.map((r) => {
            const reporter = db.users.find((u) => u.id === r.reporterId);
            return (
              <div key={r.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold">{r.category} · <span className="text-sm font-normal text-muted-foreground">{r.targetType}</span></p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Reported by {reporter?.name} · {dateLabel(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "OPEN" ? "destructive" : "secondary"}>{r.status}</Badge>
                  {r.status === "OPEN" && (
                    <>
                      <Button size="sm" onClick={() => { resolveReport(r.id, "REVIEWED"); toast.success("Report marked as reviewed."); }}>Mark reviewed</Button>
                      <Button size="sm" variant="outline" onClick={() => { resolveReport(r.id, "DISMISSED"); toast.success("Report dismissed."); }}>Dismiss</Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="verifications" className="mt-4 space-y-3">
          {db.users.map((u) => (
            <div key={u.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-9"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name.slice(0, 2)}</AvatarFallback></Avatar>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{u.verification.replace("_", " ")}</Badge>
                <Button size="sm" onClick={() => { setVerification(u.id, "VERIFIED"); toast.success(`${u.name} verified.`); }}>
                  <ShieldCheck size={14} /> Verify
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setVerification(u.id, "NOT_VERIFIED"); toast.success("Verification revoked."); }}>
                  Revoke
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="transactions" className="card-surface mt-4 overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Task</TableHead><TableHead>Amount</TableHead><TableHead>Fee</TableHead><TableHead>Total</TableHead><TableHead>Method</TableHead><TableHead>Date</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {db.payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{db.tasks.find((t) => t.id === p.taskId)?.title ?? "—"}</TableCell>
                  <TableCell>{bdt(p.amount)}</TableCell>
                  <TableCell>{bdt(p.serviceFee)}</TableCell>
                  <TableCell className="font-semibold">{bdt(p.total)}</TableCell>
                  <TableCell>{p.method}</TableCell>
                  <TableCell>{dateLabel(p.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
