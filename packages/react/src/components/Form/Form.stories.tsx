import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { FormSection } from "../FormSection/FormSection";
import { Heading } from "../Heading/Heading";
import { Input } from "../Input/Input";
import { NumberField } from "../NumberField/NumberField";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { Text } from "../Text/Text";
import { Form } from "./Form";

const meta = {
  title: "Layout/Form",
  component: Form,
  tags: ["autodocs"],
} satisfies Meta<typeof Form>;
export default meta;
type Story = StoryObj<typeof meta>;

const extras = ["Breakfast for every guest", "Late checkout at 14:00", "Airport transfer"];

// Rebuilds M2 prompt c09: pick dates, a room type and extras, then confirm.
function Booking() {
  const [guests, setGuests] = useState<number | null>(2);
  const [room, setRoom] = useState<string | null>("deluxe");
  const [chosen, setChosen] = useState(new Set<string>());
  return (
    <Form
      onSubmit={(event) => event.preventDefault()}
      header={
        <>
          <Heading level={1}>Book a room</Heading>
          <Text tone="muted">
            Harbour View Hotel, Lisbon. Free cancellation until 48 hours before.
          </Text>
        </>
      }
      actions={
        <>
          <Button type="submit">Confirm booking</Button>
          <Button type="button" variant="ghost">
            Back to rooms
          </Button>
        </>
      }
    >
      <FormSection title="Dates and guests">
        <Input label="Check-in" type="date" defaultValue="2026-11-12" />
        <Input label="Check-out" type="date" defaultValue="2026-11-15" />
        <NumberField label="Guests" min={1} max={4} value={guests} onValueChange={setGuests} />
      </FormSection>
      <FormSection title="Room">
        <RadioGroup label="Room type" value={room} onValueChange={setRoom}>
          <RadioGroup.Item value="standard">Standard, €140 a night</RadioGroup.Item>
          <RadioGroup.Item value="deluxe">Deluxe with harbour view, €185 a night</RadioGroup.Item>
          <RadioGroup.Item value="suite">Suite, €260 a night</RadioGroup.Item>
        </RadioGroup>
      </FormSection>
      <FormSection title="Extras" description="Added to the bill at checkout.">
        {extras.map((extra) => (
          <Checkbox
            key={extra}
            label={extra}
            checked={chosen.has(extra)}
            onCheckedChange={(checked) => {
              const next = new Set(chosen);
              if (checked) next.add(extra);
              else next.delete(extra);
              setChosen(next);
            }}
          />
        ))}
      </FormSection>
    </Form>
  );
}

function SignUpForm() {
  const [updates, setUpdates] = useState(false);
  return (
    <Form
      width="sm"
      onSubmit={(event) => event.preventDefault()}
      header={<Heading level={1}>Create your account</Heading>}
      actions={<Button type="submit">Create account</Button>}
    >
      <Input label="Full name" autoComplete="name" />
      <Input label="Work email" type="email" autoComplete="email" />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        description="At least 12 characters."
      />
      <Checkbox label="Email me product updates" checked={updates} onCheckedChange={setUpdates} />
    </Form>
  );
}

export const HotelBooking: Story = { render: () => <Booking /> };

export const SignUp: Story = { render: () => <SignUpForm /> };

const widths = [390, 768, 1440] as const;
const targetSelector =
  "a[href], button, input:not([type='hidden']), select, textarea, [tabindex]:not([tabindex='-1'])";

// Fails on sideways overflow, pointer targets under 24px (WCAG 2.5.8) or overlapping targets.
function expectUsable(frame: HTMLElement) {
  expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  const box = frame.getBoundingClientRect();
  const targets = [...frame.querySelectorAll<HTMLElement>(targetSelector)]
    .filter((el) => !el.closest("[aria-hidden='true'], [hidden]"))
    .map((el) => ({ el, rect: el.getBoundingClientRect() }));
  expect(targets.length).toBeGreaterThan(0);
  for (const { el, rect } of targets) {
    const name =
      el.getAttribute("aria-label") ?? el.closest("label")?.textContent ?? el.textContent;
    expect(rect.width, `${name} width`).toBeGreaterThanOrEqual(24);
    expect(rect.height, `${name} height`).toBeGreaterThanOrEqual(24);
    expect(rect.left, `${name} left`).toBeGreaterThanOrEqual(box.left - 0.5);
    expect(rect.right, `${name} right`).toBeLessThanOrEqual(box.right + 0.5);
  }
  for (const [i, a] of targets.entries()) {
    for (const b of targets.slice(i + 1)) {
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const overlapX = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const overlapY = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      expect(
        overlapX > 0.5 && overlapY > 0.5,
        `${a.el.textContent} overlaps ${b.el.textContent}`,
      ).toBe(false);
    }
  }
}

export const ResponsiveGeometry: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {widths.map((width) => (
        <div
          key={width}
          data-testid={`frame-${width}`}
          style={{ inlineSize: width, maxInlineSize: "100%" }}
        >
          <Booking />
          <SignUpForm />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const width of widths) {
      const frame = within(canvasElement).getByTestId(`frame-${width}`);
      // Frames clamp to the canvas; it must fit 768px or the wide branches never run.
      const available = frame.parentElement?.getBoundingClientRect().width ?? 0;
      expect(available).toBeGreaterThanOrEqual(768);
      expect(frame.getBoundingClientRect().width).toBeCloseTo(Math.min(width, available), 0);
      expectUsable(frame);
      const [booking, signUp] = frame.querySelectorAll<HTMLElement>(".kb-form");
      if (!booking || !signUp) throw new Error("Expected both forms");
      expect(booking.getBoundingClientRect().width).toBeLessThanOrEqual(640.5);
      expect(signUp.getBoundingClientRect().width).toBeLessThanOrEqual(512.5);
      const actions = booking.querySelector<HTMLElement>(".kb-form-actions");
      const [confirm, back] = within(booking).getAllByRole("button", {
        name: /Confirm booking|Back to rooms/,
      });
      if (!actions || !confirm || !back) throw new Error("Expected booking actions");
      const row = actions.getBoundingClientRect();
      if (row.width < 480) {
        // Compact: each action fills its own row, submit first.
        expect(confirm.getBoundingClientRect().width).toBeCloseTo(row.width, 0);
        expect(back.getBoundingClientRect().top).toBeGreaterThan(
          confirm.getBoundingClientRect().bottom,
        );
      } else {
        expect(confirm.getBoundingClientRect().width).toBeLessThan(row.width / 2);
        expect(back.getBoundingClientRect().top).toBeCloseTo(
          confirm.getBoundingClientRect().top,
          0,
        );
      }
    }
  },
};
