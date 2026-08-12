import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, CalendarClock, MapPin, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { useStore } from "@/lib/store";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/become-a-worker")({
  head: () => ({
    meta: [
      { title: "Become a TaskAnt Worker — Earn Locally" },
      {
        name: "description",
        content:
          "Earn money completing small local tasks in your own city on your own schedule with TaskAnt.",
      },
      { property: "og:title", content: "Become a TaskAnt Worker" },
      { property: "og:description", content: "Flexible local earning across Bangladesh." },
    ],
  }),
  component: BecomeAWorker,
});

const BENEFITS = [
  {
    icon: CalendarClock,
    t: "Work on your schedule",
    d: "Bid only on tasks that fit your day — no fixed shifts.",
  },
  {
    icon: MapPin,
    t: "Stay in your own area",
    d: "Tasks are matched to your city and declared service areas.",
  },
  {
    icon: Banknote,
    t: "Transparent earning",
    d: "You see the budget before bidding; payment is released on confirmation.",
  },
  {
    icon: ShieldCheck,
    t: "Protected by verification",
    d: "NID verification and ratings keep both sides accountable.",
  },
];

function BecomeAWorker() {
  const { db } = useStore();
  const topWorkers = db.users
    .filter((u) => u.role === "worker")
    .sort((a, b) => b.rating * b.completedTasks - a.rating * a.completedTasks)
    .slice(0, 3);

  return (
    <div>
      <section className="bg-hero">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-card">
            <Sparkles size={13} /> Flexible local earning
          </span>
          <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">Become a TaskAnt Worker</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Students, riders, freelancers and full-time errand runners use TaskAnt to earn from
            small tasks that are already on their route. Collect a certificate, receive a parcel,
            visit an office — get paid for it.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link to="/register">
              <UserPlus /> Join as a worker
            </Link>
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.t} className="card-surface p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <b.icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold">{b.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold">Top workers this month</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {topWorkers.map((w) => (
            <Link
              key={w.id}
              to="/profile/$userId"
              params={{ userId: w.id }}
              className="card-surface p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <Avatar className="mx-auto size-16">
                <AvatarImage src={w.avatar} />
                <AvatarFallback>{w.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <p className="mt-3 font-semibold">{w.name}</p>
              <p className="text-xs text-muted-foreground">{w.city}</p>
              <div className="mt-2 flex justify-center">
                <StarRating value={w.rating} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {w.completedTasks} tasks · {bdt(w.earnings)} earned
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
