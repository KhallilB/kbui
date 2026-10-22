# Adding a component

A component is four files: a stylesheet in `@kbui/css` and a component, test and story in `@kbui/react`. The generator creates all four and registers them.

## 1. Generate

```bash
bun run new Badge
bun run lint:fix
```

The name must be PascalCase. The generator refuses names that already exist and writes nothing if it cannot update the registries. It creates:

| File | Starts as |
|---|---|
| `packages/css/src/components/badge.css` | An `Anatomy:` line and a `.kb-badge` rule |
| `packages/react/src/components/Badge/Badge.tsx` | A `div` that spreads props, then `kb("badge", { variant }, className)` |
| `packages/react/src/components/Badge/Badge.test.tsx` | A test that the root class and default variant render |
| `packages/react/src/components/Badge/Badge.stories.tsx` | A `Default` story with autodocs |

It also adds the export to `packages/react/src/index.ts` and the import to `packages/css/src/styles.css`, both in sorted order.

## 2. Write the contract first

Edit the first line of the stylesheet to describe the full anatomy before styling anything:

```css
/* Anatomy: .kb-badge [data-tone=neutral|success|danger] [data-size=sm|md] > .kb-badge-icon */
```

The React component must emit exactly these classes and attributes, and any future adapter will too.

## 3. Style

- Use semantic tokens (`--kb-color-*`), scale tokens (`--kb-space-*`, `--kb-radius-*`, `--kb-size-*`) and your component's own tokens. Palette primitives and raw colors fail the check.
- Need a component-specific value? Add a group to `tokens.json`, such as `badge.radius`, and reference `--kb-badge-radius`.
- Key variants and states on `data-*` attributes, not extra classes.
- Make `md` the base rule and override other sizes, so a missing attribute still renders correctly.
- Add a `prefers-reduced-motion` block for any transition.

## 4. Build the React component, test first

1. Write the behavior you want in `Badge.test.tsx` and run it red: `bun run --cwd packages/react test -- Badge`.
2. Build on a Base UI primitive when one exists; otherwise render the plain element.
3. Follow the conventions in [CONTRIBUTING.md](../../CONTRIBUTING.md#component-conventions): props spread first then `kb()`, a `ref` test, one-line JSDoc on every prop.
4. Run the test green.

## 5. Document with stories

Add a story per variant, size and notable state. Each prop's JSDoc becomes the props table on the Docs page. Every story is also an accessibility test, so a story that fails axe fails CI.

## 6. Check

```bash
bun run check
bun run test:stories
```

Then look at the component in Storybook in light and dark themes.
