import { Container, Heading } from "@kb.ui/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GuideContent } from "../site/GuideContent";
import { SiteFrame } from "../site/SiteFrame";

const tsx = {
  language: "tsx",
  source: 'const label = "<>&";\nexport const View = () => <div>{label}</div>;\n\n',
};
const fixtures = [
  tsx,
  { language: "css", source: '.example::before { content: "<&>"; }\n' },
  { language: "html", source: '<button title="A &amp; B">&lt;literal&gt;</button>\n' },
  { language: "bash", source: 'printf \'%s\\n\' "a & b" "<literal>"' },
  { language: "unknown", source: 'unknown <>& "literal"\n' },
  { language: "", source: 'plain <>& "literal"' },
];
const fence = ({ language, source }: (typeof fixtures)[number]) =>
  `\n\n\`\`\`${language}\n${source}\n\`\`\``;
const inline = 'literal <>& "quotes"';
const markdown = `# Guide\n\nUse \`${inline}\` and [Heading](../../packages/react/docs/components/Heading.md).${fixtures.map(fence).join("")}\n\n<script>alert(1)</script>`;
const wide = `const value = "${"long-value-".repeat(70)}<&>";\n\n`;

const meta = {
  title: "Site/GuideContent",
  component: GuideContent,
  args: { markdown, path: "docs/guides/page-header.md", siteRoot: "../", linkTarget: "_top" },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <SiteFrame current="recipes" siteRoot="../" storybookRoot="./">
        <Container as="main" id="main" className="inner-page">
          <Heading level={1}>Guide code</Heading>
          <Story />
        </Container>
      </SiteFrame>
    ),
  ],
  afterEach: ({ canvasElement }) => {
    expect(canvasElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    for (const element of canvasElement.querySelectorAll<HTMLElement>(
      '.system-guide [tabindex="0"]',
    )) {
      expect(element.getBoundingClientRect().width).toBeLessThanOrEqual(window.innerWidth);
    }
  },
} satisfies Meta<typeof GuideContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InlineAndFences: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const literal = canvas.getByText(inline);
    expect(literal.tagName).toBe("CODE");
    expect(literal).toHaveClass("kb-code");
    expect(literal).not.toHaveAttribute("data-block");
    const blocks = [...canvasElement.querySelectorAll<HTMLElement>("pre code")];
    expect(blocks).toHaveLength(fixtures.length);
    for (const [index, fixture] of fixtures.entries()) {
      expect(blocks[index]?.textContent).toBe(fixture.source);
      expect(blocks[index]?.innerText).toBe(fixture.source);
      const block = blocks[index]?.closest(".kb-codeblock[data-block]");
      expect(block).not.toBeNull();
      expect(canvas.getByRole("region", { name: `Code example ${index + 1}` })).toContainElement(
        blocks[index] ?? null,
      );
      expect(block).toHaveAttribute(
        "data-language",
        fixture.language === "unknown" || !fixture.language ? "plain" : fixture.language,
      );
      if (fixture.language === "unknown" || !fixture.language)
        expect(block?.querySelector("[data-syntax]")).toBeNull();
    }
    expect(canvas.getByRole("link", { name: "Heading" })).toHaveAttribute(
      "href",
      "../components/?component=heading",
    );
    expect(canvas.getByRole("link", { name: "Heading" })).toHaveAttribute("target", "_top");
    expect(canvasElement.querySelector(".system-guide script")).toBeNull();
    expect(canvasElement.querySelector(".system-guide h1")).toBeNull();
    expect(canvasElement.querySelectorAll(".system-guide button")).toHaveLength(0);
    expect(canvasElement.querySelectorAll('.system-guide [role="status"]')).toHaveLength(0);
  },
};

export const RepeatedFences: Story = {
  args: { markdown: fence(tsx) + fence(tsx) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("region", { name: "Code example 1" })).toHaveTextContent("const label");
    expect(canvas.getByRole("region", { name: "Code example 2" })).toHaveTextContent("const label");
  },
};

export const SingleFence: Story = {
  args: { markdown: fence(tsx) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole("region", { name: "Code example 1" })).toHaveLength(1);
    expect(canvas.queryByRole("region", { name: "Code example 2" })).toBeNull();
    expect(canvasElement.querySelector("pre code")?.textContent).toBe(tsx.source);
  },
};

export const AttributedFence: Story = {
  args: { markdown: fence({ language: 'tsx id="attributed-source"', source: wide }) },
  play: async ({ canvasElement }) => {
    const source = canvasElement.querySelector<HTMLElement>('.system-guide pre[tabindex="0"]');
    if (!source) throw new Error("Attributed source viewport missing");
    expect(source.querySelector("code")).toHaveAttribute("id", "attributed-source");
    expect(source.querySelector("code")?.textContent).toBe(wide);
    expect(source.querySelector("code")?.innerText).toBe(wide);
    expect(source.querySelector("[data-block]")).toBeNull();
    expect(source.scrollWidth).toBeGreaterThan(source.clientWidth);
    expect(canvasElement.querySelectorAll('.system-guide [tabindex="0"]')).toHaveLength(1);
  },
};

export const FocusAndOverflow: Story = {
  render: (args) => (
    <>
      <button type="button">Before guide</button>
      <GuideContent {...args} markdown={`## Example${fence({ language: "tsx", source: wide })}`} />
      <button type="button">After guide</button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewports = canvasElement.querySelectorAll<HTMLElement>('.system-guide [tabindex="0"]');
    expect(viewports).toHaveLength(1);
    const source = viewports[0];
    if (!source) throw new Error("Guide source viewport missing");
    expect(source.querySelector("code")?.textContent).toBe(wide);
    expect(source.scrollWidth).toBeGreaterThan(source.clientWidth);
    await userEvent.click(canvas.getByRole("button", { name: "Before guide" }));
    await userEvent.tab();
    expect(source).toHaveFocus();
    source.scrollTo({ left: 120, behavior: "instant" });
    await waitFor(() => expect(source.scrollLeft).toBeGreaterThan(0));
    await userEvent.tab();
    expect(canvas.getByRole("button", { name: "After guide" })).toHaveFocus();
  },
};
