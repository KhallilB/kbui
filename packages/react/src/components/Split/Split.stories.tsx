import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, within } from "storybook/test";
import { Card } from "../Card/Card";
import { Code } from "../Code/Code";
import { Grid } from "../Grid/Grid";
import { Heading } from "../Heading/Heading";
import { Text } from "../Text/Text";
import { Split } from "./Split";

const meta = { title: "Layout/Split", component: Split, tags: ["autodocs"] } satisfies Meta<
  typeof Split
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Split>
      <Card>
        <Heading level={2}>Project overview</Heading>
        <Text>Review the latest draft with your team.</Text>
      </Card>
      <Card>
        <Heading level={2}>Upcoming milestones</Heading>
        <Text>See what needs attention next.</Text>
      </Card>
    </Split>
  ),
};
export const Ratios: Story = {
  render: () => (
    <Grid layout="stack">
      {(["equal", "wide-start", "wide-end"] as const).map((ratio) => (
        <Split key={ratio} ratio={ratio} collapse="sm">
          <Card>
            <Text>{ratio}: first</Text>
          </Card>
          <Card>
            <Text>Second</Text>
          </Card>
        </Split>
      ))}
    </Grid>
  ),
};
export const Responsive: Story = {
  render: () => (
    <Grid layout="stack">
      {[280, 767, 767.875, 768, 1040].map((width) => (
        <div key={width} style={{ inlineSize: width, maxInlineSize: "100%" }}>
          <Split data-testid={`split-${width}`} ratio="wide-start">
            <Card>
              <Text>Primary</Text>
              <Code>
                packages/react/src/components/VeryLongComponentName/VeryLongComponentName.stories.tsx
              </Code>
            </Card>
            <Card>
              <Text>Secondary</Text>
            </Card>
          </Split>
        </div>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    for (const width of [280, 767, 767.875, 768, 1040]) {
      const split = within(canvasElement).getByTestId(`split-${width}`);
      const [first, second] = [...split.children].map((node) => node.getBoundingClientRect());
      if (!first || !second) throw new Error("Expected two columns");
      if (split.getBoundingClientRect().width < 768) {
        expect(second.top).toBeGreaterThan(first.bottom);
        expect(first.width).toBeCloseTo(second.width, 0);
      } else {
        expect(second.top).toBeCloseTo(first.top, 0);
        expect(first.width / second.width).toBeCloseTo(2, 1);
        const [firstCard, secondCard] = within(split).getAllByRole("article");
        if (!firstCard || !secondCard) throw new Error("Expected stretched cards");
        expect(firstCard.getBoundingClientRect().height).toBeCloseTo(
          secondCard.getBoundingClientRect().height,
          0,
        );
      }
      expect(split.scrollWidth).toBeLessThanOrEqual(split.clientWidth);
    }
  },
};
export const CollapseSizes: Story = {
  render: () => (
    <Grid layout="stack">
      {(["sm", "md", "lg"] as const).map((collapse) => (
        <div key={collapse} style={{ inlineSize: 800, maxInlineSize: "100%" }}>
          <Split collapse={collapse} data-testid={`collapse-${collapse}`}>
            <Text>{collapse} threshold</Text>
            <Text>Context</Text>
          </Split>
        </div>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    for (const [size, threshold] of [
      ["sm", 512],
      ["md", 768],
      ["lg", 1024],
    ] as const) {
      const split = within(canvasElement).getByTestId(`collapse-${size}`);
      const [first, second] = [...split.children].map((node) => node.getBoundingClientRect());
      if (!first || !second) throw new Error("Expected two columns");
      if (split.clientWidth < threshold) expect(second.top).toBeGreaterThan(first.bottom);
      else expect(second.top).toBeCloseTo(first.top, 0);
    }
  },
};
export const Nested: Story = {
  render: () => (
    <Split collapse="sm">
      <Grid layout="stack">
        <Text>Primary workspace</Text>
        <Split collapse="sm">
          <Text>Nested first</Text>
          <Text>Nested second</Text>
        </Split>
      </Grid>
      <Text>Outer context</Text>
    </Split>
  ),
};

export const IndependentNestedThresholds: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ inlineSize: 800, maxInlineSize: "100%" }}>
      <Split collapse="sm" gap="lg" data-testid="outer-split">
        <Split collapse="lg" gap="sm" data-testid="inner-split">
          <Text>Nested first</Text>
          <Text>Nested second</Text>
        </Split>
        <Text>Outer context</Text>
      </Split>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outer = canvas.getByTestId("outer-split");
    const inner = canvas.getByTestId("inner-split");
    const [first, second] = [...outer.children].map((node) => node.getBoundingClientRect());
    const [innerFirst, innerSecond] = [...inner.children].map((node) =>
      node.getBoundingClientRect(),
    );
    if (!first || !second || !innerFirst || !innerSecond)
      throw new Error("Expected nested columns");
    if (outer.clientWidth >= 512) expect(second.top).toBeCloseTo(first.top, 0);
    else expect(second.top).toBeGreaterThan(first.bottom);
    expect(innerSecond.top).toBeGreaterThan(innerFirst.bottom);
    expect(outer.scrollWidth).toBeLessThanOrEqual(outer.clientWidth);
  },
};

export const ContentMeasures: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Grid layout="stack">
      <div
        data-testid="reading-measure"
        style={{
          inlineSize: "65ch",
          maxInlineSize: "100%",
          fontFamily: "var(--kb-font-sans)",
          fontSize: "var(--kb-text-body-size)",
        }}
      >
        Reference reading measure
      </div>
      {(["equal", "wide-start", "wide-end"] as const).flatMap((ratio) =>
        [700, 1600].map((width) => (
          <div key={`${ratio}-${width}`} style={{ inlineSize: width, maxInlineSize: "100%" }}>
            <Split ratio={ratio} data-testid={`measure-${ratio}-${width}`}>
              <Text>Primary content keeps its own reading measure.</Text>
              <Text>Supporting context keeps its own reading measure.</Text>
            </Split>
          </div>
        )),
      )}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const measure = within(canvasElement)
      .getByTestId("reading-measure")
      .getBoundingClientRect().width;
    for (const ratio of ["equal", "wide-start", "wide-end"]) {
      for (const width of [700, 1600]) {
        const split = within(canvasElement).getByTestId(`measure-${ratio}-${width}`);
        const [first, second] = [...split.children].map((node) => node.getBoundingClientRect());
        if (!first || !second) throw new Error("Expected column tracks");
        const available = split.getBoundingClientRect().width;
        if (available < 768) {
          expect(second.top).toBeGreaterThan(first.bottom);
          expect(first.width).toBeCloseTo(available, 0);
          expect(second.width).toBeCloseTo(available, 0);
        } else {
          expect(second.top).toBeCloseTo(first.top, 0);
          expect(first.width / second.width).toBeCloseTo(
            ratio === "wide-start" ? 2 : ratio === "wide-end" ? 0.5 : 1,
            1,
          );
        }
        for (const text of within(split).getAllByText(/keeps its own reading measure/)) {
          expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(measure + 1);
        }
        expect(split.scrollWidth).toBeLessThanOrEqual(split.clientWidth);
      }
    }
  },
};

