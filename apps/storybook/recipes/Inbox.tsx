import {
  Button,
  Container,
  Grid,
  Heading,
  Inline,
  Input,
  Panel,
  Split,
  Text,
  Textarea,
} from "@kb.ui/react";
import { useEffect, useId, useRef, useState } from "react";
import { PageHeader } from "./PageHeader";
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

const letters: InboxThread[] = [
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

type Delivery = { status: "pending" } | { status: "error"; error: string };

// An empty `?message=` is no selection.
function messageParam() {
  return new URL(window.location.href).searchParams.get("message") || null;
}

/** Application-owned correspondence; routing and reply delivery stay local. */
export function Inbox({
  initialThreads = letters,
  initialThreadId = null,
  sendReply,
}: {
  initialThreads?: InboxThread[] | undefined;
  initialThreadId?: string | null | undefined;
  sendReply?: ((id: string, body: string) => Promise<void>) | undefined;
}) {
  const [selectedId, setSelectedId] = useState(() => messageParam() ?? initialThreadId);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string | undefined>>({});
  const [replies, setReplies] = useState<
    Record<string, { id: string; body: string }[] | undefined>
  >({});
  const [delivery, setDelivery] = useState<Record<string, Delivery | undefined>>({});
  const [showSender, setShowSender] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLElement>(null);
  const focused = useRef<HTMLElement | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const replyButton = useRef<HTMLButtonElement>(null);
  const replyInput = useRef<HTMLTextAreaElement>(null);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const lastSelected = useRef(selectedId);
  const currentId = useRef(selectedId);
  const mounted = useRef(false);
  const pending = useRef(new Set<string>());
  const focusTarget = useRef<"heading" | "list" | "reply" | "input" | null>(
    selectedId !== null ? "heading" : null,
  );
  const id = useId();
  const selected = initialThreads.find((thread) => thread.id === selectedId);
  const draft = selected ? drafts[selected.id] : undefined;
  const sending = selected ? delivery[selected.id]?.status === "pending" : false;
  const state = selected ? delivery[selected.id] : undefined;
  const error = state?.status === "error" ? state.error : undefined;
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = initialThreads.filter((thread) =>
    `${thread.sender} ${thread.subject} ${thread.excerpt}`.toLowerCase().includes(normalizedQuery),
  );

  useEffect(() => {
    mounted.current = true;
    const onPopState = () => {
      const next = messageParam();
      if (currentId.current !== null) lastSelected.current = currentId.current;
      focusTarget.current = next !== null ? "heading" : "list";
      setSelectedId(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      mounted.current = false;
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    currentId.current = selectedId;
    if (focusTarget.current === "heading") heading.current?.focus();
    if (focusTarget.current === "list")
      (rows.current.get(lastSelected.current ?? "") ?? search.current)?.focus();
    if (focusTarget.current === "reply") replyButton.current?.focus();
    if (focusTarget.current === "input") replyInput.current?.focus();
    focusTarget.current = null;
  });

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
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("message", next);
    else url.searchParams.delete("message");
    window.history.pushState(window.history.state, "", url);
    focusTarget.current = next !== null ? "heading" : "list";
    setSelectedId(next);
  }

  async function submitReply() {
    if (!selected || pending.current.has(selected.id)) return;
    const thread = selected;
    const body = (drafts[thread.id] ?? "").trim();
    if (!body) {
      setDelivery((current) => ({
        ...current,
        [thread.id]: { status: "error", error: "Write a reply before sending." },
      }));
      replyInput.current?.focus();
      return;
    }
    pending.current.add(thread.id);
    // Sending disables the focused submit; keep focus in the letter.
    focusTarget.current = "heading";
    setDelivery((current) => ({ ...current, [thread.id]: { status: "pending" } }));
    setAnnouncement(`Sending reply to ${thread.sender}.`);
    try {
      await sendReply?.(thread.id, body);
      if (!mounted.current) return;
      const reply = { id: crypto.randomUUID(), body };
      setReplies((current) => ({
        ...current,
        [thread.id]: [...(current[thread.id] ?? []), reply],
      }));
      setDrafts((current) => ({ ...current, [thread.id]: undefined }));
      setDelivery((current) => ({ ...current, [thread.id]: undefined }));
      setAnnouncement(`Reply added to ${thread.subject} for this session.`);
      if (currentId.current === thread.id) focusTarget.current = "reply";
    } catch {
      if (!mounted.current) return;
      setDelivery((current) => ({
        ...current,
        [thread.id]: {
          status: "error",
          error: "Reply could not be sent. Your draft is safe; try again.",
        },
      }));
      setAnnouncement(`Reply to ${thread.sender} failed. Draft retained.`);
      if (currentId.current === thread.id) focusTarget.current = "input";
    } finally {
      pending.current.delete(thread.id);
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
        title="Correspondence"
        description="Read and reply to contributor messages."
        metadata={
          <Text size="sm" tone="muted">
            Fieldwork · Editorial desk · Demo
          </Text>
        }
      />
      <div className="inbox-layout" data-selected={selectedId !== null}>
        <Panel className="inbox-index" tone="quiet" aria-labelledby={`${id}-inbox`}>
          <Panel.Header>
            <Heading id={`${id}-inbox`} level={2} size="md">
              Inbox <span className="inbox-count">{initialThreads.length}</span>
            </Heading>
          </Panel.Header>
          <Panel.Body>
            <Grid layout="stack">
              <Input
                ref={search}
                type="search"
                label="Search correspondence"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Text size="sm" tone="muted" aria-live="polite">
                {filtered.length} of {initialThreads.length} messages
              </Text>
              {filtered.length ? (
                <ul className="inbox-rows" aria-label="Messages">
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
                          {drafts[thread.id] !== undefined ? " · Draft" : ""}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  <Heading level={3}>
                    {initialThreads.length ? "No matching messages" : "No correspondence yet"}
                  </Heading>
                  <Text tone="muted">
                    {initialThreads.length
                      ? "Try a sender or a phrase from the subject."
                      : "Incoming letters will appear here."}
                  </Text>
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
                  Clear search
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
                  Back to inbox
                </Button>
                {selected ? (
                  <Button
                    variant="ghost"
                    aria-expanded={showSender}
                    aria-controls={`${id}-sender`}
                    onClick={() => setShowSender((current) => !current)}
                  >
                    {showSender ? "Hide sender details" : "Show sender details"}
                  </Button>
                ) : null}
              </Inline>
              <Split ratio="wide-start" collapse="md" align="start">
                <Panel className="inbox-letter" aria-labelledby={`${id}-subject`}>
                  <Panel.Header>
                    <Text size="sm" tone="muted">
                      {selected
                        ? `${selected.sender} · ${selected.date}`
                        : "This letter could not be found."}
                    </Text>
                    <Heading ref={heading} tabIndex={-1} id={`${id}-subject`} level={2}>
                      {selected?.subject ?? "Message unavailable"}
                    </Heading>
                  </Panel.Header>
                  {selected ? (
                    <Panel.Body>
                      <Grid layout="stack">
                        <article
                          aria-label={`Letter from ${selected.sender}`}
                          className="inbox-prose"
                        >
                          {selected.paragraphs.map((paragraph, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: Paragraph order stays fixed within each letter.
                            <p key={`${selected.id}-${index}`}>{paragraph}</p>
                          ))}
                        </article>
                        {(replies[selected.id] ?? []).map((reply, index) => (
                          <article
                            key={reply.id}
                            aria-label={`Your reply ${index + 1}`}
                            className="inbox-sent"
                          >
                            <Heading level={3} size="sm">
                              You · Session reply
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
                              Reply
                            </Button>
                          </div>
                        ) : (
                          <form
                            noValidate
                            aria-label="Reply to sender"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void submitReply();
                            }}
                          >
                            <Grid layout="stack">
                              <Textarea
                                ref={replyInput}
                                id={`${id}-reply`}
                                label="Your reply"
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
                              <Inline>
                                <Button type="submit" disabled={sending}>
                                  {sending ? "Sending reply…" : "Send reply"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  disabled={sending}
                                  onClick={() => {
                                    setDrafts((current) => ({
                                      ...current,
                                      [selected.id]: undefined,
                                    }));
                                    setDelivery((current) => ({
                                      ...current,
                                      [selected.id]: undefined,
                                    }));
                                    setAnnouncement("Draft discarded.");
                                    focusTarget.current = "reply";
                                  }}
                                >
                                  Discard draft
                                </Button>
                              </Inline>
                              <Text size="sm" tone="muted">
                                Replies stay in this session. Reload clears drafts and replies.
                              </Text>
                            </Grid>
                          </form>
                        )}
                      </Grid>
                    </Panel.Body>
                  ) : (
                    <Panel.Body>
                      <Text>Return to the inbox to choose another message.</Text>
                    </Panel.Body>
                  )}
                </Panel>
                {selected && showSender ? (
                  <aside id={`${id}-sender`} aria-label="Sender details">
                    <Panel tone="quiet">
                      <Panel.Header>
                        <Heading level={2} size="md">
                          About the sender
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
                <Heading level={2}>Choose a message</Heading>
                <Text tone="muted">
                  Select a message from the inbox to read it or write a reply.
                </Text>
              </Panel.Body>
            </Panel>
          )}
        </div>
      </div>
      <div role="status" className="kb-sr-only">
        {announcement}
      </div>
    </Container>
  );
}
