import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { placementStory } from "../../protocol/placement-story";
import { Heading } from "../Heading/Heading";
import { Text } from "../Text/Text";
import { Card } from "./Card";
import { placement } from "./Card.placement";

const meta = { title: "Placement/Card", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const card = (label: string) => (
  <Card aria-label={label}>
    <Heading level={2}>Website refresh</Heading>
    <Text>Review the latest draft and share feedback.</Text>
  </Card>
);

const render = () => card("Project");

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);

// A narrow query container on a wide page gives its cards compact padding.
export const PaddingFollowsContainer: StoryObj = {
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "desktop", isRotated: false } },
  parameters: { layout: "fullscreen" },
  render: () => (
    <>
      {card("Full width")}
      <aside style={{ inlineSize: "20rem", containerType: "inline-size" }}>{card("Aside")}</aside>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const padding = (name: string) => getComputedStyle(canvas.getByLabelText(name)).paddingTop;
    expect(padding("Full width")).toBe("24px");
    expect(padding("Aside")).toBe("20px");
  },
};
