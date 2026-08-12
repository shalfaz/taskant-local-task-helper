import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  Clock,
  MessageSquare,
  PlusCircle,
  Search,
  ShieldCheck,
  Star,
  Timer,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How TaskAnt Works — Post, Match, Track, Pay" },
      { name: "description", content: "Learn how TaskAnt connects task posters with verified local workers across Bangladesh in four steps." },
      { property: "og:title", content: "How TaskAnt Works" },
      { property: "og:description", content: "Post, match, track and pay — the full TaskAnt workflow explained." },
    ],
  }),
  component: HowItWorks,
});

const POSTER = [
  { icon: PlusCircle, t: "Post your task", d: "Add the title, category, exact location, budget and deadline. Attach documents if needed." },
  { icon: Search, t: "Review bids", d: "Workers nearby bid with their price, timeline and a short message." },
  { icon: ShieldCheck, t: "Select a worker", d: "Compare ratings and completed tasks, then assign the task with one click." },
  { icon: MessageSquare, t: "Chat and track", d: "Follow the live status timeline: Assigned → In Progress → Completed." },
  { icon: Wallet, t: "Confirm and pay", d: "Confirm completion, release the demo payment and leave a rating." },
];

const WORKER = [
  { icon: Search, t: "Find nearby tasks", d: "Filter the marketplace by your city, category and budget range." },
  { icon: Timer, t: "Bid or accept", d: "Submit your price and estimated time, or accept at the posted budget." },
  { icon: CheckCircle2, t: "Complete the task", d: "Update the status as you go and share proof through chat." },
  { icon: Banknote, t: "Get paid", d: "Once the poster confirms, payment is released to your earnings." },
  { icon: Star, t: "Build your rating", d: "Great reviews push you higher in worker recommendations." },
];

function HowItWorks() {
  return (
    <div>
      <section className="bg-hero">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">How TaskAnt Works</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            TaskAnt is a marketplace for small, location-based tasks. Someone in Dhaka posts a task in Pabna; someone
            already in Pabna completes it. Everyone saves a journey.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/post-task"><PlusCircle /> Post a Task</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/tasks"><Search /> Find Tasks</Link></Button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2">
        <Column title="For Task Posters" items={POSTER} />
        <Column title="For Task Workers" items={WORKER} />
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="card-surface p-7">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Clock size={20} className="text-primary" /> Task status workflow</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Open", "Bidding", "Assigned", "In Progress", "Completed", "Confirmed", "Paid"].map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{s}</span>
                {i < 6 && <span className="text-muted-foreground">→</span>}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Both parties see the same timeline on the task page, so nobody has to ask "what's happening?".
          </p>
        </div>
      </section>
    </div>
  );
}

function Column({ title, items }: { title: string; items: { icon: React.ElementType; t: string; d: string }[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>
      <ol className="mt-5 space-y-4">
        {items.map((s, i) => (
          <li key={s.t} className="card-surface flex gap-4 p-5">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <s.icon size={18} />
            </span>
            <div>
              <h3 className="font-semibold">{i + 1}. {s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
