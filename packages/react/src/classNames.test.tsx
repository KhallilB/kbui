import { fireEvent, render, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, test } from "vitest";
import {
  Avatar,
  Callout,
  Checkbox,
  Code,
  CodeBlock,
  Collection,
  CollectionList,
  CollectionRow,
  Combobox,
  ConfirmAction,
  CopyableText,
  Dialog,
  EmptyState,
  ErrorSummary,
  Fieldset,
  FileInput,
  Form,
  FormSection,
  Image,
  Input,
  MultiSelect,
  NumberField,
  PageHeader,
  Popover,
  Progress,
  RadioGroup,
  ScrollArea,
  Select,
  Settings,
  Skeleton,
  Spinner,
  Split,
  Stat,
  StatsRow,
  Status,
  Switch,
  Table,
  Tabs,
  Textarea,
  Thumbnail,
  Toast,
} from "./index";

// Every key resolves to `slot-<key>`, so any rendered part can be checked without listing slots.
const every = new Proxy({} as Record<string, string>, {
  get: (_, key) => (typeof key === "string" ? `slot-${key}` : undefined),
  has: () => true,
});
const camel = (part: string) => part.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());

const cases: [string, () => ReactElement][] = [
  [
    "tabs",
    () => (
      <Tabs defaultValue="a" classNames={every}>
        <Tabs.List aria-label="Tabs">
          <Tabs.Tab value="a" icon={<svg />} badge="1">
            A
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">Panel</Tabs.Panel>
      </Tabs>
    ),
  ],
  ["image", () => <Image src="/a.jpg" alt="Photo" classNames={every} />],
  ["avatar", () => <Avatar name="Maya Chen" classNames={every} />],
  [
    "thumbnail",
    () => <Thumbnail alt="Photo" caption="Study" description="JPG" classNames={every} />,
  ],
  [
    "collection",
    () => (
      <Collection
        items={[{ id: "a" }]}
        getKey={(item) => item.id}
        getItemLabel={(item) => item.id}
        label="Records"
        columns={[{ key: "id", header: "ID", cell: (item) => item.id }]}
        classNames={every}
      />
    ),
  ],
  [
    "copyabletext",
    () => <CopyableText value="const count = 42;" highlight="count" classNames={every} />,
  ],
  [
    "copyabletext",
    () => (
      <CopyableText
        value="Request https://example.com"
        highlight="Request"
        linkify
        classNames={every}
      />
    ),
  ],
  [
    "copyabletext",
    () => <CopyableText label="Request" value="id_123" truncate classNames={every} />,
  ],
  [
    "code",
    () => (
      <CodeBlock title="Source" language="ts" lineNumbers collapsible classNames={every}>
        {"const value = 1;"}
      </CodeBlock>
    ),
  ],
  [
    "input",
    () => (
      <Input
        label="L"
        description="d"
        error="e"
        startContent="s"
        endContent="x"
        classNames={every}
      />
    ),
  ],
  ["textarea", () => <Textarea label="L" description="d" error="e" classNames={every} />],
  [
    "fieldset",
    () => (
      <Fieldset legend="L" description="d" error="e" classNames={every}>
        Child
      </Fieldset>
    ),
  ],
  [
    "formsection",
    () => (
      <FormSection
        title="T"
        description="d"
        error="e"
        actions={<button type="submit">S</button>}
        classNames={every}
      >
        Child
      </FormSection>
    ),
  ],
  [
    "form",
    () => (
      <Form header="H" actions={<button type="submit">S</button>} classNames={every}>
        Body
      </Form>
    ),
  ],
  [
    "settings",
    () => (
      <Settings header="H" classNames={every}>
        Body
      </Settings>
    ),
  ],
  [
    "errorsummary",
    () => (
      <ErrorSummary
        title="T"
        description="d"
        items={[{ href: "#a", label: "Err" }]}
        classNames={every}
      />
    ),
  ],
  [
    "checkbox",
    () => (
      <Checkbox
        label="L"
        description="d"
        error="e"
        checked={false}
        onCheckedChange={() => {}}
        classNames={every}
      />
    ),
  ],
  [
    "switch",
    () => (
      <Switch
        label="L"
        description="d"
        error="e"
        checked={false}
        onCheckedChange={() => {}}
        classNames={every}
      />
    ),
  ],
  [
    "select",
    () => (
      <Select
        label="L"
        description="d"
        error="e"
        value={null}
        options={[{ value: "a", label: "A" }]}
        onValueChange={() => {}}
        classNames={every}
      />
    ),
  ],
  [
    "collectionrow",
    () => (
      <CollectionList>
        <CollectionRow
          title="Name"
          description="Details"
          leading={<span>Icon</span>}
          metadata="Status"
          actions={<button type="button">Edit</button>}
          classNames={every}
        />
      </CollectionList>
    ),
  ],
  [
    "table",
    () => (
      <table>
        <thead>
          <tr>
            <Table.ColumnHeader
              className={every.columnheader}
              classNames={every}
              onSortChange={() => {}}
            >
              Name
            </Table.ColumnHeader>
          </tr>
        </thead>
      </table>
    ),
  ],
  [
    "combobox",
    () => (
      <Combobox
        label="L"
        description="d"
        error="e"
        value="a"
        defaultOpen
        options={[{ value: "a", label: "A" }]}
        onValueChange={() => {}}
        classNames={every}
      />
    ),
  ],
  [
    "multiselect",
    () => (
      <Combobox
        multiple
        label="L"
        description="d"
        error="e"
        value={["a"]}
        defaultOpen
        options={[{ value: "a", label: "A" }]}
        onValueChange={() => {}}
        classNames={every}
      />
    ),
  ],
  [
    "multiselect",
    () => (
      <MultiSelect
        label="L"
        description="d"
        error="e"
        value={["a"]}
        defaultOpen
        options={[{ value: "a", label: "A" }]}
        onValueChange={() => {}}
        classNames={every}
      />
    ),
  ],
  [
    "radiogroup",
    () => (
      <RadioGroup
        label="L"
        description="d"
        error="e"
        value="a"
        onValueChange={() => {}}
        classNames={every}
      >
        <RadioGroup.Item value="a" classNames={every}>
          A
        </RadioGroup.Item>
      </RadioGroup>
    ),
  ],
  [
    "numberfield",
    () => (
      <NumberField
        label="L"
        description="d"
        error="e"
        value={0}
        onValueChange={() => {}}
        classNames={every}
      />
    ),
  ],
  [
    "fileinput",
    () => (
      <FileInput
        label="L"
        description="d"
        error="e"
        items={[{ id: "a", name: "a.txt", description: "1 KB" }]}
        onFiles={() => {}}
        onRemove={() => {}}
        classNames={every}
      />
    ),
  ],
  [
    "callout",
    () => (
      <Callout
        title="T"
        icon={<svg />}
        actions={<button type="button">A</button>}
        classNames={every}
      >
        Body
      </Callout>
    ),
  ],
  [
    "emptystate",
    () => (
      <EmptyState
        icon={<svg />}
        eyebrow="E"
        title="T"
        description="D"
        actions={<button type="button">A</button>}
        footer="F"
        classNames={every}
      >
        Body
      </EmptyState>
    ),
  ],
  [
    "pageheader",
    () => (
      <PageHeader
        navigation={<a href="/">N</a>}
        eyebrow="E"
        title="T"
        meta="M"
        description="D"
        actions={<button type="button">A</button>}
        classNames={every}
      >
        Body
      </PageHeader>
    ),
  ],
  [
    "statsrow",
    () => (
      <StatsRow>
        <StatsRow.Item
          className="slot-item"
          label="L"
          value="V"
          change="+1"
          trend="up"
          context="C"
          link={<a href="/">K</a>}
          classNames={every}
        />
      </StatsRow>
    ),
  ],
  [
    "spinner",
    () => (
      <div>
        <Spinner label="Loading" showLabel variant="ring" classNames={every} />
        <Spinner label="Orbit" showLabel variant="orbit" classNames={every} />
        <Spinner label="Dots" showLabel variant="dots" classNames={every} />
        <Spinner label="Bars" showLabel variant="bars" classNames={every} />
      </div>
    ),
  ],
  ["skeleton", () => <Skeleton lines={2} classNames={every} />],
  [
    "toast",
    () => (
      <Toast.Provider timeout={0}>
        <Toast
          toast={{ id: "slots", title: "T", description: "D", actionProps: { children: "Undo" } }}
          classNames={every}
        />
      </Toast.Provider>
    ),
  ],
  ["progress", () => <Progress label="L" value={50} classNames={every} />],
  ["stat", () => <Stat label="L" value="1" classNames={every} />],
  [
    "status",
    () => (
      <Status icon={<svg />} classNames={every}>
        Ok
      </Status>
    ),
  ],
  [
    "scrollarea",
    () => (
      <ScrollArea label="L" classNames={every}>
        Body
      </ScrollArea>
    ),
  ],
  [
    "split",
    () => (
      <Split classNames={every}>
        <div>A</div>
        <div>B</div>
      </Split>
    ),
  ],
  [
    "code",
    () => (
      <Code
        block
        title="app.tsx"
        language="tsx"
        copyable
        collapsible
        lineNumbers
        highlightLines={[1]}
        classNames={every}
      >
        {"const x = 1;"}
      </Code>
    ),
  ],
];

