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
  Status,
  Text,
} from "@kb.ui/react";
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
            SUPPORT HANDBOOK
          </Text>
          <Badge>Team guide</Badge>
        </div>
        <Heading level={headingLevel} size="xl" className="composition-title">
          Writing a useful bug report.
        </Heading>
        <Text size="lg">
          Include the steps to reproduce the issue, what you expected, and what happened instead.
          Copy any error code, such as <Code>PAYMENT_TIMEOUT</Code>, exactly as it appears so your
          team can trace the problem.
        </Text>
        <div className="sample-bottom">
          <Text as="span" size="sm" tone="muted">
            3 min read · Updated by the support team
          </Text>
          <Link href={docs("Heading", storybookRoot)}>
            Heading docs <LinkArrow />
          </Link>
        </div>
      </Card>
    );
  if (surface === "Operations")
    return (
      <Card className="composition operations">
        <div className="sample-top">
          <Text as="span" size="sm" tone="muted">
            RELEASE REVIEW
          </Text>
          <Status
            live
            tone={completed === checks.length ? "success" : "warning"}
            appearance="chip"
            aria-label="Release checks"
          >
            {completed === checks.length ? "Ready to publish" : "In review"}
          </Status>
        </div>
        <Heading level={headingLevel} size="xl" className="composition-title">
          Customer portal 2.8
        </Heading>
        <Text tone="muted">Billing history updates and clearer payment errors.</Text>
        <fieldset className="release-checks">
          <legend>Before publishing</legend>
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
        <Progress
          label="Review progress"
          value={Math.round((completed / checks.length) * 100)}
          valueText={`${completed} of ${checks.length} complete`}
        />
        <div className="sample-bottom">
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
          COMMUNITY EVENT
        </Text>
        <Badge>Draft invitation</Badge>
      </div>
      <Geometry alternate={palette} />
      <div className="sample-bottom">
        <div>
          <Heading level={headingLevel} size="lg" className="composition-title">
            Design systems, over coffee.
          </Heading>
          <Text size="sm">Thursday, 9:30 AM · Studio café</Text>
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
    title: "Help-center article",
    description: "Use this for support articles, onboarding guides, or product updates.",
  },
  {
    id: "operations",
    surface: "Operations",
    title: "Release checklist",
    description:
      "A final review before publishing a release. Keep the checks and their progress together.",
  },
  {
    id: "creative",
    surface: "Creative",
    title: "Campaign preview",
    description:
      "Use this for an event invitation, email banner, or announcement preview. Try the palette button to compare two treatments without changing the content.",
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
            See components <em>in context.</em>
          </h1>
          <p>Try a complete app demo, or explore three smaller examples with code you can adapt.</p>
        </div>
        <section className="workspace-example" aria-label="Interactive demo">
          <div>
            <p className="workspace-example-label">Interactive demo</p>
            <h2>See kbui in a working app.</h2>
            <p>Update workspace settings, filter the job queue, and retry a failed check.</p>
          </div>
          <Button
            variant="primary"
            nativeButton={false}
            role="link"
            render={<SiteLink href={`${siteRoot}compare/`} />}
          >
            Explore the workspace <LinkArrow />
          </Button>
        </section>
        {examples.map(({ id, surface, title, description }) => (
          <section key={id} id={id} className="example-section" aria-labelledby={`${id}-title`}>
            <div className="example-description">
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
