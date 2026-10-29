import type { ComponentProps } from "react";
import { kb } from "../../utils/kb";

export type DescriptionListProps = ComponentProps<"dl"> & {
  /** Responsive label/value columns, always horizontal, or always stacked. */
  layout?: "responsive" | "horizontal" | "stacked" | undefined;
  /** Comfortable or compact detail spacing. */
  density?: "comfortable" | "dense" | undefined;
  /** Separate adjacent detail groups with a rule. */
  dividers?: boolean | undefined;
};
function DescriptionListRoot({
  layout = "responsive",
  density = "comfortable",
  dividers = true,
  className,
  ...props
}: DescriptionListProps) {
  return <dl {...props} {...kb("descriptionlist", { layout, density, dividers }, className)} />;
}
export type DescriptionListItemProps = ComponentProps<"div">;
function DescriptionListItem({ className, ...props }: DescriptionListItemProps) {
  return <div {...props} {...kb("descriptionlist-item", {}, className)} />;
}
export type DescriptionListTermProps = ComponentProps<"dt">;
function DescriptionListTerm({ className, ...props }: DescriptionListTermProps) {
  return <dt {...props} {...kb("descriptionlist-term", {}, className)} />;
}
export type DescriptionListDetailProps = ComponentProps<"dd">;
function DescriptionListDetail({ className, ...props }: DescriptionListDetailProps) {
  return <dd {...props} {...kb("descriptionlist-detail", {}, className)} />;
}
export const DescriptionList = Object.assign(DescriptionListRoot, {
  Item: DescriptionListItem,
  Term: DescriptionListTerm,
  Detail: DescriptionListDetail,
});
