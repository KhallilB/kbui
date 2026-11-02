import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Step = {
  id?: string;
  if?: string;
  uses?: string;
  run?: string;
  with?: { script?: string; ref?: string; "persist-credentials"?: boolean };
  env?: Record<string, string>;
};
type Workflow = {
  on: Record<string, { types?: string[] }>;
  jobs: Record<
    string,
    {
      if?: string;
      concurrency?: { group: string; "cancel-in-progress": boolean };
      permissions?: Record<string, string>;
      environment?: string;
      steps: Step[];
    }
  >;
};
const root = resolve(import.meta.dir, "..");
const readWorkflow = (name: string) =>
  Bun.YAML.parse(readFileSync(`${root}/.github/workflows/${name}.yml`, "utf8")) as Workflow;

test("close cleanup runs trusted base code for merged and unmerged same-repository PRs", () => {
  const workflow = readWorkflow("cleanup-preview");
  expect(workflow.on.pull_request_target?.types).toEqual(["closed"]);
  const job = workflow.jobs.cleanup;
  expect(job?.if).toBe("github.event.pull_request.head.repo.full_name == github.repository");
  expect(job?.environment).toBe("kbui-preview");
  expect(job?.permissions).toEqual({ contents: "read", "pull-requests": "read" });
  const checkout = job?.steps.find((step) => step.uses === "actions/checkout@v4");
  expect(checkout?.with?.ref).toBe(`\${{ github.sha }}`);
  expect(checkout?.with?.["persist-credentials"]).toBe(false);
  expect(JSON.stringify(job?.steps)).not.toMatch(/head.sha|npm ci|bun install/);
  const cleanup = job?.steps.find((step) => step.with?.script?.includes("cleanupPreview"));
  expect(cleanup?.with?.script).toContain("/deployment/site/cleanup-preview.mjs");
  expect(cleanup?.env?.CLOUDFLARE_API_TOKEN).toBe(`\${{ secrets.CLOUDFLARE_API_TOKEN }}`);
});

test("publish and cleanup share a PR lock without interrupting deletion", () => {
  const publish = readWorkflow("ci").jobs.preview;
  const cleanup = readWorkflow("cleanup-preview").jobs.cleanup;
  expect(publish?.concurrency).toEqual({
    group: `kbui-preview-\${{ github.event.number }}`,
    "cancel-in-progress": false,
  });
  expect(cleanup?.concurrency).toEqual(publish?.concurrency);
});

test("late CI only publishes while PR remains open and reconciles closure afterwards", async () => {
  const steps = readWorkflow("ci").jobs.preview?.steps ?? [];
  const guard = steps.find((step) => step.id === "preview-state");
  expect(guard?.with?.script).toBeDefined();
  for (const state of ["open", "closed"]) {
    const outputs: Record<string, unknown> = {};
    const github = { rest: { pulls: { get: async () => ({ data: { state } }) } } };
    await new Function(
      "github",
      "context",
      "core",
      `return (async () => {${guard?.with?.script}})()`,
    )(
      github,
      { repo: { owner: "example", repo: "ui" }, payload: { number: 59 } },
      {
        setOutput: (key: string, value: unknown) => {
          outputs[key] = value;
        },
      },
    );
    expect(outputs.open).toBe(state === "open");
  }
  for (const step of steps.filter(
    (step) => step.run?.includes("npm run") || step.with?.script?.includes("const marker"),
  )) {
    expect(step.if).toBe("steps.preview-state.outputs.open == 'true'");
    expect(steps.indexOf(step)).toBeGreaterThan(steps.indexOf(guard as Step));
  }
  const reconcile = steps.at(-1);
  expect(reconcile?.if).toBe("always() && steps.preview-state.outcome == 'success'");
  expect(reconcile?.with?.script).toContain("cleanupPreview");
});

test("deployment test command includes cleanup behavior tests", () => {
  const manifest = JSON.parse(readFileSync(`${root}/deployment/site/package.json`, "utf8"));
  expect(manifest.scripts.test).toBe("node --test *.test.mjs");
});
