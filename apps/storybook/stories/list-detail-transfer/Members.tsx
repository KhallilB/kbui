// Internal third record type on the list-and-detail controller; not a published recipe.
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
  Text,
} from "@kb.ui/react";
import { useId, useState } from "react";
import { type CommitResult, type FlowRouter, searchParamRouter } from "../../recipes/flow-router";
import { useListDetailFlow } from "../../recipes/list-detail-controller";
import "./members.css";

const roles = ["Viewer", "Editor", "Admin"] as const;
type Role = (typeof roles)[number];
export type MemberDraft = { role: Role; team: string };
export type Member = MemberDraft & { id: string; name: string; email: string; note: string };
type Field = keyof MemberDraft & string;
type Filter = Role | "all";
// Keys outside the rendered fields can still arrive from a server.
type Errors = Partial<Record<string, string>>;
// Team leads focus order: the text field takes focus on begin and on failure.
const fields: readonly Field[] = ["team", "role"];
const isRole = (value: string | null): value is Role => roles.some((role) => role === value);
const roleOptions = roles.map((value) => ({ value, label: value }));

const text = {
  title: "Members",
  description: "Review workspace members and their access.",
  queue: "Member list",
  search: "Search members",
  filter: "Filter by role",
  allRoles: "All roles",
  count: (shown: number, total: number) => `${shown} of ${total} members`,
  list: "Members",
  unsaved: "Unsaved draft",
  noMatches: "No matching members",
  empty: "No members yet",
  clear: "Clear filters",
  back: "Back to members",
  showContext: "Show context",
  hideContext: "Hide context",
  begin: "Change access",
  context: "Member context",
  email: "Email",
  note: "Note",
  unavailable: "Member unavailable",
  unavailableHint: "This member is missing from the current list.",
  choose: "Choose a member",
  loading: "Loading members…",
  editor: "Change access",
  review: "Review the marked fields before saving.",
  teamLabel: "Team",
  roleLabel: "Role",
  teamRequired: "Enter a team.",
  save: "Save access",
  saving: "Saving access…",
  cancel: "Cancel changes",
  failed: "Access could not be saved. Your draft is safe; try again.",
};

const sampleMembers: Member[] = [
  {
    id: "MEM-201",
    name: "Ana Lima",
    email: "ana@example.com",
    role: "Admin",
    team: "Platform",
    note: "Owns workspace billing and sign-in settings.",
  },
  {
    id: "MEM-202",
    name: "Ben Okafor",
    email: "ben@example.com",
    role: "Editor",
    team: "Design",
    note: "Maintains the shared component library.",
  },
  {
    id: "MEM-203",
    name: "Chloe Martin",
    email: "chloe@example.com",
    role: "Viewer",
    team: "Support",
    note: "Reads incident reports during weekend cover.",
  },
];

