import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { expect, within } from "storybook/test";
import { Accordion } from "../Accordion/Accordion";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { CollectionList } from "../CollectionList/CollectionList";
import { CollectionRow } from "../CollectionRow/CollectionRow";
import { DescriptionList } from "../DescriptionList/DescriptionList";
import { Heading } from "../Heading/Heading";
import { Image } from "../Image/Image";
import { Inline } from "../Inline/Inline";
import { Input } from "../Input/Input";
import { Link } from "../Link/Link";
import { PageHeader } from "../PageHeader/PageHeader";
import { Progress } from "../Progress/Progress";
import { Select } from "../Select/Select";
import { Separator } from "../Separator/Separator";
import { Status } from "../Status/Status";
import { Text } from "../Text/Text";
import { SupportingPane } from "./SupportingPane";

const meta = {
  title: "Layout/SupportingPane",
  component: SupportingPane,
  tags: ["autodocs"],
} satisfies Meta<typeof SupportingPane>;
export default meta;
type Story = StoryObj<typeof meta>;

const quantities = ["1", "2", "3", "4"].map((value) => ({ value, label: value }));
const cartItems = [
  {
    id: "airrunner",
    name: "AirRunner 2 Low",
    detail: "Cloud White · Size 10",
    stock: "Only 3 left in your size",
    price: "$128.00",
  },
  {
    id: "court",
    name: "Court Classic Leather",
    detail: "Black / Gum · Size 9.5",
    stock: "In stock · Ships today",
    price: "$94.00",
  },
];
const totals = [
  ["Subtotal", "$222.00"],
  ["Shipping", "$5.99"],
  ["Estimated tax", "$17.76"],
  ["Promo discount (WELCOME10)", "−$22.20"],
] as const;

function OrderSummary({ titleId }: { titleId: string }) {
  return (
    <Card as="div">
      <Heading level={2} id={titleId}>
        Order summary
      </Heading>
      <Text tone="muted" size="sm">
        Shipping and taxes estimated.
      </Text>
      <DescriptionList layout="horizontal" density="dense" dividers={false}>
        {totals.map(([term, value]) => (
          <DescriptionList.Item key={term}>
            <DescriptionList.Term>{term}</DescriptionList.Term>
            <DescriptionList.Detail>{value}</DescriptionList.Detail>
          </DescriptionList.Item>
        ))}
      </DescriptionList>
      <Separator decorative />
      <DescriptionList layout="horizontal" dividers={false}>
        <DescriptionList.Item>
          <DescriptionList.Term>Total</DescriptionList.Term>
          <DescriptionList.Detail>
            <strong>$223.55</strong>
          </DescriptionList.Detail>
        </DescriptionList.Item>
      </DescriptionList>
      <Inline gap="sm" align="end">
        <Input label="Promo code" autoComplete="off" />
        <Button variant="secondary">Apply</Button>
      </Inline>
      <Button style={{ inlineSize: "100%" }}>Continue to payment</Button>
      <Text tone="muted" size="sm">
        Secure checkout. Guest checkout, Apple Pay, PayPal and cards accepted.
      </Text>
      <Inline gap="sm">
        <Badge>Free 30-day returns</Badge>
        <Badge>Arrives by Nov 3</Badge>
        <Badge>Authentic guaranteed</Badge>
      </Inline>
    </Card>
  );
}

// Rebuilds M2 prompt c04: a shoe cart whose order summary moves below the items when narrow.
function ShoeCartScreen({ summaryLabel }: { summaryLabel?: string | undefined }) {
  const titleId = useId();
  const [quantity, setQuantity] = useState<Record<string, string | null>>({
    airrunner: "1",
    court: "1",
  });
  return (
    <SupportingPane
      aside={<OrderSummary titleId={titleId} />}
      {...(summaryLabel ? { asideLabel: summaryLabel } : { asideLabelledBy: titleId })}
    >
      <PageHeader
        title="Your cart"
        description="Almost there. Your sneakers are reserved for 15 minutes."
      />
      <Card as="div">
        <Progress label="Free shipping progress" value={89} valueText="$28.00 to go" />
        <Text>You're only $28.00 away from free shipping.</Text>
      </Card>
      <Heading level={2}>Items in your cart</Heading>
      <CollectionList aria-label="Items in your cart">
        {cartItems.map((item) => (
          <CollectionRow
            key={item.id}
            leading={<Image alt="" ratio="square" style={{ inlineSize: "2.5rem" }} />}
            title={item.name}
            description={
              <>
                {item.detail}
                <br />
                <Status tone={item.stock.startsWith("Only") ? "warning" : "success"}>
                  {item.stock}
                </Status>
              </>
            }
            metadata={<strong>{item.price}</strong>}
            actions={
              <>
                <Select
                  label="Qty"
                  options={quantities}
                  value={quantity[item.id] ?? null}
                  onValueChange={(value) => setQuantity({ ...quantity, [item.id]: value })}
                />
                <Button variant="ghost" aria-label={`Remove ${item.name}`}>
                  Remove
                </Button>
              </>
            }
          />
        ))}
      </CollectionList>
      <Link href="#shop">Continue shopping</Link>
      <Heading level={2}>Questions before you buy?</Heading>
      <Accordion>
        <Accordion.Item value="returns">
          <Accordion.Header>
            <Accordion.Trigger>What is the return policy?</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Return unworn pairs within 30 days for a full refund.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="sizing">
          <Accordion.Header>
            <Accordion.Trigger>How do these run for size?</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>
            Both styles run true to size; go half a size up for wide feet.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </SupportingPane>
  );
}

