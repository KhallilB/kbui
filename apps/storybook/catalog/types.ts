export type CodeSample = {
  code: string;
  tokens: CodeToken[];
  snippet: string;
  snippetTokens: CodeToken[];
};
export type SyntaxKind =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "tag"
  | "attribute"
  | "type"
  | "function";
export type CodeToken = [start: number, end: number, kind: SyntaxKind];
export type CatalogGroup = "Actions" | "Forms" | "Feedback" | "Layout";
export type ApiBlock =
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; text: string };
export type CatalogEntry = {
  id: string;
  name: string;
  group: CatalogGroup;
  description: string;
  apiHeading: string;
  api: ApiBlock[];
  stories: ({ id: string; name: string } & CodeSample)[];
  defaultStoryId: string;
  docsId: string;
};
