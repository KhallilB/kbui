import markUrl from "./logo.svg?no-inline";

export function Brand() {
  return (
    <>
      <span className="brand-symbol">
        <img src={markUrl} alt="" width="36" height="36" />
      </span>
      <span>kbui</span>
    </>
  );
}

export function Geometry({ alternate }: { alternate: boolean }) {
  return (
    <svg
      className="geometry"
      viewBox="0 0 320 224"
      aria-hidden="true"
      data-palette={alternate ? "alternate" : "original"}
    >
      <rect x="16" y="16" width="96" height="192" className="geometry-a" />
      <image href={markUrl} x="28" y="76" width="72" height="72" />
      <circle cx="160" cy="64" r="48" className="geometry-b" />
      <rect x="112" y="112" width="96" height="96" className="geometry-b" />
      <rect x="208" y="16" width="96" height="96" className="geometry-c" />
      <path d="M208 208A96 96 0 0 1 304 112V208Z" className="geometry-c" />
    </svg>
  );
}
