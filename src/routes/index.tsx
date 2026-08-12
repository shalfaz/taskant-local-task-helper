import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Clock,
  FileText,
  GraduationCap,
  Handshake,
  Home,
  MapPin,
  MessageSquareLock,
  Package,
  PlusCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  UserCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskAnt — Need a Task Done Somewhere You Can't Be?" },
      {
        name: "description",
        content:
          "Post local tasks in Dhaka, Pabna, Rajshahi and beyond, and let verified local workers complete them for you. Small Tasks. Big Impact.",
      },
      { property: "og:title", content: "TaskAnt — Need a Task Done Somewhere You Can't Be?" },
      { property: "og:description", content: "Bangladesh's on-demand local task and service marketplace." },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: PlusCircle, title: "Post Your Task", text: "Describe what you need, where it is, your budget and deadline." },
  { icon: Search, title: "Find a Local Worker", text: "Receive bids from verified people who are already in that city." },
  { icon: Timer, title: "Track the Task", text: "Chat in real time and follow a live status timeline." },
  { icon: Wallet, title: "Complete & Pay", text: "Confirm completion, release the demo payment and leave a rating." },
];

const CATS = [
  { icon: FileText, name: "Documents & Office" },
  { icon: Package, name: "Parcel & Delivery" },
  { icon: ShoppingBag, name: "Shopping" },
  { icon: MapPin, name: "Local Errands" },
  { icon: Home, name: "Home Services" },
  { icon: BriefcaseBusiness, name: "Business Tasks" },
  { icon: GraduationCap, name: "Education" },
  { icon: Sparkles, name: "Other" },
];

const WHY = [
  { icon: Clock, title: "Save Time", text: "No day-long bus journeys for a 20-minute errand." },
  { icon: MapPin, title: "Reduce Travel", text: "Get things done in any district without leaving your desk." },
  { icon: Handshake, title: "Local Assistance", text: "People who already know the office, market and route." },
  { icon: MessageSquareLock, title: "Secure Communication", text: "In-app chat keeps every agreement on record." },
  { icon: UserCheck, title: "Verified Users", text: "NID verification badges and community ratings." },
  { icon: Banknote, title: "Flexible Earning", text: "Workers earn from tasks that fit their own schedule." },
];

function Index() {
  const { db } = useStore();
  const featured = db.tasks.filter((t) => t.status === "OPEN" || t.status === "BIDDING").slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-card">
              <Sparkles size={13} /> Bangladesh's local task marketplace
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Need a Task Done <span className="bg-brand-gradient bg-clip-text text-transparent">Somewhere You Can't Be?</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Study, work or family keeping you in one city while an important task waits in another? Post it on
              TaskAnt and a trusted local person will collect the document, receive the parcel or visit the office
              on your behalf.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/post-task">
                  <PlusCircle /> Post a Task
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/tasks">
                  <Search /> Find Tasks
                </Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                ["64", "Districts covered"],
                [`${db.users.filter((u) => u.role === "worker").length * 128}+`, "Active workers"],
                ["4.8★", "Average rating"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl border bg-card/70 p-3 text-center shadow-card backdrop-blur">
                  <dt className="text-xl font-extrabold text-primary">{v}</dt>
                  <dd className="text-[11px] text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card-surface self-center p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live task preview</p>
            {featured[0] && <div className="mt-3"><TaskCard task={featured[0]} /></div>}
            <div className="mt-4 rounded-xl bg-primary-soft p-4">
              <p className="text-sm font-semibold text-primary">Demo accounts</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>poster@taskant.demo / 123456</li>
                <li>worker@taskant.demo / 123456</li>
                <li>admin@taskant.demo / 123456</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHead title="How It Works" subtitle="From posting to payment in four simple steps." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card-surface relative p-6">
              <span className="absolute right-5 top-4 text-4xl font-extrabold text-primary/10">{i + 1}</span>
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <s.icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHead title="Popular Task Categories" subtitle="Whatever the errand, someone nearby can do it." />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATS.map((c) => (
              <Link
                key={c.name}
                to="/tasks"
                search={{ category: c.name }}
                className="group rounded-xl border p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
              >
                <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-brand-gradient group-hover:text-primary-foreground">
                  <c.icon size={20} />
                </span>
                <p className="mt-3 text-sm font-semibold">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured tasks */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured Tasks</h2>
            <p className="mt-1 text-sm text-muted-foreground">Real tasks waiting for a local helper right now.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/tasks">
              Browse all tasks <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHead title="Why TaskAnt" subtitle="Built for the way people actually live and work in Bangladesh." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.title} className="flex gap-4 rounded-xl border p-5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <w.icon size={18} />
                </span>
                <div>
                  <h3 className="font-semibold">{w.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{w.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="overflow-hidden rounded-3xl bg-brand-gradient px-6 py-14 text-center text-primary-foreground shadow-lift">
          <ShieldCheck className="mx-auto mb-4 size-10 opacity-90" />
          <h2 className="text-3xl font-extrabold sm:text-4xl">Can't Be There? Let TaskAnt Handle It.</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Join thousands of posters and workers helping each other complete small but important tasks across
            Bangladesh.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/post-task">Post a Task</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/become-a-worker">Become a Worker</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-9 max-w-2xl">
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
    </div>
  );
}
