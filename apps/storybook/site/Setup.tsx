import samples from "virtual:kbui-setup-samples";
import { Button, RadioGroup } from "@kb.ui/react";
import { useEffect, useId, useState } from "react";
import { CodePanel } from "./CodePanel";
import { ControlSelect } from "./ControlSelect";
import { LinkArrow } from "./LinkArrow";
import { SiteFrame, SiteLink } from "./SiteFrame";
import {
  bundlesCss,
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
  const [tokenHelpOpen, setTokenHelpOpen] = useState(options.tokens);
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
      </div>
      <p className="setup-note">
        kbui {releaseVersion} · React 19+ · Component styles and CSS tokens included.
      </p>
      <CodePanel
        name="Install"
        language="Shell"
        regionLabel="Install command"
        sample={samples[`${options.manager}-${options.tokens}`]}
        defaultOpen
      />
      <details
        className="install-token-help"
        open={tokenHelpOpen}
        onToggle={(event) => setTokenHelpOpen(event.currentTarget.open)}
      >
        <summary>Using tokens in JavaScript or TypeScript?</summary>
        <p>
          CSS variables work straight away. The optional <code>@kb.ui/tokens</code> package adds
          typed variable names, such as <code>tokens.color.accent</code>. It returns
          <code> --kb-color-accent</code>, so use it inside <code>var()</code> in your styles.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => update({ ...options, tokens: !options.tokens })}
        >
          {options.tokens ? "Remove typed tokens" : "Add typed tokens"}
        </Button>
      </details>
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
                Your first <em>kbui component.</em>
              </>
            )}
          </h1>
          <p>
            {themePage
              ? "Start with light, dark, or your visitor’s system setting. Then make it feel like your app."
              : "One package and one stylesheet. Add kbui to your React app, then make something with it."}
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
                <h2 id={`${id}-theme`}>Choose a starting point.</h2>
                <p>
                  Put the theme on your app’s HTML element. Leave it unset to follow your visitor’s
                  system setting. There’s no provider to set up.
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
            <p className="setup-note">
              The default theme uses monochrome surfaces and persimmon accents, with raised controls
              and cards. Previews follow the current source; installed packages follow the release
              you choose.
            </p>
            <section className="setup-step">
              <div>
                <p className="page-kicker">02 / Restyle</p>
                <h2>Use the CSS you already know.</h2>
                <p>
                  Give a component your own <code>className</code>. Use <code>classNames</code> to
                  reach its inner parts. Plain CSS, CSS Modules, and Tailwind work with kbui’s
                  cascade layer. For a change across your app, override a design token.
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
                More ways to style kbui <LinkArrow />
              </a>{" "}
              <a
                className="plain-link"
                href={`${storybookRoot}?path=/docs/components-button--docs`}
              >
                Explore Button <LinkArrow />
              </a>
            </p>
          </>
        ) : (
          <>
            <section className="setup-step" aria-labelledby={`${id}-install`}>
              <div>
                <p className="page-kicker">01 / Install</p>
                <h2 id={`${id}-install`}>Add it to your app.</h2>
                <p>
                  Run the command from your app’s folder.{" "}
                  {bundlesCss()
                    ? "The React package includes components, styles, and CSS tokens."
                    : "Install the matching React and CSS packages from this release."}{" "}
                  Your app needs React and React DOM 19 or later.
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
                <h2>Import the styles. Add a button.</h2>
                <p>
                  Import the stylesheet once, where your app starts. Then use components wherever
                  you need them. Here’s a working first example.
                </p>
              </div>
              <CodePanel name="First component" sample={samples.usage} defaultOpen />
            </section>
            <section className="setup-step">
              <div>
                <p className="page-kicker">03 / Check</p>
                <h2>Check that everything matches.</h2>
                <p>
                  Run this from your app’s folder after installing or upgrading. It checks that
                  every installed kbui package uses the same version. Add it to your build checks
                  too.
                </p>
              </div>
              <CodePanel
                name="Version check"
                regionLabel="Version check command"
                language="Shell"
                sample={samples.versionCheck}
                defaultOpen
              />
            </section>
            <details className="setup-help">
              <summary>Need a hand?</summary>
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
          <Button
            className="primary-link"
            size="lg"
            nativeButton={false}
            role="link"
            render={
              <SiteLink href={themePage ? `${siteRoot}components/` : `${siteRoot}setup/themes/`} />
            }
          >
            {themePage ? "Explore components" : "Choose your theme"} <LinkArrow />
          </Button>
          <SiteLink className="plain-link" href={`${siteRoot}playground/`}>
            Try the playground
          </SiteLink>
        </div>
      </main>
    </SiteFrame>
  );
}