/** Team members queue: role and team edits through the shared controller. */
export function Members({
  members = sampleMembers,
  initialMemberId = null,
  loading = false,
  router: routerProp,
  commit = async () => {},
  landmark = true,
  header = true,
}: {
  members?: Member[] | undefined;
  initialMemberId?: string | null | undefined;
  loading?: boolean | undefined;
  router?: FlowRouter | undefined;
  commit?: ((id: string, draft: MemberDraft) => Promise<CommitResult<Field>>) | undefined;
  landmark?: boolean | undefined;
  header?: boolean | undefined;
}) {
  const [fallbackRouter] = useState(() => searchParamRouter("member"));
  const [showContext, setShowContext] = useState(false);
  const id = useId();
  const flow = useListDetailFlow<Member, MemberDraft, Field, Filter>({
    records: members,
    initialId: initialMemberId,
    loading,
    router: routerProp ?? fallbackRouter,
    fields,
    begin: (member) => ({ role: member.role, team: member.team }),
    normalize: (draft) => ({ ...draft, team: draft.team.trim() }),
    validate: (draft): Errors => (draft.team ? {} : { team: text.teamRequired }),
    commit,
    view: (member, committed) => ({ ...member, ...committed[committed.length - 1] }),
    matches: (member, query, filter) =>
      (filter === "all" || member.role === filter) &&
      `${member.id} ${member.name} ${member.email} ${member.team}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    defaultFilter: "all",
    notices: {
      saving: (member) => `Saving ${member.name}.`,
      saved: (member) => `${member.name} saved.`,
      failed: (member) => `${member.name} could not be saved. Draft kept.`,
      invalid: (member, errors) =>
        fields.some((field) => errors[field])
          ? `${member.name} needs changes before saving.`
          : `${member.name} was not saved.`,
      discarded: (member) => `${member.name} draft discarded.`,
    },
  });
  const { selected, draft } = flow;

  const notice = (
    <Text role="status" size="sm" tone="muted" className="members-notice">
      <span key={flow.notice.id}>{flow.notice.text}</span>
    </Text>
  );

  return (
    <Container
      {...flow.root}
      // Container types `as` per element; main and div share every prop used here.
      as={(landmark ? "main" : "div") as "main"}
      size="full"
      gutter={false}
      className="members"
    >
      {header ? (
        <PageHeader title={text.title} size="sm" description={text.description} meta={notice} />
      ) : (
        <div className="kb-sr-only">{notice}</div>
      )}
      <div
        className="members-layout"
        data-selected={flow.selectedId !== null ? "true" : "false"}
        aria-busy={loading || undefined}
      >
        <Panel className="members-list" aria-labelledby={`${id}-queue`}>
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
                onChange={(event) => flow.setQuery(event.target.value)}
              />
              <Select
                label={text.filter}
                value={flow.filter}
                onValueChange={(value) => flow.setFilter(isRole(value) ? value : null)}
                options={[{ value: "all", label: text.allRoles }, ...roleOptions]}
              />
              <Text size="sm" tone="muted" aria-live="polite">
                {/* Counts that change while loading would each be announced. */}
                {loading ? text.loading : text.count(flow.visible.length, flow.records.length)}
              </Text>
              {loading && !flow.records.length ? null : flow.visible.length ? (
                <ul className="members-items" aria-label={text.list}>
                  {flow.visible.map((member) => (
                    <li key={member.id}>
                      <Button
                        variant="ghost"
                        className="members-row"
                        aria-current={flow.selectedId === member.id ? "true" : undefined}
                        ref={flow.refs.row(member.id)}
                        onClick={() => flow.open(member.id)}
                      >
                        <Text as="span" size="sm" tone="muted">
                          {member.id}
                        </Text>
                        <Text as="span" className="members-name">
                          {member.name}
                        </Text>
                        <span className="members-meta">
                          <Text as="span" size="sm" tone="muted">
                            {member.role}
                          </Text>
                          <Text as="span" size="sm" tone="muted">
                            {member.team}
                          </Text>
                        </span>
                        {flow.hasDraft(member.id) && (
                          <Text as="span" size="sm" tone="muted">
                            {text.unsaved}
                          </Text>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <Heading level={3} size="md">
                  {flow.records.length ? text.noMatches : text.empty}
                </Heading>
              )}
              {flow.filtersActive && (
                <Button variant="secondary" onClick={flow.clearFilters}>
                  {text.clear}
                </Button>
              )}
            </Grid>
          </Panel.Body>
        </Panel>
        <div className="members-workspace">
          {flow.waiting ? (
            <Panel tone="sunken">
              <Panel.Body>
                <Text tone="muted">{text.loading}</Text>
              </Panel.Body>
            </Panel>
          ) : flow.selectedId === null ? (
            <Panel tone="sunken">
              <Panel.Body>
                <Heading level={2}>{text.choose}</Heading>
              </Panel.Body>
            </Panel>
          ) : selected ? (
            <Panel className="members-detail" aria-labelledby={`${id}-detail`}>
              <Panel.Header>
                <Grid layout="stack">
                  <Inline gap="sm">
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
                  <Heading ref={flow.refs.heading} tabIndex={-1} level={2} id={`${id}-detail`}>
                    {selected.name}
                  </Heading>
                  <dl className="members-facts">
                    <dt>{text.roleLabel}</dt>
                    <dd>{selected.role}</dd>
                    <dt>{text.teamLabel}</dt>
                    <dd>{selected.team}</dd>
                  </dl>
                </Grid>
              </Panel.Header>
              <Panel.Body>
                <Grid layout="stack">
                  {draft ? (
                    <form
                      noValidate
                      onSubmit={(event) => {
                        event.preventDefault();
                        flow.submit();
                      }}
                    >
                      <Grid layout="stack">
                        <FormSection
                          title={text.editor}
                          headingLevel={3}
                          error={
                            flow.unrendered.length
                              ? flow.unrendered.join(" ")
                              : Object.keys(flow.errors).length
                                ? text.review
                                : undefined
                          }
                        >
                          <Input
                            ref={flow.refs.field("team")}
                            label={text.teamLabel}
                            name="team"
                            required
                            disabled={flow.pending}
                            value={draft.team}
                            onChange={(event) =>
                              flow.change({ ...draft, team: event.target.value })
                            }
                            {...(flow.errors.team ? { error: flow.errors.team } : {})}
                          />
                          <Select
                            ref={flow.refs.field("role")}
                            label={text.roleLabel}
                            value={draft.role}
                            options={roleOptions}
                            disabled={flow.pending}
                            onValueChange={(role) => {
                              if (isRole(role)) flow.change({ ...draft, role });
                            }}
                            {...(flow.errors.role ? { error: flow.errors.role } : {})}
                          />
                        </FormSection>
                        {flow.failed ? <Callout tone="danger">{text.failed}</Callout> : null}
                        <Inline gap="sm">
                          <Button ref={flow.refs.submit} type="submit" disabled={flow.pending}>
                            {flow.pending ? text.saving : text.save}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={flow.pending}
                            onClick={flow.discard}
                          >
                            {text.cancel}
                          </Button>
                        </Inline>
                      </Grid>
                    </form>
                  ) : (
                    <div>
                      <Button ref={flow.refs.begin} variant="secondary" onClick={flow.begin}>
                        {text.begin}
                      </Button>
                    </div>
                  )}
                  {showContext && (
                    <Container
                      as="aside"
                      size="full"
                      gutter={false}
                      className="members-context"
                      aria-label={text.context}
                      id={`${id}-context`}
                    >
                      <dl>
                        <dt>{text.email}</dt>
                        <dd>{selected.email}</dd>
                        <dt>{text.note}</dt>
                        <dd>{selected.note}</dd>
                      </dl>
                    </Container>
                  )}
                </Grid>
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
        </div>
      </div>
    </Container>
  );
}
