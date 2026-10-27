import samples from "virtual:kbui-site-samples";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Code,
  Grid,
  Heading,
  Link,
  Progress,
  Stat,
  Status,
  Text,
} from "@kbui/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Geometry } from "./Brand";
import { CodePanel } from "./CodePanel";
import { releaseSampleKey, releaseSteps } from "./example-model";
import { LinkArrow } from "./LinkArrow";
import { SiteFrame, SiteLink } from "./SiteFrame";
import "./examples.css";

type Surface = "Creative" | "Editorial" | "Operations";
const docs = (name: string, root: string) =>
  `${root}?path=/docs/${name === "Grid" ? "layout" : "components"}-${name.toLowerCase()}--docs`;

function CompositionView({
  surface,
  headingLevel = 3,
  storybookRoot = "./storybook/",
  palette,
  setPalette,
  checks,
  setChecks,
}: {
  surface: Surface;
  headingLevel?: 2 | 3;
  storybookRoot?: string;
  palette: boolean;
  setPalette: (value: boolean) => void;
  checks: boolean[];
  setChecks: Dispatch<SetStateAction<boolean[]>>;
}) {
  const completed = checks.filter(Boolean).length;
  if (surface === "Editorial")
    return (
      <Card className="composition editorial">
        <div className="sample-top">
          <Text as="span" size="sm" tone="muted">
            FIELD NOTES
          </Text>
          <Badge>Issue 004</Badge>
        </div>
        <span className="editorial-mark" aria-hidden="true">
          04
        </span>
        <Heading level={headingLevel} size="display" className="composition-title">
          Notes from the workshop.
        </Heading>
        <Text size="lg">
          Start with a clear heading, then give each idea room to breathe. Use <Code>Heading</Code>{" "}
          for the outline and <Code>Text</Code> for reading rhythm.
        </Text>
        <div className="sample-bottom">
          <Text as="span" size="sm" tone="muted">
            4 minute read · Issue 004
          </Text>
          <Link href={docs("Heading", storybookRoot)}>
            Explore Heading <LinkArrow />
          </Link>
        </div>
      </Card>
    );
  if (surface === "Operations")
    return (
      <Card className="composition operations">
        <div className="sample-top">
          <Text as="span" size="sm" tone="muted">
            RELEASE CHECKLIST
          </Text>
          <Status
            live
            tone={completed === checks.length ? "success" : "warning"}
            appearance="chip"
            aria-label="Release checks"
          >
            {completed === checks.length ? "Checks complete" : "Checks pending"}
          </Status>
        </div>
        <Heading level={headingLevel} size="xl" className="composition-title">
          Release overview
        </Heading>
        <Text tone="muted">Complete the checklist. Readiness follows your selections.</Text>
        <fieldset className="release-checks">
          <legend>Before you release</legend>
          <Grid layout="stack">
            {releaseSteps.map((label, index) => (
              <Checkbox
                key={label}
                label={label}
                checked={checks[index] ?? false}
                onCheckedChange={(checked) =>
                  setChecks((current) =>
                    current.map((value, position) => (position === index ? checked : value)),
                  )
                }
              />
            ))}
          </Grid>
        </fieldset>
        <div className="stats">
          <Stat label="Checks complete" value={`${completed}/${checks.length}`} size="display" />
          <Stat label="Checks remaining" value={checks.length - completed} />
        </div>
        <Progress label="Release readiness" value={Math.round((completed / checks.length) * 100)} />
        <div className="sample-bottom">
          <Text as="span" size="sm" tone="muted">
            Local demo
          </Text>
          <Button
            variant="secondary"
            size="sm"
            disabled={completed === 0}
            onClick={() => setChecks((current) => current.map(() => false))}
          >
            Reset checklist
          </Button>
        </div>
      </Card>
    );
  return (
    <Card
      className="composition creative"
      style={{ borderColor: palette ? "var(--kb-color-accent-ink)" : "var(--kb-color-border)" }}
    >
      <div className="sample-top">
        <Text as="span" size="sm" tone="muted">
          A change of palette
        </Text>
        <Badge>Semantic tokens</Badge>
      </div>
      <Geometry alternate={palette} />
      <div className="sample-bottom">
        <div>
          <Heading level={headingLevel} size="lg" className="composition-title">
            Color and composition
          </Heading>
          <Text size="sm" role="status" aria-label="Palette">
            <span className="palette-words" key={palette ? 1 : 0}>
              {palette ? "Persimmon / Marigold / Lilac · vivid" : "Persimmon / Marigold / Lilac"}
            </span>
          </Text>
        </div>
        <Button
          variant={palette ? "primary" : "secondary"}
          size="sm"
          aria-pressed={palette}
          onClick={() => setPalette(!palette)}
        >
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
  const [checks, setChecks] = useState(() => releaseSteps.map(() => false));
  const key =
    surface === "Creative"
      ? `creative-${palette}`
      : surface === "Operations"
        ? releaseSampleKey(checks)
        : surface.toLowerCase();
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
        checks={checks}
        setChecks={setChecks}
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
    title: "A quiet place to read",
    description:
      "Keep heading rank separate from visual size. Compose readable text, literal code and recognizable links inside one semantic article.",
    parts: ["Card", "Badge", "Heading", "Text", "Link", "Code"],
  },
  {
    id: "operations",
    surface: "Operations",
    title: "A release overview",
    description:
      "Own checkbox state once. Derive Status, Stat and Progress from the same selections, then reset the workflow without duplicating state.",
    parts: ["Card", "Checkbox", "Grid", "Stat", "Status", "Progress", "Button"],
  },
  {
    id: "creative",
    surface: "Creative",
    title: "A space to play with color",
    description:
      "Keep shared controls and behavior. Change a Card border with a semantic color token and switch Button variants; both follow the page theme.",
    parts: ["Card", "Badge", "Heading", "Text", "Button"],
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
            See what you can <em>build with it.</em>
          </h1>
          <p>
            Content, a controlled workflow, a change of visual character. Try each pattern, explore
            its components and copy the code with its current state.
          </p>
        </div>
        <nav className="example-index" aria-label="Example navigation">
          <Button
            variant="secondary"
            nativeButton={false}
            role="link"
            render={<SiteLink href={`${siteRoot}compare/`} />}
          >
            Try the workspace <LinkArrow />
          </Button>
          {examples.map(({ id, title }) => (
            <a key={id} href={`#${id}`}>
              {title}
            </a>
          ))}
        </nav>
        {examples.map(({ id, surface, title, description, parts }) => (
          <section key={id} id={id} className="example-section" aria-labelledby={`${id}-title`}>
            <div className="example-description">
              <nav className="example-components" aria-label={`${surface} components`}>
                {parts.map((name) => (
                  <Link key={name} href={docs(name, storybookRoot)}>
                    {name}
                  </Link>
                ))}
              </nav>
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
