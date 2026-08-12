import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileUp, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/RequireAuth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Identity Verification — TaskAnt" },
      { name: "description", content: "Submit your NID or passport details to earn a verified badge on TaskAnt." },
      { property: "og:title", content: "Identity Verification — TaskAnt" },
      { property: "og:description", content: "Verified members win more tasks." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <VerificationPage />
    </RequireAuth>
  ),
});

const STATE = {
  VERIFIED: { icon: ShieldCheck, cls: "bg-success/15 text-success", text: "Your identity is verified. A badge is shown on your profile." },
  PENDING: { icon: ShieldQuestion, cls: "bg-warning/20 text-warning-foreground", text: "Your documents are under review by the admin team." },
  NOT_VERIFIED: { icon: ShieldAlert, cls: "bg-muted text-muted-foreground", text: "Verify your identity to win more tasks and build trust." },
} as const;

function VerificationPage() {
  const { currentUser, submitVerification } = useStore();
  const me = currentUser!;
  const [idType, setIdType] = useState("National ID (NID)");
  const [phone, setPhone] = useState(me.phone);
  const [fileName, setFileName] = useState("");
  const S = STATE[me.verification];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Identity Verification</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Verified members appear higher in worker recommendations and receive more bids.
      </p>

      <div className="card-surface mt-6 p-6">
        <div className="flex items-center gap-3">
          <span className={`inline-flex size-11 items-center justify-center rounded-xl ${S.cls}`}>
            <S.icon size={20} />
          </span>
          <div>
            <Badge className={S.cls}>{me.verification.replace("_", " ")}</Badge>
            <p className="mt-1 text-sm text-muted-foreground">{S.text}</p>
          </div>
        </div>

        {me.verification !== "VERIFIED" && (
          <form
            className="mt-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!fileName) {
                toast.error("Please attach a document image.");
                return;
              }
              submitVerification();
              toast.success("Verification submitted. An admin will review it shortly.");
            }}
          >
            <div className="space-y-2">
              <Label>ID type</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["National ID (NID)", "Passport", "Driving Licence", "Birth Certificate"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label>Verification document</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
                <FileUp size={16} /> {fileName || "Upload a photo of your document"}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Demo notice: files are never uploaded or stored — only the file name is kept in this browser session.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={me.verification === "PENDING"}>
              {me.verification === "PENDING" ? "Awaiting admin review" : "Submit for verification"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
