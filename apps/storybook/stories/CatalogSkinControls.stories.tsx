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

export const PreviewLocalStyling: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
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
      await userEvent.click(canvas.getByRole("combobox", { name: label }));
      await userEvent.click(await canvas.findByRole("option", { name }));
    };
    await choose("Palette", "Ocean");
    await choose("Corners", "Sharp");
    await waitFor(() =>
      expect(getComputedStyle(first.action).backgroundColor).toBe("rgb(33, 99, 122)"),
    );
    expect(getComputedStyle(first.action).borderRadius).toBe("0px");
    expect(getComputedStyle(first.action).boxShadow).not.toBe("none");
    const portalAction = first.doc.querySelector<HTMLButtonElement>('[role="dialog"] button');
    if (!portalAction) throw new Error("Missing body portal control");
    expect(getComputedStyle(portalAction).backgroundColor).toBe("rgb(33, 99, 122)");
    expect(currentFrame()).toBe(first.frame);
    expect(currentFrame().contentDocument).toBe(first.doc);
    expect(first.draft.value).toBe("Keep my draft");
    expect(
      (canvas.getByRole("textbox", { name: "Theme CSS overrides" }) as HTMLTextAreaElement).value,
    ).toContain("--kb-color-accent: #21637a;");
    await userEvent.click(canvas.getByRole("button", { name: "Change preview theme" }));
    await waitFor(() =>
      expect(getComputedStyle(first.action).backgroundColor).toBe("rgb(140, 213, 232)"),
    );
    expect(first.draft.value).toBe("Keep my draft");
    await userEvent.click(canvas.getByRole("button", { name: "Change fixture" }));
    const second = await fixture();
    expect(second.frame).not.toBe(first.frame);
    await waitFor(() =>
      expect(getComputedStyle(second.action).backgroundColor).toBe("rgb(140, 213, 232)"),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Change fixture" }));
    expect(currentFrame()).toBe(first.frame);
    expect(first.draft.value).toBe("Keep my draft");
    await userEvent.click(canvas.getByRole("button", { name: "Reload fixture" }));
    const reloaded = await fixture();
    expect(reloaded.frame).not.toBe(first.frame);
    await waitFor(() =>
      expect(getComputedStyle(reloaded.action).backgroundColor).toBe("rgb(140, 213, 232)"),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reset styling" }));
    await waitFor(() =>
      expect(getComputedStyle(reloaded.action).backgroundColor).toBe("rgb(242, 161, 132)"),
    );
    expect(getComputedStyle(reloaded.action).borderRadius).toBe("8px");
    expect(reloaded.doc.documentElement.style.getPropertyValue("--kb-color-accent")).toBe("");
    expect(reloaded.doc.documentElement.style.getPropertyValue("--kb-radius-md")).toBe("");
    expect(canvas.queryByRole("textbox", { name: "Theme CSS overrides" })).not.toBeInTheDocument();
    expect(document.documentElement.getAttribute("style")).toBe(parentStyle);
    expect(document.documentElement.dataset.theme).toBe(parentTheme);
    expect(
      Number(canvasElement.querySelector("[data-cache-size]")?.getAttribute("data-cache-size")),
    ).toBeLessThanOrEqual(6);
  },
};
