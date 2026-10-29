import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { Grid } from "../Grid/Grid";
import { Image } from "../Image/Image";
import { Link } from "../Link/Link";
import { Thumbnail } from "./Thumbnail";

const landscape = "./media/scenes/alpine.jpg";
const ceramic = "./media/objects/ceramic.jpg";
const tote = "./media/objects/tote.jpg";

const meta = {
  title: "Components/Thumbnail",
  component: Thumbnail,
  tags: ["autodocs"],
  args: {
    src: ceramic,
    alt: "Textured ceramic vase with eucalyptus on a sunlit plinth",
    caption: "The studio vase",
    description: "Chalk / Textured ceramic / Collection 04",
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
          src={ceramic}
          alt="Textured ceramic vase with eucalyptus"
          ratio="portrait"
          fit="contain"
          caption={<Link href="#studio-vase">The studio vase</Link>}
          description="Chalk · Textured ceramic"
        />
      </li>
      <li>
        <Thumbnail
          src={tote}
          alt="Natural canvas tote with dark handles beside a notebook"
          ratio="portrait"
          fit="contain"
          caption={<Link href="#canvas-tote">The everyday tote</Link>}
          description="Natural · Woven canvas"
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
          alt="Alpine river beneath sunlit mountain peaks"
          ratio="wide"
          caption={
            <Link href={landscape} download="alpine.jpg">
              Alpine-field-study.jpg
            </Link>
          }
          description="JPEG · 1200 × 800"
        />
      </li>
    </Grid>
  ),
};
export const Gallery: Story = {
  render: () => (
    <Grid as="ul" columns={2} gap="lg">
      {[
        { title: "Alpine study", src: landscape, alt: "River beneath sunlit alpine peaks" },
        { title: "Material study", src: ceramic, alt: "Textured ceramic vase with eucalyptus" },
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
