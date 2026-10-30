import { Button, Grid, Heading, Inline, Input, Panel, Text } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, within } from "storybook/test";
import { FormSection } from "./FormSection";

function ContactForm() {
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [saved, setSaved] = useState(false);
  const name = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const error =
    errors.name || errors.email ? "Check contact details before saving this section." : undefined;
  return (
    <main>
      <Heading level={1}>Workspace settings</Heading>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const nextErrors = {
            name: name.current?.validity.valid ? "" : "Enter a contact name.",
            email: email.current?.validity.valid ? "" : "Enter a valid contact email.",
          };
          setErrors(nextErrors);
          if (nextErrors.name || nextErrors.email) {
            setSaved(false);
            (nextErrors.name ? name : email).current?.focus();
            return;
          }
          setSaved(true);
        }}
      >
        <Grid layout="stack">
          <FormSection
            title="Contact details"
            description="We use this address for delivery updates. Both fields are required."
            error={error}
          >
            <Input
              ref={name}
              label="Contact name"
              name="contactName"
              defaultValue="Sam Rivera"
              required
              {...(errors.name ? { error: errors.name } : {})}
            />
            <Input
              ref={email}
              label="Contact email"
              type="email"
              name="contactEmail"
              defaultValue="sam@"
              required
              {...(errors.email ? { error: errors.email } : {})}
            />
          </FormSection>
          <Inline>
            <Button type="submit">Save contact</Button>
            <Text role="status">
              {saved ? "Contact details saved." : "Changes stay in this form until saved."}
            </Text>
          </Inline>
        </Grid>
      </form>
    </main>
  );
}

const meta = {
  title: "Recipes/FormSection",
  component: FormSection,
  args: { title: "Contact details" },
  tags: ["!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof FormSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ContactDetails: Story = {
  render: () => <ContactForm />,
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("group", { name: "Contact details" });
    await expect(section).toHaveAccessibleDescription(
      "We use this address for delivery updates. Both fields are required.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Save contact" }));
    await expect(section).toHaveAccessibleDescription(
      "We use this address for delivery updates. Both fields are required. Check contact details before saving this section.",
    );
    const email = canvas.getByRole("textbox", { name: "Contact email" });
    await expect(email).toHaveFocus();
    await expect(email).toHaveValue("sam@");
    await expect(canvas.getByRole("textbox", { name: "Contact name" })).toHaveValue("Sam Rivera");
    await userEvent.clear(email);
    await userEvent.type(email, "sam@example.com");
    await userEvent.click(canvas.getByRole("button", { name: "Save contact" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Contact details saved.");
    await expect(section).not.toHaveAttribute("aria-invalid", "true");
    await expect(section).toHaveAccessibleDescription(
      "We use this address for delivery updates. Both fields are required.",
    );
    await expect(email).toHaveValue("sam@example.com");
    const name = canvas.getByRole("textbox", { name: "Contact name" });
    await userEvent.clear(name);
    await userEvent.click(canvas.getByRole("button", { name: "Save contact" }));
    await expect(name).toHaveFocus();
    await expect(name).toHaveAccessibleDescription("Enter a contact name.");
    await expect(email).not.toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveValue("sam@example.com");
  },
};

export const InPanel: Story = {
  render: () => (
    <main>
      <Panel aria-labelledby="profile-title">
        <Panel.Header>
          <Heading level={1} id="profile-title">
            Organization profile
          </Heading>
        </Panel.Header>
        <Panel.Body>
          <Grid layout="stack">
            <FormSection title="Public profile" description="Visible to your collaborators.">
              <Input
                label="Organization name"
                name="organization"
                defaultValue="Northstar Studio"
              />
            </FormSection>
            <FormSection
              title="Billing contact"
              description="Only workspace owners can see this address."
            >
              <Input
                label="Billing email"
                type="email"
                name="billingEmail"
                defaultValue="billing@example.com"
              />
            </FormSection>
          </Grid>
        </Panel.Body>
      </Panel>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Public profile" })).toHaveAccessibleDescription(
      "Visible to your collaborators.",
    );
    await expect(
      canvas.getByRole("group", { name: "Billing contact" }),
    ).toHaveAccessibleDescription("Only workspace owners can see this address.");
    expect(canvasElement.querySelector("form")).toBeNull();
  },
};

export const Minimal: Story = {
  render: () => (
    <main>
      <Heading level={1}>Preferences</Heading>
      <FormSection title="Display">
        <Input label="Workspace label" name="label" />
      </FormSection>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("group", { name: "Display" });
    await expect(section).not.toHaveAttribute("aria-describedby");
    await expect(section).not.toHaveAttribute("aria-invalid");
  },
};

export const Disabled: Story = {
  render: () => (
    <main>
      <Heading level={1}>Account</Heading>
      <form>
        <FormSection
          title="Managed contact"
          description="Your administrator manages these fields."
          disabled
        >
          <Input label="Managed email" name="managedEmail" defaultValue="managed@example.com" />
          <Button>Update contact</Button>
        </FormSection>
      </form>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Managed email" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Update contact" })).toBeDisabled();
    const form = canvasElement.querySelector("form");
    if (!form) throw new Error("Expected form");
    expect(new FormData(form).has("managedEmail")).toBe(false);
  },
};

export const NarrowWithError: Story = {
  render: () => (
    <main style={{ inlineSize: "20rem", maxInlineSize: "100%" }}>
      <Heading level={1}>Delivery</Heading>
      <FormSection
        title="International delivery instructions and regional contact preferences"
        description="Keep every field label and explanation readable when this section appears inside a narrow settings pane."
        error="Delivery instructions could not be saved. Review the regional contact details and try again."
      >
        <Input
          label="Regional delivery contact"
          name="regionalContact"
          description="Include the team or person responsible for delivery."
          defaultValue="International operations team"
        />
      </FormSection>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const main = within(canvasElement).getByRole("main");
    expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth + 1);
    await expect(within(canvasElement).getByRole("group")).toHaveAttribute("aria-invalid", "true");
  },
};
