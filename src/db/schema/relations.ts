import { relations } from "drizzle-orm";
import { assets } from "./assets";
import { creatorFolders } from "./creator-folders";
import { creatorSubmissions } from "./creator-submissions";
import { creators } from "./creators";
import { submissions } from "./submissions";

export const submissionsRelations = relations(submissions, ({ many }) => ({
  creatorFolders: many(creatorFolders),
}));

export const creatorsRelations = relations(creators, ({ many }) => ({
  creatorFolders: many(creatorFolders),
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
}));

export const creatorSubmissionsRelations = relations(creatorSubmissions, ({ one, many }) => ({
  creatorFolder: one(creatorFolders, {
    fields: [creatorSubmissions.creatorFolderId],
    references: [creatorFolders.id],
  }),
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  creatorSubmission: one(creatorSubmissions, {
    fields: [assets.creatorSubmissionId],
    references: [creatorSubmissions.id],
  }),
}));
