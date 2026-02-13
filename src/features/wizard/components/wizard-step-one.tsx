"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useWizardState } from "../hooks/use-wizard-state";
import type { WizardStepOne as WizardStepOneData } from "../schemas";

export function WizardStepOne() {
  const { setStepOneData, setStep } = useWizardState();
  const [formData, setFormData] = useState<WizardStepOneData>({
    creatorName: "",
    creatorEmail: "",
  });

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setStepOneData(formData);
    setStep(2);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          required
          value={formData.creatorName}
          onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          type="email"
          id="email"
          required
          value={formData.creatorEmail}
          onChange={(e) => setFormData({ ...formData, creatorEmail: e.target.value })}
          placeholder="your@email.com"
        />
      </div>

      <Button type="submit" className="w-full">
        Next
      </Button>
    </form>
  );
}
