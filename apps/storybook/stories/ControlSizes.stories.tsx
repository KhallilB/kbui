import {
  Button,
  CopyableText,
  FileInput,
  FilterChip,
  Input,
  Select,
  Tabs,
  ToggleButton,
} from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

type Size = "sm" | "md" | "lg";
const fineHeights: Record<Size, number> = { sm: 24, md: 28, lg: 36 };
const touchMin = 44;
const controls =
  ".kb-button, .kb-togglebutton, .kb-copyabletext-copy, .kb-input-control, .kb-select-control, .kb-tabs-tab, .kb-filterchip-select";

function Row({ size }: { size: Size }) {
  const sizeProps = size === "md" ? {} : { size };
  return (
    <div
      data-row={size}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}
    >
      <Button {...sizeProps}>Save</Button>
      <ToggleButton {...sizeProps}>Pin</ToggleButton>
      {size === "md" ? (
        <Button size="icon" variant="secondary" aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="m4 4 8 8m0-8-8 8" />
          </svg>
        </Button>
      ) : null}
      <CopyableText appearance="plain" value="kb_1234" copySize={sizeProps.size} />
      <Input label={`Search ${size}`} visuallyHidden size={size} />
      {size === "lg" ? (
        <FileInput
          label="Attachments"
          visuallyHidden
          items={[]}
          onFiles={() => {}}
          onRemove={() => {}}
        />
      ) : null}
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
      expect(measured).toHaveLength({ sm: 7, md: 8, lg: 5 }[size]);
      expect(measured).toEqual(measured.map(({ control }) => ({ control, height: expected })));
      if (size === "md") {
        const icon = row.querySelector(".kb-button[data-size='icon']");
        expect(icon?.getBoundingClientRect().width).toBe(expected);
      }
    }
  },
};
