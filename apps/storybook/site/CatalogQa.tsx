import entries from "virtual:kbui-catalog";
import { Button, Checkbox, Input, Select } from "@kbui/react";
import { useRef, useState } from "react";
import type { CatalogEntry } from "../catalog/types";
import { StoryPreview } from "./CatalogPreview";
import {
  appearanceQuery,
  browsableStories,
  previewGlobals,
  previewLayout,
  storybookGlobals,
} from "./catalog-model";
import { BackArrow } from "./LinkArrow";
import { SiteFrame } from "./SiteFrame";
import { readSiteTheme, type Theme } from "./site-theme";
import { themeStyle } from "./theme-foundations";
import "./catalog.css";
import "./catalog-qa.css";

export type CatalogQaProps = {
  componentId?: string | null;
  stateId?: string | null;
  initialCompare?: boolean;
  initialTheme?: Theme;
  siteRoot?: string;
  catalogRoot?: string;
  storybookRoot?: string;
  onCompareChange?: (compare: boolean) => void;
  onStateChange?: (componentId: string, stateId: string) => void;
};

function QaPane({
  entry,
  story,
  theme,
  storybookRoot,
}: {
  entry: CatalogEntry;
  story: CatalogEntry["stories"][number];
  theme: Theme;
  storybookRoot: string;
}) {
  const [generation, setGeneration] = useState(0);
  const [load, setLoad] = useState({ id: story.id, phase: "loading" });
  const phase = load.id === story.id ? load.phase : "loading";
  const title = theme === "light" ? "Light" : "Dark";
  const appearance = { theme };
  return (
    <section
      className="catalog-qa-pane"
      data-theme={theme}
      data-qa-theme={theme}
      style={themeStyle(theme)}
      aria-label={`${entry.name} ${title} preview`}
    >
      <div className="catalog-qa-pane-heading">
        <h3>{title}</h3>
        <span>Canonical Storybook example</span>
      </div>
      <div className="catalog-specimen-stage">
        <StoryPreview
          appearance={appearance}
          generation={generation}
          cacheLimit={2}
          expanded={false}
          pending={phase === "loading" || phase === "slow"}
          status={
            phase === "failed"
              ? "Preview unavailable. Reload or open it in Storybook."
              : phase === "slow"
                ? "Taking longer than expected. Reload or open it in Storybook."
                : phase === "loading"
                  ? "Loading live example…"
                  : ""
          }
          layout={previewLayout(entry.id, story.id)}
          title={`${entry.name} — ${story.name} — ${title} QA example`}
          src={`${storybookRoot}iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story${previewGlobals(appearance)}&embed=true`}
          onLoad={() => setLoad({ id: story.id, phase: "ready" })}
          onSlow={() => setLoad({ id: story.id, phase: "slow" })}
          onError={() => setLoad({ id: story.id, phase: "failed" })}
        />
      </div>
      <div className="catalog-qa-pane-actions">
        <a
          className="plain-link"
          href={`${storybookRoot}?path=/story/${story.id}${storybookGlobals(appearance)}`}
          aria-label={`Open in Storybook — ${entry.name} ${title}`}
        >
          Open in Storybook
        </a>
        <Button
          size="sm"
          variant="secondary"
          aria-label={`Reload ${entry.name} ${title} preview`}
          onClick={() => {
            setLoad({ id: story.id, phase: "loading" });
            setGeneration((value) => value + 1);
          }}
        >
          Reload
        </Button>
      </div>
    </section>
  );
}

function QaSpecimen({
  entry,
  initialStateId,
  compare,
  theme,
  storybookRoot,
  catalogRoot,
  onStateChange,
}: {
  entry: CatalogEntry;
  initialStateId: string | null;
  compare: boolean;
  theme: Theme;
  storybookRoot: string;
  catalogRoot: string;
  onStateChange: CatalogQaProps["onStateChange"];
}) {
  const stories = browsableStories(entry);
  const [stateId, setStateId] = useState(initialStateId ?? entry.defaultStoryId);
  const requestedId =
    stateId === "components-input--with-adornments"
      ? "components-input--with-icons-and-actions"
      : stateId;
  const requested = entry.stories.find((candidate) => candidate.id === requestedId);
  const alias = requested?.name.replace(/(?:^|\s)(?:Dark|Light)$/, "").trim();
  const story =
    stories.find((candidate) => candidate.id === requestedId) ??
    stories.find((candidate) => candidate.name === alias) ??
    stories.find((candidate) => candidate.id === entry.defaultStoryId);
  if (!story) return null;
  return (
    <article className="catalog-specimen" data-component={entry.id}>
      <header>
        <div>
          <p className="page-kicker">{entry.group}</p>
          <h2>{entry.name}</h2>
          <p>{entry.description}</p>
        </div>
        <a
          className="plain-link"
          href={`${catalogRoot}?component=${entry.id}&state=${story.id}${appearanceQuery({ theme })}`}
        >
          {entry.name} API and code
        </a>
      </header>
      <Select
        className="catalog-example-picker"
        label={`${entry.name} example`}
        value={story.id}
        options={stories.map((item) => ({ value: item.id, label: item.name }))}
        onValueChange={(value) => {
          if (!stories.some((candidate) => candidate.id === value) || value === null) return;
          setStateId(value);
          onStateChange?.(entry.id, value);
        }}
      />
      <div className="catalog-qa-panes" data-compare={compare || undefined}>
        <QaPane
          key="primary"
          entry={entry}
          story={story}
          theme={compare ? "light" : theme}
          storybookRoot={storybookRoot}
        />
        {compare && (
          <QaPane
            key="comparison"
            entry={entry}
            story={story}
            theme="dark"
            storybookRoot={storybookRoot}
          />
        )}
      </div>
    </article>
  );
}

