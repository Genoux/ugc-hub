"use client";

import { Suspense } from "react";
import { CreatorDatabase } from "@/features/creators/components/admin/creator-database";
import { PageLoader } from "@/shared/components/layout/page-loader";

export default function DatabasePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CreatorDatabase />
    </Suspense>
  );
}
