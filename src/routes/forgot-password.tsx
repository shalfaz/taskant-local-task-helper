import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AntLogo } from "@/components/AntLogo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — TaskAnt" },
      { name: "description", content: "Request a password reset link for your TaskAnt account." },
      { property: "og:title", content: "Reset your password — TaskAnt" },
      { property: "og:description", content: "Recover access to your TaskAnt account." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-hero">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="card-surface p-7 text-center">
          <AntLogo className="mx-auto size-12" />
          {sent ? (
            <>
              <MailCheck className="mx-auto mt-5 size-10 text-success" />
              <h1 className="mt-3 text-xl font-bold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for <strong>{email}</strong>, a reset link has been sent. (Demo mode: no real
                email is delivered — use the demo accounts to log in.)
              </p>
              <Button asChild className="mt-6 w-full">
                <Link to="/login">Back to login</Link>
              </Button>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-xl font-bold">Forgot your password?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email and we'll send you a reset link.
              </p>
              <form
                className="mt-6 space-y-4 text-left"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSent(true);
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="fp-email">Email</Label>
                  <Input id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">
                  <KeyRound /> Send reset link
                </Button>
              </form>
              <Link to="/login" className="mt-5 inline-block text-sm font-medium text-primary hover:underline">
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
