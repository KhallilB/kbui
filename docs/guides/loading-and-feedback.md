# Loading and feedback

Asynchronous interfaces move through four states: **waiting**, **missing content**, **completion**, and **recoverable failure**. Choose the feedback primitive that matches both the scope of the state and what the person can do next.

## Choosing the right feedback surface

| State | Primary component | When to use | Accessibility contract |
|---|---|---|---|
| Short indeterminate wait or busy control | [Spinner](../../packages/react/docs/components/Spinner.md) | Button submission, inline refresh, or short wait with unknown duration | Standalone `Spinner` exposes `role="status"` and an accessible `label`; set `decorative` inside a `Button` whose text already changes (for example, `"Saving…"`) |
| Known completion ratio | [Progress](../../packages/react/docs/components/Progress.md) | File upload, multi-step migration, or batch export with a numeric percentage | Native or ARIA progressbar with a visible label and value |
| Incoming layout placeholder | [Skeleton](../../packages/react/docs/components/Skeleton.md) | Initial load of cards, lists, or detail views whose geometry is known ahead of time | `Skeleton` is `aria-hidden="true"`; mark the owning container `aria-busy="true"` and pair with a `Status` or `Spinner` announcement |
| Empty collection or zero-match filter | [EmptyState](../../packages/react/docs/components/EmptyState.md) | First-run onboarding, empty resource lists, or search/filter queries with zero results | Semantic heading (`h2`–`h4`) plus primary recovery action; set `live` when revealed dynamically after filtering |
| Transient completion or background failure | [Toast](../../packages/react/docs/components/Toast.md) | Background save confirmation, async job completion, or non-blocking failure with retry/undo | Polite `status` (or `alert` for `danger`), keyboard-reachable viewport (`F6`), and pause-on-hover/focus |
| Persistent inline warning or blocker | [Callout](../../packages/react/docs/components/Callout.md) / [ErrorSummary](../../packages/react/docs/components/ErrorSummary.md) | Section-level warnings, degraded dependencies, or form validation errors that require editing fields | Keep persistent remediation in document flow; use `ErrorSummary` to link directly to invalid form controls |

## Asynchronous submission and retry recipe

During an asynchronous form submission:

1. Keep the user's input mounted and visible so a transient network failure never discards their work.
2. Disable the submit button while the request is in flight, swap its label to describe the active work (`"Saving policy…"`), and render a `<Spinner decorative size="sm" tone="current" />` inside the button.
3. Use `Toast.Provider` and `useToastManager()` to announce completion (`type: "success"`) or surface a non-blocking failure with an inline retry action (`type: "error"` with `actionProps`), paired with an inline `Callout` when the user needs persistent remediation context.

```tsx
import "@kb.ui/react/styles.css";
import { type FormEvent, useState } from "react";
import {
  Button,
  Callout,
  Fieldset,
  FormActions,
  Input,
  Spinner,
  Toast,
  useToastManager,
} from "@kb.ui/react";

function WebhookPolicyForm({
  onSubmitPolicy,
}: {
  onSubmitPolicy: (endpoint: string) => Promise<void>;
}) {
  const toastManager = useToastManager();
  const [endpoint, setEndpoint] = useState("https://hooks.example.com/releases");
  const [submitting, setSubmitting] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setFailureMessage(null);

    try {
      await onSubmitPolicy(endpoint);
      toastManager.add({
        type: "success",
        title: "Webhook policy saved",
        description: `Delivering release events to ${endpoint}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The webhook gateway did not respond in time.";
      setFailureMessage(message);
      toastManager.add({
        type: "error",
        title: "Could not save webhook policy",
        description: message,
        actionProps: {
          children: "Retry save",
          onClick: () => {
            void submit();
          },
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting}>
      <Fieldset
        legend="Release webhook"
        description="Events are signed with your workspace key before delivery."
      >
        {failureMessage ? (
          <Callout
            tone="danger"
            title="Delivery verification failed"
            actions={
              <Button size="sm" variant="secondary" disabled={submitting} onClick={() => void submit()}>
                Retry verification
              </Button>
            }
            live
          >
            {failureMessage}
          </Callout>
        ) : null}
        <Input
          label="Endpoint URL"
          value={endpoint}
          disabled={submitting}
          onChange={(event) => setEndpoint(event.target.value)}
        />
      </Fieldset>
      <FormActions>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Spinner decorative size="sm" tone="current" /> : null}
          {submitting ? "Saving policy…" : "Save policy"}
        </Button>
      </FormActions>
    </form>
  );
}

