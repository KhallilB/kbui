import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { CollectionList } from "../CollectionList/CollectionList";
import { CollectionRow } from "../CollectionRow/CollectionRow";
import { ConfirmAction } from "./ConfirmAction";

const meta = {
  title: "Components/ConfirmAction",
  component: ConfirmAction,
  tags: ["autodocs"],
  args: {
    title: "Delete project?",
    description: "This permanently removes the project and its data.",
    children: "Delete project",
    onConfirm: () => undefined,
  },
} satisfies Meta<typeof ConfirmAction>;

export default meta;
type Story = StoryObj<typeof meta>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function DangerZone({ fail = false }: { fail?: boolean }) {
  const [deleted, setDeleted] = useState(false);
  const attempts = useRef(0);
  return (
    <Card>
      <h2>Danger zone</h2>
      <p role="status">{deleted ? "Project deleted." : "Project remains active."}</p>
      <ConfirmAction
        title="Delete project?"
        description="This permanently removes the project and its data."
        details={<p>Three environments and 1,204 runs are removed with it.</p>}
        pendingLabel="Deleting…"
        errorMessage="Could not delete the project. Try again."
        onConfirm={async () => {
          attempts.current += 1;
          await wait(200);
          if (fail && attempts.current === 1) throw new Error("Demo failure");
          setDeleted(true);
        }}
      >
        Delete project
      </ConfirmAction>
    </Card>
  );
}

export const Default: Story = {
  render: () => <DangerZone />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    const popup = await page.findByRole("dialog", { name: "Delete project?" });
    await waitFor(() =>
      expect(within(popup).getByRole("button", { name: "Cancel" })).toHaveFocus(),
    );
    await userEvent.click(within(popup).getByRole("button", { name: "Delete project" }));
    await expect(popup).toHaveAttribute("aria-busy", "true");
    await userEvent.keyboard("{Escape}");
    await expect(popup).toHaveAttribute("data-open");
    await expect(popup).not.toHaveAttribute("data-ending-style");
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await expect(canvas.getByRole("status")).toHaveTextContent("Project deleted.");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const FailureAndRetry: Story = {
  render: () => <DangerZone fail />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Delete project" }));
    const popup = await page.findByRole("dialog", { name: "Delete project?" });
    await userEvent.click(within(popup).getByRole("button", { name: "Delete project" }));
    await expect(await within(popup).findByRole("alert")).toHaveTextContent("Could not delete");
    await expect(canvas.getByRole("status", { hidden: true })).toHaveTextContent(
      "Project remains active.",
    );
    await userEvent.click(within(popup).getByRole("button", { name: "Delete project" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await expect(canvas.getByRole("status")).toHaveTextContent("Project deleted.");
  },
};

const initialKeys = [
  { id: "ci", name: "CI deploy key", created: "Created March 4" },
  { id: "laptop", name: "Laptop", created: "Created June 18" },
];

function RevokeKeys() {
  const [keys, setKeys] = useState(initialKeys);
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <section aria-labelledby="keys-heading">
      <h2 id="keys-heading" ref={heading} tabIndex={-1}>
        API keys
      </h2>
      <p role="status">{notice}</p>
      <CollectionList aria-labelledby="keys-heading">
        {keys.map((key) => (
          <CollectionRow
            key={key.id}
            title={key.name}
            description={key.created}
            actions={
              <ConfirmAction
                render={<Button variant="ghost" size="sm" />}
                aria-label={`Revoke ${key.name}`}
                title={`Revoke ${key.name}?`}
                description="Requests signed with this key fail immediately."
                confirmLabel="Revoke key"
                pendingLabel="Revoking…"
                finalFocus={heading}
                onConfirm={() => wait(150)}
                onConfirmed={() => {
                  setKeys((current) => current.filter((k) => k.id !== key.id));
                  setNotice(`${key.name} revoked.`);
                }}
              >
                Revoke
              </ConfirmAction>
            }
          />
        ))}
      </CollectionList>
    </section>
  );
}

export const RowAction: Story = {
  render: () => <RevokeKeys />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Revoke Laptop" }));
    const popup = await page.findByRole("dialog", { name: "Revoke Laptop?" });
    await userEvent.click(within(popup).getByRole("button", { name: "Revoke key" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Laptop revoked."));
    await expect(canvas.queryByRole("button", { name: "Revoke Laptop" })).toBeNull();
    await waitFor(() => expect(canvas.getByRole("heading", { name: "API keys" })).toHaveFocus());
  },
};
