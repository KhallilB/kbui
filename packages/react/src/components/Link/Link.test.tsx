import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Link, type LinkProps, useLinkComponent } from "./Link";

function RouterLink({ href, ...props }: LinkProps) {
  return <a data-router="a" href={`/app${href}`} {...props} />;
}

function OtherRouterLink({ href, ...props }: LinkProps) {
  return <a data-router="b" href={href} {...props} />;
}

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

  test("without a provider renders a native anchor", () => {
    let component: unknown;
    function Probe() {
      component = useLinkComponent();
      return null;
    }
    render(<Probe />);
    expect(component).toBe("a");
  });

  test("provider swaps the anchor component and keeps class, href and ref", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link.Provider component={RouterLink}>
        <Link href="/guide" ref={ref} className="extra" aria-current="page">
          Read guide
        </Link>
      </Link.Provider>,
    );
    const link = screen.getByRole("link", { name: "Read guide" });
    expect(link).toHaveAttribute("data-router", "a");
    expect(link).toHaveAttribute("href", "/app/guide");
    expect(link).toHaveClass("kb-link", "extra");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(ref.current).toBe(link);
  });

  test("nearest provider wins", () => {
    render(
      <Link.Provider component={RouterLink}>
        <Link.Provider component={OtherRouterLink}>
          <Link href="/inner">Inner</Link>
        </Link.Provider>
        <Link href="/outer">Outer</Link>
      </Link.Provider>,
    );
    expect(screen.getByRole("link", { name: "Inner" })).toHaveAttribute("data-router", "b");
    expect(screen.getByRole("link", { name: "Outer" })).toHaveAttribute("data-router", "a");
  });
});
