"use client";

import { SubmissionList } from "@/features/submissions/components/submission-list";
import { useSubmissionsQuery } from "@/features/submissions/hooks/use-submissions-query";

export default function SubmissionsPage() {
  const { data: submissions, isLoading } = useSubmissionsQuery();

  if (isLoading) {
    return null;
  }

  if (!submissions) {
    return <div>Failed to load submissions</div>;
  }

  return (
    <div className="flex flex-col gap-6 flex-1 p-8">
      <SubmissionList submissions={submissions} />
    </div>
  );
}
