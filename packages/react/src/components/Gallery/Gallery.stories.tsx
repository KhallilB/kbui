import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { Dialog } from "../Dialog/Dialog";
import { EmptyState } from "../EmptyState/EmptyState";
import { Grid } from "../Grid/Grid";
import { Heading } from "../Heading/Heading";
import { Image } from "../Image/Image";
import { Input } from "../Input/Input";
import { PageHeader } from "../PageHeader/PageHeader";
import { Select } from "../Select/Select";
import { Text } from "../Text/Text";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import { Gallery } from "./Gallery";

const meta = {
  title: "Layout/Gallery",
  component: Gallery,
  tags: ["autodocs"],
} satisfies Meta<typeof Gallery>;
export default meta;
type Story = StoryObj<typeof meta>;

// Flat 4:3 sneaker illustration; no brand marks.
function sneaker(upper: string, sole: string, backdrop: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${backdrop}"/><path d="M70 205c0-30 20-52 50-58l50-26c15-8 30-5 40 5l35 35c15 12 45 15 75 18 25 3 35 14 35 27v6H70z" fill="${upper}"/><path d="M62 206h300c4 20-6 28-24 28H84c-18 0-24-10-22-28z" fill="${sole}"/><path d="M150 150l20 18m0-34 20 18m0-30 18 16" stroke="${sole}" stroke-width="6" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Rebuilds M2 prompt c01: a shoe shop's catalog that promotes its own model, The Schu.
const products = [
  {
    id: "schu-classic",
    name: "The Schu Classic",
    brand: "The Schu",
    tag: "Best seller",
    description: "Recycled knit upper with cloud-soft cushioning. Free returns for 60 days.",
    price: 89,
    rating: 4.9,
    alt: "The Schu Classic in sage knit with a white sole",
    src: sneaker("#6f8f72", "#f4f1ea", "#e6e1d6"),
  },
  {
    id: "schu-trail",
    name: "The Schu Trail",
    brand: "The Schu",
    tag: "New",
    description: "Grippy outsole and water-resistant knit for any terrain.",
    price: 99,
    rating: 4.8,
    alt: "The Schu Trail in charcoal knit with an amber sole",
    src: sneaker("#3c4148", "#d9a35b", "#e9e4dc"),
  },
  {
    id: "air-max-90",
    name: "Air Max 90",
    brand: "Nike",
    tag: "Popular",
    description: "Visible air cushioning and retro styling.",
    price: 130,
    rating: 4.7,
    alt: "Air Max 90 in white leather with a red sole",
    src: sneaker("#f2f2f0", "#c4513f", "#dfe4e8"),
  },
  {
    id: "ultraboost-light",
    name: "Ultraboost Light",
    brand: "Adidas",
    tag: "Running",
    description: "Responsive midsole for energized miles.",
    price: 190,
    rating: 4.6,
    alt: "Ultraboost Light in black knit with a white sole",
    src: sneaker("#22252a", "#f4f4f2", "#dcdfe3"),
  },
  {
    id: "574-core",
    name: "574 Core",
    brand: "New Balance",
    tag: "Classic",
    description: "Heritage suede and mesh with all-day support.",
    price: 90,
    rating: 4.7,
    alt: "574 Core in grey suede with an off-white sole",
    src: sneaker("#8d9097", "#efe9dd", "#e4e2dd"),
  },
  {
    id: "chuck-70-high",
    name: "Chuck 70 High",
    brand: "Converse",
    tag: "Streetwear",
    description: "Premium canvas with extra cushioning and vintage details.",
    price: 95,
    rating: 4.8,
    alt: "Chuck 70 High in cream canvas with a black sole",
    src: sneaker("#efe6d2", "#2b2b2b", "#e2ded6"),
  },
];

const brands = [
  { value: "all", label: "All brands" },
  ...[...new Set(products.map((product) => product.brand))].map((brand) => ({
    value: brand,
    label: brand,
  })),
];
const sorts = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

function ProductCard({
  product,
  featured,
}: {
  product: (typeof products)[number];
  featured: boolean;
}) {
  const nameId = useId();
  return (
    <Card aria-labelledby={nameId}>
      <Grid layout="stack" gap="sm">
        <Image src={product.src} alt={product.alt} ratio={featured ? "wide" : "landscape"} />
        <Text size="sm" tone="muted">
          {product.brand} · <Badge tone={featured ? "success" : "neutral"}>{product.tag}</Badge>
        </Text>
        <Heading level={2} size="sm" id={nameId}>
          {product.name}
        </Heading>
        <Text size="sm">{product.description}</Text>
        <Text>
          <strong>${product.price}</strong> · {product.rating} out of 5
        </Text>
        <Button variant={featured ? "primary" : "secondary"}>
          Add to cart<span className="kb-sr-only">, {product.name}</span>
        </Button>
      </Grid>
    </Card>
  );
}

// Geometry frames render three catalogs, so only one may be the main landmark.
function SneakerCatalog({
  initialQuery = "",
  landmark = true,
}: {
  initialQuery?: string;
  landmark?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [brand, setBrand] = useState<string | null>("all");
  const [sort, setSort] = useState<string | null>("featured");
  const visible = products
    .filter((product) => brand === "all" || product.brand === brand)
    .filter((product) => product.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0,
    );
  const search = useRef<HTMLInputElement>(null);
  // The empty region unmounts on reset, so hand focus back to search.
  const reset = () => {
    setQuery("");
    setBrand("all");
    search.current?.focus();
  };
  const Page = landmark ? "main" : "div";
  return (
    <Page>
      <Gallery
        header={
          <PageHeader
            eyebrow="New season · Free shipping over $100"
            title="Sneakers"
            description="Shop The Schu, our own all-day sneaker, alongside the brands you already love."
            actions={<Button onClick={() => setBrand("The Schu")}>Shop The Schu</Button>}
          />
        }
        filters={
          <>
            <Input
              ref={search}
              label="Search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
            <Select label="Brand" options={brands} value={brand} onValueChange={setBrand} />
            <Select label="Sort by" options={sorts} value={sort} onValueChange={setSort} />
            <Text role="status" size="sm" tone="muted">
              {visible.length === 1 ? "1 sneaker" : `${visible.length} sneakers`}
            </Text>
          </>
        }
        itemsLabel="Sneakers"
        empty={
          <EmptyState
            title="No sneakers match"
            description="Try another brand or a shorter search."
            headingLevel={2}
            actions={
              <Button variant="secondary" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        }
      >
        {visible.map((product, index) => {
          const featured = index === 0 && product.brand === "The Schu";
          return (
            <Gallery.Item key={product.id} featured={featured}>
              <ProductCard product={product} featured={featured} />
            </Gallery.Item>
          );
        })}
      </Gallery>
    </Page>
  );
}

export const ProductCatalog: Story = {
  render: () => <SneakerCatalog />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Sneakers" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(products.length);
    expect(
      canvas.getByRole("button", { name: /^Add to cart\s*,\s*The Schu Classic$/ }),
    ).toBeVisible();
  },
};

export const NoResults: Story = {
  render: () => <SneakerCatalog initialQuery="boots" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("list", { name: "Sneakers" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    expect(canvas.getByRole("list", { name: "Sneakers" })).toBeVisible();
    expect(canvas.getByRole("searchbox", { name: "Search" })).toHaveFocus();
    expect(canvas.getByRole("status")).toHaveTextContent(`${products.length} sneakers`);
  },
};

const studies = [
  {
    id: "alpine",
    title: "Alpine study",
    src: "./media/scenes/alpine.jpg",
    alt: "River beneath green alpine peaks",
  },
  {
    id: "atelier",
    title: "Atelier study",
    src: "./media/scenes/atelier.jpg",
    alt: "Sunlit atelier with a worktable and plants",
  },
  {
    id: "ceramic",
    title: "Ceramic study",
    src: "./media/objects/ceramic.jpg",
    alt: "Textured ceramic vase with eucalyptus",
  },
  {
    id: "tote",
    title: "Tote study",
    src: "./media/objects/tote.jpg",
    alt: "Natural canvas tote with dark handles",
  },
];

// Supersedes the Grid/Thumbnail/Dialog recipe: same inspection, Gallery owns the list.
export const Inspection: Story = {
  render: () => (
    <Gallery header={<PageHeader title="Studies" headingLevel={2} size="sm" />}>
      {studies.map((study) => (
        <Gallery.Item key={study.id}>
          <Dialog>
            <Thumbnail
              src={study.src}
              alt={study.alt}
              ratio="square"
              caption={
                <Dialog.Trigger render={<Button variant="ghost" />}>
                  View {study.title}
                </Dialog.Trigger>
              }
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
        </Gallery.Item>
      ))}
    </Gallery>
  ),
};

const widths = [390, 768, 1440] as const;
const targetSelector =
  "a[href], button, input:not([type='hidden']), select, textarea, [tabindex]:not([tabindex='-1'])";

// Fails on sideways overflow, pointer targets under 24px (WCAG 2.5.8) or overlapping targets.
function expectUsable(frame: HTMLElement) {
  expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  const box = frame.getBoundingClientRect();
  const targets = [...frame.querySelectorAll<HTMLElement>(targetSelector)]
    .filter((el) => !el.closest("[aria-hidden='true'], [hidden]"))
    .map((el) => ({ el, rect: el.getBoundingClientRect() }));
  expect(targets.length).toBeGreaterThan(0);
  for (const { el, rect } of targets) {
    const name = el.getAttribute("aria-label") ?? el.textContent;
    expect(rect.width, `${name} width`).toBeGreaterThanOrEqual(24);
    expect(rect.height, `${name} height`).toBeGreaterThanOrEqual(24);
    expect(rect.left, `${name} left`).toBeGreaterThanOrEqual(box.left - 0.5);
    expect(rect.right, `${name} right`).toBeLessThanOrEqual(box.right + 0.5);
  }
  for (const [i, a] of targets.entries()) {
    for (const b of targets.slice(i + 1)) {
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const overlapX = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const overlapY = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      expect(
        overlapX > 0.5 && overlapY > 0.5,
        `${a.el.textContent} overlaps ${b.el.textContent}`,
      ).toBe(false);
    }
  }
}

const rem = 16;
// Placement contract: 1, 2, 3 then 4 columns from 30, 48 and 64rem of gallery content width.
const expectedColumns = (width: number) =>
  width >= 64 * rem ? 4 : width >= 48 * rem ? 3 : width >= 30 * rem ? 2 : 1;
// Width policy: gutters 1, 1.5 then 2rem from 48 and 64rem of viewport width.
const expectedGutter = (viewport: number) =>
  viewport >= 64 * rem ? 2 * rem : viewport >= 48 * rem ? 1.5 * rem : rem;

function expectGalleryPlacement(frame: HTMLElement) {
  const gallery = frame.querySelector<HTMLElement>(".kb-gallery");
  if (!gallery) throw new Error("Expected a gallery");
  // Page frame fills up to 80rem: no narrow centred column.
  const frameWidth = frame.getBoundingClientRect().width;
  expect(gallery.getBoundingClientRect().width).toBeCloseTo(Math.min(frameWidth, 80 * rem), 0);
  const gutter = Number.parseFloat(getComputedStyle(gallery).paddingInlineStart);
  expect(gutter).toBeCloseTo(expectedGutter(window.innerWidth), 0);
  const width = gallery.clientWidth - 2 * gutter;
  const items = [...gallery.querySelectorAll<HTMLElement>(".kb-gallery-item")];
  const columns = expectedColumns(width);
  const firstRowTop = items[0]?.getBoundingClientRect().top;
  const rowOne = items.filter((item) => item.getBoundingClientRect().top === firstRowTop);
  const featured = items[0]?.hasAttribute("data-featured") && columns > 1;
  expect(rowOne.length + (featured ? 1 : 0), `columns at ${width}px`).toBe(columns);
  for (const image of gallery.querySelectorAll<HTMLElement>(".kb-image")) {
    const rect = image.getBoundingClientRect();
    const ratio = image.dataset.ratio === "wide" ? 16 / 9 : 4 / 3;
    expect(rect.width / rect.height).toBeCloseTo(ratio, 1);
  }
}

export const ResponsiveGeometry: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {widths.map((width) => (
        <div
          key={width}
          data-testid={`frame-${width}`}
          style={{ inlineSize: width, maxInlineSize: "100%" }}
        >
          <SneakerCatalog landmark={false} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const width of widths) {
      const frame = within(canvasElement).getByTestId(`frame-${width}`);
      // Frames clamp to the canvas; it must fit 768px or the wide branches never run.
      const available = frame.parentElement?.getBoundingClientRect().width ?? 0;
      expect(available).toBeGreaterThanOrEqual(768);
      expect(frame.getBoundingClientRect().width).toBeCloseTo(Math.min(width, available), 0);
      expectUsable(frame);
      expectGalleryPlacement(frame);
    }
  },
};
