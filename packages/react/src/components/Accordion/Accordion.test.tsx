import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, test, vi } from "vitest";
import { Accordion } from "./Accordion";

function Items() {
  return (
    <>
      {["Shipping", "Returns", "Unavailable"].map((name) => (
        <Accordion.Item key={name} value={name} disabled={name === "Unavailable"}>
          <Accordion.Header>
            <Accordion.Trigger>{name}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>{name} details</Accordion.Panel>
        </Accordion.Item>
      ))}
    </>
  );
}

test("single expansion associates headings, trigger state and named panels", async () => {
  render(
    <Accordion>
      <Items />
    </Accordion>,
  );
  const shipping = screen.getByRole("button", { name: "Shipping" });
  expect(screen.getByRole("heading", { name: "Shipping" })).toContainElement(shipping);
  await userEvent.click(shipping);
  const panel = screen.getByRole("region", { name: "Shipping" });
  expect(shipping).toHaveAttribute("aria-controls", panel.id);
  expect(shipping).toHaveAttribute("aria-expanded", "true");
  await userEvent.click(screen.getByRole("button", { name: "Returns" }));
  await waitFor(() =>
    expect(screen.queryByRole("region", { name: "Shipping" })).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("region", { name: "Returns" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Returns" }));
  await waitFor(() => expect(screen.queryByRole("region")).not.toBeInTheDocument());
});

test("multiple mode preserves independent panels and disabled items reject input", async () => {
  render(
    <Accordion multiple>
      <Items />
    </Accordion>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Shipping" }));
  await userEvent.click(screen.getByRole("button", { name: "Returns" }));
  expect(screen.getAllByRole("region")).toHaveLength(2);
  await userEvent.click(screen.getByRole("button", { name: "Unavailable" }));
  expect(screen.getByRole("button", { name: "Unavailable" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("controlled values and event cancellation preserve parent ownership", async () => {
  const change = vi.fn();
  const view = render(
    <Accordion value={["Shipping"]} onValueChange={change}>
      <Items />
    </Accordion>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Returns" }));
  expect(change.mock.calls[0]?.[0]).toEqual(["Returns"]);
  expect(screen.getByRole("button", { name: "Shipping" })).toHaveAttribute("aria-expanded", "true");
  view.unmount();
  render(
    <Accordion onValueChange={(_, details) => details.cancel()}>
      <Items />
    </Accordion>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Returns" }));
  expect(screen.getByRole("button", { name: "Returns" })).toHaveAttribute("aria-expanded", "false");
});

test("Tab visits enabled triggers; Space and Enter operate them", async () => {
  render(
    <Accordion>
      <Items />
    </Accordion>,
  );
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Shipping" })).toHaveFocus();
  await userEvent.keyboard(" ");
  expect(screen.getByRole("button", { name: "Shipping" })).toHaveAttribute("aria-expanded", "true");
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Returns" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(screen.getByRole("button", { name: "Returns" })).toHaveAttribute("aria-expanded", "true");
});

test("parts forward refs and caller classes with configurable heading rank", () => {
  const root = createRef<HTMLDivElement>();
  const item = createRef<HTMLDivElement>();
  const header = createRef<HTMLHeadingElement>();
  const trigger = createRef<HTMLButtonElement>();
  const panel = createRef<HTMLDivElement>();
  render(
    <Accordion ref={root} defaultValue={["a"]} className="extra">
      <Accordion.Item ref={item} value="a">
        <Accordion.Header ref={header} render={(props) => <h2 {...props} />}>
          <Accordion.Trigger ref={trigger}>Details</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel ref={panel}>Content</Accordion.Panel>
      </Accordion.Item>
    </Accordion>,
  );
  expect(root.current).toHaveClass("kb-accordion", "extra");
  expect(item.current).toHaveClass("kb-accordion-item");
  expect(header.current).toBe(screen.getByRole("heading", { level: 2 }));
  expect(trigger.current).toHaveClass("kb-accordion-trigger");
  expect(panel.current).toHaveClass("kb-accordion-panel");
});

test("root disabled preserves open content while rejecting all toggles", async () => {
  const change = vi.fn();
  render(
    <Accordion disabled defaultValue={["Shipping"]} onValueChange={change}>
      <Items />
    </Accordion>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Shipping" }));
  await userEvent.click(screen.getByRole("button", { name: "Returns" }));
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("region", { name: "Shipping" })).toBeInTheDocument();
});

test("retained panel removes controls from navigation without losing draft values", async () => {
  render(
    <Accordion keepMounted defaultValue={["draft"]}>
      <Accordion.Item value="draft">
        <Accordion.Header>
          <Accordion.Trigger>Draft</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          <input aria-label="Draft name" defaultValue="Project" />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>,
  );
  await userEvent.type(screen.getByRole("textbox"), " draft");
  await userEvent.click(screen.getByRole("button", { name: "Draft" }));
  await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
  await userEvent.click(screen.getByRole("button", { name: "Draft" }));
  expect(screen.getByRole("textbox")).toHaveValue("Project draft");
});
