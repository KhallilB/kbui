import samples from "virtual:kbui-setup-samples";
import { Button, Checkbox, RadioGroup } from "@kbui/react";
import { useEffect, useId, useState } from "react";
import { CodePanel } from "./CodePanel";
import { ControlSelect } from "./ControlSelect";
import { LinkArrow } from "./LinkArrow";
import { SiteFrame, SiteLink } from "./SiteFrame";
import {
  bundlesCss,
  installCommand,
  managers,
  readSetup,
  releaseVersion,
  type SetupOptions,
  setupHref,
  stylesheetImport,
  type Theme,
  themes,
} from "./setup-model";
import "./setup.css";

const plain = (code: string) => ({ code, snippet: code, tokens: [], snippetTokens: [] });

export function InstallBuilder({
  siteRoot = "./",
  initial,
  onChange,
  compact = false,
}: {
  siteRoot?: string;
  initial?: SetupOptions;
  onChange?: (options: SetupOptions) => void;
  compact?: boolean;
}) {
  const id = useId();
  const [options, setOptions] = useState<SetupOptions>(
    initial ?? { manager: "npm", tokens: false },
  );
  const update = (next: SetupOptions) => {
    setOptions(next);
    onChange?.(next);
  };
  return (
    <section className="install-builder" aria-label="Install kbui">
      <div className="install-settings">
        <ControlSelect
          id={`${id}-manager`}
          label="Package manager"
          value={options.manager}
          options={managers.map((value) => ({
            value,
            label:
              value === "npm"
                ? "npm"
                : value === "bun"
                  ? "Bun"
                  : value === "yarn"
                    ? "Yarn"
                    : "pnpm",
          }))}
          onChange={(manager) => update({ ...options, manager })}
        />
        <Checkbox
          className="install-tokens"
          label="Include typed tokens"
          checked={options.tokens}
          onCheckedChange={(tokens) => update({ ...options, tokens })}
        />
      </div>
      <p className="setup-note">
        v{releaseVersion} · React 19+ · CSS includes design tokens. Add typed tokens only for
        JavaScript access.
      </p>
      <CodePanel
        name="Install"
        language="Shell"
        regionLabel="Install command"
        sample={plain(installCommand(options.manager, options.tokens))}
        defaultOpen
      />
      {compact && (
        <SiteLink className="plain-link setup-continue" href={setupHref(siteRoot, options)}>
          Continue setup <LinkArrow />
        </SiteLink>
      )}
    </section>
  );
}

