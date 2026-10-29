import type { ComponentProps } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { Image, type ImageProps } from "../Image/Image";

export type AvatarShape = "circle" | "square" | "rounded" | "hexagon" | "diamond";

export type AvatarProps = Omit<ComponentProps<"span">, "children" | "onLoad" | "onError"> &
  Pick<ImageProps, "src" | "srcSet" | "sizes" | "loading" | "onLoad" | "onError"> & {
    /** Full identity; remains accessible when photo fails. */
    name: string;
    /** Caller-owned initials; defaults to first and last name initials. */
    initials?: string | undefined;
    /** Hide duplicate identity beside visible text. */
    decorative?: boolean | undefined;
    /** Fixed identity dimensions. */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
    /** Identity silhouette; photo and initials remain upright. */
    shape?: AvatarShape | undefined;
    /** Extra classes for root, media and initials. */
    classNames?: ClassNames<"root" | "media" | "initials"> | undefined;
  };

export function Avatar({
  name,
  initials,
  decorative = false,
  size = "md",
  shape = "circle",
  src,
  srcSet,
  sizes,
  loading,
  onLoad,
  onError,
  className,
  classNames,
  ...props
}: AvatarProps) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = [words[0], ...(words.length > 1 ? [words.at(-1)] : [])]
    .map((word) => Array.from(word ?? "")[0] ?? "")
    .join("")
    .toLocaleUpperCase();
  return (
    <span
      {...props}
      {...kb("avatar", { size, shape }, classNames?.root ?? className)}
      role="img"
      aria-label={
        decorative ? undefined : (props["aria-label"] ?? (name.trim() || "Unknown person"))
      }
      aria-hidden={decorative ? true : props["aria-hidden"]}
    >
      <Image
        {...kb("avatar-media", {}, classNames?.media)}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading}
        onLoad={onLoad}
        onError={onError}
        alt=""
        ratio="square"
        fallback={
          <span {...kb("avatar-initials", {}, classNames?.initials)}>
            {initials?.trim() || letters || "?"}
          </span>
        }
      />
    </span>
  );
}