export function CatalogQa({
  componentId,
  stateId,
  initialCompare = false,
  initialTheme,
  siteRoot = "../../",
  catalogRoot = "../",
  storybookRoot = "../../storybook/",
  onCompareChange,
  onStateChange,
}: CatalogQaProps) {
  const focused = entries.find((entry) => entry.id === componentId);
  const [search, setSearch] = useState(focused?.name ?? "");
  const [focusedId, setFocusedId] = useState(focused?.id ?? null);
  const [category, setCategory] = useState("All");
  const [compare, setCompare] = useState(initialCompare);
  const [theme, setTheme] = useState<Theme>(() => initialTheme ?? readSiteTheme());
  const searchInput = useRef<HTMLInputElement>(null);
  const changeSearch = (value: string) => {
    setFocusedId(null);
    setSearch(value);
  };
  const query = search.trim().toLowerCase();
  const matches = entries.filter(
    (entry) =>
      (focusedId === null || entry.id === focusedId) &&
      (category === "All" || entry.group === category) &&
      `${entry.name} ${entry.description}`.toLowerCase().includes(query),
  );
  return (
    <SiteFrame
      current="components"
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
      className="kbui-catalog catalog-qa"
      theme={theme}
      onThemeChange={setTheme}
    >
      <main id="main" className="inner-page">
        <div className="page-heading">
          <p className="page-kicker">Developer tools</p>
          <h1>Component QA bench</h1>
          <p>
            Inspect canonical examples across the library. Choose one state per component, then
            compare its behavior and material in both themes.
          </p>
          <a className="plain-link" href={`${catalogRoot}?theme=${theme}`}>
            <BackArrow /> Component catalog
          </a>
        </div>
        <section className="catalog-qa-controls" aria-label="QA controls">
          <Input
            ref={searchInput}
            className="catalog-qa-search"
            label="Search QA components"
            type="search"
            value={search}
            onValueChange={changeSearch}
            placeholder="Search components"
            endContent={
              search ? (
                <Button
                  size="sm"
                  variant="secondary"
                  aria-label="Clear component search"
                  onClick={() => {
                    changeSearch("");
                    searchInput.current?.focus();
                  }}
                >
                  Clear
                </Button>
              ) : undefined
            }
          />
          <Select
            label="Component category"
            value={category}
            options={[
              { value: "All", label: "All categories" },
              ...["Actions", "Forms", "Feedback", "Layout"].map((value) => ({
                value,
                label: value,
              })),
            ]}
            onValueChange={(value) => {
              if (value !== null) setCategory(value);
            }}
          />
          <Checkbox
            label="Compare light and dark"
            checked={compare}
            onCheckedChange={(value) => {
              setCompare(value);
              onCompareChange?.(value);
            }}
            description="Both panes share the selected example. Their themes stay pinned while navigation changes."
          />
        </section>
        <p className="catalog-results" role="status" aria-label="QA results">
          {matches.length} {matches.length === 1 ? "component" : "components"}
          {compare ? " · Light and dark comparison" : " · One live preview per component"}
        </p>
        <div className="catalog-qa-gallery">
          {matches.map((entry) => (
            <QaSpecimen
              key={entry.id}
              entry={entry}
              initialStateId={entry.id === componentId ? (stateId ?? null) : null}
              compare={compare}
              theme={theme}
              storybookRoot={storybookRoot}
              catalogRoot={catalogRoot}
              onStateChange={onStateChange}
            />
          ))}
        </div>
        {matches.length === 0 && (
          <p className="catalog-empty">No components match these filters.</p>
        )}
      </main>
    </SiteFrame>
  );
}
