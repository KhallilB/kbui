// kbui recipe ListDetail · needs @kb.ui/react ≥ 0.12.0 · https://kbui.kcb.pro/recipes/?recipe=listdetail
import {
  Button,
  Callout,
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
import { type RefCallback, type RefObject, useId, useState } from "react";
import { type CommitResult, type FlowRouter, searchParamRouter } from "./flow-router";
import "./list-detail.css";
import { useListDetailFlow } from "./list-detail-controller";

export type { CommitResult } from "./flow-router";

type RequestStatus = "Open" | "In progress" | "Resolved";
export type RequestDraft = { title: string; owner: string; status: RequestStatus };
export type RequestRecord = RequestDraft & {
  id: string;
  summary: string;
  site: string;
  requester: string;
  activity: string;
};
type Field = keyof RequestDraft & string;
// Keys outside the rendered fields can still arrive from a server.
type Errors = Partial<Record<string, string>>;
const fields: readonly Field[] = ["title", "owner", "status"];

/** Every visible string and announcement; pass `copy` to replace any of them. */
export const listDetailCopy = {
  eyebrow: "Operations desk",
  title: "Requests",
  description: "Review site requests and keep work moving.",
  /** Status text before any outcome; empty shows none. */
  idle: "",
  queue: "Request queue",
  search: "Search requests",
  searchPlaceholder: "Title, ID, owner or site",
  filter: "Filter by status",
  allStatuses: "All statuses",
  count: (shown: number, total: number) => `${shown} of ${total} requests`,
  list: "Requests",
  unsaved: "Unsaved draft",
  noMatches: "No matching requests",
  noMatchesHint: "Try another title, owner or status.",
  empty: "No requests yet",
  emptyHint: "New site requests will appear here.",
  clear: "Clear filters",
  back: "Back to requests",
  showContext: "Show context",
  hideContext: "Hide context",
  edit: "Edit request",
  summary: "What needs to happen",
  context: "Request context",
  requestedBy: "Requested by",
  site: "Site",
  assignedTo: "Assigned to",
  activity: "Latest activity",
  unavailable: "Request unavailable",
  unavailableHint:
    "This request is missing from the current queue. Return to requests to choose another.",
  choose: "Choose a request",
  chooseHint: "Inspect the details, check site context and make an update.",
  loading: "Loading requests…",
  editor: "Edit request",
  editorHint: "Title and owner are required.",
  review: "Review the marked fields before saving.",
  titleLabel: "Request title",
  ownerLabel: "Owner",
  statusLabel: "Status",
  titleRequired: "Enter a request title.",
  ownerRequired: "Enter an owner.",
  save: "Save changes",
  saving: "Saving changes…",
  cancel: "Cancel editing",
  failed: "Changes could not be saved. Your draft is safe; try again.",
  savingNotice: (id: string) => `Saving ${id}.`,
  savedNotice: (id: string) => `${id} saved.`,
  failedNotice: (id: string) => `${id} could not be saved. Draft kept.`,
  invalidNotice: (id: string, errors: Errors) =>
    fields.some((field) => errors[field])
      ? `${id} needs changes before saving.`
      : `${id} was not saved.`,
  discardedNotice: (id: string) => `${id} draft discarded.`,
};
type Copy = typeof listDetailCopy;
// Only true of the in-memory default `commit`.
const sessionCopy: Partial<Copy> = {
  idle: "Local demo · Session only",
  editorHint: "Title and owner are required. Changes stay in this browser session.",
  savedNotice: (id) => `${id} saved for this session.`,
};
const statusOptions = ["Open", "In progress", "Resolved"].map((value) => ({ value, label: value }));
const statusTones: Record<RequestStatus, StatusTone> = {
  Open: "info",
  "In progress": "running",
  Resolved: "success",
};
const sampleRequests: RequestRecord[] = [
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
  text,
  draft,
  errors,
  unrendered,
  failed,
  saving,
  field,
  submit,
  onChange,
  onSave,
  onCancel,
}: {
  text: Copy;
  draft: RequestDraft;
  errors: Errors;
  unrendered: string[];
  failed: boolean;
  saving: boolean;
  field: (name: Field) => RefCallback<HTMLElement>;
  submit: RefObject<HTMLButtonElement | null>;
  onChange: (draft: RequestDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="list-detail-composer"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <Grid layout="stack">
        <FormSection
          title={text.editor}
          headingLevel={3}
          description={text.editorHint}
          error={
            unrendered.length
              ? unrendered.join(" ")
              : Object.keys(errors).length
                ? text.review
                : undefined
          }
        >
          <Input
            ref={field("title")}
            label={text.titleLabel}
            name="title"
            required
            disabled={saving}
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            {...(errors.title ? { error: errors.title } : {})}
          />
          <Input
            ref={field("owner")}
            label={text.ownerLabel}
            name="owner"
            required
            disabled={saving}
            value={draft.owner}
            onChange={(event) => onChange({ ...draft, owner: event.target.value })}
            {...(errors.owner ? { error: errors.owner } : {})}
          />
          <Select
            ref={field("status")}
            label={text.statusLabel}
            value={draft.status}
            options={statusOptions}
            disabled={saving}
            onValueChange={(status) => {
              if (status === "Open" || status === "In progress" || status === "Resolved")
                onChange({ ...draft, status });
            }}
            {...(errors.status ? { error: errors.status } : {})}
          />
        </FormSection>
        {failed ? (
          <Callout tone="danger" className="list-detail-status">
            {text.failed}
          </Callout>
        ) : null}
        <Inline gap="sm" className="list-detail-form-actions">
          <Button ref={submit} type="submit" disabled={saving}>
            {saving ? text.saving : text.save}
          </Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={onCancel}>
            {text.cancel}
          </Button>
        </Inline>
      </Grid>
    </form>
  );
}

/** Application-owned queue; copy with its local recipe dependencies. */
export function ListDetail({
  requests = sampleRequests,
  initialRequestId = null,
  loading = false,
  router: routerProp,
  commit: commitProp,
  validate: validateProp,
  copy,
  landmark = true,
  header = true,
}: {
  requests?: RequestRecord[] | undefined;
  initialRequestId?: string | null | undefined;
  /** Records are still arriving: no unavailable or empty state yet. */
  loading?: boolean | undefined;
  router?: FlowRouter | undefined;
  commit?: ((id: string, draft: RequestDraft) => Promise<CommitResult<Field>>) | undefined;
  validate?: ((draft: RequestDraft) => Partial<Record<Field, string>>) | undefined;
  copy?: Partial<Copy> | undefined;
  /** False inside an app shell that already has a `<main>`. */
  landmark?: boolean | undefined;
  /** False inside an app shell that already has the page `<h1>`; status stays for screen readers. */
  header?: boolean | undefined;
}) {
  const text = { ...listDetailCopy, ...(commitProp ? {} : sessionCopy), ...copy };
  const [fallbackRouter] = useState(() => searchParamRouter("request"));
  const [showContext, setShowContext] = useState(true);
  const id = useId();
  const flow = useListDetailFlow<RequestRecord, RequestDraft, Field, string>({
    records: requests,
    initialId: initialRequestId,
    loading,
    router: routerProp ?? fallbackRouter,
    fields,
    begin: (record) => ({ title: record.title, owner: record.owner, status: record.status }),
    normalize: (draft) => ({ ...draft, title: draft.title.trim(), owner: draft.owner.trim() }),
    validate:
      validateProp ??
      ((draft): Errors => ({
        ...(draft.title ? {} : { title: text.titleRequired }),
        ...(draft.owner ? {} : { owner: text.ownerRequired }),
      })),
    commit: commitProp ?? (async () => {}),
    view: (record, committed) => ({ ...record, ...committed[committed.length - 1] }),
    matches: (record, query, filter) =>
      (filter === "all" || record.status === filter) &&
      `${record.id} ${record.title} ${record.owner} ${record.site}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    defaultFilter: "all",
    notices: {
      saving: (record) => text.savingNotice(record.id),
      saved: (record) => text.savedNotice(record.id),
      failed: (record) => text.failedNotice(record.id),
      invalid: (record, errors) => text.invalidNotice(record.id, errors),
      discarded: (record) => text.discardedNotice(record.id),
    },
  });
  const { selected, draft } = flow;

  const notices = (
    <Text role="status" size="sm" tone="muted" className="list-detail-notice">
      <span key={flow.notice.id}>{flow.notice.text || text.idle}</span>
    </Text>
  );

  return (
    <Container
      {...flow.root}
      // Container types `as` per element; main and div share every prop used here.
      as={(landmark ? "main" : "div") as "main"}
      size="full"
      gutter={false}
      className="list-detail"
    >
      {header ? (
        <PageHeader
          title={text.title}
          size="sm"
          eyebrow={text.eyebrow}
          description={text.description}
          meta={notices}
        />
      ) : (
        <div className="kb-sr-only">{notices}</div>
      )}
      <div
        className="list-detail-layout"
        data-selected={flow.selectedId !== null ? "true" : "false"}
        aria-busy={loading || undefined}
      >
        <Panel className="list-detail-list" aria-labelledby={`${id}-queue`}>
          <Panel.Header>
            <Heading level={2} size="sm" id={`${id}-queue`}>
              {text.queue}
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <Grid layout="stack">
              <Input
                ref={flow.refs.search}
                label={text.search}
                type="search"
                value={flow.query}
                placeholder={text.searchPlaceholder}
                onChange={(event) => flow.setQuery(event.target.value)}
              />
              <Select
                label={text.filter}
                value={flow.filter}
                onValueChange={flow.setFilter}
                options={[{ value: "all", label: text.allStatuses }, ...statusOptions]}
              />
              <Text size="sm" tone="muted" aria-live="polite">
                {/* Counts that change while loading would each be announced. */}
                {loading ? text.loading : text.count(flow.visible.length, flow.records.length)}
              </Text>
              {loading && !flow.records.length ? null : flow.visible.length ? (
                <ul className="list-detail-items" aria-label={text.list}>
                  {flow.visible.map((record) => (
                    <li key={record.id}>
                      <Button
                        variant="ghost"
                        className="list-detail-row"
                        aria-current={flow.selectedId === record.id ? "true" : undefined}
                        ref={flow.refs.row(record.id)}
                        onClick={() => flow.open(record.id)}
                      >
                        <Text as="span" size="sm" tone="muted" className="list-detail-id">
                          {record.id}
                        </Text>
                        <Text as="span" className="list-detail-row-title">
                          {record.title}
                        </Text>
                        <span className="list-detail-row-meta">
                          <Status tone={statusTones[record.status]} compact>
                            {record.status}
                          </Status>
                          <Text as="span" size="sm" tone="muted">
                            {record.owner}
                          </Text>
                        </span>
                        {flow.hasDraft(record.id) && (
                          <Text as="span" size="sm" tone="muted">
                            {text.unsaved}
                          </Text>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="list-detail-empty">
                  <Heading level={3} size="md">
                    {flow.records.length ? text.noMatches : text.empty}
                  </Heading>
                  <Text tone="muted">
                    {flow.records.length ? text.noMatchesHint : text.emptyHint}
                  </Text>
                </div>
              )}
              {flow.filtersActive && (
                <Button variant="secondary" onClick={flow.clearFilters}>
                  {text.clear}
                </Button>
              )}
            </Grid>
          </Panel.Body>
        </Panel>
        <div className="list-detail-workspace">
          {flow.waiting ? (
            <Panel tone="sunken" className="list-detail-empty">
              <Panel.Body>
                <Text tone="muted">{text.loading}</Text>
              </Panel.Body>
            </Panel>
          ) : flow.selectedId !== null ? (
            <Grid layout="stack">
              {selected ? (
                <Panel className="list-detail-detail" aria-labelledby={`${id}-detail`}>
                  <Panel.Header>
                    <Grid layout="stack" className="list-detail-detail-heading">
                      <Inline justify="between">
                        <Inline gap="sm">
                          <Text size="sm" tone="muted" className="list-detail-id">
                            {selected.id}
                          </Text>
                          <Status tone={statusTones[selected.status]} appearance="chip">
                            {selected.status}
                          </Status>
                        </Inline>
                        <Inline gap="sm" className="list-detail-navigation">
                          <Button size="sm" variant="ghost" onClick={flow.back}>
                            {text.back}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-expanded={showContext}
                            aria-controls={`${id}-context`}
                            onClick={() => setShowContext((current) => !current)}
                          >
                            {showContext ? text.hideContext : text.showContext}
                          </Button>
                        </Inline>
                      </Inline>
                      <Inline justify="between" align="start" gap="sm">
                        <Heading
                          className="list-detail-title"
                          ref={flow.refs.heading}
                          tabIndex={-1}
                          level={2}
                          id={`${id}-detail`}
                        >
                          {selected.title}
                        </Heading>
                        {!draft && (
                          <Button ref={flow.refs.begin} variant="secondary" onClick={flow.begin}>
                            {text.edit}
                          </Button>
                        )}
                      </Inline>
                    </Grid>
                  </Panel.Header>
                  <Panel.Body>
                    <Split
                      ratio="wide-start"
                      collapse="sm"
                      align="start"
                      gap="lg"
                      className="list-detail-content"
                    >
                      <div className="list-detail-primary">
                        {draft ? (
                          <RequestEditor
                            key={selected.id}
                            text={text}
                            draft={draft}
                            errors={flow.errors}
                            unrendered={flow.unrendered}
                            failed={flow.failed}
                            saving={flow.pending}
                            field={flow.refs.field}
                            submit={flow.refs.submit}
                            onChange={flow.change}
                            onCancel={flow.discard}
                            onSave={flow.submit}
                          />
                        ) : (
                          <div className="list-detail-copy">
                            <Heading level={3} size="sm">
                              {text.summary}
                            </Heading>
                            <Text className="list-detail-summary">{selected.summary}</Text>
                          </div>
                        )}
                      </div>
                      {showContext && (
                        <Container
                          as="aside"
                          size="full"
                          gutter={false}
                          className="list-detail-context"
                          aria-label={text.context}
                          id={`${id}-context`}
                        >
                          <Heading level={3} size="sm" id={`${id}-context-title`}>
                            {text.context}
                          </Heading>
                          <Grid layout="stack" className="list-detail-section">
                            <dl className="list-detail-facts">
                              <div>
                                <dt>{text.requestedBy}</dt>
                                <dd>{selected.requester}</dd>
                              </div>
                              <div>
                                <dt>{text.site}</dt>
                                <dd>{selected.site}</dd>
                              </div>
                              <div>
                                <dt>{text.assignedTo}</dt>
                                <dd>{selected.owner}</dd>
                              </div>
                            </dl>
                            <div className="list-detail-activity">
                              <Heading level={4} size="sm">
                                {text.activity}
                              </Heading>
                              <Text size="sm">{selected.activity}</Text>
                            </div>
                          </Grid>
                        </Container>
                      )}
                    </Split>
                  </Panel.Body>
                </Panel>
              ) : (
                <Panel>
                  <Panel.Body>
                    <Button variant="ghost" onClick={flow.back}>
                      {text.back}
                    </Button>
                    <Heading ref={flow.refs.heading} tabIndex={-1} level={2}>
                      {text.unavailable}
                    </Heading>
                    <Text>{text.unavailableHint}</Text>
                  </Panel.Body>
                </Panel>
              )}
            </Grid>
          ) : (
            <Panel tone="sunken" className="list-detail-empty">
              <Panel.Body>
                <Heading level={2}>{text.choose}</Heading>
                <Text tone="muted">{text.chooseHint}</Text>
              </Panel.Body>
            </Panel>
          )}
        </div>
      </div>
    </Container>
  );
}
