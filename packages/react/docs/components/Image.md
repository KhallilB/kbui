# Image

Reserve a stable frame for images, with crop, contain and fallback states. The same accessible alternative remains available while loading and after failure.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-image--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Image } from "@kb.ui/react";

export function Example() {
  return (
    <Image
      src="/products/studio-coat.jpg"
      alt="Sand wool coat with broad lapels"
      ratio="portrait"
      fit="contain"
      width={900}
      height={1200}
      fallback="Preview unavailable"
    />
  );
}
```

## More examples

- [Crop and contain](https://kbui.kcb.pro/storybook/?path=/story/components-image--crop-and-contain): Compare detail crops with complete product images.
- [Ratios](https://kbui.kcb.pro/storybook/?path=/story/components-image--ratios): Square, wide, intrinsic and missing media.
- [Failure and recovery](https://kbui.kcb.pro/storybook/?path=/story/components-image--failure-and-recovery): Replace a failed source without shifting layout.

- [Editorial image library](https://kbui.kcb.pro/storybook/?path=/story/components-image--asset-library): Ten original portrait, object and scene illustrations with individual downloads.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `alt` | `string` | required | Accessible alternative; empty string hides decorative media |
| `src`, `srcSet`, `sizes` | native image attributes | unset | Responsive source selection; changing these resets request state |
| `ratio` | `ImageRatio` | `"landscape"` | `square` (1:1), `landscape` (4:3), `portrait` (3:4), `wide` (16:9), or `auto` |
| `width`, `height` | native image dimensions | unset | Forwarded to img; with `ratio="auto"`, reserve their ratio before loading |
| `fit` | `"cover"` \| `"contain"` | `"cover"` | Crop to fill or show entire image |
| `position` | CSS object position | browser center | Focal point, such as `"50% 25%"` |
| `fallback` | `ReactNode` | image outline icon | Non-interactive visual for loading, missing and failed media |
| `loading`, `fetchPriority` | native image attributes | browser defaults | Choose lazy/eager loading and priority per placement |
| `decoding` | native image attribute | `"async"` | Decode preference |
| `crossOrigin`, `referrerPolicy` | native image attributes | unset | Request policy |
| `onLoad`, `onError` | native image handlers | unset | Observe request outcome; called with native img events |
| `classNames` | keyed classes | unset | `root`, `image`, `fallback` |
| `ref` | `Ref<HTMLSpanElement>` | unset | Frame element; remaining span props and style apply here |

The frame exposes `data-state="empty|loading|loaded|error"`, `data-ratio`, and `data-fit`. The internal native image is hidden from assistive technology; the outer image role owns the alternative across all states. `aria-label`, `aria-labelledby`, and `aria-describedby` belong to the frame. An empty `alt` always hides the complete image.

`auto` uses positive width and height; without both, it falls back to the landscape ratio. The image remains within the reserved frame, including after failure. A caller `style.aspectRatio` overrides framing. `Image` fetches follow native browser behavior; the component adds no timeout, retry loop, cache, upload or URL policy. A new source starts a fresh request; to retry the same URL intentionally, change the component key.

Fallback content is visual-only and must contain no controls. Place a named replacement/retry `Button` and meaningful error text outside the frame. Use [media recipes](../../../../docs/guides/media-and-identity.md) for responsive sources, localized errors and CSS-only markup.

## Related components

Use [`Avatar`](Avatar.md) for fixed-size identity, [`Thumbnail`](Thumbnail.md) for captions and metadata, and [`Grid`](Grid.md) for responsive collections.
