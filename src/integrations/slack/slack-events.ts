import type { ApplyFormInput } from "@/features/applicants/schemas";

const appUrl = `https://${
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_URL
}`;

export type SlackEvent =
  | (ApplyFormInput & { type: "creator_apply"; appliedAt: Date })
  | {
      type: "admin_closed_collab";
      collabId: string;
      creatorName: string;
      projectName: string;
      piecesOfContent: number;
      totalPaidCents: number;
    }
  | {
      type: "creator_profile_complete";
      creatorId: string;
      fullName: string;
      email?: string;
      profileImageUrl?: string;
    }
  | {
      type: "creator_uploaded_content";
      creatorName: string;
      projectName: string;
      submissionLabel: string;
    };

function header(text: string) {
  return { type: "header", text: { type: "plain_text", text, emoji: false } };
}

function fields(entries: { label: string; value: string }[]) {
  if (entries.length === 0) return null;
  return {
    type: "section",
    fields: entries.map(({ label, value }) => ({
      type: "mrkdwn",
      text: `*${label}*\n${value ?? ""}\n`,
    })),
  };
}

const divider = { type: "divider" };

export function buildSlackText(event: SlackEvent): string {
  switch (event.type) {
    case "creator_apply":
      return `New creator application: ${event.fullName} (${event.email}) — ${event.country}`;
    case "admin_closed_collab":
      return `Collaboration closed: ${event.creatorName} — ${event.projectName}`;
    case "creator_profile_complete":
      return `Creator profile completed: ${event.fullName}`;
    case "creator_uploaded_content":
      return `Content uploaded: ${event.creatorName} — ${event.projectName} · ${event.submissionLabel}`;
  }
}

export function buildSlackBlocks(event: SlackEvent): object[] {
  const blocks = (() => {
    switch (event.type) {
      case "creator_apply":
        return buildCreatorApplyBlocks(event);
      case "admin_closed_collab":
        return buildCollabClosedBlocks(event);
      case "creator_profile_complete":
        return buildProfileCompleteBlocks(event);
      case "creator_uploaded_content":
        return buildContentUploadedBlocks(event);
    }
  })();
  return blocks.filter((b): b is object => b != null);
}

function buildCreatorApplyBlocks(
  event: Extract<SlackEvent, { type: "creator_apply" }>,
): (object | null)[] {
  const socials = [
    event.instagram_url && `<${event.instagram_url}|Instagram>`,
    event.tiktok_url && `<${event.tiktok_url}|TikTok>`,
    event.youtube_url && `<${event.youtube_url}|YouTube>`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return [
    header("✦ New Creator Application"),
    fields([
      { label: "Name", value: event.fullName },
      { label: "Country", value: event.country },
    ]),
    fields([
      { label: "Email", value: event.email },
      ...(event.languages?.length
        ? [{ label: "Languages", value: event.languages.join(", ") }]
        : []),
    ]),
    ...(socials || event.portfolioUrl
      ? [
          fields([
            ...(socials ? [{ label: "Socials", value: socials }] : []),
            ...(event.portfolioUrl
              ? [{ label: "Portfolio", value: `<${event.portfolioUrl}|View>` }]
              : []),
          ]),
        ].filter(Boolean)
      : []),
    divider,
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Applicants" },
          url: `${appUrl}/applicants`,
        },
      ],
    },
  ];
}

function buildCollabClosedBlocks(
  event: Extract<SlackEvent, { type: "admin_closed_collab" }>,
): (object | null)[] {
  return [
    header("◈ Collaboration Closed"),
    divider,
    fields([
      { label: "Creator", value: event.creatorName },
      { label: "Project", value: event.projectName },
    ]),
    fields([
      { label: "Pieces delivered", value: String(event.piecesOfContent) },
      { label: "Total paid", value: `$${(event.totalPaidCents / 100).toFixed(2)}` },
    ]),
    divider,
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Submissions" },
          url: `${appUrl}/submissions`,
        },
      ],
    },
  ];
}

function buildProfileCompleteBlocks(
  event: Extract<SlackEvent, { type: "creator_profile_complete" }>,
): object[] {
  const contextImage =
    event.profileImageUrl?.startsWith("https://") && event.profileImageUrl.length <= 3000
      ? { type: "image" as const, image_url: event.profileImageUrl, alt_text: event.fullName }
      : null;

  return [
    header("◉ Profile Completed"),
    {
      type: "context",
      elements: [
        ...(contextImage ? [contextImage] : []),
        { type: "mrkdwn", text: `*${event.fullName}* has completed their profile.` },
      ],
    },
    divider,
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Creator" },
          url: `${appUrl}/database/${event.creatorId}`,
        },
      ],
    },
  ];
}

function buildContentUploadedBlocks(
  event: Extract<SlackEvent, { type: "creator_uploaded_content" }>,
): (object | null)[] {
  return [
    header("⬡ Content Uploaded"),
    fields([
      { label: "Creator", value: event.creatorName },
      { label: "Project", value: event.projectName },
      { label: "Submission", value: event.submissionLabel },
    ]),
    divider,
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Submissions" },
          url: `${appUrl}/submissions`,
        },
      ],
    },
  ];
}
