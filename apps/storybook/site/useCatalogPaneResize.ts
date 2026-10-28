import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function useCatalogPaneResize() {
  const root = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; element: HTMLElement; offset: number } | null>(null);
  const [metrics, setMetrics] = useState({ width: 0, initial: 50, split: false });
  const [preferred, setPreferred] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const usable = Math.max(1, metrics.width - 12);
  const minimum = Math.min(50, Math.ceil(Math.max(20, (160 / usable) * 100)));
  const maximum = Math.max(minimum, Math.floor(Math.min(80, 100 - (240 / usable) * 100)));
  const clamp = (value: number) => Math.max(minimum, Math.min(maximum, value));
  const percent = clamp(preferred ?? metrics.initial);
  const stop = useCallback(() => {
    const active = pointer.current;
    pointer.current = null;
    if (active?.element.hasPointerCapture(active.id))
      active.element.releasePointerCapture(active.id);
    setDragging(false);
  }, []);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth;
      if (!width) return;
      const initial =
        Number(getComputedStyle(element).getPropertyValue("--catalog-start-percent")) || 50;
      const split = window.matchMedia("(min-width: 520px)").matches;
      setMetrics((previous) =>
        previous.width === width && previous.initial === initial && previous.split === split
          ? previous
          : { width, initial, split },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("blur", stop);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("blur", stop);
      stop();
    };
  }, [stop]);
  const direction = () =>
    root.current && getComputedStyle(root.current).direction === "rtl" ? -1 : 1;
  return {
    root,
    split: metrics.split,
    dragging,
    style: {
      "--catalog-preview-track": `${percent}fr`,
      "--catalog-editor-track": `${100 - percent}fr`,
    } as CSSProperties,
    divider: {
      "aria-valuemin": minimum,
      "aria-valuemax": maximum,
      "aria-valuenow": Math.round(percent),
      "aria-valuetext": `Preview ${Math.round(percent)}%, editor ${100 - Math.round(percent)}%`,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        const step = event.shiftKey ? 10 : 2;
        if (event.key === "ArrowLeft") setPreferred(clamp(percent - step * direction()));
        else if (event.key === "ArrowRight") setPreferred(clamp(percent + step * direction()));
        else if (event.key === "Home") setPreferred(minimum);
        else if (event.key === "End") setPreferred(maximum);
        else if (event.key === "Enter") setPreferred(null);
        else return;
        event.preventDefault();
      },
      onDoubleClick: () => setPreferred(null),
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0 || pointer.current) return;
        event.preventDefault();
        event.currentTarget.focus();
        const bounds = event.currentTarget.getBoundingClientRect();
        // Capture keeps dragging active across the preview iframe.
        event.currentTarget.setPointerCapture(event.pointerId);
        pointer.current = {
          id: event.pointerId,
          element: event.currentTarget,
          offset: direction() === 1 ? event.clientX - bounds.left : bounds.right - event.clientX,
        };
        setDragging(true);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (pointer.current?.id !== event.pointerId || !root.current) return;
        const bounds = root.current.getBoundingClientRect();
        const offset =
          direction() === 1
            ? event.clientX - bounds.left - root.current.clientLeft
            : bounds.right - event.clientX - root.current.clientLeft;
        setPreferred(clamp(((offset - pointer.current.offset) / usable) * 100));
      },
      onPointerUp: (event: PointerEvent<HTMLElement>) => {
        if (pointer.current?.id === event.pointerId) stop();
      },
      onPointerCancel: (event: PointerEvent<HTMLElement>) => {
        if (pointer.current?.id === event.pointerId) stop();
      },
      onLostPointerCapture: stop,
    },
  };
}
