export type ReleaseCopy = { title: string; highlights: string[]; upgrade?: string[] };

export const releaseNotes: Record<string, ReleaseCopy> = {
  "0.9.1": {
    title: "Clearer release notes and dark editor selections",
    highlights: [
      "Read the public summary of the components and editable examples introduced in 0.9.0.",
      "The selected editor mode stays readable in dark theme.",
    ],
  },
  "0.9.0": {
    title: "More components and editable examples",
    highlights: [
      "Build with native typography, responsive layouts, and resizable panels.",
      "Search and select options with Combobox and MultiSelect.",
      "Edit component examples in the catalog, with CSS and Tailwind starters.",
      "Segmented controls have sliding selections and primary or neutral colors.",
    ],
  },
  "0.8.0": {
    title: "A new look, in both themes",
    highlights: [
      "Monochrome surfaces, a persimmon accent, and deeper cards are now the defaults.",
      "Charts and status indicators have dedicated colors for current, visited, changed, and error states.",
    ],
  },
  "0.7.0": {
    title: "Easier styling and more flexible dialogs",
    highlights: [
      "Adjust surface depth, lighting, and motion with shared tokens.",
      "Compose themed dialogs with a header, body, and footer.",
      "The React package includes its stylesheet. Style components with classes, tokens, or Tailwind.",
      "Button labels stay readable in high-contrast mode.",
    ],
  },
  "0.6.0": {
    title: "Forms that do more",
    highlights: [
      "Let people select options, adjust quantities, and review files before uploading.",
      "Add icons and a clear action to search fields.",
      "Try components in the live catalog, with examples and code to take into your app.",
    ],
  },
  "0.5.0": {
    title: "Cards and responsive layouts",
    highlights: [
      "Group related content in Card and arrange it with Grid.",
      "A version check helps keep installed kbui packages in sync.",
    ],
  },
  "0.4.0": {
    title: "Labels that keep their case",
    highlights: ["Keep branch names and paths in their original case, even in monospace badges."],
  },
  "0.3.0": {
    title: "More components for everyday screens",
    highlights: [
      "Add messages, metrics, progress, tooltips, menus, and toolbars.",
      "Use plain badges and tune text sizes to suit your app.",
    ],
  },
  "0.2.0": {
    title: "Panels with more depth",
    highlights: ["Raised edges, recessed wells, and clearer dark surfaces for panels."],
    upgrade: [
      "Rename Facet to Panel in imports, types, class names, and CSS tokens.",
      "Remove cut and FacetCut, plus the old facet cut, corner, edge, and seam-active tokens. Use box-shadow values for custom shadows.",
    ],
  },
  "0.1.0": {
    title: "The first kbui release",
    highlights: [
      "Shared tokens, faceted panels, and status labels.",
      "React, CSS, and tokens ship together as matching packages.",
    ],
  },
};
