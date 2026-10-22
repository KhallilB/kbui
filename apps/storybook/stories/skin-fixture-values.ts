/** Fixture skin: documented panel and status custom properties only, scoped to a wrapper. */
export const skinFixture = {
  "--kb-panel-background": "var(--kb-color-bg)",
  "--kb-panel-background-active": "var(--kb-color-surface)",
  "--kb-panel-border": "var(--kb-color-border)",
  "--kb-panel-border-active": "var(--kb-color-info)",
  "--kb-panel-radius": "var(--kb-radius-lg)",
  "--kb-panel-rim-top": "var(--kb-color-info)",
  "--kb-panel-glow-active": "color-mix(in oklab, var(--kb-color-info) 35%, transparent)",
  "--kb-panel-glow-critical": "color-mix(in oklab, var(--kb-color-danger) 35%, transparent)",
  "--kb-panel-highlight": "var(--kb-color-border)",
  "--kb-panel-divider": "var(--kb-color-border)",
  "--kb-panel-padding": "var(--kb-space-5)",
  "--kb-panel-rail": "var(--kb-color-muted)",
  "--kb-panel-rail-active": "var(--kb-color-info)",
  "--kb-status-running": "var(--kb-color-info)",
} satisfies Record<`--kb-${"panel" | "status"}-${string}`, string>;
