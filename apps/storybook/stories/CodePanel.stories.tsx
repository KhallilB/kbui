import { Container, Heading } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { act, type ReactNode, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { CodeSample } from "../catalog/types";
import { CodePanel } from "../site/CodePanel";
import { InstallBuilder } from "../site/Setup";
import { SiteFrame } from "../site/SiteFrame";

function Page({ children }: { children: ReactNode }) {
  return (
    <SiteFrame current="setup" siteRoot="../" storybookRoot="./">
      <Container as="main" id="main" className="inner-page">
        <Heading level={1}>Read-only code</Heading>
        {children}
      </Container>
    </SiteFrame>
  );
}

function sample(snippet: string, comment = ""): CodeSample {
  return {
    code: `// Complete module differs from displayed source\n${snippet}`,
    tokens: [],
    snippet,
    snippetTokens: comment ? [[0, comment.length, "comment"]] : [],
  };
}

const comment = '/* Preserve "quotes", <tags> & symbols.\nSecond comment line. */';
const fixtures = [
  {
    name: "TSX",
    language: "React" as const,
    comment,
    source: `${comment}\nconst label = "<>& and \\"quotes\\"";\nexport const View = () => <div>{label}</div>;\n\n`,
  },
  {
    name: "CSS",
    language: "CSS" as const,
    comment,
    source: `${comment}\n.example::before { content: "${"long-value-".repeat(45)}<&>"; }\n`,
  },
  {
    name: "HTML",
    language: "HTML" as const,
    comment: "<!-- Preserve <tags> & quotes.\nSecond comment line. -->",
    source:
      '<!-- Preserve <tags> & quotes.\nSecond comment line. -->\n<button title="A &amp; B">&lt;literal&gt;</button>\n\n',
  },
  {
    name: "Shell",
    language: "Shell" as const,
    comment: "# Preserve quotes, <tags> & symbols.",
    source: '# Preserve quotes, <tags> & symbols.\nprintf \'%s\\n\' "a & b" "<literal>"\n',
  },
] as const;

async function clipboard(writeText: (value: string) => Promise<void>, run: () => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  try {
    await run();
  } finally {
    if (original) Object.defineProperty(navigator, "clipboard", original);
    else Reflect.deleteProperty(navigator, "clipboard");
  }
}

const meta = {
  title: "Site/CodePanel",
  component: CodePanel,
  args: { name: "Code", sample: sample(fixtures[0].source) },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Page>
        <Story />
      </Page>
    ),
  ],
  afterEach: ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    for (const element of canvasElement.querySelectorAll<HTMLElement>(".example-code-content")) {
      expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth + 1);
      if (element.clientHeight > 0)
        expect(element.clientHeight).toBeLessThanOrEqual(
          Math.min(440, window.innerHeight * 0.6) + 1,
        );
    }
  },
} satisfies Meta<typeof CodePanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Installation: Story = {
  render: () => <InstallBuilder siteRoot="../" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let copied = "";
    await clipboard(
      async (value) => {
        copied = value;
      },
      async () => {
        const source = canvas.getByRole("region", { name: "Install command" });
        expect(source.closest(".kb-codeblock[data-block]")).not.toBeNull();
        expect(source.querySelector('[data-syntax="function"]')).toHaveTextContent("npm");
        await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
        expect(copied).toBe(source.querySelector("code")?.textContent);
        expect(copied).toContain("npm install @kb.ui/react@");
        await userEvent.click(canvas.getByRole("combobox", { name: "Package manager" }));
        await userEvent.click(await within(document.body).findByRole("option", { name: "Bun" }));
        const copy = canvas.getByRole("button", { name: "Copy code" });
        expect(canvas.getByRole("status")).toBeEmptyDOMElement();
        await userEvent.click(copy);
        expect(copied).toBe(source.querySelector("code")?.textContent);
        expect(copied).toContain("bun add @kb.ui/react@");
      },
    );
  },
};

