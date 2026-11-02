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

## Shape from content

Set `variant="auto"` and pass the real layout as children. While `loading` is true, Skeleton renders the children inert and hidden from assistive technology. kbui avatars, buttons, badges, status chips, images, form fields, headings and text then become placeholders in their own size and shape. Leave data-driven fields empty while loading: empty headings and text still reserve one line. Other text elements fall back to plain text bars. Skeleton marks itself `aria-busy` and announces `label` once, so callers do not write placeholder copy.

```tsx
import "@kb.ui/react/styles.css";
import { Avatar, Card, Heading, Inline, Skeleton, Text } from "@kb.ui/react";

type Person = { name: string; role: string };

export function Example({ person }: { person?: Person | undefined }) {
  return (
    <Skeleton variant="auto" loading={!person} label="Loading profile">
      <Card>
        <Inline gap="md" align="center">
          <Avatar name={person?.name ?? ""} decorative />
          <div>
            <Heading level={3} size="sm">
              {person?.name}
            </Heading>
            <Text size="sm" tone="muted">
              {person?.role}
            </Text>
          </div>
        </Inline>
      </Card>
    </Skeleton>
  );
}
```

Skeleton cannot know how many items a list will hold. Render a fixed number of empty rows while loading. Without children, `auto` falls back to `text` lines.

## More examples

- [Animations](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--animations): Compare `shimmer`, `pulse`, and `wave` motion.
- [Tones](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--tones): Compare the `default`, `subtle`, and `accent` surfaces.
- [Profile card](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--profile-card): Combine circle, pill, block, and text placeholders into a card layout.
- [Shapes and sizes](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--shapes-and-sizes): Compare `text`, `rect`, `circle`, and `pill` geometry across the size scale.
- [Content transition](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--content-transition): Toggle `loading` to swap placeholder bars for resolved children without layout shift.
- [Auto](https://kbui.kcb.pro/storybook/?path=/story/components-skeleton--auto): Shape placeholders from a real profile card and toggle `loading` to reveal it in place.

## Motion

Shimmer moves a soft light band across the placeholder, with a short rest between passes. Pulse and wave use a restrained brightness change so the reserved shape stays visible. In `auto`, one animation drives every placeholder in step, and `wave` fades without a stagger. Existing `--kb-skeleton-*` motion tokens control timing; reduced-motion preferences and forced-colors mode use static placeholders.

## Reference

| Prop         | Type                                         | Default     | Notes                                                                                     |
| ------------ | -------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `variant`    | `text` / `rect` / `circle` / `pill` / `auto` | `text`      | Matches typography, media blocks, avatars, or status chips; `auto` shapes from `children` |
| `size`       | `sm` / `md` / `lg`                           | `md`        | Scales line height and circle diameter                                                    |
| `lines`      | `number`                                     | `1`         | Number of stacked lines when `variant="text"`; the final line shortens naturally          |
| `width`      | `number` / `string`                          | unset       | Explicit inline size override (`px` number or CSS length)                                 |
| `height`     | `number` / `string`                          | unset       | Explicit block size override (`px` number or CSS length)                                  |
| `animated`   | `boolean`                                    | `true`      | Enables motion that stops automatically under `prefers-reduced-motion`                    |
| `animation`  | `shimmer` / `pulse` / `wave` / `none`        | `"shimmer"` | Light sweep, fade, staggered fade across lines, or a static placeholder                   |
| `tone`       | `default` / `subtle` / `accent`              | `"default"` | Surface treatment: `default`, `subtle` recessed, or `accent` tinted                       |
| `loading`    | `boolean`                                    | `true`      | Renders decorative placeholders when `true`, or `children` inside `.kb-skeleton-content`  |
| `label`      | `string`                                     | `"Loading"` | Status announced while `variant="auto"` is loading                                        |
| `classNames` | keyed classes                                | unset       | Style `line`, `content`, or `status`                                                      |

## Related components

Use [`Spinner`](Spinner.md) for compact indeterminate waits, [`EmptyState`](EmptyState.md) when a query resolves with zero items, and [`Card`](Card.md) as the owning surface with `aria-busy="true"`.
