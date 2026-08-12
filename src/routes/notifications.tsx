import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, RequireAuth } from "@/components/RequireAuth";
import { useStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — TaskAnt" },
      { name: "description", content: "Bids, assignments, messages, payments and reviews — all your TaskAnt activity." },
      { property: "og:title", content: "Notifications — TaskAnt" },
      { property: "og:description", content: "Stay on top of every task update." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NotificationsPage />
    </RequireAuth>
  ),
});

function NotificationsPage() {
  const { db, currentUser, markAllNotificationsRead } = useStore();
  const list = db.notifications.filter((n) => n.userId === currentUser!.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Bell /> Notifications</h1>
        {list.some((n) => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <CheckCheck size={15} /> Mark all as read
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Nothing here yet" description="Activity on your tasks will show up in this feed." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((n) => {
            const body = (
              <div className={`card-surface p-4 ${n.read ? "" : "border-primary/40 bg-primary-soft/40"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.link?.startsWith("/tasks/") ? (
                  <Link to="/tasks/$taskId" params={{ taskId: n.link.replace("/tasks/", "") }}>{body}</Link>
                ) : n.link === "/messages" ? (
                  <Link to="/messages">{body}</Link>
                ) : n.link === "/admin" ? (
                  <Link to="/admin">{body}</Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
