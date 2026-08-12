import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Banknote,
  Bell,
  CheckCircle2,
  Clock,
  ListChecks,
  MessageSquare,
  PlusCircle,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState, RequireAuth } from "@/components/RequireAuth";
import { matchScore, useStore } from "@/lib/store";
import { bdt, dateLabel, timeAgo } from "@/lib/format";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TaskAnt" },
      {
        name: "description",
        content: "Track your active tasks, bids, earnings, messages and notifications on TaskAnt.",
      },
      { property: "og:title", content: "Dashboard — TaskAnt" },
      { property: "og:description", content: "Your TaskAnt control centre." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

function Dashboard() {
  const { db, currentUser } = useStore();
  const me = currentUser!;

  const postedTasks = db.tasks.filter((t) => t.posterId === me.id);
  const workingTasks = db.tasks.filter((t) => t.workerId === me.id);
  const isWorkerView = me.role === "worker";

  const activePoster = postedTasks.filter((t) =>
    ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CONFIRMED"].includes(t.status),
  );
  const pendingPoster = postedTasks.filter((t) => ["OPEN", "BIDDING"].includes(t.status));
  const donePoster = postedTasks.filter((t) => t.status === "PAID");

  const activeWorker = workingTasks.filter((t) =>
    ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CONFIRMED"].includes(t.status),
  );
  const doneWorker = workingTasks.filter((t) => t.status === "PAID");
  const available = db.tasks.filter(
    (t) => !t.workerId && ["OPEN", "BIDDING"].includes(t.status) && t.posterId !== me.id,
  );

  const recommended = [...available]
    .map((t) => ({ task: t, score: matchScore(me, t) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const notifications = db.notifications.filter((n) => n.userId === me.id).slice(0, 5);
  const myConversations = db.conversations
    .filter((c) => c.participants.includes(me.id))
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 4);

  const earnings = db.payments.filter((p) => p.workerId === me.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={me.avatar} />
            <AvatarFallback>{me.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-extrabold">Welcome back, {me.name.split(" ")[0]}</h1>
            <p className="text-sm capitalize text-muted-foreground">
              {me.role} account · {me.city}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/tasks">
              <Search /> Find tasks
            </Link>
          </Button>
          <Button asChild>
            <Link to="/post-task">
              <PlusCircle /> Post a task
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isWorkerView ? (
          <>
            <StatCard
              icon={Search}
              label="Available Tasks"
              value={String(available.length)}
              tone="primary"
            />
            <StatCard
              icon={Activity}
              label="Active Tasks"
              value={String(activeWorker.length)}
              tone="warning"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed Tasks"
              value={String(doneWorker.length + me.completedTasks)}
              tone="success"
            />
            <StatCard
              icon={Banknote}
              label="Total Earnings"
              value={bdt(me.earnings)}
              tone="success"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={Activity}
              label="Active Tasks"
              value={String(activePoster.length)}
              tone="primary"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed Tasks"
              value={String(donePoster.length)}
              tone="success"
            />
            <StatCard
              icon={Clock}
              label="Pending Tasks"
              value={String(pendingPoster.length)}
              tone="warning"
            />
            <StatCard
              icon={Wallet}
              label="Total Spending"
              value={bdt(me.spending)}
              tone="primary"
            />
          </>
        )}
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {isWorkerView ? (
            <>
              <Panel title="Recommended Tasks" icon={Sparkles}>
                {recommended.length === 0 ? (
                  <EmptyState
                    title="No matching tasks right now"
                    description="Check back soon or browse the full marketplace."
                  />
                ) : (
                  <ul className="space-y-3">
                    {recommended.map(({ task, score }) => (
                      <TaskRow key={task.id} task={task} badge={`${score}% Match`} />
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="My Active Tasks" icon={ListChecks}>
                <TaskList tasks={activeWorker} empty="You have no tasks in progress." />
              </Panel>
              <Panel title="Recent Earnings" icon={Banknote}>
                {earnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No earnings yet — complete a task to get paid.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {earnings.slice(0, 5).map((p) => {
                      const t = db.tasks.find((x) => x.id === p.taskId);
                      return (
                        <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                          <span className="truncate pr-3">{t?.title ?? "Task"}</span>
                          <span className="shrink-0 font-semibold text-success">
                            +{bdt(p.amount)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>
            </>
          ) : (
            <>
              <Panel title="My Active Tasks" icon={ListChecks}>
                <TaskList tasks={activePoster} empty="No active tasks. Post one to get started." />
              </Panel>
              <Panel title="Recent Tasks" icon={Clock}>
                <TaskList tasks={postedTasks.slice(0, 5)} empty="You haven't posted a task yet." />
              </Panel>
            </>
          )}
        </div>

        <div className="space-y-6">
          <Panel
            title="Recent Messages"
            icon={MessageSquare}
            action={
              <Link to="/messages" className="text-xs font-medium text-primary hover:underline">
                Open chat
              </Link>
            }
          >
            {myConversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <ul className="space-y-3">
                {myConversations.map((c) => {
                  const other = db.users.find(
                    (u) => u.id === c.participants.find((p) => p !== me.id),
                  )!;
                  const last = [...db.messages].reverse().find((m) => m.conversationId === c.id);
                  return (
                    <li key={c.id} className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={other?.avatar} />
                        <AvatarFallback>{other?.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{other?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {last?.text ?? "Say hello 👋"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Notifications"
            icon={Bell}
            action={
              <Link
                to="/notifications"
                className="text-xs font-medium text-primary hover:underline"
              >
                See all
              </Link>
            }
          >
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">You're all caught up.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning-foreground",
  } as const;
  return (
    <div className="card-surface flex items-center gap-4 p-5">
      <span className={`inline-flex size-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon size={16} className="text-primary" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function TaskList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  if (tasks.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-3">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </ul>
  );
}

function TaskRow({ task, badge }: { task: Task; badge?: string }) {
  return (
    <li>
      <Link
        to="/tasks/$taskId"
        params={{ taskId: task.id }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/50"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{task.title}</p>
          <p className="text-xs text-muted-foreground">
            {task.city} · {bdt(task.budget)} · due {dateLabel(task.deadline)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {badge && <Badge className="bg-success/15 text-success">{badge}</Badge>}
          <StatusBadge status={task.status} />
        </div>
      </Link>
    </li>
  );
}
