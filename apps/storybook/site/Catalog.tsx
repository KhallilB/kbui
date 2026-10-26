import entries from "virtual:kbui-catalog";
import { Button, Input, RadioGroup } from "@kbui/react";
import { type ReactNode, useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { ApiBlock, CatalogEntry, CatalogGroup } from "../catalog/types";
import { StoryPreview } from "./CatalogPreview";
import { CodePanel } from "./CodePanel";
import { ControlSelect } from "./ControlSelect";
import { LinkArrow } from "./LinkArrow";
import { SiteFrame } from "./SiteFrame";
import { readSiteTheme } from "./site-theme";
import { type Theme, themeStyle } from "./theme-foundations";
import "./catalog.css";
import "./workspace-skin.css";

const groups = ["All", "Actions", "Forms", "Feedback", "Layout"] as const satisfies readonly (
  | "All"
  | CatalogGroup
)[];
const views = [
  ["live", "Live browser"],
  ["directory", "Directory"],
  ["overview", "Overview"],
] as const;
const viewChoices = views.map(([value]) => value);

function isChoice<T extends string>(value: string, choices: readonly T[]): value is T {
  return choices.some((choice) => choice === value);
}

function Inline({ text }: { text: string }) {
  let offset = 0;
  return text.split(/(`[^`]+`)/g).map((part) => {
    const key = offset;
    offset += part.length;
    return part.startsWith("`") ? <code key={key}>{part.slice(1, -1)}</code> : part;
  });
}

