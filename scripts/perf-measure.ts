import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { highlightCode } from "../apps/storybook/catalog/highlight";
import { loadCatalogSources } from "../apps/storybook/catalog/source";
import {
  createPreviewCache,
  markPreviewReady,
  requestPreview,
} from "../apps/storybook/site/catalog-preview-cache";
import { buildTokens, type TokenTree } from "../packages/tokens/src/build";

export type SizeMetric = {
  rawBytes: number;
  gzipBytes: number;
};

export type PerfBaselineReport = {
  environment: {
    bunVersion: string;
    nodeVersion: string;
    platform: string;
    arch: string;
    gitRevision: string;
    timestamp: string;
  };
  tokensAndCss: {
    tokenDefinitionsCount: number;
    tokenCss: SizeMetric & { coldBuildMs: number; warmBuildMs: number };
    completeComponentCss: SizeMetric;
    selectiveButtonCss: SizeMetric;
  };
  catalog: {
    entriesCount: number;
    storiesCount: number;
    fullPayload: SizeMetric & { coldLoadMs: number; warmSerializeMs: number; parseMs: number };
    directoryMetadataPayload: SizeMetric & { reductionRatio: number };
  };
  consumer: {
    externalizedPeers: string[];
    externalizedRuntimeDeps: string[];
    appExternalized: SizeMetric;
    appBundledWithDeps: SizeMetric;
    buttonBarrelExternalized: SizeMetric;
    buttonDirectExternalized: SizeMetric;
  };
  editingAndRetention: {
    highlightDistinctEdits: {
      iterations: number;
      coldFirstMs: number;
      warmMedianMs: number;
      p95Ms: number;
      retainedHeapDeltaBytes: number;
    };
    previewRetention: {
      visitedCount: number;
      configuredLimit: number;
      maxRetainedEntries: number;
      abaPreservedEntry: boolean;
    };
  };
  budgets: {
    tokenCssGzipMaxBytes: number;
    completeCssGzipMaxBytes: number;
    directoryMetadataGzipMaxBytes: number;
    warmHighlightMedianMaxMs: number;
    maxPreviewCacheEntries: number;
  };
};

function sizeOf(content: string | Uint8Array): SizeMetric {
  const bytes = typeof content === "string" ? Buffer.from(content, "utf8") : Buffer.from(content);
  return {
    rawBytes: bytes.byteLength,
    gzipBytes: gzipSync(bytes).byteLength,
  };
}

function countTokens(tree: TokenTree): number {
  let count = 0;
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    if ("$value" in node) count += 1;
    else count += countTokens(node as TokenTree);
  }
  return count;
}

function percentile(sortedValues: number[], ratio: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = Math.min(sortedValues.length - 1, Math.floor(sortedValues.length * ratio));
  return Number((sortedValues[idx] ?? 0).toFixed(3));
}

export function resolveTempOutputPath(outPath?: string, repoRoot = process.cwd()): string {
  const normalizedRoot = resolve(repoRoot);
  const candidate = outPath
    ? isAbsolute(outPath)
      ? resolve(outPath)
      : resolve(process.cwd(), outPath)
    : join(tmpdir(), "kbui-perf-baseline.json");
  const rel = relative(normalizedRoot, candidate);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) {
    throw new Error(`Output path must be outside tracked repository root: ${candidate}`);
  }
  return candidate;
}

