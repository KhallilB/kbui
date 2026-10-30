import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Button } from "../Button/Button";
import { FormSection } from "../FormSection/FormSection";
import { Heading } from "../Heading/Heading";
import { Input } from "../Input/Input";
import { Form } from "./Form";

afterEach(cleanup);

describe("Form", () => {
  test("renders a native form that submits from its actions region", async () => {
    const ref = createRef<HTMLFormElement>();
    const submit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Form
        ref={ref}
        aria-label="Booking"
        onSubmit={submit}
        actions={<Button type="submit">Book room</Button>}
      >
        <Input label="Guest name" />
      </Form>,
    );
    const form = screen.getByRole("form", { name: "Booking" });
    expect(form.tagName).toBe("FORM");
    expect(ref.current).toBe(form);
    await userEvent.click(screen.getByRole("button", { name: "Book room" }));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  test("orders header, body and actions regions in the source", () => {
    const { container } = render(
      <Form
        header={<Heading level={1}>Book a room</Heading>}
        actions={<Button type="submit">Book room</Button>}
      >
        <FormSection title="Guest">
          <Input label="Guest name" />
        </FormSection>
      </Form>,
    );
    const regions = [...(container.querySelector(".kb-form")?.children ?? [])].map(
      (node) => node.classList[node.classList.length - 1],
    );
    expect(regions).toEqual(["kb-form-header", "kb-form-body", "kb-form-actions"]);
    const actions = container.querySelector(".kb-form-actions");
    expect(actions).toHaveClass("kb-formactions");
    expect(actions).toHaveAttribute("data-divider");
  });

  test("omits header and actions regions when unset", () => {
    const { container } = render(
      <Form>
        <Input label="Email" />
      </Form>,
    );
    expect(container.querySelector(".kb-form-header")).toBeNull();
    expect(container.querySelector(".kb-form-actions")).toBeNull();
    expect(container.querySelector(".kb-form-body")).toHaveTextContent("Email");
  });

  test("sets measure width with md by default", () => {
    const { container, rerender } = render(<Form>x</Form>);
    const root = container.querySelector(".kb-form");
    expect(root).toHaveAttribute("data-width", "md");
    rerender(<Form width="full">x</Form>);
    expect(root).toHaveAttribute("data-width", "full");
  });
});