function ApiTable({ name, block }: { name: string; block: Extract<ApiBlock, { kind: "table" }> }) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: Allow keyboard access to horizontally scrolling API columns.
    <section className="catalog-table-scroll" aria-label={`${name} API columns`} tabIndex={0}>
      <table>
        <caption>{name} API</caption>
        <thead>
          <tr>
            {block.headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => (
                <td key={block.headers[index]}>
                  <Inline text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export type CatalogAppearance = { theme: Theme; live: boolean; overview?: boolean };

function browsableStories(entry: CatalogEntry) {
  return entry.stories.filter((story) => !/(?:^|\s)(?:Dark|Light)$/.test(story.name));
}

function appearanceQuery({ theme, live, overview }: CatalogAppearance) {
  return theme === "light" && !live
    ? ""
    : `&theme=${theme}&view=${overview ? "overview" : live ? "live" : "directory"}`;
}
function previewGlobals({ theme }: CatalogAppearance) {
  return `&globals=previewTheme:${theme}`;
}
function storybookGlobals({ theme }: CatalogAppearance) {
  return `&globals=theme:${theme}`;
}

function CatalogControls({
  appearance,
  showView,
  onChange,
}: {
  appearance: CatalogAppearance;
  showView: boolean;
  onChange: (value: CatalogAppearance) => void;
}) {
  const selectedView = appearance.overview ? "overview" : appearance.live ? "live" : "directory";
  return (
    <div className="catalog-review-controls">
      {showView && (
        <RadioGroup
          label="Catalog view"
          appearance="segmented"
          value={selectedView}
          onValueChange={(value) => {
            if (!isChoice(value, viewChoices)) return;
            onChange({
              ...appearance,
              live: value !== "directory",
              overview: value === "overview",
            });
          }}
        >
          {views.map(([value, label]) => (
            <RadioGroup.Item key={value} value={value}>
              {label}
            </RadioGroup.Item>
          ))}
        </RadioGroup>
      )}
      <p>KBUI’s default design. Select any example to check its states.</p>
    </div>
  );
}

function CatalogSpecimen({
  entry,
  appearance,
  storybookRoot,
}: {
  entry: CatalogEntry;
  appearance: CatalogAppearance;
  storybookRoot: string;
}) {
  const id = useId();
  const [stateId, setStateId] = useState(entry.defaultStoryId);
  const [failed, setFailed] = useState(false);
  const markReady = useCallback(() => setFailed(false), []);
  const selected = entry.stories.find((story) => story.id === stateId) ?? entry.stories[0];
  if (!selected) return null;
  return (
    <section className="catalog-specimen" aria-labelledby={`${id}-title`}>
      <header>
        <div>
          <p className="catalog-card-group">{entry.group}</p>
          <h2 id={`${id}-title`}>{entry.name}</h2>
          <p>{entry.description}</p>
        </div>
        <a className="plain-link" href={`./?component=${entry.id}${appearanceQuery(appearance)}`}>
          {entry.name} API and code
        </a>
      </header>
      <div className="catalog-example-picker">
        <ControlSelect
          id={`${id}-state`}
          label={`${entry.name} example`}
          value={stateId}
          options={browsableStories(entry).map((story) => ({ value: story.id, label: story.name }))}
          onChange={(value) => {
            setStateId(value);
            setFailed(false);
          }}
        />
      </div>
      <div
        className="catalog-specimen-stage"
        data-theme={appearance.theme}
        style={themeStyle(appearance.theme)}
      >
        <StoryPreview
          cacheLimit={2}
          title={`${entry.name} — ${selected.name} live example`}
          src={`${storybookRoot}iframe.html?id=${selected.id}&viewMode=story${previewGlobals(appearance)}&embed=true`}
          layout={previewLayout(entry.id, selected.id)}
          expanded={false}
          appearance={appearance}
          onLoad={markReady}
          onError={() => setFailed(true)}
        />
      </div>
      {failed && <p role="status">Preview unavailable. Open the example in Storybook.</p>}
      <a
        className="plain-link"
        href={`${storybookRoot}?path=/story/${selected.id}${storybookGlobals(appearance)}`}
      >
        Open {entry.name} example in Storybook <LinkArrow />
      </a>
    </section>
  );
}

function CatalogIndex({
  appearance,
  storybookRoot,
  selectedId,
  onChoose,
  detail,
}: {
  appearance: CatalogAppearance;
  storybookRoot: string;
  selectedId: string;
  onChoose: (id: string) => void;
  detail: ReactNode;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<(typeof groups)[number]>("All");
  const query = search.trim().toLowerCase();
  const matches = entries.filter(
    (entry) =>
      (group === "All" || entry.group === group) &&
      `${entry.name} ${entry.description}`.toLowerCase().includes(query),
  );
  return (
    <>
      <div className="page-heading">
        <p className="page-kicker">Components</p>
        <h1>
          Find your next <em>piece.</em>
        </h1>
        <p>{entries.length} components. Pick one, try its states, and see how to use it.</p>
      </div>
      <div className="catalog-filters">
        <Input
          className="catalog-search"
          id={`${id}-search`}
          type="search"
          ref={input}
          label="Search components"
          placeholder="Button, Dialog, Progress…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          startContent={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="m10.5 10.5 3 3" />
            </svg>
          }
          endContent={
            search && (
              <Button
                variant="ghost"
                size="sm"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  input.current?.focus();
                }}
              >
                ×
              </Button>
            )
          }
        />
        <RadioGroup
          className="catalog-groups"
          label="Filter by use"
          appearance="segmented"
          value={group}
          onValueChange={(value) => {
            if (isChoice(value, groups)) setGroup(value);
          }}
        >
          {groups.map((value) => (
            <RadioGroup.Item key={value} value={value}>
              {value}
            </RadioGroup.Item>
          ))}
        </RadioGroup>
      </div>
      <div className="catalog-results">
        <p role="status" aria-label="Catalog results">
          {matches.length} of {entries.length} components
        </p>
        {(search || group !== "All") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setGroup("All");
              input.current?.focus();
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
      {appearance.live && !appearance.overview ? (
        <div className="catalog-browser">
          <nav aria-label="Browse components" className="catalog-component-list">
            {matches.map((entry) => (
              <a
                key={entry.id}
                href={`./?component=${entry.id}${appearanceQuery(appearance)}`}
                aria-current={entry.id === selectedId ? "page" : undefined}
                onClick={(event) => {
                  if (
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.altKey ||
                    event.shiftKey
                  )
                    return;
                  event.preventDefault();
                  onChoose(entry.id);
                }}
              >
                <span>{entry.name}</span>
                <small aria-hidden="true">{entry.group}</small>
              </a>
            ))}
          </nav>
          <div className="catalog-inspector">{detail}</div>
        </div>
      ) : (
        <div className={appearance.overview ? "catalog-specimens" : "catalog-grid"}>
          {matches.map((entry) =>
            appearance.overview ? (
              <CatalogSpecimen
                key={entry.id}
                entry={entry}
                appearance={appearance}
                storybookRoot={storybookRoot}
              />
            ) : (
              <a
                key={entry.id}
                className="catalog-card"
                href={`./?component=${entry.id}${appearanceQuery(appearance)}`}
              >
                <span className="catalog-card-group">{entry.group}</span>
                <h2>
                  {entry.name}
                  <LinkArrow />
                </h2>
                <p>{entry.description}</p>
                <span className="catalog-card-count">
                  {browsableStories(entry).length} live examples
                </span>
              </a>
            ),
          )}
        </div>
      )}
      {matches.length === 0 && (
        <p className="catalog-empty" role="status">
          No components found. Try another name or clear the filters.
        </p>
      )}
    </>
  );
}

function previewLayout(component: string, _story: string) {
  if (component === "dialog") return { width: 800, minimum: 360 };
  if (component === "menu") return { width: 520, minimum: 240 };
  if (component === "tooltip") return { width: 520, minimum: 160 };
  if (component === "select") return { width: 1120, minimum: 240 };
  if (component === "grid") return { width: 1120, minimum: 160 };
  if (component === "panel") return { width: 1120, minimum: 160 };
  if (["input", "card", "callout", "progress", "scrollarea"].includes(component))
    return { width: 1120, minimum: 96 };
  return { width: 520, minimum: 96 };
}

function CatalogDetail({
  entry,
  initialStateId,
  storybookRoot,
  onStateChange,
  appearance,
  navigationRevision = 0,
  embedded = false,
}: {
  embedded?: boolean;
  appearance: CatalogAppearance;
  navigationRevision?: number;
  entry: CatalogEntry;
  initialStateId: string | null;
  storybookRoot: string;
  onStateChange: ((id: string) => void) | undefined;
}) {
  const id = useId();
  const [stateId, setStateId] = useState(initialStateId ?? entry.defaultStoryId);
  const [generation, setGeneration] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const compactOnReady = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: History restoration can repeat same URL state without remounting retained documents.
  useLayoutEffect(() => {
    const next = initialStateId ?? entry.defaultStoryId;
    setStateId(next);
    setLoaded(false);
    setSlow(false);
    setFailed(false);
    compactOnReady.current = true;
  }, [initialStateId, entry.defaultStoryId, navigationRevision]);
  const markReady = useCallback(() => {
    setLoaded(true);
    if (compactOnReady.current) {
      compactOnReady.current = false;
      setExpanded(false);
    }
  }, []);
  const markSlow = useCallback(() => setSlow(true), []);
  const stories = browsableStories(entry);
  const requested = entry.stories.find((story) => story.id === stateId);
  const alias = requested?.name.replace(/(?:^|\s)(?:Dark|Light)$/, "").trim();
  const selected =
    stories.find((story) => story.id === stateId) ??
    stories.find((story) => story.name === alias) ??
    stories.find((story) => story.id === entry.defaultStoryId);
  if (!selected) throw new Error(`Missing default catalog story: ${entry.name}`);
  const notes = entry.api.filter((block) => block.kind !== "table");
  return (
    <>
      <div className="catalog-topline">
        {!embedded && (
          <a
            href={appearanceQuery(appearance) ? `./?${appearanceQuery(appearance).slice(1)}` : "./"}
            className="plain-link"
          >
            All components
          </a>
        )}
        <a className="plain-link" href={`${storybookRoot}?path=/docs/${entry.docsId}`}>
          Full {entry.name} API
        </a>
      </div>
      <div className="page-heading catalog-detail-heading">
        <p className="page-kicker">{entry.group}</p>
        {embedded ? (
          <h2>
            {entry.name} <em>in use.</em>
          </h2>
        ) : (
          <h1>
            {entry.name} <em>in use.</em>
          </h1>
        )}
        <p>{entry.description}</p>
      </div>
      {!embedded && (
        <details className="catalog-switcher">
          <summary>Change component</summary>
          <nav aria-label="Choose component">
            {entries.map((component) => (
              <a
                key={component.id}
                href={`./?component=${component.id}${appearanceQuery(appearance)}`}
                aria-current={component.id === entry.id ? "page" : undefined}
              >
                {component.name}
              </a>
            ))}
          </nav>
        </details>
      )}
      <section className="catalog-live" aria-labelledby={`${id}-live`}>
        <div className="catalog-section-heading">
          <div>
            <p className="page-kicker">Straight from Storybook</p>
            <h2 id={`${id}-live`}>Try it here.</h2>
          </div>
          <span className="catalog-source">Live · Storybook</span>
        </div>
        <RadioGroup
          className="catalog-states"
          label="Example state"
          appearance="segmented"
          value={selected.id}
          onValueChange={(value) => {
            if (
              !isChoice(
                value,
                stories.map((story) => story.id),
              ) ||
              selected.id === value
            )
              return;
            setStateId(value);
            compactOnReady.current = true;
            setLoaded(false);
            setSlow(false);
            setFailed(false);
            onStateChange?.(value);
          }}
        >
          {stories.map((story) => (
            <RadioGroup.Item key={story.id} value={story.id}>
              {story.name}
            </RadioGroup.Item>
          ))}
        </RadioGroup>
        {!requested && <p role="status">State not found. Choose one of the available examples.</p>}
        <StoryPreview
          appearance={appearance}
          generation={generation}
          pending={!loaded}
          status={
            failed
              ? "Preview unavailable here. Open the example in Storybook."
              : !loaded
                ? slow
                  ? "Taking longer than expected. Reload the preview or open it in Storybook."
                  : "Loading live example…"
                : ""
          }
          layout={previewLayout(entry.id, selected.id)}
          expanded={expanded}
          title={`${entry.name} — ${selected.name} live example`}
          src={`${storybookRoot}iframe.html?id=${encodeURIComponent(selected.id)}&viewMode=story${previewGlobals(appearance)}&embed=true`}
          onLoad={markReady}
          onSlow={markSlow}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
        />
        <div className="catalog-preview-actions">
          <a
            className="plain-link"
            href={`${storybookRoot}?path=/story/${selected.id}${storybookGlobals(appearance)}`}
          >
            Open example in Storybook
          </a>
          <div className="catalog-preview-tools">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={expanded}
              onClick={() => {
                compactOnReady.current = false;
                setExpanded((value) => !value);
              }}
            >
              {expanded ? "Compact preview" : "Expand preview"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setLoaded(false);
                setSlow(false);
                setFailed(false);
                setGeneration((value) => value + 1);
              }}
            >
              Reload preview
            </Button>
          </div>
        </div>
        <CodePanel sample={selected} name={selected.name} />
      </section>
      <section className="catalog-api" aria-labelledby={`${id}-api`}>
        <div className="catalog-section-heading">
          <div>
            <p className="page-kicker">The essentials</p>
            <h2 id={`${id}-api`}>API at a glance.</h2>
          </div>
          <a
            className="plain-link"
            href={`https://github.com/KhallilB/kbui/blob/main/packages/react/README.md#${entry.apiHeading.toLowerCase().replaceAll(" ", "-")}`}
          >
            React guide <LinkArrow />
          </a>
        </div>
        {entry.api
          .filter((block) => block.kind === "table")
          .map((block) => (
            <ApiTable key={block.headers.join("|")} name={entry.name} block={block} />
          ))}
        {notes.length > 0 && (
          <details
            className="catalog-notes"
            open={!entry.api.some((block) => block.kind === "table")}
          >
            <summary>Usage notes and examples</summary>
            <div>
              {notes.map((block) =>
                block.kind === "code" ? (
                  <pre key={block.text}>
                    <code>{block.text}</code>
                  </pre>
                ) : (
                  <p key={block.text}>
                    <Inline text={block.text} />
                  </p>
                ),
              )}
            </div>
          </details>
        )}
      </section>
    </>
  );
}