async function bundleEntry(code: string, root: string, external: string[]): Promise<SizeMetric> {
  const probeDir = await mkdtemp(join(tmpdir(), "kbui-perf-probe-"));
  const entryPath = join(probeDir, "entry.tsx");
  try {
    await writeFile(entryPath, code, "utf8");
    const script = [
      "const [entryPath, rawExternal] = process.argv.slice(1);",
      "const external = JSON.parse(rawExternal);",
      "const result = await Bun.build({ entrypoints: [entryPath], target: 'browser', format: 'esm', minify: true, external });",
      "if (!result.success || !result.outputs[0]) {",
      "  console.error(result.logs.map((l) => l.message).join('; '));",
      "  process.exit(1);",
      "}",
      "process.stdout.write(await result.outputs[0].text());",
    ].join("\n");
    const proc = Bun.spawnSync(
      [process.execPath, "-e", script, entryPath, JSON.stringify(external)],
      {
        cwd: join(root, "packages/react"),
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    if (proc.exitCode !== 0) {
      throw new Error(`Bundle probe failed: ${proc.stderr.toString("utf8").trim()}`);
    }
    return sizeOf(proc.stdout);
  } finally {
    await rm(probeDir, { recursive: true, force: true });
  }
}

export async function measurePerformanceBaseline(options?: {
  root?: string;
  outPath?: string;
  editIterations?: number;
}): Promise<PerfBaselineReport> {
  const root = resolve(options?.root ?? join(import.meta.dir, ".."));
  const outPath = resolveTempOutputPath(options?.outPath, root);
  const editIterations = options?.editIterations ?? 40;

  const gitRevision = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();

  const rawTokens = JSON.parse(
    await readFile(join(root, "packages/tokens/tokens.json"), "utf8"),
  ) as TokenTree;
  const tokenDefinitionsCount = countTokens(rawTokens);

  const t0TokenCold = performance.now();
  buildTokens(rawTokens);
  const coldTokenBuildMs = Number((performance.now() - t0TokenCold).toFixed(3));

  const t0TokenWarm = performance.now();
  const builtTokens = buildTokens(rawTokens);
  const warmTokenBuildMs = Number((performance.now() - t0TokenWarm).toFixed(3));

  const distTokensCss = await readFile(join(root, "packages/tokens/dist/tokens.css"), "utf8").catch(
    () => builtTokens.css,
  );
  const completeCss = await readFile(join(root, "packages/css/dist/styles.css"), "utf8");
  const resetCss = await readFile(join(root, "packages/css/dist/reset.css"), "utf8");
  const buttonCss = await readFile(join(root, "packages/css/dist/components/button.css"), "utf8");

  const tokenCssMetric = sizeOf(distTokensCss);
  const completeComponentCss = sizeOf(completeCss);
  const selectiveButtonCss = sizeOf(`${distTokensCss}\n${resetCss}\n${buttonCss}`);

  const t0CatalogCold = performance.now();
  const catalogEntries = loadCatalogSources();
  const coldCatalogLoadMs = Number((performance.now() - t0CatalogCold).toFixed(3));

  const t0Serialize = performance.now();
  const serializedCatalog = JSON.stringify(catalogEntries);
  const warmSerializeMs = Number((performance.now() - t0Serialize).toFixed(3));

  const t0Parse = performance.now();
  JSON.parse(serializedCatalog);
  const parseMs = Number((performance.now() - t0Parse).toFixed(3));

  const storiesCount = catalogEntries.reduce((sum, entry) => sum + entry.stories.length, 0);
  const fullPayload = sizeOf(serializedCatalog);

  const directoryMetadata = catalogEntries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    group: entry.group,
    description: entry.description,
    defaultStoryId: entry.defaultStoryId,
    docsId: entry.docsId,
    examples: entry.examples,
  }));
  const directoryMetadataMetric = sizeOf(JSON.stringify(directoryMetadata));

  const externalizedPeers = ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"];
  const externalizedRuntimeDeps = ["@base-ui/react", "@base-ui/react/*", "clsx"];
  const allExternal = [...externalizedPeers, ...externalizedRuntimeDeps];

  const reactSrcIndex = join(root, "packages/react/src/index.ts");
  const buttonDirectPath = join(root, "packages/react/src/components/Button/Button.tsx");

  const consumerSource = [
    `import { Button, Card, Dialog, Grid, Input, Status } from ${JSON.stringify(reactSrcIndex)};`,
    "export function ConsumerProbe() {",
    '  return <Card title="Probe"><Grid><Input label="Name" /><Status tone="success">Ready</Status><Dialog title="Confirm" trigger={<Button>Open</Button>}>Body</Dialog></Grid></Card>;',
    "}",
  ].join("\n");

  const buttonBarrelSource = `import { Button } from ${JSON.stringify(reactSrcIndex)};\nexport const view = () => <Button variant="primary">Save</Button>;\n`;
  const buttonDirectSource = `import { Button } from ${JSON.stringify(buttonDirectPath)};\nexport const view = () => <Button variant="primary">Save</Button>;\n`;

  const appExternalized = await bundleEntry(consumerSource, root, allExternal);
  const appBundledWithDeps = await bundleEntry(consumerSource, root, externalizedPeers);
  const buttonBarrelExternalized = await bundleEntry(buttonBarrelSource, root, allExternal);
  const buttonDirectExternalized = await bundleEntry(buttonDirectSource, root, allExternal);

  const heapBefore = process.memoryUsage().heapUsed;
  const editDurations: number[] = [];
  for (let i = 0; i < editIterations; i++) {
    const draft = `import { Button } from "@kb.ui/react";\nexport function Example${i}() {\n  return <Button variant="primary">Action ${i} — ${Date.now()}</Button>;\n}\n`;
    const t0Edit = performance.now();
    highlightCode(draft, "tsx");
    editDurations.push(performance.now() - t0Edit);
  }
  const heapAfter = process.memoryUsage().heapUsed;
  const coldFirstMs = Number((editDurations[0] ?? 0).toFixed(3));
  const sortedWarm = editDurations.slice(1).sort((a, b) => a - b);
  const warmMedianMs = percentile(sortedWarm.length ? sortedWarm : editDurations, 0.5);
  const p95Ms = percentile(sortedWarm.length ? sortedWarm : editDurations, 0.95);

  const reqFor = (idx: number) => ({
    src: `/storybook/iframe.html?id=components-button--state-${idx}&globals=previewTheme:light`,
    title: `Button ${idx}`,
    layout: { width: 640, minimum: 180 },
    generation: 0,
  });
  let cache = createPreviewCache(reqFor(0));
  cache = markPreviewReady(cache, cache.requested);
  let maxRetainedEntries = cache.entries.length;
  for (let i = 1; i < 20; i++) {
    cache = requestPreview(cache, reqFor(i), 6);
    cache = markPreviewReady(cache, cache.requested);
    if (cache.entries.length > maxRetainedEntries) {
      maxRetainedEntries = cache.entries.length;
    }
  }
  const beforeAbaClock = cache.clock;
  const reqA = reqFor(18);
  const reqB = reqFor(19);
  cache = requestPreview(cache, reqA, 6);
  const entryAId = cache.requested;
  cache = requestPreview(cache, reqB, 6);
  cache = requestPreview(cache, reqA, 6);
  const abaPreservedEntry =
    cache.requested === entryAId &&
    cache.entries.some((entry) => entry.id === entryAId && entry.used > beforeAbaClock);

  const report: PerfBaselineReport = {
    environment: {
      bunVersion: Bun.version,
      nodeVersion: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      gitRevision,
      timestamp: new Date().toISOString(),
    },
    tokensAndCss: {
      tokenDefinitionsCount,
      tokenCss: {
        ...tokenCssMetric,
        coldBuildMs: coldTokenBuildMs,
        warmBuildMs: warmTokenBuildMs,
      },
      completeComponentCss,
      selectiveButtonCss,
    },
    catalog: {
      entriesCount: catalogEntries.length,
      storiesCount,
      fullPayload: {
        ...fullPayload,
        coldLoadMs: coldCatalogLoadMs,
        warmSerializeMs,
        parseMs,
      },
      directoryMetadataPayload: {
        ...directoryMetadataMetric,
        reductionRatio: Number(
          (fullPayload.gzipBytes / directoryMetadataMetric.gzipBytes).toFixed(2),
        ),
      },
    },
    consumer: {
      externalizedPeers,
      externalizedRuntimeDeps,
      appExternalized,
      appBundledWithDeps,
      buttonBarrelExternalized,
      buttonDirectExternalized,
    },
    editingAndRetention: {
      highlightDistinctEdits: {
        iterations: editIterations,
        coldFirstMs,
        warmMedianMs,
        p95Ms,
        retainedHeapDeltaBytes: Math.max(0, heapAfter - heapBefore),
      },
      previewRetention: {
        visitedCount: 20,
        configuredLimit: 6,
        maxRetainedEntries,
        abaPreservedEntry,
      },
    },
    budgets: {
      tokenCssGzipMaxBytes: Math.ceil(tokenCssMetric.gzipBytes * 1.15),
      completeCssGzipMaxBytes: Math.ceil(completeComponentCss.gzipBytes * 1.15),
      directoryMetadataGzipMaxBytes: Math.ceil(directoryMetadataMetric.gzipBytes * 1.2),
      warmHighlightMedianMaxMs: Math.max(5, Math.ceil(warmMedianMs * 2)),
      maxPreviewCacheEntries: 6,
    },
  };

  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

