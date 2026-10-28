import samples from "virtual:kbui-site-samples";
import { Button, Card, Checkbox, Input, RadioGroup } from "@kb.ui/react";
import { useId, useRef, useState } from "react";
import { CodePanel } from "./CodePanel";
import { ControlSelect } from "./ControlSelect";
import { LinkArrow } from "./LinkArrow";
import { playgroundKey, sizes, variants } from "./playground-model";
import { SiteFrame, useSiteTheme } from "./SiteFrame";
import "./workbench.css";

const components = [
  ["Button", "Actions for the next step", "01"],
  ["Input", "Give people a place to type", "02"],
  ["Dialog", "Make a change without leaving the page", "03"],
  ["Card", "Keep related things together", "04"],
  ["Status", "Let people know what changed", "05"],
  ["Progress", "Show how far along things are", "06"],
] as const;
const docs = (name: string, root: string) =>
  `${root}?path=/docs/components-${name.toLowerCase()}--docs`;

export function Playground({ storybookRoot }: { storybookRoot: string }) {
  const id = useId();
  const [variant, setVariant] = useState<(typeof variants)[number]>("primary");
  const [size, setSize] = useState<(typeof sizes)[number]>("md");
  const siteTheme = useSiteTheme();
  const [themeOverride, setThemeOverride] = useState<"light" | "dark" | null>(null);
  const theme = themeOverride ?? siteTheme;
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
        <p>Your changes show up here and in the code below.</p>
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
            {pressed ? "That worked. Try another style." : "Give it a click."}
          </span>
        </div>
        <div className="playground-controls">
          <div className="panel-caption">
            <span>Make it yours</span>
            <div className="playground-actions">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Reset controls"
                onClick={() => {
                  setVariant("primary");
                  setSize("md");
                  setThemeOverride(null);
                  setDisabled(false);
                  setReduced(false);
                  setPressed(false);
                }}
              >
                Reset
              </Button>
              <a href={docs("Button", storybookRoot)}>
                Button docs <LinkArrow />
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
          <RadioGroup
            className="theme-control"
            label="Preview theme"
            appearance="segmented"
            value={theme}
            onValueChange={(value) => {
              if (value === "light" || value === "dark") setThemeOverride(value);
            }}
          >
            <RadioGroup.Item value="dark">Dark</RadioGroup.Item>
            <RadioGroup.Item value="light">Light</RadioGroup.Item>
          </RadioGroup>
          <div className="checks">
            <Checkbox label="Disabled" checked={disabled} onCheckedChange={setDisabled} />
            <Checkbox label="Reduce motion" checked={reduced} onCheckedChange={setReduced} />
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
            A space to <em>try things.</em>
          </h1>
          <p>
            Pick a style, change the size, and see how it feels. When it looks right, take the code
            with you.
          </p>
        </div>
        <Playground storybookRoot={storybookRoot} />
        <section className="section" aria-label="Featured components">
          <h2>What else are you building?</h2>
          <p className="discovery-intro">
            A few more parts to try in your app. Each has working examples and code you can use.
          </p>
          <Input
            className="component-search"
            ref={searchInput}
            type="search"
            placeholder="Button, Dialog, Progress…"
            label="Find a component"
            visuallyHidden
            value={search}
            onValueChange={setSearch}
            endContent={
              search ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch("");
                    searchInput.current?.focus();
                  }}
                >
                  <span aria-hidden="true">×</span>
                </Button>
              ) : undefined
            }
          />
          <p className="result-count" role="status" aria-label="Component results">
            {matches.length} of {components.length} featured components
          </p>
          <div className="component-grid">
            {matches.map(([name, description]) => (
              <Card key={name} className="component-card">
                <a href={`${siteRoot}components/?component=${name.toLowerCase()}`}>
                  <span className="component-name">{name}</span>
                  <span className="component-description">{description}</span>
                </a>
              </Card>
            ))}
          </div>
          {matches.length === 0 && (
            <p role="status">Nothing here yet. Try another name, or clear your search.</p>
          )}
        </section>
      </main>
    </SiteFrame>
  );
}
