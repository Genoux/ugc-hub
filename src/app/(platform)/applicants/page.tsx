"use client";

import { useQuery } from "@tanstack/react-query";
import { getApplicants } from "@/features/applicants/actions/get-applicants";
import { ApplicantsClient } from "@/features/applicants/components/applicants-client";
import { PageLoader } from "@/shared/components/layout/page-loader";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

export default function ApplicantsPage() {
  const { data: creators, isLoading } = useQuery({
    queryKey: platformQueryKeys.applicants,
    queryFn: getApplicants,
  });

  if (isLoading) return <PageLoader />;

  return <ApplicantsClient creators={creators ?? []} />;
}
