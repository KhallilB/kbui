import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";
import { Badge } from "../Badge/Badge";
import { Card } from "../Card/Card";
import { Grid } from "../Grid/Grid";
import { Heading } from "../Heading/Heading";
import { Inline } from "../Inline/Inline";
import { Link } from "../Link/Link";
import { Text } from "../Text/Text";
import { Avatar } from "./Avatar";

const portrait = "./media/portraits/maya.jpg";

const portraits = [
  { name: "Maya Chen", file: "maya", role: "Design director" },
  { name: "Robin Ellis", file: "robin", role: "Research lead" },
  { name: "Ana López", file: "ana", role: "Illustrator" },
  { name: "Amir Haddad", file: "amir", role: "Product designer" },
  { name: "Sora Ito", file: "sora", role: "Photographer" },
  { name: "Noor Rahman", file: "noor", role: "Editor" },
];

const identities: {
  name: string;
  detail: string;
  initials?: string;
  shape?: "circle" | "square" | "rounded";
}[] = [
  { name: "Maya Chen", detail: "First and last name" },
  { name: "Robin Ellis", detail: "Two-word identity" },
  { name: "Ana María López", detail: "Multiple given names" },
  { name: "Amir Haddad", detail: "Personal profile" },
  { name: "Sora Ito", detail: "Team directory" },
  { name: "Noor Rahman", detail: "Shared workspace" },
  { name: "Alexandria Catherine Montgomery", detail: "Long full name" },
  { name: "Jean-Luc Picard", detail: "Hyphenated given name" },
  { name: "Zoë Dupré", detail: "Diacritics preserved" },
  { name: "Élodie Brun", detail: "Accented initial" },
  { name: "Søren Lind", detail: "Latin script variant" },
  { name: "İpek Yılmaz", detail: "Dotted initial" },
  { name: "李小龙", detail: "Single unspaced name" },
  { name: "山田 太郎", detail: "Japanese-script name" },
  { name: "김 하늘", detail: "Korean-script name" },
  { name: "أميرة خالد", detail: "Arabic-script name" },
  { name: "נועה כהן", detail: "Hebrew-script name" },
  { name: "Chiwetel Ejiofor", detail: "Profile without photography" },
  { name: "Björk", detail: "Single-name identity" },
  { name: "Prince", detail: "One-word identity" },
  {
    name: "North Studio",
    detail: "Custom organization mark",
    initials: "N",
    shape: "rounded",
  },
  {
    name: "Studio 04",
    detail: "Caller-owned numeric mark",
    initials: "04",
    shape: "square",
  },
  {
    name: "Field Notes",
    detail: "Custom brand initials",
    initials: "FN",
    shape: "rounded",
  },
  { name: "", detail: "Unknown identity" },
];

const shapes = ["circle", "square", "rounded", "hexagon", "diamond"] as const;
const collectionStyle = { display: "grid", gap: "var(--kb-space-6)", inlineSize: "100%" } as const;

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Maya Chen", src: portrait },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Sizes: Story = {
  render: (args) => (
    <Inline align="center" gap="lg">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const avatars = [...canvasElement.querySelectorAll<HTMLElement>(".kb-avatar")];
    expect(avatars).toHaveLength(5);
    for (const [index, avatar] of avatars.entries()) {
      const media = avatar.querySelector<HTMLElement>(".kb-avatar-media");
      if (!media) throw new Error("Missing avatar media");
      expect(avatar.getBoundingClientRect().width).toBe([24, 32, 44, 56, 80][index]);
      expect(getComputedStyle(media).borderRadius).toBe(getComputedStyle(avatar).borderRadius);
      if (matchMedia("(forced-colors: active)").matches)
        expect(getComputedStyle(media).boxShadow).toBe("none");
    }
  },
};
export const Fallbacks: Story = {
  render: () => (
    <Inline gap="lg">
      <Avatar name="Maya Chen" />
      <Avatar name="Ana María López" />
      <Avatar name="李" />
      <Avatar name="Robin Ellis" src="data:image/png;base64,invalid" />
      <Avatar name="North Studio" initials="N" shape="square" />
      <Avatar name="" />
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("img", { name: "Robin Ellis" })).toBeInTheDocument();
    expect(canvas.getByText("RE")).toBeVisible();
  },
};
export const People: Story = {
  render: () => (
    <Card>
      <Inline gap="md" align="center">
        <Avatar name="Maya Chen" decorative src={portrait} size="lg" />
        <div>
          <Link href="#maya-profile">Maya Chen</Link>
          <Text size="sm" tone="muted">
            Design director · North Studio
          </Text>
        </div>
        <Badge>Owner</Badge>
      </Inline>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("img")).toBeNull();
    const link = canvas.getByRole("link", { name: "Maya Chen" });
    link.focus();
    expect(link).toHaveFocus();
  },
};

