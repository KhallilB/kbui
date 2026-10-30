import { Button, Heading, Inline, Text, Toolbar } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { PageHeader } from "./PageHeader";

function ProjectPage() {
  const [message, setMessage] = useState("No action yet.");
  return (
    <main>
      <PageHeader
        title="Projects"
        description="Plan work, track delivery, and keep your team aligned."
        metadata={
          <Text size="sm" tone="muted">
            12 projects · Updated today
          </Text>
        }
        actions={
          <Inline gap="sm">
            <Button variant="secondary" onClick={() => setMessage("Project report exported.")}>
              Export
            </Button>
            <Button onClick={() => setMessage("New project started.")}>New project</Button>
          </Inline>
        }
      />
      <Text role="status">{message}</Text>
    </main>
  );
}

const meta = {
  title: "Recipes/PageHeader",
  component: PageHeader,
  args: { title: "Projects" },
  tags: ["!autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Copy this application-owned recipe. Compare the packaged PageHeader component for a supported API. See the Page header guide for composition, customization, and verification.",
      },
    },
  },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectList: Story = {
  render: () => <ProjectPage />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
    const secondary = canvas.getByRole("button", { name: "Export" });
    secondary.focus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "New project" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("New project started.");
    await userEvent.click(secondary);
    await expect(canvas.getByRole("status")).toHaveTextContent("Project report exported.");
  },
};

export const RecordDetail: Story = {
  render: () => (
    <main>
      <PageHeader
        title="Website accessibility audit"
        description="Review findings and prepare the next delivery."
        metadata={
          <Inline gap="sm">
            <Text as="span" size="sm">
              Status: In review
            </Text>
            <Text as="span" size="sm" tone="muted">
              Owner: Maya Chen
            </Text>
            <Text as="span" size="sm" tone="muted">
              Updated <time dateTime="2026-10-29">29 October 2026</time>
            </Text>
          </Inline>
        }
        actions={
          <Toolbar aria-label="Audit actions">
            <Toolbar.Button variant="secondary">Print</Toolbar.Button>
            <Toolbar.Button variant="primary">Approve</Toolbar.Button>
          </Toolbar>
        }
      />
      <Button variant="ghost">View findings</Button>
    </main>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("toolbar", { name: "Audit actions" })).toBeVisible();
    canvas.getByRole("button", { name: "Print" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Approve" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "View findings" })).toHaveFocus();
  },
};

export const TitleOnly: Story = {
  render: () => (
    <main>
      <PageHeader title="Workspace" />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Workspace" })).toBeVisible();
    expect(canvasElement.querySelector(".page-header-actions")).toBeNull();
    expect(canvasElement.querySelector(".page-header-description")).toBeNull();
    expect(canvasElement.querySelector(".page-header-metadata")).toBeNull();
  },
};

export const Pending: Story = {
  render: () => (
    <main>
      <PageHeader
        title="Release checklist"
        description="Review the release before publishing."
        metadata={
          <Text role="status" size="sm">
            Publishing release…
          </Text>
        }
        actions={
          <Inline gap="sm">
            <Button variant="secondary" disabled>
              Save draft
            </Button>
            <Button disabled>Publishing…</Button>
          </Inline>
        }
      />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Publishing release…");
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
  },
};

export const NarrowLongContent: Story = {
  render: () => (
    <main style={{ inlineSize: "20rem", maxInlineSize: "100%" }}>
      <PageHeader
        title="International customer onboarding and migration readiness"
        description="All supporting information stays readable when this header sits inside a narrow pane."
        metadata={
          <Text size="sm" tone="muted">
            Reference: enterprise_customer_onboarding_migration_readiness_2026_10_29
          </Text>
        }
        actions={
          <Inline gap="sm">
            <Button variant="secondary">Download report</Button>
            <Button>Start review</Button>
          </Inline>
        }
      />
    </main>
  ),
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const main = canvas.getByRole("main");
    const heading = canvas.getByRole("heading", { level: 1 });
    const first = canvas.getByRole("button", { name: "Download report" });
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth + 1);
    expect(first.getBoundingClientRect().top).toBeGreaterThan(
      heading.getBoundingClientRect().bottom,
    );
    first.focus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Start review" })).toHaveFocus();
  },
};

export const EmbeddedAndRtl: Story = {
  render: () => (
    <main dir="rtl">
      <Heading level={1}>مساحة العمل</Heading>
      <section aria-label="تفاصيل المشروع">
        <PageHeader
          level={2}
          title="مراجعة المشروع"
          description="متابعة التقدم ومراجعة الخطوات التالية."
          metadata={
            <Text size="sm" tone="muted">
              الحالة: قيد المراجعة
            </Text>
          }
          actions={
            <Inline gap="sm">
              <Button variant="secondary">تصدير</Button>
              <Button>مراجعة</Button>
            </Inline>
          }
        />
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "مراجعة المشروع" })).toBeVisible();
    expect(getComputedStyle(canvas.getByRole("main")).direction).toBe("rtl");
  },
};
