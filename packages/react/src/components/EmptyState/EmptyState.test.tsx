import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test } from "vitest";
import {
  EmptyState,
  type EmptyStateSize,
  type EmptyStateTone,
  type EmptyStateVariant,
} from "./EmptyState";

const sizes: EmptyStateSize[] = ["sm", "md", "lg"];
const variants: EmptyStateVariant[] = ["surface", "subtle", "plain"];
const tones: EmptyStateTone[] = ["neutral", "info", "warning", "danger"];

describe("EmptyState", () => {
  test("renders title as h3 by default, description, actions, and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <EmptyState
        ref={ref}
        title="No deployments yet"
        description="Connect a repository to trigger your first build."
        actions={<button type="button">Connect repository</button>}
      />,
    );
    const root = container.querySelector(".kb-emptystate");
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-variant", "surface");
    expect(root).toHaveAttribute("data-tone", "neutral");
    expect(root).not.toHaveAttribute("role");

    const heading = screen.getByRole("heading", { level: 3, name: "No deployments yet" });
    expect(heading).toHaveClass("kb-emptystate-title");
    expect(container.querySelector(".kb-emptystate-description")).toHaveTextContent(
      "Connect a repository to trigger your first build.",
    );
    expect(screen.getByRole("button", { name: "Connect repository" })).toBeInTheDocument();
  });

  test("renders optional icon as decorative, eyebrow, body children, footer, and custom headingLevel", () => {
    const { container } = render(
      <EmptyState
        headingLevel={2}
        eyebrow="Search results"
        title="No matching incidents"
        description="Try clearing the severity filter or broadening your date range."
        icon={<svg data-testid="empty-icon" />}
        actions={<button type="button">Reset filters</button>}
        footer="Showing 0 of 48 total incidents"
      >
        <div>Active filter: Critical</div>
      </EmptyState>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "No matching incidents" })).toBeVisible();
    const icon = container.querySelector(".kb-emptystate-icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
    expect(container.querySelector(".kb-emptystate-eyebrow")).toHaveTextContent("Search results");
    expect(container.querySelector(".kb-emptystate-body")).toHaveTextContent(
      "Active filter: Critical",
    );
    expect(container.querySelector(".kb-emptystate-footer")).toHaveTextContent(
      "Showing 0 of 48 total incidents",
    );
  });

  test("live adds role=status for dynamic empty or recoverable error states", () => {
    render(
      <EmptyState
        live
        tone="danger"
        title="Unable to load audit log"
        description="The telemetry service timed out before returning events."
        actions={<button type="button">Retry</button>}
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveClass("kb-emptystate");
    expect(status).toHaveAttribute("data-tone", "danger");
  });

  test.each(sizes)("applies data-size=%s", (size) => {
    const { container } = render(<EmptyState size={size} title="Empty" />);
    expect(container.querySelector(".kb-emptystate")).toHaveAttribute("data-size", size);
  });

  test.each(variants)("applies data-variant=%s", (variant) => {
    const { container } = render(<EmptyState variant={variant} title="Empty" />);
    expect(container.querySelector(".kb-emptystate")).toHaveAttribute("data-variant", variant);
  });

  test.each(tones)("applies data-tone=%s", (tone) => {
    const { container } = render(<EmptyState tone={tone} title="Empty" />);
    expect(container.querySelector(".kb-emptystate")).toHaveAttribute("data-tone", tone);
  });

  test("forwards classNames to every rendered slot", () => {
    const { container } = render(
      <EmptyState
        icon={<svg />}
        eyebrow="Eyebrow"
        title="Title"
        description="Description"
        actions={<button type="button">Action</button>}
        footer="Footer"
        classNames={{
          icon: "slot-icon",
          header: "slot-header",
          eyebrow: "slot-eyebrow",
          title: "slot-title",
          description: "slot-description",
          body: "slot-body",
          actions: "slot-actions",
          footer: "slot-footer",
        }}
      >
        Body
      </EmptyState>,
    );
    for (const part of [
      "icon",
      "header",
      "eyebrow",
      "title",
      "description",
      "body",
      "actions",
      "footer",
    ]) {
      expect(container.querySelector(`.kb-emptystate-${part}`)).toHaveClass(`slot-${part}`);
    }
  });
});
