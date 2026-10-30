import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { CollectionList } from "../CollectionList/CollectionList";
import { CollectionRow } from "../CollectionRow/CollectionRow";
import { Dialog } from "../Dialog/Dialog";
import { Fieldset } from "../Fieldset/Fieldset";
import { FormSection } from "../FormSection/FormSection";
import { Heading } from "../Heading/Heading";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";
import { Status } from "../Status/Status";
import { Switch } from "../Switch/Switch";
import { Text } from "../Text/Text";
import { Settings } from "./Settings";

const meta = {
  title: "Layout/Settings",
  component: Settings,
  tags: ["autodocs"],
} satisfies Meta<typeof Settings>;
export default meta;
type Story = StoryObj<typeof meta>;

const frequencies = [
  { value: "instant", label: "Instantly" },
  { value: "daily", label: "Daily digest" },
  { value: "weekly", label: "Weekly digest" },
];
const events = [
  "Task assigned to me",
  "I'm mentioned",
  "New comments on my tasks",
  "Due date reminders",
  "Project status changes",
];

// Rebuilds M2 prompt s02: notification settings for a project management app.
function NotificationSettings() {
  const [email, setEmail] = useState(true);
  const [frequency, setFrequency] = useState<string | null>("daily");
  const [chosen, setChosen] = useState(new Set(events.slice(0, 2)));
  const [push, setPush] = useState(false);
  const [quiet, setQuiet] = useState(true);
  return (
    <Settings
      header={
        <>
          <Heading level={1}>Notifications</Heading>
          <Text tone="muted">Choose how and when you hear about project activity.</Text>
        </>
      }
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <FormSection
          title="Email"
          description="Sent to the address on your profile."
          actions={<Button type="submit">Save email settings</Button>}
        >
          <Switch label="Email notifications" checked={email} onCheckedChange={setEmail} />
          <Select
            label="Frequency"
            options={frequencies}
            value={frequency}
            onValueChange={setFrequency}
          />
          <Fieldset legend="Email me about">
            {events.map((event) => (
              <Checkbox
                key={event}
                label={event}
                checked={chosen.has(event)}
                onCheckedChange={(checked) => {
                  const next = new Set(chosen);
                  if (checked) next.add(event);
                  else next.delete(event);
                  setChosen(next);
                }}
              />
            ))}
          </Fieldset>
        </FormSection>
      </form>
      <FormSection title="Push" description="Delivered to the mobile app.">
        <Switch
          label="Push notifications"
          description="Applies on every signed-in device."
          checked={push}
          onCheckedChange={setPush}
        />
      </FormSection>
      <FormSection title="Quiet hours" description="Pause push and email overnight.">
        <Switch label="Pause 22:00 to 07:00" checked={quiet} onCheckedChange={setQuiet} />
      </FormSection>
    </Settings>
  );
}

const members = [
  { name: "Ada Chen", email: "ada@northwind.dev", role: "Owner" },
  { name: "Lin Patel", email: "lin@northwind.dev", role: "Admin" },
  { name: "Sam Okafor", email: "sam@northwind.dev", role: "Member" },
];
const roles = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

// Rebuilds M2 prompt s04: team members with invite, role change and confirmed removal.
function TeamSettings() {
  const [role, setRole] = useState<string | null>("member");
  return (
    <Settings
      header={
        <>
          <Heading level={1}>Team members</Heading>
          <Text tone="muted">Invite people to Northwind and manage what they can change.</Text>
        </>
      }
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <FormSection
          title="Invite a member"
          description="They get an email with a link that expires in 7 days."
          actions={<Button type="submit">Send invite</Button>}
        >
          <Input label="Email address" type="email" autoComplete="off" />
          <Select label="Role" options={roles} value={role} onValueChange={setRole} />
        </FormSection>
      </form>
      <FormSection title="Members" description={`${members.length} people have access.`}>
        <CollectionList aria-label="Members">
          {members.map((member) => (
            <CollectionRow
              key={member.email}
              title={member.name}
              description={member.email}
              metadata={
                <Status tone={member.role === "Owner" ? "info" : "neutral"}>{member.role}</Status>
              }
              actions={
                member.role === "Owner" ? null : (
                  <>
                    <Button variant="secondary" aria-label={`Change role for ${member.name}`}>
                      Change role
                    </Button>
                    <Dialog>
                      <Dialog.Trigger
                        render={<Button variant="ghost" aria-label={`Remove ${member.name}`} />}
                      >
                        Remove
                      </Dialog.Trigger>
                      <Dialog.Content
                        title={`Remove ${member.name}?`}
                        description="They lose access to every Northwind project at once."
                      >
                        <Dialog.Actions>
                          <Dialog.Close render={<Button variant="danger" />}>
                            Remove member
                          </Dialog.Close>
                          <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
                        </Dialog.Actions>
                      </Dialog.Content>
                    </Dialog>
                  </>
                )
              }
            />
          ))}
        </CollectionList>
      </FormSection>
    </Settings>
  );
}

export const Notifications: Story = { render: () => <NotificationSettings /> };

export const TeamMembers: Story = { render: () => <TeamSettings /> };

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

// Section heading sits beside its fields from 40rem of section width, above them below it.
function expectSectionsCollapse(frame: HTMLElement) {
  for (const section of frame.querySelectorAll<HTMLElement>(".kb-formsection")) {
    const header = section.querySelector(".kb-formsection-header")?.getBoundingClientRect();
    const body = section.querySelector(".kb-formsection-body")?.getBoundingClientRect();
    if (!header || !body) throw new Error("Expected section header and body");
    if (section.getBoundingClientRect().width < 640) {
      expect(body.top).toBeGreaterThanOrEqual(header.bottom);
    } else {
      expect(body.top).toBeCloseTo(header.top, 0);
      expect(body.left).toBeGreaterThan(header.right);
      expect(body.width / header.width).toBeCloseTo(2, 1);
    }
  }
}

export const ResponsiveGeometry: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ display: "grid", gap: "2rem" }}>
      {widths.map((width) => (
        <div key={width} data-testid={`frame-${width}`} style={{ inlineSize: width }}>
          <NotificationSettings />
          <TeamSettings />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const width of widths) {
      const frame = within(canvasElement).getByTestId(`frame-${width}`);
      // Frames must keep their width, or the wide branches never run.
      expect(frame.getBoundingClientRect().width).toBeCloseTo(width, 0);
      expectUsable(frame);
      expectSectionsCollapse(frame);
    }
    const narrow = within(canvasElement).getByTestId("frame-390");
    const save = within(narrow).getByRole("button", { name: "Save email settings" });
    expect(save.getBoundingClientRect().width).toBeCloseTo(
      save.parentElement?.getBoundingClientRect().width ?? 0,
      0,
    );
  },
};
