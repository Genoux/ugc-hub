"use client";

import { redirect } from "next/navigation";
import { use } from "react";
import { useSubmissionQuery } from "@/features/submissions/hooks/use-submissions-query";
import { SubmissionDetailClient } from "./client";

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useSubmissionQuery(id);

  if (isLoading) {
    return null;
  }

  if (!data?.submission) {
    redirect("/submissions");
  }

  return <SubmissionDetailClient submission={data.submission} folders={data.folders} />;
}
