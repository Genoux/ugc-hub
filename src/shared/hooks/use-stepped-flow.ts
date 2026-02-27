"use client";

import { useRef, useState } from "react";

export function useSteppedFlow(totalSteps: number) {
  const [step, setStep] = useState(1);
  const directionRef = useRef<1 | -1>(1);

  function goToStep(next: number) {
    if (next < 1 || next > totalSteps) return;
    directionRef.current = next > step ? 1 : -1;
    setStep(next);
  }

  return { step, goToStep, directionRef } as const;
}
