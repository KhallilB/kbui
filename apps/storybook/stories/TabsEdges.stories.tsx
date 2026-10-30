import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Tabs } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = { title: "Validation/Tabs", component: Tabs } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RightToLeft: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <Tabs defaultValue="overview">
          <Tabs.List aria-label="Sections">
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="activity">Activity</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="overview">Project overview</Tabs.Panel>
          <Tabs.Panel value="activity">Project activity</Tabs.Panel>
        </Tabs>
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const indicator = canvasElement.querySelector(".kb-tabs-indicator");
    await waitFor(() =>
      expect(
        Math.abs(
          (indicator?.getBoundingClientRect().left ?? 0) - overview.getBoundingClientRect().left,
        ),
      ).toBeLessThan(1),
    );
    await userEvent.click(overview);
    await userEvent.keyboard("{ArrowLeft}");
    const activity = canvas.getByRole("tab", { name: "Activity" });
    expect(activity).toHaveFocus();
    await waitFor(() =>
      expect(
        Math.abs(
          (indicator?.getBoundingClientRect().left ?? 0) - activity.getBoundingClientRect().left,
        ),
      ).toBeLessThan(1),
    );
  },
};
