import { beforeAll } from "vitest";

// Lost emulation turns every forced-colors assertion into a vacuous pass.
beforeAll(() => {
  if (!matchMedia("(forced-colors: active)").matches) {
    throw new Error("forced-colors emulation is not active");
  }
});
