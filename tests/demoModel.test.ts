import { describe, expect, it } from "vitest";
import { createUploadedKnowledgeDocument, searchKnowledgeDocuments } from "../src/ui/demoModel.js";
import type { KnowledgeDocument } from "../src/domain/types.js";

const documents: KnowledgeDocument[] = [
  {
    id: "wiki-launch",
    title: "Launch Readiness Wiki",
    source: "SharePoint Wiki",
    body: "Launch approval requires product, legal, and support readiness signoff.",
  },
  {
    id: "fabric-sales",
    title: "Fabric Sales Model",
    source: "Fabric IQ",
    body: "Renewal pipeline shows three open enterprise expansion opportunities.",
  },
];

describe("demo UI model", () => {
  it("searches fake knowledge folder documents by title, source, and body", () => {
    expect(searchKnowledgeDocuments(documents, "fabric")).toEqual([documents[1]]);
    expect(searchKnowledgeDocuments(documents, "legal signoff")).toEqual([documents[0]]);
    expect(searchKnowledgeDocuments(documents, "sharepoint")).toEqual([documents[0]]);
  });

  it("creates a safe fake uploaded knowledge document", () => {
    const uploaded = createUploadedKnowledgeDocument("Customer Escalation Playbook.pdf");

    expect(uploaded.id).toMatch(/^uploaded-/);
    expect(uploaded.title).toBe("Customer Escalation Playbook.pdf");
    expect(uploaded.source).toBe("Uploaded knowledge folder");
    expect(uploaded.body).toContain("Customer Escalation Playbook.pdf");
  });
});