export function Setup({
  themePage = false,
  siteRoot = "../",
  storybookRoot = "../storybook/",
  search = "",
}: {
  themePage?: boolean;
  siteRoot?: string;
  storybookRoot?: string;
  search?: string;
}) {
  const [theme, setTheme] = useState<Theme>("system");
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const preference = matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(preference.matches);
    preference.addEventListener("change", update);
    update();
    return () => preference.removeEventListener("change", update);
  }, []);
  const id = useId();
  return (
    <SiteFrame
      current="setup"
      className="kbui-setup"
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
    >
      <main id="main" className="inner-page">
        <div className="page-heading">
          <p className="page-kicker">Get started</p>
          <h1>
            {themePage ? (
              <>
                Make it <em>your own.</em>
              </>
            ) : (
              <>
                Install. <em>Then build.</em>
              </>
            )}
          </h1>
          <p>
            {themePage
              ? "Choose light, dark, or the system preference, then adjust the details for your app."
              : "Add kbui to an existing React app, import the stylesheet, and try your first component."}
          </p>
        </div>
        <nav className="setup-nav" aria-label="Setup navigation">
          <SiteLink href={`${siteRoot}setup/`} aria-current={!themePage ? "page" : undefined}>
            Installation
          </SiteLink>
          <SiteLink href={`${siteRoot}setup/themes/`} aria-current={themePage ? "page" : undefined}>
            Themes & styling
          </SiteLink>
        </nav>
        {themePage ? (
          <>
            <section className="setup-step" aria-labelledby={`${id}-theme`}>
              <div>
                <p className="page-kicker">01 / Appearance</p>
                <h2 id={`${id}-theme`}>Let the theme do the work.</h2>
                <p>
                  Set the theme on your app’s HTML element. Choose System to follow the visitor’s
                  preference. You don’t need a theme provider.
                </p>
              </div>
              <div className="setup-work">
                <RadioGroup
                  label="Theme"
                  appearance="segmented"
                  value={theme}
                  onValueChange={(value) => {
                    const next = themes.find((theme) => theme === value);
                    if (next) setTheme(next);
                  }}
                >
                  {themes.map((value) => (
                    <RadioGroup.Item key={value} value={value}>
                      {value[0]?.toUpperCase() + value.slice(1)}
                    </RadioGroup.Item>
                  ))}
                </RadioGroup>
                <div
                  className="setup-preview"
                  data-theme={theme === "system" ? (systemDark ? "dark" : "light") : theme}
                >
                  <Button>Save changes</Button>
                  <span>Live preview · {theme}</span>
                </div>
                <CodePanel
                  name="Theme"
                  language="HTML"
                  sample={samples[theme]}
                  regionLabel="Theme code"
                  defaultOpen
                />
              </div>
            </section>
            <section className="setup-step">
              <div>
                <p className="page-kicker">02 / Restyle</p>
                <h2>Style it like any element.</h2>
                <p>
                  Pass your own class with <code>className</code>, or <code>classNames</code> for
                  inner parts. kbui’s CSS sits in a cascade layer, so plain CSS, CSS Modules and
                  Tailwind win without kbui names. To change every component at once, set a token.
                </p>
              </div>
              <CodePanel name="Restyle" language="CSS" sample={samples.styling} defaultOpen />
            </section>
            <p className="setup-note">
              Restyle type, density, shape and motion the same way.{" "}
              <a
                className="plain-link"
                href="https://github.com/KhallilB/kbui/blob/main/docs/guides/restyling.md"
              >
                Read the restyling guide <LinkArrow />
              </a>{" "}
              <a
                className="plain-link"
                href={`${storybookRoot}?path=/docs/components-button--docs`}
              >
                See Button API & states <LinkArrow />
              </a>
            </p>
          </>
        ) : (
          <>
            <section className="setup-step" aria-labelledby={`${id}-install`}>
              <div>
                <p className="page-kicker">01 / Install</p>
                <h2 id={`${id}-install`}>Pick your package manager.</h2>
                <p>
                  Run this in your app’s folder.{" "}
                  {bundlesCss()
                    ? "One package carries the components and the stylesheet."
                    : "Both packages come from the same published release."}{" "}
                  React and React DOM 19+ must already be installed.
                </p>
              </div>
              <InstallBuilder
                siteRoot={siteRoot}
                initial={readSetup(search)}
                onChange={(options) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("manager", options.manager);
                  if (options.tokens) url.searchParams.set("tokens", "1");
                  else url.searchParams.delete("tokens");
                  window.history.replaceState(null, "", url);
                }}
              />
            </section>
            <section className="setup-step">
              <div>
                <p className="page-kicker">02 / Use it</p>
                <h2>Add CSS once. Use components anywhere.</h2>
                <p>
                  Import the stylesheet at your app’s entry point, then add a Button as shown below.
                </p>
              </div>
              <CodePanel name="First component" sample={samples.usage} defaultOpen />
            </section>
            <section className="setup-step">
              <div>
                <p className="page-kicker">03 / Check</p>
                <h2>Keep versions together.</h2>
                <p>
                  Run this after installing and in your build checks. It catches mismatched or
                  missing kbui packages.
                </p>
              </div>
              <CodePanel
                name="Version check"
                regionLabel="Version check command"
                language="Shell"
                sample={plain("node node_modules/@kbui/react/dist/check-versions.js")}
                defaultOpen
              />
            </section>
            <details className="setup-help">
              <summary>Something not working?</summary>
              <p>
                Unstyled components: import <code>{stylesheetImport()}</code> once. Missing CSS
                types: add <code>declare module "*.css";</code> to your app’s type declarations.
                Theme unchanged: put <code>data-theme</code> on <code>&lt;html&gt;</code>.
                Upgrading: update every installed kbui package to the same release.
              </p>
            </details>
          </>
        )}
        <div className="setup-next">
          <SiteLink
            className="primary-link"
            href={themePage ? `${siteRoot}components/` : `${siteRoot}setup/themes/`}
          >
            {themePage ? "Explore components" : "Choose your theme"} <LinkArrow />
          </SiteLink>
          <SiteLink className="plain-link" href={`${siteRoot}playground/`}>
            Try the playground
          </SiteLink>
        </div>
      </main>
    </SiteFrame>
  );
}
