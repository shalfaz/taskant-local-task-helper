import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Flag,
  MapPin,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { ReportDialog } from "@/components/ReportDialog";
import { EmptyState } from "@/components/RequireAuth";
import { TaskCard } from "@/components/TaskCard";
import { useStore } from "@/lib/store";
import { bdt, dateLabel } from "@/lib/format";

export const Route = createFileRoute("/profile/$userId")({
  head: () => ({
    meta: [
      { title: "User Profile — TaskAnt" },
      { name: "description", content: "See ratings, reviews, completed tasks, skills and verification status." },
      { property: "og:title", content: "User Profile — TaskAnt" },
      { property: "og:description", content: "Trust profiles for every TaskAnt member." },
    ],
  }),
  component: ProfilePage,
});

const VERIF: Record<string, { label: string; cls: string; icon: typeof ShieldCheck }> = {
  VERIFIED: { label: "Verified", cls: "bg-success/15 text-success", icon: ShieldCheck },
  PENDING: { label: "Verification pending", cls: "bg-warning/20 text-warning-foreground", icon: ShieldAlert },
  NOT_VERIFIED: { label: "Not verified", cls: "bg-muted text-muted-foreground", icon: ShieldAlert },
};

function ProfilePage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const { db, currentUser, openConversation } = useStore();
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="User not found" action={<Button asChild><Link to="/tasks">Back to marketplace</Link></Button>} />
      </div>
    );
  }

  const reviews = db.reviews.filter((r) => r.toUserId === user.id);
  const postedTasks = db.tasks.filter((t) => t.posterId === user.id && t.status !== "CANCELLED").slice(0, 4);
  const isMe = currentUser?.id === user.id;
  const V = VERIF[user.verification]!;
  const completed = db.tasks.filter((t) => t.workerId === user.id && t.status === "PAID").length + user.completedTasks;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="card-surface overflow-hidden">
        <div className="h-28 bg-brand-gradient" />
        <div className="flex flex-wrap items-end gap-5 px-6 pb-6">
          <Avatar className="-mt-12 size-24 border-4 border-card">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold">
              {user.name}
              {user.verification === "VERIFIED" && <BadgeCheck className="text-primary" size={20} />}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={14} /> {user.city}, {user.division}</span>
              <span className="flex items-center gap-1"><CalendarDays size={14} /> Joined {dateLabel(user.joinedAt)}</span>
              <span className="flex items-center gap-1 capitalize"><Briefcase size={14} /> {user.role}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={V.cls}><V.icon size={13} className="mr-1" /> {V.label}</Badge>
            {isMe ? (
              <Button asChild variant="outline"><Link to="/verification">Manage verification</Link></Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!currentUser) {
                      toast.error("Log in to send a message.");
                      navigate({ to: "/login" });
                      return;
                    }
                    openConversation(user.id);
                    navigate({ to: "/messages" });
                  }}
                >
                  <MessageSquare size={15} /> Message
                </Button>
                <ReportDialog
                  targetType="user"
                  targetId={user.id}
                  trigger={<Button variant="ghost"><Flag size={15} /> Report</Button>}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <aside className="space-y-6">
          <div className="card-surface p-6">
            <h2 className="font-semibold">About</h2>
            <p className="mt-2 text-sm text-muted-foreground">{user.bio || "This member hasn't added a bio yet."}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Rating" value={`${user.rating.toFixed(1)} ★`} />
              <Metric label="Reviews" value={String(user.reviewCount)} />
              <Metric label="Completed" value={String(completed)} />
              {user.role === "worker" ? (
                <Metric label="Earnings" value={bdt(user.earnings)} />
              ) : (
                <Metric label="Spending" value={bdt(user.spending)} />
              )}
            </dl>
          </div>

          {user.role === "worker" && (
            <div className="card-surface p-6">
              <h2 className="font-semibold">Skills & service areas</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user.skills.length ? user.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>) : <p className="text-sm text-muted-foreground">No skills listed.</p>}
              </div>
              <h3 className="mt-4 text-sm font-semibold">Service categories</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.serviceCategories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
              </div>
              <h3 className="mt-4 text-sm font-semibold">Service areas</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={14} /> {user.serviceAreas.join(", ") || user.city}
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm">
                <Wallet size={14} className="text-primary" /> Total earned: <strong>{bdt(user.earnings)}</strong>
              </p>
            </div>
          )}
        </aside>

        <div className="space-y-6">
          <section className="card-surface p-6">
            <h2 className="font-semibold">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((r) => {
                  const from = db.users.find((u) => u.id === r.fromUserId);
                  return (
                    <li key={r.id} className="rounded-xl border p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8"><AvatarImage src={from?.avatar} /><AvatarFallback>{from?.name.slice(0, 2)}</AvatarFallback></Avatar>
                        <div>
                          <p className="text-sm font-medium">{from?.name}</p>
                          <StarRating value={r.rating} size={12} />
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">{dateLabel(r.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {postedTasks.length > 0 && (
            <section>
              <h2 className="mb-4 font-semibold">Tasks posted by {user.name.split(" ")[0]}</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {postedTasks.map((t) => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}
