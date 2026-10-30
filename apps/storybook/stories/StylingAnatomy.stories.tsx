import entries from "virtual:kbui-catalog";
import {
  Button,
  Combobox,
  ConfirmAction,
  Dialog,
  Menu,
  MultiSelect,
  Popover,
  Textarea,
  Tooltip,
} from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useLayoutEffect, useState } from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { CatalogSkinControls } from "../site/CatalogSkinControls";
import { type CatalogSkin, defaultCatalogSkin } from "../site/catalog-skin";
import { applyComponentStyle } from "../site/component-style-preview";
import type { Theme } from "../site/theme-foundations";
import "../site/site.css";
import "../site/palette.css";

type Family =
  | "Combobox"
  | "MultiSelect"
  | "Textarea"
  | "Dialog"
  | "Menu"
  | "Popover"
  | "ConfirmAction"
  | "Tooltip";
const options = [
  { value: "maya", label: "Maya" },
  { value: "sam", label: "Sam" },
];

function Specimen({
  kind,
  callerClass,
  multiple,
}: {
  kind: Family;
  callerClass: string;
  multiple: boolean;
}) {
  const [owner, setOwner] = useState<string | null>(null);
  const [reviewers, setReviewers] = useState<readonly string[]>([]);
  if (kind === "Combobox" && multiple)
    return (
      <Combobox
        multiple
        label="Reviewers"
        options={options}
        value={reviewers}
        onValueChange={setReviewers}
        classNames={{ shell: callerClass }}
      />
    );
  if (kind === "Combobox")
    return (
      <Combobox
        label="Owner"
        options={options}
        value={owner}
        onValueChange={setOwner}
        classNames={{ shell: callerClass }}
      />
    );
  if (kind === "MultiSelect")
    return (
      <MultiSelect
        label="Reviewers"
        options={options}
        value={reviewers}
        onValueChange={setReviewers}
        classNames={{ shell: callerClass }}
      />
    );
  if (kind === "Textarea")
    return (
      <Textarea label="Draft" defaultValue="Keep draft" classNames={{ control: callerClass }} />
    );
  if (kind === "Dialog")
    return (
      <Dialog>
        <Dialog.Trigger render={<Button />}>Open dialog</Dialog.Trigger>
        <Dialog.Content title="Dialog details" className={callerClass}>
          <Textarea label="Portal draft" defaultValue="Keep portal draft" />
          <Dialog.Close render={<Button />}>Close dialog</Dialog.Close>
        </Dialog.Content>
      </Dialog>
    );
  if (kind === "Menu")
    return (
      <Menu>
        <Menu.Trigger render={<Button />}>Open menu</Menu.Trigger>
        <Menu.Content className={callerClass}>
          <Menu.Item>Inspect record</Menu.Item>
        </Menu.Content>
      </Menu>
    );
  if (kind === "Popover")
    return (
      <Popover>
        <Popover.Trigger render={<Button />}>Open popover</Popover.Trigger>
        <Popover.Content title="Popover details" className={callerClass}>
          <Textarea label="Portal draft" defaultValue="Keep portal draft" />
        </Popover.Content>
      </Popover>
    );
  if (kind === "ConfirmAction")
    return (
      <ConfirmAction
        title="Confirm change"
        onConfirm={() => {}}
        classNames={{ popup: callerClass }}
      >
        Review change
      </ConfirmAction>
    );
  return (
    <Tooltip content="Useful hint" delay={0} className={callerClass}>
      <Button>Show hint</Button>
    </Tooltip>
  );
}

function StylingFixture({
  kind,
  callerBrand = false,
  multiple = false,
}: {
  kind: Family;
  callerBrand?: boolean;
  multiple?: boolean;
}) {
  const [skin, setSkin] = useState<CatalogSkin>(defaultCatalogSkin);
  const [theme, setTheme] = useState<Theme>("light");
  const [ownsBrand, setOwnsBrand] = useState(callerBrand);
  const entry = entries.find((entry) => entry.name === kind);
  const sample = entry?.stories.find((story) => story.id === entry.defaultStoryId);
  useLayoutEffect(() => applyComponentStyle(document, skin.custom), [skin.custom]);
  useEffect(() => {
    const root = document.documentElement;
    const original = root.dataset.theme;
    const originalScheme = root.style.colorScheme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    return () => {
      root.style.colorScheme = originalScheme;
      if (original === undefined) delete root.dataset.theme;
      else root.dataset.theme = original;
    };
  }, [theme]);
  useEffect(() => {
    const changeTheme = () => setTheme((value) => (value === "light" ? "dark" : "light"));
    const reset = () => setSkin(defaultCatalogSkin);
    window.addEventListener("styling-fixture-theme", changeTheme);
    window.addEventListener("styling-fixture-reset", reset);
    return () => {
      window.removeEventListener("styling-fixture-theme", changeTheme);
      window.removeEventListener("styling-fixture-reset", reset);
    };
  }, []);
  if (!sample) throw new Error(`Missing canonical fixture: ${kind}`);
  return (
    <div className="kbui-site" data-theme={theme} style={{ maxWidth: "48rem" }}>
      <Specimen
        kind={kind}
        multiple={multiple}
        callerClass={`caller-part${ownsBrand ? " brand" : ""}`}
      />
      <Button onClick={() => setTheme((value) => (value === "light" ? "dark" : "light"))}>
        Change preview theme
      </Button>
      <Button onClick={() => setOwnsBrand(false)}>Drop caller brand</Button>
      <CatalogSkinControls
        component={kind}
        value={skin}
        onChange={setSkin}
        theme={theme}
        sourceModule={sample.code}
        stylingPatches={sample.styling}
      />
    </div>
  );
}

