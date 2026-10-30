# StatsRow

Show a few comparable metrics in a row, such as the key figures at the top of a dashboard. The row fills its region and wraps into more rows when narrow.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-statsrow--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Link, StatsRow } from "@kb.ui/react";

export function Example() {
  return (
    <StatsRow aria-label="Store performance, September 2026">
      <StatsRow.Item
        label="Total revenue"
        value="$48,250"
        change="+12.8%"
        trend="up"
        tone="positive"
        context="vs. previous month"
        link={<Link href="/revenue">View revenue</Link>}
      />
      <StatsRow.Item
        label="Orders"
        value="625"
        change="+8.7%"
        trend="up"
        tone="positive"
        context="vs. previous month"
      />
      <StatsRow.Item
        label="Refund requests"
        value="38"
        change="+12 requests"
        trend="up"
        tone="negative"
        context="vs. previous month"
      />
    </StatsRow>
  );
}
```

Items share equal columns no narrower than `--kb-statsrow-item-min-width` (10rem) and fill the row. Below that width they wrap into more rows, so no screen size scrolls sideways. Labels, values, changes and links each share a track across a row, so a label that wraps to two lines keeps the values beside it aligned.

## More examples

- [Outlined with links](https://kbui.kcb.pro/storybook/?path=/story/components-statsrow--outlined): Put each metric on a card surface and link to its detail screen.
- [Direction and tone](https://kbui.kcb.pro/storybook/?path=/story/components-statsrow--direction-and-tone): Set the direction glyph apart from whether the change is good news.
- [Compact wrap](https://kbui.kcb.pro/storybook/?path=/story/components-statsrow--wrap): See six metrics wrap at the widths of 390 and 768 pixel screens.

## Reference

`StatsRow` renders a `ul`; other native `ul` props, including `aria-label` and `aria-labelledby`, pass through to it.

| Prop         | Type                  | Default | Notes                                                     |
| ------------ | --------------------- | ------- | --------------------------------------------------------- |
| `appearance` | `plain` / `outlined`  | `plain` | Plain metrics on the page, or each metric on a card surface |
| `children`   | `StatsRow.Item` nodes | unset   | One item per metric                                       |

`StatsRow.Item` renders an `li` around a [`Stat`](Stat.md); other native `li` props pass through to it.

| Prop         | Type                                | Default   | Notes                                                                       |
| ------------ | ----------------------------------- | --------- | --------------------------------------------------------------------------- |
| `label`      | `ReactNode`                         | required  | What the value measures; read first                                         |
| `value`      | `ReactNode`                         | required  | The figure with its unit; tabular figures                                   |
| `change`     | `ReactNode`                         | unset     | Change since the comparison period; its text states the direction, such as `+12.8%` |
| `trend`      | `up` / `down` / `flat`              | unset     | Direction glyph before `change`; hidden from assistive technology; needs `change` |
| `tone`       | `positive` / `negative` / `neutral` | `neutral` | Colors `change` by whether it is good news, apart from its direction; needs `change` |
| `context`    | `ReactNode`                         | unset     | Comparison period or freshness, such as `vs. previous month`                |
| `link`       | `ReactNode`                         | unset     | `Link` to the detail behind the metric; aligned on the last row of the item   |
| `classNames` | keyed classes                       | unset     | Style `stat`, `label`, `value`, `trend`, `change`, `glyph`, `context`, `link` |

Keep units comparable across a row: one currency, the same precision and one comparison period. Write the direction into the change text; color and the glyph do not convey it on their own. Tone is color only, so when good or bad news is not obvious from the label, say it in the change or context text, such as `+12 requests, above target`.

## Related components

Use [`Stat`](Stat.md) for a single figure, [`Progress`](Progress.md) when a metric measures completion toward a target, [`DescriptionList`](DescriptionList.md) for labelled record details that are not comparable figures, and [`Grid`](Grid.md) for collections of cards that are not metrics.
