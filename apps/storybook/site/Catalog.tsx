import entries from "virtual:kbui-catalog";
import { Button, Card, Checkbox, Input, RadioGroup } from "@kbui/react";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import type { ApiBlock, CatalogEntry, CatalogGroup } from "../catalog/types";
import { CatalogComparisonPreview } from "./CatalogComparison";
import { StoryPreview } from "./CatalogPreview";
import { CatalogSkinControls } from "./CatalogSkinControls";
import { CodePanel } from "./CodePanel";
import {
  appearanceQuery,
  browsableStories,
  type CatalogAppearance,
  previewGlobals,
  previewLayout,
  storybookGlobals,
} from "./catalog-model";
import { defaultCatalogSkin } from "./catalog-skin";
import { LinkArrow } from "./LinkArrow";
import { SiteFrame } from "./SiteFrame";
import { readSiteTheme } from "./site-theme";

export type { CatalogAppearance } from "./catalog-model";

import { themeStyle } from "./theme-foundations";
import "./catalog.css";
import "./workspace-skin.css";

const groups = [
  "All",
  "Actions",
  "Forms",
  "Feedback",
  "Layout",
  "Typography",
] as const satisfies readonly ("All" | CatalogGroup)[];
function isChoice<T extends string>(value: string, choices: readonly T[]): value is T {
  return choices.some((choice) => choice === value);
}

