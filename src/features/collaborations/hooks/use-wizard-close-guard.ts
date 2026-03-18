"use client";

import { useEffect, useRef, useState } from "react";

interface UseWizardCloseGuardOptions {
  isResultStep: boolean;
  isPending: boolean;
  isUploading: boolean;
  hasChanges: () => boolean;
  onClose: () => void;
}

export function useWizardCloseGuard({
  isResultStep,
  isPending,
  isUploading,
  hasChanges,
  onClose,
}: UseWizardCloseGuardOptions) {
  const [confirmingClose, setConfirmingClose] = useState(false);
  const pendingCloseActionRef = useRef<(() => void) | null>(null);

  const handleRequestClose = () => {
    if (isResultStep || !hasChanges()) {
      onClose();
      return;
    }
    setConfirmingClose(true);
  };

  // Stable ref so the Escape effect doesn't capture stale closure
  const handleRequestCloseRef = useRef(handleRequestClose);
  handleRequestCloseRef.current = handleRequestClose;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isPending && !isUploading) {
        handleRequestCloseRef.current();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPending, isUploading]);

  const onAlertOpenChange = (open: boolean) => {
    setConfirmingClose(open);
    if (!open) {
      const action = pendingCloseActionRef.current;
      pendingCloseActionRef.current = null;
      setTimeout(() => action?.(), 250);
    }
  };

  const discardAndClose = () => {
    pendingCloseActionRef.current = onClose;
    setConfirmingClose(false);
  };

  return { confirmingClose, handleRequestClose, onAlertOpenChange, discardAndClose };
}
