// x-release-please-start-version
// kbui recipe FormSection · from kbui 0.11.0 · https://kbui.kcb.pro/recipes/?recipe=formsection
// x-release-please-end
import { Fieldset, Grid, Heading, type HeadingLevel, Text } from "@kb.ui/react";
import { type ComponentProps, type ReactNode, useId } from "react";
import "./recipes.css";

export type FormSectionProps = Omit<ComponentProps<"fieldset">, "title"> & {
  /** Visible group name, rendered inside native legend. */
  title: string;
  /** Heading rank follows containing page. */
  level?: HeadingLevel | undefined;
  /** Instructions apply to this group of fields. */
  description?: ReactNode;
  /** Section error; validation and focus recovery remain caller-owned. */
  error?: string | undefined;
};

export function FormSection({
  title,
  level = 2,
  description,
  error,
  children,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: FormSectionProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const descriptions =
    [description ? descriptionId : undefined, error ? errorId : undefined, describedBy]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <Fieldset
      {...props}
      className={["form-section", className].filter(Boolean).join(" ")}
      aria-describedby={descriptions}
      aria-invalid={error ? true : ariaInvalid}
      legend={
        <Heading level={level} size="md">
          {title}
        </Heading>
      }
      classNames={{ legend: "form-section-legend" }}
    >
      {description ? (
        <Text id={descriptionId} className="form-section-description" tone="muted">
          {description}
        </Text>
      ) : null}
      <Grid layout="stack">
        {error ? (
          <Text id={errorId} className="form-section-error">
            {error}
          </Text>
        ) : null}
        {children}
      </Grid>
    </Fieldset>
  );
}
