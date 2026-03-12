export const platformQueryKeys = {
  applicants: (status: string, sort: string) => ["platform", "applicants", status, sort] as const,
  applicantsPrefix: ["platform", "applicants"] as const,
  applicantCounts: ["platform", "applicants", "counts"] as const,
  database: (filters: object, sort: string, search: string) =>
    ["platform", "database", filters, sort, search] as const,
  databasePrefix: ["platform", "database"] as const,
  projects: ["platform", "projects"] as const,
  projectDetail: (id: string) => ["platform", "project", id] as const,
  collaborationDetail: (projectId: string, collaborationId: string) =>
    ["platform", "collaboration", projectId, collaborationId] as const,
  creatorProfile: (id: string) => ["platform", "creator", id] as const,
} as const;