describe("classNames", () => {
  test.each(cases)("%s passes a class to every rendered part", (name, element) => {
    const { container } = render(element());
    const parts = [...container.querySelectorAll<HTMLElement>(`[class*="kb-${name}-"]`)];
    expect(parts.length).toBeGreaterThan(0);
    for (const el of parts) {
      for (const cls of el.classList) {
        if (!cls.startsWith(`kb-${name}-`)) continue;
        expect(el.classList, cls).toContain(`slot-${camel(cls.slice(name.length + 4))}`);
      }
    }
  });

  test("dialog content passes classNames to its backdrop", () => {
    const host = document.createElement("div");
    document.body.append(host);
    render(
      <Dialog defaultOpen>
        <Dialog.Content title="T" container={host} classNames={every}>
          Body
        </Dialog.Content>
      </Dialog>,
    );
    expect(host.querySelector(".kb-dialog-backdrop")).toHaveClass("slot-backdrop");
    host.remove();
  });
  test("confirm action passes classNames to its portaled parts", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const view = render(
      <ConfirmAction
        defaultOpen
        title="Delete?"
        details="Gone for good."
        container={host}
        classNames={every}
        onConfirm={() => {
          throw new Error("x");
        }}
      >
        Delete
      </ConfirmAction>,
    );
    fireEvent.click(within(host).getByRole("button", { name: "Delete" }));
    await within(host).findByRole("alert");
    expect(host.querySelector(".kb-confirmaction")).toHaveClass("slot-popup");
    expect(host.querySelector(".kb-dialog-backdrop")).toHaveClass("slot-backdrop");
    for (const el of host.querySelectorAll<HTMLElement>('[class*="kb-confirmaction-"]')) {
      for (const cls of el.classList) {
        if (cls.startsWith("kb-confirmaction-")) {
          expect(el.classList, cls).toContain(
            `slot-${camel(cls.slice("kb-confirmaction-".length))}`,
          );
        }
      }
    }
    expect(host.querySelectorAll('[class*="kb-confirmaction-"]')).toHaveLength(2);
    view.unmount();
    host.remove();
  });
  test("popover content passes classNames to its positioner", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const view = render(
      <Popover defaultOpen>
        <Popover.Trigger>Options</Popover.Trigger>
        <Popover.Content title="Options" container={host} classNames={every} />
      </Popover>,
    );
    expect(host.querySelector(".kb-popover-positioner")).toHaveClass("slot-positioner");
    view.unmount();
    host.remove();
  });
});
