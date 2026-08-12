import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarClock, FileUp, Eye, PlusCircle, MapPin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/RequireAuth";
import { useStore } from "@/lib/store";
import { CATEGORIES, DIVISIONS, type Category } from "@/lib/types";
import { bdt, dateLabel } from "@/lib/format";

export const Route = createFileRoute("/post-task")({
  head: () => ({
    meta: [
      { title: "Post a Task — TaskAnt" },
      { name: "description", content: "Describe your task, set a budget and deadline, and get bids from verified local workers." },
      { property: "og:title", content: "Post a Task — TaskAnt" },
      { property: "og:description", content: "Publish a local task in minutes and get help where you can't be." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PostTaskPage />
    </RequireAuth>
  ),
});

const SKILL_OPTIONS = [
  "Document Collection",
  "Office Visit",
  "Courier Pickup",
  "Shopping",
  "Delivery",
  "Photography",
  "Bill Payment",
  "Inspection",
  "Packaging",
  "Document Handling",
];

function PostTaskPage() {
  const { createTask } = useStore();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0] as Category,
    description: "",
    division: "Rajshahi",
    city: "Pabna",
    area: "",
    budget: "",
    deadline: "",
    preferredGender: "Any" as "Any" | "Male" | "Female",
    skills: [] as string[],
    attachment: "",
    attachmentName: "",
    instructions: "",
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 8) e["title"] = "Give a clear title (at least 8 characters).";
    if (form.description.trim().length < 20) e["description"] = "Describe the task in at least 20 characters.";
    if (!form.area.trim()) e["area"] = "Add the exact place / area.";
    const b = Number(form.budget);
    if (!b || b < 50) e["budget"] = "Budget must be at least ৳50.";
    if (!form.deadline) e["deadline"] = "Choose a deadline.";
    else if (new Date(form.deadline).getTime() < Date.now()) e["deadline"] = "Deadline must be in the future.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("Attachment must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("attachment", String(reader.result));
      set("attachmentName", file.name);
    };
    reader.readAsDataURL(file);
  };

  const publish = () => {
    if (!validate()) {
      setPreview(false);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const task = createTask({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      division: form.division,
      city: form.city,
      area: form.area.trim(),
      budget: Number(form.budget),
      deadline: new Date(form.deadline).toISOString(),
      preferredGender: form.preferredGender,
      skills: form.skills,
      attachment: form.attachment || undefined,
      instructions: form.instructions.trim() || undefined,
    });
    toast.success("Task published! Workers nearby have been notified.");
    navigate({ to: "/tasks/$taskId", params: { taskId: task.id } });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Post a Task</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The more detail you give, the better the bids you receive.
      </p>

      <div className="mt-7 grid gap-7 lg:grid-cols-[1.4fr_1fr]">
        <form
          className="card-surface space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (validate()) setPreview(true);
          }}
        >
          <Field label="Task Title" error={errors["title"]}>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={100}
              placeholder="Collect Academic Certificate from Pabna Education Board"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => set("category", v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Preferred worker gender (optional)">
              <Select value={form.preferredGender} onValueChange={(v) => set("preferredGender", v as "Any")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Detailed Description" error={errors["description"]}>
            <Textarea
              rows={5}
              maxLength={1200}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Explain exactly what needs to be done, what documents are involved and any timing constraints…"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Division">
              <Select
                value={form.division}
                onValueChange={(v) => {
                  set("division", v);
                  set("city", DIVISIONS[v]![0]!);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(DIVISIONS).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="City / District">
              <Select value={form.city} onValueChange={(v) => set("city", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIVISIONS[form.division]!.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Exact Task Location / Area" error={errors["area"]}>
            <Input value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Education Board Office, Pabna Sadar" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Budget (৳)" error={errors["budget"]}>
              <Input type="number" min={50} value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="800" />
            </Field>
            <Field label="Deadline" error={errors["deadline"]}>
              <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            </Field>
          </div>

          <div className="space-y-2">
            <Label>Required skills</Label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((s) => {
                const active = form.skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      set("skills", active ? form.skills.filter((x) => x !== s) : [...form.skills, s])
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active ? "border-primary bg-primary-soft text-primary" : "hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attach image / document (optional)</Label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
              <FileUp size={16} />
              {form.attachmentName || "Choose a file (max 2MB)"}
              <input type="file" className="hidden" onChange={onFile} accept="image/*,.pdf" />
            </label>
          </div>

          <Field label="Additional instructions (optional)">
            <Textarea
              rows={3}
              maxLength={500}
              value={form.instructions}
              onChange={(e) => set("instructions", e.target.value)}
              placeholder="Call before entering the office, keep the document in a hard folder…"
            />
          </Field>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="outline"><Eye /> Preview task</Button>
            <Button type="button" onClick={publish}><PlusCircle /> Publish task</Button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {preview ? "Task preview" : "Live preview"}
            </p>
            <h3 className="mt-3 text-lg font-bold">{form.title || "Your task title appears here"}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{form.category}</Badge>
              {form.preferredGender !== "Any" && <Badge variant="outline">{form.preferredGender} preferred</Badge>}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {form.description || "Your detailed description will be shown to workers here."}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                {form.area ? `${form.area}, ` : ""}{form.city}, {form.division}
              </div>
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-primary" /> {form.budget ? bdt(Number(form.budget)) : "৳—"}
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock size={14} className="text-primary" />
                {form.deadline ? dateLabel(new Date(form.deadline).toISOString()) : "No deadline set"}
              </div>
            </dl>
            {form.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {form.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
              </div>
            )}
            {preview && (
              <Button className="mt-5 w-full" onClick={publish}>
                Looks good — publish
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
