import previewCss from "@kbui/css/styles.css?inline";
import { Button } from "@kbui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { StoryPreview } from "../site/CatalogPreview";
import { CatalogSkinControls } from "../site/CatalogSkinControls";
import { type CatalogSkin, defaultCatalogSkin } from "../site/catalog-skin";
import type { Theme } from "../site/theme-foundations";

function PreviewFixture() {
  const [skin, setSkin] = useState<CatalogSkin>(defaultCatalogSkin);
  const [theme, setTheme] = useState<Theme>("light");
  const [generation, setGeneration] = useState(0);
  const [alternate, setAlternate] = useState(false);
  return (
    <div>
      <CatalogSkinControls value={skin} onChange={setSkin} theme={theme} />
      <Button onClick={() => setSkin((current) => ({ ...current, palette: "ocean" }))}>
        Fixture Palette Ocean
      </Button>
      <Button onClick={() => setSkin((current) => ({ ...current, corners: "sharp" }))}>
        Fixture Corners Sharp
      </Button>
      <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Change preview theme
      </Button>
      <Button onClick={() => setGeneration((value) => value + 1)}>Reload fixture</Button>
      <Button onClick={() => setAlternate(!alternate)}>Change fixture</Button>
      <StoryPreview
        src={alternate ? "about:blank#alternate" : "about:blank"}
        title="Skin fixture"
        layout={{ width: 520, minimum: 96 }}
        expanded={false}
        appearance={{ theme, skin }}
        generation={generation}
        onLoad={() => {}}
        onError={() => {}}
      />
    </div>
  );
}

const meta = { title: "Site/CatalogSkinControls", component: PreviewFixture } satisfies Meta<
  typeof PreviewFixture
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EditComponentCss: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement);
    const forced = matchMedia("(forced-colors: active)").matches;
    const frame = canvasElement.querySelector<HTMLIFrameElement>("iframe");
    if (!frame) throw new Error("Missing preview frame");
    await waitFor(() => expect(frame.contentDocument?.readyState).toBe("complete"));
    const doc = frame.contentDocument;
    if (!doc) throw new Error("Missing preview document");
    const style = doc.createElement("style");
    style.textContent = previewCss;
    doc.head.append(style);
    doc.body.innerHTML =
      '<div id="storybook-root"><input aria-label="Draft"><button class="kb-button" data-variant="primary">Preview action</button></div>';
    const button = doc.querySelector<HTMLButtonElement>("button");
    const draft = doc.querySelector<HTMLInputElement>("input");
    if (!button || !draft) throw new Error("Missing fixture controls");
    draft.value = "Keep draft";
    const editor = page.getByRole("textbox", { name: "Style this component" });
    expect(editor).not.toHaveAttribute("readonly");
    await userEvent.clear(editor);
    await userEvent.type(editor, ".brand {{ background: rgb(1 2 3); border-radius: 2px; }");
    await waitFor(() => expect(getComputedStyle(button).borderRadius).toBe("2px"), {
      timeout: 10000,
    });
    if (!forced)
      await waitFor(() => expect(getComputedStyle(button).backgroundColor).toBe("rgb(1, 2, 3)"));
    expect(getComputedStyle(button).borderRadius).toBe("2px");
    expect(draft.value).toBe("Keep draft");
    expect(canvasElement.querySelector("iframe")).toBe(frame);
    await userEvent.type(editor, " broken {{");
    await waitFor(() => expect(page.getByRole("alert")).toBeVisible());
    expect(editor).toHaveAttribute("aria-invalid", "true");
    expect(getComputedStyle(button).borderRadius).toBe("2px");
    expect(page.getByRole("button", { name: "Copy styling" })).toBeDisabled();
    await userEvent.clear(editor);
    await userEvent.type(editor, ".brand {{ background: rgb(1 2 3); border-radius: 2px; }");
    await waitFor(() => expect(page.queryByRole("alert")).toBeNull());
    await userEvent.click(page.getByRole("radio", { name: "Tailwind" }));
    const classes = page.getByRole("textbox", { name: "Tailwind classes" });
    await userEvent.clear(classes);
    await userEvent.type(classes, "bg-[[#123456] text-white rounded-none px-8 hover:bg-black");
    await waitFor(() => expect(getComputedStyle(button).paddingLeft).toBe("32px"), {
      timeout: 10000,
    });
    if (!forced)
      await waitFor(() => expect(getComputedStyle(button).backgroundColor).toBe("rgb(18, 52, 86)"));
    expect(getComputedStyle(button).paddingLeft).toBe("32px");
    expect(getComputedStyle(button).borderRadius).toBe("0px");
    await userEvent.click(page.getByRole("radio", { name: "CSS" }));
    expect((editor as HTMLTextAreaElement).value).toContain("border-radius: 2px;");
    await waitFor(() => expect(getComputedStyle(button).borderRadius).toBe("2px"));
    if (!forced)
      await waitFor(() => expect(getComputedStyle(button).backgroundColor).toBe("rgb(1, 2, 3)"));
    await userEvent.click(page.getByRole("button", { name: "Reset styling" }));
    await waitFor(() => expect(button).not.toHaveClass("brand"));
    expect(canvasElement.querySelector("iframe")).toBe(frame);
  },
};

