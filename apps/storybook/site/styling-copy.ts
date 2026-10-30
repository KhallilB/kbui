export const stylingClassMarker = "__kbui_style_classes__";
export const stylingThemeMarker = "__kbui_style_theme__";
export type StylingPatch = { start: number; end: number; text: string; theme?: "light" | "dark" };

// Only generated tags change; imports, state and surrounding source stay exact.
export function applyStylingPatches(
  source: string,
  patches: StylingPatch[],
  classes: string,
  theme?: "light" | "dark",
): string {
  let result = source;
  for (const patch of [...patches].sort((a, b) => b.start - a.start)) {
    let tag = patch.text.replaceAll(JSON.stringify(stylingClassMarker), JSON.stringify(classes));
    if (patch.theme)
      tag = tag.replaceAll(
        JSON.stringify(stylingThemeMarker),
        JSON.stringify(theme ?? patch.theme),
      );
    result = result.slice(0, patch.start) + tag + result.slice(patch.end);
  }
  return result;
}
