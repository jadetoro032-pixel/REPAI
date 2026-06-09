import { describe, expect, it } from "vitest";
import { createCallStateTracker } from "../src/server/callStateTracker.js";

describe("call state tracker", () => {
  it("stores recent call state transitions with timestamps", () => {
    const tracker = createCallStateTracker(() => "2026-06-09T17:30:00.000Z");

    tracker.record({
      callId: "call-1",
      state: "establishing",
      action: "waiting_for_established",
    });
    tracker.record({
      callId: "call-1",
      state: "established",
      action: "played_opening",
    });

    expect(tracker.list()).toEqual([
      {
        callId: "call-1",
        state: "established",
        action: "played_opening",
        updatedAt: "2026-06-09T17:30:00.000Z",
        timeline: [
          {
            state: "establishing",
            action: "waiting_for_established",
            at: "2026-06-09T17:30:00.000Z",
          },
          {
            state: "established",
            action: "played_opening",
            at: "2026-06-09T17:30:00.000Z",
          },
        ],
      },
    ]);
  });

  it("ignores webhook notifications that do not include a call id", () => {
    const tracker = createCallStateTracker();

    tracker.record({ action: "no_call_data" });

    expect(tracker.list()).toEqual([]);
  });
});
