import { Button, Input, Menu } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SiteFrame } from "../site/SiteFrame";

function FocusExample() {
  return (
    <SiteFrame current="playground" siteRoot="../" storybookRoot="./">
      <main id="main" className="inner-page">
        <div>
          <Input label="Search orders" />
          <Menu>
            <Menu.Trigger render={<Button variant="secondary" />}>Row actions</Menu.Trigger>
            <Menu.Content>
              <Menu.Item>Copy order</Menu.Item>
              <Menu.Item>View details</Menu.Item>
            </Menu.Content>
          </Menu>
          <Button>Save order</Button>
          <button type="button">Plain action</button>
        </div>
      </main>
    </SiteFrame>
  );
}

const meta = {
  title: "Site/Focus States",
  component: FocusExample,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FocusExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CompactIndicators: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const forced = matchMedia("(forced-colors: active)").matches;
    if (forced)
      expect(getComputedStyle(canvas.getByRole("button", { name: "Save order" })).color).toBe(
        getComputedStyle(canvas.getByRole("button", { name: "Plain action" })).color,
      );
    const input = canvas.getByRole("textbox", { name: "Search orders" });
    await userEvent.click(input);
    expect(getComputedStyle(input).outlineOffset).toBe("-2px");
    await userEvent.keyboard("{Tab}");
    const trigger = canvas.getByRole("button", { name: "Row actions" });
    expect(trigger).toHaveFocus();
    expect(getComputedStyle(trigger).outlineWidth).toBe("2px");
    expect(getComputedStyle(trigger).outlineOffset).toBe("-2px");
    await userEvent.keyboard("{ArrowDown}");
    const item = await within(document.body).findByRole("menuitem", { name: "Copy order" });
    await waitFor(() => expect(item).toHaveFocus());
    expect(getComputedStyle(item).outlineWidth).toBe("2px");
    expect(getComputedStyle(item).outlineOffset).toBe("-2px");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(trigger).toHaveFocus();
      expect(within(document.body).queryByRole("menu")).toBeNull();
    });
    await userEvent.keyboard("{Tab}");
    const save = canvas.getByRole("button", { name: "Save order" });
    expect(save).toHaveFocus();
    expect(getComputedStyle(save).outlineOffset).toBe("-2px");
    if (!forced) expect(getComputedStyle(save).outlineColor).toBe(getComputedStyle(save).color);
    await userEvent.keyboard("{Tab}");
    const plain = canvas.getByRole("button", { name: "Plain action" });
    expect(plain).toHaveFocus();
    expect(getComputedStyle(plain).outlineWidth).toBe("2px");
  },
};
