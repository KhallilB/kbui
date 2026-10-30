# Dashboard

Use Dashboard for an overview page: a header, a row of headline metrics, then primary and secondary panels. Primary and secondary sit side by side, two thirds and one third, once the panels region is 60rem wide, and stack with primary first below that. Dashboard is also the page frame: it fills the width up to 80rem with 1, 1.5 or 2rem gutters, so it does not need a [Container](Container.md). For a main column with one supporting aside, such as an order summary, use [Split](Split.md).

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-dashboard--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Card, Dashboard, Grid, PageHeader, Panel, Progress, Stat, Status } from "@kb.ui/react";

export function Example() {
  return (
    <main>
      <Dashboard
        header={
          <PageHeader
            title="Sales dashboard"
            description="Performance overview for your online store."
            meta={<Status tone="success">Updated 5 minutes ago</Status>}
          />
        }
        metrics={
          <Grid as="ul" aria-label="Key metrics" minItemWidth="sm" gap="md">
            <Card as="li">
              <Stat label="Total revenue" value="$128,450" />
            </Card>
            <Card as="li">
              <Stat label="Orders" value="2,184" />
            </Card>
          </Grid>
        }
        primary={
          <Panel aria-labelledby="channels-title">
            <Panel.Header>
              <h2 id="channels-title">Revenue by channel</h2>
            </Panel.Header>
            <Panel.Body>Organic search brought in 36% of revenue.</Panel.Body>
          </Panel>
        }
        secondary={
          <Panel aria-labelledby="goals-title">
            <Panel.Header>
              <h2 id="goals-title">Monthly goals</h2>
            </Panel.Header>
            <Panel.Body>
              <Progress label="Revenue" value={86} valueText="$128k of $150k" />
            </Panel.Body>
          </Panel>
        }
      />
    </main>
  );
}
```

## More examples

- [Sales overview](https://kbui.kcb.pro/storybook/?path=/story/layout-dashboard--sales-overview): A store dashboard with a date range, four metrics, channel revenue and top products beside monthly goals.
- [Metrics and primary](https://kbui.kcb.pro/storybook/?path=/story/layout-dashboard--metrics-and-primary): Without secondary panels, the primary region fills the page.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `header` | `ReactNode` | unset | Page title, freshness and page actions; usually a PageHeader |
| `metrics` | `ReactNode` | unset | Row of headline metrics below the header |
| `primary` | `ReactNode` | unset | Main panels; two thirds of the row on wide pages |
| `secondary` | `ReactNode` | unset | Supporting panels; one third on wide pages, below primary on narrow ones |
| `classNames` | `{ header?, metrics?, panels?, primary?, secondary? }` | unset | Classes for the regions |

Other native div props and `ref` pass through. Regions render in the order above and only when they have content; with only one of primary or secondary, it fills the row. Each panel region stacks its children with the dashboard gap.

Gutters follow the width of the dashboard's parent: 1rem below 48rem, 1.5rem from 48rem and 2rem from 64rem. As a direct flex item, such as beside a sidebar, the parent is the whole row, so wrap Dashboard in its own block, such as `main`. Tokens: `--kb-dashboard-gap`, `--kb-dashboard-max-width`, `--kb-dashboard-gutter-sm`, `-md`, `-lg`, `--kb-dashboard-gutter-md-from`, `--kb-dashboard-gutter-lg-from` and `--kb-dashboard-collapse`.

Give the page one `h1`, usually PageHeader's title, and name each panel with its `h2`. Label the metrics list, and show when the data was last updated, or that it is partial, as text in the header. Your app owns data loading, date ranges and refresh.

## Related components

Use [PageHeader](PageHeader.md) for the header, [Stat](Stat.md) in a [Grid](Grid.md) for metrics and [Panel](Panel.md) for each panel.
