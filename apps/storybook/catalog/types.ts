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
export type CatalogGroup = "Actions" | "Forms" | "Feedback" | "Layout" | "Typography";
export type ApiBlock =
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: 3 | 4 | 5 | 6; text: string }
  | { kind: "code"; text: string };
export type CatalogEntry = {
  id: string;
  name: string;
  group: CatalogGroup;
  description: string;
  apiHeading: string;
  api: ApiBlock[];
  stories: ({ id: string; name: string } & CodeSample)[];
  examples?: { id: string; name: string }[];
  defaultStoryId: string;
  docsId: string;
};

export type ComponentReference = {
  name: string;
  description: string;
  guide: import("./component-guides").ComponentGuide;
  tables: Extract<ApiBlock, { kind: "table" }>[];
};
