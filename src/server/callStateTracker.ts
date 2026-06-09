export interface CallingNotificationSnapshot {
  callId?: string;
  state?: string;
  action: string;
}

export interface CallTimelineEntry {
  state?: string;
  action: string;
  at: string;
}

export interface TrackedCallState {
  callId: string;
  state?: string;
  action: string;
  updatedAt: string;
  timeline: CallTimelineEntry[];
}

export interface CallStateTracker {
  record(snapshot: CallingNotificationSnapshot): void;
  list(): TrackedCallState[];
}

export function createCallStateTracker(now: () => string = () => new Date().toISOString()): CallStateTracker {
  const calls = new Map<string, TrackedCallState>();

  return {
    record(snapshot) {
      if (!snapshot.callId) {
        return;
      }

      const at = now();
      const existing = calls.get(snapshot.callId);
      const timeline = [
        ...(existing?.timeline ?? []),
        { state: snapshot.state, action: snapshot.action, at },
      ];

      calls.set(snapshot.callId, {
        callId: snapshot.callId,
        state: snapshot.state,
        action: snapshot.action,
        updatedAt: at,
        timeline,
      });
    },
    list() {
      return [...calls.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },
  };
}
