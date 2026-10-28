import { createRef } from "react";
import { expectTypeOf, test } from "vitest";
import { Container, type ContainerProps } from "../components/Container/Container";
import { Inline, type InlineProps } from "../components/Inline/Inline";
import { Split, type SplitProps } from "../components/Split/Split";

test("non-default native elements require as and preserve matching refs", () => {
  const mainRef = createRef<HTMLElement>();
  const listRef = createRef<HTMLUListElement>();
  const sectionRef = createRef<HTMLElement>();
  const container: ContainerProps<"main"> = { as: "main", ref: mainRef };
  const inline: InlineProps<"ul"> = { as: "ul", ref: listRef };
  const split: SplitProps<"section"> = { as: "section", ref: sectionRef };
  expectTypeOf(container).toExtend<{ as: "main" }>();
  expectTypeOf(inline).toExtend<{ as: "ul" }>();
  expectTypeOf(split).toExtend<{ as: "section" }>();
  <Container {...container} />;
  <Inline {...inline}>
    <li>Design</li>
  </Inline>;
  <Split {...split}>
    <div>Primary</div>
    <div>Context</div>
  </Split>;
  <Container />;
  <Inline />;
  <Split />;
  // @ts-expect-error Non-default landmark requires as.
  const missingMain: ContainerProps<"main"> = { ref: mainRef };
  // @ts-expect-error Non-default list requires as.
  const missingList: InlineProps<"ul"> = { ref: listRef };
  // @ts-expect-error Non-default section requires as.
  const missingSection: SplitProps<"section"> = { ref: sectionRef };
  // @ts-expect-error Explicit generic cannot bypass native element selection.
  <Container<"main"> ref={mainRef} />;
  // @ts-expect-error Explicit generic cannot bypass native element selection.
  <Inline<"ul"> ref={listRef} />;
  // @ts-expect-error Explicit generic cannot bypass native element selection.
  <Split<"section"> ref={sectionRef} />;
  // @ts-expect-error Native element and ref must agree.
  <Inline as="div" ref={listRef} />;
  // @ts-expect-error Union props must correlate the native element and ref.
  const mismatchedChoice: InlineProps<"div" | "ul"> = { as: "div", ref: listRef };
  void [missingMain, missingList, missingSection, mismatchedChoice];
});
