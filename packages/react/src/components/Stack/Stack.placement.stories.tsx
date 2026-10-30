import type { Meta } from "@storybook/react-vite";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { Heading } from "../Heading/Heading";
import { Inline } from "../Inline/Inline";
import { Text } from "../Text/Text";
import { Stack } from "./Stack";
import { placement } from "./Stack.placement";

const meta = { title: "Placement/Stack", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

const render = () => (
  <Stack as="section" aria-labelledby="billing-title">
    <Heading level={2} size="md" id="billing-title">
      Billing
    </Heading>
    <Text>Your plan renews on 1 December. Invoices go to the billing contact.</Text>
    <Inline gap="sm">
      <Button>Change plan</Button>
      <Button variant="secondary">Download invoices</Button>
    </Inline>
  </Stack>
);

export const PlacementCompact = placementStory(placement, "compact", render);
export const PlacementMedium = placementStory(placement, "medium", render);
export const PlacementWide = placementStory(placement, "wide", render);
