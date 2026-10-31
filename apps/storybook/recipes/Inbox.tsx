// x-release-please-start-version
// kbui recipe Inbox · from kbui 0.12.0 · https://kbui.kcb.pro/recipes/?recipe=inbox
// x-release-please-end
import {
  Button,
  Callout,
  Container,
  Grid,
  Heading,
  Inline,
  Input,
  PageHeader,
  Panel,
  Split,
  Text,
  Textarea,
} from "@kb.ui/react";
import { useEffect, useId, useRef, useState } from "react";
import { type FlowRouter, searchParamRouter } from "./flow-router";
import "./inbox.css";

export type InboxThread = {
  id: string;
  sender: string;
  address: string;
  subject: string;
  date: string;
  excerpt: string;
  paragraphs: string[];
  context: string;
};
export type ReplyDraft = { body: string };
/** `errors` keeps the draft and focuses the first invalid field, like validation. */
// biome-ignore lint/suspicious/noConfusingVoidType: lets `async () => {}` mean success.
export type CommitResult<Field extends string> = void | { errors: Partial<Record<Field, string>> };
// Keys outside the rendered fields can still arrive from a server.
type Errors = Partial<Record<string, string>>;

/** Every visible string and announcement; pass `copy` to replace any of them. */
export const inboxCopy = {
  title: "Correspondence",
  description: "Read and reply to contributor messages.",
  meta: "Fieldwork · Editorial desk · Demo",
  inbox: "Inbox",
  search: "Search correspondence",
  count: (shown: number, total: number) => `${shown} of ${total} messages`,
  list: "Messages",
  draft: " · Draft",
  noMatches: "No matching messages",
  noMatchesHint: "Try a sender or a phrase from the subject.",
  empty: "No correspondence yet",
  emptyHint: "Incoming letters will appear here.",
  clear: "Clear search",
  back: "Back to inbox",
  showSender: "Show sender details",
  hideSender: "Hide sender details",
  unavailable: "Message unavailable",
  unavailableMeta: "This letter could not be found.",
  unavailableHint: "Return to the inbox to choose another message.",
  letter: (sender: string) => `Letter from ${sender}`,
  sentReply: (position: number) => `Your reply ${position}`,
  sentHeading: "You · Session reply",
  reply: "Reply",
  form: "Reply to sender",
  field: "Your reply",
  required: "Write a reply before sending.",
  send: "Send reply",
  sending: "Sending reply…",
  discard: "Discard draft",
  sessionNote: "Replies stay in this session. Reload clears drafts and replies.",
  failed: "Reply could not be sent. Your draft is safe; try again.",
  sender: "Sender details",
  about: "About the sender",
  choose: "Choose a message",
  chooseHint: "Select a message from the inbox to read it or write a reply.",
  sendingNotice: (sender: string) => `Sending reply to ${sender}.`,
  sentNotice: (subject: string) => `Reply added to ${subject} for this session.`,
  failedNotice: (sender: string) => `Reply to ${sender} failed. Draft retained.`,
  invalidNotice: (sender: string) => `Reply to ${sender} needs changes before sending.`,
  discardedNotice: "Draft discarded.",
};
type Copy = typeof inboxCopy;

const sampleThreads: InboxThread[] = [
  {
    id: "coast",
    sender: "Mara Ellis",
    address: "mara@example.com",
    subject: "Notes from the coast",
    date: "30 October · 09:12",
    excerpt: "The last ferry left before the rain. I stayed for one more frame.",
    paragraphs: [
      "Hi Rowan,",
      "The last ferry left before the rain. I stayed for one more frame. The harbour looks very different when everyone has gone home: ropes drying on the wall, a single light over the ticket office.",
      "I have twelve photographs for the winter issue. Would you like the contact sheet first, or a tighter selection of six? I can send captions with either version.",
      "All the best,\nMara",
    ],
    context: "Photographer · Winter issue. Contact sheet and captions are the next editorial step.",
  },
  {
    id: "proof",
    sender: "Jon Bell",
    address: "jon@example.com",
    subject: "A small correction to the print proof",
    date: "29 October · 16:40",
    excerpt: "The credit on page 24 should read Harbour Archive.",
    paragraphs: [
      "Hello Rowan,",
      "The credit on page 24 should read Harbour Archive. Everything else in the second proof is ready for your review.",
      "Thank you,\nJon",
    ],
    context: "Production editor · Second print proof. Confirm the credit before approving print.",
  },
  {
    id: "translation",
    sender: "Amina Okafor",
    address: "amina@example.com",
    subject:
      "Translation notes for the winter édition: place names, extended captions and acknowledgements",
    date: "28 October · 11:05",
    excerpt: "A few words need their original spelling in the bilingual edition.",
    paragraphs: [
      "Dear Rowan,",
      "For the winter édition, please retain the original spelling of São Tomé, Île d’Yeu and Łódź. The extended caption for the shoreline photograph also needs the full acknowledgement from the local archive.",
      "The reference identifier is winter-correspondence-translation-notes-and-extended-acknowledgements-2026. Please include it when returning the proof so we can match the notes to the correct edition.",
      "Warm regards,\nAmina",
    ],
    context: "Translator · Bilingual winter edition. Check place names against the final proof.",
  },
];

