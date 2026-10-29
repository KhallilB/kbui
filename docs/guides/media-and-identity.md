# Media and identity

Use Avatar for recognizable people and organizations, Image for stable media framing, and Thumbnail for captioned product and attachment previews. Compose collections with Grid and focused inspection with Dialog. These components are implemented locally and unreleased.

[Avatar API](../../packages/react/docs/components/Avatar.md) · [Image API](../../packages/react/docs/components/Image.md) · [Thumbnail API](../../packages/react/docs/components/Thumbnail.md)

## Choose framing before fetching

Reserve a ratio before the image request starts. `landscape` is 4:3, `square` is 1:1, `portrait` is 3:4, and `wide` is 16:9. `auto` uses the supplied positive width and height, falling back to 4:3 when either is missing. Keep the ratio consistent across gallery items to align captions, or choose intrinsic ratios when complete compositions matter more than equal rows.

`cover` fills the frame and crops edges. Set `position="50% 25%"` to preserve an off-center face or focal point. `contain` preserves every edge and may leave space around the image; use it for products, documents, charts and artwork whose edges carry information. These are display crops; original image files remain untouched.

```tsx
import "@kb.ui/react/styles.css";
import { Image } from "@kb.ui/react";

export function ResponsiveProduct() {
  return (
    <Image
      src="/coat-900.jpg"
      srcSet="/coat-450.jpg 450w, /coat-900.jpg 900w, /coat-1800.jpg 1800w"
      sizes="(max-width: 480px) 100vw, 50vw"
      width={900}
      height={1200}
      ratio="auto"
      fit="contain"
      alt="Sand wool coat with broad lapels"
      loading="lazy"
    />
  );
}
```

Choose `sizes` for the actual rendered column. Use lazy loading for offscreen media; leave leading content eager when appropriate. Image forwards native source, decoding, priority, CORS and referrer options; your application owns its image host, authorization and URL policy. Framework image optimizers remain application concerns; CSS anatomy can frame an app-owned renderer.

## Preserve identity through failure

Image exposes `empty`, `loading`, `loaded` and `error` states. Missing/blank sources create no request. Loading and failure retain the same reserved frame and visual fallback. The outer image role retains `alt` in every state; the inner img is decorative to avoid duplicate speech.

A new `src`, `srcSet` or `sizes` starts fresh request state. Use a changed key for a deliberate same-URL retry. The component adds no automatic retries or timeout. Observe `onError` to provide caller-owned, localized feedback outside the image. Fallback content is visual-only and must contain no links, buttons or other focusable elements.

```tsx
import "@kb.ui/react/styles.css";
import { useState } from "react";
import { Button, Image, Text } from "@kb.ui/react";

export function RetryPreview() {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  return (
    <div>
      <Image
        key={attempt}
        src="/attachment-preview.jpg"
        alt="North Studio brand guide cover"
        fallback="Preview unavailable"
        onError={() => setFailed(true)}
        onLoad={() => setFailed(false)}
      />
      {failed && <Text role="status">Preview could not load. The original file is still available.</Text>}
      <Button variant="secondary" onClick={() => { setFailed(false); setAttempt(attempt + 1); }}>
        Retry preview
      </Button>
    </div>
  );
}
```

Avatar reuses this request lifecycle with fixed dimensions. The default initials derive from first and last whitespace-separated names; supply `initials` for preferred/local forms. Keep the full `name` as identity. Set `decorative` beside an equivalent visible name. Localize unnamed identity with `aria-label`.

## Build a gallery in reading order

Keep each preview inside a list item. Put its action in the caption so filenames and titles remain readable when the media fails. A real link owns navigation and download behavior. A Dialog trigger owns inspection. Avoid wrapping a whole figure in a button or nesting multiple controls.

```tsx
import "@kb.ui/react/styles.css";
import { Button, Dialog, Grid, Image, Thumbnail } from "@kb.ui/react";

const studies = [
  { id: "alpine", title: "Alpine study", src: "/alpine.jpg", alt: "River beneath green alpine peaks" },
  { id: "material", title: "Material study", src: "/coat.jpg", alt: "Sand coat with broad lapels" },
];

export function Gallery() {
  return (
    <Grid as="ul" minItemWidth="sm" gap="lg">
      {studies.map((study) => (
        <li key={study.id}>
          <Dialog>
            <Thumbnail
              src={study.src}
              alt={study.alt}
              ratio="square"
              caption={<Dialog.Trigger render={<Button variant="ghost" />}>View {study.title}</Dialog.Trigger>}
              description="Open full composition"
              imageProps={{ loading: "lazy" }}
            />
            <Dialog.Content title={study.title} description="Full composition without cropping.">
              <Image src={study.src} alt={study.alt} fit="contain" ratio="square" />
              <Dialog.Actions>
                <Dialog.Close render={<Button variant="secondary" />}>Close preview</Dialog.Close>
              </Dialog.Actions>
            </Dialog.Content>
          </Dialog>
        </li>
      ))}
    </Grid>
  );
}
```

