import { relations } from "drizzle-orm";
import { assets } from "./assets/assets";
import { collaborations } from "./collaborations/collaborations";
import { submissions } from "./collaborations/submissions";
import { creators } from "./core/creators";
import { projects } from "./core/projects";

export const projectsRelations = relations(projects, ({ many }) => ({
  collaborations: many(collaborations),
}));

export const creatorsRelations = relations(creators, ({ many }) => ({
  collaborations: many(collaborations),
}));

export const collaborationsRelations = relations(collaborations, ({ one, many }) => ({
  project: one(projects, {
    fields: [collaborations.projectId],
    references: [projects.id],
  }),
  creator: one(creators, {
    fields: [collaborations.creatorId],
    references: [creators.id],
  }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  collaboration: one(collaborations, {
    fields: [submissions.collaborationId],
    references: [collaborations.id],
  }),
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  submission: one(submissions, {
    fields: [assets.submissionId],
    references: [submissions.id],
  }),
}));
