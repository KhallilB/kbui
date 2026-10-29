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

- [Shapes](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--shapes): Circular, square, rounded, hexagonal and diamond silhouettes with photos and initials.
- [Sizes](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--sizes): Five fixed dimensions.
- [Fallbacks](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--fallbacks): Missing/broken photos, multilingual names and organization initials.
- [People](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--people): Visible identity, profile link and role.

## Shapes

`AvatarShape` accepts `circle`, `square`, `rounded`, `hexagon` and `diamond`. These shapes are implemented locally and unreleased. `square` has zero corner radius; `rounded` uses softly rounded corners.

Shape changes only the silhouette. Photos and initials remain upright, and the accessible identity, size and image request state stay unchanged. Hexagon and diamond clip the media frame to their polygon; they do not rotate the content.

```tsx
import "@kb.ui/react/styles.css";
import { Avatar, type AvatarShape, Inline } from "@kb.ui/react";

const organizationShape: AvatarShape = "hexagon";

export function ShapedIdentity() {
  return (
    <Inline gap="lg" align="center">
      <Avatar name="Maya Chen" shape="circle" />
      <Avatar name="North Studio" initials="N" shape="square" />
      <Avatar name="Design team" initials="D" shape="rounded" style={{ borderRadius: "var(--kb-radius-sm)" }} />
      <Avatar name="Field team" initials="F" shape={organizationShape} />
      <Avatar name="Studio collection" initials="S" shape="diamond" />
    </Inline>
  );
}
```

The default circle uses `--kb-avatar-radius`; rounded uses the existing `--kb-avatar-square-radius` token. A root `style.borderRadius` overrides the circle, square or rounded frame and is inherited by its media. Polygon clipping remains in effect for hexagon and diamond. Choose short initials that remain legible inside the silhouette, especially at smaller sizes.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | required | Full accessible identity; blank names use `Unknown person` |
| `src`, `srcSet`, `sizes`, `loading` | native image attributes | unset | Photo request and responsive selection |
| `initials` | `string` | first and last name initials | Override for local naming conventions, handles or brand marks |
| `decorative` | `boolean` | `false` | Hide duplicate identity when adjacent text supplies it |
| `size` | `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"` | `"md"` | Defaults: 24, 32, 44, 56 and 80 CSS pixels |
| `shape` | `AvatarShape` | `"circle"` | `circle`, `square`, `rounded`, `hexagon` or `diamond`; clips upright media |
| `onLoad`, `onError` | native image handlers | unset | Photo result callbacks |
| `classNames` | keyed classes | unset | `root`, `media`, `initials` |
| `ref` | `Ref<HTMLSpanElement>` | unset | Root element; native span props pass through |

Initials use the first Unicode code point of the first and last whitespace-separated names, uppercased; a single word contributes one initial. This is a convenience, not a universal naming rule. Supply `initials` for the person's preferred form. Empty identities render `?`; localize `Unknown person` through `aria-label`. The accessible name remains the full identity, not the initials.

Avatar adds no focus stop. Place navigation in a named Link or an action in a Button. Use `decorative` when an equivalent visible name is adjacent or the parent control already supplies the identity. Keep presence and account state in separately labeled Status/Badge content. See [media recipes](../../../../docs/guides/media-and-identity.md).

## Related components

Use [Image](Image.md) for flexible media framing, [Thumbnail](Thumbnail.md) for captioned previews, and [Status](Status.md) for changing state.
