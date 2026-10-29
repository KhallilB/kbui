import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Grid } from "../Grid/Grid";
import { Text } from "../Text/Text";
import { Image } from "./Image";

const landscape = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720"><rect width="960" height="720" fill="#d5e0df"/><circle cx="720" cy="180" r="72" fill="#f1d0a1"/><path d="M0 460 250 190 540 500 730 320 960 510V720H0" fill="#798f86"/><path d="m250 190-65 157 67-27 72 33z" fill="#f1eee5"/><path d="M0 580q240-180 480-40t480-40v220H0" fill="#435e57"/><path d="M350 720q150-100 130-170t70-70q-35 80 15 145t-20 95" fill="#b0c6c1"/></svg>')}`;
const product = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720"><rect width="720" height="720" fill="#e5dcd0"/><ellipse cx="360" cy="590" rx="185" ry="24" fill="#c9bfb1"/><path d="m230 205 90-48h80l90 48 65 170-70 30-30-70v240H265V335l-30 70-70-30z" fill="#a88b6b"/><path d="m320 157 40 75 40-75M360 232v343M315 400h-30v35h30m90-35h30v35h-30" fill="none" stroke="#79634f" stroke-width="6"/><path d="m320 157-40 80 50 45 30-50 30 50 50-45-40-80" fill="#bfaa8e"/></svg>')}`;

const meta = {
  title: "Components/Image",
  component: Image,
  tags: ["autodocs"],
  args: { src: landscape, alt: "Alpine river winding beneath green peaks", ratio: "landscape" },
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
        <Image src={product} alt="Sand coat, cropped detail" ratio="portrait" />
        <Text size="sm">Cover · edge-to-edge detail</Text>
      </div>
      <div>
        <Image src={product} alt="Entire sand coat" ratio="portrait" fit="contain" />
        <Text size="sm">Contain · complete product</Text>
      </div>
    </Grid>
  ),
};
export const Ratios: Story = {
  render: () => (
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
          src={landscape}
          alt="Original mountain composition"
          ratio="auto"
          width={960}
          height={720}
        />
        <Text size="sm">Intrinsic · 960 × 720</Text>
      </div>
      <div>
        <Image alt="Preview unavailable" fallback="No preview available" />
        <Text size="sm">Missing · reserved layout</Text>
      </div>
    </Grid>
  ),
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
