# Forms and overlays across surfaces

Import `Select`, `Checkbox`, `RadioGroup`, `Dialog`, `Menu`, `Tooltip` and `Button` from `@kbui/react`. Load matching `@kbui/css/styles.css` once. Follow [installation and themes](using-kbui.md). These additions are prepared in source after 0.5.0; published 0.5.0 does not contain them.

## Controlled fields

```tsx
const [team, setTeam] = useState<string | null>(null);
<Select label="Team" name="team" value={team} onValueChange={setTeam}
  options={[{value: "east", label: "East"}, {value: "west", label: "West"}]} />
<Checkbox label="Notify team" name="notify" checked={notify}
  onCheckedChange={setNotify} />
<RadioGroup label="Assignment" name="method" value={method} onValueChange={setMethod}>
  <RadioGroup.Item value="automatic">Automatic</RadioGroup.Item>
  <RadioGroup.Item value="manual">Manual</RadioGroup.Item>
</RadioGroup>
```

All fields require a controlled value and callback. Domain validation, persistence and submission remain consumer responsibilities. Labels, helper `description`, visible `error`, invalid and disabled states belong to the component. Values in Select options and RadioGroup items must be unique strings. `null` means no selection. Select supports an empty options array and placeholder. Checkbox supports `indeterminate` for aggregate selection, `readOnly` and `visuallyHidden`; RadioGroup supports a visually hidden group label. Checkbox uses a native input; Select and RadioGroup use Base UI keyboard/focus behavior. Disabled choices stay visible and unavailable; include a reason in consumer content when useful.

Select: Tab reaches trigger; Enter/Space or arrows open; arrows/typeahead navigate; Enter chooses; Escape dismisses and returns focus. RadioGroup: one Tab stop, arrows move selection past disabled choices, Space chooses. Checkbox: Space toggles; mixed resolves to checked. Use `name` for native form serialization. Disabled fields are excluded. Select and Checkbox refs target root div and input respectively; RadioGroup ref targets group, Item ref targets focusable radio. Select `controlClassName`/`popupClassName`, Checkbox `controlClassName`, and RadioGroup.Item `className`/`controlClassName` expose composition seams.

## Theme hosts and portals

Set tokens on a stable theme wrapper. Select defaults its portal to its own root so nested themes inherit. `container` accepts a Base UI portal target (element or ref). Dialog, Menu.Content and Tooltip default to body; pass the surrounding theme-host ref when colors or timing live on a nested wrapper. Tooltip also accepts `className` on its popup. A body portal needs theme variables on body or an explicitly themed host. Keep portal hosts outside overflow clipping and transformed ancestors when fixed positioning must escape them. Select inside a scrolling modal can target a stable outer theme host; verify stacking and modal focus in that composition.

CSS aliases resolve where declared. Remap `--kb-popup-background`, `--kb-popup-border` and component color tokens inside a nested surface rather than assuming a parent alias recomputes against new child colors. Do not depend on Base UI private DOM or hashed classes.

## Modal composition and material

Use `Dialog.Content title/description` for simple prompts. For a structured review, compose `Dialog.Header`, `Dialog.Title`, `Dialog.Description`, `Dialog.Body`, `Dialog.Footer` and `Dialog.Actions`. Header/Body/Footer are neutral divs with native props/ref; add `role="region"` and an accessible name only when that content deserves a landmark. Include a visible Close or Cancel action. Title/Description props and composed equivalents are alternatives; avoid duplicate labels.

Public `.kb-dialog-*` classes describe anatomy. Root popup tokens: `--kb-dialog-background`, `color`, `description-color`, `border`, `border-width`, `radius`, `width`, `padding`, `shadow`, `title-family`, `title-size`, `title-weight`; section tokens: `header-padding`, `body-padding`, `footer-padding`. Prefix each suffix with `--kb-dialog-`. Width is viewport-clamped; content scrolls within dynamic viewport height. Use a small radius for content geometry independently of pill buttons. Shared default shadow now follows popup elevation.

Commerce and Culture study dialogs demonstrate soft paper elevation and offset printed elevation using the same API. Item summaries, prices and ticket structures remain product compositions, not core variants.

## Motion

`--kb-button-motion-duration/easing` control color, opacity and press transitions; `--kb-button-press-offset` defaults to zero. Popup fade timing uses `--kb-popup-motion-duration/easing`. Dialog fade/transform use `--kb-dialog-motion-duration/easing`, `enter-scale`, `enter-offset`; overlay fade uses the same duration. Set duration/easing on the theme host; popup-only inline style cannot style its sibling backdrop. Defaults preserve existing timing: button 120ms, dialog 150ms, popup 80ms. Reduced-motion media removes component transitions and dialog entry displacement. Consumer content animations must also honor that preference.

Animate opacity/transform for movement. Avoid perpetual motion, layout-property animation and global `will-change`. Timings are design choices; passing local frame pacing does not establish performance on other hardware or refresh rates.

## Validation and examples

Maintained stories cover light/dark, editorial customization, invalid, disabled and empty/mixed states. Shared story suite runs normal and reduced-motion Chromium with automated accessibility checks. Unit tests cover controlled selection, mixed input state, focus, labels, refs and portal targets. Consumer fixtures: Commerce finishes/bag, Operations ledger, Culture dates/tickets; fresh transfer: `transfer/AssignmentPreferences.tsx` in the [archived study source](../../experiments/surface-study/review/README.md). Run `bun run check`, `bun run test:stories`, then exercise actual host at narrow/wide sizes with keyboard and assistive technology. Automated scans do not replace manual AT or host compatibility checks.

## Accessibility follow-up contracts

Checkbox activation from mixed resolves to checked, including when its controlled checked value is already true. Read-only retains native mixed projection and exposes `aria-readonly`; it does not emit changes. Select merges caller `aria-describedby` IDs onto its combobox trigger. An empty popup exposes a disabled “No options available” option. Shared buttons and radio controls include forced-color system palettes; consumer compositions still own their semantic theme palette and visible state labels.

Nested Select inside a scrolling Dialog needs an unclipped outer theme host for the popup container. Verify popup bounds, selection return and Escape dismissal order in the target host. Chromium regression coverage does not replace screen-reader or native WebView sign-off.
