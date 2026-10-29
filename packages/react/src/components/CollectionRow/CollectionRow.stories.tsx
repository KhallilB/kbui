import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { CollectionList } from "../CollectionList/CollectionList";
import { Link } from "../Link/Link";
import { Menu } from "../Menu/Menu";
import { Status } from "../Status/Status";
import { CollectionRow } from "./CollectionRow";

const meta = {
  title: "Components/CollectionRow",
  component: CollectionRow,
  tags: ["autodocs"],
  args: {
    title: "Customer portal",
    description: "Project workspace and release checklist",
    metadata: <Status tone="success">Ready for review</Status>,
  },
  render: (args) => (
    <CollectionList aria-label="Project">
      <CollectionRow {...args} />
    </CollectionList>
  ),
} satisfies Meta<typeof CollectionRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const SelectionAndActions: Story = {
  render: function SelectableRecords() {
    const [selected, setSelected] = useState(false);
    const [message, setMessage] = useState("No action taken");
    return (
      <div style={{ width: "100%" }}>
        <p role="status">{message}</p>
        <CollectionList aria-label="Team projects">
          <CollectionRow
            title={<Link href="#portal">Customer portal</Link>}
            description="Owned by Ada Chen"
            selected={selected}
            leading={
              <Checkbox
                label="Select Customer portal"
                visuallyHidden
                checked={selected}
                onCheckedChange={setSelected}
              />
            }
            metadata={<Status tone="success">Ready for review</Status>}
            actions={
              <>
                <Button variant="secondary" onClick={() => setMessage("Editing Customer portal")}>
                  Edit portal
                </Button>
                <Menu>
                  <Menu.Trigger render={<Button variant="ghost" />}>
                    More portal actions
                  </Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item onClick={() => setMessage("Portal shared")}>Share project</Menu.Item>
                    <Menu.Item disabled>Archive unavailable</Menu.Item>
                  </Menu.Content>
                </Menu>
              </>
            }
          />
          <CollectionRow
            title={<Link href="#search">Search improvements</Link>}
            description="Owned by Lin Patel; selection unavailable"
            metadata={<Status tone="warning">Needs changes</Status>}
            actions={
              <Button variant="secondary" disabled>
                Edit search
              </Button>
            }
          />
        </CollectionList>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const checkbox = canvas.getByRole("checkbox", { name: "Select Customer portal" });
    checkbox.focus();
    await userEvent.keyboard(" ");
    expect(checkbox).toBeChecked();
    await userEvent.tab();
    expect(canvas.getByRole("link", { name: "Customer portal" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Edit portal" }));
    expect(canvas.getByRole("status")).toHaveTextContent("Editing Customer portal");
    expect(checkbox).toBeChecked();
    const trigger = canvas.getByRole("button", { name: "More portal actions" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(page.getByRole("menuitem", { name: "Share project" })).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    const titles = [...canvasElement.querySelectorAll(".kb-collectionrow-title")];
    expect(
      Math.abs(
        (titles[0]?.getBoundingClientRect().left ?? 0) -
          (titles[1]?.getBoundingClientRect().left ?? 0),
      ),
    ).toBeLessThan(1);
  },
};
export const LongContent: Story = {
  args: {
    title:
      "customer_portal_0123456789abcdefghijklmnopqrstuvwxyz_0123456789abcdefghijklmnopqrstuvwxyz",
    description:
      "Review translated content, long record names and supporting details without clipping or changing reading order.",
    metadata: (
      <Status tone="warning" appearance="chip" icon={<span>!</span>}>
        Awaiting approval from the international platform operations team
      </Status>
    ),
    actions: <Button variant="secondary">Review project implementation details</Button>,
  },
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole("listitem");
    expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
    const button = within(canvasElement).getByRole("button", {
      name: "Review project implementation details",
    });
    expect(button.scrollHeight).toBeLessThanOrEqual(button.clientHeight + 1);
    const metadata = row.querySelector(".kb-collectionrow-metadata");
    const status = metadata?.querySelector(".kb-status");
    if (!metadata || !status) throw new Error("Missing status metadata");
    expect(status.getBoundingClientRect().width).toBeLessThanOrEqual(metadata.clientWidth + 1);
    expect(status.scrollWidth).toBeLessThanOrEqual(status.clientWidth + 1);
  },
};
