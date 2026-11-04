// kbui recipe Inbox · needs @kb.ui/react ≥ 0.12.0 · https://kbui.kcb.pro/recipes/?recipe=inbox
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
import { useId, useState } from "react";
import { type CommitResult, type FlowRouter, searchParamRouter } from "./flow-router";
import "./inbox.css";
import { useListDetailFlow } from "./list-detail-controller";

export type { CommitResult } from "./flow-router";

/** A reply saved on the server; `author` defaults to the signed-in user. */
export type InboxReply = { id: string; body: string; author?: string | undefined };
export type InboxThread = {
  id: string;
  sender: string;
  address: string;
  subject: string;
  date: string;
  excerpt: string;
  paragraphs: string[];
  context: string;
  replies?: InboxReply[] | undefined;
};
export type ReplyDraft = { body: string };
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
  sentReply: (position: number, author?: string) =>
    author ? `Reply ${position} from ${author}` : `Your reply ${position}`,
  sentHeading: "You",
  reply: "Reply",
  form: "Reply to sender",
  field: "Your reply",
  required: "Write a reply before sending.",
  send: "Send reply",
  sending: "Sending reply…",
  discard: "Discard draft",
  /** Empty hides the note. */
  sessionNote: "",
  failed: "Reply could not be sent. Your draft is safe; try again.",
  sender: "Sender details",
  about: "About the sender",
  choose: "Choose a message",
  chooseHint: "Select a message from the inbox to read it or write a reply.",
  loading: "Loading messages…",
  sendingNotice: (sender: string) => `Sending reply to ${sender}.`,
  sentNotice: (subject: string) => `Reply added to ${subject}.`,
  failedNotice: (sender: string) => `Reply to ${sender} failed. Draft retained.`,
  invalidNotice: (sender: string, errors: Errors) =>
    errors.body
      ? `Reply to ${sender} needs changes before sending.`
      : `Reply to ${sender} was not sent.`,
  discardedNotice: "Draft discarded.",
};
type Copy = typeof inboxCopy;
// Only true of the in-memory default `commit`.
const sessionCopy: Partial<Copy> = {
  sessionNote: "Replies stay in this session. Reload clears drafts and replies.",
  sentNotice: (subject) => `Reply added to ${subject} for this session.`,
  sentHeading: "You · Session reply",
};

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

const fields = ["body"] as const;
type Field = (typeof fields)[number];

