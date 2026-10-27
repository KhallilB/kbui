# Adding a component

A component lives in two places: a stylesheet in `@kbui/css`, and a component file with its test and story in `@kbui/react`. The generator creates all four files.

## 1. Generate the files

```bash
bun run new Notice
bun run lint:fix
```

The name must be PascalCase. `lint:fix` formats the generated files. The generator refuses to overwrite an existing component, and if it cannot update `index.ts` and `styles.css` it stops before writing anything.

It creates:

| File | Starting content |
|---|---|
| `packages/css/src/components/notice.css` | An `Anatomy:` line and a starter `.kb-notice` rule |
| `packages/react/src/components/Notice/Notice.tsx` | A `div` that applies `kb("notice", { variant }, className)` |
| `packages/react/src/components/Notice/Notice.test.tsx` | A test for the class and default variant |
| `packages/react/src/components/Notice/Notice.stories.tsx` | A story with a docs page |

It also adds the export to `packages/react/src/index.ts` and the import to `packages/css/src/styles.css`, keeping both lists sorted.

## 2. Describe the markup

Rewrite the stylesheet's first line so it describes the whole component:

```css
/* Anatomy: .kb-notice [data-tone=neutral|success|danger] [data-size=sm|md] > .kb-notice-icon */
```

This line is the contract. The React component must render exactly these classes and attributes, and so must any future renderer in another framework.

## 3. Write the styles

- Use semantic colors (`--kb-color-*`), scale tokens (`--kb-space-*`, `--kb-radius-*`, `--kb-size-*`) and the component's own tokens. Palette colors and raw values such as `#fff` fail the check.
- If the component needs its own value, add a group to `tokens.json`, such as `notice.radius`, and use `--kb-notice-radius`.
- Express variants and states as `data-*` attributes, not extra classes.
- Make the `md` size the base style and write overrides for the other sizes, so the component still renders correctly when the size attribute is missing.
- Disable any animation inside a `prefers-reduced-motion` block.

## 4. Build the React side, test first

Describe the behavior in `Notice.test.tsx` and run it to see it fail:

```bash
bun run --cwd packages/react test -- Notice
```

Build on a Base UI primitive when one fits; otherwise render a plain element. Follow the [component conventions](../../CONTRIBUTING.md#component-conventions): spread props first and `kb()` last, test that the `ref` is forwarded, and give each prop a one-line JSDoc comment. Then make the test pass.

## 5. Add stories

Write a story for each variant, size and notable state. Storybook builds the props table from the JSDoc comments. Every story runs through the accessibility scan, so a contrast or labeling problem fails CI.

## 6. Check it

```bash
bun run check
bun run test:stories
```

Then open the component in Storybook and review it in both light and dark.
