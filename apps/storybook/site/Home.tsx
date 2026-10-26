import { useEffect, useRef } from "react";
import { PlanDemo } from "./PlanDemo";
import { InstallBuilder } from "./Setup";
import { installation, SiteFrame, SiteLink } from "./SiteFrame";

export function Home({
  storybookRoot = "./storybook/",
  siteRoot = "./",
}: {
  storybookRoot?: string;
  siteRoot?: string;
}) {
  const main = useRef<HTMLElement>(null);
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
            <p className="intro-tag">A small React component library.</p>
            <h1 id="home-title">
              <span className="hero-line">Click around.</span>{" "}
              <span className="hero-line">Make something.</span>
            </h1>
            <p className="hero-description">
              Ready-to-use components, shared tokens, and plain CSS. Try them here. Take the parts
              into your own project.
            </p>
            <div className="hero-links">
              <SiteLink className="primary-link" href={`${siteRoot}${installation}`}>
                Start building{" "}
                <span aria-hidden="true" className="link-arrow">
                  ↗
                </span>
              </SiteLink>
              <a className="plain-link" href={`${siteRoot}components/`}>
                See the components
              </a>
            </div>
            <p className="hero-footnote">Free to use. Yours to style.</p>
          </div>
          <div className="hero-example" id="examples" data-motion-phase="waiting">
            <PlanDemo />
          </div>
        </section>
        <section data-motion-phase="waiting" className="about-strip" aria-labelledby="about-title">
          <h2 id="about-title">
            A few parts.
            <br />A lot of uses.
          </h2>
          <p>
            A button, a field, a dialog. Small details that become the things people use every day.
            kbui gives them a shared foundation, while your app keeps its own character.
          </p>
          <ul className="part-tags" aria-label="Parts in the demo">
            <li>Button</li>
            <li>Input</li>
            <li>Dialog</li>
            <li>Card</li>
          </ul>
        </section>
        <section data-motion-phase="waiting" className="other-ways" aria-labelledby="ways-title">
          <div>
            <p className="section-kicker">A change of pace</p>
            <h2 id="ways-title">
              Same kit.
              <br />
              Other possibilities.
            </h2>
            <p>
              A reading page, a release queue, or a little experiment with color. These examples use
              the same components.
            </p>
          </div>
          <div className="example-links">
            <a href={`${siteRoot}examples/#editorial`}>
              <span className="example-shape shape-reading" aria-hidden="true" />
              <span>Something to read</span>
              <span aria-hidden="true" className="link-arrow">
                ↗
              </span>
            </a>
            <a href={`${siteRoot}examples/#operations`}>
              <span className="example-shape shape-work" aria-hidden="true" />
              <span>Something to keep moving</span>
              <span aria-hidden="true" className="link-arrow">
                ↗
              </span>
            </a>
            <a href={`${siteRoot}examples/#creative`}>
              <span className="example-shape shape-color" aria-hidden="true" />
              <span>Something a little different</span>
              <span aria-hidden="true" className="link-arrow">
                ↗
              </span>
            </a>
          </div>
        </section>
        <section data-motion-phase="waiting" className="take-it" aria-labelledby="take-title">
          <div>
            <p className="section-kicker">Your turn</p>
            <h2 id="take-title">What are you making?</h2>
            <p>
              Pick your package manager. Take the parts into your app.
              <a className="plain-link setup-continue" href={`${siteRoot}playground/`}>
                Open the playground <span className="link-arrow">↗</span>
              </a>
            </p>
          </div>
          <InstallBuilder siteRoot={siteRoot} compact />
        </section>
      </main>
    </SiteFrame>
  );
}
