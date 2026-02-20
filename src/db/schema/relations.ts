import { relations } from "drizzle-orm";
import { creatorPortfolioAssets } from "./assets/creator-portfolio-assets";
import { creatorProfileAssets } from "./assets/creator-profile-assets";
import { submissionAssets } from "./assets/submission-assets";
import { creatorFolders } from "./collaborations/creator-folders";
import { creatorSubmissions } from "./collaborations/creator-submissions";
import { creators } from "./core/creators";
import { submissions } from "./core/submissions";

export const submissionsRelations = relations(submissions, ({ many }) => ({
  creatorFolders: many(creatorFolders),
}));

export const creatorsRelations = relations(creators, ({ many }) => ({
  creatorFolders: many(creatorFolders),
  creatorProfileAssets: many(creatorProfileAssets),
  creatorPortfolioAssets: many(creatorPortfolioAssets),
}));

export const creatorFoldersRelations = relations(creatorFolders, ({ one, many }) => ({
  submission: one(submissions, {
    fields: [creatorFolders.submissionId],
    references: [submissions.id],
  }),
  creator: one(creators, {
    fields: [creatorFolders.creatorId],
    references: [creators.id],
  }),
  creatorSubmissions: many(creatorSubmissions),
  creatorPortfolioAssets: many(creatorPortfolioAssets),
}));

export const creatorSubmissionsRelations = relations(creatorSubmissions, ({ one, many }) => ({
  creatorFolder: one(creatorFolders, {
    fields: [creatorSubmissions.creatorFolderId],
    references: [creatorFolders.id],
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
  creatorFolder: one(creatorFolders, {
    fields: [creatorPortfolioAssets.creatorFolderId],
    references: [creatorFolders.id],
  }),
  creator: one(creators, {
    fields: [creatorPortfolioAssets.creatorId],
    references: [creators.id],
  }),
}));
