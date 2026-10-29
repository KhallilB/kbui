import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef, StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createToastManager, Toast, useToastManager } from "./Toast";

afterEach(() => vi.useRealTimers());

function setup(props: { timeout?: number; limit?: number } = {}) {
  const manager = createToastManager();
  const view = render(
    <Toast.Provider toastManager={manager} {...props}>
      <button type="button">Continue working</button>
      <Toast.Viewport placement="inline" />
    </Toast.Provider>,
  );
  return { manager, ...view };
}

describe("Toast", () => {
  test("renders named messages without moving focus and forwards viewport/ref/DOM props", () => {
    const manager = createToastManager();
    const ref = createRef<HTMLDivElement>();
    render(
      <Toast.Provider toastManager={manager}>
        <button type="button">Save</button>
        <Toast.Viewport
          ref={ref}
          placement="inline"
          aria-label="Project messages"
          data-testid="messages"
        />
      </Toast.Provider>,
    );
    screen.getByRole("button", { name: "Save" }).focus();
    act(() => manager.add({ title: "Saved", description: "All changes stored.", type: "success" }));
    const viewport = screen.getByRole("region", { name: "Project messages" });
    expect(ref.current).toBe(viewport);
    expect(viewport).toHaveAttribute("data-testid", "messages");
    expect(viewport).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("dialog", { name: "Saved" })).toHaveAccessibleDescription(
      "All changes stored.",
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("data-tone", "success");
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  test("limits newest-first messages, makes overflow inert, and restores older persistent messages", () => {
    const { manager, container } = setup({ timeout: 0, limit: 2 });
    let newest = "";
    act(() => {
      manager.add({ title: "First" });
      manager.add({ title: "Second" });
      newest = manager.add({ title: "Third" });
    });
    expect([...container.querySelectorAll(".kb-toast-title")].map((el) => el.textContent)).toEqual([
      "Third",
      "Second",
      "First",
    ]);
    expect(screen.getByText("First").closest(".kb-toast")).toHaveAttribute("inert");
    act(() => manager.close(newest));
    expect(screen.getByText("First").closest(".kb-toast")).not.toHaveAttribute("inert");
  });

  test("dismisses after configured duration and keeps timeout=0 messages", () => {
    vi.useFakeTimers();
    const { manager } = setup({ timeout: 5000 });
    const onClose = vi.fn();
    act(() => {
      manager.add({ title: "Timed", onClose });
      manager.add({ title: "Persistent", timeout: 0 });
    });
    act(() => vi.advanceTimersByTime(4999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Persistent").closest(".kb-toast")).not.toHaveAttribute(
      "data-ending-style",
    );
  });

  test("pauses on hover and resumes remaining duration", () => {
    vi.useFakeTimers();
    const { manager } = setup({ timeout: 5000 });
    const onClose = vi.fn();
    act(() => manager.add({ title: "Saved", onClose }));
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.mouseEnter(screen.getByRole("region"));
    act(() => vi.advanceTimersByTime(10000));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseLeave(screen.getByRole("region"));
    act(() => vi.advanceTimersByTime(2999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("keeps timers paused when adding more messages during hover", () => {
    vi.useFakeTimers();
    const { manager } = setup({ timeout: 5000 });
    act(() => manager.add({ title: "First" }));
    fireEvent.mouseEnter(screen.getByRole("region"));
    const onClose = vi.fn();
    act(() => manager.add({ title: "Second", onClose }));
    act(() => vi.advanceTimersByTime(10000));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseLeave(screen.getByRole("region"));
    act(() => vi.advanceTimersByTime(5000));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("pauses during window blur and resumes remaining time on focus", () => {
    vi.useFakeTimers();
    const { manager } = setup({ timeout: 5000 });
    const onClose = vi.fn();
    act(() => manager.add({ title: "Saved", onClose }));
    act(() => vi.advanceTimersByTime(2000));
    const ownerWindow = screen.getByRole("region").ownerDocument.defaultView;
    if (!ownerWindow) throw new Error("Missing viewport window");
    // JSDOM wraps Window targets differently; use native browser's composed path.
    const blur = new Event("blur");
    vi.spyOn(blur, "composedPath").mockReturnValue([ownerWindow]);
    act(() => ownerWindow.dispatchEvent(blur));
    act(() => vi.advanceTimersByTime(20000));
    expect(onClose).not.toHaveBeenCalled();
    const focus = new Event("focus");
    vi.spyOn(focus, "composedPath").mockReturnValue([ownerWindow]);
    act(() => ownerWindow.dispatchEvent(focus));
    act(() => vi.advanceTimersByTime(2999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("F6 pauses timers and Shift+Tab returns focus without dismissing", () => {
    vi.useFakeTimers();
    const { manager } = setup({ timeout: 5000 });
    const trigger = screen.getByRole("button", { name: "Continue working" });
    trigger.focus();
    const onClose = vi.fn();
    act(() => manager.add({ title: "Saved", onClose }));
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.keyDown(trigger, { key: "F6" });
    expect(screen.getByRole("region")).toHaveFocus();
    act(() => vi.advanceTimersByTime(20000));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("region"), { key: "Tab", shiftKey: true });
    expect(trigger).toHaveFocus();
    act(() => vi.advanceTimersByTime(3000));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("provider limit changes recompute overflow without losing messages", () => {
    const manager = createToastManager();
    const view = render(
      <Toast.Provider toastManager={manager} timeout={0} limit={1}>
        <Toast.Viewport placement="inline" />
      </Toast.Provider>,
    );
    act(() => {
      manager.add({ title: "First" });
      manager.add({ title: "Second" });
    });
    expect(screen.getByText("First").closest(".kb-toast")).toHaveAttribute("inert");
    view.rerender(
      <Toast.Provider toastManager={manager} timeout={0} limit={2}>
        <Toast.Viewport placement="inline" />
      </Toast.Provider>,
    );
    expect(screen.getByText("First").closest(".kb-toast")).not.toHaveAttribute("inert");
  });

  test("all-message dismissal includes overflow and ignores missing IDs", () => {
    const { manager } = setup({ timeout: 0, limit: 1 });
    const first = vi.fn();
    const second = vi.fn();
    act(() => {
      manager.add({ title: "First", onClose: first });
      manager.add({ title: "Second", onClose: second });
    });
    act(() => {
      manager.close("missing");
      manager.update("missing", { title: "Ignored" });
    });
    expect(first).not.toHaveBeenCalled();
    act(() => manager.close());
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  test("renders an empty viewport on the server without document access", () => {
    expect(
      renderToString(
        <Toast.Provider>
          <Toast.Viewport placement="inline" />
        </Toast.Provider>,
      ),
    ).toContain("Notifications");
    expect(() =>
      renderToString(
        <Toast.Provider>
          <Toast.Viewport />
        </Toast.Provider>,
      ),
    ).not.toThrow();
  });

  test("deduplicates IDs, updates content, and restarts explicit timeouts", () => {
    vi.useFakeTimers();
    const { manager } = setup({ timeout: 5000 });
    const onClose = vi.fn();
    act(() => manager.add({ id: "upload", title: "Uploading", onClose }));
    act(() => vi.advanceTimersByTime(4000));
    act(() => manager.add({ id: "upload", title: "Uploaded", type: "success" }));
    expect(screen.queryByText("Uploading")).not.toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    act(() => manager.update("upload", { description: "Ready", timeout: 2000 }));
    act(() => vi.advanceTimersByTime(1999));
    expect(onClose).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("provides urgent announcements separately from polite messages", () => {
    const { manager } = setup({ timeout: 0 });
    act(() =>
      manager.add({
        title: "Connection lost",
        description: "Reconnect to save.",
        priority: "high",
        type: "error",
      }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Connection lostReconnect to save.");
    expect(
      screen.getByText("Connection lost", { selector: ".kb-toast-title" }).closest(".kb-toast"),
    ).toHaveAttribute("data-tone", "danger");
  });

  test("dismisses using named close controls and calls callbacks once", () => {
    const { manager } = setup({ timeout: 0 });
    const onClose = vi.fn();
    act(() => manager.add({ title: "Saved", onClose }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => manager.close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("preserves action handlers and does not dismiss implicitly", () => {
    const { manager } = setup({ timeout: 0 });
    const onClick = vi.fn();
    const onClose = vi.fn();
    act(() =>
      manager.add({ title: "Archived", actionProps: { children: "Undo", onClick }, onClose }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  test("supports custom composition, classes, localized close text and root ref", () => {
    const manager = createToastManager();
    const ref = createRef<HTMLDivElement>();
    render(
      <Toast.Provider toastManager={manager} timeout={0}>
        <Toast.Viewport
          placement="inline"
          renderToast={(toast) => (
            <Toast key={toast.id} ref={ref} toast={toast} className="custom" data-testid="toast">
              <Toast.Content>
                <Toast.Title>{toast.title}</Toast.Title>
                <Toast.Description>Custom details</Toast.Description>
              </Toast.Content>
              <Toast.Close aria-label="Fermer">Fermer</Toast.Close>
            </Toast>
          )}
        />
      </Toast.Provider>,
    );
    act(() => manager.add({ title: "Saved" }));
    expect(ref.current).toBe(screen.getByTestId("toast"));
    expect(ref.current).toHaveClass("kb-toast", "custom");
    expect(screen.getByRole("dialog", { name: "Saved" })).toHaveAccessibleDescription(
      "Custom details",
    );
    expect(screen.getByRole("button", { name: "Fermer" })).toBeInTheDocument();
  });

  test("portals to a caller-owned theme host", () => {
    const host = document.createElement("div");
    host.dataset.theme = "dark";
    document.body.append(host);
    const manager = createToastManager();
    const view = render(
      <Toast.Provider toastManager={manager}>
        <Toast.Viewport container={host} />
      </Toast.Provider>,
    );
    act(() => manager.add({ title: "Saved" }));
    expect(within(host).getByRole("dialog", { name: "Saved" })).toBeInTheDocument();
    expect(view.container.querySelector(".kb-toast-viewport")).toBeNull();
    view.unmount();
    host.remove();
  });

  test("promise transitions retain identity and return resolved values", async () => {
    const { manager } = setup({ timeout: 0 });
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((done) => {
      resolve = done;
    });
    let result!: Promise<string>;
    act(() => {
      result = manager.promise(promise, {
        loading: "Saving",
        success: (value) => `Saved ${value}`,
        error: "Failed",
      });
    });
    const root = screen.getByText("Saving").closest(".kb-toast");
    await act(async () => {
      resolve("project");
      await result;
    });
    expect(await result).toBe("project");
    expect(screen.getByText("Saved project").closest(".kb-toast")).toBe(root);
    expect(root).toHaveAttribute("data-tone", "success");
  });

  test("description-only and shorthand promise messages still have accessible names", async () => {
    const { manager } = setup({ timeout: 0 });
    act(() => manager.add({ description: "Background sync complete" }));
    expect(screen.getByRole("dialog", { name: "Background sync complete" })).toBeInTheDocument();
    await act(async () => {
      await manager.promise(Promise.resolve("project"), {
        loading: "Saving",
        success: "Saved",
        error: "Failed",
      });
    });
    expect(screen.getByRole("dialog", { name: "Saved" })).toBeInTheDocument();
  });

  test("promise rejection renders error and preserves rejection for callers", async () => {
    const { manager } = setup({ timeout: 0 });
    const error = new Error("Offline");
    await act(async () => {
      await expect(
        manager.promise(Promise.reject(error), {
          loading: "Saving",
          success: "Saved",
          error: "Save failed",
        }),
      ).rejects.toBe(error);
    });
    expect(screen.getByText("Save failed").closest(".kb-toast")).toHaveAttribute(
      "data-tone",
      "danger",
    );
  });

  test("hook stays scoped to its provider", () => {
    function Trigger() {
      const manager = useToastManager<{ project: string }>();
      return (
        <button
          type="button"
          onClick={() => manager.add({ title: "Local", data: { project: "kbui" } })}
        >
          Notify
        </button>
      );
    }
    render(
      <>
        <Toast.Provider timeout={0}>
          <Trigger />
          <Toast.Viewport placement="inline" aria-label="First" />
        </Toast.Provider>
        <Toast.Provider>
          <Toast.Viewport placement="inline" aria-label="Second" />
        </Toast.Provider>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(
      within(screen.getByRole("region", { name: "First" })).getByText("Local"),
    ).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Second" })).queryByText("Local")).toBeNull();
  });

  test("cleans subscriptions and timers on unmount under StrictMode", () => {
    vi.useFakeTimers();
    const manager = createToastManager();
    const onClose = vi.fn();
    const view = render(
      <StrictMode>
        <Toast.Provider toastManager={manager}>
          <Toast.Viewport placement="inline" />
        </Toast.Provider>
      </StrictMode>,
    );
    act(() => manager.add({ title: "Saved", onClose }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    view.unmount();
    act(() => vi.advanceTimersByTime(10000));
    expect(onClose).not.toHaveBeenCalled();
    expect(() => manager.add({ title: "After unmount" })).not.toThrow();
  });
});