function Inline({ text }: { text: string }) {
  let offset = 0;
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((part) => {
    const key = offset;
    offset += part.length;
    if (part.startsWith("`")) return <code key={key}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**"))
      return (
        <strong key={key}>
          <Inline text={part.slice(2, -2)} />
        </strong>
      );
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link?.[1] && link[2]) {
      const href = new URL(link[2], "https://github.com/KhallilB/kbui/blob/main/packages/react/");
      if (href.protocol === "https:" || href.protocol === "http:")
        return (
          <a className="catalog-doc-link" key={key} href={href.href}>
            <Inline text={link[1]} />
          </a>
        );
    }
    return part;
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

function CatalogIndex({
  appearance,
  onChoose,
}: {
  appearance: CatalogAppearance;
  onChoose: (id: string) => void;
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
      <div className="page-heading catalog-index-heading">
        <p className="page-kicker">Components</p>
        <h1>
          Find what you <em>need.</em>
        </h1>
        <p>
          Start with a component. Try a few variations, see how it behaves, and take the code into
          your app.
        </p>
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
      <div className="catalog-browser">
        <nav aria-label="Browse components" className="catalog-grid">
          {matches.map((entry) => (
            <Card key={entry.id} className="catalog-card catalog-component-item">
              <a
                href={`./?component=${entry.id}${appearanceQuery(appearance)}`}
                aria-describedby={`${id}-${entry.id}-description ${id}-${entry.id}-count`}
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
                {entry.name}
              </a>
              <span className="catalog-component-description" id={`${id}-${entry.id}-description`}>
                {entry.description}
              </span>
              <small id={`${id}-${entry.id}-count`}>
                <span>{entry.group}</span>
                <span>{browsableStories(entry).length} examples</span>
              </small>
            </Card>
          ))}
        </nav>
      </div>
      {matches.length === 0 && (
        <p className="catalog-empty" role="status">
          No matches this time. Try another name or clear your filters.
        </p>
      )}
    </>
  );
}

function CatalogDetail({
  active,
  entry,
  initialStateId,
  storybookRoot,
  onStateChange,
  appearance,
  navigationRevision = 0,
  onBrowse,
  initialCompare = false,
  onCompareChange,
}: {
  active: boolean;
  onBrowse: () => void;
  initialCompare?: boolean;
  onCompareChange: ((value: boolean) => void) | undefined;
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
  const [skin, setSkin] = useState(appearance.skin ?? defaultCatalogSkin);
  const [compare, setCompare] = useState(initialCompare);
  const [compared, setCompared] = useState(initialCompare);
  useLayoutEffect(() => {
    setCompare(initialCompare);
    if (initialCompare) setCompared(true);
  }, [initialCompare]);
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
  const requestedId =
    stateId === "components-input--with-adornments"
      ? "components-input--with-icons-and-actions"
      : stateId;
  // Theme variants left the catalog: old `--x-dark` links open `--x`, bare `--dark` the default.
  const alias = /--(?:dark|light)$/.test(requestedId ?? "")
    ? entry.defaultStoryId
    : requestedId?.replace(/-(?:dark|light)$/, "");
  const requested = entry.stories.find((story) => story.id === requestedId || story.id === alias);
  const selected =
    stories.find((story) => story.id === requestedId) ??
    stories.find((story) => story.id === alias) ??
    stories.find((story) => story.id === entry.defaultStoryId);
  if (!selected) throw new Error(`Missing default catalog story: ${entry.name}`);
  return (
    <>
      <div className="catalog-topline">
        <a
          href={appearanceQuery(appearance) ? `./?${appearanceQuery(appearance).slice(1)}` : "./"}
          className="plain-link"
          onClick={(event) => {
            if (event.button || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
              return;
            event.preventDefault();
            onBrowse();
          }}
        >
          All components
        </a>
        <a className="plain-link" href={`${storybookRoot}?path=/docs/${entry.docsId}`}>
          Full {entry.name} API
        </a>
      </div>
      <div className="page-heading catalog-detail-heading">
        <p className="page-kicker">{entry.group}</p>
        <h1 tabIndex={-1}>
          {entry.name} <em>in use.</em>
        </h1>
        <p>{entry.description}</p>
      </div>
      <section className="catalog-live" aria-labelledby={`${id}-live`}>
        <div className="catalog-section-heading">
          <div>
            <p className="page-kicker">Interactive example</p>
            <h2 id={`${id}-live`}>Get a feel for it.</h2>
          </div>
          <span className="catalog-source">Live preview</span>
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
        <Checkbox
          className="catalog-compare-control"
          label="Compare light and dark"
          checked={compare}
          onCheckedChange={(value) => {
            setCompare(value);
            if (value) setCompared(true);
            onCompareChange?.(value);
          }}
        />
        <div className="catalog-preview-panes" data-compare={compare || undefined}>
          <section
            className="catalog-preview-pane"
            data-qa-theme={compare ? "light" : undefined}
            aria-label={compare ? "Light preview" : `${entry.name} preview`}
          >
            {compare && <h3>Light</h3>}
            <StoryPreview
              active={active}
              appearance={{ ...appearance, theme: compare ? "light" : appearance.theme, skin }}
              generation={generation}
              pending={!loaded}
              status={
                failed
                  ? "Preview unavailable here. Open the example in Storybook."
                  : !loaded
                    ? slow
                      ? "Still loading. Try reloading, or open this example in Storybook."
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
          </section>
          {compared && (
            <section
              className="catalog-preview-pane"
              data-qa-theme="dark"
              hidden={!compare}
              inert={!compare}
              aria-label="Dark comparison"
            >
              <h3>Dark</h3>
              <CatalogComparisonPreview
                active={active && compare}
                entry={entry}
                story={selected}
                appearance={{ theme: "dark", skin }}
                generation={generation}
                storybookRoot={storybookRoot}
              />
            </section>
          )}
        </div>
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
        <CatalogSkinControls
          value={skin}
          onChange={setSkin}
          theme={appearance.theme}
          component={entry.name}
        />
        <CodePanel sample={selected} name={selected.name} />
      </section>
      <section className="catalog-api" aria-labelledby={`${id}-api`}>
        <div className="catalog-section-heading">
          <div>
            <p className="page-kicker">When you start building</p>
            <h2 id={`${id}-api`}>The details you need.</h2>
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
  initialAppearance = { theme: readSiteTheme() },
  onAppearanceChange,
  navigationRevision = 0,
  initialCompare = false,
  onCompareChange,
}: {
  initialCompare?: boolean;
  onCompareChange?: (value: boolean) => void;
  navigationRevision?: number;
  initialAppearance?: CatalogAppearance;
  onAppearanceChange?: (value: CatalogAppearance) => void;
  siteRoot?: string;
  storybookRoot?: string;
  componentId?: string | null;
  stateId?: string | null;
  onStateChange?: (id: string, componentId?: string) => void;
  onComponentChange?: (id: string | null, stateId?: string) => void;
}) {
  const [appearance, setAppearance] = useState(initialAppearance);
  const [selectedId, setSelectedId] = useState<string | null>(componentId);
  const [retainedId, setRetainedId] = useState<string | null>(componentId);
  const focusAfterNavigation = useRef<"index" | "detail" | null>(null);
  const indexScroll = useRef(0);
  const indexRoot = useRef<HTMLDivElement>(null);
  const detailRoot = useRef<HTMLDivElement>(null);
  const remembered = useRef(new Map<string, string>());
  useLayoutEffect(() => {
    const component = entries.find((entry) => entry.id === componentId);
    if (component) remembered.current.set(component.id, stateId ?? component.defaultStoryId);
  }, [componentId, stateId]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: History can restore same external id after local browsing.
  useLayoutEffect(() => {
    setSelectedId(componentId);
    if (componentId) setRetainedId(componentId);
  }, [componentId, navigationRevision]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: History revision restores local view/theme even when prior props were identical.
  useLayoutEffect(() => {
    setAppearance({ theme: initialAppearance.theme });
  }, [navigationRevision, initialAppearance.theme]);
  useLayoutEffect(() => {
    const target = focusAfterNavigation.current;
    if (!target) return;
    focusAfterNavigation.current = null;
    if (target === "index" && selectedId === null) {
      indexRoot.current
        ?.querySelector<HTMLAnchorElement>(`a[href*="component=${retainedId}"]`)
        ?.focus({ preventScroll: true });
      window.scrollTo({ top: indexScroll.current });
    } else if (selectedId !== null) {
      detailRoot.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    }
  }, [selectedId, retainedId]);
  const entry = entries.find((component) => component.id === (selectedId ?? retainedId));
  const detail = entry && (
    <CatalogDetail
      active={selectedId !== null}
      entry={entry}
      appearance={appearance}
      navigationRevision={navigationRevision}
      initialStateId={
        selectedId === null
          ? (remembered.current.get(entry.id) ?? stateId)
          : componentId === entry.id || onComponentChange
            ? stateId
            : (remembered.current.get(entry.id) ?? null)
      }
      storybookRoot={storybookRoot}
      onStateChange={(id) => {
        remembered.current.set(entry.id, id);
        onStateChange?.(id, entry.id);
      }}
      initialCompare={initialCompare}
      onCompareChange={onCompareChange}
      onBrowse={() => {
        focusAfterNavigation.current = "index";
        setSelectedId(null);
        onComponentChange?.(null);
      }}
    />
  );
  const choose = (id: string) => {
    indexScroll.current = window.scrollY;
    focusAfterNavigation.current = "detail";
    setRetainedId(id);
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
        <div ref={indexRoot} hidden={selectedId !== null} inert={selectedId !== null}>
          <CatalogIndex appearance={appearance} onChoose={choose} />
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
              The page theme also applies to previews, menus, and dialogs. Examples start with the
              default KBUI design.
            </p>
          </details>
        </div>
        <div
          ref={detailRoot}
          className="catalog-detail"
          hidden={selectedId === null}
          inert={selectedId === null}
        >
          {!entry && selectedId ? (
            <div className="page-heading">
              <p className="page-kicker">Components</p>
              <h1>Component not found.</h1>
              <p>That component is not in this catalog.</p>
              <a className="plain-link" href="./">
                All components
              </a>
            </div>
          ) : (
            detail
          )}
        </div>
      </main>
    </SiteFrame>
  );
}
