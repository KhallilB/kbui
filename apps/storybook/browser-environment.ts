import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const browserHomes: string[] = [];
process.once("exit", cleanupFirefoxHomes);

export function cleanupFirefoxHomes(): void {
  for (const home of browserHomes) {
    if (!existsSync(home)) continue;
    // Clear macOS-created ACLs only in owned scratch homes; never follow symlinks.
    if (process.platform === "darwin") {
      const paths = [
        home,
        ...readdirSync(home, { recursive: true, withFileTypes: true })
          .filter((entry) => !entry.isSymbolicLink())
          .map((entry) => join(entry.parentPath, entry.name)),
      ];
      for (let start = 0; start < paths.length; start += 128) {
        execFileSync("/bin/chmod", ["-h", "-N", ...paths.slice(start, start + 128)]);
      }
    }
    rmSync(home, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
  browserHomes.length = 0;
}

// Firefox 157 shares protected macOS app data: https://github.com/microsoft/playwright/issues/42768.
export function firefoxEnvironment(
  platform: NodeJS.Platform = process.platform,
  environment: NodeJS.ProcessEnv = process.env,
  userId: number | undefined = process.getuid?.(),
): NodeJS.ProcessEnv | undefined {
  const rootContainer = platform === "linux" && userId === 0;
  if (platform !== "darwin" && !rootContainer) return undefined;
  const home = mkdtempSync(join(tmpdir(), "kbui-firefox-home-"));
  browserHomes.push(home);
  // Firefox rejects root launches when CI mounts another user's HOME.
  return rootContainer
    ? { ...environment, HOME: home }
    : { ...environment, CFFIXED_USER_HOME: home };
}
