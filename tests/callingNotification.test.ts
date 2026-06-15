import { describe, expect, it } from "vitest";
import { parseCallingNotificationItem } from "../src/server/callingNotification.js";

describe("Teams calling notification parsing", () => {
  it("uses the resourceData id when Microsoft includes it", () => {
    expect(
      parseCallingNotificationItem({
        resourceData: {
          id: "call-id",
          state: "established",
        },
      }),
    ).toEqual({
      callId: "call-id",
      state: "established",
    });
  });

  it("extracts the call id from the Graph resource path when resourceData omits it", () => {
    expect(
      parseCallingNotificationItem({
        resource: "communications/calls/22005480-a1f0-43e3-9059-fd3146b48bb3",
        resourceData: {
          state: "established",
        },
      }),
    ).toEqual({
      callId: "22005480-a1f0-43e3-9059-fd3146b48bb3",
      state: "established",
    });
  });
});

