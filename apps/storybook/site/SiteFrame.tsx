import type { ReactNode } from "react";
import { Brand } from "./Brand";
import "./site.css";
import "./motion.css";
import "./focus.css";

export const installation = "setup/";

export function SiteFrame({
  children,
  current,
  siteRoot,
  storybookRoot,
  className = "",
}: {
  children: ReactNode;
  current: "home" | "playground" | "examples" | "components" | "setup";
  siteRoot: string;
  storybookRoot: string;
  className?: string;
}) {
  return (
    <div className={`kbui-site ${className}`} id="top" data-theme="light">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="wordmark" href={siteRoot} aria-label="kbui home">
          <Brand />
        </a>
        <nav aria-label="Main navigation">
          <a
            href={`${siteRoot}playground/`}
            aria-current={current === "playground" ? "page" : undefined}
          >
            Playground
          </a>
          <a
            href={`${siteRoot}examples/`}
            aria-current={current === "examples" ? "page" : undefined}
          >
            Examples
          </a>
          <a
            href={`${siteRoot}components/`}
            aria-current={current === "components" ? "page" : undefined}
          >
            Components
          </a>
        </nav>
      </header>
      {children}
      <footer className="site-footer">
        <a className="wordmark" href={siteRoot} aria-label="kbui home">
          <Brand />
        </a>
        <span>React + CSS + tokens. MIT licensed.</span>
        <div>
          <a href={`${siteRoot}${installation}`}>Get started ↗</a>
          <a href={storybookRoot}>Documentation ↗</a>
          <a href="https://github.com/KhallilB/kbui">GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}
