import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { CatalogAppearance } from "./catalog-model";
import {
  createPreviewCache,
  markPreviewReady,
  measurePreview,
  type PreviewEntry,
  previewSourceKey,
  requestPreview,
} from "./catalog-preview-cache";
import { applyCatalogSkin, defaultCatalogSkin } from "./catalog-skin";
import { themeStyle } from "./theme-foundations";

type Appearance = CatalogAppearance;
type Props = {
  src: string;
  title: string;
  layout: { width: number; minimum: number };
  expanded: boolean;
  appearance: Appearance;
  active?: boolean;
  generation?: number;
  cacheLimit?: number;
  pending?: boolean;
  status?: string;
  onLoad: () => void;
  onSlow?: () => void;
  onError: () => void;
};

function CachedFrame({
  entry,
  current,
  visible,
  expanded,
  appearance,
  pending,
  onReady,
  onMeasure,
  onSlow,
  onError,
}: {
  entry: PreviewEntry;
  current: boolean;
  visible: boolean;
  expanded: boolean;
  appearance: Appearance;
  pending: boolean;
  onReady: (id: string) => void;
  onMeasure: (id: string, height: number) => void;
  onSlow: () => void;
  onError: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const callbacks = useRef({ onReady, onMeasure, onSlow });
  useLayoutEffect(() => {
    callbacks.current = { onReady, onMeasure, onSlow };
  }, [onReady, onMeasure, onSlow]);
  const palette = appearance.skin?.palette ?? defaultCatalogSkin.palette;
  const corners = appearance.skin?.corners ?? defaultCatalogSkin.corners;
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const send = () => {
      try {
        const root = element.contentDocument?.documentElement;
        if (root) {
          root.dataset.theme = appearance.theme;
          root.style.colorScheme = appearance.theme;
          applyCatalogSkin(root.style, { palette, corners }, appearance.theme);
        }
      } catch {
        /* Cross-origin previews use their own theme. */
      }
      element.contentWindow?.postMessage(
        { type: "kbui:theme", theme: appearance.theme },
        location.origin,
      );
    };
    const ready = (event: MessageEvent) => {
      if (
        event.origin === location.origin &&
        event.source === element.contentWindow &&
        event.data?.type === "kbui:theme-ready"
      )
        send();
    };
    window.addEventListener("message", ready);
    element.addEventListener("load", send);
    send();
    return () => {
      window.removeEventListener("message", ready);
      element.removeEventListener("load", send);
    };
  }, [appearance.theme, palette, corners]);
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const timer = window.setTimeout(() => callbacks.current.onSlow(), 10000);
    let disconnect = () => {};
    const observe = () => {
      disconnect();
      try {
        const doc = element.contentDocument;
        const view = element.contentWindow;
        if (!doc?.body || !view) return;
        const actual = new URL(doc.URL);
        const requested = new URL(element.dataset.previewSrc ?? entry.src, location.href);
        // Cloudflare canonicalizes iframe.html; retain origin and exact state checks.
        if (
          requested.pathname.endsWith("/iframe.html") &&
          actual.pathname === requested.pathname.slice(0, -5)
        )
          actual.pathname = requested.pathname;
        actual.searchParams.sort();
        requested.searchParams.sort();
        if (actual.href !== requested.href) return;
        let active = true;
        let animation = 0;
        let root: HTMLElement | null = null;
        let ready = false;
        const measure = () => {
          if (!active) return;
          const storyRoot = doc.getElementById("storybook-root");
          const next =
            storyRoot?.querySelector<HTMLElement>(
              ":scope > .component-preview > .component-preview-content",
            ) ?? storyRoot;
          if (next !== root) {
            if (root) resize.unobserve(root);
            root = next;
            if (root) resize.observe(root);
          }
          if (!root || !storyRoot) return;
          if (
            !ready &&
            (root.childElementCount > 0 ||
              root.textContent?.trim() ||
              doc.querySelector('[role="dialog"]'))
          ) {
            ready = true;
            window.clearTimeout(timer);
            callbacks.current.onReady(entry.id);
          }
          const body = view.getComputedStyle(doc.body);
          const bottom =
            root === storyRoot
              ? root.getBoundingClientRect().bottom + view.scrollY
              : storyRoot.getBoundingClientRect().top +
                view.scrollY +
                root.getBoundingClientRect().height;
          callbacks.current.onMeasure(
            entry.id,
            Math.ceil(
              bottom +
                Number.parseFloat(body.paddingBottom || "0") +
                Number.parseFloat(body.marginBottom || "0"),
            ),
          );
        };
        const schedule = () => {
          cancelAnimationFrame(animation);
          animation = requestAnimationFrame(measure);
        };
        const resize = new ResizeObserver(schedule);
        const mutations = new MutationObserver(schedule);
        mutations.observe(doc.body, { childList: true, subtree: true, characterData: true });
        measure();
        void doc.fonts.ready.then(() => {
          if (active) schedule();
        });
        disconnect = () => {
          active = false;
          cancelAnimationFrame(animation);
          resize.disconnect();
          mutations.disconnect();
        };
      } catch {
        /* External documents keep fallback sizing and recovery links. */
      }
    };
    element.addEventListener("load", observe);
    observe();
    return () => {
      element.removeEventListener("load", observe);
      clearTimeout(timer);
      disconnect();
    };
  }, [entry.id, entry.src]);
  return (
    <iframe
      ref={frame}
      src={entry.src}
      title={entry.title}
      data-preview-src={entry.src}
      data-generation={entry.generation}
      data-current={current}
      data-visible={visible}
      data-preview-theme={appearance.theme}
      aria-busy={current && pending}
      aria-hidden={!current || !visible || undefined}
      inert={!current || !visible || pending}
      tabIndex={current && visible ? 0 : -1}
      style={{
        maxWidth: entry.layout.width,
        height: expanded
          ? `max(${Math.max(entry.layout.minimum, entry.height)}px, min(480px, 60svh))`
          : Math.max(entry.layout.minimum, entry.height),
      }}
      onError={onError}
    />
  );
}

