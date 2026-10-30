# Skeleton

Reserve the footprint of incoming text, media, or cards so the page does not jump when asynchronous data resolves.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-skeleton--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Card, Skeleton } from "@kb.ui/react";

export function Example() {
  return (
    <Card aria-busy="true" aria-label="Loading release summary">
      <Skeleton variant="text" lines={3} animation="wave" />
    </Card>
  );
}
```

## More examples

- [Wave, pulse, and accent synthesis](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--wave-and-pulse): Choreograph staggered multi-line wave cascades, breathing pulse blocks, and warm accent-tinted synthesis placeholders.
- [Structured card placeholder](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--card-placeholder): Combine avatar circles, pills, rectangular wells, and multi-line text placeholders.
- [Shapes and sizes](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--shapes-and-sizes): Compare `text`, `rect`, `circle`, and `pill` geometry across the size scale.
- [Loading-to-content transition](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--content-transition): Toggle `loading` to swap placeholder bars for resolved children without layout shift.

## Reference

| Prop         | Type                                  | Default     | Notes                                                                                     |
| ------------ | ------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `variant`    | `text` / `rect` / `circle` / `pill`   | `text`      | Matches incoming typography, media blocks, avatars, or status chips                       |
| `size`       | `sm` / `md` / `lg`                    | `md`        | Scales line height and circle diameter                                                    |
| `lines`      | `number`                              | `1`         | Number of stacked lines when `variant="text"`; the final line shortens naturally          |
| `width`      | `number` / `string`                   | unset       | Explicit inline size override (`px` number or CSS length)                                 |
| `height`     | `number` / `string`                   | unset       | Explicit block size override (`px` number or CSS length)                                  |
| `animated`   | `boolean`                             | `true`      | Enables motion that stops automatically under `prefers-reduced-motion`                    |
| `animation`  | `shimmer` / `pulse` / `wave` / `none` | `"shimmer"` | Selects specular sweep, breathing pulse, staggered multi-line wave, or static placeholder |
| `tone`       | `default` / `subtle` / `accent`       | `"default"` | Surface treatment (`default` surface, `subtle` recessed well, or `accent` synthesis tint) |
| `loading`    | `boolean`                             | `true`      | Renders decorative placeholders when `true`, or `children` inside `.kb-skeleton-content`  |
| `classNames` | keyed classes                         | unset       | Style `line` or `content`                                                                 |

## Related components

Use [`Spinner`](Spinner.md) for compact indeterminate waits, [`EmptyState`](EmptyState.md) when a query resolves with zero items, and [`Card`](Card.md) as the owning surface with `aria-busy="true"`.
