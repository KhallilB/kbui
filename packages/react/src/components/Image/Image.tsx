import { type ComponentProps, type CSSProperties, type ReactNode, useState } from "react";
import { type ClassNames, kb } from "../../utils/kb";

export type ImageRatio = "square" | "landscape" | "portrait" | "wide" | "auto";
type SourceProps = Pick<
  ComponentProps<"img">,
  | "src"
  | "srcSet"
  | "sizes"
  | "width"
  | "height"
  | "loading"
  | "decoding"
  | "crossOrigin"
  | "referrerPolicy"
  | "fetchPriority"
  | "onLoad"
  | "onError"
>;
export type ImageProps = Omit<ComponentProps<"span">, "children" | "onLoad" | "onError"> &
  SourceProps & {
    /** Image alternative; empty string marks decorative media. */
    alt: string;
    /** Reserved frame ratio; auto uses width/height, then landscape. */
    ratio?: ImageRatio | undefined;
    /** Crop to fill frame or keep entire image visible. */
    fit?: "cover" | "contain" | undefined;
    /** Focal point within image frame. */
    position?: CSSProperties["objectPosition"] | undefined;
    /** Non-interactive visual shown while missing, loading or failed. */
    fallback?: ReactNode | undefined;
    /** Extra classes for frame, image and fallback. */
    classNames?: ClassNames<"root" | "image" | "fallback"> | undefined;
  };

export function Image(props: ImageProps) {
  // New request gets fresh state; late events cannot overwrite another source.
  return <ImageFrame key={JSON.stringify([props.src, props.srcSet, props.sizes])} {...props} />;
}

function ImageFrame({
  src,
  srcSet,
  sizes,
  width,
  height,
  loading,
  decoding = "async",
  crossOrigin,
  referrerPolicy,
  fetchPriority,
  onLoad,
  onError,
  alt,
  ratio = "landscape",
  fit = "cover",
  position,
  fallback,
  className,
  classNames,
  style,
  ...props
}: ImageProps) {
  const hasSource = Boolean(src?.trim() || srcSet?.trim());
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const intrinsicRatio =
    Number(width) > 0 && Number(height) > 0 ? `${width} / ${height}` : undefined;
  return (
    <span
      {...props}
      {...kb(
        "image",
        { ratio, fit, state: hasSource ? state : "empty" },
        classNames?.root ?? className,
      )}
      role="img"
      aria-label={props["aria-label"] ?? (alt || undefined)}
      aria-hidden={alt ? props["aria-hidden"] : true}
      style={{
        ...(ratio === "auto" && intrinsicRatio ? { aspectRatio: intrinsicRatio } : {}),
        ...style,
      }}
    >
      <span {...kb("image-fallback", {}, classNames?.fallback)} aria-hidden="true">
        {fallback ?? (
          <svg
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="4" y="5" width="24" height="22" rx="3" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="m5 23 7-7 5 5 4-4 6 6" />
          </svg>
        )}
      </span>
      {hasSource && (
        <img
          {...kb("image-image", {}, classNames?.image)}
          src={src?.trim() || undefined}
          srcSet={srcSet?.trim() || undefined}
          sizes={sizes}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          crossOrigin={crossOrigin}
          referrerPolicy={referrerPolicy}
          fetchPriority={fetchPriority}
          alt=""
          aria-hidden="true"
          style={{ objectPosition: position }}
          ref={(image) => {
            if (image?.complete && image.naturalWidth > 0) setState("loaded");
          }}
          onLoad={(event) => {
            setState("loaded");
            onLoad?.(event);
          }}
          onError={(event) => {
            setState("error");
            onError?.(event);
          }}
        />
      )}
    </span>
  );
}
