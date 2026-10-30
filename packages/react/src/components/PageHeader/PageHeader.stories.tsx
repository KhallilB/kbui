import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Link } from "../Link/Link";
import { Tabs } from "../Tabs/Tabs";
import { PageHeader } from "./PageHeader";

const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "Orders",
    description: "Review, fulfil and refund orders from every sales channel.",
    size: "md",
    headingLevel: 1,
    divider: false,
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    headingLevel: { control: "select", options: [1, 2, 3] },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = { width: "100%" } as const;
const breadcrumbItem = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: "var(--kb-space-2)",
  margin: 0,
} as const;

export const Default: Story = {
  render: (args) => (
    <div style={box}>
      <PageHeader
        {...args}
        actions={
          <>
            <Button variant="secondary">Export</Button>
            <Button>Create order</Button>
          </>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Orders" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Create order" })).toBeVisible();
  },
};

export const DetailWithStatus: Story = {
  render: () => (
    <div style={box}>
      <PageHeader
        navigation={<Link href="#orders">← All orders</Link>}
        eyebrow="Order"
        title="#10482"
        meta={
          <>
            <Badge tone="success">Paid</Badge>
            <Badge tone="warning">Unfulfilled</Badge>
          </>
        }
        description="Placed on 12 October 2026 by Ana Ruiz · 3 items · €184.00"
        actions={
          <>
            <Button variant="secondary">Refund</Button>
            <Button>Fulfil order</Button>
          </>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveAccessibleName("#10482");
    await expect(canvas.getByRole("link", { name: "← All orders" })).toBeVisible();
  },
};

export const Breadcrumbs: Story = {
  render: () => (
    <div style={box}>
      <PageHeader
        navigation={
          <nav aria-label="Breadcrumb">
            <ol
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: "var(--kb-space-2)",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              <li style={breadcrumbItem}>
                <Link href="#settings">Settings</Link>
                <span aria-hidden="true">/</span>
              </li>
              <li style={breadcrumbItem}>
                <Link href="#team">Team</Link>
                <span aria-hidden="true">/</span>
              </li>
              <li style={breadcrumbItem} aria-current="page">
                Roles
              </li>
            </ol>
          </nav>
        }
        title="Roles"
        description="Control what each role can see and change."
        actions={<Button>Add role</Button>}
      />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: "Breadcrumb" });
    const items = within(navigation).getAllByRole("listitem");
    await expect(items).toHaveLength(3);
    await expect(items[2]).toHaveAttribute("aria-current", "page");
    const tops = items.map((item) => item.getBoundingClientRect().top);
    await expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
    await expect(navigation.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    await expect(
      Math.abs(
        navigation.getBoundingClientRect().left -
          canvas.getByRole("heading", { name: "Roles" }).getBoundingClientRect().left,
      ),
    ).toBeLessThanOrEqual(1);
    within(navigation).getByRole("link", { name: "Settings" }).focus();
    await userEvent.tab();
    await expect(within(navigation).getByRole("link", { name: "Team" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Add role" })).toHaveFocus();
  },
};

export const WithTabs: Story = {
  render: () => (
    <div style={box}>
      <Tabs defaultValue="profile">
        <PageHeader
          divider
          title="Settings"
          description="Manage your profile, notifications and connected accounts."
        >
          <Tabs.List aria-label="Settings sections">
            <Tabs.Tab value="profile">Profile</Tabs.Tab>
            <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
            <Tabs.Tab value="accounts">Accounts</Tabs.Tab>
          </Tabs.List>
        </PageHeader>
        <Tabs.Panel value="profile">Profile settings</Tabs.Panel>
        <Tabs.Panel value="notifications">Notification settings</Tabs.Panel>
        <Tabs.Panel value="accounts">Connected accounts</Tabs.Panel>
      </Tabs>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ ...box, display: "grid", gap: "2rem" }}>
      {(["sm", "md", "lg"] as const).map((size, index) => (
        <PageHeader
          key={size}
          size={size}
          headingLevel={index === 0 ? 1 : 2}
          eyebrow={`Size ${size}`}
          title="Quarterly revenue"
          description="Gross revenue across every region, refreshed hourly."
          actions={<Button variant="secondary">Download report</Button>}
        />
      ))}
    </div>
  ),
};

export const NarrowWrap: Story = {
  render: () => (
    <div style={{ maxWidth: "20rem" }}>
      <PageHeader
        title="Payment methods and billing addresses"
        meta={<Badge>3 saved</Badge>}
        description="Cards and addresses used at checkout."
        actions={
          <>
            <Button variant="secondary">Manage</Button>
            <Button>Add card</Button>
          </>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const heading = canvasElement.querySelector<HTMLElement>(".kb-pageheader-heading");
    const actions = canvasElement.querySelector<HTMLElement>(".kb-pageheader-actions");
    const root = canvasElement.querySelector<HTMLElement>(".kb-pageheader");
    if (!heading || !actions || !root) throw new Error("PageHeader parts missing");
    const headingBox = heading.getBoundingClientRect();
    const actionsBox = actions.getBoundingClientRect();
    await expect(actionsBox.top).toBeGreaterThanOrEqual(headingBox.bottom);
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
  },
};
