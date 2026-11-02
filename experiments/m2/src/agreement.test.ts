import { expect, test } from "bun:test";
import { kappa, tally } from "./agreement";
import type { Answers } from "./labels";

test("tally pairs yes and no answers and sets unsure or missing apart", () => {
  const a: Answers = {
    "01": { "INT-1": "yes" },
    "02": { "INT-1": "no" },
    "03": { "INT-1": "unsure" },
  };
  const b: Answers = {
    "01": { "INT-1": "yes" },
    "02": { "INT-1": "yes" },
    "03": { "INT-1": "no" },
  };
  expect(tally(a, b, "INT-1", ["01", "02", "03", "04"])).toEqual({
    yy: 1,
    yn: 0,
    ny: 1,
    nn: 0,
    unpaired: 2,
  });
});

test("kappa corrects agreement for chance", () => {
  expect(kappa({ yy: 20, yn: 5, ny: 10, nn: 15, unpaired: 0 })).toBeCloseTo(0.4);
  expect(kappa({ yy: 3, yn: 0, ny: 0, nn: 7, unpaired: 0 })).toBe(1);
});

test("kappa is undefined when both labellers give one answer throughout", () => {
  expect(kappa({ yy: 0, yn: 0, ny: 0, nn: 12, unpaired: 0 })).toBeNull();
});
