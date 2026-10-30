import type { ApiBlock } from "./types";

function cells(line: string): string[] {
  return line
    .trim()
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));
}

export function parseApiSection(guide: string, heading: string, rowName?: string): ApiBlock[] {
  const section = guide.startsWith(`# ${heading}\n`)
    ? guide.slice(2)
    : guide.split(/^## /m).find((block) => block.startsWith(`${heading}\n`));
  if (!section) throw new Error(`Missing canonical API section: ${heading}`);
  const lines = section.slice(heading.length).trim().split("\n");
  const blocks: ApiBlock[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";
    if (!line) {
      index++;
      continue;
    }
    const subheading = /^(#{2,6}) (.+)$/.exec(line);
    if (subheading) {
      blocks.push({
        kind: "heading",
        level: subheading[1]?.length as 2 | 3 | 4 | 5 | 6,
        text: subheading[2] ?? "",
      });
      index++;
    } else if (line.startsWith("```")) {
      const code: string[] = [];
      while (++index < lines.length && !lines[index]?.startsWith("```"))
        code.push(lines[index] ?? "");
      blocks.push({ kind: "code", text: code.join("\n") });
      index++;
    } else if (line.startsWith("|")) {
      const headers = cells(line);
      const divider = cells(lines[++index] ?? "");
      if (!divider.every((cell) => /^:?-+:?$/.test(cell)))
        throw new Error(`Malformed API table: ${heading}`);
      const rows: string[][] = [];
      while (lines[++index]?.trim().startsWith("|")) {
        const row = cells(lines[index] ?? "");
        if (row.length !== headers.length) throw new Error(`Malformed API row: ${heading}`);
        if (!rowName || row[0]?.replaceAll("`", "") === rowName) rows.push(row);
      }
      if (rows.length) blocks.push({ kind: "table", headers, rows });
    } else {
      const paragraph = [line];
      while (
        lines[++index]?.trim() &&
        !lines[index]?.startsWith("|") &&
        !lines[index]?.startsWith("```") &&
        !/^#{2,6} /.test(lines[index] ?? "")
      )
        paragraph.push(lines[index] ?? "");
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    }
  }
  if (rowName && !blocks.some((block) => block.kind === "table"))
    throw new Error(`Missing canonical API row: ${rowName}`);
  if (!blocks.length) throw new Error(`Empty canonical API: ${heading} ${rowName ?? ""}`);
  return blocks;
}