export function AsyncSubmissionRecipe() {
  return (
    <Toast.Provider>
      <WebhookPolicyForm onSubmitPolicy={async () => {}} />
      <Toast.Viewport aria-label="Notifications" />
    </Toast.Provider>
  );
}
```

## Waiting, missing content, and recoverable section failures

When a data region loads asynchronously, preserve its container dimensions with `Skeleton` while `loading` is active, and transition to either the resolved data, a neutral/subtle `EmptyState` when the query returns zero items, or a `danger` `EmptyState` when the upstream request fails and can be retried.

```tsx
import "@kb.ui/react/styles.css";
import { useState } from "react";
import { Button, Card, EmptyState, Inline, Skeleton, Status, Text } from "@kb.ui/react";

type ViewState = "loading" | "empty" | "error" | "ready";

export function SectionFeedbackRecipe() {
  const [state, setState] = useState<ViewState>("loading");

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <Inline justify="between" align="center">
        <Status
          tone={
            state === "loading"
              ? "running"
              : state === "error"
                ? "blocked"
                : state === "ready"
                  ? "success"
                  : "neutral"
          }
          appearance="chip"
          live
        >
          {state === "loading"
            ? "Loading deployments…"
            : state === "empty"
              ? "0 deployments"
              : state === "error"
                ? "Connection failed"
                : "2 active deployments"}
        </Status>
        <Inline gap="sm">
          <Button size="sm" variant="secondary" onClick={() => setState("loading")}>
            Loading
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setState("empty")}>
            Empty
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setState("error")}>
            Failure
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setState("ready")}>
            Ready
          </Button>
        </Inline>
      </Inline>

      {state === "loading" ? (
        <Card aria-busy="true" aria-label="Loading deployments">
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <Skeleton variant="text" size="lg" width="40%" />
            <Skeleton variant="rect" height="4rem" />
            <Skeleton variant="text" lines={2} size="sm" />
          </div>
        </Card>
      ) : null}

      {state === "empty" ? (
        <EmptyState
          variant="subtle"
          eyebrow="Environment: staging"
          title="No deployments match this environment"
          description="Promote a build from preview or clear the environment filter to inspect earlier releases."
          actions={
            <>
              <Button size="sm" onClick={() => setState("ready")}>
                Show all environments
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setState("loading")}>
                Refresh
              </Button>
            </>
          }
          live
        />
      ) : null}

      {state === "error" ? (
        <EmptyState
          tone="danger"
          eyebrow="Request timed out"
          title="Unable to load staging deployments"
          description="The deployment coordinator did not respond within 10 seconds."
          actions={
            <Button size="sm" onClick={() => setState("loading")}>
              Retry request
            </Button>
          }
          footer="Error code: COORDINATOR_TIMEOUT"
          live
        />
      ) : null}

      {state === "ready" ? (
        <Card>
          <Text>Production and staging deployments are healthy and serving traffic.</Text>
        </Card>
      ) : null}
    </div>
  );
}
```

## Plain HTML and CSS

Apps using `@kb.ui/css` directly can render the same anatomy classes and `data-*` state attributes:

```html
<!-- Busy button with decorative spinner -->
<button class="kb-button" data-variant="primary" data-size="md" disabled>
  <span class="kb-spinner" data-size="sm" data-tone="current" aria-hidden="true">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="kb-spinner-icon">
      <circle class="kb-spinner-track" cx="12" cy="12" r="9.5"></circle>
      <path class="kb-spinner-arc" d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5"></path>
    </svg>
  </span>
  Saving changes…
</button>

<!-- Skeleton placeholder inside an aria-busy container -->
<div class="kb-card" aria-busy="true" aria-label="Loading summary">
  <div class="kb-skeleton" data-variant="text" data-size="md" data-animated="" aria-hidden="true">
    <span class="kb-skeleton-line"></span>
    <span class="kb-skeleton-line"></span>
  </div>
</div>

<!-- EmptyState with recovery action -->
<div class="kb-emptystate" data-size="md" data-variant="surface" data-tone="neutral">
  <div class="kb-emptystate-header">
    <p class="kb-emptystate-eyebrow">Pipelines</p>
    <h3 class="kb-emptystate-title">No release pipelines configured</h3>
    <p class="kb-emptystate-description">Create a pipeline to validate builds and publish packages.</p>
  </div>
  <div class="kb-emptystate-actions">
    <button type="button" class="kb-button" data-variant="primary" data-size="sm">Create pipeline</button>
  </div>
</div>
```