/** Application-owned correspondence; routing and reply delivery go through its seams. */
export function Inbox({
  threads = sampleThreads,
  initialThreadId = null,
  loading = false,
  router: routerProp,
  commit: commitProp,
  validate: validateProp,
  copy,
  landmark = true,
  header = true,
}: {
  threads?: InboxThread[] | undefined;
  initialThreadId?: string | null | undefined;
  /** Records are still arriving: no unavailable or empty state yet. */
  loading?: boolean | undefined;
  router?: FlowRouter | undefined;
  commit?: ((id: string, draft: ReplyDraft) => Promise<CommitResult<"body">>) | undefined;
  validate?: ((draft: ReplyDraft) => Partial<Record<"body", string>>) | undefined;
  copy?: Partial<Copy> | undefined;
  /** False inside an app shell that already has a `<main>`. */
  landmark?: boolean | undefined;
  /** False inside an app shell that already has the page `<h1>`. */
  header?: boolean | undefined;
}) {
  const text = { ...inboxCopy, ...(commitProp ? {} : sessionCopy), ...copy };
  const [fallbackRouter] = useState(() => searchParamRouter("message"));
  const [showSender, setShowSender] = useState(false);
  const id = useId();
  const flow = useListDetailFlow<InboxThread, ReplyDraft, Field, null>({
    records: threads,
    initialId: initialThreadId,
    loading,
    router: routerProp ?? fallbackRouter,
    fields,
    begin: () => ({ body: "" }),
    normalize: (draft) => ({ body: draft.body.trim() }),
    validate: validateProp ?? ((draft): Errors => (draft.body ? {} : { body: text.required })),
    commit: commitProp ?? (async () => {}),
    // Sent replies show until the prop sends a new object for that thread.
    view: (thread, committed) => ({
      ...thread,
      replies: [
        ...(thread.replies ?? []),
        ...committed.map((draft, index) => ({ id: `local-${index}`, body: draft.body })),
      ],
    }),
    matches: (thread, query) =>
      `${thread.sender} ${thread.subject} ${thread.excerpt}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    defaultFilter: null,
    notices: {
      saving: (thread) => text.sendingNotice(thread.sender),
      saved: (thread) => text.sentNotice(thread.subject),
      failed: (thread) => text.failedNotice(thread.sender),
      invalid: (thread, errors) => text.invalidNotice(thread.sender, errors),
      discarded: () => text.discardedNotice,
    },
  });
  const { selected, draft } = flow;
  const error = flow.errors.body;

  return (
    <Container
      {...flow.root}
      // Container types `as` per element; main and div share every prop used here.
      as={(landmark ? "main" : "div") as "main"}
      size="full"
      gutter={false}
      className="inbox-flow"
    >
      {header ? (
        <PageHeader
          title={text.title}
          description={text.description}
          meta={
            <Text size="sm" tone="muted">
              {text.meta}
            </Text>
          }
        />
      ) : null}
      <div
        className="inbox-layout"
        data-selected={flow.selectedId !== null}
        aria-busy={loading || undefined}
      >
        <Panel className="inbox-list" tone="quiet" aria-labelledby={`${id}-inbox`}>
          <Panel.Header>
            <Heading id={`${id}-inbox`} level={2} size="md">
              {text.inbox} <span className="inbox-count">{threads.length}</span>
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <Grid layout="stack">
              <Input
                ref={flow.refs.search}
                type="search"
                label={text.search}
                value={flow.query}
                onChange={(event) => flow.setQuery(event.target.value)}
              />
              <Text size="sm" tone="muted" aria-live="polite">
                {/* Counts that change while loading would each be announced. */}
                {loading ? text.loading : text.count(flow.visible.length, threads.length)}
              </Text>
              {loading && !threads.length ? null : flow.visible.length ? (
                <ul className="inbox-rows" aria-label={text.list}>
                  {flow.visible.map((thread) => (
                    <li key={thread.id}>
                      <Button
                        variant="ghost"
                        className="inbox-row"
                        aria-current={flow.selectedId === thread.id ? "true" : undefined}
                        ref={flow.refs.row(thread.id)}
                        onClick={() => flow.open(thread.id)}
                      >
                        <span className="inbox-sender">{thread.sender}</span>
                        <span className="inbox-subject">{thread.subject}</span>
                        <span className="inbox-excerpt">{thread.excerpt}</span>
                        <span className="inbox-date">
                          {thread.date}
                          {flow.hasDraft(thread.id) ? text.draft : ""}
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
              {flow.filtersActive ? (
                <Button variant="secondary" onClick={flow.clearFilters}>
                  {text.clear}
                </Button>
              ) : null}
            </Grid>
          </Panel.Body>
        </Panel>
        <div className="inbox-workspace">
          {flow.waiting ? (
            <Panel className="inbox-placeholder" tone="quiet">
              <Panel.Body>
                <Text tone="muted">{text.loading}</Text>
              </Panel.Body>
            </Panel>
          ) : flow.selectedId !== null ? (
            <Grid layout="stack">
              <Inline justify="between">
                <Button variant="secondary" onClick={flow.back}>
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
                    <Grid layout="stack" gap="sm">
                      <Text size="sm" tone="muted">
                        {selected ? `${selected.sender} · ${selected.date}` : text.unavailableMeta}
                      </Text>
                      <Heading ref={flow.refs.heading} tabIndex={-1} id={`${id}-subject`} level={2}>
                        {selected?.subject ?? text.unavailable}
                      </Heading>
                    </Grid>
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
                        {(selected.replies ?? []).map((reply, index) => (
                          <article
                            key={reply.id}
                            aria-label={text.sentReply(index + 1, reply.author)}
                            className="inbox-sent"
                          >
                            <Heading level={3} size="sm">
                              {reply.author ?? text.sentHeading}
                            </Heading>
                            <p>{reply.body}</p>
                          </article>
                        ))}
                        {draft === undefined ? (
                          <div>
                            <Button ref={flow.refs.begin} onClick={flow.begin}>
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
                              flow.submit();
                            }}
                          >
                            <Grid layout="stack">
                              <Textarea
                                ref={flow.refs.field("body")}
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
                                value={draft.body}
                                disabled={flow.pending}
                                error={error}
                                aria-invalid={Boolean(error)}
                                onChange={(event) => flow.change({ body: event.target.value })}
                              />
                              {flow.failed || flow.unrendered.length ? (
                                <Callout tone="danger" className="inbox-status">
                                  {flow.failed ? text.failed : flow.unrendered.join(" ")}
                                </Callout>
                              ) : null}
                              <Inline>
                                <Button
                                  ref={flow.refs.submit}
                                  type="submit"
                                  disabled={flow.pending}
                                >
                                  {flow.pending ? text.sending : text.send}
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  disabled={flow.pending}
                                  onClick={flow.discard}
                                >
                                  {text.discard}
                                </Button>
                              </Inline>
                              {text.sessionNote ? (
                                <Text size="sm" tone="muted">
                                  {text.sessionNote}
                                </Text>
                              ) : null}
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
        <span key={flow.notice.id}>{flow.notice.text}</span>
      </div>
    </Container>
  );
}
