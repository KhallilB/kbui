import samples from "virtual:kbui-site-samples";
import { Button } from "@kbui/react";
import { useId, useRef, useState } from "react";
import { CodePanel } from "./CodePanel";
import { ControlSelect } from "./ControlSelect";
import { playgroundKey, sizes, variants } from "./playground-model";
import { SiteFrame } from "./SiteFrame";
import "./workbench.css";

const components = [
  ["Button", "Actions, variants, and sizes", "01"],
  ["Input", "Labelled fields and validation", "02"],
  ["Dialog", "Focus-managed overlays", "03"],
  ["Card", "Content containers", "04"],
  ["Status", "States with visible labels", "05"],
  ["Progress", "Labelled completion indicators", "06"],
] as const;
const docs = (name: string, root: string) =>
  `${root}?path=/docs/components-${name.toLowerCase()}--docs`;

export function Playground({ storybookRoot }: { storybookRoot: string }) {
  const id = useId();
  const [variant, setVariant] = useState<(typeof variants)[number]>("primary");
  const [size, setSize] = useState<(typeof sizes)[number]>("md");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [disabled, setDisabled] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [pressed, setPressed] = useState(false);
  const state = { variant, size, theme, disabled, reduced };
  const sample = samples.playground[playgroundKey(state)];
  if (!sample) throw new Error("Missing playground code");
  return (
    <section
      id="playground"
      className="section playground-section"
      aria-labelledby={`${id}-title`}
      data-motion={reduced ? "reduce" : "default"}
    >
      <div className="section-heading">
        <div>
          <h2 id={`${id}-title`}>Button</h2>
        </div>
        <p>Preview uses kbui’s default themes.</p>
      </div>
      <div className="playground-grid">
        <div
          className="playground-preview"
          data-testid="playground-preview"
          data-theme={theme}
          data-motion={reduced ? "reduce" : "default"}
        >
          <span className="preview-label">Your preview</span>
          <div className="preview-button-stage">
            <Button
              variant={variant}
              size={size}
              disabled={disabled}
              onClick={() => setPressed(!pressed)}
            >
              Save changes
            </Button>
          </div>
          <span className="preview-feedback" role="status">
            {pressed ? "Click registered." : "Click to test the button."}
          </span>
        </div>
        <div className="playground-controls">
          <div className="panel-caption">
            <span>Controls</span>
            <div className="playground-actions">
              <button
                type="button"
                aria-label="Reset controls"
                onClick={() => {
                  setVariant("primary");
                  setSize("md");
                  setTheme("light");
                  setDisabled(false);
                  setReduced(false);
                  setPressed(false);
                }}
              >
                Reset
              </button>
              <a href={docs("Button", storybookRoot)}>
                API & states <span className="link-arrow">↗</span>
              </a>
            </div>
          </div>
          <div className="fields">
            <ControlSelect
              id={`${id}-variant`}
              label="Variant"
              value={variant}
              onChange={setVariant}
              options={variants.map((value) => ({
                value,
                label: value.charAt(0).toUpperCase() + value.slice(1),
              }))}
            />
            <ControlSelect
              id={`${id}-size`}
              label="Size"
              value={size}
              onChange={setSize}
              options={sizes.map((value) => ({
                value,
                label: { sm: "Small", md: "Medium", lg: "Large" }[value],
              }))}
            />
          </div>
          <div className="theme-control">
            <span>Theme</span>
            <div className="segmented">
              {["dark", "light"].map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-label={`${value === "dark" ? "Dark" : "Light"} theme`}
                  aria-pressed={theme === value}
                  onClick={() => {
                    setTheme(value as "light" | "dark");
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="checks">
            <label>
              <input
                type="checkbox"
                checked={disabled}
                onChange={(event) => {
                  setDisabled(event.target.checked);
                }}
              />
              Disabled
            </label>
            <label>
              <input
                type="checkbox"
                checked={reduced}
                onChange={(event) => setReduced(event.target.checked)}
              />
              Reduce motion
            </label>
          </div>
        </div>
        <CodePanel sample={sample} name="Button" defaultOpen testId="working-code" />
      </div>
    </section>
  );
}

export function Workbench({
  storybookRoot = "../storybook/",
  siteRoot = "../",
}: {
  storybookRoot?: string;
  siteRoot?: string;
}) {
  const [search, setSearch] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const matches = components.filter(([name, description]) =>
    `${name} ${description}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <SiteFrame
      current="playground"
      className="kbui-lab"
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
    >
      <main id="main" className="inner-page">
        <div className="page-heading">
          <p className="page-kicker">Playground</p>
          <h1>
            Try a few <em>changes.</em>
          </h1>
          <p>Change a Button. Test the result. Copy code that matches.</p>
        </div>
        <Playground storybookRoot={storybookRoot} />
        <section className="section" aria-label="Featured components">
          <h2>Find a component</h2>
          <label className="search">
            <input
              ref={searchInput}
              type="search"
              placeholder="Button, Dialog, Progress…"
              aria-label="Find a component"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  searchInput.current?.focus();
                }}
              >
                Clear
              </button>
            )}
          </label>
          <p className="result-count" role="status" aria-label="Component results">
            {matches.length} of {components.length} featured components
          </p>
          <div className="component-grid">
            {matches.map(([name, description]) => (
              <a
                key={name}
                className="component-card"
                href={`${siteRoot}components/?component=${name.toLowerCase()}`}
              >
                <span className="component-name">{name}</span>
                <span className="component-description">{description}</span>
              </a>
            ))}
          </div>
          {matches.length === 0 && <p role="status">No matches. Try Button, Dialog, or Status.</p>}
        </section>
      </main>
    </SiteFrame>
  );
}
