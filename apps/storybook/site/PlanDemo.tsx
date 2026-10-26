import { Button, Card, Dialog, Input, Progress, Status } from "@kbui/react";
import { useId, useState } from "react";

const activities = [
  ["coffee", "Coffee and a slow start", "No rush."],
  ["outside", "A little time outside", "Find a patch of sun."],
  ["book", "One more chapter", "The good kind of lost."],
] as const;

function Bloom({ picked }: { picked: number }) {
  return (
    <svg className="day-bloom" data-picked={picked} viewBox="0 0 180 180" aria-hidden="true">
      <g fill={picked === 3 ? "#e5b6c8" : "#f1ce64"} stroke="#313b31" strokeWidth="2">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <circle key={angle} cx="90" cy="48" r="26" transform={`rotate(${angle} 90 90)`} />
        ))}
        <circle cx="90" cy="90" r="31" fill="#fff8e9" />
      </g>
      <circle cx="80" cy="86" r="3" fill="#313b31" />
      <circle cx="100" cy="86" r="3" fill="#313b31" />
      <path
        d={picked === 3 ? "M77 98Q90 116 103 98" : "M80 100Q90 107 100 100"}
        fill="none"
        stroke="#313b31"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlanDemo() {
  const id = useId();
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("A day off");
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  function toggle(activity: string) {
    setPicked((current) =>
      current.includes(activity)
        ? current.filter((value) => value !== activity)
        : [...current, activity],
    );
  }
  return (
    <div className="day-demo" ref={setPortal} data-theme="light">
      <Card className="day-card" aria-labelledby={`${id}-title`}>
        <div className="day-topline">
          <span>Something for yourself</span>
          <Dialog open={editing} onOpenChange={setEditing}>
            <Dialog.Trigger
              render={<Button variant="ghost" size="sm" />}
              aria-label="Rename plan"
              onClick={() => {
                setDraft(name);
                setError("");
              }}
            >
              Rename ↗
            </Dialog.Trigger>
            <Dialog.Content
              title="Name your day"
              description="This is a local demo. Choose any name."
              container={portal}
              className="day-dialog"
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const next = draft.trim();
                  if (!next) {
                    setError("Enter a name.");
                    return;
                  }
                  setName(next);
                  setEditing(false);
                }}
              >
                <Input label="Plan name" value={draft} onValueChange={setDraft} error={error} />
                <Dialog.Actions>
                  <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
                  <Button type="submit">Save name</Button>
                </Dialog.Actions>
              </form>
            </Dialog.Content>
          </Dialog>
        </div>
        <div className="day-heading">
          <div>
            <h2 id={`${id}-title`}>{name}</h2>
            <p>A few things. All optional.</p>
          </div>
          <Bloom picked={picked.length} />
        </div>
        <fieldset className="day-choices">
          <legend>Pick what sounds good</legend>
          {activities.map(([key, label, detail]) => (
            <label key={key} className="day-choice">
              <input
                type="checkbox"
                aria-labelledby={`${id}-${key}-label`}
                aria-describedby={`${id}-${key}-detail`}
                checked={picked.includes(key)}
                onChange={() => toggle(key)}
              />
              <span className="choice-box" aria-hidden="true">
                {picked.includes(key) && (
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M3 8.25 6.25 11.5 13 4.5"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span className="choice-copy">
                <strong id={`${id}-${key}-label`}>{label}</strong>
                <small id={`${id}-${key}-detail`}>{detail}</small>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="day-progress">
          <Progress
            label="Plans picked"
            value={picked.length}
            max={3}
            valueText={`${picked.length} of 3`}
          />
        </div>
        <div className="day-bottom">
          <Status live aria-label="Plan summary" tone={picked.length === 3 ? "success" : "neutral"}>
            <span className="plan-summary-words" key={picked.length}>
              {picked.length === 3
                ? "Day sorted."
                : picked.length === 0
                  ? "Leave a little space."
                  : `${picked.length} picked. Looking good.`}
            </span>
          </Status>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPicked([]);
              setName("A day off");
            }}
          >
            Start over
          </Button>
        </div>
      </Card>
      <p className="demo-note">Go ahead, try it. A small demo made with kbui.</p>
    </div>
  );
}
