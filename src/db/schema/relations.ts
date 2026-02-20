import { relations } from "drizzle-orm";
import { creatorPortfolioAssets } from "./assets/creator-portfolio-assets";
import { creatorProfileAssets } from "./assets/creator-profile-assets";
import { submissionAssets } from "./assets/submission-assets";
import { creatorCollaborations } from "./collaborations/creator-collaborations";
import { creatorSubmissions } from "./collaborations/creator-submissions";
import { creators } from "./core/creators";
import { submissions } from "./core/submissions";

export const submissionsRelations = relations(submissions, ({ many }) => ({
  creatorCollaborations: many(creatorCollaborations),
}));

export const creatorsRelations = relations(creators, ({ many }) => ({
  creatorCollaborations: many(creatorCollaborations),
  creatorProfileAssets: many(creatorProfileAssets),
  creatorPortfolioAssets: many(creatorPortfolioAssets),
}));

export const creatorCollaborationsRelations = relations(creatorCollaborations, ({ one, many }) => ({
  submission: one(submissions, {
    fields: [creatorCollaborations.submissionId],
    references: [submissions.id],
  }),
  creator: one(creators, {
    fields: [creatorCollaborations.creatorId],
    references: [creators.id],
  }),
  creatorSubmissions: many(creatorSubmissions),
  creatorPortfolioAssets: many(creatorPortfolioAssets),
}));

export const creatorSubmissionsRelations = relations(creatorSubmissions, ({ one, many }) => ({
  creatorCollaboration: one(creatorCollaborations, {
    fields: [creatorSubmissions.creatorCollaborationId],
    references: [creatorCollaborations.id],
  }),
  submissionAssets: many(submissionAssets),
}));

export const submissionAssetsRelations = relations(submissionAssets, ({ one }) => ({
  creatorSubmission: one(creatorSubmissions, {
    fields: [submissionAssets.creatorSubmissionId],
    references: [creatorSubmissions.id],
  }),
}));

export const creatorProfileAssetsRelations = relations(creatorProfileAssets, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorProfileAssets.creatorId],
    references: [creators.id],
  }),
}));

export const creatorPortfolioAssetsRelations = relations(creatorPortfolioAssets, ({ one }) => ({
  creatorCollaboration: one(creatorCollaborations, {
    fields: [creatorPortfolioAssets.creatorCollaborationId],
    references: [creatorCollaborations.id],
  }),
  creator: one(creators, {
    fields: [creatorPortfolioAssets.creatorId],
    references: [creators.id],
  }),
}));
