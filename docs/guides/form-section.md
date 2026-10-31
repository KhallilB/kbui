# FormSection recipe

Maintained composition recipe, unreleased. For an imported API, use the same-name package component. See the [preservation decision](components-and-recipes.md#maintained-composition-recipes) for ownership and scope.

Group related fields under a heading, with instructions and an optional error message. `FormSection` uses [`Fieldset`](../../packages/react/docs/components/Fieldset.md) for native `<fieldset>`/`<legend>` grouping, plus [`Heading`](../../packages/react/docs/components/Heading.md), [`Text`](../../packages/react/docs/components/Text.md) and [`Grid`](../../packages/react/docs/components/Grid.md).

This page covers a recipe you copy into your app. The package also exports [`FormSection`](../../packages/react/docs/components/FormSection.md) with its own API; use that component when it fits. The recipe below is a separate source module.

## Start with shared grouping

```tsx
import "@kb.ui/react/styles.css";
import { Fieldset, Grid, Heading, Input } from "@kb.ui/react";

export function ContactSection() {
  return (
    <Fieldset
      legend={<Heading level={2} size="md">Contact details</Heading>}
      description="Used for delivery updates. Both fields are required."
    >
      <Grid layout="stack">
        <Input label="Contact name" name="contactName" required />
        <Input label="Contact email" name="contactEmail" type="email" required />
      </Grid>
    </Fieldset>
  );
}
```

For the recipe's props, error messages and spacing, copy [`FormSection.tsx`](../../apps/storybook/recipes/FormSection.tsx) and [`recipes.css`](../../apps/storybook/recipes/recipes.css) into the same folder. Import `@kb.ui/react/styles.css` once in your app. The [Storybook guide](https://kbui.kcb.pro/storybook/?path=/docs/recipes-formsection--docs) shows the source and examples. The recipe composes Fieldset and retains its own Text/Grid content so group errors remain before the fields. Its description/error IDs and native/ref forwarding follow the contract below.

## Contract

| Prop | Use |
| --- | --- |
| `title` | Required group name, shown in the `<legend>` |
| `level` | Heading rank; defaults to `2`, with visual size `md` |
| `description` | Optional instructions for these fields |
| `error` | Optional group error; marks the group invalid and describes the error |
| `children` | Labelled fields, stacked in source order |
| Native `<fieldset>` props | Pass `disabled`, `form`, `name`, `ref`, `className`, `style` and ARIA attributes |

Each group gets unique IDs for its instructions and error. These join any `aria-describedby` IDs you supply. If there is no group error, your `aria-invalid` value is preserved.

The `<legend>` names the group. Each field still needs a useful label, visible requirements and its own error description. See [WAI form grouping guidance](https://www.w3.org/WAI/tutorials/forms/grouping/).

## Compose with forms and Panel

Use one `<form>` around sections that submit together. `FormSection` does not create a form or submit button. Put each action next to the fields it affects.

You can place `FormSection` inside `Panel.Body` when it needs a framed surface. [`Panel`](../../packages/react/docs/components/Panel.md) handles the frame; the `<fieldset>` groups the controls.

Setting `disabled` on the `<fieldset>` disables native controls inside it and leaves their values out of `FormData`. Explain why the group is unavailable. Custom widgets and controls rendered in portals need their own disabled props. A `<fieldset>` has no `readOnly` attribute; use each field's supported API or show the values as text.

## Error recovery

Your app stores values, validates them and handles submission. `FormSection` displays the error you give it; it does not move focus or announce errors automatically.

The [Contact Details story](../../apps/storybook/recipes/FormSection.stories.tsx) shows one approach: reject an incomplete email, keep the entered values, show group and field errors, then focus the email field. A valid submission clears errors and shows success. Errors stay visible until the next submit in this example.

Focus the first invalid field or an error summary. If a server error leaves focus elsewhere, announce it through your app's status message area. Keep a field-specific error attached to that field; a group error should not mark every field invalid. Preserve entered values while people correct or retry a submission.

## Layout and verification

Run the example checks from the repository root:

```sh
bun run --cwd apps/storybook test recipes/FormSection.stories.tsx
bun run --cwd apps/storybook verify:code
```

Descriptions, errors and fields wrap without fixed heights or truncation. Legend spacing uses a bottom margin because native `<legend>` elements sit outside the `<fieldset>`'s grid gap. Adjust recipe classes and spacing tokens as needed.

Stories cover error recovery, separate groups inside a `Panel`, minimal content, disabled controls and `FormData`, and long text in a narrow pane.

Check light and dark at 320, 768 and 1280 CSS pixels. Try keyboard navigation, disabled fields, invalid input and retry. Check right-to-left content, forced colors, larger text and browser zoom. With a screen reader, check the legend, instructions and field errors. Screen-reader speech and browser zoom remain unverified here.

See [`PageHeader`](page-header.md) for the page introduction and [Forms and overlays](forms-and-overlays.md) for form integration.
