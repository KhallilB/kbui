import references from "virtual:kbui-reference";
import {
  Controls,
  Description,
  DocsContainer,
  type DocsContainerProps,
  Primary,
  Stories,
  Title,
  useOf,
} from "@storybook/addon-docs/blocks";
import { type PropsWithChildren, useEffect, useLayoutEffect, useState } from "react";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import type { ComponentReference } from "../catalog/types";
import { readThemePreference, type ThemePreference } from "../site/site-theme";
import { referencePreference, resolveTheme, storybookThemes } from "./theme";

export function useReferenceTheme(preference: ThemePreference) {
  const [hostTheme, setHostTheme] = useState<ThemePreference | null>(() => {
    const value = window.frameElement?.getAttribute("data-preview-theme");
    return value === "light" || value === "dark" ? value : null;
  });
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);
  const theme = resolveTheme(hostTheme ?? preference, systemDark);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useLayoutEffect(() => {
    if (window.parent === window) return;
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== location.origin) return;
      if (event.data?.type !== "kbui:theme") return;
      if (event.data.theme === "light" || event.data.theme === "dark")
        setHostTheme(event.data.theme);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "kbui:theme-ready" }, location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return theme;
}

export function ReferenceDocs({ children, context }: PropsWithChildren<DocsContainerProps>) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    const story = context.componentStories()[0];
    const value = story ? context.getStoryContext(story).globals.theme : undefined;
    return value === "light" || value === "dark" || value === "system"
      ? value
      : referencePreference(
          new URLSearchParams(location.search).get("globals"),
          readThemePreference(),
        );
  });
  const theme = useReferenceTheme(preference);
  useEffect(() => {
    const update = ({ globals }: { globals: Record<string, unknown> }) => {
      const value = globals.theme;
      if (value === "light" || value === "dark" || value === "system") setPreference(value);
    };
    context.channel.on(GLOBALS_UPDATED, update);
    return () => context.channel.off(GLOBALS_UPDATED, update);
  }, [context.channel]);
  return (
    <DocsContainer context={context} theme={storybookThemes[theme]}>
      {children}
    </DocsContainer>
  );
}

export function ReferencePage() {
  const { preparedMeta } = useOf("meta");
  const name = preparedMeta.title.split("/").at(-1) ?? "";
  const reference = references[name];
  const { story } = useOf("story");
  const controls = Object.entries(story.argTypes)
    .filter(([key, field]) => {
      if (
        ["className", "classNames", "style", "ref", "render", "value", "checked", "items"].includes(
          key,
        )
      )
        return false;
      if (story.initialArgs[key] !== null && typeof story.initialArgs[key] === "object")
        return false;
      const control = field.control;
      return control && (typeof control !== "object" || !["object", "file"].includes(control.type));
    })
    .map(([key]) => key);
  if (!reference)
    return (
      <>
        <Title />
        <Description />
        <Primary />
        <Controls />
        <Stories includePrimary={false} />
      </>
    );
  return (
    <>
      <p className="reference-kicker">Component reference</p>
      <Title />
      <p className="reference-description">{reference.description}</p>
      <p className="reference-use">{reference.guide.use}</p>
      <nav className="reference-sections" aria-label={`${name} on this page`}>
        <a href="#reference-preview">Example</a>
        <a href="#reference-props">Props & parts</a>
        <a href="#reference-accessibility">Accessibility</a>
        <a href="#reference-examples">More examples</a>
      </nav>
      <section
        id="reference-preview"
        className="reference-section"
        aria-labelledby="reference-preview-title"
      >
        <h2 id="reference-preview-title">{reference.guide.example.title}</h2>
        <p>{reference.guide.example.description}</p>
        <Primary />
        {Object.keys(story.initialArgs).length > 0 && controls.length > 0 && (
          <details className="reference-controls">
            <summary>Try the props</summary>
            <p>
              Adjust the example’s arguments here. Stateful examples keep their own current value.
            </p>
            <Controls include={controls} />
          </details>
        )}
      </section>
      <section
        id="reference-props"
        className="reference-section"
        aria-labelledby="reference-props-title"
      >
        <h2 id="reference-props-title">Props & parts</h2>
        <ul>
          {reference.guide.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <ReferenceProps reference={reference} />
        <p className="reference-api-note">
          Types and defaults follow the same{" "}
          <a
            href={`https://github.com/KhallilB/kbui/blob/main/packages/react/README.md#${name.toLowerCase()}`}
          >
            package reference
          </a>{" "}
          used by the component site. Native props remain available where the component supports
          them.
        </p>
      </section>
      <section
        id="reference-accessibility"
        className="reference-section reference-accessibility"
        aria-labelledby="reference-accessibility-title"
      >
        <h2 id="reference-accessibility-title">Accessibility</h2>
        <ul>
          {reference.guide.accessibility.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
      <section id="reference-examples" className="reference-section">
        <Stories title="More examples" includePrimary={false} />
        {name === "Dialog" && (
          <>
            <h2>Explore dialog layouts</h2>
            <p>Inspect open layouts in their own preview so they do not cover these docs.</p>
            <div className="reference-sections">
              <a href="./?path=/story/components-dialog--custom-layout" target="_top">
                Custom title and description
              </a>
              <a href="./?path=/story/components-dialog--sections" target="_top">
                Header, body, and footer
              </a>
              <a href="./?path=/story/components-dialog--open" target="_top">
                Open state
              </a>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function InlineCode({ text }: { text: string }) {
  let offset = 0;
  return text.split(/(`[^`]+`)/g).map((part) => {
    const key = offset;
    offset += part.length;
    return part.startsWith("`") ? <code key={key}>{part.slice(1, -1)}</code> : part;
  });
}

function ReferenceProps({ reference }: { reference: ComponentReference }) {
  return (
    <div className="reference-api">
      {reference.tables.map((table) => (
        <section
          className="reference-table-scroll"
          key={table.headers.join("|")}
          aria-label={`${reference.name} API columns`}
        >
          <table>
            <caption>{reference.name} API</caption>
            <thead>
              <tr>
                {table.headers.map((header) => (
                  <th scope="col" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.join("|")}>
                  {row.map((cell, index) => (
                    <td key={table.headers[index]}>
                      <InlineCode text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
