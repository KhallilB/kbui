import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, test } from "vitest";
import {
  Callout,
  Checkbox,
  FileInput,
  Input,
  NumberField,
  Progress,
  RadioGroup,
  ScrollArea,
  Select,
  Stat,
  Status,
  Switch,
} from "./index";

// Every key resolves to `slot-<key>`, so any rendered part can be checked without listing slots.
const every = new Proxy({} as Record<string, string>, {
  get: (_, key) => (typeof key === "string" ? `slot-${key}` : undefined),
  has: () => true,
});
const camel = (part: string) => part.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());

const cases: [string, () => ReactElement][] = [
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
        items={[{ id: "a", name: "a.txt" }]}
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
});
