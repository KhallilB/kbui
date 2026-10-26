import { useState } from "react";
import { OperationsScreen, useOperations } from "./OperationsScreen";
import { SettingsScreen, useSettings } from "./SettingsScreen";
import { SiteFrame } from "./SiteFrame";
import { readSiteTheme } from "./site-theme";
import { themeStyle } from "./theme-foundations";
import "./skin-comparison.css";
import "./workspace-skin.css";

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="comparison-choice">
      <legend>{label}</legend>
      <div>
        {options.map(([key, text]) => (
          <label key={key}>
            <input
              type="radio"
              name={label}
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SkinComparison() {
  const [screen, setScreen] = useState<"settings" | "operations">("settings");
  const [theme, setTheme] = useState(readSiteTheme);
  const [failNext, setFailNext] = useState(false);
  const settings = useSettings(failNext, () => setFailNext(false));
  const operations = useOperations();
  return (
    <SiteFrame
      current="examples"
      siteRoot="../"
      storybookRoot="../storybook/"
      className="skin-comparison"
      theme={theme}
      onThemeChange={setTheme}
    >
      <main id="main" className="inner-page">
        <header className="comparison-intro">
          <div>
            <a href="../examples/">← All examples</a>
            <p className="page-kicker">KBUI · Default design</p>
            <h1>
              The everyday, <em>refined.</em>
            </h1>
            <p>
              Two complete screens. One component library. Warm site colors, tactile controls and
              the same everyday work.
            </p>
          </div>
          <div className="comparison-note">
            <strong>A working example</strong>
            <p>
              Edits and filters stay with you when switching themes. Sample data stays in this
              browser session.
            </p>
            <span>
              <a href="../components/?view=live">
                Review all 15 components <span className="link-arrow">↗</span>
              </a>
            </span>
          </div>
        </header>
        <div className="comparison-controls">
          <Choice
            label="Screen"
            value={screen}
            onChange={setScreen}
            options={[
              ["settings", "Settings"],
              ["operations", "Operations"],
            ]}
          />
        </div>
        <div className="comparison-previews">
          <section className="comparison-pane" data-theme={theme} aria-label="Workspace preview">
            <div className="preview-caption">
              <span>
                <i aria-hidden="true" />
                KBUI workspace
              </span>
              <span>Default components</span>
            </div>
            <div className="skin-surface" data-theme={theme} style={themeStyle(theme)}>
              <div className="workspace-topbar">
                <span className="workspace-brand">
                  <b aria-hidden="true">N</b> Northstar <span>/</span> Workspace
                </span>
                <span className="workspace-avatar">
                  <span aria-hidden="true">MC</span>
                  <span className="kb-sr-only">Signed in as Maya Chen</span>
                </span>
              </div>
              <div className="workspace-body">
                <aside className="workspace-sidebar" aria-label="Workspace navigation">
                  <p>WORKSPACE</p>
                  <button
                    type="button"
                    aria-current={screen === "operations" ? "page" : undefined}
                    onClick={() => setScreen("operations")}
                  >
                    <span aria-hidden="true">▦</span> Operations
                  </button>
                  <button
                    type="button"
                    aria-current={screen === "settings" ? "page" : undefined}
                    onClick={() => setScreen("settings")}
                  >
                    <span aria-hidden="true">⚙</span> Settings
                  </button>
                  <div className="workspace-sidebar-note">
                    <span className="connection-dot" /> Local demo
                    <span>Nothing sent or stored.</span>
                  </div>
                </aside>
                <div className="workspace-content">
                  {screen === "settings" ? (
                    <SettingsScreen model={settings} previewName="workspace" />
                  ) : (
                    <OperationsScreen model={operations} previewName="workspace" />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="comparison-foot">
          <p>
            <strong>Same markup. Same behavior.</strong> Shared tokens and component CSS supply this
            design out of the box. Try settings and operations in either theme.
          </p>
          <details>
            <summary>Explore edge cases</summary>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={failNext}
                  onChange={(event) => setFailNext(event.target.checked)}
                />{" "}
                Fail next save
              </label>
              <button
                type="button"
                onClick={() => {
                  setScreen("operations");
                  operations.setPhase("error");
                }}
              >
                Show queue error
              </button>
              <span>Also try an empty workspace name or a search with no results.</span>
            </div>
          </details>
        </div>
      </main>
    </SiteFrame>
  );
}
