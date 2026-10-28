import { expect, test } from "bun:test";
import { cleanReleaseNotes, sanitizePackageMentions } from "./release-mentions.mjs";

test("npm scopes never become unrelated release contributors", () => {
  expect(sanitizePackageMentions("Replace @kbui with @kb.ui; install @kb.ui/react.")).toBe(
    "Replace `@kbui` with `@kb.ui`; install `@kb.ui/react`.",
  );
});

test("undoes changelog autolinks that mistake npm scopes for people", () => {
  expect(
    sanitizePackageMentions(
      "Replace [@kbui](https://github.com/kbui) with [@kb](https://github.com/kb).ui.",
    ),
  ).toBe("Replace `@kbui` with `@kb.ui`.");
});

test("keeps real contributor mentions, commit links and code intact", () => {
  const body =
    "Thanks @KhallilB and [@kb](https://github.com/kb).\n" +
    "Use `@kb.ui/react` or ``code `@kbui` here``.\n" +
    "```sh\nnpm install @kb.ui/react\n```\n" +
    "[abc1234](https://github.com/KhallilB/kbui/commit/abc1234)\n" +
    "Contact email@kbui.example; @kbui-tools is unrelated.";
  expect(sanitizePackageMentions(body)).toBe(body);
});

test("sanitizing release notes twice leaves the same body", () => {
  const once = sanitizePackageMentions("Use @kbui/css or [@kb](https://github.com/kb).ui/css.");
  expect(sanitizePackageMentions(once)).toBe(once);
});

test("updates only the requested release body, keeping real contributor credit", async () => {
  const calls = [];
  const github = {
    rest: {
      repos: {
        getReleaseByTag: async (args) => {
          calls.push(args);
          return { data: { id: 42, body: "Use @kb.ui/react. Thanks @KhallilB." } };
        },
        updateRelease: async (args) => {
          calls.push(args);
        },
      },
    },
  };
  await cleanReleaseNotes(github, { owner: "KhallilB", repo: "kbui" }, "v0.10.0");
  expect(calls).toEqual([
    { owner: "KhallilB", repo: "kbui", tag: "v0.10.0" },
    {
      owner: "KhallilB",
      repo: "kbui",
      release_id: 42,
      body: "Use `@kb.ui/react`. Thanks @KhallilB.",
    },
  ]);
});

test("leaves clean or empty release bodies untouched", async () => {
  for (const body of ["Use `@kb.ui/react`. Thanks @KhallilB.", "", null]) {
    const github = {
      rest: {
        repos: {
          getReleaseByTag: async () => ({ data: { id: 42, body } }),
          updateRelease: async () => {
            throw new Error("Unexpected release edit");
          },
        },
      },
    };
    await cleanReleaseNotes(github, { owner: "KhallilB", repo: "kbui" }, "v0.10.0");
  }
});
