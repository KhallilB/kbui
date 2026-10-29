import { clsx } from "clsx";
import { type ComponentProps, type ReactNode, useId } from "react";
import { type ClassNames, kb } from "../../utils/kb";
import { Image, type ImageProps } from "../Image/Image";

export type ThumbnailProps = Omit<ComponentProps<"figure">, "children"> &
  Pick<ImageProps, "src" | "alt" | "ratio" | "fit" | "position" | "fallback"> & {
    /** Visible title; may contain a native link or button. */
    caption?: ReactNode | undefined;
    /** Supporting metadata; remains visible when media fails. */
    description?: ReactNode | undefined;
    /** Native source/loading attributes and Image styling hooks. */
    imageProps?:
      | Omit<ImageProps, "src" | "alt" | "ratio" | "fit" | "position" | "fallback">
      | undefined;
    /** Extra classes for figure, media, caption, title and description. */
    classNames?: ClassNames<"root" | "media" | "caption" | "title" | "description"> | undefined;
  };

export function Thumbnail({
  src,
  alt,
  ratio,
  fit,
  position,
  fallback,
  caption,
  description,
  imageProps,
  className,
  classNames,
  ...props
}: ThumbnailProps) {
  const captionId = useId();
  const hasCaption = caption !== undefined && caption !== null && caption !== false;
  return (
    <figure
      {...props}
      {...kb("thumbnail", {}, classNames?.root ?? className)}
      aria-labelledby={
        props["aria-labelledby"] ??
        (props["aria-label"] ? undefined : hasCaption ? captionId : undefined)
      }
    >
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        ratio={ratio}
        fit={fit}
        position={position}
        fallback={fallback}
        classNames={{
          ...imageProps?.classNames,
          root: clsx(
            "kb-thumbnail-media",
            classNames?.media,
            imageProps?.classNames?.root ?? imageProps?.className,
          ),
        }}
      />
      {(hasCaption || description != null) && (
        <figcaption {...kb("thumbnail-caption", {}, classNames?.caption)}>
          {hasCaption && (
            <span id={captionId} {...kb("thumbnail-title", {}, classNames?.title)}>
              {caption}
            </span>
          )}
          {description != null && (
            <span {...kb("thumbnail-description", {}, classNames?.description)}>{description}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