export function Catalog({
  siteRoot = "../",
  storybookRoot = "../storybook/",
  componentId = null,
  stateId = null,
  onStateChange,
  onComponentChange,
  initialAppearance = { theme: readSiteTheme(), live: true },
  onAppearanceChange,
  navigationRevision = 0,
}: {
  navigationRevision?: number;
  initialAppearance?: CatalogAppearance;
  onAppearanceChange?: (value: CatalogAppearance) => void;
  siteRoot?: string;
  storybookRoot?: string;
  componentId?: string | null;
  stateId?: string | null;
  onStateChange?: (id: string, componentId?: string) => void;
  onComponentChange?: (id: string, stateId?: string) => void;
}) {
  const [appearance, setAppearance] = useState(initialAppearance);
  const [selectedId, setSelectedId] = useState(componentId ?? entries[0]?.id ?? "button");
  const remembered = useRef(new Map<string, string>());
  useLayoutEffect(() => {
    const component = entries.find((entry) => entry.id === componentId);
    if (component) remembered.current.set(component.id, stateId ?? component.defaultStoryId);
  }, [componentId, stateId]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: History can restore same external id after local browsing.
  useLayoutEffect(() => {
    setSelectedId(componentId ?? entries[0]?.id ?? "button");
  }, [componentId, navigationRevision]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: History revision restores local view/theme even when prior props were identical.
  useLayoutEffect(() => {
    setAppearance({
      theme: initialAppearance.theme,
      live: initialAppearance.live,
      overview: initialAppearance.overview ?? false,
    });
  }, [
    navigationRevision,
    initialAppearance.theme,
    initialAppearance.live,
    initialAppearance.overview,
  ]);
  const entry = entries.find((component) => component.id === selectedId);
  const detail = entry && (
    <CatalogDetail
      entry={entry}
      appearance={appearance}
      navigationRevision={navigationRevision}
      initialStateId={
        componentId === entry.id || onComponentChange
          ? stateId
          : (remembered.current.get(entry.id) ?? null)
      }
      storybookRoot={storybookRoot}
      onStateChange={(id) => {
        remembered.current.set(entry.id, id);
        onStateChange?.(id, entry.id);
      }}
      embedded={appearance.live && !appearance.overview}
    />
  );
  const choose = (id: string) => {
    setSelectedId(id);
    onComponentChange?.(id, remembered.current.get(id));
  };
  return (
    <SiteFrame
      current="components"
      className="kbui-catalog"
      theme={appearance.theme}
      onThemeChange={(theme) => {
        const value = { ...appearance, theme };
        setAppearance(value);
        onAppearanceChange?.(value);
      }}
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
    >
      <main id="main" className="inner-page">
        <CatalogControls
          showView={!componentId || appearance.live}
          appearance={appearance}
          onChange={(value) => {
            setAppearance(value);
            onAppearanceChange?.(value);
          }}
        />
        {!componentId && (
          <details className="catalog-foundations">
            <summary>Typography and theme foundations</summary>
            <section
              aria-label="Typography and surfaces"
              className="skin-surface type-specimen"
              data-theme={appearance.theme}
              style={themeStyle(appearance.theme)}
            >
              <div className="type-specimen-copy">
                <span className="type-eyebrow">A calmer reading rhythm</span>
                <h2>Clear at every scale.</h2>
                <p>
                  Good interfaces make room for the words that matter. Comfortable text, clear
                  labels and a steady rhythm help you move with confidence.
                </p>
                <p>
                  Keep <strong>important details</strong> distinct, and let supporting text stay
                  quiet without disappearing.
                </p>
                <small>Helpful context stays easy to read.</small>
                <p className="type-sample-meta">
                  Deployment <code>RUN-1048</code> · <strong>04:12</strong> elapsed
                </p>
              </div>
              <section className="type-surface-map" aria-label="Surface hierarchy">
                <span>Canvas</span>
                <span>Surface</span>
                <span>Raised</span>
                <span>Input well</span>
              </section>
            </section>
            <p className="catalog-foundations-note">
              Theme applies to this page and every preview, including overlays. All examples use the
              default KBUI design.
            </p>
          </details>
        )}
        {!entry && componentId ? (
          <div className="page-heading">
            <p className="page-kicker">Components</p>
            <h1>Component not found.</h1>
            <p>That component is not in this catalog.</p>
            <a className="plain-link" href="./">
              All components
            </a>
          </div>
        ) : !componentId || (appearance.live && !appearance.overview) ? (
          <CatalogIndex
            appearance={appearance}
            storybookRoot={storybookRoot}
            selectedId={selectedId}
            onChoose={choose}
            detail={detail}
          />
        ) : (
          detail
        )}
      </main>
    </SiteFrame>
  );
}
