# FormSection

Use FormSection to group related fields under a section heading, with optional help, a section error and the section's own actions. It renders a native `fieldset` named by its heading, so screen reader users can browse sections by heading and hear the group name on entry. Use [Form](Form.md) or [Settings](Settings.md) to arrange several sections.

[All components](../../README.md#components) · [Usage](#usage) · [Examples](#more-examples) · [Reference](#reference) · [Live examples and accessibility](https://kbui.kcb.pro/storybook/?path=/docs/components-formsection--docs)

## Usage

```tsx
import "@kb.ui/react/styles.css";
import { Button, FormSection, Input } from "@kb.ui/react";

export function Example() {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <FormSection
        title="Profile"
        description="Shown to everyone in your workspace."
        actions={<Button type="submit">Save profile</Button>}
      >
        <Input label="Display name" name="name" />
        <Input label="Job title" name="title" />
      </FormSection>
    </form>
  );
}
```

## More examples

- [Heading beside fields](https://kbui.kcb.pro/storybook/?path=/story/components-formsection--split-layout): Split layout, which stacks below 40rem of section width.
- [Section error](https://kbui.kcb.pro/storybook/?path=/story/components-formsection--section-error): A group-level error alongside a field error.
- [Pending save](https://kbui.kcb.pro/storybook/?path=/story/components-formsection--pending-save): Lock every field and action while a save is in flight.

## Reference

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | Section heading; also names the group |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | Heading rank; follow the page outline |
| `description` | `ReactNode` | unset | Help text; added to the group's `aria-describedby` |
| `error` | `ReactNode` | unset | Section error; sets `data-invalid` and `aria-invalid` and describes the group |
| `actions` | `ReactNode` | unset | Buttons rendered in [FormActions](FormActions.md) after the fields |
| `actionsAlign` | `"start" \| "end" \| "between"` | `"end"` | Alignment of the actions row |
| `layout` | `"stack" \| "split"` | unset | Heading above or beside the fields; unset stacks, or splits inside Settings |
| `disabled` | `boolean` | `false` | Native fieldset disabling for every field and action |
| `classNames` | `{ header?, title?, description?, body?, fields?, error?, actions? }` | unset | Classes for inner parts |

Other native fieldset props and `ref` pass through. A caller `aria-describedby` follows the description and error ids, and a caller `aria-invalid` token such as `"spelling"` is kept. The section heading names the group with `aria-labelledby`, unless you pass `aria-label`: a native legend cannot sit in the split layout's first column.

Split layout puts the header in one third and the fields in two thirds when the section is at least `--kb-formsection-collapse` (40rem) wide, and stacks them below that. Actions sit last in the section body, end-aligned. Below 30rem of row width, each button or link in the actions fills its own row so targets stay wide on phones; other content, such as a spinner, keeps its size. Tokens: `--kb-formsection-gap`, `--kb-formsection-header-gap`, `--kb-formsection-fields-gap` and `--kb-formsection-collapse`.

Your app owns validation, saving and the announcement of saved or failed sections. While saving, pass `disabled` and `aria-busy`. Native disabling takes focus away from the pressed Save button, so move focus to a status message outside the section (`role="status"`, `tabIndex={-1}`) and report the result there.

## Related components

Use [Fieldset](Fieldset.md) for a question-style group with a legend inside a section, [FormActions](FormActions.md) for a form-wide action row and [ErrorSummary](ErrorSummary.md) for recovery after a failed submit.
