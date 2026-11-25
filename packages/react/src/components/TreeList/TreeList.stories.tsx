import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Link } from "../Link/Link";
import { TreeList, type TreeListItem } from "./TreeList";

const guides: readonly TreeListItem[] = [
  {
    id: "workspace",
    label: "Workspace setup",
    children: [
      { id: "profiles", label: <Link href="#profiles">Profiles</Link> },
      {
        id: "permissions",
        label: "Permissions",
        children: [
          { id: "teams", label: <Link href="#teams">Team roles</Link> },
          { id: "access", label: <Link href="#access">Review access</Link> },
        ],
      },
    ],
  },
  {
    id: "settings",
    label: "Account settings",
    children: [{ id: "notifications", label: "Notifications" }],
  },
];

const playbook: readonly TreeListItem[] = [
  {
    id: "operations",
    label: "Operations",
    children: [
      {
        id: "incident",
        label: "Incident response",
        children: [
          {
            id: "communication",
            label: "Communications",
            children: [
              {
                id: "template",
                label: "Long incident update template for responders and stakeholders",
              },
            ],
          },
        ],
      },
    ],
  },
];

const releaseTopics: readonly TreeListItem[] = [
  {
    id: "release",
    label: "Release readiness",
    children: [
      {
        id: "approval",
        label: (
          <>
            Read the <mark>approval checklist</mark> before publishing.
          </>
        ),
      },
      { id: "notes", label: <Link href="#release-notes">Release notes</Link> },
      {
        id: "handoff",
        label: "Handoff to the support team and regional release coordinators",
        children: [
          {
            id: "owner",
            label: (
              <>
                Notify the <strong>on-call owner</strong>.
              </>
            ),
          },
        ],
      },
    ],
  },
  {
    id: "support",
    label: "Support and escalation",
    children: [{ id: "contacts", label: <Link href="#contacts">Escalation contacts</Link> }],
  },
];

const meta = {
  title: "Components/TreeList",
  component: TreeList,
  tags: ["autodocs"],
  args: { "aria-label": "Setup topics", items: guides },
} satisfies Meta<typeof TreeList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const workspace = canvas.getByRole("button", { name: "Workspace setup" });
    workspace.focus();
    await userEvent.keyboard("{Enter}");
    await expect(workspace).toHaveAttribute("aria-expanded", "true");
    await expect(workspace).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Profiles" })).toHaveFocus();
    await userEvent.tab();
    const permissions = canvas.getByRole("button", { name: "Permissions" });
    await expect(permissions).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(permissions).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Team roles" })).toBeVisible();

    await userEvent.tab({ shift: true });
    await userEvent.tab({ shift: true });
    await expect(workspace).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(workspace).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("button", { name: "Permissions" })).toBeNull();
    const branch = canvasElement.ownerDocument.getElementById(
      workspace.getAttribute("aria-controls") ?? "",
    );
    await waitFor(() => expect(branch).toHaveAttribute("hidden"));
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Account settings" })).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: function ControlledTree(args) {
    const [expandedIds, setExpandedIds] = useState(["operations"]);
    return (
      <TreeList
        {...args}
        aria-label="Runbook"
        items={playbook}
        expandedIds={expandedIds}
        onExpandedChange={setExpandedIds}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const incident = canvas.getByRole("button", { name: "Incident response" });
    await expect(incident).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(incident);
    await expect(incident).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("button", { name: "Communications" })).toBeVisible();
  },
};

export const DepthCap: Story = {
  args: {
    "aria-label": "Runbook",
    items: playbook,
    defaultExpandedIds: ["operations", "incident", "communication"],
    maxVisualDepth: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const operations = canvas.getByRole("button", { name: "Operations" });
    const incident = canvas.getByRole("button", { name: "Incident response" });
    const communications = canvas.getByRole("button", { name: "Communications" });
    const incidentRow = incident.closest("li");
    if (!incidentRow) throw new Error("Missing incident row");

    await expect(incident.getBoundingClientRect().left).toBeGreaterThan(
      operations.getBoundingClientRect().left,
    );
    await expect(communications.getBoundingClientRect().left).toBe(
      incident.getBoundingClientRect().left,
    );
    await expect(getComputedStyle(incidentRow, "::before").borderInlineStartWidth).toBe("1px");
    await expect(canvas.getByText(/Long incident update template/)).toBeVisible();
  },
};

export const FormattedLabels: Story = {
  args: {
    "aria-label": "Release guide",
    items: releaseTopics,
    defaultExpandedIds: ["release", "handoff"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checklist = canvas.getByText("approval checklist");
    const firstRow = checklist.closest("li");
    const release = canvas.getByRole("button", { name: "Release readiness" });
    const support = canvas.getByRole("button", { name: "Support and escalation" });
    const releaseRow = release.closest("li");
    const handoffRow = canvas
      .getByRole("button", { name: /Handoff to the support team/ })
      .closest("li");
    if (!firstRow || !releaseRow || !handoffRow || !checklist.previousSibling) {
      throw new Error("Missing formatted TreeList rows");
    }
    const prefix = canvasElement.ownerDocument.createRange();
    prefix.selectNodeContents(checklist.previousSibling);
    const prefixBounds = prefix.getBoundingClientRect();
    const highlightBounds = checklist.getBoundingClientRect();
    expect(Math.abs(highlightBounds.left - prefixBounds.right)).toBeLessThan(2);
    expect(highlightBounds.top).toBeLessThan(prefixBounds.bottom);
    expect(highlightBounds.bottom).toBeGreaterThan(prefixBounds.top);
    expect(
      support.getBoundingClientRect().top - releaseRow.getBoundingClientRect().bottom,
    ).toBeGreaterThan(0);
    expect(getComputedStyle(firstRow, "::after").borderInlineStartWidth).toBe("1px");
    expect(getComputedStyle(handoffRow, "::after").content).toBe("none");
  },
};
