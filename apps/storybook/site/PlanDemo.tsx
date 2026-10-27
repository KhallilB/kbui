import { Button, Card, Checkbox, Dialog, Input, Progress, Status } from "@kbui/react";
import { useCallback, useId, useRef, useState } from "react";
import { LinkArrow } from "./LinkArrow";

const defaultActivities = [
  ["coffee", "Coffee and a slow start", "No rush."],
  ["outside", "A little time outside", "Find a patch of sun."],
  ["book", "One more chapter", "The good kind of lost."],
] as const;

type Activity = readonly [string, string, string];

function Bloom({ complete }: { complete: boolean }) {
  return (
    <svg
      className="day-bloom"
      data-complete={complete || undefined}
      viewBox="0 0 180 180"
      aria-hidden="true"
    >
      <g fill={complete ? "#e5b6c8" : "#f1ce64"} stroke="#313b31" strokeWidth="2">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <circle key={angle} cx="90" cy="48" r="26" transform={`rotate(${angle} 90 90)`} />
        ))}
        <circle cx="90" cy="90" r="31" fill="#fff8e9" />
      </g>
      <circle cx="80" cy="86" r="3" fill="#313b31" />
      <circle cx="100" cy="86" r="3" fill="#313b31" />
      <path
        d={complete ? "M77 98Q90 116 103 98" : "M80 100Q90 107 100 100"}
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
  const [activities, setActivities] = useState<readonly Activity[]>(defaultActivities);
  const activityNumber = useRef(0);
  const [adding, setAdding] = useState(false);
  const [activityDraft, setActivityDraft] = useState("");
  const [activityError, setActivityError] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("A day off");
  const [draft, setDraft] = useState(name);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const attachPortal = useCallback((element: HTMLDivElement | null) => {
    setPortal(element?.closest<HTMLDivElement>(".kbui-site") ?? element);
  }, []);
  function toggle(activity: string) {
    setPicked((current) =>
      current.includes(activity)
        ? current.filter((value) => value !== activity)
        : [...current, activity],
    );
  }
  return (
    <div className="day-demo" ref={attachPortal} data-theme="light">
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
              Rename <LinkArrow />
            </Dialog.Trigger>
            <Dialog.Content
              title="Name your day"
              description="This is a local demo. Choose any name."
              container={portal}
              className="day-dialog"
              data-theme="light"
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
          <Bloom complete={picked.length === activities.length} />
        </div>
        <div className="day-choice-tools">
          <span aria-hidden="true">Pick what sounds good</span>
          <Dialog open={adding} onOpenChange={setAdding}>
            <Dialog.Trigger
              render={<Button variant="ghost" size="sm" />}
              aria-label="Add an activity"
              onClick={() => {
                setActivityDraft("");
                setActivityError("");
              }}
            >
              <span aria-hidden="true">＋</span> Add
            </Dialog.Trigger>
            <Dialog.Content
              title="Make a little room"
              description="One thing you would like to do. This demo stays in your browser."
              container={portal}
              className="day-dialog"
              data-theme="light"
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const label = activityDraft.trim();
                  if (!label) {
                    setActivityError("Enter an activity.");
                    return;
                  }
                  const key = `personal-${activityNumber.current++}`;
                  setActivities((current) => [...current, [key, label, "Added by you."]]);
                  setPicked((current) => [...current, key]);
                  setAdding(false);
                }}
              >
                <Input
                  label="Activity"
                  placeholder="Visit the bookshop"
                  value={activityDraft}
                  onValueChange={setActivityDraft}
                  error={activityError}
                />
                <Dialog.Actions>
                  <Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close>
                  <Button type="submit">Add to my day</Button>
                </Dialog.Actions>
              </form>
            </Dialog.Content>
          </Dialog>
        </div>
        <fieldset className="day-choices">
          <legend className="kb-sr-only">Pick what sounds good</legend>
          {activities.map(([key, label, detail]) => (
            <Checkbox
              key={key}
              className="day-choice"
              label={label}
              description={detail}
              checked={picked.includes(key)}
              onCheckedChange={() => toggle(key)}
            />
          ))}
        </fieldset>
        <div className="day-progress">
          <Progress
            label="Plans picked"
            value={picked.length}
            max={activities.length}
            valueText={`${picked.length} of ${activities.length}`}
          />
        </div>
        <div className="day-bottom">
          <Status
            live
            aria-label="Plan summary"
            tone={picked.length === activities.length ? "success" : "neutral"}
          >
            <span className="plan-summary-words" key={picked.length}>
              {picked.length === activities.length
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
              setActivities(defaultActivities);
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
