"use client";

import { useParams, usePathname } from "next/navigation";
import { useSubmissionQuery } from "@/features/submissions/hooks/use-submissions-query";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { ThemeSwitcher } from "./theme-switcher";

export function SiteHeader() {
  const pathname = usePathname();
  const params = useParams();

  const isSubmissionDetail = pathname?.startsWith("/submissions/") && params?.id;
  const { data } = useSubmissionQuery(params?.id as string, { enabled: !!isSubmissionDetail });

  const title = isSubmissionDetail && data?.submission ? data.submission.name : "UGC Hub";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
