import type { MeetingBrief, UserProfile } from "../domain/types.js";

type TextWeight = "Bolder" | "Default" | "Lighter";
type TextSize = "Small" | "Default" | "Medium" | "Large";
type TextColor = "Default" | "Accent" | "Good" | "Warning" | "Attention";

interface AdaptiveTextBlock {
  type: "TextBlock";
  text: string;
  wrap?: boolean;
  weight?: TextWeight;
  size?: TextSize;
  color?: TextColor;
  spacing?: "None" | "Small" | "Default" | "Medium" | "Large";
}

interface AdaptiveFact {
  title: string;
  value: string;
}

interface AdaptiveFactSet {
  type: "FactSet";
  facts: AdaptiveFact[];
}

interface AdaptiveActionOpenUrl {
  type: "Action.OpenUrl";
  title: string;
  url: string;
}

type AdaptiveCardElement = AdaptiveTextBlock | AdaptiveFactSet;

export interface AdaptiveCard {
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json";
  type: "AdaptiveCard";
  version: "1.5";
  body: AdaptiveCardElement[];
  actions?: AdaptiveActionOpenUrl[];
}

export interface TeamsWebhookMessage {
  type: "message";
  attachments: Array<{
    contentType: "application/vnd.microsoft.card.adaptive";
    contentUrl: null;
    content: AdaptiveCard;
  }>;
}

export interface BriefAdaptiveCardOptions {
  meetingUrl?: string;
  reviewUrl?: string;
}

export function buildBriefAdaptiveCard(
  user: UserProfile,
  brief: MeetingBrief,
  followUpDraft: string,
  options: BriefAdaptiveCardOptions = {},
): AdaptiveCard {
  const actions = buildOpenUrlActions(options);

  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      textBlock(`${brief.meetingTitle} brief`, { size: "Large", weight: "Bolder" }),
      textBlock(`${user.delegateName} attended as ${user.displayName}'s delegate.`, {
        color: "Accent",
        weight: "Bolder",
      }),
      textBlock(brief.summary),
      factSet([
        { title: "Decisions", value: formatList(brief.decisions) },
        { title: "Action items", value: formatList(brief.actionItems) },
        { title: "Risks", value: formatList(brief.risks) },
      ]),
      textBlock("Suggested follow-up", { weight: "Bolder", spacing: "Medium" }),
      textBlock(followUpDraft),
      textBlock("Review-only: no commitment is sent until Jeremiah approves it.", {
        color: "Warning",
        size: "Small",
      }),
    ],
    ...(actions.length > 0 ? { actions } : {}),
  };
}

export function wrapAdaptiveCardForTeamsWebhook(card: AdaptiveCard): TeamsWebhookMessage {
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: card,
      },
    ],
  };
}

function buildOpenUrlActions(options: BriefAdaptiveCardOptions): AdaptiveActionOpenUrl[] {
  const actions: AdaptiveActionOpenUrl[] = [];

  if (options.reviewUrl) {
    actions.push({
      type: "Action.OpenUrl",
      title: "Review follow-up",
      url: options.reviewUrl,
    });
  }

  if (options.meetingUrl) {
    actions.push({
      type: "Action.OpenUrl",
      title: "Open meeting",
      url: options.meetingUrl,
    });
  }

  return actions;
}

function textBlock(
  text: string,
  options: Omit<AdaptiveTextBlock, "type" | "text" | "wrap"> = {},
): AdaptiveTextBlock {
  return {
    type: "TextBlock",
    text,
    wrap: true,
    ...options,
  };
}

function factSet(facts: AdaptiveFact[]): AdaptiveFactSet {
  return {
    type: "FactSet",
    facts,
  };
}

function formatList(items: string[]): string {
  if (items.length === 0) {
    return "None captured";
  }

  return items.map((item) => `- ${item}`).join("\n");
}
