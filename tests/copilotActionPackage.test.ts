import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("RepAI Copilot action package", () => {
  it("exposes a start-demo-call API action to the declarative agent", () => {
    const agent = JSON.parse(readFileSync("appPackageCombined/declarativeAgent.json", "utf8"));
    const plugin = JSON.parse(readFileSync("appPackageCombined/repai-call-plugin.json", "utf8"));
    const openapi = JSON.parse(readFileSync("appPackageCombined/repai-call-openapi.json", "utf8"));

    expect(agent.actions).toEqual([{ id: "repaiCallPlugin", file: "repai-call-plugin.json" }]);
    expect(plugin.runtimes[0]).toMatchObject({
      type: "OpenApi",
      auth: { type: "None" },
    });
    expect(plugin.functions[0].name).toBe("startDemoCall");
    expect(openapi.paths["/start-demo-call"].post.operationId).toBe("startDemoCall");
  });

  it("packages the plugin files referenced by the combined app", () => {
    expect(existsSync("appPackageCombined/repai-call-plugin.json")).toBe(true);
    expect(existsSync("appPackageCombined/repai-call-openapi.json")).toBe(true);
  });
});
