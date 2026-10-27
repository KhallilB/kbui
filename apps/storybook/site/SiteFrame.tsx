import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Brand } from "./Brand";
import { LinkArrow } from "./LinkArrow";
import { readSiteTheme, retainSiteTheme, standaloneSite } from "./site-theme";
import { ThemeToggle } from "./ThemeToggle";
import "./site.css";
import "./motion.css";
import "./focus.css";
import "./review-theme.css";
import "./site-accent.css";

export const installation = "setup/";
const SiteThemeContext = createContext<"light" | "dark">("light");

function themedHref(href: string, theme: "light" | "dark") {
  if (theme === "light") return href;
  const [path = "", hash] = href.split("#", 2);
  const [pathname = "", search = ""] = path.split("?", 2);
  const query = new URLSearchParams(search);
  query.set("theme", theme);
  return `${pathname}?${query}${hash === undefined ? "" : `#${hash}`}`;
}

export function useSiteTheme() {
  return useContext(SiteThemeContext);
}

export function SiteLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  const theme = useContext(SiteThemeContext);
  return <a {...props} href={themedHref(href, theme)} />;
}

export function SiteFrame({
  children,
  current,
  siteRoot,
  storybookRoot,
  className = "",
  theme,
  onThemeChange,
}: {
  children: ReactNode;
  current: "home" | "playground" | "examples" | "components" | "setup";
  siteRoot: string;
  storybookRoot: string;
  className?: string;
  theme?: "light" | "dark";
  onThemeChange?: (value: "light" | "dark") => void;
}) {
  const header = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = header.current;
    if (!element) return;
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--site-header-height");
    const measure = () => {
      const height = `${Math.ceil(element.getBoundingClientRect().height)}px`;
      root.style.setProperty("--site-header-height", height);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => {
      observer.disconnect();
      if (previous) root.style.setProperty("--site-header-height", previous);
      else root.style.removeProperty("--site-header-height");
    };
  }, []);
  const [localTheme, setLocalTheme] = useState(readSiteTheme);
  const activeTheme = theme ?? localTheme;
  useLayoutEffect(() => {
    if (standaloneSite()) {
      document.documentElement.dataset.theme = activeTheme;
      document.documentElement.style.colorScheme = activeTheme;
    }
  }, [activeTheme]);
  const changeTheme = (next: "light" | "dark") => {
    setLocalTheme(next);
    onThemeChange?.(next);
    retainSiteTheme(next);
  };
  const themed = (href: string) => themedHref(href, activeTheme);
  return (
    <SiteThemeContext value={activeTheme}>
      <div className={`kbui-site ${className}`} id="top" data-theme={activeTheme}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header ref={header} className="site-header">
          <a className="wordmark" href={themed(siteRoot)} aria-label="kbui home">
            <Brand />
          </a>
          <nav aria-label="Main navigation">
            <a
              href={themed(`${siteRoot}playground/`)}
              aria-current={current === "playground" ? "page" : undefined}
            >
              Playground
            </a>
            <a
              href={themed(`${siteRoot}examples/`)}
              aria-current={current === "examples" ? "page" : undefined}
            >
              Examples
            </a>
            <a
              href={themed(`${siteRoot}components/`)}
              aria-current={current === "components" ? "page" : undefined}
            >
              Components
            </a>
            <ThemeToggle theme={activeTheme} onChange={changeTheme} />
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <a className="wordmark" href={themed(siteRoot)} aria-label="kbui home">
            <Brand />
          </a>
          <span>React + CSS + tokens. MIT licensed.</span>
          <div>
            <a href={themed(`${siteRoot}${installation}`)}>
              Get started <LinkArrow />
            </a>
            <a href={storybookRoot}>
              Documentation <LinkArrow />
            </a>
            <a href="https://github.com/KhallilB/kbui">
              GitHub <LinkArrow />
            </a>
          </div>
        </footer>
      </div>
    </SiteThemeContext>
  );
}
