/** Fixture skin: documented facet and status custom properties only, scoped to a wrapper. */
export const skinFixture = {
  "--kb-facet-background": "var(--kb-color-bg)",
  "--kb-facet-background-active": "var(--kb-color-surface)",
  "--kb-facet-border": "var(--kb-color-border)",
  "--kb-facet-border-active": "var(--kb-color-info)",
  // Set the leaf tokens: aliases resolve at :root, so a wrapper override of --kb-facet-cut stops there.
  "--kb-facet-cut-start": "1.25rem",
  "--kb-facet-cut-end": "1.25rem",
  "--kb-facet-cut-edge": "var(--kb-color-info)",
  "--kb-facet-highlight": "var(--kb-color-border)",
  "--kb-facet-divider": "var(--kb-color-border)",
  "--kb-facet-padding": "var(--kb-space-5)",
  "--kb-facet-rail": "var(--kb-color-muted)",
  "--kb-facet-rail-active": "var(--kb-color-info)",
  "--kb-status-running": "var(--kb-color-info)",
} satisfies Record<`--kb-${"facet" | "status"}-${string}`, string>;
