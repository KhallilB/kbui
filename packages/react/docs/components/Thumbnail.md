# Thumbnail

Pair stable image frames with visible titles and metadata for products, studies and attachments. Compose figures into responsive collections with `Grid`.

[All components](../../README.md#components) · [Usage](#usage) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-thumbnail--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Grid, Link, Thumbnail } from "@kb.ui/react";

export function Example() {
  return (
    <Grid as="ul" minItemWidth="sm" gap="lg">
      <li>
        <Thumbnail
          src="/products/studio-coat.jpg"
          alt="Sand wool coat with broad lapels"
          ratio="portrait"
          fit="contain"
          caption={<Link href="/products/studio-coat">The studio coat</Link>}
          description="Sand · Wool blend"
          imageProps={{ loading: "lazy", width: 900, height: 1200 }}
        />
      </li>
      <li>
        <Thumbnail
          alt=""
          ratio="portrait"
          fallback="PDF"
          caption={<Link href="/brand-guide.pdf">Brand guide.pdf</Link>}
          description="PDF · 2.4 MB"
        />
      </li>
    </Grid>
  );
}
```

## More examples

- [Products](https://kbui.kcb.pro/storybook/?path=/story/components-thumbnail--products): Responsive product cards and absent photography.
- [Attachments](https://kbui.kcb.pro/storybook/?path=/story/components-thumbnail--attachments): Persistent filenames, formats and file sizes.
- [Gallery](https://kbui.kcb.pro/storybook/?path=/story/components-thumbnail--gallery): Keyboard-operable `Dialog` inspection and focus return.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `alt` | `string` | required | Meaningful visual alternative; empty when decorative |
| `src` | `string` | unset | Preview source |
| `ratio`, `fit`, `position`, `fallback` | `Image` props | `Image` defaults | Framing and non-interactive fallback |
| `caption` | `ReactNode` | unset | Visible figure title; may contain `Link`, `Button` or `Dialog.Trigger` |
| `description` | `ReactNode` | unset | Persistent supporting text such as format and size |
| `imageProps` | remaining `Image` props | unset | Responsive source/loading attributes, callbacks, frame ref, style and `Image` slots |
| `classNames` | keyed classes | unset | `root`, `media`, `caption`, `title`, `description` |
| `ref` | `Ref<HTMLElement>` | unset | Native figure; remaining figure props apply here |

A caption names the figure through `aria-labelledby`; caller naming attributes take precedence. Description is visible metadata within `figcaption`. Without either, no caption element is rendered. Figure and image remain non-interactive; caption actions own their native keyboard behavior. The component never infers file type, size or download policy from the URL.

For a page of previews, put each `Thumbnail` in a [`Gallery`](Gallery.md) item. A named `Dialog` trigger in the caption supports enlarged inspection, Escape dismissal and focus return through `Dialog`. `Gallery` provides no carousel, arrow-key selection, image editor or upload. See [media recipes](../../../../docs/guides/media-and-identity.md#build-a-gallery-in-reading-order) for a complete implementation.

## Related components

Use [`Image`](Image.md) for an image alone, [`Avatar`](Avatar.md) for people, [`Grid`](Grid.md) for layout, and [`Dialog`](Dialog.md) for focused media inspection.
