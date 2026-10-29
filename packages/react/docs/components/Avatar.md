# Avatar

Keep people and organizations recognizable through photo loading, missing images and request failures. Fallback initials share the same fixed frame as the image.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-avatar--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Avatar, Inline, Link, Text } from "@kb.ui/react";

export function Example() {
  return (
    <Inline align="center" gap="md">
      <Avatar name="Maya Chen" src="/people/maya.jpg" decorative />
      <div>
        <Link href="/people/maya">Maya Chen</Link>
        <Text size="sm" tone="muted">Design director</Text>
      </div>
    </Inline>
  );
}
```

## More examples

- [Sizes](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--sizes): Five fixed dimensions.
- [Fallbacks](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--fallbacks): Missing/broken photos, multilingual names and organization initials.
- [People](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--people): Visible identity, profile link and role.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | required | Full accessible identity; blank names use `Unknown person` |
| `src`, `srcSet`, `sizes`, `loading` | native image attributes | unset | Photo request and responsive selection |
| `initials` | `string` | first and last name initials | Override for local naming conventions, handles or brand marks |
| `decorative` | `boolean` | `false` | Hide duplicate identity when adjacent text supplies it |
| `size` | `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"` | `"md"` | Defaults: 24, 32, 44, 56 and 80 CSS pixels |
| `shape` | `"circle"` \| `"square"` | `"circle"` | Rounded person or softly squared organization frame |
| `onLoad`, `onError` | native image handlers | unset | Photo result callbacks |
| `classNames` | keyed classes | unset | `root`, `media`, `initials` |
| `ref` | `Ref<HTMLSpanElement>` | unset | Root element; native span props pass through |

Initials use the first Unicode code point of the first and last whitespace-separated names, uppercased; a single word contributes one initial. This is a convenience, not a universal naming rule. Supply `initials` for the person's preferred form. Empty identities render `?`; localize `Unknown person` through `aria-label`. The accessible name remains the full identity, not the initials.

Avatar adds no focus stop. Place navigation in a named Link or an action in a Button. Use `decorative` when an equivalent visible name is adjacent or the parent control already supplies the identity. Keep presence and account state in separately labeled Status/Badge content. See [media recipes](../../../../docs/guides/media-and-identity.md).

## Related components

Use [Image](Image.md) for flexible media framing, [Thumbnail](Thumbnail.md) for captioned previews, and [Status](Status.md) for changing state.
