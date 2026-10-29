import { Collapsible as Base } from "@base-ui/react/collapsible";
import { kb } from "../../utils/kb";

export type DisclosureProps = Omit<Base.Root.Props, "className"> & {
  /** Plain class string on root. */
  className?: string | undefined;
};
export type DisclosureTriggerProps = Omit<Base.Trigger.Props, "className"> & {
  /** Plain class string on trigger. */
  className?: string | undefined;
};
export type DisclosurePanelProps = Omit<Base.Panel.Props, "className"> & {
  /** Plain class string on panel. */
  className?: string | undefined;
};

function DisclosureRoot({ className, ...props }: DisclosureProps) {
  return <Base.Root {...props} {...kb("disclosure", {}, className)} />;
}
function DisclosureTrigger({ className, ...props }: DisclosureTriggerProps) {
  return <Base.Trigger {...props} {...kb("disclosure-trigger", {}, className)} />;
}
function DisclosurePanel({ className, children, ...props }: DisclosurePanelProps) {
  return (
    <Base.Panel {...props} {...kb("disclosure-panel", {}, className)}>
      <div className="kb-disclosure-panel-content">{children}</div>
    </Base.Panel>
  );
}

export const Disclosure = Object.assign(DisclosureRoot, {
  Trigger: DisclosureTrigger,
  Panel: DisclosurePanel,
});
