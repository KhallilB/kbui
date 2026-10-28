export function CatalogEditorNotice({
  tone,
  children,
}: {
  tone: "idle" | "pending" | "success" | "error";
  children: string;
}) {
  return (
    <div
      className="catalog-editor-notice"
      data-tone={tone}
      role="status"
      aria-label="Editor notification"
      aria-atomic="true"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {tone === "success" ? (
          <path d="m5 10 3.2 3.2L15 6.5" />
        ) : tone === "pending" ? (
          <circle
            className="catalog-notice-spinner"
            cx="10"
            cy="10"
            r="6"
            strokeDasharray="26 12"
          />
        ) : (
          <>
            <circle cx="10" cy="10" r="7" />
            <path d="M10 9v4m0-7v.5" />
          </>
        )}
      </svg>
      <span>{children}</span>
    </div>
  );
}