This recipe supports native Tab/Enter activation, modal focus containment, Escape dismissal and trigger focus return. It is a collection of independent previews. Add carousel selection, zoom/pan, editing or upload only when the application owns and verifies those behaviors.

For attachments, use an empty alternative on a decorative format tile and put the real filename, type and size in the caption. Provide descriptive `alt` when a cover preview adds meaningful information. Keep metadata caller-owned and available without a successful preview.

## Styling and plain HTML

`--kb-avatar-*`, `--kb-image-*` and `--kb-thumbnail-*` tokens own dimensions, type, colors and spacing. Native themes rebind semantic aliases; `classNames` styles individual parts. Image `style.aspectRatio` allows a custom ratio. Keep contrast, source order and focus rings when restyling.

```html
<figure class="kb-thumbnail" aria-labelledby="attachment-title">
  <span class="kb-image kb-thumbnail-media" data-ratio="wide" data-fit="contain" data-state="empty" aria-hidden="true">
    <span class="kb-image-fallback" aria-hidden="true">PDF</span>
  </span>
  <figcaption class="kb-thumbnail-caption">
    <span class="kb-thumbnail-title" id="attachment-title"><a class="kb-link" href="/brand-guide.pdf">Brand guide.pdf</a></span>
    <span class="kb-thumbnail-description">PDF · 2.4 MB</span>
  </figcaption>
</figure>
```

For a standalone meaningful Image, give the frame `role="img"` and `aria-label`. The native inner `img.kb-image-image` uses `alt=""` and `aria-hidden="true"`. Your renderer owns load/error state updates. Avatar and Thumbnail use Image CSS as well as their own stylesheet; importing the complete package stylesheet supplies all three.

## Verify real content

At 320 CSS pixels and desktop widths, inspect long filenames, missing previews, all avatar sizes, contain letterboxing and focal crops. In both themes and forced colors, check fallback text, visible actions and keyboard focus. Confirm failed and recovered images have the same frame bounds.

Read standalone identity and meaningful images once with a screen reader; decorative images should be skipped. Open a gallery preview with Enter, dismiss with Escape and check focus returns. Automated component/browser checks cover their named cases; human screen-reader, browser zoom and real photography checks remain separate. Text alternatives follow [WCAG 2.2 SC 1.1.1, Level A](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html); complete page conformance requires the application task pass in the [shared accessibility guide](accessibility.md).

## Editorial image collection

The [Image asset library](https://kbui.kcb.pro/storybook/?path=/story/components-image--asset-library) offers ten original warm editorial illustrations: six fictional portrait identities, two objects and two scenes. Each preview includes its own download link. The [Avatar portrait collection](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--portraits) shows the portraits at identity sizes; [Initials](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--initials) covers 24 names, scripts and custom marks; [Shapes](https://kbui.kcb.pro/storybook/?path=/story/components-avatar--shapes) compares circle, square, rounded, hexagon and diamond framing.

Download selected JPEGs and serve them from your application. The npm component package does not include this optional site collection or an image-generation service. The examples use `./media/` relative to their document; adapt that URL to your application's asset base. The collection manifest lives beside its images as `media/catalog.json` in the built site and Storybook output.

Portraits and objects are 768 × 768 pixels. Scenes are 1200 × 800. Keep subject and frame choice explicit: circle and rounded frames work for people, square preserves rectangular marks, and hexagon/diamond are expressive alternatives that can crop more of a face. Check every crop with the intended source and size. Initials remain upright in all five shapes. Keep visible names and meanings independent of decorative color.

The shared image brief uses matte paper texture, soft light, natural proportions and restrained sage/sand/charcoal/persimmon colors. Portrait briefs center one fictional adult with safe space for identity crops; object briefs keep the entire product visible; scene briefs use a wide editorial composition with open space and clear subject hierarchy. The collection includes Maya, Robin, Ana, Amir, Sora and Noor; a ceramic vessel and linen tote; an alpine river and sunlit atelier. These are illustration references, not real-person photographs.
