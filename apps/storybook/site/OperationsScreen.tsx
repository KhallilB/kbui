import { Button, Callout, Card, Dialog, Input, RadioGroup, Stat, Status } from "@kb.ui/react";
import { useEffect, useRef, useState } from "react";
import { LinkArrow } from "./LinkArrow";

const initialJobs = [
  {
    id: "RUN-1048",
    name: "Database migration",
    environment: "Production",
    owner: "Maya Chen",
    state: "blocked",
    time: "2 min ago",
    description: "Connection timed out while checking the replica.",
  },
  {
    id: "RUN-1047",
    name: "Web application",
    environment: "Production",
    owner: "Alex Rivera",
    state: "running",
    time: "4 min ago",
    description: "Building the application and checking its assets.",
  },
  {
    id: "RUN-1046",
    name: "Search index",
    environment: "Staging",
    owner: "Sam Lee",
    state: "running",
    time: "6 min ago",
    description: "Indexing the latest workspace content.",
  },
  {
    id: "RUN-1045",
    name: "Image pipeline",
    environment: "Production",
    owner: "Maya Chen",
    state: "complete",
    time: "12 min ago",
    description: "All image transformations passed.",
  },
  {
    id: "RUN-1044",
    name: "API health check",
    environment: "Production",
    owner: "Alex Rivera",
    state: "complete",
    time: "18 min ago",
    description: "All endpoints responded successfully.",
  },
  {
    id: "RUN-1043",
    name: "Documentation",
    environment: "Staging",
    owner: "Sam Lee",
    state: "queued",
    time: "21 min ago",
    description: "Waiting for an available worker.",
  },
] as const;
type Job = Omit<(typeof initialJobs)[number], "state" | "description"> & {
  state: "blocked" | "running" | "complete" | "queued";
  description: string;
};
const labels = {
  blocked: "Needs attention",
  running: "Running",
  complete: "Complete",
  queued: "Queued",
} as const;
const tones = {
  blocked: "blocked",
  running: "running",
  complete: "success",
  queued: "neutral",
} as const;

