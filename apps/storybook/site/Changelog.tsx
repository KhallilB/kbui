import releases from "virtual:kbui-changelog";
import { Badge, Container, Heading, Text } from "@kb.ui/react";
import { useEffect } from "react";
import { type Release, releaseCopy, releaseHeadline } from "./changelog-model";
import { LinkArrow } from "./LinkArrow";
import { SiteFrame, SiteLink } from "./SiteFrame";
import "./changelog.css";

const releaseAnchor = (version: string) => `v${version}`;

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

function ChangeList({ title, items, tone }: { title: string; items: string[]; tone?: string }) {
  if (!items.length) return null;
  return (
    <div className="change-group" data-tone={tone}>
      <Heading level={3}>{title}</Heading>
      <ul className="change-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ReleaseChanges({
  release,
  siteRoot,
  latest = false,
}: {
  release: Release;
  siteRoot: string;
  latest?: boolean;
}) {
  const copy = releaseCopy(release);
  return (
    <>
      {latest && (
        <Heading level={3} className="release-title">
          {copy.title}
        </Heading>
      )}
      <ul
        className="change-list release-highlights"
        aria-label={`Highlights in ${release.version}`}
      >
        {copy.highlights.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <ChangeList title="Before you upgrade" items={copy.upgrade} tone="breaking" />
      {release.components.length > 0 && (
        <div className="change-group">
          <Heading level={3}>New components</Heading>
          <ul className="component-chips">
            {release.components.map((name) => (
              <li key={name}>
                <SiteLink href={`${siteRoot}components/?component=${name.toLowerCase()}`}>
                  {name} <LinkArrow />
                </SiteLink>
              </li>
            ))}
          </ul>
        </div>
      )}
      {release.compareUrl && (
        <a className="compare-link" href={release.compareUrl}>
          Full history on GitHub <LinkArrow />
        </a>
      )}
    </>
  );
}

export function Changelog({
  storybookRoot = "../storybook/",
  siteRoot = "../",
}: {
  storybookRoot?: string;
  siteRoot?: string;
}) {
  useEffect(() => {
    // Collapsed releases open when a link targets them.
    const reveal = () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      const details = target.querySelector("details");
      if (details) details.open = true;
      // Initial load: browser looked for the anchor before React rendered it.
      target.scrollIntoView();
    };
    reveal();
    addEventListener("hashchange", reveal);
    return () => removeEventListener("hashchange", reveal);
  }, []);
  return (
    <SiteFrame
      current="changelog"
      className="kbui-changelog"
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
    >
      <Container as="main" id="main" className="inner-page">
        <div className="page-heading">
          <Text className="page-kicker">Release notes</Text>
          <Heading level={1}>
            What's new <em>in kbui.</em>
          </Heading>
          <Text>
            A short guide to each release. Choose a version, or explore the latest changes below.
          </Text>
        </div>
        <nav className="release-navigation" aria-label="Browse releases">
          {releases.map((release) => (
            <a
              key={release.version}
              href={`#${releaseAnchor(release.version)}`}
              aria-label={`Version ${release.version}: ${releaseHeadline(release)}`}
              title={releaseHeadline(release)}
            >
              {release.version}
            </a>
          ))}
        </nav>
        <div className="release-list">
          {releases.map((release, index) => {
            const anchor = releaseAnchor(release.version);
            return (
              <article
                key={release.version}
                id={anchor}
                className="release"
                aria-labelledby={`${anchor}-title`}
              >
                <div className="release-rail">
                  <Heading level={2} id={`${anchor}-title`}>
                    <span className="kb-sr-only">Version </span>
                    {release.version}
                  </Heading>
                  <time dateTime={release.date}>{formatDate(release.date)}</time>
                  {index === 0 && <Badge>Latest</Badge>}
                </div>
                {index === 0 ? (
                  <div className="release-card">
                    <ReleaseChanges release={release} siteRoot={siteRoot} latest />
                  </div>
                ) : (
                  <details className="release-card">
                    <summary>
                      <span className="release-headline">{releaseHeadline(release)}</span>
                    </summary>
                    <ReleaseChanges release={release} siteRoot={siteRoot} />
                  </details>
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </SiteFrame>
  );
}
