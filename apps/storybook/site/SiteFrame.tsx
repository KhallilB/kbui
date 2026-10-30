import { Button } from "@kb.ui/react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Brand } from "./Brand";
import { LinkArrow } from "./LinkArrow";
import { readSiteTheme, readThemePreference, retainSiteTheme, standaloneSite } from "./site-theme";
import { ThemeToggle } from "./ThemeToggle";
import "./site.css";
import "./motion.css";
import "./focus.css";
import "./palette.css";
import "./review-theme.css";
import "./site-accent.css";
import "./surface-polish.css";

export const installation = "setup/";
const navigation = [
  ["setup", "Get started", installation],
  ["playground", "Playground", "playground/"],
  ["components", "Components", "components/"],
  ["recipes", "Recipes", "recipes/"],
] as const;
const SiteThemeContext = createContext<"light" | "dark">("light");
const SystemThemeContext = createContext(true);

function themedHref(href: string, theme: "light" | "dark") {
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
  const system = useContext(SystemThemeContext);
  return <a {...props} href={system ? href : themedHref(href, theme)} />;
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
  current: "home" | "playground" | "components" | "recipes" | "setup" | "changelog";
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
  const [system, setSystem] = useState(
    () => !standaloneSite() || readThemePreference() === "system",
  );
  const activeTheme = theme ?? localTheme;
  useEffect(() => {
    if (!standaloneSite()) return;
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const followsSystem = readThemePreference() === "system";
      setSystem(followsSystem);
      if (followsSystem) {
        const next = readSiteTheme();
        setLocalTheme(next);
        onThemeChange?.(next);
      }
    };
    preference.addEventListener("change", update);
    window.addEventListener("popstate", update);
    return () => {
      preference.removeEventListener("change", update);
      window.removeEventListener("popstate", update);
    };
  }, [onThemeChange]);
  useLayoutEffect(() => {
    if (standaloneSite()) {
      document.documentElement.dataset.theme = activeTheme;
      document.documentElement.style.colorScheme = activeTheme;
    }
  }, [activeTheme]);
  const changeTheme = (next: "light" | "dark") => {
    setSystem(false);
    retainSiteTheme(next);
    setLocalTheme(next);
    onThemeChange?.(next);
  };
  const useSystemTheme = () => {
    retainSiteTheme("system");
    setSystem(true);
    const next = readSiteTheme();
    setLocalTheme(next);
    onThemeChange?.(next);
  };
  const themed = (href: string) => (system ? href : themedHref(href, activeTheme));
  return (
    <SiteThemeContext value={activeTheme}>
      <SystemThemeContext value={system}>
        <div className={`kbui-site ${className}`} id="top" data-theme={activeTheme}>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <header ref={header} className="site-header">
            <a className="wordmark" href={themed(siteRoot)} aria-label="kbui home">
              <Brand />
            </a>
            <nav aria-label="Main navigation">
              {navigation.map(([page, label, path]) => (
                <a
                  key={page}
                  href={themed(`${siteRoot}${path}`)}
                  aria-current={current === page ? "page" : undefined}
                >
                  {label}
                </a>
              ))}
            </nav>
            <ThemeToggle theme={activeTheme} onChange={changeTheme} />
          </header>
          {children}
          <footer className="site-footer">
            <a className="wordmark" href={themed(siteRoot)} aria-label="kbui home">
              <Brand />
            </a>
            <span>React + CSS + tokens. MIT licensed.</span>
            <div>
              <Button
                variant="ghost"
                size="sm"
                disabled={system}
                onClick={useSystemTheme}
                aria-label="Use system theme"
              >
                System theme
              </Button>
              <a href={themed(`${siteRoot}${installation}`)}>
                Get started <LinkArrow />
              </a>
              <a href={storybookRoot}>
                Documentation <LinkArrow />
              </a>
              <a href={themed(`${siteRoot}changelog/`)}>
                What's new <LinkArrow />
              </a>
              <a href="https://github.com/KhallilB/kbui">
                GitHub <LinkArrow />
              </a>
            </div>
          </footer>
        </div>
      </SystemThemeContext>
    </SiteThemeContext>
  );
}
