# FormSection recipe

Group related fields with a visible heading, explanation and optional section error. Use native fieldset and legend for grouping, [Heading](../../packages/react/docs/components/Heading.md) and [Text](../../packages/react/docs/components/Text.md) for hierarchy, [Grid](../../packages/react/docs/components/Grid.md) for rhythm, and [Panel](../../packages/react/docs/components/Panel.md) for an optional surface. This application-owned recipe demonstrates native grouping. The package also exports [FormSection](../../packages/react/docs/components/FormSection.md) with its own supported API; use that component when it fits. This page documents the separate source module you copy below.

## Start with native grouping

```tsx
import "@kb.ui/react/styles.css";
import { Grid, Heading, Input, Text } from "@kb.ui/react";
import { useId } from "react";

export function ContactSection() {
  const helpId = useId();
  return (
    <fieldset aria-describedby={helpId} style={{ minInlineSize: 0 }}>
      <legend><Heading level={2} size="md">Contact details</Heading></legend>
      <Text id={helpId} tone="muted">Used for delivery updates. Both fields are required.</Text>
      <Grid layout="stack">
        <Input label="Contact name" name="contactName" required />
        <Input label="Contact email" name="contactEmail" type="email" required />
      </Grid>
    </fieldset>
  );
}
```

For reusable slots, instance-specific IDs, section errors and maintained spacing, copy [FormSection.tsx](../../apps/storybook/recipes/FormSection.tsx) and [recipes.css](../../apps/storybook/recipes/recipes.css). The [Storybook guide](https://kbui.kcb.pro/storybook/?path=/docs/recipes-formsection--docs) shows their exact source and runnable states. The recipe uses native fieldset and legend markup directly.

## Contract

| Input | Responsibility |
| --- | --- |
| `title` | Required visible legend and heading |
| `level` | Heading rank; defaults to 2, visual size remains md |
| `description` | Optional instructions for the group; phrasing content |
| `error` | Optional section error text; adds group `aria-invalid` and an error description |
| `children` | Labelled fields; Grid stacks them in source order |
| Native fieldset props | `disabled`, `form`, `name`, ref, className, style and ARIA attributes pass through |

Description and error IDs are unique per instance. Their IDs join any caller `aria-describedby` references. Omitting them leaves no dangling references. Explicit caller `aria-invalid` is retained when no error exists. The recipe owns no field values, validation policy, submission or focus behavior.

Native legend names the group, following [WAI grouping guidance](https://www.w3.org/WAI/tutorials/forms/grouping/). Keep labels useful even when read without the legend. Mark requirements visibly. Section errors do not replace field-specific helper/error relationships.

## Compose with forms and Panel

Place FormSection inside Panel.Body when the group needs a surface. Let Panel own framing and the fieldset own control grouping. Keep a shared form outside all sections that submit together; the recipe creates no form and avoids nested forms. Keep submit/reset actions at the boundary whose values they affect.

Native fieldset disabled behavior disables descendant native form controls and excludes them from FormData. Explain why fields are unavailable. Custom composite widgets, body portals and non-native controls need their own disabled API. Fieldset has no readOnly attribute; choose supported field APIs or a text review instead.

## Error recovery

The [Contact Details story](../../apps/storybook/recipes/FormSection.stories.tsx) owns submission: native constraints reject an incomplete email, values remain, the section and email get errors, and focus moves to that email. A corrected submission clears errors and reports success. Errors remain until the next submit in this example.

In a real form, map errors at the layer that knows the rejected value. Focus the first invalid field or a suitable error summary. If focus stays elsewhere after a server failure, provide deliberate live feedback. The recipe adds no automatic alert and never marks every field invalid from a section-level problem. Keep pending/retry behavior and accepted-value preservation in the application.

## Layout and verification

Legend spacing uses a block-end margin because native rendered legends do not participate in a fieldset's grid gap. Descriptions, errors, headings and fields wrap; no fixed heights or truncation hide essential text. Application CSS can adjust recipe classes and existing tokens while preserving grouping and readable order.

Stories cover recovery, two independently described groups inside Panel, minimal content, disabled native controls/FormData and long content with a section error in a narrow pane. Automated checks cover these cases with accessibility scans.

Check Light and Dark at 320, 768 and 1280 CSS pixels. Use keyboard and pointer to verify control order, disabled behavior, rejection, retained values and retry. Check RTL, forced colors, text enlargement and browser zoom. With a screen reader, enter each group and inspect legend, instructions, field errors and recovery feedback. Human assistive-technology speech and browser-chrome zoom remain unverified here.

See [PageHeader](page-header.md) for the page-level introduction and [forms and overlays](forms-and-overlays.md) for shared form integration.