const meta = {
  title: "Validation/Styling anatomy",
  component: StylingFixture,
  args: { kind: "Combobox" },
} satisfies Meta<typeof StylingFixture>;
export default meta;
type Story = StoryObj<typeof meta>;

async function applyCss(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const editor = canvas.getByRole("textbox", { name: "Style this component" });
  fireEvent.change(editor, {
    target: { value: ".brand { border-radius: 3px; outline: 3px solid; }" },
  });
  await waitFor(() => expect(canvas.getByRole("button", { name: "Copy styling" })).toBeEnabled());
  return {
    canvas,
    editor,
    reset: canvas.getByRole("button", { name: "Reset styling" }),
    theme: canvas.getByRole("button", { name: "Change preview theme" }),
  };
}

async function innerPart(canvasElement: HTMLElement, selector: string, root: string) {
  const { canvas, editor, reset, theme } = await applyCss(canvasElement);
  const part = canvasElement.querySelector<HTMLElement>(selector);
  if (!part) throw new Error(`Missing real part: ${selector}`);
  await waitFor(() => expect(getComputedStyle(part).borderRadius).toBe("3px"));
  expect(part).toHaveClass("brand", "caller-part");
  expect(canvasElement.querySelector(root)).not.toHaveClass("brand");
  await userEvent.click(theme);
  expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  expect(getComputedStyle(part).borderRadius).toBe("3px");
  if (part instanceof HTMLTextAreaElement) expect(part.value).toBe("Keep draft");
  fireEvent.change(editor, { target: { value: ".brand {" } });
  await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
  expect(getComputedStyle(part).borderRadius).toBe("3px");
  expect(canvas.getByRole("button", { name: "Copy styling" })).toBeDisabled();
  await userEvent.click(reset);
  await waitFor(() => expect(part).not.toHaveClass("brand"));
  expect(part).toHaveClass("caller-part");
  if (part instanceof HTMLTextAreaElement) expect(part.value).toBe("Keep draft");
  await userEvent.click(canvas.getByRole("radio", { name: "Tailwind" }));
  fireEvent.change(canvas.getByRole("textbox", { name: "Tailwind classes" }), {
    target: { value: "rounded-[5px] dark:rounded-[11px]" },
  });
  await userEvent.click(theme);
  await waitFor(() => expect(getComputedStyle(part).borderRadius).toBe("5px"));
  expect(part).toHaveClass("rounded-[5px]", "dark:rounded-[11px]");
  expect(canvasElement.querySelector(root)).not.toHaveClass("rounded-[5px]");
  await userEvent.click(theme);
  await waitFor(() => expect(getComputedStyle(part).borderRadius).toBe("11px"));
  await userEvent.click(reset);
  await waitFor(() => expect(part).not.toHaveClass("rounded-[5px]"));
  expect(part).toHaveClass("caller-part");
  if (part instanceof HTMLTextAreaElement) expect(part.value).toBe("Keep draft");
}

export const ComboboxShell: Story = {
  play: async ({ canvasElement }) => innerPart(canvasElement, ".kb-combobox-shell", ".kb-combobox"),
};
export const ComboboxMultiple: Story = {
  args: { multiple: true },
  play: async ({ canvasElement }) =>
    innerPart(canvasElement, ".kb-multiselect-shell", ".kb-multiselect"),
};
export const MultiSelectShell: Story = {
  args: { kind: "MultiSelect" },
  play: async ({ canvasElement }) =>
    innerPart(canvasElement, ".kb-multiselect-shell", ".kb-multiselect"),
};
export const TextareaControl: Story = {
  args: { kind: "Textarea" },
  play: async ({ canvasElement }) =>
    innerPart(canvasElement, ".kb-textarea-control", ".kb-textarea"),
};

