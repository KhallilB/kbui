export type Release = {
  version: string;
  date: string;
  compareUrl?: string | undefined;
  breaking: string[];
  components: string[];
  improvements: string[];
  fixes: string[];
};
type Changes = Pick<Release, "breaking" | "components" | "improvements" | "fixes">;

const heading = /^## \[?([^\]\s]+)\]?(?:\(([^)]+)\))? \((\d{4}-\d{2}-\d{2})\)$/;
const entry = /^\* (?:\*\*([^*]+):\*\* )?(.+)$/;
const internalScopes = new Set(["build", "ci", "release", "test"]);
const sectionKind: Record<string, "breaking" | "feature" | "fixes"> = {
  "⚠ BREAKING CHANGES": "breaking",
  Features: "feature",
  "Performance Improvements": "feature",
  "Bug Fixes": "fixes",
};

// "add [adjectives] A, B and C [with …]" only; any unknown name keeps the line as plain text.
function addedComponents(text: string, known: ReadonlySet<string>): string[] {
  const match = /^add (?:[a-z]+ )*?([A-Z][\w, ]*?)(?: with .*)?$/.exec(text);
  const names = match?.[1]?.split(/, | and /) ?? [];
  return names.length && names.every((name) => known.has(name)) ? names : [];
}

const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function parseChangelog(markdown: string, components: readonly string[]): Release[] {
  const known = new Set(components);
  const releases: Release[] = [];
  let kind: (typeof sectionKind)[string] | undefined;
  for (const line of markdown.split("\n")) {
    const release = heading.exec(line);
    if (release) {
      const [, version = "", compareUrl, date = ""] = release;
      releases.push({
        version,
        date,
        compareUrl,
        breaking: [],
        components: [],
        improvements: [],
        fixes: [],
      });
      kind = undefined;
      continue;
    }
    if (line.startsWith("### ")) {
      kind = sectionKind[line.slice(4).trim()];
      continue;
    }
    const current = releases.at(-1);
    const change = entry.exec(line);
    if (!current || !kind || !change) continue;
    const [, scope = "", raw = ""] = change;
    if (scope.split(",").some((part) => internalScopes.has(part.trim()))) continue;
    const text = raw.replace(/\s*\(\[[0-9a-f]{7,}\]\(.*$/, "").trim();
    const added = kind === "feature" ? addedComponents(text, known) : [];
    const target =
      kind === "breaking"
        ? current.breaking
        : kind === "fixes"
          ? current.fixes
          : current.improvements;
    if (added.length) {
      for (const name of added)
        if (!current.components.includes(name)) current.components.push(name);
    } else if (!target.includes(sentence(text))) target.push(sentence(text));
  }
  return releases;
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function releaseHeadline({ components, improvements, fixes }: Changes): string {
  if (components.length) {
    if (components.length === 1) return components[0] ?? "";
    if (components.length === 2) return components.join(" and ");
    if (components.length === 3) return `${components.slice(0, 2).join(", ")} and ${components[2]}`;
    return `${components.slice(0, 3).join(", ")} and ${components.length - 3} more`;
  }
  if (improvements.length === 1 && !fixes.length) return improvements[0] ?? "";
  const counts = [
    improvements.length && plural(improvements.length, "improvement", "improvements"),
    fixes.length && plural(fixes.length, "fix", "fixes"),
  ].filter(Boolean);
  return counts.length ? counts.join(" and ") : "Maintenance";
}

export function releaseCounts({ components, improvements, fixes }: Changes): string {
  return [
    components.length && `${components.length} new`,
    improvements.length && plural(improvements.length, "improvement", "improvements"),
    fixes.length && plural(fixes.length, "fix", "fixes"),
  ]
    .filter(Boolean)
    .join(" · ");
}
