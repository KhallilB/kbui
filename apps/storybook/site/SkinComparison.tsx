import { Button, Checkbox } from "@kb.ui/react";
import { useState } from "react";
import { BackArrow, LinkArrow } from "./LinkArrow";
import { OperationsScreen, useOperations } from "./OperationsScreen";
import { SettingsScreen, useSettings } from "./SettingsScreen";
import { SiteFrame } from "./SiteFrame";
import { readSiteTheme } from "./site-theme";
import { themeStyle } from "./theme-foundations";
import "./skin-comparison.css";
import "./workspace-skin.css";

export function SkinComparison() {
  const [screen, setScreen] = useState<"settings" | "operations">("settings");
  const [theme, setTheme] = useState(readSiteTheme);
  const [failNext, setFailNext] = useState(false);
  const settings = useSettings(failNext, () => setFailNext(false));
  const operations = useOperations();
  return (
    <SiteFrame
      current="recipes"
      siteRoot="../"
      storybookRoot="../storybook/"
      className="skin-comparison"
      theme={theme}
      onThemeChange={setTheme}
    >
      <main id="main" className="inner-page">
        <header className="comparison-intro">
          <div>
            <a href="../recipes/">
              <BackArrow /> All recipes
            </a>
            <p className="page-kicker">KBUI · Default design</p>
            <h1>
              The everyday, <em>refined.</em>
            </h1>
            <p>Try a settings form and an operations screen built with kbui’s default design.</p>
          </div>
          <div className="comparison-note">
            <strong>A working example</strong>
            <p>
              Edits and filters stay with you when switching themes. Sample data stays in this
              browser session.
            </p>
            <span>
              <a href="../components/?view=live">
                Explore component catalog <LinkArrow />
              </a>
            </span>
          </div>
        </header>
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
                  <Button
                    type="button"
                    variant={screen === "operations" ? "secondary" : "ghost"}
                    aria-current={screen === "operations" ? "page" : undefined}
                    onClick={() => setScreen("operations")}
                  >
                    <span aria-hidden="true">▦</span> Operations
                  </Button>
                  <Button
                    type="button"
                    variant={screen === "settings" ? "secondary" : "ghost"}
                    aria-current={screen === "settings" ? "page" : undefined}
                    onClick={() => setScreen("settings")}
                  >
                    <span aria-hidden="true">⚙</span> Settings
                  </Button>
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
            <strong>Built with kbui.</strong> These screens use the shared components, styles, and
            tokens. Try the forms and actions in either theme.
          </p>
          <details>
            <summary>Explore edge cases</summary>
            <div>
              <Checkbox label="Fail next save" checked={failNext} onCheckedChange={setFailNext} />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setScreen("operations");
                  operations.setPhase("error");
                }}
              >
                Show queue error
              </Button>
              <span>Also try an empty workspace name or a search with no results.</span>
            </div>
          </details>
        </div>
      </main>
    </SiteFrame>
  );
}
