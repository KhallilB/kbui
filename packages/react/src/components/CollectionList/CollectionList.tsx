import { type ComponentProps, createElement } from "react";
import { kb } from "../../utils/kb";

export type CollectionListElement = "ul" | "ol";
export type CollectionListProps<T extends CollectionListElement = "ul"> = ComponentProps<T> & {
  /** Unordered records or a native ordered list. */
  as?: T | undefined;
  /** Comfortable or compact spacing for immediate CollectionRow children. */
  density?: "comfortable" | "dense" | undefined;
  /** Separate immediate rows with a rule. */
  dividers?: boolean | undefined;
};
export function CollectionList<T extends CollectionListElement = "ul">({
  as,
  density = "comfortable",
  dividers = true,
  className,
  ...props
}: CollectionListProps<T>) {
  return createElement(as ?? "ul", {
    ...props,
    role: props.role ?? "list",
    ...kb("collectionlist", { density, dividers, ordered: as === "ol" }, className),
  });
}
