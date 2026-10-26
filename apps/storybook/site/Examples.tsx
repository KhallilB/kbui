import samples from "virtual:kbui-site-samples";
import { Badge, Button, Card, Progress, Stat, Status } from "@kbui/react";
import { useState } from "react";
import { Geometry } from "./Brand";
import { CodePanel } from "./CodePanel";
import { LinkArrow } from "./LinkArrow";
import { SiteFrame } from "./SiteFrame";
import "./examples.css";

type Surface = "Creative" | "Editorial" | "Operations";
const docs = (name: string, root: string) =>
  `${root}?path=/docs/components-${name.toLowerCase()}--docs`;

function CompositionView({
  surface,
  headingLevel = 3,
  storybookRoot = "./storybook/",
  palette,
  setPalette,
}: {
  surface: Surface;
  headingLevel?: 2 | 3;
  storybookRoot?: string;
  palette: boolean;
  setPalette: (value: boolean) => void;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  if (surface === "Editorial")
    return (
      <Card appearance="plain" className="composition editorial">
        <div className="sample-top">
          <span>FIELD NOTES</span>
          <Badge>Issue 004</Badge>
        </div>
        <span className="editorial-mark" aria-hidden="true">
          04
        </span>
        <Heading className="composition-title">Notes from the workshop.</Heading>
        <p>A reading layout using Card and Badge. Content stays in your app.</p>
        <div className="sample-bottom">
          <span>Card + Badge</span>
          <a href={docs("Card", storybookRoot)}>
            Explore Card <LinkArrow />
          </a>
        </div>
      </Card>
    );
  if (surface === "Operations")
    return (
      <Card appearance="plain" className="composition operations">
        <div className="sample-top">
          <span>RELEASE STATUS</span>
          <Status tone="success" appearance="chip">
            Healthy
          </Status>
        </div>
        <Heading className="composition-title">Release overview</Heading>
        <p>Progress, metrics, and status in one view.</p>
        <div className="stats">
          <Stat label="Builds complete" value="24" size="display" />
          <Stat label="Uptime · demo" value="99.9%" />
        </div>
        <Progress label="Release readiness" value={84} />
        <div className="sample-bottom">
          <span>Sample data</span>
          <a href={docs("Progress", storybookRoot)}>
            Explore Progress <LinkArrow />
          </a>
        </div>
      </Card>
    );
  return (
    <Card appearance="plain" className="composition creative">
      <div className="sample-top">
        <span>A change of palette</span>
        <Badge>SVG + CSS</Badge>
      </div>
      <Geometry alternate={palette} />
      <div className="sample-bottom">
        <div>
          <Heading className="composition-title">Color and composition</Heading>
          <p role="status" aria-label="Palette">
            <span className="palette-words" key={palette ? 1 : 0}>
              {palette ? "Apricot / Iris / Mint" : "Ochre / Rose / Sage"}
            </span>
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setPalette(!palette)}>
          Change palette
        </Button>
      </div>
    </Card>
  );
}

export function Composition({
  surface,
  headingLevel = 3,
  storybookRoot = "./storybook/",
  showCode = false,
}: {
  surface: Surface;
  headingLevel?: 2 | 3;
  storybookRoot?: string;
  showCode?: boolean;
}) {
  const [palette, setPalette] = useState(false);
  const key = surface === "Creative" ? `creative-${palette}` : surface.toLowerCase();
  const sample = samples.surfaces[key];
  if (!sample) throw new Error(`Missing composition code: ${key}`);
  return (
    <>
      <CompositionView
        surface={surface}
        headingLevel={headingLevel}
        storybookRoot={storybookRoot}
        palette={palette}
        setPalette={setPalette}
      />
      {showCode && (
        <CodePanel sample={sample} name={surface} regionLabel={`${surface} example code`} />
      )}
    </>
  );
}

const examples = [
  {
    id: "editorial",
    surface: "Editorial",
    title: "Something to read",
    description: "A quieter reading layout. Type, spacing, and a few useful details.",
    parts: "Card · Badge",
  },
  {
    id: "operations",
    surface: "Operations",
    title: "Something to keep moving",
    description: "A release at a glance. Progress, status, and the numbers that go with them.",
    parts: "Card · Stat · Status · Progress",
  },
  {
    id: "creative",
    surface: "Creative",
    title: "Something a little different",
    description: "Flat geometry and a change of color. Try another palette.",
    parts: "Card · Badge · Button",
  },
] as const;

export function Examples({
  siteRoot = "../",
  storybookRoot = "../storybook/",
}: {
  siteRoot?: string;
  storybookRoot?: string;
}) {
  return (
    <SiteFrame
      current="examples"
      className="kbui-examples"
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
    >
      <main id="main" className="inner-page">
        <div className="page-heading">
          <p className="page-kicker">Examples</p>
          <h1>
            See the parts <em>come together.</em>
          </h1>
          <p>Three small compositions. Same components, different jobs.</p>
        </div>
        <nav className="example-index" aria-label="Example navigation">
          <a href={`${siteRoot}compare/`}>
            Try the workspace <LinkArrow />
          </a>
          {examples.map(({ id, title }) => (
            <a key={id} href={`#${id}`}>
              {title}
            </a>
          ))}
        </nav>
        {examples.map(({ id, surface, title, description, parts }) => (
          <section key={id} id={id} className="example-section" aria-labelledby={`${id}-title`}>
            <div className="example-description">
              <p className="page-kicker">{parts}</p>
              <h2 id={`${id}-title`}>{title}</h2>
              <p>{description}</p>
            </div>
            <Composition surface={surface} storybookRoot={storybookRoot} showCode />
          </section>
        ))}
      </main>
    </SiteFrame>
  );
}
