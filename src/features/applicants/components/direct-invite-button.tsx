"use client";

import { Mail, UserPlus } from "lucide-react";
import { useState } from "react";
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
import { directInvite } from "../actions/direct-invite";

export function DirectInviteButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }

    setIsLoading(true);
    try {
      const result = await directInvite({ email });
      if (!result.success) {
        if (result.error === "already_registered") {
          toast.error("This creator has already joined.");
        } else {
          toast.error("This email has already been invited or is already registered.");
        }
        return;
      }
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email.trim()) {
      e.preventDefault();
      handleSendEmail();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Invite by email
            </Label>
            <div className="flex gap-2">
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="creator@example.com"
                className="flex-1"
              />
              <Button onClick={handleSendEmail} disabled={!email.trim() || isLoading} size="sm">
                {isLoading ? "Sending..." : "Send invite"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              They'll receive an email invitation to join as a creator.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
