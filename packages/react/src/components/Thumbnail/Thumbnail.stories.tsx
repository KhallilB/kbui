import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { Grid } from "../Grid/Grid";
import { Image } from "../Image/Image";
import { Link } from "../Link/Link";
import { Thumbnail } from "./Thumbnail";

const landscape = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720"><rect width="960" height="720" fill="#d5e0df"/><circle cx="720" cy="180" r="72" fill="#f1d0a1"/><path d="M0 460 250 190 540 500 730 320 960 510V720H0" fill="#798f86"/><path d="m250 190-65 157 67-27 72 33z" fill="#f1eee5"/><path d="M0 580q240-180 480-40t480-40v220H0" fill="#435e57"/><path d="M350 720q150-100 130-170t70-70q-35 80 15 145t-20 95" fill="#b0c6c1"/></svg>')}`;
const product = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720"><rect width="720" height="720" fill="#e5dcd0"/><ellipse cx="360" cy="590" rx="185" ry="24" fill="#c9bfb1"/><path d="m230 205 90-48h80l90 48 65 170-70 30-30-70v240H265V335l-30 70-70-30z" fill="#a88b6b"/><path d="m320 157 40 75 40-75M360 232v343M315 400h-30v35h30m90-35h30v35h-30" fill="none" stroke="#79634f" stroke-width="6"/><path d="m320 157-40 80 50 45 30-50 30 50 50-45-40-80" fill="#bfaa8e"/></svg>')}`;

const meta = {
  title: "Components/Thumbnail",
  component: Thumbnail,
  tags: ["autodocs"],
  args: {
    src: product,
    alt: "Sand wool coat with broad lapels",
    caption: "The studio coat",
    description: "Sand / Wool blend / Collection 04",
    ratio: "square",
    fit: "contain",
  },
} satisfies Meta<typeof Thumbnail>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Products: Story = {
  render: () => (
    <Grid as="ul" columns={2} gap="lg">
      <li>
        <Thumbnail
          src={product}
          alt="Sand wool coat with broad lapels"
          ratio="portrait"
          fit="contain"
          caption={<Link href="#sand-coat">The studio coat</Link>}
          description="Sand · Wool blend"
        />
      </li>
      <li>
        <Thumbnail
          alt=""
          ratio="portrait"
          fallback="Preview coming soon"
          caption={<Link href="#graphite-coat">The studio coat / Graphite</Link>}
          description="Graphite · Wool blend"
        />
      </li>
    </Grid>
  ),
};
export const Attachments: Story = {
  render: () => (
    <Grid as="ul" columns={2} gap="lg">
      <li>
        <Thumbnail
          alt=""
          ratio="wide"
          fallback="PDF"
          caption={<Link href="#brand-guide">North Studio — brand guide.pdf</Link>}
          description="PDF · 2.4 MB · Updated today"
        />
      </li>
      <li>
        <Thumbnail
          src={landscape}
          alt="Green alpine peaks and river"
          ratio="wide"
          caption={<Link href="#field-study">Field-study-cover.svg</Link>}
          description="SVG · 960 × 720"
        />
      </li>
    </Grid>
  ),
};
export const Gallery: Story = {
  render: () => (
    <Grid as="ul" columns={2} gap="lg">
      {[
        { title: "Alpine study", src: landscape, alt: "River beneath green alpine peaks" },
        { title: "Material study", src: product, alt: "Sand coat with broad lapels" },
      ].map((item) => (
        <li key={item.title}>
          <Dialog>
            <Thumbnail
              src={item.src}
              alt={item.alt}
              ratio="square"
              caption={
                <Dialog.Trigger render={<Button variant="ghost" />}>
                  View {item.title}
                </Dialog.Trigger>
              }
              description="Open full composition"
            />
            <Dialog.Content
              title={item.title}
              description="Full composition, contained without cropping."
            >
              <Image src={item.src} alt={item.alt} fit="contain" ratio="square" />
              <Dialog.Actions>
                <Dialog.Close render={<Button variant="secondary" />}>Close preview</Dialog.Close>
              </Dialog.Actions>
            </Dialog.Content>
          </Dialog>
        </li>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "View Alpine study" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const page = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(page.getByRole("dialog", { name: "Alpine study" })).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
