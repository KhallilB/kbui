import { Accordion as Base } from "@base-ui/react/accordion";
import { CollapsiblePanel } from "../../utils/CollapsiblePanel";
import { kb } from "../../utils/kb";

export type AccordionProps<Value = string> = Omit<Base.Root.Props<Value>, "className"> & {
  /** Plain class string on root. */
  className?: string | undefined;
};
export type AccordionItemProps = Omit<Base.Item.Props, "className"> & {
  /** Plain class string on item. */
  className?: string | undefined;
};
export type AccordionHeaderProps = Omit<Base.Header.Props, "className"> & {
  /** Plain class string on heading; use render to set heading rank. */
  className?: string | undefined;
};
export type AccordionTriggerProps = Omit<Base.Trigger.Props, "className"> & {
  /** Plain class string on trigger. */
  className?: string | undefined;
};
export type AccordionPanelProps = Omit<Base.Panel.Props, "className"> & {
  /** Plain class string on panel. */
  className?: string | undefined;
};

function AccordionRoot<Value = string>({ className, ...props }: AccordionProps<Value>) {
  return <Base.Root {...props} {...kb("accordion", {}, className)} />;
}
function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <Base.Item {...props} {...kb("accordion-item", {}, className)} />;
}
function AccordionHeader({ className, ...props }: AccordionHeaderProps) {
  return <Base.Header {...props} {...kb("accordion-header", {}, className)} />;
}
function AccordionTrigger({ className, ...props }: AccordionTriggerProps) {
  return <Base.Trigger {...props} {...kb("accordion-trigger", {}, className)} />;
}
function AccordionPanel({ className, children, render, ...props }: AccordionPanelProps) {
  return (
    <Base.Panel
      {...props}
      {...kb("accordion-panel", {}, className)}
      render={(nativeProps, state) => (
        <CollapsiblePanel nativeProps={nativeProps} state={state} render={render} />
      )}
    >
      <div className="kb-accordion-panel-content">{children}</div>
    </Base.Panel>
  );
}

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
});
