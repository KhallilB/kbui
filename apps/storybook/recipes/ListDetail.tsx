// x-release-please-start-version
// kbui recipe ListDetail · from kbui 0.11.0 · https://kbui.kcb.pro/recipes/?recipe=listdetail
// x-release-please-end
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
import { type RefObject, useEffect, useId, useMemo, useRef, useState } from "react";
import { type FlowRouter, searchParamRouter } from "./flow-router";
import "./list-detail.css";

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
/** `errors` keeps the draft and focuses the first invalid field, like validation. */
// biome-ignore lint/suspicious/noConfusingVoidType: lets `async () => {}` mean success.
export type CommitResult<Field extends string> = void | { errors: Partial<Record<Field, string>> };
// Keys outside the rendered fields can still arrive from a server.
type Errors = Partial<Record<string, string>>;

/** Every visible string and announcement; pass `copy` to replace any of them. */
export const listDetailCopy = {
  eyebrow: "Operations desk",
  title: "Requests",
  description: "Review site requests and keep work moving.",
  idle: "Local demo · Session only",
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
  editor: "Edit request",
  editorHint: "Title and owner are required. Changes stay in this browser session.",
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
  savedNotice: (id: string) => `${id} saved for this session.`,
  failedNotice: (id: string) => `${id} could not be saved. Draft kept.`,
  invalidNotice: (id: string) => `${id} needs changes before saving.`,
  discardedNotice: (id: string) => `${id} draft discarded.`,
};
type Copy = typeof listDetailCopy;

const fields: readonly Field[] = ["title", "owner", "status"];
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

type FieldRefs = {
  title: RefObject<HTMLInputElement | null>;
  owner: RefObject<HTMLInputElement | null>;
  status: RefObject<HTMLDivElement | null>;
  submit: RefObject<HTMLButtonElement | null>;
};

