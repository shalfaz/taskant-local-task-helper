import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";

const CATEGORIES = ["Fraud", "Scam", "Fake Identity", "Inappropriate Content", "Payment Issue", "Other"];

export function ReportDialog({
  targetType,
  targetId,
  trigger,
}: {
  targetType: "task" | "user";
  targetId: string;
  trigger: ReactNode;
}) {
  const { submitReport, currentUser } = useStore();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]!);
  const [details, setDetails] = useState("");

  const submit = () => {
    if (!currentUser) {
      toast.error("Please log in to submit a report.");
      return;
    }
    if (details.trim().length < 10) {
      toast.error("Please describe the issue (at least 10 characters).");
      return;
    }
    submitReport({ targetType, targetId, category, details: details.trim() });
    toast.success("Report submitted. Our admin team will review it.");
    setDetails("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
          <DialogDescription>
            Help keep TaskAnt safe. Reports are reviewed by the admin team and never shown to the reported user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Report category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>What happened?</Label>
            <Textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={600}
              placeholder="Describe the issue with as much detail as possible…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={submit}>Submit report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