export function StoryPreview({
  src,
  title,
  layout,
  expanded,
  appearance,
  active = true,
  generation = 0,
  cacheLimit = 6,
  pending = false,
  status = "",
  onLoad,
  onSlow,
  onError,
}: Props) {
  const [cache, setCache] = useState(() => createPreviewCache({ src, title, layout, generation }));
  const width = layout.width;
  const minimum = layout.minimum;
  useLayoutEffect(() => {
    setCache((current) =>
      requestPreview(current, { src, title, layout: { width, minimum }, generation }, cacheLimit),
    );
  }, [src, title, width, minimum, generation, cacheLimit]);
  const requested = cache.entries.find((entry) => entry.id === cache.requested);
  const displayed = cache.entries.find((entry) => entry.id === cache.displayed) ?? requested;
  const readyId =
    requested?.ready && cache.source === previewSourceKey(src) && cache.generation === generation
      ? requested.id
      : null;
  const notified = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (readyId && (pending || readyId !== notified.current)) {
      notified.current = readyId;
      onLoad();
    }
  }, [readyId, pending, onLoad]);
  const ready = useCallback(
    (id: string) => setCache((current) => markPreviewReady(current, id)),
    [],
  );
  const measure = useCallback(
    (id: string, height: number) => setCache((current) => measurePreview(current, id, height)),
    [],
  );
  return (
    <div
      className="catalog-preview-frame"
      data-theme={appearance.theme}
      data-cache-size={cache.entries.length}
      style={{
        ...themeStyle(appearance.theme),
        maxWidth: `calc(${displayed?.layout.width ?? layout.width}px + 2 * var(--preview-inset))`,
        minHeight: `calc(${Math.max(displayed?.layout.minimum ?? layout.minimum, displayed?.height ?? 0)}px + 2 * var(--preview-inset) + 2px)`,
      }}
    >
      {cache.entries.map((entry) => (
        <CachedFrame
          key={entry.id}
          entry={entry}
          current={active && cache.requested === entry.id}
          visible={active && cache.displayed === entry.id && entry.ready}
          expanded={expanded}
          appearance={appearance}
          pending={cache.requested === entry.id && pending}
          onReady={ready}
          onMeasure={measure}
          onSlow={() => {
            if (cache.requested === entry.id) onSlow?.();
          }}
          onError={() => {
            if (cache.requested === entry.id) onError();
          }}
        />
      ))}
      <p className="catalog-preview-status" role="status">
        {status}
      </p>
    </div>
  );
}
