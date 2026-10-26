import { Switch } from "@kbui/react";
import type { Theme } from "./site-theme";
import "./theme-toggle.css";

export function ThemeToggle({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <Switch
      className="theme-toggle"
      label="Dark mode"
      visuallyHidden
      checked={theme === "dark"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onCheckedChange={(checked) => onChange(checked ? "dark" : "light")}
      offIcon={
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </svg>
      }
      onIcon={
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 14.1A8.3 8.3 0 0 1 9.9 4a8.3 8.3 0 1 0 10.2 10.1Z" />
        </svg>
      }
    />
  );
}
