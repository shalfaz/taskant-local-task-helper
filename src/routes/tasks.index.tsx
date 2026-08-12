import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, PlusCircle, SearchX, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/RequireAuth";
import { useStore } from "@/lib/store";
import { CATEGORIES, DIVISIONS } from "@/lib/types";

const ALL_CITIES = ["All cities", ...new Set(Object.values(DIVISIONS).flat())];

export const Route = createFileRoute("/tasks/")({
  validateSearch: (s: Record<string, unknown>) => ({
    category: typeof s["category"] === "string" ? s["category"] : undefined,
    city: typeof s["city"] === "string" ? s["city"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Local Tasks — TaskAnt Marketplace" },
      { name: "description", content: "Search and filter local tasks across Bangladesh by category, city, budget and deadline." },
      { property: "og:title", content: "Browse Local Tasks — TaskAnt Marketplace" },
      { property: "og:description", content: "Find paid local errands and document tasks near you." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const search = Route.useSearch();
  const { db } = useStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(search.category ?? "All categories");
  const [city, setCity] = useState(search.city ?? "All cities");
  const [budget, setBudget] = useState([0, 2000]);
  const [deadline, setDeadline] = useState("any");
  const [sort, setSort] = useState("newest");

  const results = useMemo(() => {
    const now = Date.now();
    const windowDays = deadline === "any" ? Infinity : Number(deadline);
    let list = db.tasks.filter((t) => t.status !== "CANCELLED");
    list = list.filter((t) => {
      const text = `${t.title} ${t.description} ${t.city} ${t.area}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (category !== "All categories" && t.category !== category) return false;
      if (city !== "All cities" && t.city !== city) return false;
      if (t.budget < budget[0]! || t.budget > budget[1]!) return false;
      const days = (new Date(t.deadline).getTime() - now) / 86400000;
      if (days > windowDays) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "budget-high") return b.budget - a.budget;
      if (sort === "budget-low") return a.budget - b.budget;
      if (sort === "deadline") return +new Date(a.deadline) - +new Date(b.deadline);
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [db.tasks, q, category, city, budget, deadline, sort]);

  const filters = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All categories">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {ALL_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label>Budget: ৳{budget[0]} – ৳{budget[1]}</Label>
        <Slider min={0} max={2000} step={50} value={budget} onValueChange={setBudget} />
      </div>
      <div className="space-y-2">
        <Label>Deadline within</Label>
        <Select value={deadline} onValueChange={setDeadline}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any time</SelectItem>
            <SelectItem value="2">2 days</SelectItem>
            <SelectItem value="7">1 week</SelectItem>
            <SelectItem value="30">1 month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setQ("");
          setCategory("All categories");
          setCity("All cities");
          setBudget([0, 2000]);
          setDeadline("any");
        }}
      >
        Reset filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Task Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {results.length} task{results.length === 1 ? "" : "s"} available across Bangladesh.
          </p>
        </div>
        <Button asChild>
          <Link to="/post-task"><PlusCircle /> Post a Task</Link>
        </Button>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[260px_1fr]">
        <aside className="card-surface hidden h-fit p-5 lg:block">
          <p className="mb-4 flex items-center gap-2 font-semibold"><Filter size={16} /> Filters</p>
          {filters}
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tasks, cities, offices…"
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="budget-high">Budget: high to low</SelectItem>
                <SelectItem value="budget-low">Budget: low to high</SelectItem>
                <SelectItem value="deadline">Deadline soonest</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden"><Filter size={16} /> Filters</Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-5">
                <SheetHeader className="px-0"><SheetTitle>Filters</SheetTitle></SheetHeader>
                {filters}
              </SheetContent>
            </Sheet>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>

          {results.length === 0 && (
            <div className="mt-6">
              <EmptyState
                icon={<SearchX size={32} />}
                title="No tasks match your filters"
                description="Try widening the budget range, choosing another city or clearing the search text."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
