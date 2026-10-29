# Link

Native anchor for navigation, with persistent underline and visible keyboard focus.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-link--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Link } from "@kb.ui/react";

export function Example() {
  return <Link href="/projects">Browse projects</Link>;
}
```

## More examples

- [Navigation within prose](https://kbui.kcb.pro/storybook/?path=/story/components-link--in-text): Inspect link treatment inside surrounding text.
- [Router adapter](https://kbui.kcb.pro/storybook/?path=/story/components-link--with-router): Client-side navigation through `Link.Provider`.

## Reference

| Prop                                        | Type                | Default  | Notes                            |
| ------------------------------------------- | ------------------- | -------- | -------------------------------- |
| `href`                                      | `string`            | required | Navigation destination           |
| `target`, `rel`, `download`, `aria-current` | Native anchor props | unset    | Passed through without rewriting |
| `className`, `ref`                          | Native anchor props | unset    | Ref targets anchor               |

Use descriptive link text. Use Button for an action. Links inherit surrounding type size; Tab focuses, Enter follows, and Space retains native behavior. Callers own new-tab wording and target/rel policy. No disabled link is provided. Color, underline and focus must remain visible.

### Router links

kbui never imports a router. Wrap your app once in `Link.Provider` with a component that renders an anchor: it receives `href` plus native anchor props, and must pass them and `ref` through. `Link` then renders through it and keeps `kb-link`; nested providers override outer ones, and without a provider it renders a plain `<a>`. A React Router adapter:

```tsx
import { Link, type LinkProps } from "@kb.ui/react";
import { Link as RouterLink } from "react-router";

const AppLink = ({ href, ...props }: LinkProps) => <RouterLink to={href} {...props} />;

<Link.Provider component={AppLink}>
  <App />
</Link.Provider>;
```

`useLinkComponent()` returns the current component for your own anchors.

## Related components

Use [Button](Button.md) for an action and [Card](Card.md) to group content around a destination.