export const Initials: Story = {
  render: () => (
    <div style={collectionStyle}>
      <div>
        <Inline gap="sm">
          <Badge>24 identities</Badge>
          <Text as="span" size="sm" tone="muted">
            No photo required
          </Text>
        </Inline>
        <Heading level={2} size="lg">
          A name makes its mark.
        </Heading>
        <Text tone="muted">
          Personal profiles, multilingual names, and organization marks share one steady frame.
        </Text>
      </div>
      <Grid as="ul" columns={3} gap="md">
        {identities.map((identity) => (
          <Card as="li" key={identity.name || "unknown"}>
            <Inline align="start" gap="md">
              <Avatar
                name={identity.name}
                initials={identity.initials}
                shape={identity.shape}
                size="lg"
                decorative
              />
              <div>
                <Heading level={3} size="sm">
                  {identity.name || "Unknown person"}
                </Heading>
                <Text size="sm" tone="muted">
                  {identity.detail}
                </Text>
              </div>
            </Inline>
          </Card>
        ))}
      </Grid>
      <Text size="sm" tone="muted">
        Automatic initials use the first and last whitespace-separated names. Supply initials for
        the preferred local or brand form.
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const avatars = [...canvasElement.querySelectorAll<HTMLElement>(".kb-avatar")];
    expect(avatars).toHaveLength(24);
    const expectedInitials = [
      "MC",
      "RE",
      "AL",
      "AH",
      "SI",
      "NR",
      "AM",
      "JP",
      "ZD",
      "ÉB",
      "SL",
      "İY",
      "李",
      "山太",
      "김하",
      "أخ",
      "נכ",
      "CE",
      "B",
      "P",
      "N",
      "04",
      "FN",
      "?",
    ];
    for (const [index, avatar] of avatars.entries()) {
      const expected = expectedInitials[index];
      expect(avatar.querySelector(".kb-avatar-initials")?.textContent?.trim()).toBe(expected);
      expect(avatar.querySelector(".kb-avatar-media")).toHaveAttribute("data-state", "empty");
      expect(avatar).toHaveAttribute("aria-hidden", "true");
    }
    expect(canvasElement.querySelectorAll("img")).toHaveLength(0);
  },
};

