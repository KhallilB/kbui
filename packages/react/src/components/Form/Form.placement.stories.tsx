import type { Meta } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { placementBreaksStory } from "../../protocol/placement-breaks";
import { placementStory } from "../../protocol/placement-story";
import { Button } from "../Button/Button";
import { Heading } from "../Heading/Heading";
import { Input } from "../Input/Input";
import { Form } from "./Form";
import { placement } from "./Form.placement";
import { HotelBooking, SignUp } from "./Form.stories";

const meta = { title: "Placement/Form", tags: ["!dev", "!autodocs"] } satisfies Meta;
export default meta;

// M2 screens; their renders take no args.
const screen = (story: { render?: unknown }) => () => (story.render as () => ReactElement)();
const signUp = screen(SignUp);
const booking = screen(HotelBooking);

function Shipping() {
  return (
    <Form
      width="full"
      onSubmit={(event) => event.preventDefault()}
      header={<Heading level={1}>Shipping address</Heading>}
      actions={<Button type="submit">Save address</Button>}
    >
      <Input label="Street" autoComplete="street-address" />
      <Input label="City" autoComplete="address-level2" />
    </Form>
  );
}
const shipping = () => <Shipping />;

export const SmCompact = placementStory(placement[0], "compact", signUp);
export const SmMedium = placementStory(placement[0], "medium", signUp);
export const SmWide = placementStory(placement[0], "wide", signUp);
export const MdCompact = placementStory(placement[1], "compact", booking);
export const MdMedium = placementStory(placement[1], "medium", booking);
export const MdWide = placementStory(placement[1], "wide", booking);
export const FullCompact = placementStory(placement[2], "compact", shipping);
export const FullMedium = placementStory(placement[2], "medium", shipping);
export const FullWide = placementStory(placement[2], "wide", shipping);

export const CatchesBrokenRules = placementBreaksStory(placement[1], booking, {
  first: {
    css: '[data-break="first"] .kb-form-actions { order: -1; }',
    expected: ".kb-form-actions last",
  },
  narrow: {
    css: '[data-break="narrow"] .kb-form { max-inline-size: 20rem; }',
    expected: ":scope measure",
  },
  overlap: {
    css: '[data-break="overlap"] .kb-form-actions > * + * { margin-inline-start: -3rem; }',
    expected: "overlaps",
  },
});