if (import.meta.main) {
  const outArgIndex = process.argv.indexOf("--out");
  const outPath = outArgIndex >= 0 ? process.argv[outArgIndex + 1] : undefined;
  const resolvedOut = resolveTempOutputPath(outPath);
  const report = await measurePerformanceBaseline({ outPath: resolvedOut });
  console.log(`Wrote baseline report to ${resolvedOut}`);
  console.log(
    JSON.stringify(
      {
        gitRevision: report.environment.gitRevision,
        tokenDefinitionsCount: report.tokensAndCss.tokenDefinitionsCount,
        tokenCssGzipBytes: report.tokensAndCss.tokenCss.gzipBytes,
        completeCssGzipBytes: report.tokensAndCss.completeComponentCss.gzipBytes,
        selectiveButtonCssGzipBytes: report.tokensAndCss.selectiveButtonCss.gzipBytes,
        catalogEntries: report.catalog.entriesCount,
        catalogStories: report.catalog.storiesCount,
        fullCatalogGzipBytes: report.catalog.fullPayload.gzipBytes,
        directoryMetadataGzipBytes: report.catalog.directoryMetadataPayload.gzipBytes,
        consumerExternalizedGzipBytes: report.consumer.appExternalized.gzipBytes,
        consumerWithDepsGzipBytes: report.consumer.appBundledWithDeps.gzipBytes,
        warmHighlightMedianMs: report.editingAndRetention.highlightDistinctEdits.warmMedianMs,
        maxPreviewCacheEntries: report.editingAndRetention.previewRetention.maxRetainedEntries,
      },
      null,
      2,
    ),
  );
}