export const Shapes: Story = {
  render: () => (
    <div style={collectionStyle}>
      <div>
        <Badge>Five silhouettes</Badge>
        <Heading level={2} size="lg">
          A shape for every identity.
        </Heading>
        <Text tone="muted">
          Compare the same portrait and initials in each frame. Cropping changes the edge while the
          person stays upright.
        </Text>
      </div>
      <Grid as="ul" columns={3} gap="md">
        {shapes.map((shape) => (
          <Card as="li" key={shape} data-shape-example={shape}>
            <Inline gap="md" align="center">
              <Avatar name="Maya Chen" src={portrait} shape={shape} size="xl" />
              <Avatar name="Maya Chen" shape={shape} size="xl" />
            </Inline>
            <Heading level={3} size="sm" style={{ marginBlockStart: "var(--kb-space-4)" }}>
              {shape.charAt(0).toUpperCase() + shape.slice(1)}
            </Heading>
            <Text size="sm" tone="muted">
              Portrait and initials
            </Text>
          </Card>
        ))}
      </Grid>
      <Card>
        <Inline gap="md">
          <Avatar
            data-radius-override=""
            name="Maya Chen"
            src={portrait}
            size="lg"
            style={{ borderRadius: "var(--kb-radius-sm)" }}
          />
          <div>
            <Heading level={3} size="sm">
              Your radius, inherited.
            </Heading>
            <Text size="sm" tone="muted">
              A caller-owned corner radius reaches the photo frame.
            </Text>
          </div>
        </Inline>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const groups = [...canvasElement.querySelectorAll<HTMLElement>("[data-shape-example]")];
    expect(groups).toHaveLength(5);
    for (const group of groups) {
      const shape = group.dataset.shapeExample;
      const avatars = [...group.querySelectorAll<HTMLElement>(".kb-avatar")];
      expect(avatars).toHaveLength(2);
      for (const avatar of avatars) {
        const media = avatar.querySelector<HTMLElement>(".kb-avatar-media");
        if (!media) throw new Error("Missing avatar media");
        const style = getComputedStyle(media);
        expect(style.borderRadius).toBe(getComputedStyle(avatar).borderRadius);
        if (shape === "square" || shape === "hexagon" || shape === "diamond")
          expect(style.borderRadius).toBe("0px");
        if (shape === "circle")
          expect(Number.parseFloat(style.borderRadius)).toBeGreaterThanOrEqual(40);
        if (shape === "rounded") {
          expect(Number.parseFloat(style.borderRadius)).toBeGreaterThan(0);
          expect(Number.parseFloat(style.borderRadius)).toBeLessThan(40);
        }
        const clip =
          shape === "hexagon"
            ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
            : shape === "diamond"
              ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
              : "none";
        expect(style.clipPath).toBe(clip);
        expect(
          getComputedStyle(
            media.querySelector("img") ?? media.querySelector(".kb-avatar-initials") ?? media,
          ).transform,
        ).toBe("none");
        if (matchMedia("(forced-colors: active)").matches) expect(style.boxShadow).toBe("none");
      }
    }
    const override = canvasElement.querySelector<HTMLElement>("[data-radius-override]");
    const media = override?.querySelector<HTMLElement>(".kb-avatar-media");
    if (!override || !media) throw new Error("Missing custom radius example");
    expect(getComputedStyle(media).borderRadius).toBe(getComputedStyle(override).borderRadius);
    expect(getComputedStyle(media).borderRadius).toBe("4px");
  },
};

export const Portraits: Story = {
  render: () => (
    <div style={collectionStyle}>
      <div>
        <Inline gap="sm">
          <Badge>North Studio</Badge>
          <Text as="span" size="sm" tone="muted">
            Portrait library / 01
          </Text>
        </Inline>
        <Heading level={2} size="lg">
          People behind the work.
        </Heading>
        <Text tone="muted">
          Six fictional identities for profiles, contact lists, and team spaces. Original portraits
          are available as JPEG downloads.
        </Text>
      </div>
      <Grid as="ul" columns={3} gap="md">
        {portraits.map((person, index) => (
          <Card as="li" key={person.file}>
            <Inline justify="between" align="start">
              <Avatar
                name={person.name}
                src={`./media/portraits/${person.file}.jpg`}
                size="xl"
                shape={index % 2 === 0 ? "circle" : "rounded"}
                decorative
              />
              <Badge>{String(index + 1).padStart(2, "0")}</Badge>
            </Inline>
            <Heading level={3} size="sm" style={{ marginBlockStart: "var(--kb-space-4)" }}>
              {person.name}
            </Heading>
            <Text size="sm" tone="muted">
              {person.role}
            </Text>
            <Link
              href={`./media/portraits/${person.file}.jpg`}
              download={`${person.file}-portrait.jpg`}
              style={{
                marginBlockStart: "var(--kb-space-4)",
                fontSize: "var(--kb-text-small-size)",
              }}
            >
              Download {person.name} portrait
            </Link>
          </Card>
        ))}
      </Grid>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const media = [...canvasElement.querySelectorAll<HTMLElement>(".kb-avatar-media")];
    expect(media).toHaveLength(6);
    for (const frame of media)
      await waitFor(() => expect(frame).toHaveAttribute("data-state", "loaded"));
    const links = canvas.getAllByRole("link");
    expect(links).toHaveLength(6);
    for (const person of portraits) {
      const link = canvas.getByRole("link", { name: `Download ${person.name} portrait` });
      expect(link).toHaveAttribute("href", `./media/portraits/${person.file}.jpg`);
      expect(link).toHaveAttribute("download", `${person.file}-portrait.jpg`);
    }
    const first = canvas.getByRole("link", { name: "Download Maya Chen portrait" });
    first.focus();
    expect(first).toHaveFocus();
  },
};
