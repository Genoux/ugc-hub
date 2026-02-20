"use client";

import { Mail, UserPlus, Users } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { directInviteBulk } from "../actions/direct-invite-bulk";
import { directInvite } from "../actions/direct-invite";

type Mode = "single" | "bulk";

export function DirectInviteButton() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("single");
  const [email, setEmail] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setBulkText("");
    setMode("single");
  };

  const handleSingle = () => {
    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }

    startTransition(async () => {
      try {
        const result = await directInvite({ email: email.trim() });
        if (!result.success) {
          const messages = {
            already_exists:
              "This email is already in the system — use the applicants page instead.",
            already_invited_or_exists: "This email already has a Clerk account.",
          } as const;
          toast.error(
            (result.error ? messages[result.error] : undefined) ?? "Failed to send invitation",
          );
          return;
        }
        toast.success(`Invitation sent to ${email.trim()}`);
        handleClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send invitation");
      }
    });
  };

  const handleBulk = () => {
    const emails = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      toast.error("Please enter at least one email");
      return;
    }

    startTransition(async () => {
      try {
        const result = await directInviteBulk({ emails });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        const parts = [`${result.sent} invitation${result.sent !== 1 ? "s" : ""} sent`];
        if (result.skipped > 0) parts.push(`${result.skipped} skipped (already registered)`);
        toast.success(parts.join(" · "));
        handleClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send invitations");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          Direct Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Creator</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="single" className="flex-1 gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Single
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex-1 gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Bulk
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4 pt-1">
          {mode === "single" ? (
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && email.trim() && handleSingle()}
                  placeholder="creator@example.com"
                  className="flex-1"
                  disabled={isPending}
                />
                <Button onClick={handleSingle} disabled={!email.trim() || isPending} size="sm">
                  {isPending ? "Sending..." : "Send"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                They'll receive an email invitation to join as a creator.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="invite-bulk" className="text-sm font-medium">
                Email addresses
              </Label>
              <Textarea
                id="invite-bulk"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"creator1@example.com\ncreator2@example.com\ncreator3@example.com"}
                className="min-h-36 font-mono text-sm resize-none"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                One email per line · max 100 · already-registered emails are skipped
              </p>
              <Button
                onClick={handleBulk}
                disabled={!bulkText.trim() || isPending}
                className="w-full"
                size="sm"
              >
                {isPending
                  ? "Sending..."
                  : `Send ${bulkText.split("\n").filter((l) => l.trim()).length || ""} invitations`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