function RequestEditor({
  text,
  draft,
  errors,
  failed,
  saving,
  refs,
  onChange,
  onSave,
  onCancel,
}: {
  text: Copy;
  draft: RequestDraft;
  errors: Errors;
  failed: boolean;
  saving: boolean;
  refs: FieldRefs;
  onChange: (draft: RequestDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const unrendered = Object.entries(errors).filter(([key]) => !fields.includes(key as Field));
  useEffect(() => {
    refs.title.current?.focus();
  }, [refs]);
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
              ? unrendered.map(([, message]) => message).join(" ")
              : Object.keys(errors).length
                ? text.review
                : undefined
          }
        >
          <Input
            ref={refs.title}
            label={text.titleLabel}
            name="title"
            required
            disabled={saving}
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            {...(errors.title ? { error: errors.title } : {})}
          />
          <Input
            ref={refs.owner}
            label={text.ownerLabel}
            name="owner"
            required
            disabled={saving}
            value={draft.owner}
            onChange={(event) => onChange({ ...draft, owner: event.target.value })}
            {...(errors.owner ? { error: errors.owner } : {})}
          />
          <Select
            ref={refs.status}
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
          <Button ref={refs.submit} type="submit" disabled={saving}>
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

type Overlay = { base: RequestRecord; value: RequestDraft };
type Target = "heading" | "list" | "edit" | Field | "submit";

function without<Value>(map: Record<string, Value | undefined>, id: string) {
  const { [id]: _, ...rest } = map;
  return rest;
}

/** Application-owned queue; copy with its local recipe dependencies. */
export function ListDetail({
  requests = sampleRequests,
  initialRequestId = null,
  router: routerProp,
  commit = async () => {},
  validate: validateProp,
  copy,
}: {
  requests?: RequestRecord[] | undefined;
  initialRequestId?: string | null | undefined;
  router?: FlowRouter | undefined;
  commit?: ((id: string, draft: RequestDraft) => Promise<CommitResult<Field>>) | undefined;
  validate?: ((draft: RequestDraft) => Partial<Record<Field, string>>) | undefined;
  copy?: Partial<Copy> | undefined;
}) {
  const text = { ...listDetailCopy, ...copy };
  const validate =
    validateProp ??
    ((draft: RequestDraft): Errors => ({
      ...(draft.title ? {} : { title: text.titleRequired }),
      ...(draft.owner ? {} : { owner: text.ownerRequired }),
    }));
  const [fallbackRouter] = useState(() => searchParamRouter("request"));
  const router = routerProp ?? fallbackRouter;
  const [selectedId, setSelectedId] = useState(() => router.read() ?? initialRequestId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string | null>("all");
  const [drafts, setDrafts] = useState<Record<string, RequestDraft | undefined>>({});
  const [errors, setErrors] = useState<Record<string, Errors | undefined>>({});
  const [failures, setFailures] = useState<Record<string, true | undefined>>({});
  const [saving, setSaving] = useState<Record<string, true | undefined>>({});
  const [overlays, setOverlays] = useState<Record<string, Overlay | undefined>>({});
  const [showContext, setShowContext] = useState(true);
  // New id per outcome re-mounts the text, so a repeated outcome is announced again.
  const [notice, setNotice] = useState({ id: 0, text: "" });
  const root = useRef<HTMLElement>(null);
  const focused = useRef<HTMLElement | null>(null);
  const currentId = useRef(selectedId);
  const latest = useRef(requests);
  latest.current = requests;
  const mounted = useRef(false);
  const pending = useRef(new Set<string>());
  const search = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const edit = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLInputElement>(null);
  const owner = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const submit = useRef<HTMLButtonElement>(null);
  const refs = useMemo(() => ({ title, owner, status, submit }), []);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const lastSelected = useRef(selectedId);
  const shown = useRef<string | null>(null);
  const focusTarget = useRef<Target | null>(selectedId ? "heading" : null);
  const id = useId();
  // An overlay holds a local save until the prop sends a new object for that id.
  const records = useMemo(
    () =>
      requests.map((record) => {
        const overlay = overlays[record.id];
        return overlay?.base === record ? { ...record, ...overlay.value } : record;
      }),
    [requests, overlays],
  );
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
    mounted.current = true;
    const unsubscribe = router.subscribe(() => {
      const next = router.read();
      if (next === currentId.current) return;
      if (currentId.current) lastSelected.current = currentId.current;
      focusTarget.current = next ? "heading" : "list";
      currentId.current = next;
      setSelectedId(next);
    });
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    currentId.current = selectedId;
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target === "heading") heading.current?.focus();
    if (target === "edit") edit.current?.focus();
    if (target === "title" || target === "owner" || target === "submit")
      refs[target].current?.focus();
    if (target === "status")
      status.current?.querySelector<HTMLElement>("[role='combobox'], button")?.focus();
    if (target === "list")
      (rows.current.get(lastSelected.current ?? "") ?? search.current)?.focus();
  });

  // The open record left the prop: drop its draft, and refocus only if focus went with it.
  useEffect(() => {
    if (shown.current !== null && shown.current === selectedId && !selected) {
      const gone = shown.current;
      setDrafts((current) => without(current, gone));
      setErrors((current) => without(current, gone));
      setFailures((current) => without(current, gone));
      if (focused.current && !focused.current.isConnected) heading.current?.focus();
    }
    shown.current = selected?.id ?? null;
  }, [selected, selectedId]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const active = document.activeElement;
      const candidate = active === document.body ? focused.current : active;
      if (
        candidate instanceof HTMLElement &&
        root.current?.contains(candidate) &&
        candidate.getClientRects().length === 0
      ) {
        (currentId.current !== null ? heading.current : search.current)?.focus();
      }
    });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  function navigate(next: string | null) {
    if (next === selectedId) {
      heading.current?.focus();
      return;
    }
    if (selectedId) lastSelected.current = selectedId;
    router.write(next);
    focusTarget.current = next ? "heading" : "list";
    currentId.current = next;
    setSelectedId(next);
  }

  function announce(message: string) {
    setNotice((current) => ({ id: current.id + 1, text: message }));
  }

  /** Records field errors; false when there are none. Server errors are always announced. */
  function reject(recordId: string, found: Errors, server = false) {
    const entries = Object.entries(found).filter(([, message]) => message);
    if (!entries.length) return false;
    setErrors((current) => ({ ...current, [recordId]: Object.fromEntries(entries) }));
    const unrendered = entries
      .filter(([key]) => !fields.includes(key as Field))
      .map(([, message]) => message);
    if (server || unrendered.length)
      announce([...(server ? [text.invalidNotice(recordId)] : []), ...unrendered].join(" "));
    if (currentId.current === recordId)
      focusTarget.current = fields.find((field) => found[field]) ?? "submit";
    return true;
  }

  async function save(record: RequestRecord, current: RequestDraft) {
    const recordId = record.id;
    if (pending.current.has(recordId)) return;
    const next = { ...current, title: current.title.trim(), owner: current.owner.trim() };
    setFailures((map) => without(map, recordId));
    if (reject(recordId, validate(next))) return;
    setErrors((map) => without(map, recordId));
    // An echo that lands while pending is a new object, so the prop wins over this save.
    const base = latest.current.find((entry) => entry.id === recordId);
    pending.current.add(recordId);
    // Saving disables the focused submit; keep focus in the record.
    focusTarget.current = "heading";
    setSaving((map) => ({ ...map, [recordId]: true }));
    announce(text.savingNotice(recordId));
    try {
      const result = await commit(recordId, next);
      if (!mounted.current) return;
      if (result && reject(recordId, result.errors, true)) return;
      if (base) setOverlays((map) => ({ ...map, [recordId]: { base, value: next } }));
      setDrafts((map) => without(map, recordId));
      announce(text.savedNotice(recordId));
      if (currentId.current === recordId) focusTarget.current = "edit";
    } catch {
      if (!mounted.current) return;
      setFailures((map) => ({ ...map, [recordId]: true }));
      announce(text.failedNotice(recordId));
      if (currentId.current === recordId) focusTarget.current = "title";
    } finally {
      pending.current.delete(recordId);
      if (mounted.current) setSaving((map) => without(map, recordId));
    }
  }

  function closeEditor(recordId: string) {
    setDrafts((current) => without(current, recordId));
    setErrors((current) => without(current, recordId));
    setFailures((current) => without(current, recordId));
    focusTarget.current = "edit";
  }

  return (
    <Container
      ref={root}
      as="main"
      size="full"
      gutter={false}
      className="list-detail"
      onFocusCapture={(event) => {
        focused.current = event.target;
      }}
      onBlurCapture={(event) => {
        // Hidden controls may blur before ResizeObserver runs.
        if (event.target.getClientRects().length) focused.current = null;
      }}
    >
      <PageHeader
        title={text.title}
        size="sm"
        eyebrow={text.eyebrow}
        description={text.description}
        meta={
          <Text role="status" size="sm" tone="muted" className="list-detail-notice">
            <span key={notice.id}>{notice.text || text.idle}</span>
          </Text>
        }
      />
      <div className="list-detail-layout" data-selected={selectedId ? "true" : "false"}>
        <Panel className="list-detail-list" aria-labelledby={`${id}-queue`}>
          <Panel.Header>
            <Heading level={2} size="sm" id={`${id}-queue`}>
              {text.queue}
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <Grid layout="stack">
              <Input
                ref={search}
                label={text.search}
                type="search"
                value={query}
                placeholder={text.searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Select
                label={text.filter}
                value={filter}
                onValueChange={(value) => setFilter(value ?? "all")}
                options={[{ value: "all", label: text.allStatuses }, ...statusOptions]}
              />
              <Text size="sm" tone="muted" aria-live="polite">
                {text.count(filtered.length, records.length)}
              </Text>
              {filtered.length ? (
                <ul className="list-detail-items" aria-label={text.list}>
                  {filtered.map((record) => (
                    <li key={record.id}>
                      <Button
                        variant="ghost"
                        className="list-detail-row"
                        aria-current={selectedId === record.id ? "true" : undefined}
                        ref={(element) => {
                          if (element) rows.current.set(record.id, element);
                          else rows.current.delete(record.id);
                        }}
                        onClick={() => navigate(record.id)}
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
                        {drafts[record.id] && (
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
                    {records.length ? text.noMatches : text.empty}
                  </Heading>
                  <Text tone="muted">{records.length ? text.noMatchesHint : text.emptyHint}</Text>
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
                  {text.clear}
                </Button>
              )}
            </Grid>
          </Panel.Body>
        </Panel>
        <div className="list-detail-workspace">
          {selectedId ? (
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
                          <Button size="sm" variant="ghost" onClick={() => navigate(null)}>
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
                            errors={errors[selected.id] ?? {}}
                            failed={Boolean(failures[selected.id])}
                            saving={Boolean(saving[selected.id])}
                            refs={refs}
                            onChange={(next) =>
                              setDrafts((current) => ({ ...current, [selected.id]: next }))
                            }
                            onCancel={() => {
                              closeEditor(selected.id);
                              announce(text.discardedNotice(selected.id));
                            }}
                            onSave={() => void save(selected, draft)}
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
                    <Button variant="ghost" onClick={() => navigate(null)}>
                      {text.back}
                    </Button>
                    <Heading ref={heading} tabIndex={-1} level={2}>
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
