import { Button, CopyableText, FilterChip, Input, Select, Tabs, ToggleButton } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

type Size = "sm" | "md" | "lg";
const fineHeights: Record<Size, number> = { sm: 28, md: 32, lg: 40 };
const touchMin = 44;
const controls =
  ".kb-button, .kb-togglebutton, .kb-copyabletext-copy, .kb-input-control, .kb-select-control, .kb-tabs-tab, .kb-filterchip-select";

function Row({ size }: { size: Size }) {
  return (
    <div
      data-row={size}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}
    >
      <Button size={size}>Save</Button>
      <ToggleButton size={size}>Pin</ToggleButton>
      <CopyableText appearance="plain" value="kb_1234" copySize={size} />
      <Input label={`Search ${size}`} visuallyHidden size={size} />
      {size === "md" ? (
        <Select
          label="View"
          value={null}
          onValueChange={() => {}}
          options={[{ value: "recent", label: "Recent" }]}
        />
      ) : null}
      {size === "lg" ? null : (
        <Tabs defaultValue="a" variant="pill" size={size}>
          <Tabs.List aria-label={`Sections ${size}`}>
            <Tabs.Tab value="a">Overview</Tabs.Tab>
            <Tabs.Tab value="b">Checks</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      )}
      {size === "sm" ? <FilterChip label="Open" selected onSelectedChange={() => {}} /> : null}
    </div>
  );
}

function ControlSizes() {
  return (
    <div style={{ display: "grid", gap: 16, padding: 16 }}>
      <Row size="sm" />
      <Row size="md" />
      <Row size="lg" />
    </div>
  );
}

const meta = {
  title: "Site/Control sizes",
  component: ControlSizes,
} satisfies Meta<typeof ControlSizes>;
export default meta;
type Story = StoryObj<typeof meta>;

// Controls in one row share the size's height; touch and narrow screens raise every one to the minimum.
export const SharedHeights: Story = {
  play: async ({ canvasElement }) => {
    const touch = matchMedia("(pointer: coarse), (max-width: 580px)").matches;
    for (const size of ["sm", "md", "lg"] as const) {
      const row = canvasElement.querySelector<HTMLElement>(`[data-row="${size}"]`);
      if (!row) throw new Error(`Missing ${size} row`);
      const expected = touch ? Math.max(touchMin, fineHeights[size]) : fineHeights[size];
      const measured = [...row.querySelectorAll<HTMLElement>(controls)].map((control) => ({
        control: control.className.split(" ")[0],
        height: Math.round(control.getBoundingClientRect().height),
      }));
      expect(measured).toHaveLength(size === "lg" ? 4 : 7);
      expect(measured).toEqual(measured.map(({ control }) => ({ control, height: expected })));
    }
  },
};
