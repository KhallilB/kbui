# Adding a component

A component lives in two places: a stylesheet in `@kb.ui/css`, and a component file with its test and story in `@kb.ui/react`. The generator creates all four files.

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

### Theme and state support

Components must remain readable and usable in light, dark and nested theme scopes.

- Use semantic tokens for surfaces, text, borders and interaction states. Component color tokens should alias those roles so theme changes reach them.
- Treat background and foreground as a pair. Verify text contrast against the rendered background, including gradients or overlays, in each relevant state. Filled primary actions use the shared action roles; see [paired overrides](restyling.md#common-changes).
- Keep focus visible and disabled, selected and invalid states distinguishable where supported. Decorative icons should inherit `currentColor`; state icons may use semantic status colors.
- Reuse shared controls in examples. Intentional visual overrides are supported, but must preserve theme support, focus visibility and disabled states.
- Add canonical stories for meaningful states. Check both themes, nested scopes when theme-dependent aliases or portals are involved, reduced motion for animation, and forced colors for custom control styling.

Canonical component stories run in both themes and motion preferences during site validation. Accessibility scans catch covered failures; they do not prove every state or color pairing is correct. Review the rendered states as well as the test results.

## 4. Build the React side, test first

Describe the behavior in `Notice.test.tsx` and run it to see it fail:

```bash
bun run --cwd packages/react test -- Notice
```

Build on a Base UI primitive when one fits; otherwise render a plain element. Follow the [component conventions](../../CONTRIBUTING.md#component-conventions): spread props first and `kb()` last, test that the `ref` is forwarded, and give each prop a one-line JSDoc comment. Then make the test pass.

### Integrating app libraries

kbui imports no app library: no router, i18n, form, date or image package. Apps plug theirs in through a seam, and setup examples for common libraries live in docs only, never as dependencies. Use the lowest rung that works:

1. **Native element.** The plain element with its `kb-` class, which the CSS-only path already supports.
2. **Per-instance `render`.** Always available as the escape hatch; it adds no API.
3. **Context provider.** Only when two or more kbui components render the same outside element, or every call site would repeat the same adapter.

Never intercept with a callback such as `navigate(href)` that re-implements the library; the app loses that library's own features.

A provider follows the [`Link.Provider`](../../packages/react/README.md#router-links) shape: namespaced on its owning component, one `component` prop defaulting to the native element, which receives native props and `ref` and must pass them through. The nearest provider wins, and with no provider the output is unchanged. Expose one `use<Name>Component()` reader. Test the default, the swap and a nested override; add a story and a short adapter example per common library to the README. Add API only for a real call site. Do not add an umbrella provider until three or more seams exist.

## 5. Add stories

Write a story for each variant, size and notable state. Storybook builds the props table from the JSDoc comments. Every story runs through the accessibility scan; reported violations fail CI. Follow the [story conventions](../../CONTRIBUTING.md#public-docs-and-internal-stories) to keep regression-only fixtures out of public navigation.

## 6. Check it

```bash
bun run check
bun run test:stories
bun run --filter @kb.ui/storybook test:themes
```

Then open the component in Storybook and review it in both light and dark.
