import entries from "virtual:kbui-catalog";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ApiBlock, CatalogEntry, CatalogGroup } from "../catalog/types";
import { CodePanel } from "./CodePanel";
import { SiteFrame } from "./SiteFrame";
import "./catalog.css";

const groups: ("All" | CatalogGroup)[] = ["All", "Actions", "Forms", "Feedback", "Layout"];

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

function CatalogIndex() {
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
        <label className="catalog-search" htmlFor={`${id}-search`}>
          Search components
          <input
            id={`${id}-search`}
            type="search"
            ref={input}
            placeholder="Button, Dialog, Progress…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <fieldset className="catalog-groups">
          <legend>Filter by use</legend>
          <div>
            {groups.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={group === value}
                onClick={() => setGroup(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="catalog-results">
        <p role="status" aria-label="Catalog results">
          {matches.length} of {entries.length} components
        </p>
        {(search || group !== "All") && (
          <button
            type="button"
            className="catalog-text-button"
            onClick={() => {
              setSearch("");
              setGroup("All");
              input.current?.focus();
            }}
          >
            Clear filters
          </button>
        )}
      </div>
      <div className="catalog-grid">
        {matches.map((entry) => (
          <a key={entry.id} className="catalog-card" href={`./?component=${entry.id}`}>
            <span className="catalog-card-group">{entry.group}</span>
            <h2>
              {entry.name}
              <span aria-hidden="true">↗</span>
            </h2>
            <p>{entry.description}</p>
            <span className="catalog-card-count">{entry.stories.length} live examples</span>
          </a>
        ))}
      </div>
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
  if (component === "grid") return { width: 1120, minimum: 96 };
  if (component === "panel") return { width: 1120, minimum: 64 };
  if (["input", "card", "callout", "progress", "scrollarea"].includes(component))
    return { width: 1120, minimum: 64 };
  return { width: 520, minimum: 64 };
}

function StoryPreview({
  src,
  title,
  layout,
  expanded,
  generation,
  pending,
  status,
  onLoad,
  onSlow,
  onError,
}: {
  src: string;
  title: string;
  layout: { width: number; minimum: number };
  expanded: boolean;
  generation: number;
  pending: boolean;
  status: string;
  onLoad: () => void;
  onSlow: () => void;
  onError: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  useEffect(() => {
    const element = frame.current;
    if (
      !element ||
      element.dataset.generation !== String(generation) ||
      element.src !== new URL(src, window.location.href).href
    )
      return;
    const timer = window.setTimeout(onSlow, 10000);
    let disconnect = () => {};
    const observe = () => {
      disconnect();
      try {
        const doc = element.contentDocument;
        const view = element.contentWindow;
        if (!doc?.body || !view || doc.URL !== element.src) return;
        let active = true;
        let animation = 0;
        let root: HTMLElement | null = null;
        let ready = false;
        const measure = () => {
          if (!active) return;
          const next = doc.getElementById("storybook-root");
          if (next !== root) {
            if (root) resize.unobserve(root);
            root = next;
            if (root) resize.observe(root);
          }
          if (!root) return;
          if (!ready && (root.childElementCount > 0 || doc.querySelector('[role="dialog"]'))) {
            ready = true;
            window.clearTimeout(timer);
            onLoad();
          }
          const body = view.getComputedStyle(doc.body);
          const bottom = root.getBoundingClientRect().bottom + view.scrollY;
          setContentHeight(
            Math.ceil(
              bottom +
                Number.parseFloat(body.paddingBottom || "0") +
                Number.parseFloat(body.marginBottom || "0"),
            ),
          );
        };
        const schedule = () => {
          cancelAnimationFrame(animation);
          animation = requestAnimationFrame(measure);
        };
        const resize = new ResizeObserver(schedule);
        const mutations = new MutationObserver(schedule);
        mutations.observe(doc.body, { childList: true, subtree: true, characterData: true });
        // Root can mount after iframe load. Ignore body viewport height to avoid resize loops.
        measure();
        void doc.fonts.ready.then(() => {
          if (active) schedule();
        });
        disconnect = () => {
          active = false;
          cancelAnimationFrame(animation);
          resize.disconnect();
          mutations.disconnect();
        };
      } catch {
        // External previews retain fallback sizing and their direct Storybook link.
      }
    };
    element.addEventListener("load", observe);
    observe();
    return () => {
      element.removeEventListener("load", observe);
      window.clearTimeout(timer);
      disconnect();
    };
  }, [src, generation, onLoad, onSlow]);
  return (
    <div
      className="catalog-preview-frame"
      style={{ maxWidth: `calc(${layout.width}px + 2 * var(--preview-inset))` }}
    >
      <iframe
        key={generation}
        ref={frame}
        aria-busy={pending}
        inert={pending}
        data-generation={generation}
        title={title}
        src={src}
        style={{
          maxWidth: layout.width,
          height: expanded
            ? `max(${Math.max(layout.minimum, contentHeight)}px, min(480px, 60svh))`
            : Math.max(layout.minimum, contentHeight),
        }}
        onError={onError}
      />
      <p className="catalog-preview-status" role="status">
        {status}
      </p>
    </div>
  );
}

function CatalogDetail({
  entry,
  initialStateId,
  storybookRoot,
  onStateChange,
}: {
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
  const markReady = useCallback(() => {
    setLoaded(true);
    if (compactOnReady.current) {
      compactOnReady.current = false;
      setExpanded(false);
    }
  }, []);
  const markSlow = useCallback(() => setSlow(true), []);
  const selected =
    entry.stories.find((story) => story.id === stateId) ??
    entry.stories.find((story) => story.id === entry.defaultStoryId);
  if (!selected) throw new Error(`Missing default catalog story: ${entry.name}`);
  const notes = entry.api.filter((block) => block.kind !== "table");
  return (
    <>
      <div className="catalog-topline">
        <a href="./" className="plain-link">
          ← All components
        </a>
        <a className="plain-link" href={`${storybookRoot}?path=/docs/${entry.docsId}`}>
          Full {entry.name} API
        </a>
      </div>
      <div className="page-heading catalog-detail-heading">
        <p className="page-kicker">{entry.group}</p>
        <h1>
          {entry.name} <em>in use.</em>
        </h1>
        <p>{entry.description}</p>
      </div>
      <details className="catalog-switcher">
        <summary>Change component</summary>
        <nav aria-label="Choose component">
          {entries.map((component) => (
            <a
              key={component.id}
              href={`./?component=${component.id}`}
              aria-current={component.id === entry.id ? "page" : undefined}
            >
              {component.name}
            </a>
          ))}
        </nav>
      </details>
      <section className="catalog-live" aria-labelledby={`${id}-live`}>
        <div className="catalog-section-heading">
          <div>
            <p className="page-kicker">Straight from Storybook</p>
            <h2 id={`${id}-live`}>Try it here.</h2>
          </div>
          <span className="catalog-source">Live · Storybook</span>
        </div>
        <fieldset className="catalog-states">
          <legend>Example state</legend>
          <div>
            {entry.stories.map((story) => (
              <button
                key={story.id}
                type="button"
                aria-pressed={selected.id === story.id}
                onClick={() => {
                  if (selected.id === story.id) return;
                  setStateId(story.id);
                  compactOnReady.current = true;
                  setLoaded(false);
                  setSlow(false);
                  setFailed(false);
                  onStateChange?.(story.id);
                }}
              >
                {story.name}
              </button>
            ))}
          </div>
        </fieldset>
        {selected.id !== stateId && (
          <p role="status">State not found. Choose one of the available examples.</p>
        )}
        <StoryPreview
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
          src={`${storybookRoot}iframe.html?id=${encodeURIComponent(selected.id)}&viewMode=story`}
          onLoad={markReady}
          onSlow={markSlow}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
        />
        <div className="catalog-preview-actions">
          <a className="plain-link" href={`${storybookRoot}?path=/story/${selected.id}`}>
            Open example in Storybook
          </a>
          <div className="catalog-preview-tools">
            <button
              type="button"
              className="catalog-text-button"
              aria-expanded={expanded}
              onClick={() => {
                compactOnReady.current = false;
                setExpanded((value) => !value);
              }}
            >
              {expanded ? "Compact preview" : "Expand preview"}
            </button>
            <button
              type="button"
              className="catalog-text-button"
              onClick={() => {
                setLoaded(false);
                setSlow(false);
                setFailed(false);
                setGeneration((value) => value + 1);
              }}
            >
              Reload preview
            </button>
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
            React guide ↗
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
}: {
  siteRoot?: string;
  storybookRoot?: string;
  componentId?: string | null;
  stateId?: string | null;
  onStateChange?: (id: string) => void;
}) {
  const entry = componentId ? entries.find((component) => component.id === componentId) : undefined;
  return (
    <SiteFrame
      current="components"
      className="kbui-catalog"
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
    >
      <main id="main" className="inner-page">
        {!componentId ? (
          <CatalogIndex />
        ) : entry ? (
          <CatalogDetail
            key={entry.id}
            entry={entry}
            initialStateId={stateId}
            storybookRoot={storybookRoot}
            onStateChange={onStateChange}
          />
        ) : (
          <div className="page-heading">
            <p className="page-kicker">Components</p>
            <h1>Component not found.</h1>
            <p>That component is not in this catalog.</p>
            <a className="plain-link" href="./">
              All components
            </a>
          </div>
        )}
      </main>
    </SiteFrame>
  );
}