export const NestedTokenOverrides: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <Grid layout="stack">
      {["collapse", "gap"].map((kind) => (
        <div key={kind} style={{ inlineSize: 900, maxInlineSize: "100%" }}>
          <Split data-testid={`token-outer-${kind}`}>
            <Split
              data-testid={`token-inner-${kind}`}
              style={
                (kind === "collapse"
                  ? { "--kb-split-collapse-md": "70rem" }
                  : { "--kb-layout-gap-md": "4rem" }) as CSSProperties &
                  Record<`--${string}`, string>
              }
            >
              <Text>Nested first</Text>
              <Text>Nested second</Text>
            </Split>
            <Text>Outer context</Text>
          </Split>
        </div>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    for (const kind of ["collapse", "gap"]) {
      const canvas = within(canvasElement);
      const outer = canvas.getByTestId(`token-outer-${kind}`);
      const inner = canvas.getByTestId(`token-inner-${kind}`);
      const [first, second] = [...outer.children].map((node) => node.getBoundingClientRect());
      const [innerFirst, innerSecond] = [...inner.children].map((node) =>
        node.getBoundingClientRect(),
      );
      if (!first || !second || !innerFirst || !innerSecond)
        throw new Error("Expected nested tracks");
      expect(first.width).toBeCloseTo(second.width, 0);
      if (outer.clientWidth >= 768) expect(second.top).toBeCloseTo(first.top, 0);
      else expect(second.top).toBeGreaterThan(first.bottom);
      expect(innerSecond.top).toBeGreaterThan(innerFirst.bottom);
      expect(innerSecond.top - innerFirst.bottom).toBeCloseTo(kind === "gap" ? 64 : 16, 0);
      expect(outer.scrollWidth).toBeLessThanOrEqual(outer.clientWidth);
    }
  },
};