export function useOperations() {
  const [jobs, setJobs] = useState<Job[]>([...initialJobs]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [phase, setPhase] = useState<"ready" | "loading" | "error">("ready");
  const [retrying, setRetrying] = useState<string | null>(null);
  useEffect(() => {
    if (!retrying) return;
    const timer = window.setTimeout(() => {
      setJobs((value) =>
        value.map((job) =>
          job.id === retrying
            ? {
                ...job,
                state: "complete",
                description: "Replica connection restored. All checks passed.",
              }
            : job,
        ),
      );
      setRetrying(null);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [retrying]);
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = window.setTimeout(() => setPhase("ready"), 550);
    return () => window.clearTimeout(timer);
  }, [phase]);
  return {
    jobs,
    query,
    setQuery,
    filter,
    setFilter,
    phase,
    setPhase,
    visible: jobs.filter(
      (job) =>
        (filter === "all" || job.state === filter) &&
        `${job.name} ${job.id} ${job.owner}`.toLowerCase().includes(query.toLowerCase().trim()),
    ),
    clear: () => {
      setFilter("all");
      setQuery("");
    },
    retry: (id: string) => {
      setJobs((value) =>
        value.map((job) =>
          job.id === id
            ? { ...job, state: "running", description: "Checking the replica connection again…" }
            : job,
        ),
      );
      setRetrying(id);
    },
  };
}

export function OperationsScreen({
  model,
  previewName,
}: {
  model: ReturnType<typeof useOperations>;
  previewName: string;
}) {
  const portal = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLButtonElement>(null);
  const filters = useRef<HTMLDivElement>(null);
  const queryControl = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const job = model.jobs.find((item) => item.id === selected);
  const complete = model.jobs.filter((item) => item.state === "complete").length;
  const blocked = model.jobs.filter((item) => item.state === "blocked").length;
  return (
    <div>
      <div className="workspace-heading">
        <div>
          <p className="workspace-eyebrow">Workspace</p>
          <h2>Operations</h2>
          <p>Review recent jobs and retry any failed checks.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => model.setPhase("loading")}
          disabled={model.phase === "loading"}
        >
          Refresh queue
        </Button>
      </div>
      <div className="operations-stats">
        <Card>
          <Stat label="Jobs today" value="6" size="display" />
          <small>Across 2 environments</small>
        </Card>
        <Card>
          <Stat label="Completed" value={String(complete)} size="display" />
        </Card>
        <Card>
          <Stat label="Needs attention" value={String(blocked)} size="display" />
        </Card>
      </div>
      <Card className="queue-card">
        <div className="queue-heading">
          <div>
            <h3>Recent jobs</h3>
          </div>
          <Input
            ref={queryControl}
            label="Search jobs"
            type="search"
            visuallyHidden
            placeholder="Search jobs…"
            value={model.query}
            onValueChange={model.setQuery}
            startContent={
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="m13 13 4 4" />
              </svg>
            }
            endContent={
              model.query ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label="Clear job search"
                  onClick={() => {
                    model.setQuery("");
                    queryControl.current?.focus();
                  }}
                >
                  <span aria-hidden="true">×</span>
                </Button>
              ) : undefined
            }
          />
        </div>
        <RadioGroup
          className="queue-filters"
          ref={filters}
          label="Filter jobs"
          visuallyHidden
          appearance="segmented"
          value={model.filter}
          onValueChange={(value) => {
            if (value === "all" || value === "running" || value === "blocked")
              model.setFilter(value);
          }}
        >
          <RadioGroup.Item value="all">All jobs</RadioGroup.Item>
          <RadioGroup.Item value="running">Running</RadioGroup.Item>
          <RadioGroup.Item value="blocked">Needs attention</RadioGroup.Item>
        </RadioGroup>
        {model.phase === "error" ? (
          <Callout
            tone="danger"
            title="Queue unavailable"
            actions={
              <Button size="sm" variant="secondary" onClick={() => model.setPhase("loading")}>
                Try again
              </Button>
            }
          >
            We couldn’t load the job queue. Try again in a moment.
          </Callout>
        ) : model.phase === "loading" ? (
          <div className="queue-empty" role="status">
            <span className="loading-mark" aria-hidden="true" />
            <h4>Refreshing queue…</h4>
          </div>
        ) : (
          <>
            <p className="queue-count" role="status" aria-label="Queue results">
              {model.visible.length} {model.visible.length === 1 ? "job" : "jobs"}
            </p>
            {model.visible.length ? (
              <section
                className="queue-scroll"
                aria-label={`${previewName} job list`}
                // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users scroll the bounded job table.
                tabIndex={0}
              >
                <table>
                  <caption className="kb-sr-only">Workspace jobs</caption>
                  <thead>
                    <tr>
                      <th scope="col">Job</th>
                      <th scope="col">Status</th>
                      <th scope="col">Owner</th>
                      <th scope="col">Updated</th>
                      <th scope="col">
                        <span className="kb-sr-only">Details</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.visible.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <span>
                            {item.id} · {item.environment}
                          </span>
                        </td>
                        <td>
                          <Status tone={tones[item.state]} appearance="chip">
                            {labels[item.state]}
                          </Status>
                        </td>
                        <td>{item.owner}</td>
                        <td>{item.time}</td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Inspect ${item.name}`}
                            onClick={(event) => {
                              lastTrigger.current = event.currentTarget;
                              setSelected(item.id);
                            }}
                          >
                            Inspect <LinkArrow />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : (
              <div className="queue-empty">
                <h4>{model.query ? "No jobs match your search." : "No jobs need attention."}</h4>
                <p>Try another view or clear your filters.</p>
                <Button variant="secondary" size="sm" onClick={model.clear}>
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
      <div ref={portal} className="workspace-portals" />
      <Dialog
        open={Boolean(job)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <Dialog.Content
          container={portal.current}
          finalFocus={() =>
            lastTrigger.current?.isConnected
              ? lastTrigger.current
              : filters.current?.querySelector<HTMLElement>('[role="radio"]')
          }
          title={job?.name}
          description={job ? `${job.id} · ${job.environment} · ${job.owner}` : ""}
        >
          {job && (
            <>
              <Status live appearance="chip" tone={tones[job.state]}>
                {labels[job.state]}
              </Status>
              <p className="job-description" aria-live="polite">
                {job.description}
              </p>
              <Dialog.Actions>
                <Dialog.Close render={<Button variant="secondary" />}>Close</Dialog.Close>
                {job.state === "blocked" && (
                  <Button onClick={() => model.retry(job.id)}>Retry check</Button>
                )}
              </Dialog.Actions>
            </>
          )}
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
