import releases from "virtual:kbui-changelog";
import { Button } from "@kbui/react";
import { useEffect, useRef } from "react";
import { releaseHeadline } from "./changelog-model";
import { LinkArrow } from "./LinkArrow";
import { PlanDemo } from "./PlanDemo";
import { InstallBuilder } from "./Setup";
import { installation, SiteFrame, SiteLink } from "./SiteFrame";
import "./home.css";

const demoParts = [
  [
    "Card",
    "Give your plan a home",
    "The plan, choices, and actions in one place.",
    "M5 5h26v22H5z M5 12h26 M10 17h9 M10 22h15",
  ],
  [
    "Button",
    "Make it your own",
    "Change the name or start over.",
    "M10 10h16a8 8 0 0 1 0 16H10a8 8 0 0 1 0-16z M14 18h8 M19 15l3 3-3 3",
  ],
  [
    "Dialog",
    "Edit without losing your place",
    "Make a quick change, then get back to your plan.",
    "M4 6h24v20H4z M10 12h24v18H10z M16 18h9 M16 23h12",
  ],
  [
    "Input",
    "Make room for the details",
    "Name your day or leave yourself a note.",
    "M4 11h28v15H4z M10 17v4 M17 15v8 M15 15h4 M15 23h4",
  ],
  [
    "Progress",
    "Keep track of your picks",
    "See how many activities you've chosen.",
    "M4 14h28v8H4z M4 14h17v8H4 M9 10h5 M24 26h8",
  ],
  [
    "Status",
    "See what changed",
    "Get an update as you put your plan together.",
    "M13 18a5 5 0 1 1-10 0 5 5 0 0 1 10 0z M19 14h13 M19 22h9",
  ],
] as const;

export function Home({
  storybookRoot = "./storybook/",
  siteRoot = "./",
}: {
  storybookRoot?: string;
  siteRoot?: string;
}) {
  const main = useRef<HTMLElement>(null);
  const [latest] = releases;
  useEffect(() => {
    const root = main.current;
    if (!root) return;
    const groups = Array.from(root.querySelectorAll<HTMLElement>("[data-motion-phase]"));
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const reveal = (group: HTMLElement) => {
      group.dataset.motionPhase = "ready";
    };
    if (preference.matches || typeof IntersectionObserver === "undefined") {
      groups.forEach(reveal);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
    );
    groups.forEach((group) => {
      observer.observe(group);
    });
    const release = () => {
      if (!preference.matches) return;
      groups.forEach(reveal);
      observer.disconnect();
    };
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      for (const group of groups) {
        if (group.contains(event.target)) {
          reveal(group);
          observer.unobserve(group);
        }
      }
    };
    preference.addEventListener("change", release);
    root.addEventListener("focusin", focus);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", release);
      root.removeEventListener("focusin", focus);
    };
  }, []);
  return (
    <SiteFrame
      current="home"
      className="kbui-home"
      siteRoot={siteRoot}
      storybookRoot={storybookRoot}
    >
      <main id="main" ref={main}>
        <section data-motion-phase="waiting" className="poster-hero" aria-labelledby="home-title">
          <div className="poster-copy">
            {latest ? (
              <SiteLink
                className="intro-tag release-pill"
                href={`${siteRoot}changelog/#v${latest.version}`}
              >
                <span className="kb-sr-only">What's new in </span>
                <span className="release-version">v{latest.version}</span>
                <span>{releaseHeadline(latest)}</span>
                <LinkArrow />
              </SiteLink>
            ) : (
              <p className="intro-tag">A small React component library.</p>
            )}
            <h1 id="home-title">
              <span className="hero-line">Click around.</span>{" "}
              <span className="hero-line">Make something.</span>
            </h1>
            <p className="hero-description">
              Buttons, forms, and the rest of your interface. Start with kbui, style it with CSS,
              and make it feel like your app.
            </p>
            <div className="hero-links">
              <Button
                className="primary-link"
                size="lg"
                nativeButton={false}
                role="link"
                render={<SiteLink href={`${siteRoot}${installation}`} />}
              >
                Start building <LinkArrow />
              </Button>
              <SiteLink className="plain-link" href={`${siteRoot}components/`}>
                See the components
              </SiteLink>
            </div>
            <p className="hero-footnote">Open source. Free to use.</p>
          </div>
          <div className="hero-example" id="examples" data-motion-phase="waiting">
            <PlanDemo />
          </div>
        </section>
        <section data-motion-phase="waiting" className="about-strip" aria-labelledby="about-title">
          <h2 id="about-title">
            The parts behind
            <br />
            <em>your day off.</em>
          </h2>
          <p>
            The planner above is built with kbui. Use these parts together, or take the ones you
            need. They share the same styles, and you can change those to suit your app.
          </p>
          <ul className="part-tags" aria-label="Components behind the demo">
            {demoParts.map(([name, purpose, detail, path], index) => (
              <li key={name}>
                <SiteLink href={`${siteRoot}components/?component=${name.toLowerCase()}`}>
                  <span className="part-meta">
                    <span>
                      0{index + 1} / {name}
                    </span>
                    <span aria-hidden="true">↗</span>
                  </span>
                  <svg
                    className="part-glyph"
                    viewBox="0 0 36 36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={path} />
                  </svg>
                  <strong>{purpose}</strong>
                  <span className="part-detail">{detail}</span>
                </SiteLink>
              </li>
            ))}
          </ul>
          <p className="parts-more">
            More controls to build with:{" "}
            <SiteLink href={`${siteRoot}components/?component=checkbox`}>Checkbox</SiteLink>,{" "}
            <SiteLink href={`${siteRoot}components/?component=select`}>Select</SiteLink>,{" "}
            <SiteLink href={`${siteRoot}components/?component=radiogroup`}>RadioGroup</SiteLink>,
            and <SiteLink href={`${siteRoot}components/?component=switch`}>Switch</SiteLink>.
          </p>
        </section>
        <section data-motion-phase="waiting" className="other-ways" aria-labelledby="ways-title">
          <div>
            <p className="section-kicker">More ways to use kbui</p>
            <h2 id="ways-title">
              Same components.
              <br />A different feel.
            </h2>
            <p>
              A place to read, a queue to keep work moving, or a space to play with color. These all
              start with the same kit.
            </p>
          </div>
          <div className="example-links">
            <SiteLink href={`${siteRoot}examples/#editorial`}>
              <span className="example-shape shape-reading" aria-hidden="true" />
              <span>A quiet place to read</span>
              <span aria-hidden="true">↗</span>
            </SiteLink>
            <SiteLink href={`${siteRoot}examples/#operations`}>
              <span className="example-shape shape-work" aria-hidden="true" />
              <span>A release overview</span>
              <span aria-hidden="true">↗</span>
            </SiteLink>
            <SiteLink href={`${siteRoot}examples/#creative`}>
              <span className="example-shape shape-color" aria-hidden="true" />
              <span>A color playground</span>
              <span aria-hidden="true">↗</span>
            </SiteLink>
          </div>
        </section>
        <section data-motion-phase="waiting" className="take-it" aria-labelledby="take-title">
          <div>
            <p className="section-kicker">Ready when you are</p>
            <h2 id="take-title">What are you making?</h2>
            <p>
              Add kbui to your project, then try a few ideas in the playground.{" "}
              <SiteLink className="plain-link setup-continue" href={`${siteRoot}playground/`}>
                Open the playground ↗
              </SiteLink>
            </p>
          </div>
          <InstallBuilder siteRoot={siteRoot} compact />
        </section>
      </main>
    </SiteFrame>
  );
}
