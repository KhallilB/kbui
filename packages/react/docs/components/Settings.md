# Settings

Use Settings for a page of preferences or account management: sections of fields, and managed lists such as members, API keys or sessions with row actions. Each section is saved on its own. Settings renders a header region and a sections region with a rule between sections; [FormSection](FormSection.md) children put their heading beside their fields on wide screens and above them on narrow ones. For one task with a single submit, use [Form](Form.md).

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-settings--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Container, FormSection, Heading, Input, Settings, Switch } from "@kb.ui/react";
import { useState } from "react";

export function Example() {
  const [digest, setDigest] = useState(true);
  return (
    <Container as="main">
      <Settings header={<Heading level={1}>Account</Heading>}>
        <form onSubmit={(event) => event.preventDefault()}>
          <FormSection
            title="Profile"
            description="Shown to everyone in your workspace."
            actions={<Button type="submit">Save profile</Button>}
          >
            <Input label="Display name" name="name" />
          </FormSection>
        </form>
        <FormSection title="Email" description="Sent to the address on your profile.">
          <Switch label="Weekly digest" checked={digest} onCheckedChange={setDigest} />
        </FormSection>
      </Settings>
    </Container>
  );
}
```

## More examples

- [Notifications](https://kbui.kcb.pro/storybook/?path=/story/layout-settings--notifications): Email, push and quiet-hours sections with switches, a frequency select and event checkboxes.
- [Team members](https://kbui.kcb.pro/storybook/?path=/story/layout-settings--team-members): An invite form beside a member list with role changes and a confirmed removal.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `header` | `ReactNode` | unset | Page title and intro above the sections |
| `classNames` | `{ header?, sections? }` | unset | Classes for the regions |

Other native div props and `ref` pass through. Direct children of the sections region are separated by a rule; wrap a section in its own `form` when it saves fields, and leave list sections unwrapped.

A FormSection inside Settings uses the split layout unless you set its `layout`: header in one third, fields in two thirds from 40rem of section width, stacked below it. Tokens: `--kb-settings-gap` and `--kb-settings-divider`.

Start the header with an `h1` and keep section headings at `h2`. Put destructive row actions behind a confirmation such as [Dialog](Dialog.md), and announce saved or failed sections with a status message. Your app owns saving, list data and permissions.

## Related components

Use [FormSection](FormSection.md) for each section, [CollectionList](CollectionList.md) for managed lists and [Form](Form.md) for a single task.
