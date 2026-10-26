import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { FileInput, type FileInputItem, type FileInputProps } from "./FileInput";

const kit: FileInputItem[] = [
  { id: "guide", name: "welcome-guide.docx", description: "1,200 words · 0.8 MB" },
  { id: "labels", name: "room-labels.csv", description: "600 words · 0.1 MB" },
];
function Sample(args: FileInputProps) {
  const [items, setItems] = useState(args.items);
  return (
    <div style={{ maxWidth: 480 }}>
      <FileInput
        {...args}
        items={items}
        onFiles={(files) =>
          setItems((current) => [
            ...current,
            ...files
              .filter((file) => !current.some((item) => item.id === file.name))
              .map((file) => ({
                id: file.name,
                name: file.name,
                description: `${file.size} bytes · needs word count`,
              })),
          ])
        }
        onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))}
      />
    </div>
  );
}

const editorialStyle = {
  "--kb-fileinput-radius": "0px",
  "--kb-button-radius": "0px",
} as CSSProperties;

const meta = {
  title: "Components/FileInput",
  component: FileInput,
  tags: ["autodocs"],
  args: {
    label: "Source files",
    items: kit,
    onFiles: () => {},
    onRemove: () => {},
    accept: ".docx,.csv",
    description: "Fixture counts; no content is read.",
  },
  render: (args) => <Sample {...args} />,
} satisfies Meta<typeof FileInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button", { name: "Remove welcome-guide.docx" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Remove room-labels.csv" })).toHaveFocus();
  },
};
export const Dark: Story = { globals: { theme: "dark" } };
export const Empty: Story = { args: { items: [] } };
export const Rejected: Story = {
  args: { error: "glossary.exe: choose DOCX or CSV. Accepted documents kept." },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const LongName: Story = {
  args: {
    items: [
      {
        id: "long",
        name: "welcome-guide-for-international-visitors-and-regional-hospitality-partners-final.docx",
        description: "Needs word count",
      },
    ],
  },
};
export const Evidence: Story = {
  args: {
    label: "Optional delivery evidence",
    items: [{ id: "label", name: "return-label.jpg", description: "0.4 MB" }],
    accept: "image/jpeg,image/png",
    description: "JPEG or PNG · up to 3 files · 5 MB each.",
  },
};
export const CustomContent: Story = {
  args: {
    renderItem: (item) => (
      <div>
        <strong>{item.name}</strong>
        <p style={{ margin: 0, fontSize: 12 }}>{item.description}</p>
      </div>
    ),
  },
};
export const Editorial: Story = {
  render: (args) => (
    <div style={editorialStyle}>
      <Sample {...args} />
    </div>
  ),
};

export const ControlledRefusal: Story = {
  render: function Refusal() {
    const [items, setItems] = useState(kit);
    return (
      <div style={{ maxWidth: 480, display: "grid", gap: 16 }}>
        <FileInput
          label="Source files"
          items={items}
          onFiles={() => {}}
          onRemove={() => {}}
          description="Removal is refused until an external update."
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setItems(kit.slice(1))}
        >
          Apply external update without moving focus
        </button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole("button", { name: "Remove welcome-guide.docx" });
    remove.focus();
    await userEvent.keyboard("{Enter}");
    await expect(remove).toHaveFocus();
    remove.blur();
    await expect(document.activeElement).toBe(document.body);
    await userEvent.click(
      canvas.getByRole("button", { name: "Apply external update without moving focus" }),
    );
    await expect(
      canvas.queryByRole("button", { name: "Remove welcome-guide.docx" }),
    ).not.toBeInTheDocument();
    await expect(document.activeElement).toBe(document.body);
  },
};