const orders = [
  { id: "1042", customer: "Ada Chen", total: "$245.75", status: "Paid" },
  { id: "1041", customer: "Lin Patel", total: "$94.00", status: "Refunded" },
  { id: "1040", customer: "Sam Okafor", total: "$512.10", status: "Paid" },
];

// Inspector: a record list in main with the selected record's details beside it.
function OrderInspector() {
  const titleId = useId();
  const [selected, setSelected] = useState("1042");
  const order = orders.find((entry) => entry.id === selected) ?? orders[0];
  return (
    <SupportingPane
      asideLabelledBy={titleId}
      aside={
        <Card as="div">
          <Heading level={2} id={titleId}>
            Order {order?.id}
          </Heading>
          <DescriptionList layout="stacked">
            <DescriptionList.Item>
              <DescriptionList.Term>Customer</DescriptionList.Term>
              <DescriptionList.Detail>{order?.customer}</DescriptionList.Detail>
            </DescriptionList.Item>
            <DescriptionList.Item>
              <DescriptionList.Term>Total</DescriptionList.Term>
              <DescriptionList.Detail>{order?.total}</DescriptionList.Detail>
            </DescriptionList.Item>
            <DescriptionList.Item>
              <DescriptionList.Term>Status</DescriptionList.Term>
              <DescriptionList.Detail>
                <Status tone={order?.status === "Paid" ? "success" : "neutral"}>
                  {order?.status}
                </Status>
              </DescriptionList.Detail>
            </DescriptionList.Item>
          </DescriptionList>
        </Card>
      }
    >
      <PageHeader title="Orders" description="Select an order to see its details." />
      <CollectionList aria-label="Orders">
        {orders.map((entry) => (
          <CollectionRow
            key={entry.id}
            selected={entry.id === selected}
            title={`Order ${entry.id}`}
            description={entry.customer}
            metadata={entry.total}
            actions={
              <Button
                variant="secondary"
                aria-pressed={entry.id === selected}
                aria-label={`Show order ${entry.id}`}
                onClick={() => setSelected(entry.id)}
              >
                Show
              </Button>
            }
          />
        ))}
      </CollectionList>
    </SupportingPane>
  );
}

export const ShoeCart: Story = { render: () => <ShoeCartScreen /> };

export const Inspector: Story = { render: () => <OrderInspector /> };

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
    const name =
      el.getAttribute("aria-label") ?? el.closest("label")?.textContent ?? el.textContent;
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

// Aside sits beside main from 48rem of content width and below it under that; main fills the rest.
function expectPaneCollapse(frame: HTMLElement) {
  const pane = frame.querySelector<HTMLElement>(".kb-supportingpane");
  const main = pane?.querySelector(".kb-supportingpane-main")?.getBoundingClientRect();
  const aside = pane?.querySelector(".kb-supportingpane-aside")?.getBoundingClientRect();
  if (!pane || !main || !aside) throw new Error("Expected pane, main and aside");
  const style = getComputedStyle(pane);
  const content =
    pane.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
  const gap = Number.parseFloat(style.columnGap);
  if (content < 768) {
    expect(aside.top).toBeGreaterThanOrEqual(main.bottom);
    expect(aside.width).toBeCloseTo(main.width, 0);
    expect(main.width).toBeCloseTo(content, 0);
  } else {
    expect(aside.top).toBeCloseTo(main.top, 0);
    expect(aside.left).toBeGreaterThan(main.right);
    expect(aside.width).toBeCloseTo(22 * 16, 0);
    expect(main.width + gap + aside.width).toBeCloseTo(content, 0);
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
          <ShoeCartScreen summaryLabel={`Order summary, ${width}px frame`} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const available = canvasElement.firstElementChild?.getBoundingClientRect().width ?? 0;
    // The widest frame must clear the collapse point or the side-by-side branch never runs.
    expect(available).toBeGreaterThanOrEqual(900);
    for (const width of widths) {
      const frame = within(canvasElement).getByTestId(`frame-${width}`);
      expect(frame.getBoundingClientRect().width).toBeCloseTo(Math.min(width, available), 0);
      expectUsable(frame);
      expectPaneCollapse(frame);
    }
    // 768px leaves under 48rem of content after gutters, so the summary stacks.
    const tablet = within(canvasElement).getByTestId("frame-768");
    const summary = within(tablet).getByRole("complementary", {
      name: "Order summary, 768px frame",
    });
    const items = within(tablet).getByRole("list", { name: "Items in your cart" });
    expect(summary.getBoundingClientRect().top).toBeGreaterThan(
      items.getBoundingClientRect().bottom,
    );
  },
};
