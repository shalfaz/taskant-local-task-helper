import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Upload, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AntLogo } from "@/components/AntLogo";
import { useStore } from "@/lib/store";
import { DIVISIONS } from "@/lib/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your TaskAnt account" },
      { name: "description", content: "Register on TaskAnt to post local tasks or earn money completing tasks near you." },
      { property: "og:title", content: "Create your TaskAnt account" },
      { property: "og:description", content: "Join Bangladesh's on-demand local task marketplace." },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(3, "Full name must be at least 3 characters").max(60),
  email: z.string().trim().email("Enter a valid email address").max(120),
  phone: z.string().trim().regex(/^(\+88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number"),
  password: z.string().min(6, "Password must be at least 6 characters").max(64),
  city: z.string().min(1, "Select your city"),
});

const CITIES = Object.entries(DIVISIONS).flatMap(([div, cities]) => cities.map((c) => ({ div, city: c })));

function RegisterPage() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "Dhaka",
    role: "poster" as "poster" | "worker",
    avatar: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("Please choose an image under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("avatar", String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    const division = CITIES.find((c) => c.city === form.city)?.div ?? "Dhaka";
    const res = register({ ...form, division });
    if (!res.ok) {
      setErrors({ email: res.error ?? "Registration failed." });
      return;
    }
    toast.success("Account created. Welcome to TaskAnt!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="bg-hero">
      <div className="mx-auto max-w-lg px-4 py-14">
        <div className="card-surface p-7">
          <div className="flex flex-col items-center text-center">
            <AntLogo className="size-12" />
            <h1 className="mt-4 text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Small Tasks. Big Impact.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage src={form.avatar} alt="Profile preview" />
                <AvatarFallback>{form.name.slice(0, 2) || "TA"}</AvatarFallback>
              </Avatar>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
                <Upload size={15} /> Profile photo
                <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              </label>
            </div>

            <Field label="Full Name" error={errors["name"]}>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Nusrat Jahan" />
            </Field>
            <Field label="Email" error={errors["email"]}>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Phone" error={errors["phone"]}>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="01XXXXXXXXX" />
            </Field>
            <Field label="Password" error={errors["password"]}>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="pr-10"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field label="City / District" error={errors["city"]}>
              <Select value={form.city} onValueChange={(v) => set("city", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c.city} value={c.city}>
                      {c.city} <span className="text-muted-foreground">· {c.div}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="space-y-2">
              <Label>I mainly want to…</Label>
              <RadioGroup
                value={form.role}
                onValueChange={(v) => set("role", v)}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { v: "poster", t: "Post tasks", d: "I need help somewhere" },
                  { v: "worker", t: "Complete tasks", d: "I want to earn locally" },
                ].map((o) => (
                  <label
                    key={o.v}
                    className={`cursor-pointer rounded-xl border p-3 text-sm ${form.role === o.v ? "border-primary bg-primary-soft" : ""}`}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <RadioGroupItem value={o.v} /> {o.t}
                    </span>
                    <span className="mt-1 block pl-6 text-xs text-muted-foreground">{o.d}</span>
                  </label>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                You can post and complete tasks with the same account at any time.
              </p>
            </div>

            <Button type="submit" className="w-full">
              <UserPlus /> Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
