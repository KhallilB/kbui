import releases from "virtual:kbui-changelog";
import { Badge } from "@kb.ui/react";
import { useEffect } from "react";
import { type Release, releaseHeadline } from "./changelog-model";
import { LinkArrow } from "./LinkArrow";
import { releaseNotes } from "./release-notes";
import { SiteFrame } from "./SiteFrame";
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
      <h3>{title}</h3>
      <ul className="change-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReleaseChanges({
  release,
  siteRoot,
  latest = false,
}: {
  release: Release;
  siteRoot: string;
  latest?: boolean;
}) {
  const copy = releaseNotes[release.version];
  return (
    <>
      {latest && <h3 className="release-title">{releaseHeadline(release)}</h3>}
      {copy && (
        <ul
          className="change-list release-highlights"
          aria-label={`Highlights in ${release.version}`}
        >
          {copy.highlights.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      <ChangeList
        title="Before you upgrade"
        items={copy?.upgrade ?? release.breaking}
        tone="breaking"
      />
      {release.components.length > 0 && (
        <div className="change-group">
          <h3>New components</h3>
          <ul className="component-chips">
            {release.components.map((name) => (
              <li key={name}>
                <a href={`${siteRoot}components/?component=${name.toLowerCase()}`}>
                  {name} <LinkArrow />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!copy && <p className="release-quiet">See the full history for this release on GitHub.</p>}
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
      <main id="main" className="inner-page">
        <div className="page-heading">
          <p className="page-kicker">Release notes</p>
          <h1>
            What's new <em>in kbui.</em>
          </h1>
          <p>
            A short guide to each release. Choose a version, or explore the latest changes below.
          </p>
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
                  <h2 id={`${anchor}-title`}>
                    <span className="kb-sr-only">Version </span>
                    {release.version}
                  </h2>
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
      </main>
    </SiteFrame>
  );
}
