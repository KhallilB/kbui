# Form

Use Form for one task with one submit action, such as checkout, booking or sign-up. It renders a native `form` with three regions in reading order: an optional header, the fields, and an actions row. Fill the regions and the arrangement comes with them: a readable maximum width, even spacing between sections, and actions that fill the row on narrow screens. For pages of independently saved sections, use [Settings](Settings.md).

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/layout-form--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, Form, FormSection, Heading, Input } from "@kb.ui/react";

export function Example() {
  return (
    <Form
      aria-labelledby="booking-title"
      onSubmit={(event) => event.preventDefault()}
      header={
        <Heading level={1} id="booking-title">
          Book a room
        </Heading>
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
      <FormSection title="Dates">
        <Input label="Check-in" type="date" name="checkIn" />
        <Input label="Check-out" type="date" name="checkOut" />
      </FormSection>
      <FormSection title="Guest">
        <Input label="Full name" name="name" autoComplete="name" />
      </FormSection>
    </Form>
  );
}
```

## More examples

- [Hotel booking](https://kbui.kcb.pro/storybook/?path=/story/layout-form--hotel-booking): Dates, room type and extras in three sections, then one confirm action.
- [Sign up](https://kbui.kcb.pro/storybook/?path=/story/layout-form--sign-up): A short form at the narrow width, with plain fields and no sections.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `header` | `ReactNode` | unset | Title and intro above the fields |
| `actions` | `ReactNode` | unset | Rendered in [FormActions](FormActions.md) with a divider; put the submit button first |
| `actionsAlign` | `"end" \| "start" \| "between"` | `"end"` | Alignment of the actions row at 30rem and wider |
| `width` | `"sm" \| "md" \| "full"` | `"md"` | Maximum inline size: 32rem, 40rem or none |
| `classNames` | `{ header?, body?, actions? }` | unset | Classes for the regions |

Other native form props and `ref` pass through. Children fill the body: [FormSection](FormSection.md) groups for longer tasks, or plain fields for short ones.

Below 30rem of row width, each action fills its own row in source order, so the submit button sits on top and every button is a full-width target. Tokens: `--kb-form-gap`, `--kb-form-width-sm` and `--kb-form-width-md`.

A form is a landmark only when it has a name; add `aria-label` or `aria-labelledby` when people should find it from the landmark list. Your app owns validation, [ErrorSummary](ErrorSummary.md) focus after a failed submit, pending state and success feedback.

## Related components

Use [Settings](Settings.md) for independently saved sections, [FormSection](FormSection.md) to group fields and [Container](Container.md) for the page boundary around the form.
