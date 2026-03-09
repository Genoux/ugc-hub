export const platformQueryKeys = {
  applicants: ["platform", "applicants"] as const,
  database: ["platform", "database"] as const,
  projects: ["platform", "projects"] as const,
  projectDetail: (id: string) => ["platform", "project", id] as const,
  collaborationDetail: (projectId: string, collaborationId: string) =>
    ["platform", "collaboration", projectId, collaborationId] as const,
} as const;
