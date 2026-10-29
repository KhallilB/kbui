import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Grid } from "../Grid/Grid";
import { Heading } from "../Heading/Heading";
import { Link } from "../Link/Link";
import { Text } from "../Text/Text";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import { Image } from "./Image";

const landscape = "./media/scenes/alpine.jpg";
const product = "./media/objects/ceramic.jpg";

const meta = {
  title: "Components/Image",
  component: Image,
  tags: ["autodocs"],
  args: { src: landscape, alt: "Alpine river beneath sunlit mountain peaks", ratio: "landscape" },
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const frame = within(canvasElement).getByRole("img");
    await waitFor(() => expect(frame).toHaveAttribute("data-state", "loaded"));
    expect(frame.getBoundingClientRect().height).toBeGreaterThan(0);
  },
};
export const CropAndContain: Story = {
  render: () => (
    <Grid columns={2} gap="lg">
      <div>
        <Image src={product} alt="Ceramic vase and eucalyptus, cropped detail" ratio="portrait" />
        <Text size="sm">Cover · edge-to-edge detail</Text>
      </div>
      <div>
        <Image
          src={product}
          alt="Entire ceramic vase with eucalyptus"
          ratio="portrait"
          fit="contain"
        />
        <Text size="sm">Contain · complete composition</Text>
      </div>
    </Grid>
  ),
};
export const Ratios: Story = {
  render: function RatioExamples() {
    const [failed, setFailed] = useState(false);
    return (
      <Grid columns={2} gap="lg">
        <div>
          <Image src={landscape} alt="Square mountain crop" ratio="square" />
          <Text size="sm">Square · 1:1</Text>
        </div>
        <div>
          <Image src={landscape} alt="Wide mountain crop" ratio="wide" position="top" />
          <Text size="sm">Wide · focal point at top</Text>
        </div>
        <div>
          <Image
            src={failed ? "data:image/png;base64,invalid" : landscape}
            alt="Original mountain composition"
            ratio="auto"
            width={1200}
            height={800}
            fallback="Preview unavailable"
          />
          <Text size="sm">Intrinsic · 1200 × 800 · 3:2</Text>
          <Button variant="ghost" onClick={() => setFailed(!failed)}>
            {failed ? "Restore intrinsic preview" : "Show intrinsic failure"}
          </Button>
        </div>
        <div>
          <Image alt="Preview unavailable" fallback="No preview available" />
          <Text size="sm">Missing · reserved layout</Text>
        </div>
      </Grid>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByRole("img", { name: "Original mountain composition" });
    const initial = frame.getBoundingClientRect();
    expect(initial.width / initial.height).toBeCloseTo(1.5, 2);
    await waitFor(() => expect(frame).toHaveAttribute("data-state", "loaded"));
    const loaded = frame.getBoundingClientRect();
    expect(loaded.width).toBe(initial.width);
    expect(loaded.height).toBe(initial.height);
    await userEvent.click(canvas.getByRole("button", { name: "Show intrinsic failure" }));
    const failed = canvas.getByRole("img", { name: "Original mountain composition" });
    await waitFor(() => expect(failed).toHaveAttribute("data-state", "error"));
    const errored = failed.getBoundingClientRect();
    expect(errored.width).toBe(initial.width);
    expect(errored.height).toBe(initial.height);
    await userEvent.click(canvas.getByRole("button", { name: "Restore intrinsic preview" }));
    const restored = canvas.getByRole("img", { name: "Original mountain composition" });
    await waitFor(() => expect(restored).toHaveAttribute("data-state", "loaded"));
    expect(
      restored.getBoundingClientRect().width / restored.getBoundingClientRect().height,
    ).toBeCloseTo(1.5, 2);
  },
};
export const FailureAndRecovery: Story = {
  render: function Recovery() {
    const [retry, setRetry] = useState(false);
    return (
      <div>
        <Image
          src={retry ? landscape : "data:image/png;base64,invalid"}
          alt="Alpine river"
          fallback="Preview unavailable"
        />
        <div style={{ marginBlockStart: "var(--kb-space-3)" }}>
          <Button variant="secondary" onClick={() => setRetry(!retry)}>
            {retry ? "Show failure" : "Load replacement"}
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByRole("img");
    await waitFor(() => expect(frame).toHaveAttribute("data-state", "error"));
    const before = frame.getBoundingClientRect();
    await userEvent.click(canvas.getByRole("button", { name: "Load replacement" }));
    await waitFor(() => expect(canvas.getByRole("img")).toHaveAttribute("data-state", "loaded"));
    const after = canvas.getByRole("img").getBoundingClientRect();
    expect(after.width).toBe(before.width);
    expect(after.height).toBe(before.height);
  },
};
export const AssetLibrary: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--kb-space-6)" }}>
      <Text>
        Ten original media assets for people, products and editorial scenes. Download each JPEG from
        its caption.
      </Text>
      {[
        {
          title: "People",
          width: 768,
          height: 768,
          assets: [
            {
              id: "maya",
              title: "Maya Chen portrait",
              src: "./media/portraits/maya.jpg",
              alt: "Illustrated portrait of Maya Chen",
            },
            {
              id: "robin",
              title: "Robin Ellis portrait",
              src: "./media/portraits/robin.jpg",
              alt: "Illustrated portrait of Robin Ellis",
            },
            {
              id: "ana",
              title: "Ana López portrait",
              src: "./media/portraits/ana.jpg",
              alt: "Illustrated portrait of Ana López",
            },
            {
              id: "amir",
              title: "Amir Haddad portrait",
              src: "./media/portraits/amir.jpg",
              alt: "Illustrated portrait of Amir Haddad",
            },
            {
              id: "sora",
              title: "Sora Ito portrait",
              src: "./media/portraits/sora.jpg",
              alt: "Illustrated portrait of Sora Ito",
            },
            {
              id: "noor",
              title: "Noor Rahman portrait",
              src: "./media/portraits/noor.jpg",
              alt: "Illustrated portrait of Noor Rahman",
            },
          ],
        },
        {
          title: "Objects",
          width: 768,
          height: 768,
          assets: [
            {
              id: "ceramic",
              title: "Ceramic vase",
              src: "./media/objects/ceramic.jpg",
              alt: "Textured ceramic vase with eucalyptus on a sunlit plinth",
            },
            {
              id: "tote",
              title: "Canvas tote",
              src: "./media/objects/tote.jpg",
              alt: "Natural canvas tote with dark handles beside a rust-colored notebook",
            },
          ],
        },
        {
          title: "Scenes",
          width: 1200,
          height: 800,
          assets: [
            {
              id: "alpine",
              title: "Alpine river",
              src: "./media/scenes/alpine.jpg",
              alt: "River through an alpine valley beneath sunlit peaks",
            },
            {
              id: "atelier",
              title: "Sunlit atelier",
              src: "./media/scenes/atelier.jpg",
              alt: "Sunlit studio desk with a vase, brushes and a woven chair",
            },
          ],
        },
      ].map((group) => (
        <section key={group.title}>
          <Heading level={2} size="sm" style={{ marginBlockEnd: "var(--kb-space-3)" }}>
            {group.title}
          </Heading>
          <Grid as="ul" columns={2} gap="lg">
            {group.assets.map((asset) => (
              <li key={asset.id}>
                <Thumbnail
                  src={asset.src}
                  alt={asset.alt}
                  ratio="auto"
                  caption={
                    <Link href={asset.src} download={`${asset.id}.jpg`}>
                      Download {asset.title}
                    </Link>
                  }
                  description={`JPEG · ${group.width} × ${group.height}`}
                  imageProps={{ width: group.width, height: group.height, loading: "lazy" }}
                />
              </li>
            ))}
          </Grid>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    const frames = canvas.getAllByRole("img");
    expect(frames).toHaveLength(10);
    const downloads = canvas.getAllByRole("link", { name: /^Download / });
    expect(downloads).toHaveLength(10);
    const view = canvasElement.ownerDocument.defaultView;
    const initialScroll = { left: view?.scrollX ?? 0, top: view?.scrollY ?? 0 };
    try {
      for (const frame of frames) {
        frame.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
        const image = frame.querySelector("img");
        const download = frame.closest("figure")?.querySelector<HTMLAnchorElement>("a[download]");
        if (!image || !download) throw new Error("Expected media and its caption download");
        await waitFor(
          () => {
            expect(frame).toHaveAttribute("data-state", "loaded");
            expect(image.naturalWidth).toBeGreaterThan(0);
          },
          { timeout: 10000 },
        );
        expect(download).toHaveAttribute("download");
        expect(download.href).toBe(image.currentSrc);
      }
    } finally {
      view?.scrollTo({ ...initialScroll, behavior: "instant" });
    }
  },
};
