import { expect, test } from "bun:test";
import { runInNewContext } from "node:vm";
import { initialThemeScript, themeBootstrapPlugin } from "../site/theme-bootstrap";

function boot(search: string, stored: string | null, blocked = false) {
  const root = { dataset: { theme: "light" }, style: { colorScheme: "" } };
  runInNewContext(initialThemeScript(), {
    window: { location: { search } },
    document: { documentElement: root },
    URLSearchParams,
    localStorage: {
      getItem: () => {
        if (blocked) throw new Error("Storage unavailable");
        return stored;
      },
    },
  });
  return root;
}

test("bootstrap applies query before stored preference before any application module", () => {
  expect(boot("?theme=dark", "light")).toEqual({
    dataset: { theme: "dark" },
    style: { colorScheme: "dark" },
  });
  expect(boot("?theme=light", "dark").dataset.theme).toBe("light");
  expect(boot("", "dark").dataset.theme).toBe("dark");
  expect(boot("?theme=unknown", "dark").dataset.theme).toBe("dark");
});

test("bootstrap keeps storage failure usable and accepts only known theme names", () => {
  expect(boot("", "dark", true).dataset.theme).toBe("light");
  expect(boot("?theme=dark", null, true).dataset.theme).toBe("dark");
  expect(boot("", "<invalid>").dataset.theme).toBe("light");
});

test("Vite injects one synchronous script before page assets", () => {
  const plugin = themeBootstrapPlugin();
  expect(plugin.transformIndexHtml).toMatchObject({ order: "pre" });
  const hook = plugin.transformIndexHtml as { handler: () => unknown };
  expect(hook.handler()).toEqual([
    { tag: "script", injectTo: "head-prepend", children: initialThemeScript() },
  ]);
});
