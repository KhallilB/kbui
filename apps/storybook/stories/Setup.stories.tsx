import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Setup } from "../site/Setup";
import { releaseVersion } from "../site/setup-model";

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
    expect(command.querySelector('[data-syntax="function"]')).toHaveTextContent("pnpm");
    const registry =
      Number(releaseVersion.split(".")[0]) > 0 || Number(releaseVersion.split(".")[1]) >= 10;
    const base = `https://github.com/KhallilB/kbui/releases/download/v${releaseVersion}`;
    expect(command).toHaveTextContent(
      registry
        ? `pnpm add @kb.ui/react@${releaseVersion}`
        : `pnpm add ${base}/kbui-react-${releaseVersion}.tgz`,
    );
    expect(command).toHaveTextContent(
      registry ? `@kb.ui/tokens@${releaseVersion}` : `${base}/kbui-tokens-${releaseVersion}.tgz`,
    );
    expect(command).not.toHaveTextContent("kbui-css-");
    expect(canvas.queryByRole("checkbox", { name: "Include typed tokens" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Remove typed tokens" }));
    expect(command).not.toHaveTextContent("tokens");
    await userEvent.click(canvas.getByRole("button", { name: "Add typed tokens" }));
    expect(command).toHaveTextContent(
      registry ? `@kb.ui/tokens@${releaseVersion}` : `${base}/kbui-tokens-${releaseVersion}.tgz`,
    );
    await userEvent.click(canvas.getByRole("button", { name: "Remove typed tokens" }));
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
      'import "@kb.ui/react/styles.css";',
    );
  },
};
export const Theming: Story = {
  args: { themePage: true, siteRoot: "../../" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const css = canvas.getByRole("region", { name: "Restyle CSS example" });
    expect(css.querySelector('[data-syntax="attribute"]')).not.toBeNull();
    expect(
      canvas.getByRole("region", { name: "Theme code" }).querySelector('[data-syntax="tag"]'),
    ).toHaveTextContent("html");
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
