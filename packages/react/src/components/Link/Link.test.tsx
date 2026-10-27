import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Link } from "./Link";

describe("Link", () => {
  test("preserves native navigation, naming, attributes and ref", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link
        href="/guide"
        ref={ref}
        className="extra"
        target="_blank"
        rel="noreferrer"
        aria-current="page"
        download="guide.html"
      >
        Read installation guide
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Read installation guide" });
    expect(ref.current).toBe(link);
    expect(link.tagName).toBe("A");
    expect(link).toHaveClass("kb-link", "extra");
    expect(link).toHaveAttribute("href", "/guide");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("download", "guide.html");
  });

  test("Tab focuses and Enter activates once; Space does not activate", async () => {
    const user = userEvent.setup();
    const activate = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    render(
      <Link href="/guide" onClick={activate}>
        Read guide
      </Link>,
    );
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
    await user.keyboard(" ");
    expect(activate).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(activate).toHaveBeenCalledTimes(1);
  });
});
