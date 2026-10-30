import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input } from "../Input/Input";
import { Tabs } from "./Tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <Tabs.List aria-label="Release sections">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="checks" badge="4">
          Checks
        </Tabs.Tab>
        <Tabs.Tab value="artifacts">Artifacts</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        All 18 workspace packages passed token, stylesheet, and accessibility verification.
      </Tabs.Panel>
      <Tabs.Panel value="checks">4 automated gates completed in 42s with zero warnings.</Tabs.Panel>
      <Tabs.Panel value="artifacts">
        Signed tarballs and provenance attestations are ready for publishing.
      </Tabs.Panel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const checks = canvas.getByRole("tab", { name: /Checks/ });
    expect(overview).toHaveAttribute("aria-selected", "true");
    await userEvent.click(checks);
    expect(checks).toHaveAttribute("aria-selected", "true");
    expect(canvas.getByRole("tabpanel")).toHaveTextContent("4 automated gates completed");
    await userEvent.keyboard("{ArrowRight}");
    expect(canvas.getByRole("tab", { name: "Artifacts" })).toHaveFocus();
    expect(canvas.getByRole("tabpanel")).toHaveAccessibleName("Artifacts");
    await userEvent.keyboard("{Home}");
    expect(overview).toHaveFocus();
    expect(overview).toHaveAttribute("aria-selected", "true");
  },
};

export const Pill: Story = {
  render: () => (
    <Tabs defaultValue="24h" variant="pill" size="sm">
      <Tabs.List aria-label="Time window">
        <Tabs.Tab value="1h">1h</Tabs.Tab>
        <Tabs.Tab value="24h">24h</Tabs.Tab>
        <Tabs.Tab value="7d">7d</Tabs.Tab>
        <Tabs.Tab value="30d" disabled>
          30d
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="1h">Last 60 minutes: 99.98% availability across 4 regions.</Tabs.Panel>
      <Tabs.Panel value="24h">Last 24 hours: 1.42M requests with 18ms median latency.</Tabs.Panel>
      <Tabs.Panel value="7d">Last 7 days: zero incident escalations recorded.</Tabs.Panel>
      <Tabs.Panel value="30d">30-day archive requires audit retention access.</Tabs.Panel>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical">
      <Tabs.List aria-label="Workspace settings">
        <Tabs.Tab value="general">General</Tabs.Tab>
        <Tabs.Tab value="security" badge="2">
          Security
        </Tabs.Tab>
        <Tabs.Tab value="webhooks">Webhooks</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="general">
        Configure workspace display name, default region, and build retention window.
      </Tabs.Panel>
      <Tabs.Panel value="security">
        Enforce hardware SSH commit signing and short-lived OIDC deployment tokens.
      </Tabs.Panel>
      <Tabs.Panel value="webhooks">
        Deliver signed event payloads for release approvals and incident alerts.
      </Tabs.Panel>
    </Tabs>
  ),
};

export const RetainedDraft: Story = {
  render: () => (
    <Tabs defaultValue="profile" variant="pill">
      <Tabs.List aria-label="Account settings" activateOnFocus={false}>
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
        <Tabs.Tab value="billing" disabled>
          Billing
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="profile" keepMounted>
        <Input label="Display name" defaultValue="Ada" />
      </Tabs.Panel>
      <Tabs.Panel value="security">Manage account security settings.</Tabs.Panel>
      <Tabs.Panel value="billing">Billing settings unavailable.</Tabs.Panel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "Display name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Grace");
    await userEvent.click(canvas.getByRole("tab", { name: "Profile" }));
    await userEvent.keyboard("{ArrowRight}");
    const security = canvas.getByRole("tab", { name: "Security" });
    expect(security).toHaveFocus();
    expect(name).toBeVisible();
    await userEvent.keyboard("{Enter}");
    expect(security).toHaveAttribute("aria-selected", "true");
    expect(name).not.toBeVisible();
    await userEvent.keyboard("{ArrowRight}");
    expect(canvas.getByRole("tab", { name: "Billing" })).toHaveFocus();
    expect(security).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowRight}");
    expect(canvas.getByRole("tab", { name: "Profile" })).toHaveFocus();
    expect(security).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard(" ");
    expect(canvas.getByRole("textbox", { name: "Display name" })).toHaveValue("Grace");
  },
};

export const Nested: Story = {
  render: () => (
    <Tabs defaultValue="outer" orientation="vertical" variant="pill" size="sm">
      <Tabs.List aria-label="Workspace">
        <Tabs.Tab value="outer">Workspace</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="outer">
        <Tabs defaultValue="inner">
          <Tabs.List aria-label="Project">
            <Tabs.Tab value="inner">Summary</Tabs.Tab>
            <Tabs.Tab value="details">Details</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="inner">Nested project summary</Tabs.Panel>
          <Tabs.Panel value="details">Nested project details</Tabs.Panel>
        </Tabs>
      </Tabs.Panel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "Project" });
    expect(getComputedStyle(list).flexDirection).toBe("row");
    expect(getComputedStyle(list).borderRadius).toBe("0px");
    const summary = within(list).getByRole("tab", { name: "Summary" });
    const outer = canvas.getByRole("tab", { name: "Workspace" });
    if (!matchMedia("(pointer: coarse)").matches) {
      expect(summary.getBoundingClientRect().height).toBeGreaterThan(
        outer.getBoundingClientRect().height,
      );
    }
    await userEvent.click(within(list).getByRole("tab", { name: "Details" }));
    expect(canvas.getByText("Nested project details")).toBeVisible();
  },
};
