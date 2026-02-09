'use server'

import { db } from '@/shared/lib/db'
import { submissions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { reviewSubmissionSchema } from '../schemas'
import { z } from 'zod'

export async function approveSubmission(submissionId: string) {
  const [submission] = await db.update(submissions)
    .set({
      status: 'approved',
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId))
    .returning()

  if (submission) {
    revalidatePath(`/campaigns/${submission.campaignId}/submissions`)
    revalidatePath(`/campaigns/${submission.campaignId}/submissions/${submissionId}`)
  }

  return submission
}

export async function rejectSubmission(submissionId: string) {
  const [submission] = await db.update(submissions)
    .set({
      status: 'rejected',
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId))
    .returning()

  if (submission) {
    revalidatePath(`/campaigns/${submission.campaignId}/submissions`)
    revalidatePath(`/campaigns/${submission.campaignId}/submissions/${submissionId}`)
  }

  return submission
}
