import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { ToggleButton } from "../ToggleButton/ToggleButton";
import { Toolbar } from "../Toolbar/Toolbar";
import { ToggleGroup } from "./ToggleGroup";

describe("ToggleGroup", () => {
  test("supports independent pressed choices and skips disabled buttons in a single tab stop", async () => {
    const ref = createRef<HTMLDivElement>();
    const valueChange = vi.fn();
    render(
      <>
        <p id="format-label">Text formatting</p>
        <ToggleGroup
          ref={ref}
          aria-labelledby="format-label"
          className="custom-group"
          defaultValue={["bold"]}
          onValueChange={valueChange}
        >
          <ToggleButton value="bold">Bold</ToggleButton>
          <ToggleButton value="italic" disabled>
            Italic
          </ToggleButton>
          <ToggleButton value="underline">Underline</ToggleButton>
        </ToggleGroup>
        <button type="button">Next</button>
      </>,
    );

    const group = screen.getByRole("group", { name: "Text formatting" });
    expect(group).toHaveClass("kb-togglegroup", "custom-group");
    expect(ref.current).toBe(group);
    const bold = within(group).getByRole("button", { name: "Bold", pressed: true });
    const underline = within(group).getByRole("button", { name: "Underline", pressed: false });
    const user = userEvent.setup();

    await user.tab();
    expect(bold).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(underline).toHaveFocus();
    expect(underline).toHaveAttribute("aria-pressed", "false");
    await user.keyboard(" ");
    expect(underline).toHaveAttribute("aria-pressed", "true");
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(valueChange).toHaveBeenLastCalledWith(["bold", "underline"], expect.anything());

    await user.keyboard("{Home}");
    expect(bold).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(bold).toHaveAttribute("aria-pressed", "false");
    expect(underline).toHaveAttribute("aria-pressed", "true");
    expect(valueChange).toHaveBeenLastCalledWith(["underline"], expect.anything());

    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });

  test("leaves the selected values to the controlling parent", async () => {
    const valueChange = vi.fn();
    const view = (value: readonly string[]) => (
      <ToggleGroup aria-label="Visible charts" value={value} onValueChange={valueChange}>
        <ToggleButton value="sales">Sales</ToggleButton>
        <ToggleButton value="inventory">Inventory</ToggleButton>
      </ToggleGroup>
    );
    const { rerender } = render(view(["sales"]));
    const sales = screen.getByRole("button", { name: "Sales", pressed: true });
    const inventory = screen.getByRole("button", { name: "Inventory", pressed: false });

    await userEvent.click(inventory);
    expect(valueChange).toHaveBeenCalledWith(["sales", "inventory"], expect.anything());
    expect(inventory).toHaveAttribute("aria-pressed", "false");

    rerender(view(["inventory"]));
    expect(sales).toHaveAttribute("aria-pressed", "false");
    expect(inventory).toHaveAttribute("aria-pressed", "true");
  });

  test("disables all member controls through the group", async () => {
    const valueChange = vi.fn();
    render(
      <>
        <ToggleGroup aria-label="Map layers" disabled onValueChange={valueChange}>
          <ToggleButton value="roads">Roads</ToggleButton>
          <ToggleButton value="water">Water</ToggleButton>
        </ToggleGroup>
        <button type="button">Next</button>
      </>,
    );

    const roads = screen.getByRole("button", { name: "Roads", pressed: false });
    expect(roads).toBeDisabled();
    expect(screen.getByRole("button", { name: "Water" })).toBeDisabled();
    const user = userEvent.setup();
    await user.click(roads);
    expect(valueChange).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });

  test("keeps a tab stop available when the previously focused option becomes disabled", async () => {
    const view = (disabled: boolean) => (
      <>
        <button type="button">Previous</button>
        <ToggleGroup aria-label="Text formatting">
          <ToggleButton value="bold" disabled={disabled}>
            Bold
          </ToggleButton>
          <ToggleButton value="underline">Underline</ToggleButton>
        </ToggleGroup>
        <button type="button">Next</button>
      </>
    );
    const { rerender } = render(view(false));
    const user = userEvent.setup();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();

    rerender(view(true));
    screen.getByRole("button", { name: "Previous" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Underline" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });

  test.each(["explicit", "inherited"])(
    "moves along the visual order with %s RTL",
    async (source) => {
      render(
        <div dir={source === "inherited" ? "rtl" : undefined}>
          <ToggleGroup
            aria-label="Text formatting"
            dir={source === "explicit" ? "rtl" : undefined}
            loopFocus={false}
          >
            <ToggleButton value="bold">Bold</ToggleButton>
            <ToggleButton value="underline">Underline</ToggleButton>
            <ToggleButton value="strike">Strike</ToggleButton>
          </ToggleGroup>
        </div>,
      );

      const user = userEvent.setup();
      await user.tab();
      expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
      await user.keyboard("{ArrowLeft}");
      expect(screen.getByRole("button", { name: "Underline" })).toHaveFocus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    },
  );

  test("updates keyboard direction when its ancestor changes direction", async () => {
    const view = (dir: "ltr" | "rtl") => (
      <div dir={dir}>
        <ToggleGroup aria-label="Text formatting" loopFocus={false}>
          <ToggleButton value="bold">Bold</ToggleButton>
          <ToggleButton value="underline">Underline</ToggleButton>
        </ToggleGroup>
      </div>
    );
    const { rerender } = render(view("ltr"));
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();

    rerender(view("rtl"));
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Underline" })).toHaveFocus();
  });

  test("shares the toolbar's tab stop and arrow navigation when placed inside it", async () => {
    render(
      <>
        <Toolbar aria-label="Editor actions">
          <Toolbar.Button>Copy</Toolbar.Button>
          <ToggleGroup aria-label="Text formatting">
            <ToggleButton value="bold">Bold</ToggleButton>
            <ToggleButton value="underline">Underline</ToggleButton>
          </ToggleGroup>
          <Toolbar.Button>Print</Toolbar.Button>
        </Toolbar>
        <button type="button">Next action</button>
      </>,
    );
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Copy" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("button", { name: "Bold", pressed: true })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByRole("button", { name: "Print" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next action" })).toHaveFocus();
  });

  test("keeps its group role and orientation when given conflicting element props", async () => {
    const overrides = {
      "aria-label": "Map layers",
      "aria-orientation": "horizontal",
      "data-orientation": "horizontal",
      orientation: "vertical",
      render: <nav>Replacement</nav>,
      role: "toolbar",
    } as const;
    render(
      // @ts-expect-error ToggleGroup owns its group semantics.
      <ToggleGroup {...overrides}>
        <ToggleButton value="roads">Roads</ToggleButton>
        <ToggleButton value="water">Water</ToggleButton>
      </ToggleGroup>,
    );

    const group = screen.getByRole("group", { name: "Map layers" });
    expect(group.tagName).toBe("DIV");
    expect(group).not.toHaveAttribute("aria-orientation");
    expect(group).toHaveAttribute("data-orientation", "vertical");
    const user = userEvent.setup();
    await user.tab();
    expect(within(group).getByRole("button", { name: "Roads" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(within(group).getByRole("button", { name: "Water" })).toHaveFocus();
  });
});
