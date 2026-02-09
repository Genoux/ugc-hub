'use client'

type Submission = {
  id: string
  creatorName: string
  creatorEmail: string
  status: string
  createdAt: Date
}

export function SubmissionList({
  campaignId,
  submissions,
}: {
  campaignId: string
  submissions: Submission[]
}) {
  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold">Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="space-y-2">
          {submissions.map(submission => (
            <a
              key={submission.id}
              href={`/campaigns/${campaignId}/submissions/${submission.id}`}
              className="block rounded-lg border p-4 hover:border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{submission.creatorName}</h3>
                  <p className="text-sm text-gray-600">{submission.creatorEmail}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      submission.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : submission.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {submission.status}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
