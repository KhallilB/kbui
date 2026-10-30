import { type AccessibilityGuide, accessibilityStandards } from "./accessibility-standards";
import { InlineCode } from "./InlineCode";

export function AccessibilityReference({
  name,
  guide,
}: {
  name: string;
  guide: AccessibilityGuide;
}) {
  const source = `https://github.com/KhallilB/kbui/blob/main/packages/react/src/components/${name}/${name}`;
  return (
    <>
      <p>
        Apply these checks with the{" "}
        <a href="https://github.com/KhallilB/kbui/blob/main/docs/guides/accessibility.md">
          WCAG 2.2 implementation and verification guide
        </a>
        , including contrast, zoom, target size, and focus visibility in your theme.
      </p>
      <h3>Provided by kbui</h3>
      <ul data-accessibility="provides">
        {guide.provides.map((item) => (
          <li key={item}>
            <InlineCode text={item} />
          </li>
        ))}
      </ul>
      <h3>Your implementation</h3>
      <ul data-accessibility="authoring">
        {guide.authoring.map((item) => (
          <li key={item}>
            <InlineCode text={item} />
          </li>
        ))}
      </ul>
      <h3>Verify before shipping</h3>
      <ol data-accessibility="verify">
        {guide.verify.map((item) => (
          <li key={item}>
            <InlineCode text={item} />
          </li>
        ))}
      </ol>
      <h3>Standards and patterns</h3>
      <p>
        Relevant WCAG requirements for the described use; assess applicability in your complete
        page.
      </p>
      <ul>
        {guide.standards.map((id) => {
          const standard = accessibilityStandards[id];
          return (
            <li key={id}>
              <a href={`https://www.w3.org/TR/WCAG22/#${standard.anchor}`}>
                WCAG 2.2 {id}: {standard.title} (Level {standard.level})
              </a>
            </li>
          );
        })}
        {guide.pattern && (
          <li>
            <a href={guide.pattern.href}>APG: {guide.pattern.title}</a> — informative interaction
            guidance.
          </li>
        )}
      </ul>
      <h3>Coverage and limits</h3>
      <p>
        Inspect the <a href={`${source}.tsx`}>implementation</a>,{" "}
        <a href={`${source}.test.tsx`}>component tests</a>, and{" "}
        <a href={`${source}.stories.tsx`}>browser stories</a> for the implemented behavior and
        tested states. Automated checks cover those cases; a screen reader assessment of your
        complete workflow is still required. Record browser, assistive technology, task, result, and
        remaining gaps before claiming conformance.
      </p>
    </>
  );
}
