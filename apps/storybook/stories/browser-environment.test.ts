import { expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cleanupFirefoxHomes, firefoxEnvironment } from "../browser-environment";

test("macOS Firefox uses distinct app-data homes without changing caller environment", () => {
  const environment = {
    HOME: "/consumer/home",
    CFFIXED_USER_HOME: "/existing/app-home",
    SETTING: "retained",
  };
  const previous = process.env.CFFIXED_USER_HOME;
  const first = firefoxEnvironment("darwin", environment);
  const second = firefoxEnvironment("darwin", environment);
  const homes = [first?.CFFIXED_USER_HOME, second?.CFFIXED_USER_HOME];
  try {
    expect(first?.HOME).toBe("/consumer/home");
    expect(first?.SETTING).toBe("retained");
    expect(first?.CFFIXED_USER_HOME).not.toBe("/existing/app-home");
    expect(homes[0]).not.toBe(homes[1]);
    for (const home of homes) {
      expect(home && existsSync(home)).toBe(true);
      if (home && process.platform !== "win32") expect(statSync(home).mode & 0o777).toBe(0o700);
    }
    expect(environment.CFFIXED_USER_HOME).toBe("/existing/app-home");
    expect(process.env.CFFIXED_USER_HOME).toBe(previous);
  } finally {
    for (const home of homes) if (home) rmSync(home, { recursive: true, force: true });
  }
});

test("Linux and Windows keep the standard Firefox environment", () => {
  expect(firefoxEnvironment("linux", { HOME: "/consumer/home" })).toBeUndefined();
  expect(firefoxEnvironment("win32", {})).toBeUndefined();
});

test.skipIf(process.platform !== "darwin")(
  "cleanup removes generated home ACLs without following external symlinks",
  () => {
    const borrowed = mkdtempSync(join(tmpdir(), "kbui-browser-borrowed-"));
    const home = firefoxEnvironment("darwin")?.CFFIXED_USER_HOME;
    if (!home) throw new Error("Missing generated home");
    try {
      mkdirSync(join(home, "Documents"), { mode: 0o700 });
      execFileSync("/bin/chmod", ["+a", "everyone deny delete", join(home, "Documents")]);
      execFileSync("/bin/chmod", ["+a", "everyone deny delete", borrowed]);
      const readAcl = () =>
        execFileSync("/bin/ls", ["-lde", borrowed], { encoding: "utf8" })
          .split("\n")
          .filter((line) => /^\s*\d+:/.test(line));
      const originalAcl = readAcl();
      expect(originalAcl.some((line) => line.includes("deny delete"))).toBe(true);
      symlinkSync(borrowed, join(home, "external"));
      cleanupFirefoxHomes();
      expect(existsSync(home)).toBe(false);
      expect(existsSync(borrowed)).toBe(true);
      expect(readAcl()).toEqual(originalAcl);
    } finally {
      execFileSync("/bin/chmod", ["-N", borrowed]);
      rmSync(borrowed, { recursive: true, force: true });
      cleanupFirefoxHomes();
    }
  },
);
