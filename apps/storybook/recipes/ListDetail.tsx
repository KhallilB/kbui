import {
  Button,
  Container,
  FormSection,
  Grid,
  Heading,
  Inline,
  Input,
  PageHeader,
  Panel,
  Select,
  Split,
  Status,
  type StatusTone,
  Text,
} from "@kb.ui/react";
import { useEffect, useId, useRef, useState } from "react";
import "./list-detail.css";

type RequestStatus = "Open" | "In progress" | "Resolved";
type RequestDraft = { title: string; owner: string; status: RequestStatus };
export type RequestRecord = RequestDraft & {
  id: string;
  summary: string;
  site: string;
  requester: string;
  activity: string;
};

const statusOptions = ["Open", "In progress", "Resolved"].map((value) => ({ value, label: value }));
const statusTones: Record<RequestStatus, StatusTone> = {
  Open: "info",
  "In progress": "running",
  Resolved: "success",
};
const requests: RequestRecord[] = [
  {
    id: "REQ-1042",
    title: "Warehouse access",
    owner: "Maya Chen",
    status: "Open",
    summary:
      "Arrange visitor access for the inventory team before the next stock count. Confirm the access window with the site lead.",
    site: "North depot",
    requester: "Alex Morgan",
    activity: "Alex opened this request after the morning site review.",
  },
  {
    id: "REQ-1043",
    title: "Replace loading dock scanner",
    owner: "Sam Rivera",
    status: "In progress",
    summary:
      "The scanner at loading bay three misses damaged labels. Test the replacement against the existing handheld units before handover.",
    site: "East depot",
    requester: "Jordan Lee",
    activity: "Sam confirmed a replacement scanner is available.",
  },
  {
    id: "REQ-1044",
    title: "Delivery window update",
    owner: "Maya Chen",
    status: "Resolved",
    summary: "Move the supplier delivery to the afternoon window and notify the receiving team.",
    site: "South depot",
    requester: "Casey Park",
    activity: "Maya confirmed the revised delivery window with receiving.",
  },
  {
    id: "REQ-1045",
    title: "Review international shipment documentation and regional handling instructions",
    owner: "Jordan Lee",
    status: "Open",
    summary:
      "Check customs documents and handling instructions for the next international shipment. Keep regional contact information with the record.",
    site: "Central distribution hub",
    requester: "Taylor Brooks",
    activity: "Taylor attached the regional handover notes for review.",
  },
];

function RequestEditor({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onSave: (draft: RequestDraft) => void;
  onCancel: () => void;
}) {
  const title = useRef<HTMLInputElement>(null);
  const owner = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState({ title: "", owner: "" });
  useEffect(() => {
    title.current?.focus();
  }, []);
  return (
    <form
      className="request-flow-editor"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const next = {
          title: draft.title.trim() ? "" : "Enter a request title.",
          owner: draft.owner.trim() ? "" : "Enter an owner.",
        };
        setErrors(next);
        if (next.title || next.owner) {
          (next.title ? title : owner).current?.focus();
          return;
        }
        onSave({ ...draft, title: draft.title.trim(), owner: draft.owner.trim() });
      }}
    >
      <Grid layout="stack">
        <FormSection
          title="Edit request"
          headingLevel={3}
          description="Title and owner are required. Changes stay in this browser session."
          error={
            errors.title || errors.owner ? "Review the marked fields before saving." : undefined
          }
        >
          <Input
            ref={title}
            label="Request title"
            name="title"
            required
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            {...(errors.title ? { error: errors.title } : {})}
          />
          <Input
            ref={owner}
            label="Owner"
            name="owner"
            required
            value={draft.owner}
            onChange={(event) => onChange({ ...draft, owner: event.target.value })}
            {...(errors.owner ? { error: errors.owner } : {})}
          />
          <Select
            label="Status"
            value={draft.status}
            options={statusOptions}
            onValueChange={(status) => {
              if (status === "Open" || status === "In progress" || status === "Resolved")
                onChange({ ...draft, status });
            }}
          />
        </FormSection>
        <Inline gap="sm" className="request-flow-form-actions">
          <Button type="submit">Save changes</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel editing
          </Button>
        </Inline>
      </Grid>
    </form>
  );
}

