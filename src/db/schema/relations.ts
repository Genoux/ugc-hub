import { relations } from "drizzle-orm";
import { assets } from "./assets";
import { campaigns } from "./campaigns";
import { links } from "./links";
import { submissions } from "./submissions";

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  links: many(links),
  submissions: many(submissions),
}));

export const linksRelations = relations(links, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [links.campaignId],
    references: [campaigns.id],
  }),
  submission: one(submissions, {
    fields: [links.id],
    references: [submissions.linkId],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [submissions.campaignId],
    references: [campaigns.id],
  }),
  link: one(links, {
    fields: [submissions.linkId],
    references: [links.id],
  }),
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  submission: one(submissions, {
    fields: [assets.submissionId],
    references: [submissions.id],
  }),
}));
