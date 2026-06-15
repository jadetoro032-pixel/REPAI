export interface ParsedCallingNotification {
  callId?: string;
  state?: string;
}

export function parseCallingNotificationItem(item: unknown): ParsedCallingNotification | null {
  if (typeof item !== "object" || item === null) {
    return null;
  }

  const notification = item as Record<string, unknown>;
  const resourceData = notification.resourceData;

  if (typeof resourceData !== "object" || resourceData === null) {
    return null;
  }

  const call = resourceData as Record<string, unknown>;
  const state = typeof call.state === "string" ? call.state : undefined;
  const callId =
    firstString(call.id) ??
    extractCallIdFromResource(firstString(notification.resource)) ??
    extractCallIdFromResource(firstString(notification.resourceUrl)) ??
    extractCallIdFromResource(firstString(call["@odata.id"])) ??
    extractCallIdFromResource(firstString(call.odataId));

  return { callId, state };
}

function firstString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function extractCallIdFromResource(resource?: string) {
  if (!resource) {
    return undefined;
  }

  const match = resource.match(/communications\/calls\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

