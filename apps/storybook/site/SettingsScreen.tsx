import { Button, Callout, Card, Checkbox, Input, Status } from "@kbui/react";
import { useEffect, useId, useRef, useState } from "react";
import { ControlSelect } from "./ControlSelect";

const initial = {
  name: "Northstar",
  email: "hello@northstar.example",
  timezone: "America/Los_Angeles",
  digest: "Weekly",
  failures: true,
  releases: true,
  news: false,
};
type Draft = typeof initial;
type SaveState = "idle" | "saving" | "saved" | "error";

export function useSettings(failNext: boolean, consumeFailure: () => void) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [phase, setPhase] = useState<SaveState>("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const pending = useRef<{ draft: Draft; fail: boolean } | null>(null);
  useEffect(() => {
    if (phase !== "saving") return;
    const timer = window.setTimeout(() => {
      const result = pending.current;
      if (!result) return;
      if (!result.fail) {
        setSaved(result.draft);
        setDraft(result.draft);
      }
      setPhase(result.fail ? "error" : "saved");
    }, 550);
    return () => window.clearTimeout(timer);
  }, [phase]);
  const update = (patch: Partial<Draft>) => {
    setDraft((value) => ({ ...value, ...patch }));
    setPhase("idle");
    setErrors({});
  };
  return {
    draft,
    phase,
    errors,
    update,
    dirty: JSON.stringify(draft) !== JSON.stringify(saved),
    discard: () => {
      setDraft(saved);
      setErrors({});
      setPhase("idle");
    },
    save: (form: HTMLFormElement) => {
      const email = form.elements.namedItem("email");
      const next = {
        ...(!draft.name.trim() ? { name: "Enter a workspace name." } : {}),
        ...(!(email instanceof HTMLInputElement) || !email.validity.valid
          ? { email: "Enter a valid email address." }
          : {}),
      };
      setErrors(next);
      if (next.name || next.email) {
        (form.elements.namedItem(next.name ? "name" : "email") as HTMLElement).focus();
        return;
      }
      pending.current = { draft: { ...draft, name: draft.name.trim() }, fail: failNext };
      consumeFailure();
      setPhase("saving");
    },
  };
}

export function SettingsScreen({
  model,
  previewName,
}: {
  model: ReturnType<typeof useSettings>;
  previewName: string;
}) {
  const id = useId();
  const { draft, update, errors, phase } = model;
  return (
    <form
      noValidate
      className="workspace-form"
      onSubmit={(event) => {
        event.preventDefault();
        model.save(event.currentTarget);
      }}
      aria-label={`${previewName} workspace settings`}
    >
      <div className="workspace-heading">
        <div>
          <p className="workspace-eyebrow">Workspace / Settings</p>
          <h2>Make room for good work.</h2>
          <p>Your workspace, your working rhythm.</p>
        </div>
        <Status tone="success" appearance="chip">
          Active workspace
        </Status>
      </div>
      <fieldset disabled={phase === "saving"} className="settings-fields">
        <legend className="kb-sr-only">Workspace preferences</legend>
        <Card className="settings-card">
          <div className="section-intro">
            <span className="section-number">01</span>
            <div>
              <h3>Workspace details</h3>
              <p>A familiar name and a reliable point of contact.</p>
            </div>
          </div>
          <div className="settings-grid">
            <Input
              label="Workspace name"
              name="name"
              value={draft.name}
              required
              onChange={(event) => update({ name: event.target.value })}
              {...(errors.name ? { error: errors.name } : {})}
            />
            <Input
              label="Contact email"
              name="email"
              type="email"
              required
              value={draft.email}
              onChange={(event) => update({ email: event.target.value })}
              {...(errors.email ? { error: errors.email } : {})}
            />
            <ControlSelect
              id={`${id}-zone`}
              label="Timezone"
              value={draft.timezone}
              disabled={phase === "saving"}
              options={[
                { value: "America/Los_Angeles", label: "Los Angeles (Pacific)" },
                { value: "Europe/London", label: "London (GMT / BST)" },
                { value: "Asia/Tokyo", label: "Tokyo (Japan)" },
              ]}
              onChange={(timezone) => update({ timezone })}
            />
            <ControlSelect
              id={`${id}-digest`}
              label="Activity digest"
              value={draft.digest}
              disabled={phase === "saving"}
              options={["Weekly", "Daily", "Never"].map((value) => ({ value, label: value }))}
              onChange={(digest) => update({ digest })}
            />
          </div>
        </Card>
        <Card className="settings-card">
          <div className="section-intro">
            <span className="section-number">02</span>
            <div>
              <h3>Keep the right things close.</h3>
              <p>Choose which updates reach your inbox.</p>
            </div>
          </div>
          {(
            [
              ["failures", "Failed checks", "Know when something needs a second look."],
              ["releases", "Release updates", "A note when your team ships something new."],
              ["news", "Product news", "Occasional updates from the workspace."],
            ] as const
          ).map(([key, title, description]) => (
            <div className="preference-row" key={key}>
              <Checkbox
                label={title}
                description={description}
                checked={draft[key]}
                disabled={phase === "saving"}
                onCheckedChange={(checked) => update({ [key]: checked })}
              />
            </div>
          ))}
        </Card>
        <Card className="workspace-context">
          <div className="context-icon" aria-hidden="true">
            N
          </div>
          <div>
            <h3>Northstar team</h3>
            <p>8 members · Workspace owner</p>
          </div>
          <Status tone="neutral">Private</Status>
        </Card>
      </fieldset>
      <div aria-live="polite" aria-atomic="true">
        {phase === "saved" && (
          <Callout tone="success" title="All set.">
            Changes saved for this session.
          </Callout>
        )}
        {phase === "error" && (
          <Callout tone="danger" title="Let’s try that again.">
            Could not save changes. Your draft is still here.
          </Callout>
        )}
      </div>
      <div className="form-actions">
        <span>
          {phase === "saving"
            ? "Saving your preferences…"
            : model.dirty
              ? "You have unsaved changes."
              : "Everything is up to date."}
        </span>
        <div>
          <Button
            variant="secondary"
            disabled={!model.dirty || phase === "saving"}
            onClick={model.discard}
          >
            Discard changes
          </Button>
          <Button type="submit" disabled={phase === "saving"}>
            {phase === "saving" ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
