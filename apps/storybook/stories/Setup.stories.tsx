import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Setup } from "../site/Setup";

const meta = {
  title: "Site/Setup",
  component: Setup,
  args: { siteRoot: "../", storybookRoot: "./" },
  parameters: { layout: "fullscreen" },
  afterEach: async ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    for (const panel of canvasElement.querySelectorAll(".example-code-content:not([hidden])"))
      expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth + 1);
  },
} satisfies Meta<typeof Setup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Installation: Story = {
  args: { search: "?manager=pnpm&tokens=1" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const command = canvas.getByRole("region", { name: "Install command" });
    expect(command).toHaveTextContent(
      "pnpm add https://github.com/KhallilB/kbui/releases/download/v0.5.0/kbui-react-0.5.0.tgz",
    );
    expect(command).toHaveTextContent("kbui-tokens-0.5.0.tgz");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Include typed tokens" }));
    expect(command).not.toHaveTextContent("kbui-tokens");
    await userEvent.click(canvas.getByRole("combobox", { name: "Package manager" }));
    await userEvent.click(await within(document.body).findByRole("option", { name: "Bun" }));
    await waitFor(() => expect(within(document.body).queryByRole("listbox")).toBeNull());
    expect(command).toHaveTextContent("bun add");
    expect(new URLSearchParams(location.search).get("manager")).toBe("bun");
    expect(canvas.getByRole("link", { name: "Choose your theme" })).toHaveAttribute(
      "href",
      "../setup/themes/",
    );
    expect(canvas.getByRole("region", { name: "Example code" })).toHaveTextContent(
      'import "@kbui/css/styles.css";',
    );
  },
};
export const Theming: Story = {
  args: { themePage: true, siteRoot: "../../" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const preview = canvasElement.querySelector(".setup-preview");
    expect(preview).toHaveAttribute(
      "data-theme",
      matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    );
    expect(canvas.getByRole("region", { name: "Theme code" })).toHaveTextContent(
      '<html lang="en">',
    );
    const themes = within(canvas.getByRole("radiogroup", { name: "Theme" }));
    expect(themes.getByRole("radio", { name: "System" })).toBeChecked();
    await userEvent.click(themes.getByRole("radio", { name: "Dark" }));
    expect(themes.getByRole("radio", { name: "Dark" })).toBeChecked();
    expect(preview).toHaveAttribute("data-theme", "dark");
    expect(canvas.getByRole("region", { name: "Theme code" })).toHaveTextContent(
      'data-theme="dark"',
    );
    await userEvent.keyboard("{ArrowLeft}");
    expect(themes.getByRole("radio", { name: "Light" })).toBeChecked();
    expect(preview).toHaveAttribute("data-theme", "light");
    expect(canvas.getByRole("region", { name: "Theme code" })).toHaveTextContent(
      'data-theme="light"',
    );
    await userEvent.keyboard("{ArrowLeft}");
    expect(themes.getByRole("radio", { name: "System" })).toBeChecked();
    expect(preview).toHaveAttribute(
      "data-theme",
      matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    );
    expect(canvas.getByRole("region", { name: "Theme code" })).toHaveTextContent(
      '<html lang="en">',
    );
    expect(canvas.getByRole("link", { name: "Installation" })).toHaveAttribute(
      "href",
      "../../setup/",
    );
  },
};
