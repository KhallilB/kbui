import releases from "virtual:kbui-changelog";
import { Badge } from "@kbui/react";
import { useEffect } from "react";
import { type Release, releaseCounts, releaseHeadline } from "./changelog-model";
import { LinkArrow } from "./LinkArrow";
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

function ReleaseChanges({ release, siteRoot }: { release: Release; siteRoot: string }) {
  return (
    <>
      <ChangeList title="Breaking changes" items={release.breaking} tone="breaking" />
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
      <ChangeList title="Improvements" items={release.improvements} />
      <ChangeList title="Fixes" items={release.fixes} />
      {!releaseCounts(release) && !release.breaking.length && (
        <p className="release-quiet">Internal maintenance only.</p>
      )}
      {release.compareUrl && (
        <a className="compare-link" href={release.compareUrl}>
          Compare on GitHub <LinkArrow />
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
          <p className="page-kicker">Changelog</p>
          <h1>
            What changed <em>lately.</em>
          </h1>
          <p>Every release, newest first. New components open in the catalog.</p>
        </div>
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
                    <ReleaseChanges release={release} siteRoot={siteRoot} />
                  </div>
                ) : (
                  <details className="release-card">
                    <summary>
                      <span className="release-headline">{releaseHeadline(release)}</span>
                      <span className="release-counts">{releaseCounts(release)}</span>
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
