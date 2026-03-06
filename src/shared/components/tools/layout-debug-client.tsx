"use client";

import { LayoutDebug } from "layout-debug-tool";

/**
 * Wrapper so the debug tool paints above app UI (e.g. wizard z-50).
 * Package uses z-40 for overlays and z-50 for the button; without a stacking context
 * above the app, only BorderInspector (injected outline) is visible.
 */
export function LayoutDebugClient() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <div style={{ position: "fixed", zIndex: 9999 }}>
      <LayoutDebug />
    </div>
  );
}
