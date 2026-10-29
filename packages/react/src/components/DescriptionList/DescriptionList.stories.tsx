import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Link } from "../Link/Link";
import { Status } from "../Status/Status";
import { DescriptionList } from "./DescriptionList";

const meta = {
  title: "Components/DescriptionList",
  component: DescriptionList,
  tags: ["autodocs"],
  args: { layout: "responsive", density: "comfortable", dividers: true },
  render: (args) => (
    <DescriptionList {...args} aria-label="Project details">
      <DescriptionList.Item>
        <DescriptionList.Term>Maintainers</DescriptionList.Term>
        <DescriptionList.Detail>
          <Link href="#ada">Ada Chen</Link>
        </DescriptionList.Detail>
        <DescriptionList.Detail>Lin Patel</DescriptionList.Detail>
      </DescriptionList.Item>
      <DescriptionList.Item>
        <DescriptionList.Term>Status</DescriptionList.Term>
        <DescriptionList.Detail>
          <Status tone="warning">
            Awaiting approval from the international platform operations team
          </Status>
        </DescriptionList.Detail>
      </DescriptionList.Item>
      <DescriptionList.Item>
        <DescriptionList.Term>Open tasks</DescriptionList.Term>
        <DescriptionList.Detail>{0}</DescriptionList.Detail>
      </DescriptionList.Item>
    </DescriptionList>
  ),
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("term")).toHaveLength(3);
    const list = canvas.getByLabelText("Project details");
    expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
    const details = canvas.getAllByRole("definition");
    expect(details).toHaveLength(4);
    const statusDetail = list.querySelector(".kb-status")?.parentElement;
    if (!statusDetail) throw new Error("Missing rich status value");
    expect(statusDetail.scrollWidth).toBeLessThanOrEqual(statusDetail.clientWidth + 1);
    expect(
      Math.abs(
        (details[0]?.getBoundingClientRect().left ?? 0) -
          (details[1]?.getBoundingClientRect().left ?? 0),
      ),
    ).toBeLessThan(1);
    canvas.getByRole("link", { name: "Ada Chen" }).focus();
    expect(canvas.getByRole("link", { name: "Ada Chen" })).toHaveFocus();
  },
};
export const Responsive: Story = {
  render: (args) => (
    <div style={{ width: "100%", display: "grid", gap: "1rem" }}>
      <div style={{ width: 288, maxWidth: "100%" }}>
        <DescriptionList {...args} aria-label="Compact details">
          <DescriptionList.Item>
            <DescriptionList.Term>Approval status</DescriptionList.Term>
            <DescriptionList.Detail>
              <Status tone="warning" appearance="chip" icon={<span>!</span>}>
                Awaiting approval from the international platform operations team
              </Status>
            </DescriptionList.Detail>
          </DescriptionList.Item>
          <DescriptionList.Item>
            <DescriptionList.Term>Long identifier</DescriptionList.Term>
            <DescriptionList.Detail>
              project_0123456789abcdefghijklmnopqrstuvwxyz_0123456789abcdefghijklmnopqrstuvwxyz
            </DescriptionList.Detail>
          </DescriptionList.Item>
        </DescriptionList>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByLabelText("Compact details");
    const term = list.querySelector("dt");
    const detail = list.querySelector("dd");
    if (!term || !detail) throw new Error("Missing details");
    expect(detail.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      term.getBoundingClientRect().bottom,
    );
    expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
  },
};
export const Nested: Story = {
  args: { layout: "stacked", density: "dense" },
  render: (args) => (
    <DescriptionList {...args} aria-label="Service">
      <DescriptionList.Item>
        <DescriptionList.Term>Deployment details</DescriptionList.Term>
        <DescriptionList.Detail>
          <DescriptionList layout="horizontal" density="comfortable" aria-label="Deployment">
            <DescriptionList.Item>
              <DescriptionList.Term>Region</DescriptionList.Term>
              <DescriptionList.Detail>West</DescriptionList.Detail>
            </DescriptionList.Item>
          </DescriptionList>
        </DescriptionList.Detail>
      </DescriptionList.Item>
    </DescriptionList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outer = canvas.getByLabelText("Service");
    const inner = canvas.getByLabelText("Deployment");
    const outerItem = outer.firstElementChild;
    const innerItem = inner.firstElementChild;
    if (!outerItem || !innerItem) throw new Error("Missing detail groups");
    expect(Number.parseFloat(getComputedStyle(innerItem).paddingBlockStart)).toBeGreaterThan(
      Number.parseFloat(getComputedStyle(outerItem).paddingBlockStart),
    );
    const term = inner.querySelector("dt");
    const detail = inner.querySelector("dd");
    if (!term || !detail) throw new Error("Missing nested values");
    expect(detail.getBoundingClientRect().left).toBeGreaterThan(term.getBoundingClientRect().left);
  },
};