/** Application-owned queue; copy with its local recipe dependencies. */
export function ListDetail({
  initialRequests = requests,
  initialRequestId = null,
}: {
  initialRequests?: RequestRecord[];
  initialRequestId?: string | null;
}) {
  const [records, setRecords] = useState(initialRequests);
  const [selectedId, setSelectedId] = useState(
    () => new URL(window.location.href).searchParams.get("request") ?? initialRequestId,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string | null>("all");
  const [drafts, setDrafts] = useState<Record<string, RequestDraft | undefined>>({});
  const [showContext, setShowContext] = useState(true);
  const [message, setMessage] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const edit = useRef<HTMLButtonElement>(null);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const lastSelected = useRef(selectedId);
  const focusTarget = useRef<"heading" | "list" | "edit" | null>(selectedId ? "heading" : null);
  const id = useId();
  const selected = records.find((record) => record.id === selectedId);
  const draft = selected ? drafts[selected.id] : undefined;
  const filtered = records.filter(
    (record) =>
      (filter === "all" || record.status === filter) &&
      `${record.id} ${record.title} ${record.owner} ${record.site}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    const onPopState = () => {
      const next = new URL(window.location.href).searchParams.get("request");
      focusTarget.current = next ? "heading" : "list";
      setSelectedId(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (focusTarget.current === "heading") heading.current?.focus();
    if (focusTarget.current === "edit") edit.current?.focus();
    if (focusTarget.current === "list")
      (rows.current.get(lastSelected.current ?? "") ?? search.current)?.focus();
    focusTarget.current = null;
  });

  function navigate(next: string | null) {
    if (selectedId) lastSelected.current = selectedId;
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("request", next);
    else url.searchParams.delete("request");
    window.history.pushState(window.history.state, "", url);
    focusTarget.current = next ? "heading" : "list";
    setSelectedId(next);
  }

  function closeEditor() {
    if (!selected) return;
    setDrafts((current) => ({ ...current, [selected.id]: undefined }));
    focusTarget.current = "edit";
  }

  return (
    <Container as="main" size="full" gutter={false} className="request-flow">
      <PageHeader title="Requests" description="A clear next step for every site request.">
        <Text size="sm" tone="muted">
          Operations desk · Local session demo
        </Text>
      </PageHeader>
      <Text role="status" size="sm" className="request-flow-notice">
        {message || "Edits and drafts last until you reload this page."}
      </Text>
      <div className="request-flow-layout" data-selected={selectedId ? "true" : "false"}>
        <Panel className="request-flow-list" aria-labelledby={`${id}-queue`}>
          <Panel.Header>
            <Heading level={2} size="md" id={`${id}-queue`}>
              Request queue
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <Grid layout="stack">
              <Input
                ref={search}
                label="Search requests"
                type="search"
                value={query}
                placeholder="Title, ID, owner or site"
                onChange={(event) => setQuery(event.target.value)}
              />
              <Select
                label="Filter by status"
                value={filter}
                onValueChange={(value) => setFilter(value ?? "all")}
                options={[{ value: "all", label: "All statuses" }, ...statusOptions]}
              />
              <Text size="sm" tone="muted" aria-live="polite">
                {filtered.length} of {records.length} requests
              </Text>
              {filtered.length ? (
                <ul className="request-flow-items" aria-label="Requests">
                  {filtered.map((record) => (
                    <li key={record.id}>
                      <Button
                        variant="ghost"
                        className="request-flow-row"
                        aria-current={selectedId === record.id ? "true" : undefined}
                        ref={(element) => {
                          if (element) rows.current.set(record.id, element);
                          else rows.current.delete(record.id);
                        }}
                        onClick={() => navigate(record.id)}
                      >
                        <Text as="span" size="sm" tone="muted">
                          {record.id}
                        </Text>
                        <Text as="span" className="request-flow-row-title">
                          {record.title}
                        </Text>
                        <Status tone={statusTones[record.status]} compact>
                          {record.status}
                        </Status>
                        <Text as="span" size="sm" tone="muted">
                          {record.owner}
                          {drafts[record.id] ? " · Unsaved draft" : ""}
                        </Text>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="request-flow-empty">
                  <Heading level={3} size="md">
                    {records.length ? "No matching requests" : "No requests yet"}
                  </Heading>
                  <Text tone="muted">
                    {records.length
                      ? "Try another title, owner or status."
                      : "New site requests will appear here."}
                  </Text>
                </div>
              )}
              {(query || filter !== "all") && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                    search.current?.focus();
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Grid>
          </Panel.Body>
        </Panel>
        <div className="request-flow-workspace">
          {selectedId ? (
            <Grid layout="stack">
              <Inline justify="between">
                <Button variant="ghost" onClick={() => navigate(null)}>
                  Back to requests
                </Button>
                {selected && (
                  <Button
                    variant="secondary"
                    aria-expanded={showContext}
                    aria-controls={`${id}-context`}
                    onClick={() => setShowContext((current) => !current)}
                  >
                    {showContext ? "Hide context" : "Show context"}
                  </Button>
                )}
              </Inline>
              {selected ? (
                <Split ratio="wide-start" collapse="md" align="start" gap="lg">
                  <Panel aria-labelledby={`${id}-detail`}>
                    <Panel.Header>
                      <Grid layout="stack" className="request-flow-detail-heading">
                        <Inline justify="between">
                          <Text size="sm" tone="muted">
                            {selected.id}
                          </Text>
                          <Status tone={statusTones[selected.status]} appearance="chip">
                            {selected.status}
                          </Status>
                        </Inline>
                        <Inline justify="between" align="start" gap="sm">
                          <Heading
                            className="request-flow-title"
                            ref={heading}
                            tabIndex={-1}
                            level={2}
                            id={`${id}-detail`}
                          >
                            {selected.title}
                          </Heading>
                          {!draft && (
                            <Button
                              ref={edit}
                              variant="secondary"
                              onClick={() =>
                                setDrafts((current) => ({
                                  ...current,
                                  [selected.id]: {
                                    title: selected.title,
                                    owner: selected.owner,
                                    status: selected.status,
                                  },
                                }))
                              }
                            >
                              Edit request
                            </Button>
                          )}
                        </Inline>
                      </Grid>
                    </Panel.Header>
                    <Panel.Body>
                      {draft ? (
                        <RequestEditor
                          key={selected.id}
                          draft={draft}
                          onChange={(next) =>
                            setDrafts((current) => ({ ...current, [selected.id]: next }))
                          }
                          onCancel={() => {
                            closeEditor();
                            setMessage(`${selected.id} draft discarded.`);
                          }}
                          onSave={(next) => {
                            setRecords((current) =>
                              current.map((record) =>
                                record.id === selected.id ? { ...record, ...next } : record,
                              ),
                            );
                            closeEditor();
                            setMessage(`${selected.id} saved for this session.`);
                          }}
                        />
                      ) : (
                        <Grid layout="stack" className="request-flow-section">
                          <div className="request-flow-copy">
                            <Heading level={3} size="md">
                              What needs to happen
                            </Heading>
                            <Text>{selected.summary}</Text>
                          </div>
                          <dl className="request-flow-facts">
                            <div>
                              <dt>Owner</dt>
                              <dd>{selected.owner}</dd>
                            </div>
                            <div>
                              <dt>Site</dt>
                              <dd>{selected.site}</dd>
                            </div>
                          </dl>
                        </Grid>
                      )}
                    </Panel.Body>
                  </Panel>
                  {showContext && (
                    <Container
                      as="aside"
                      size="full"
                      gutter={false}
                      aria-label="Request context"
                      id={`${id}-context`}
                    >
                      <Panel tone="quiet" aria-labelledby={`${id}-context-title`}>
                        <Panel.Header>
                          <Heading level={2} size="md" id={`${id}-context-title`}>
                            Request context
                          </Heading>
                        </Panel.Header>
                        <Panel.Body>
                          <Grid layout="stack" className="request-flow-section">
                            <dl className="request-flow-facts">
                              <div>
                                <dt>Requested by</dt>
                                <dd>{selected.requester}</dd>
                              </div>
                              <div>
                                <dt>Site</dt>
                                <dd>{selected.site}</dd>
                              </div>
                              <div>
                                <dt>Assigned to</dt>
                                <dd>{selected.owner}</dd>
                              </div>
                            </dl>
                            <div className="request-flow-copy">
                              <Heading level={3} size="md">
                                Latest activity
                              </Heading>
                              <Text size="sm" tone="muted">
                                {selected.activity}
                              </Text>
                            </div>
                            <Text size="sm">Saved status: {selected.status}</Text>
                          </Grid>
                        </Panel.Body>
                      </Panel>
                    </Container>
                  )}
                </Split>
              ) : (
                <Panel>
                  <Panel.Body>
                    <Heading ref={heading} tabIndex={-1} level={2}>
                      Request unavailable
                    </Heading>
                    <Text>
                      This request is missing from the current queue. Return to requests to choose
                      another.
                    </Text>
                  </Panel.Body>
                </Panel>
              )}
            </Grid>
          ) : (
            <Panel tone="sunken" className="request-flow-empty">
              <Panel.Body>
                <Heading level={2}>Choose a request</Heading>
                <Text tone="muted">
                  Inspect the details, check site context and make an update.
                </Text>
              </Panel.Body>
            </Panel>
          )}
        </div>
      </div>
    </Container>
  );
}
