"use client";

import { XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";

export function PlatformDisclaimer() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 px-4 pb-6 z-50 pointer-events-none min-w-[368px]">
      <div className="pointer-events-auto max-w-md mx-auto">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, delay: 2 }}
          >
            <Alert className="shadow-hub flex items-center justify-between p-4 gap-2 rounded-4xl">
              <div className="flex items-center gap-4">
                <div>
                  <AlertTitle>Welcome to UGC Hub pre-alpha</AlertTitle>
                  <AlertDescription>Expect bugs and breaking changes.</AlertDescription>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setDismissed(true)}>
                Dismiss
              </Button>
            </Alert>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