type Reply = { id: string; body: string };
// Replies hold a local send until the prop sends a new object for that thread.
type Overlay = { base: InboxThread; replies: Reply[] };
type Target = "heading" | "list" | "reply" | "input" | "submit";

function without<Value>(map: Record<string, Value | undefined>, id: string) {
  const { [id]: _, ...rest } = map;
  return rest;
}

/** Application-owned correspondence; routing and reply delivery go through its seams. */
export function Inbox({
  threads = sampleThreads,
  initialThreadId = null,
  router: routerProp,
  commit = async () => {},
  validate: validateProp,
  copy,
}: {
  threads?: InboxThread[] | undefined;
  initialThreadId?: string | null | undefined;
  router?: FlowRouter | undefined;
  commit?: ((id: string, draft: ReplyDraft) => Promise<CommitResult<"body">>) | undefined;
  validate?: ((draft: ReplyDraft) => Partial<Record<"body", string>>) | undefined;
  copy?: Partial<Copy> | undefined;
}) {
  const text = { ...inboxCopy, ...copy };
  const validate =
    validateProp ?? ((draft: ReplyDraft): Errors => (draft.body ? {} : { body: text.required }));
  const [fallbackRouter] = useState(() => searchParamRouter("message"));
  const router = routerProp ?? fallbackRouter;
  const [selectedId, setSelectedId] = useState(() => router.read() ?? initialThreadId);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string | undefined>>({});
  const [overlays, setOverlays] = useState<Record<string, Overlay | undefined>>({});
  const [errors, setErrors] = useState<Record<string, Errors | undefined>>({});
  const [failures, setFailures] = useState<Record<string, true | undefined>>({});
  const [sendingIds, setSendingIds] = useState<Record<string, true | undefined>>({});
  const [showSender, setShowSender] = useState(false);
  // New id per message re-mounts the text, so a repeated message is announced again.
  const [notice, setNotice] = useState({ id: 0, text: "" });
  const root = useRef<HTMLElement>(null);
  const focused = useRef<HTMLElement | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const replyButton = useRef<HTMLButtonElement>(null);
  const replyInput = useRef<HTMLTextAreaElement>(null);
  const submit = useRef<HTMLButtonElement>(null);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const lastSelected = useRef(selectedId);
  const currentId = useRef(selectedId);
  const latest = useRef(threads);
  latest.current = threads;
  const shown = useRef<string | null>(null);
  const mounted = useRef(false);
  const pending = useRef(new Set<string>());
  const focusTarget = useRef<Target | null>(selectedId !== null ? "heading" : null);
  const id = useId();
  const selected = threads.find((thread) => thread.id === selectedId);
  const draft = selected ? drafts[selected.id] : undefined;
  const sending = selected ? Boolean(sendingIds[selected.id]) : false;
  const fieldErrors = (selected && errors[selected.id]) || {};
  const error = fieldErrors.body;
  const unrendered = Object.entries(fieldErrors)
    .filter(([key]) => key !== "body")
    .map(([, message]) => message);
  const overlay = selected ? overlays[selected.id] : undefined;
  const replies = overlay && overlay.base === selected ? overlay.replies : [];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = threads.filter((thread) =>
    `${thread.sender} ${thread.subject} ${thread.excerpt}`.toLowerCase().includes(normalizedQuery),
  );

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = router.subscribe(() => {
      const next = router.read();
      if (next === currentId.current) return;
      if (currentId.current !== null) lastSelected.current = currentId.current;
      focusTarget.current = next !== null ? "heading" : "list";
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
    if (target === "list")
      (rows.current.get(lastSelected.current ?? "") ?? search.current)?.focus();
    if (target === "reply") replyButton.current?.focus();
    if (target === "input") replyInput.current?.focus();
    if (target === "submit") submit.current?.focus();
  });

  // The open thread left the prop: drop its draft, and refocus only if focus went with it.
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
    if (selectedId !== null) lastSelected.current = selectedId;
    router.write(next);
    focusTarget.current = next !== null ? "heading" : "list";
    currentId.current = next;
    setSelectedId(next);
  }

  function announce(message: string) {
    setNotice((current) => ({ id: current.id + 1, text: message }));
  }

  /** Records field errors; false when there are none. Server errors are always announced. */
  function reject(thread: InboxThread, found: Errors, server = false) {
    const threadId = thread.id;
    const entries = Object.entries(found).filter(([, message]) => message);
    if (!entries.length) return false;
    setErrors((current) => ({ ...current, [threadId]: Object.fromEntries(entries) }));
    const others = entries.filter(([key]) => key !== "body").map(([, message]) => message);
    if (server || others.length)
      announce([...(server ? [text.invalidNotice(thread.sender)] : []), ...others].join(" "));
    if (currentId.current === threadId) focusTarget.current = found.body ? "input" : "submit";
    return true;
  }

  async function submitReply() {
    if (!selected || pending.current.has(selected.id)) return;
    const thread = selected;
    const body = (drafts[thread.id] ?? "").trim();
    setFailures((current) => without(current, thread.id));
    if (reject(thread, validate({ body }))) return;
    setErrors((current) => without(current, thread.id));
    // An echo that lands while pending is a new object, so the prop wins over this send.
    const base = latest.current.find((entry) => entry.id === thread.id);
    pending.current.add(thread.id);
    // Sending disables the focused submit; keep focus in the letter.
    focusTarget.current = "heading";
    setSendingIds((current) => ({ ...current, [thread.id]: true }));
    announce(text.sendingNotice(thread.sender));
    try {
      const result = await commit(thread.id, { body });
      if (!mounted.current) return;
      if (result && reject(thread, result.errors, true)) return;
      if (base) {
        const reply = { id: crypto.randomUUID(), body };
        setOverlays((current) => {
          const previous = current[thread.id];
          const kept = previous?.base === base ? previous.replies : [];
          return { ...current, [thread.id]: { base, replies: [...kept, reply] } };
        });
      }
      setDrafts((current) => without(current, thread.id));
      announce(text.sentNotice(thread.subject));
      if (currentId.current === thread.id) focusTarget.current = "reply";
    } catch {
      if (!mounted.current) return;
      setFailures((current) => ({ ...current, [thread.id]: true }));
      announce(text.failedNotice(thread.sender));
      if (currentId.current === thread.id) focusTarget.current = "input";
    } finally {
      pending.current.delete(thread.id);
      if (mounted.current) setSendingIds((current) => without(current, thread.id));
    }
  }

  return (
    <Container
      ref={root}
      as="main"
      size="full"
      gutter={false}
      className="inbox-flow"
      onFocusCapture={(event) => {
        focused.current = event.target;
      }}
      onBlurCapture={(event) => {
        // Hidden controls can blur to body before ResizeObserver runs.
        if (event.target.getClientRects().length) focused.current = null;
      }}
    >
      <PageHeader
        title={text.title}
        description={text.description}
        meta={
          <Text size="sm" tone="muted">
            {text.meta}
          </Text>
        }
      />
      <div className="inbox-layout" data-selected={selectedId !== null}>
        <Panel className="inbox-list" tone="quiet" aria-labelledby={`${id}-inbox`}>
          <Panel.Header>
            <Heading id={`${id}-inbox`} level={2} size="md">
              {text.inbox} <span className="inbox-count">{threads.length}</span>
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <Grid layout="stack">
              <Input
                ref={search}
                type="search"
                label={text.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Text size="sm" tone="muted" aria-live="polite">
                {text.count(filtered.length, threads.length)}
              </Text>
              {filtered.length ? (
                <ul className="inbox-rows" aria-label={text.list}>
                  {filtered.map((thread) => (
                    <li key={thread.id}>
                      <Button
                        variant="ghost"
                        className="inbox-row"
                        aria-current={selectedId === thread.id ? "true" : undefined}
                        ref={(element) => {
                          if (element) rows.current.set(thread.id, element);
                          else rows.current.delete(thread.id);
                        }}
                        onClick={() => navigate(thread.id)}
                      >
                        <span className="inbox-sender">{thread.sender}</span>
                        <span className="inbox-subject">{thread.subject}</span>
                        <span className="inbox-excerpt">{thread.excerpt}</span>
                        <span className="inbox-date">
                          {thread.date}
                          {drafts[thread.id] !== undefined ? text.draft : ""}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  <Heading level={3}>{threads.length ? text.noMatches : text.empty}</Heading>
                  <Text tone="muted">{threads.length ? text.noMatchesHint : text.emptyHint}</Text>
                </div>
              )}
              {query ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    search.current?.focus();
                  }}
                >
                  {text.clear}
                </Button>
              ) : null}
            </Grid>
          </Panel.Body>
        </Panel>
        <div className="inbox-workspace">
          {selectedId !== null ? (
            <Grid layout="stack">
              <Inline justify="between">
                <Button variant="secondary" onClick={() => navigate(null)}>
                  {text.back}
                </Button>
                {selected ? (
                  <Button
                    variant="ghost"
                    aria-expanded={showSender}
                    aria-controls={`${id}-sender`}
                    onClick={() => setShowSender((current) => !current)}
                  >
                    {showSender ? text.hideSender : text.showSender}
                  </Button>
                ) : null}
              </Inline>
              <Split ratio="wide-start" collapse="md" align="start">
                <Panel className="inbox-detail" aria-labelledby={`${id}-subject`}>
                  <Panel.Header>
                    <Text size="sm" tone="muted">
                      {selected ? `${selected.sender} · ${selected.date}` : text.unavailableMeta}
                    </Text>
                    <Heading ref={heading} tabIndex={-1} id={`${id}-subject`} level={2}>
                      {selected?.subject ?? text.unavailable}
                    </Heading>
                  </Panel.Header>
                  {selected ? (
                    <Panel.Body>
                      <Grid layout="stack">
                        <article aria-label={text.letter(selected.sender)} className="inbox-prose">
                          {selected.paragraphs.map((paragraph, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: Paragraph order stays fixed within each letter.
                            <p key={`${selected.id}-${index}`}>{paragraph}</p>
                          ))}
                        </article>
                        {replies.map((reply, index) => (
                          <article
                            key={reply.id}
                            aria-label={text.sentReply(index + 1)}
                            className="inbox-sent"
                          >
                            <Heading level={3} size="sm">
                              {text.sentHeading}
                            </Heading>
                            <p>{reply.body}</p>
                          </article>
                        ))}
                        {draft === undefined ? (
                          <div>
                            <Button
                              ref={replyButton}
                              onClick={() => {
                                setDrafts((current) => ({ ...current, [selected.id]: "" }));
                                focusTarget.current = "input";
                              }}
                            >
                              {text.reply}
                            </Button>
                          </div>
                        ) : (
                          <form
                            className="inbox-composer"
                            noValidate
                            aria-label={text.form}
                            onSubmit={(event) => {
                              event.preventDefault();
                              void submitReply();
                            }}
                          >
                            <Grid layout="stack">
                              <Textarea
                                ref={replyInput}
                                id={`${id}-reply`}
                                label={text.field}
                                className="inbox-reply-field"
                                classNames={{
                                  label: "inbox-reply-label",
                                  control: "inbox-reply",
                                  error: "inbox-error",
                                }}
                                rows={5}
                                required
                                value={draft}
                                disabled={sending}
                                error={error}
                                aria-invalid={Boolean(error)}
                                onChange={(event) =>
                                  setDrafts((current) => ({
                                    ...current,
                                    [selected.id]: event.target.value,
                                  }))
                                }
                              />
                              {failures[selected.id] || unrendered.length ? (
                                <Callout tone="danger" className="inbox-status">
                                  {failures[selected.id] ? text.failed : unrendered.join(" ")}
                                </Callout>
                              ) : null}
                              <Inline>
                                <Button ref={submit} type="submit" disabled={sending}>
                                  {sending ? text.sending : text.send}
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  disabled={sending}
                                  onClick={() => {
                                    setDrafts((current) => without(current, selected.id));
                                    setErrors((current) => without(current, selected.id));
                                    setFailures((current) => without(current, selected.id));
                                    announce(text.discardedNotice);
                                    focusTarget.current = "reply";
                                  }}
                                >
                                  {text.discard}
                                </Button>
                              </Inline>
                              <Text size="sm" tone="muted">
                                {text.sessionNote}
                              </Text>
                            </Grid>
                          </form>
                        )}
                      </Grid>
                    </Panel.Body>
                  ) : (
                    <Panel.Body>
                      <Text>{text.unavailableHint}</Text>
                    </Panel.Body>
                  )}
                </Panel>
                {selected && showSender ? (
                  <aside className="inbox-context" id={`${id}-sender`} aria-label={text.sender}>
                    <Panel tone="quiet">
                      <Panel.Header>
                        <Heading level={2} size="md">
                          {text.about}
                        </Heading>
                      </Panel.Header>
                      <Panel.Body>
                        <Grid layout="stack">
                          <Text>{selected.sender}</Text>
                          <Text size="sm">{selected.address}</Text>
                          <Text tone="muted">{selected.context}</Text>
                        </Grid>
                      </Panel.Body>
                    </Panel>
                  </aside>
                ) : null}
              </Split>
            </Grid>
          ) : (
            <Panel className="inbox-placeholder" tone="quiet">
              <Panel.Body>
                <Heading level={2}>{text.choose}</Heading>
                <Text tone="muted">{text.chooseHint}</Text>
              </Panel.Body>
            </Panel>
          )}
        </div>
      </div>
      <div role="status" className="kb-sr-only">
        <span key={notice.id}>{notice.text}</span>
      </div>
    </Container>
  );
}
