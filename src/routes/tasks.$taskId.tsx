import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Flag,
  Gavel,
  MapPin,
  MessageSquare,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StatusBadge } from "@/components/StatusBadge";
import { StarRating } from "@/components/StarRating";
import { ReportDialog } from "@/components/ReportDialog";
import { EmptyState } from "@/components/RequireAuth";
import { recommendedWorkers, SERVICE_FEE_RATE, useStore } from "@/lib/store";
import { bdt, dateLabel, timeAgo } from "@/lib/format";
import { STATUS_FLOW, type Payment, type TaskStatus } from "@/lib/types";

export const Route = createFileRoute("/tasks/$taskId")({
  head: () => ({
    meta: [
      { title: "Task Details — TaskAnt" },
      {
        name: "description",
        content: "View full task details, bids, location, budget and deadline on TaskAnt.",
      },
      { property: "og:title", content: "Task Details — TaskAnt" },
      {
        property: "og:description",
        content: "Review the task, submit a bid and chat with the poster.",
      },
    ],
  }),
  component: TaskDetails,
});

function TaskDetails() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { db, currentUser } = store;
  const task = db.tasks.find((t) => t.id === taskId);

  if (!task) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Task not found"
          description="This task may have been removed by its poster or by an admin."
          action={
            <Button asChild>
              <Link to="/tasks">Back to marketplace</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const poster = db.users.find((u) => u.id === task.posterId)!;
  const worker = db.users.find((u) => u.id === task.workerId);
  const bids = db.bids.filter((b) => b.taskId === task.id);
  const isPoster = currentUser?.id === task.posterId;
  const isWorker = currentUser?.id === task.workerId;
  const myBid = bids.find((b) => b.workerId === currentUser?.id);
  const payment = db.payments.find((p) => p.taskId === task.id);
  const myReview = db.reviews.find((r) => r.taskId === task.id && r.fromUserId === currentUser?.id);
  const recs = recommendedWorkers(db.users, task);

  const requireLogin = () => {
    toast.error("Please log in to continue.");
    navigate({ to: "/login" });
  };

  const message = (otherId: string) => {
    if (!currentUser) return requireLogin();
    store.openConversation(otherId, task.id);
    navigate({ to: "/messages" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/tasks" className="text-sm font-medium text-primary hover:underline">
        ← Back to marketplace
      </Link>

      <div className="mt-4 grid gap-7 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Header */}
          <section className="card-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge variant="secondary">{task.category}</Badge>
                <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{task.title}</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Posted {timeAgo(task.createdAt)}
                </p>
              </div>
              <StatusBadge status={task.status} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Stat icon={<Wallet size={15} />} label="Budget" value={bdt(task.budget)} />
              <Stat
                icon={<MapPin size={15} />}
                label="Location"
                value={`${task.city}, ${task.division}`}
              />
              <Stat
                icon={<CalendarClock size={15} />}
                label="Deadline"
                value={dateLabel(task.deadline)}
              />
            </div>

            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>

            <p className="mt-4 text-sm">
              <strong>Exact area:</strong> {task.area}
            </p>
            {task.instructions && (
              <p className="mt-2 rounded-lg bg-muted p-3 text-sm">
                <strong>Additional instructions:</strong> {task.instructions}
              </p>
            )}

            {task.skills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Required skills</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {task.skills.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {task.attachment && (
              <a
                href={task.attachment}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                <Paperclip size={14} /> View attachment
              </a>
            )}

            <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
              <ReportDialog
                targetType="task"
                targetId={task.id}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Flag size={14} /> Report this task
                  </Button>
                }
              />
            </div>
          </section>

          {/* Status timeline */}
          <section className="card-surface p-6">
            <h2 className="font-semibold">Task progress</h2>
            <StatusTimeline status={task.status} />
            <TaskActions task={task} isPoster={isPoster} isWorker={isWorker} />
          </section>

          {/* Bids */}
          <section className="card-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <Gavel size={16} /> Bids ({bids.length})
              </h2>
            </div>

            {bids.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No bids yet. Be the first to bid on this task.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {bids.map((bid) => {
                  const w = db.users.find((u) => u.id === bid.workerId)!;
                  return (
                    <li key={bid.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <Avatar className="size-10">
                            <AvatarImage src={w.avatar} alt={w.name} />
                            <AvatarFallback>{w.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link
                              to="/profile/$userId"
                              params={{ userId: w.id }}
                              className="flex items-center gap-1.5 font-semibold hover:text-primary"
                            >
                              {w.name}
                              {w.verification === "VERIFIED" && (
                                <BadgeCheck size={15} className="text-primary" />
                              )}
                            </Link>
                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                              <StarRating value={w.rating} size={11} /> {w.rating.toFixed(1)} ·{" "}
                              {w.completedTasks} tasks done · {w.city}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-primary">{bdt(bid.price)}</p>
                          <p className="text-xs text-muted-foreground">{bid.estimatedTime}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{bid.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            bid.status === "ACCEPTED"
                              ? "default"
                              : bid.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {bid.status}
                        </Badge>
                        {isPoster && bid.status === "PENDING" && task.status !== "ASSIGNED" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                store.acceptBid(bid.id);
                                toast.success(`${w.name} selected. Task is now assigned.`);
                              }}
                            >
                              <UserCheck size={14} /> Select this worker
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => message(w.id)}>
                              <MessageSquare size={14} /> Message
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Reviews */}
          {(task.status === "PAID" || task.status === "CONFIRMED") && (
            <section className="card-surface p-6">
              <h2 className="font-semibold">Reviews for this task</h2>
              <ul className="mt-3 space-y-3">
                {db.reviews
                  .filter((r) => r.taskId === task.id)
                  .map((r) => {
                    const from = db.users.find((u) => u.id === r.fromUserId)!;
                    return (
                      <li key={r.id} className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarImage src={from.avatar} />
                            <AvatarFallback>{from.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{from.name}</span>
                          <StarRating value={r.rating} size={12} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                      </li>
                    );
                  })}
                {db.reviews.filter((r) => r.taskId === task.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet for this task.</p>
                )}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card-surface p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Posted by
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={poster.avatar} alt={poster.name} />
                <AvatarFallback>{poster.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  to="/profile/$userId"
                  params={{ userId: poster.id }}
                  className="flex items-center gap-1.5 font-semibold hover:text-primary"
                >
                  {poster.name}
                  {poster.verification === "VERIFIED" && (
                    <BadgeCheck size={15} className="text-primary" />
                  )}
                </Link>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <StarRating value={poster.rating} size={11} /> {poster.rating.toFixed(1)} (
                  {poster.reviewCount}) · {poster.city}
                </p>
              </div>
            </div>
            {!isPoster && (
              <Button variant="outline" className="mt-4 w-full" onClick={() => message(poster.id)}>
                <MessageSquare size={15} /> Send Message
              </Button>
            )}
          </div>

          {/* Worker actions */}
          {!isPoster && task.status !== "PAID" && task.status !== "CANCELLED" && (
            <div className="card-surface p-6">
              <h3 className="font-semibold">Interested in this task?</h3>
              {!task.workerId ? (
                <div className="mt-4 space-y-3">
                  <BidDialog taskId={task.id} budget={task.budget} existing={!!myBid} />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (!currentUser) return requireLogin();
                      store.acceptTaskDirectly(task.id);
                      toast.success("You accepted this task at the posted budget.");
                    }}
                  >
                    <CheckCircle2 size={15} /> Accept at {bdt(task.budget)}
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  This task is already assigned to {worker?.name}.
                </p>
              )}
            </div>
          )}

          {/* Poster controls */}
          {isPoster && task.status !== "PAID" && task.status !== "CANCELLED" && (
            <div className="card-surface p-6">
              <h3 className="font-semibold">Poster controls</h3>
              <div className="mt-3 space-y-2">
                {worker && (
                  <Button variant="outline" className="w-full" onClick={() => message(worker.id)}>
                    <MessageSquare size={15} /> Message worker
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <XCircle size={15} /> Cancel task
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this task?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All pending bids will be rejected and the task will be removed from the
                        marketplace.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep task</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          store.cancelTask(task.id);
                          toast.success("Task cancelled.");
                        }}
                      >
                        Yes, cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {/* Payment summary */}
          {task.workerId && (
            <div className="card-surface p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <CircleDollarSign size={16} /> Payment
              </h3>
              <PaymentSummary amount={task.agreedAmount ?? task.budget} payment={payment} />
              {isPoster && task.status === "CONFIRMED" && (
                <PaymentDialog taskId={task.id} amount={task.agreedAmount ?? task.budget} />
              )}
              {task.status === "PAID" && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-success">
                  <ShieldCheck size={15} /> Demo payment completed
                </p>
              )}
            </div>
          )}

          {/* Review */}
          {task.status === "PAID" && (isPoster || isWorker) && !myReview && (
            <ReviewCard taskId={task.id} toUserId={(isPoster ? task.workerId : task.posterId)!} />
          )}

          {/* Recommended workers */}
          <div className="card-surface p-6">
            <h3 className="flex items-center gap-2 font-semibold">
              <Sparkles size={16} className="text-primary" /> Workers near this task
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Rule-based matching on location, skills, rating and completed tasks.
            </p>
            <ul className="mt-4 space-y-3">
              {recs.map(({ worker: w, score }) => (
                <li key={w.id} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarImage src={w.avatar} />
                    <AvatarFallback>{w.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/profile/$userId"
                      params={{ userId: w.id }}
                      className="truncate text-sm font-medium hover:text-primary"
                    >
                      {w.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {w.city} · {w.rating.toFixed(1)}★ · {w.completedTasks} tasks
                    </p>
                  </div>
                  <Badge className="bg-success/15 text-success">{score}% Match</Badge>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function StatusTimeline({ status }: { status: TaskStatus }) {
  if (status === "CANCELLED") {
    return <p className="mt-3 text-sm font-medium text-destructive">This task was cancelled.</p>;
  }
  const idx = STATUS_FLOW.indexOf(status);
  return (
    <ol className="mt-4 grid gap-3 sm:grid-cols-7">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= idx;
        return (
          <li key={s} className="flex items-center gap-2 sm:block">
            <span
              className={`flex size-7 items-center justify-center rounded-full text-[11px] font-bold ${
                done
                  ? "bg-brand-gradient text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-[11px] font-medium sm:mt-2 sm:block ${done ? "" : "text-muted-foreground"}`}
            >
              {s.replace("_", " ")}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function TaskActions({
  task,
  isPoster,
  isWorker,
}: {
  task: { id: string; status: TaskStatus };
  isPoster: boolean;
  isWorker: boolean;
}) {
  const { updateTaskStatus } = useStore();
  const act = (next: TaskStatus, msg: string) => {
    updateTaskStatus(task.id, next);
    toast.success(msg);
  };

  const buttons: React.ReactNode[] = [];
  if (isWorker && task.status === "ASSIGNED")
    buttons.push(
      <Button key="a" onClick={() => act("IN_PROGRESS", "Task marked as In Progress.")}>
        <ArrowRight size={15} /> Start task
      </Button>,
    );
  if (isWorker && task.status === "IN_PROGRESS")
    buttons.push(
      <Button
        key="b"
        onClick={() =>
          act("COMPLETED", "Task marked as Completed. Waiting for poster confirmation.")
        }
      >
        <CheckCircle2 size={15} /> Mark as completed
      </Button>,
    );
  if (isPoster && task.status === "COMPLETED")
    buttons.push(
      <Button key="c" onClick={() => act("CONFIRMED", "Completion confirmed. You can now pay.")}>
        <ShieldCheck size={15} /> Confirm completion
      </Button>,
    );

  if (buttons.length === 0) return null;
  return <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">{buttons}</div>;
}

function BidDialog({
  taskId,
  budget,
  existing,
}: {
  taskId: string;
  budget: number;
  existing: boolean;
}) {
  const { placeBid, currentUser } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(budget));
  const [time, setTime] = useState("Within 2 days");
  const [msg, setMsg] = useState("");

  const submit = () => {
    const p = Number(price);
    if (!p || p < 50) {
      toast.error("Enter a valid price (minimum ৳50).");
      return;
    }
    if (msg.trim().length < 10) {
      toast.error("Write a short message to the poster (at least 10 characters).");
      return;
    }
    placeBid(taskId, p, time, msg.trim());
    toast.success("Bid submitted! The poster has been notified.");
    setOpen(false);
    setMsg("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          onClick={(e) => {
            if (!currentUser) {
              e.preventDefault();
              toast.error("Please log in to bid.");
              navigate({ to: "/login" });
            }
          }}
        >
          <Gavel size={15} /> {existing ? "Update your bid" : "Submit a Bid"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit your bid</DialogTitle>
          <DialogDescription>
            Posted budget: {bdt(budget)}. Explain why you're the right person.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Proposed price (৳)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={50}
            />
          </div>
          <div className="space-y-2">
            <Label>Estimated completion time</Label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Within 2 days"
            />
          </div>
          <div className="space-y-2">
            <Label>Message to poster</Label>
            <Textarea
              rows={4}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              maxLength={400}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Submit bid</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentSummary({ amount, payment }: { amount: number; payment?: Payment | undefined }) {
  const fee = payment?.serviceFee ?? Math.round(amount * SERVICE_FEE_RATE);
  return (
    <dl className="mt-3 space-y-1.5 text-sm">
      <Row label="Agreed amount" value={bdt(amount)} />
      <Row label="Service fee (10%)" value={bdt(fee)} />
      <div className="border-t pt-1.5">
        <Row label="Total" value={bdt(amount + fee)} bold />
      </div>
      <Row label="Status" value={payment?.status === "PAID" ? "Paid (Demo)" : "Pending"} />
      {payment && <Row label="Method" value={payment.method} />}
    </dl>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold" : ""}`}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function PaymentDialog({ taskId, amount }: { taskId: string; amount: number }) {
  const { payTask } = useStore();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Payment["method"]>("bKash (Demo)");
  const [processing, setProcessing] = useState(false);

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      payTask(taskId, method);
      setProcessing(false);
      setOpen(false);
      toast.success("Demo payment successful — funds released to the worker.");
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 w-full">
          <CircleDollarSign size={15} /> Pay {bdt(amount + Math.round(amount * SERVICE_FEE_RATE))}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demo Payment</DialogTitle>
          <DialogDescription>
            No real money moves. This simulates a bKash / Nagad / SSLCommerz checkout for the
            university demo.
          </DialogDescription>
        </DialogHeader>
        <PaymentSummary amount={amount} />
        <RadioGroup
          value={method}
          onValueChange={(v) => setMethod(v as Payment["method"])}
          className="mt-2 space-y-2"
        >
          {(["bKash (Demo)", "Nagad (Demo)", "Card (Demo)"] as const).map((m) => (
            <label
              key={m}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${method === m ? "border-primary bg-primary-soft" : ""}`}
            >
              <RadioGroupItem value={m} /> {m}
            </label>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={pay} disabled={processing}>
            {processing ? "Processing…" : "Confirm Demo Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewCard({ taskId, toUserId }: { taskId: string; toUserId: string }) {
  const { addReview, db } = useStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const target = db.users.find((u) => u.id === toUserId);

  return (
    <div className="card-surface p-6">
      <h3 className="flex items-center gap-2 font-semibold">
        <Star size={16} className="text-warning" /> Rate {target?.name}
      </h3>
      <div className="mt-3">
        <StarRating value={rating} size={24} onChange={setRating} />
      </div>
      <Textarea
        className="mt-3"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={300}
        placeholder="How did it go?"
      />
      <Button
        className="mt-3 w-full"
        onClick={() => {
          if (comment.trim().length < 5) {
            toast.error("Please write a short comment.");
            return;
          }
          addReview(taskId, toUserId, rating, comment.trim());
          toast.success("Thanks! Your review has been posted.");
        }}
      >
        Submit review
      </Button>
    </div>
  );
}