export const PreviewLocalStyling: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const forced = matchMedia("(forced-colors: active)").matches;
    const expectBackground = (element: HTMLElement, color: string) => {
      if (forced) expect(getComputedStyle(element).forcedColorAdjust).toBe("auto");
      else expect(getComputedStyle(element).backgroundColor).toBe(color);
    };
    const parentStyle = document.documentElement.getAttribute("style");
    const parentTheme = document.documentElement.dataset.theme;
    const currentFrame = () => {
      const frame = canvasElement.querySelector<HTMLIFrameElement>('iframe[data-current="true"]');
      if (!frame) throw new Error("Missing current preview");
      return frame;
    };
    const fixture = async () => {
      const frame = currentFrame();
      await waitFor(() => expect(frame.contentDocument?.readyState).toBe("complete"));
      const doc = frame.contentDocument;
      if (!doc) throw new Error("Missing same-origin preview document");
      const style = doc.createElement("style");
      style.textContent = previewCss;
      doc.head.append(style);
      doc.body.innerHTML =
        '<div id="storybook-root"><input aria-label="Draft"><button class="kb-button" data-variant="primary">Preview action</button></div><div role="dialog" aria-label="Portal fixture"><button class="kb-button" data-variant="primary">Portal action</button></div>';
      const action = doc.querySelector<HTMLButtonElement>("button");
      const draft = doc.querySelector<HTMLInputElement>("input");
      if (!action || !draft) throw new Error("Missing preview controls");
      return { frame, doc, action, draft };
    };
    const first = await fixture();
    first.draft.value = "Keep my draft";
    const choose = async (label: string, name: string) => {
      await userEvent.click(canvas.getByRole("button", { name: `Fixture ${label} ${name}` }));
    };
    await choose("Palette", "Ocean");
    await choose("Corners", "Sharp");
    await waitFor(() => expectBackground(first.action, "rgb(33, 99, 122)"));
    expect(getComputedStyle(first.action).borderRadius).toBe("0px");
    if (!forced) expect(getComputedStyle(first.action).boxShadow).not.toBe("none");
    const portalAction = first.doc.querySelector<HTMLButtonElement>('[role="dialog"] button');
    if (!portalAction) throw new Error("Missing body portal control");
    expectBackground(portalAction, "rgb(33, 99, 122)");
    expect(currentFrame()).toBe(first.frame);
    expect(currentFrame().contentDocument).toBe(first.doc);
    expect(first.draft.value).toBe("Keep my draft");
    expect(first.doc.documentElement.style.getPropertyValue("--kb-color-accent")).toBe("#21637a");
    await userEvent.click(canvas.getByRole("button", { name: "Change preview theme" }));
    await waitFor(() => expectBackground(first.action, "rgb(140, 213, 232)"));
    expect(first.draft.value).toBe("Keep my draft");
    await userEvent.click(canvas.getByRole("button", { name: "Change fixture" }));
    const second = await fixture();
    expect(second.frame).not.toBe(first.frame);
    await waitFor(() => expectBackground(second.action, "rgb(140, 213, 232)"));
    await userEvent.click(canvas.getByRole("button", { name: "Change fixture" }));
    expect(currentFrame()).toBe(first.frame);
    expect(first.draft.value).toBe("Keep my draft");
    await userEvent.click(canvas.getByRole("button", { name: "Reload fixture" }));
    const reloaded = await fixture();
    expect(reloaded.frame).not.toBe(first.frame);
    await waitFor(() => expectBackground(reloaded.action, "rgb(140, 213, 232)"));
    await userEvent.click(canvas.getByRole("button", { name: "Reset styling" }));
    await waitFor(() => expectBackground(reloaded.action, "rgb(255, 132, 87)"));
    expect(getComputedStyle(reloaded.action).borderRadius).toBe("8px");
    expect(reloaded.doc.documentElement.style.getPropertyValue("--kb-color-accent")).toBe("");
    expect(reloaded.doc.documentElement.style.getPropertyValue("--kb-radius-md")).toBe("");
    expect(document.documentElement.getAttribute("style")).toBe(parentStyle);
    expect(document.documentElement.dataset.theme).toBe(parentTheme);
    expect(
      Number(canvasElement.querySelector("[data-cache-size]")?.getAttribute("data-cache-size")),
    ).toBeLessThanOrEqual(6);
  },
};