async function portal(
  canvasElement: HTMLElement,
  selector: string,
  triggerName: string,
  hover = false,
) {
  const { canvas } = await applyCss(canvasElement);
  const trigger = canvas.getByRole("button", { name: triggerName });
  const open = async () => {
    if (hover) await userEvent.hover(trigger);
    else await userEvent.click(trigger);
    await waitFor(() => expect(document.querySelector(selector)).toBeVisible());
    const popup = document.querySelector<HTMLElement>(selector);
    if (!popup) throw new Error(`Missing real portal: ${selector}`);
    await waitFor(() => expect(getComputedStyle(popup).borderRadius).toBe("3px"));
    expect(popup).toHaveClass("brand", "caller-part");
    expect(trigger).not.toHaveClass("brand");
    return popup;
  };
  const first = await open();
  const draft = first.querySelector<HTMLTextAreaElement>("textarea");
  if (draft) {
    await userEvent.clear(draft);
    await userEvent.type(draft, "Retained portal draft");
  }
  // Model catalog chrome changing theme outside the preview iframe.
  window.dispatchEvent(new Event("styling-fixture-theme"));
  await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "dark"));
  expect(document.querySelector(selector)).toBe(first);
  expect(getComputedStyle(first).borderRadius).toBe("3px");
  if (draft) expect(draft.value).toBe("Retained portal draft");
  if (hover) await userEvent.unhover(trigger);
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(document.querySelector(selector)).toBeNull());
  const second = await open();
  expect(second).not.toBe(first);
  window.dispatchEvent(new Event("styling-fixture-reset"));
  await waitFor(() => expect(second).not.toHaveClass("brand"));
  expect(second).toHaveClass("caller-part");
  expect(second).toBeVisible();
  if (hover) await userEvent.unhover(trigger);
  await userEvent.keyboard("{Escape}");
}

export const DialogPortal: Story = {
  args: { kind: "Dialog" },
  play: async ({ canvasElement }) => portal(canvasElement, ".kb-dialog-popup", "Open dialog"),
};
export const MenuPortal: Story = {
  args: { kind: "Menu" },
  play: async ({ canvasElement }) => portal(canvasElement, ".kb-menu", "Open menu"),
};
export const PopoverPortal: Story = {
  args: { kind: "Popover" },
  play: async ({ canvasElement }) => portal(canvasElement, ".kb-popover", "Open popover"),
};
export const ConfirmActionPortal: Story = {
  args: { kind: "ConfirmAction" },
  play: async ({ canvasElement }) => portal(canvasElement, ".kb-confirmaction", "Review change"),
};
export const TooltipPortal: Story = {
  args: { kind: "Tooltip" },
  play: async ({ canvasElement }) => portal(canvasElement, ".kb-tooltip", "Show hint", true),
};

export const ManagedClasses: Story = {
  args: { kind: "Textarea", callerBrand: true },
  play: async ({ canvasElement }) => {
    const { canvas, reset } = await applyCss(canvasElement);
    const part = canvas.getByRole("textbox", { name: "Draft" });
    await waitFor(() => expect(getComputedStyle(part).borderRadius).toBe("3px"));
    await userEvent.click(canvas.getByRole("button", { name: "Drop caller brand" }));
    await waitFor(() => expect(part).toHaveClass("brand"));
    await userEvent.click(reset);
    await waitFor(() => expect(part).not.toHaveClass("brand"));
    expect(part).toHaveClass("caller-part");
  },
};

export const CallerClasses: Story = {
  args: { kind: "Textarea", callerBrand: true },
  play: async ({ canvasElement }) => {
    const { canvas, reset } = await applyCss(canvasElement);
    const part = canvas.getByRole("textbox", { name: "Draft" });
    await waitFor(() => expect(getComputedStyle(part).borderRadius).toBe("3px"));
    await userEvent.click(reset);
    await waitFor(() => expect(document.querySelector("style[data-catalog-style]")).toBeNull());
    expect(part).toHaveClass("brand", "caller-part");
  },
};

export const InvalidAnatomy: Story = {
  play: async () => {
    const isolated = document.implementation.createHTMLDocument("Invalid anatomy");
    expect(() =>
      applyComponentStyle(isolated, {
        component: "UnregisteredComponent",
        css: ".brand { border-radius: 3px; }",
        classes: "brand",
      }),
    ).toThrow("UnregisteredComponent");
    expect(isolated.querySelector("style[data-catalog-style]")).toBeNull();
  },
};