export const LanguagesAndClipboard: Story = {
  render: () => (
    <>
      {fixtures.map((fixture) => (
        <CodePanel
          key={fixture.name}
          name={fixture.name}
          language={fixture.language}
          sample={sample(fixture.source, fixture.comment)}
          regionLabel={`${fixture.name} source`}
          defaultOpen
        />
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let copied = "";
    await clipboard(
      async (value) => {
        copied = value;
      },
      async () => {
        for (const fixture of fixtures) {
          const panel = canvas.getByRole("region", {
            name: `${fixture.name} ${fixture.language} example`,
          });
          const view = within(panel);
          const source = view.getByRole("region", { name: `${fixture.name} source` });
          expect(source.closest(".kb-codeblock[data-block]")).not.toBeNull();
          expect(source.querySelector("code")?.textContent).toBe(fixture.source);
          expect(source.querySelector("code")?.innerText).toBe(fixture.source);
          const comments = [...source.querySelectorAll('[data-syntax="comment"]')]
            .map((node) => node.textContent)
            .join("")
            .replace(/\n/g, "");
          expect(comments).toBe(fixture.comment.replace(/\n/g, ""));
          expect(view.getAllByRole("button", { name: "Copy code" })).toHaveLength(1);
          expect(view.getAllByRole("status")).toHaveLength(1);
          await userEvent.click(view.getByRole("button", { name: "Copy code" }));
          expect(copied).toBe(fixture.source);
          expect(view.getByRole("status")).toHaveTextContent(
            `${fixture.name} code copied to clipboard.`,
          );
        }
      },
    );
  },
};

export const ManualCopyAndDisclosure: Story = {
  render: () => (
    <>
      <CodePanel
        name="Recovery"
        sample={sample(fixtures[0].source)}
        regionLabel="Recovery source"
      />
      <button type="button">After code</button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await clipboard(
      async () => {
        throw new Error("Clipboard denied");
      },
      async () => {
        const toggle = canvas.getByRole("button", { name: "View code" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(canvas.queryByRole("region", { name: "Recovery source" })).toBeNull();
        const hiddenSource = canvasElement.querySelector<HTMLElement>(".example-code-content");
        if (!hiddenSource) throw new Error("Source viewport missing");
        expect(getComputedStyle(hiddenSource).animationName).toBe("none");
        await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
        const source = canvas.getByRole("region", { name: "Recovery source" });
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(getComputedStyle(source).animationName).toBe(
          matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : "kbui-code-reveal",
        );
        await waitFor(() => expect(source).toHaveFocus());
        expect(canvas.getByRole("status")).toHaveTextContent(
          "Copy unavailable. Select the code below to copy.",
        );
        expect(source.querySelector("code")?.textContent).toBe(fixtures[0].source);
        await userEvent.tab();
        expect(canvas.getByRole("button", { name: "After code" })).toHaveFocus();
        await userEvent.click(toggle);
        expect(toggle).toHaveFocus();
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(canvas.queryByRole("region", { name: "Recovery source" })).toBeNull();
        expect(getComputedStyle(source).animationName).toBe("none");
      },
    );
  },
};

const longSource = (value: string) =>
  Array.from({ length: 50 }, (_, i) => `const ${value}${i} = "${"text ".repeat(20)}";`).join("\n") +
  "\n";
const longSources = [longSource("original"), longSource("changed")] as const;
function ChangingSource() {
  const [changed, setChanged] = useState(false);
  return (
    <>
      <CodePanel
        name="Changing"
        sample={sample(longSources[changed ? 1 : 0])}
        regionLabel="Changing source"
        defaultOpen
      />
      <button type="button" onClick={() => setChanged(true)}>
        Change source
      </button>
    </>
  );
}

export const SourceChanges: Story = {
  render: () => <ChangingSource />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let finish: (() => void) | undefined;
    await clipboard(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
      async () => {
        const source = canvas.getByRole("region", { name: "Changing source" });
        await waitFor(() => expect(source.scrollHeight).toBeGreaterThan(source.clientHeight));
        source.scrollTo({ top: 100 });
        expect(source.scrollTop).toBeGreaterThan(0);
        await userEvent.click(canvas.getByRole("button", { name: "Copy code" }));
        const change = canvas.getByRole("button", { name: "Change source" });
        await userEvent.click(change);
        await waitFor(() => expect(source.scrollTop).toBe(0));
        expect(source.querySelector("code")?.textContent).toBe(longSources[1]);
        expect(change).toHaveFocus();
        const resolveWrite = finish;
        if (!resolveWrite) throw new Error("Clipboard write did not start");
        await act(async () => resolveWrite());
        expect(canvas.getByRole("status")).toBeEmptyDOMElement();
        expect(canvas.getByRole("button", { name: "Copy code" })).toBeVisible();
        expect(change).toHaveFocus();
      },
    );
  },
};
