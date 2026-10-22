# Adding a component

A component lives in two places: a stylesheet in `@kbui/css`, and a component file with its test and story in `@kbui/react`. The generator creates all four files for you.

## Generate the files

```bash
bun run new Badge
bun run lint:fix
```

The second command formats the generated files. The name has to be PascalCase. The generator won't overwrite a component that already exists, and if it can't update `index.ts` and `styles.css` it stops before writing anything.

You'll get a stylesheet at `packages/css/src/components/badge.css` with an `Anatomy:` line and a starter `.kb-badge` rule. In `packages/react/src/components/Badge/` you'll find `Badge.tsx`, which renders a `div` and applies `kb("badge", { variant }, className)`, along with a test that checks the class and default variant, and a story with a docs page.

The generator also adds the new export to `packages/react/src/index.ts` and the new import to `packages/css/src/styles.css`, keeping both lists sorted.

## Describe the markup before you style it

Start by rewriting the first line of the stylesheet so it describes the whole component:

```css
/* Anatomy: .kb-badge [data-tone=neutral|success|danger] [data-size=sm|md] > .kb-badge-icon */
```

That line is the contract. The React component has to render exactly these classes and attributes, and so would any other framework that used kbui's CSS later.

## Write the styles

Use semantic colors (`--kb-color-*`), scale tokens (`--kb-space-*`, `--kb-radius-*`, `--kb-size-*`) and the component's own tokens. Palette colors and raw values like `#fff` fail the check.

If the component needs a value of its own, add a group for it to `tokens.json`, such as `badge.radius`, and use `--kb-badge-radius`.

Hang variants and states off `data-*` attributes instead of adding classes. Make the `md` size the base style and write overrides for the others, so the component still looks right if the size attribute is missing. If anything animates, add a `prefers-reduced-motion` block that turns it off.

## Build the React side, test first

Describe what the component should do in `Badge.test.tsx` and run it to see it fail:

```bash
bun run --cwd packages/react test -- Badge
```

Build on a Base UI primitive if there's one for the job; otherwise render a plain element. Follow the [component habits in CONTRIBUTING](../../CONTRIBUTING.md#how-components-are-written): spread props first and `kb()` last, test that the `ref` works, and give each prop a one-line JSDoc comment. Then make the test pass.

## Add stories

Write a story for each variant, size and interesting state. Storybook builds the props table from your JSDoc comments. Each story also runs through the accessibility scan, so a story with a contrast or labeling problem will fail CI.

## Check it

```bash
bun run check
bun run test:stories
```

Then open the component in Storybook and look at it in both light and dark.
