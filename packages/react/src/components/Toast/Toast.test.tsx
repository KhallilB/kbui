import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { createToastManager, Toast, type ToastTone, useToastManager } from "./Toast";

const tones: ToastTone[] = ["neutral", "info", "success", "warning", "danger", "loading"];

describe("Toast", () => {
  test("renders declarative toast with title, description, action, close button, and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    const onAction = vi.fn();
    const onClose = vi.fn();

    const { container } = render(
      <Toast
        ref={ref}
        tone="success"
        title="Deployment complete"
        description="Release v2.4.0 is live in production."
        icon={<svg data-testid="toast-icon" />}
        actionLabel="View logs"
        onAction={onAction}
        onClose={onClose}
      />,
    );

    const root = container.querySelector(".kb-toast");
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute("data-tone", "success");
    expect(root).toHaveAttribute("role", "status");
    expect(container.querySelector(".kb-toast-icon")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("toast-icon")).toBeInTheDocument();
    expect(container.querySelector(".kb-toast-title")).toHaveTextContent("Deployment complete");
    expect(container.querySelector(".kb-toast-description")).toHaveTextContent(
      "Release v2.4.0 is live in production.",
    );

    fireEvent.click(screen.getByRole("button", { name: "View logs" }));
    expect(onAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("uses role=alert for danger tone and renders a decorative spinner by default when tone=loading", () => {
    const { container, rerender } = render(
      <Toast tone="danger" title="Webhook delivery failed" description="HTTP 503 from endpoint." />,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "danger");

    rerender(<Toast tone="loading" title="Publishing package" description="Uploading tarball…" />);
    const loadingRoot = container.querySelector(".kb-toast");
    expect(loadingRoot).toHaveAttribute("data-tone", "loading");
    expect(loadingRoot?.querySelector(".kb-spinner")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button", { name: "Dismiss notification" })).not.toBeInTheDocument();
  });

  test.each(tones)("applies data-tone=%s", (tone) => {
    const { container } = render(<Toast tone={tone} title="Notice" />);
    expect(container.querySelector(".kb-toast")).toHaveAttribute("data-tone", tone);
  });

  test("supports queued notifications and retry actions through Toast.Provider and useToastManager", async () => {
    const onRetry = vi.fn();

    function Demo() {
      const toastManager = useToastManager();
      return (
        <button
          type="button"
          onClick={() =>
            toastManager.add({
              title: "Sync failed",
              description: "Could not reach upstream origin.",
              type: "error",
              actionProps: {
                children: "Retry sync",
                onClick: onRetry,
              },
            })
          }
        >
          Trigger failure
        </button>
      );
    }

    render(
      <Toast.Provider timeout={0}>
        <Demo />
        <Toast.Viewport portal={false} inline placement="bottom-end" />
      </Toast.Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Trigger failure" }));

    expect(await screen.findByText("Sync failed")).toBeVisible();
    expect(screen.getByText("Could not reach upstream origin.")).toBeVisible();
    const toastEl = screen.getByText("Sync failed").closest(".kb-toast");
    expect(toastEl).toHaveAttribute("data-tone", "danger");

    fireEvent.click(screen.getByRole("button", { name: "Retry sync" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("transitions a toast through loading to success or recoverable error via createToastManager().promise", async () => {
    const manager = createToastManager();
    let resolveRequest!: (value: string) => void;
    const request = new Promise<string>((resolve) => {
      resolveRequest = resolve;
    });

    const { container } = render(
      <Toast.Provider toastManager={manager} timeout={0}>
        <Toast.Viewport portal={false} inline />
      </Toast.Provider>,
    );

    act(() => {
      void manager.promise(request, {
        loading: {
          title: "Saving changes",
          description: "Persisting configuration…",
        },
        success: (result) => ({
          title: "Changes saved",
          description: result,
        }),
        error: {
          title: "Save failed",
          description: "Please retry.",
        },
      });
    });

    expect(await screen.findByText("Saving changes")).toBeVisible();
    expect(container.querySelector(".kb-toast")).toHaveAttribute("data-tone", "loading");

    await act(async () => {
      resolveRequest("Updated 3 rules.");
      await request;
    });

    await waitFor(() => {
      expect(screen.getByText("Changes saved")).toBeVisible();
    });
    expect(screen.getByText("Updated 3 rules.")).toBeVisible();
    expect(container.querySelector(".kb-toast")).toHaveAttribute("data-tone", "success");
  });

  test("forwards classNames to every rendered toast part", () => {
    const { container } = render(
      <Toast
        icon={<svg />}
        title="Title"
        description="Description"
        actionLabel="Retry"
        onAction={() => {}}
        classNames={{
          content: "slot-content",
          icon: "slot-icon",
          body: "slot-body",
          title: "slot-title",
          description: "slot-description",
          actions: "slot-actions",
          action: "slot-action",
          close: "slot-close",
        }}
      />,
    );

    for (const part of [
      "content",
      "icon",
      "body",
      "title",
      "description",
      "actions",
      "action",
      "close",
    ]) {
      expect(container.querySelector(`.kb-toast-${part}`)).toHaveClass(`slot-${part}`);
    }
  });
});
