import type { KnowledgeDocument } from "../domain/types.js";

export function searchKnowledgeDocuments(
  documents: KnowledgeDocument[],
  query: string,
): KnowledgeDocument[] {
  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) {
    return documents;
  }

  return documents.filter((document) => {
    const haystack = `${document.title} ${document.source} ${document.body}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function createUploadedKnowledgeDocument(fileName: string): KnowledgeDocument {
  const normalizedName = fileName.trim() || "Untitled knowledge file";
  const id = `uploaded-${Date.now()}-${normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return {
    id,
    title: normalizedName,
    source: "Uploaded knowledge folder",
    body: `${normalizedName} was added to the demo knowledge folder. RepAI can use this approved source for meeting context once indexed.`,
  };
}
